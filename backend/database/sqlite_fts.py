import os
import sqlite3
import json
from typing import Optional
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

class FTS5Client:
    """SQLite FTS5 for skills search and learning loop."""

    def __init__(self, namespace: str = "global"):
        self.namespace = namespace
        self.db_path = DATA_DIR / f"markly_{namespace}.db"
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
            CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(
                department, task_type, description, approach, outcome,
                content='skills', content_rowid='id'
            );
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                department TEXT,
                task_type TEXT,
                description TEXT,
                approach TEXT,
                outcome TEXT,
                success INTEGER DEFAULT 1,
                tokens_used INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TRIGGER IF NOT EXISTS skills_ai AFTER INSERT ON skills BEGIN
                INSERT INTO skills_fts(rowid, department, task_type, description, approach, outcome)
                VALUES (new.id, new.department, new.task_type, new.description, new.approach, new.outcome);
            END;
            CREATE TRIGGER IF NOT EXISTS skills_ad AFTER DELETE ON skills BEGIN
                INSERT INTO skills_fts(skills_fts, rowid, department, task_type, description, approach, outcome)
                VALUES ('delete', old.id, old.department, old.task_type, old.description, old.approach, old.outcome);
            END;
        """)
        conn.commit()

    async def insert_skill(self, skill: dict) -> int:
        conn = self._get_conn()
        cur = conn.execute(
            "INSERT INTO skills (department, task_type, description, approach, outcome, success, tokens_used) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (skill.get("department"), skill.get("task_type"), skill.get("description"),
             skill.get("approach"), skill.get("outcome"), skill.get("success", 1),
             skill.get("tokens_used", 0))
        )
        conn.commit()
        return cur.lastrowid

    async def search(self, query: str, limit: int = 5, department: str = None) -> list:
        conn = self._get_conn()
        # Sanitize FTS5 query: use AND logic for multiple words
        safe_query = query.replace('"', '""')
        # Split into words and join with AND for better matching
        words = safe_query.split()
        if len(words) > 1:
            fts_query = " AND ".join([f'"{w}"' for w in words])
        else:
            fts_query = f'"{safe_query}"'
        if department:
            rows = conn.execute(
                "SELECT s.*, rank FROM skills_fts f JOIN skills s ON s.id = f.rowid WHERE skills_fts MATCH ? AND s.department = ? ORDER BY rank LIMIT ?",
                (fts_query, department, limit)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT s.*, rank FROM skills_fts f JOIN skills s ON s.id = f.rowid WHERE skills_fts MATCH ? ORDER BY rank LIMIT ?",
                (fts_query, limit)
            ).fetchall()
        return [dict(r) for r in rows]

    async def update_skill(self, skill_id: int, data: dict):
        conn = self._get_conn()
        set_clause = ", ".join([f"{k} = ?" for k in data.keys()])
        conn.execute(f"UPDATE skills SET {set_clause} WHERE id = ?", list(data.values()) + [skill_id])
        conn.commit()

    async def delete_skill(self, skill_id: int):
        conn = self._get_conn()
        conn.execute("DELETE FROM skills WHERE id = ?", (skill_id,))
        conn.commit()

    async def get_all(self, department: str = None, limit: int = 100) -> list:
        conn = self._get_conn()
        if department:
            rows = conn.execute("SELECT * FROM skills WHERE department = ? ORDER BY created_at DESC LIMIT ?", (department, limit)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM skills ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
        return [dict(r) for r in rows]
