import os
import sqlite3
import json
import datetime
from pathlib import Path
from typing import Optional
from cryptography.fernet import Fernet
from backend.config import settings

DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

class VaultClient:
    """Encrypted secrets vault backed by SQLite."""

    _fernet = None
    _db_path = DATA_DIR / "vault.db"

    @classmethod
    def _get_fernet(cls):
        if cls._fernet is None:
            key = settings.VAULT_ENCRYPTION_KEY.encode().ljust(32)[:32]
            from cryptography.hazmat.primitives import hashes
            from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
            import base64
            kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=b"markly", iterations=100000)
            derived = kdf.derive(key)
            cls._fernet = Fernet(base64.urlsafe_b64encode(derived))
        return cls._fernet

    @classmethod
    def _get_conn(cls) -> sqlite3.Connection:
        conn = sqlite3.connect(str(cls._db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS secrets (
                key TEXT PRIMARY KEY,
                encrypted_value TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        conn.commit()
        return conn

    @staticmethod
    async def store(key: str, value: str) -> bool:
        """Encrypt and store a secret in the vault."""
        fernet = VaultClient._get_fernet()
        encrypted = fernet.encrypt(value.encode()).decode()
        conn = VaultClient._get_conn()
        conn.execute(
            "INSERT OR REPLACE INTO secrets (key, encrypted_value, updated_at) VALUES (?, ?, ?)",
            (key, encrypted, datetime.datetime.now().isoformat())
        )
        conn.commit()
        return True

    @staticmethod
    async def get(key: str) -> str:
        """Retrieve and decrypt a secret from the vault."""
        conn = VaultClient._get_conn()
        row = conn.execute("SELECT encrypted_value FROM secrets WHERE key = ?", (key,)).fetchone()
        if row and row["encrypted_value"]:
            fernet = VaultClient._get_fernet()
            return fernet.decrypt(row["encrypted_value"].encode()).decode()
        return os.getenv(key, "")

    @staticmethod
    async def delete(key: str) -> bool:
        """Remove a secret from the vault."""
        conn = VaultClient._get_conn()
        conn.execute("DELETE FROM secrets WHERE key = ?", (key,))
        conn.commit()
        return True

    @staticmethod
    async def list_all() -> list:
        """List all stored secret keys (not values)."""
        conn = VaultClient._get_conn()
        rows = conn.execute("SELECT key, created_at, updated_at FROM secrets ORDER BY key").fetchall()
        return [dict(r) for r in rows]
