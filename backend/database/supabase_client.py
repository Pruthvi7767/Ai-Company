import os
import json
import sqlite3
import asyncio
from typing import Any, Optional
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

class SupabaseClient:
    """Local SQLite fallback when Supabase is not configured."""

    def __init__(self):
        self.db_path = DATA_DIR / "markly.db"
        self._conn: Optional[sqlite3.Connection] = None
        self._init_tables()

    def _get_conn(self) -> sqlite3.Connection:
        if self._conn is None:
            self._conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
            self._conn.row_factory = sqlite3.Row
            self._conn.execute("PRAGMA journal_mode=WAL")
            self._conn.execute("PRAGMA foreign_keys=ON")
        return self._conn

    def _init_tables(self):
        conn = self._get_conn()
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY, name TEXT, role TEXT, department TEXT,
                status TEXT DEFAULT 'idle', avatar TEXT, parent_id TEXT,
                tasks_today INTEGER DEFAULT 0, success_rate REAL DEFAULT 0,
                roi REAL DEFAULT 0, current_task TEXT, hire_date TEXT,
                version TEXT, last_heartbeat TEXT, tier TEXT DEFAULT 'manager',
                tokens_used_today INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS spawned_agents (
                id TEXT PRIMARY KEY, department TEXT, task_description TEXT,
                spawned_by TEXT, status TEXT DEFAULT 'running',
                tokens_used INTEGER DEFAULT 0, cost_inr REAL DEFAULT 0,
                spawned_at TEXT DEFAULT (datetime('now')),
                terminated_at TEXT, duration_seconds INTEGER
            );
            CREATE TABLE IF NOT EXISTS hire_fire_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT, agent_id TEXT,
                department TEXT, action TEXT, triggered_by TEXT, task TEXT,
                tokens_used INTEGER, cost_inr REAL, duration_seconds INTEGER,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS connectors (
                id TEXT PRIMARY KEY, name TEXT, category TEXT,
                status TEXT DEFAULT 'available', connected_since TEXT,
                last_used TEXT, agent_using TEXT, description TEXT,
                potential_earnings TEXT, created_at TEXT DEFAULT (datetime('now')),
                config TEXT, email_address TEXT, email_provider TEXT,
                imap_server TEXT, imap_port INTEGER, smtp_server TEXT,
                smtp_port INTEGER, auth_method TEXT, last_sync TEXT,
                emails_synced INTEGER DEFAULT 0, sync_status TEXT DEFAULT 'idle'
            );
            CREATE TABLE IF NOT EXISTS income_streams (
                id TEXT PRIMARY KEY, name TEXT, status TEXT DEFAULT 'dormant',
                earnings_this_month REAL DEFAULT 0, platform_count INTEGER DEFAULT 0,
                agent_count INTEGER DEFAULT 0, color TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS earnings (
                id INTEGER PRIMARY KEY AUTOINCREMENT, stream_id TEXT,
                platform_id TEXT, amount_inr REAL, amount_usd REAL,
                date TEXT DEFAULT (date('now')),
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS activity_feed (
                id TEXT PRIMARY KEY, agent_id TEXT, agent TEXT, action TEXT, platform TEXT,
                result TEXT DEFAULT 'success', details TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS approvals (
                id TEXT PRIMARY KEY, type TEXT, title TEXT, agent TEXT,
                waiting_time TEXT, priority TEXT DEFAULT 'normal',
                status TEXT DEFAULT 'pending', context TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS board_meetings (
                id TEXT PRIMARY KEY, type TEXT, date TEXT, time TEXT,
                duration TEXT, decisions INTEGER DEFAULT 0,
                actions INTEGER DEFAULT 0, agenda TEXT, transcript TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS knowledge (
                id TEXT PRIMARY KEY, title TEXT, section TEXT DEFAULT 'wiki',
                content TEXT, last_updated TEXT, agents_using INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS capabilities (
                id TEXT PRIMARY KEY, name TEXT, status TEXT DEFAULT 'dormant',
                required_api TEXT, platforms INTEGER DEFAULT 0,
                agents INTEGER DEFAULT 0, activated_date TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS content (
                id TEXT PRIMARY KEY, title TEXT, type TEXT, platform TEXT,
                agent TEXT, status TEXT DEFAULT 'draft', qc_score INTEGER DEFAULT 0,
                published_date TEXT, earnings REAL DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS error_logs (
                id TEXT PRIMARY KEY, severity TEXT, agent TEXT, platform TEXT,
                type TEXT, description TEXT, status TEXT DEFAULT 'needs-attention',
                stack_trace TEXT, created_at TEXT DEFAULT (datetime('now')),
                resolved_at TEXT
            );
            CREATE TABLE IF NOT EXISTS audit_log (
                id TEXT PRIMARY KEY, agent_id TEXT, task_id TEXT, action TEXT,
                result TEXT, tokens_used INTEGER DEFAULT 0, cost_inr REAL DEFAULT 0,
                duration TEXT, created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY, type TEXT, title TEXT, description TEXT,
                read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY, value TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS business_opportunities (
                id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, type TEXT,
                score REAL, score_pct INTEGER, status TEXT DEFAULT 'pending',
                description TEXT, market_size TEXT, competition TEXT,
                plan TEXT, created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS comms_threads (
                id TEXT PRIMARY KEY, agent_id TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS comms_messages (
                id TEXT PRIMARY KEY, thread_id TEXT, sender TEXT,
                text TEXT, timestamp TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS platform_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT, platform_id TEXT,
                platform_name TEXT, status TEXT DEFAULT 'active',
                last_heartbeat TEXT DEFAULT (datetime('now')),
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS llm_usage_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT, agent_id TEXT,
                model TEXT, provider TEXT, tier TEXT,
                tokens_used INTEGER DEFAULT 0, cost_inr REAL DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """)
        conn.commit()

    async def insert(self, table: str, data: dict) -> dict:
        conn = self._get_conn()
        cols = ", ".join(data.keys())
        placeholders = ", ".join(["?"] * len(data))
        values = [json.dumps(v) if isinstance(v, (dict, list)) else v for v in data.values()]
        conn.execute(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})", values)
        conn.commit()
        return data

    async def select(self, table: str, filters: dict = None, limit: int = 100) -> list:
        conn = self._get_conn()
        query = f"SELECT * FROM {table}"
        params = []
        if filters:
            conditions = []
            for k, v in filters.items():
                conditions.append(f"{k} = ?")
                params.append(v)
            query += " WHERE " + " AND ".join(conditions)
        # Only order by created_at if the table has it
        tables_without_created_at = {"settings", "platform_sessions", "spawned_agents", "hire_fire_log"}
        if table not in tables_without_created_at:
            query += f" ORDER BY created_at DESC"
        query += f" LIMIT {limit}"
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]

    async def update(self, table: str, filters: dict, data: dict) -> dict:
        conn = self._get_conn()
        set_clause = ", ".join([f"{k} = ?" for k in data.keys()])
        values = list(data.values())
        where_clause = " AND ".join([f"{k} = ?" for k in filters.keys()])
        values.extend(filters.values())
        conn.execute(f"UPDATE {table} SET {set_clause} WHERE {where_clause}", values)
        conn.commit()
        return data

    async def delete(self, table: str, filters: dict) -> bool:
        conn = self._get_conn()
        where_clause = " AND ".join([f"{k} = ?" for k in filters.keys()])
        conn.execute(f"DELETE FROM {table} WHERE {where_clause}", list(filters.values()))
        conn.commit()
        return True

    async def get_by_id(self, table: str, id: str) -> Optional[dict]:
        conn = self._get_conn()
        row = conn.execute(f"SELECT * FROM {table} WHERE id = ?", (id,)).fetchone()
        return dict(row) if row else None

    async def execute(self, sql: str, params: list = None) -> list:
        """Execute raw SQL query."""
        conn = self._get_conn()
        try:
            if params:
                rows = conn.execute(sql, params).fetchall()
            else:
                rows = conn.execute(sql).fetchall()
            conn.commit()
            return [dict(r) for r in rows]
        except Exception as e:
            conn.commit()
            return []
