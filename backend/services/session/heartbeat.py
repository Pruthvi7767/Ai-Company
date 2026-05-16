from backend.database import RedisClient
import datetime
import time

HEARTBEAT_INTERVAL = 600

class SessionHeartbeat:
    """Manages heartbeat pings for platform sessions to keep them alive."""

    def __init__(self):
        self.redis = RedisClient()
        self.HEARTBEAT_INTERVAL = 600  # 10 minutes as per spec
        self.MAX_MISSED = 3

    async def ping_all_sessions(self):
        """Ping all active platform sessions and mark stale ones."""
        sessions = await self.redis.keys("session:*:heartbeat")
        results = []
        now = time.time()

        for key in sessions:
            last_ping = await self.redis.get(key)
            if last_ping:
                elapsed = now - float(last_ping)
                if elapsed > self.HEARTBEAT_INTERVAL * self.MAX_MISSED:
                    results.append({"key": key, "status": "stale", "elapsed": elapsed})
                else:
                    results.append({"key": key, "status": "alive", "elapsed": elapsed})

        return results

    async def ping_session(self, session: dict):
        """Record a heartbeat for a specific session."""
        platform_id = session.get("platform_id", "unknown")
        now = str(time.time())
        await self.redis.set(f"session:{platform_id}:heartbeat", now, ex=self.HEARTBEAT_INTERVAL * self.MAX_MISSED)
        await self.redis.set(f"session:{platform_id}:last_seen", datetime.datetime.now().isoformat())
        return {"platform_id": platform_id, "pinged_at": now}

    async def auto_relogin(self, session: dict):
        """Attempt to re-login a session that has gone stale."""
        platform_id = session.get("platform_id", "unknown")
        from backend.services.session.auto_login import AutoLogin
        auto_login = AutoLogin()
        result = await auto_login.login(platform_id)
        if result.get("success"):
            await self.ping_session(session)
        return result
