from backend.database import SupabaseClient, RedisClient
from backend.services.session.cookie_vault import CookieVault
from backend.services.telegram.bot import TelegramBot
import datetime
import httpx

class AutoLogin:
    """Automatically logs into platforms using stored credentials or cookies."""

    @staticmethod
    async def login(platform_id: str):
        """Attempt auto-login for a platform using stored cookies or credentials."""
        db = SupabaseClient()
        redis = RedisClient()

        # Step 1: Try stored encrypted cookies first
        cookies = await CookieVault.retrieve(platform_id)
        if cookies:
            # Validate cookies by hitting a lightweight endpoint
            connector = await db.get_by_id("connectors", platform_id)
            if connector:
                heartbeat_url = connector.get("heartbeat_url", f"https://{platform_id}.com/api/health")
                try:
                    async with httpx.AsyncClient(cookies=cookies, timeout=10) as client:
                        resp = await client.get(heartbeat_url)
                        if resp.status_code == 200:
                            await redis.set(f"session:{platform_id}:status", "active")
                            await redis.set(f"session:{platform_id}:last_login", datetime.datetime.now().isoformat())
                            return {"success": True, "method": "cookies", "platform_id": platform_id}
                except Exception:
                    pass  # Cookies expired, fall through to credential login

        # Step 2: Try stored credentials from vault
        from backend.services.vault.secrets import VaultClient
        username = await VaultClient.get(f"{platform_id}_username")
        password = await VaultClient.get(f"{platform_id}_password")

        if username and password:
            connector = await db.get_by_id("connectors", platform_id)
            if connector:
                login_url = connector.get("login_url", f"https://{platform_id}.com/login")
                try:
                    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
                        resp = await client.post(login_url, data={"username": username, "password": password})
                        if resp.status_code in (200, 302):
                            # Extract new cookies
                            new_cookies = dict(resp.cookies)
                            if new_cookies:
                                await CookieVault.store(platform_id, new_cookies)
                                await redis.set(f"session:{platform_id}:status", "active")
                                await redis.set(f"session:{platform_id}:last_login", datetime.datetime.now().isoformat())
                                return {"success": True, "method": "credentials", "platform_id": platform_id}
                except Exception:
                    pass

        # Step 3: Check if connector is already marked as connected
        connector = await db.get_by_id("connectors", platform_id)
        if connector and connector.get("status") == "connected":
            await redis.set(f"session:{platform_id}:status", "active")
            await redis.set(f"session:{platform_id}:last_login", datetime.datetime.now().isoformat())
            return {"success": True, "method": "status_check", "platform_id": platform_id}

        # All methods failed
        await redis.set(f"session:{platform_id}:status", "dead")
        return {"success": False, "method": None, "platform_id": platform_id, "reason": "no_credentials"}

    @staticmethod
    async def logout(platform_id: str):
        """Clear session and cookies for a platform."""
        redis = RedisClient()
        await redis.delete(f"session:{platform_id}:status")
        await redis.delete(f"session:{platform_id}:last_login")
        await CookieVault.delete(platform_id)
        return {"success": True, "platform_id": platform_id}
