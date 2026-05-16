import sqlite3
import json
import datetime
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

class Mem0Client:
    """SQLite-backed memory store for agent long-term memory."""

    def __init__(self, namespace: str = ""):
        self.namespace = namespace
        self.db_path = DATA_DIR / f"mem0_{namespace}.db"
        self._conn: Optional[sqlite3.Connection] = None
        self._init()

    def _get_conn(self) -> sqlite3.Connection:
        if self._conn is None:
            self._conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
            self._conn.row_factory = sqlite3.Row
            self._conn.execute("PRAGMA journal_mode=WAL")
        return self._conn

    def _init(self):
        conn = self._get_conn()
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_id TEXT,
                content TEXT,
                metadata TEXT,
                embedding TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(agent_id);
            CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at DESC);
        """)
        conn.commit()

    async def search(self, query: str, limit: int = 5) -> list:
        """Search memories by content using LIKE (FTS would be better for production)."""
        conn = self._get_conn()
        rows = conn.execute(
            "SELECT * FROM memories WHERE content LIKE ? ORDER BY created_at DESC LIMIT ?",
            (f"%{query}%", limit)
        ).fetchall()
        results = []
        for row in rows:
            r = dict(row)
            r["metadata"] = json.loads(r["metadata"]) if r["metadata"] else {}
            results.append(r)
        return results

    async def add(self, memory: str, metadata: dict = None):
        """Store a new memory entry."""
        conn = self._get_conn()
        conn.execute(
            "INSERT INTO memories (agent_id, content, metadata) VALUES (?, ?, ?)",
            (self.namespace, memory, json.dumps(metadata or {}))
        )
        conn.commit()
        return {"stored": True, "agent_id": self.namespace}

    async def flush(self):
        """Clear all memories for this namespace."""
        conn = self._get_conn()
        conn.execute("DELETE FROM memories WHERE agent_id = ?", (self.namespace,))
        conn.commit()
        return {"flushed": True, "agent_id": self.namespace}

    async def get_all(self, limit: int = 100) -> list:
        """Get all memories for this namespace."""
        conn = self._get_conn()
        rows = conn.execute(
            "SELECT * FROM memories WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?",
            (self.namespace, limit)
        ).fetchall()
        results = []
        for row in rows:
            r = dict(row)
            r["metadata"] = json.loads(r["metadata"]) if r["metadata"] else {}
            results.append(r)
        return results
