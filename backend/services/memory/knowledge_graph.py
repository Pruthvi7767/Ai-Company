import sqlite3
import json
import datetime
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

class KnowledgeGraph:
    """SQLite-backed knowledge graph for agent relationship mapping."""

    def __init__(self):
        self.db_path = DATA_DIR / "knowledge_graph.db"
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
            CREATE TABLE IF NOT EXISTS entities (
                id TEXT PRIMARY KEY,
                type TEXT,
                properties TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS relationships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_id TEXT,
                to_id TEXT,
                relation TEXT,
                weight REAL DEFAULT 1.0,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (from_id) REFERENCES entities(id),
                FOREIGN KEY (to_id) REFERENCES entities(id)
            );
            CREATE INDEX IF NOT EXISTS idx_rel_from ON relationships(from_id);
            CREATE INDEX IF NOT EXISTS idx_rel_to ON relationships(to_id);
            CREATE INDEX IF NOT EXISTS idx_rel_relation ON relationships(relation);
        """)
        conn.commit()

    async def add_entity(self, entity_id: str, entity_type: str, properties: dict = None):
        """Add a node to the knowledge graph."""
        conn = self._get_conn()
        conn.execute(
            "INSERT OR REPLACE INTO entities (id, type, properties) VALUES (?, ?, ?)",
            (entity_id, entity_type, json.dumps(properties or {}))
        )
        conn.commit()
        return {"entity_id": entity_id, "type": entity_type}

    async def add_relationship(self, from_id: str, to_id: str, relation: str, weight: float = 1.0):
        """Add an edge between two entities."""
        conn = self._get_conn()
        conn.execute(
            "INSERT INTO relationships (from_id, to_id, relation, weight) VALUES (?, ?, ?, ?)",
            (from_id, to_id, relation, weight)
        )
        conn.commit()
        return {"from": from_id, "to": to_id, "relation": relation, "weight": weight}

    async def query(self, entity: str) -> list:
        """Find all relationships connected to an entity."""
        conn = self._get_conn()
        rows = conn.execute(
            """SELECT r.*, e1.type as from_type, e2.type as to_type
               FROM relationships r
               LEFT JOIN entities e1 ON r.from_id = e1.id
               LEFT JOIN entities e2 ON r.to_id = e2.id
               WHERE r.from_id = ? OR r.to_id = ?
               ORDER BY r.weight DESC""",
            (entity, entity)
        ).fetchall()
        results = []
        for row in rows:
            r = dict(row)
            results.append(r)
        return results

    async def get_entity(self, entity_id: str) -> dict:
        """Get a single entity by ID."""
        conn = self._get_conn()
        row = conn.execute("SELECT * FROM entities WHERE id = ?", (entity_id,)).fetchone()
        if row:
            r = dict(row)
            r["properties"] = json.loads(r["properties"]) if r["properties"] else {}
            return r
        return {}

    async def get_all_entities(self, entity_type: str = None) -> list:
        """List all entities, optionally filtered by type."""
        conn = self._get_conn()
        if entity_type:
            rows = conn.execute("SELECT * FROM entities WHERE type = ? ORDER BY created_at DESC", (entity_type,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM entities ORDER BY created_at DESC").fetchall()
        results = []
        for row in rows:
            r = dict(row)
            r["properties"] = json.loads(r["properties"]) if r["properties"] else {}
            results.append(r)
        return results
