from backend.database import RedisClient
from backend.config import settings
import json
import datetime
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

class CookieVault:
    """Encrypted cookie storage in Redis for platform sessions."""

    _fernet = None

    @classmethod
    def _get_fernet(cls):
        if cls._fernet is None:
            key = settings.VAULT_ENCRYPTION_KEY.encode().ljust(32)[:32]
            kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=b"markly_cookies", iterations=100000)
            derived = kdf.derive(key)
            cls._fernet = Fernet(base64.urlsafe_b64encode(derived))
        return cls._fernet

    @staticmethod
    async def store(platform_id: str, cookies: dict):
        """Encrypt and store cookies for a platform session."""
        redis = RedisClient()
        cookie_json = json.dumps(cookies)
        fernet = CookieVault._get_fernet()
        encrypted = fernet.encrypt(cookie_json.encode()).decode()
        await redis.set(f"cookies:{platform_id}", encrypted, ex=86400 * 30)  # 30 day TTL
        await redis.set(f"cookies:{platform_id}:stored_at", datetime.datetime.now().isoformat())
        return {"platform_id": platform_id, "stored": True, "cookie_count": len(cookies)}

    @staticmethod
    async def retrieve(platform_id: str) -> dict:
        """Retrieve and decrypt cookies for a platform session."""
        redis = RedisClient()
        encrypted = await redis.get(f"cookies:{platform_id}")
        if encrypted:
            try:
                fernet = CookieVault._get_fernet()
                decrypted = fernet.decrypt(encrypted.encode()).decode()
                return json.loads(decrypted)
            except Exception:
                return {}
        return {}

    @staticmethod
    async def delete(platform_id: str):
        """Remove stored cookies for a platform."""
        redis = RedisClient()
        await redis.delete(f"cookies:{platform_id}")
        await redis.delete(f"cookies:{platform_id}:stored_at")
        return {"platform_id": platform_id, "deleted": True}

    @staticmethod
    async def list_all() -> list:
        """List all platforms with stored cookies."""
        redis = RedisClient()
        keys = await redis.keys("cookies:*:stored_at")
        platforms = []
        for key in keys:
            platform_id = key.replace("cookies:", "").replace(":stored_at", "")
            stored_at = await redis.get(key)
            platforms.append({"platform_id": platform_id, "stored_at": stored_at})
        return platforms
