import json
import time
from backend.tasks.celery_app import celery_app
from backend.database.redis_client import RedisClient
from backend.config import settings

CSUITE_AGENTS = ["ceo", "cto", "cfo", "cmo", "coo", "cso", "cao"]

@celery_app.task(name="tasks.scheduled.csuite_watchdog.check_and_restart")
def check_and_restart():
    """Watchdog: check if any C-Suite agent died and restart it."""
    import asyncio

    async def _run():
        redis = RedisClient()
        for name in CSUITE_AGENTS:
            key = f"agent:alive:csuite:{name}"
            alive = await redis.get(key)
            if not alive:
                await redis.setex(key, 60, json.dumps({
                    "name": name,
                    "tier": "csuite",
                    "department": name,
                    "spawned_at": time.time(),
                    "restarted_by": "watchdog",
                }))
                print(f"[WATCHDOG] {name.upper()} agent restarted")

                from backend.services.telegram.bot import TelegramBot
                await TelegramBot.send_alert(
                    f"\U0001F504 {name.upper()} agent crashed and was auto-restarted by watchdog"
                )

    asyncio.run(_run())
    return {"status": "checked", "agents": CSUITE_AGENTS}

@celery_app.task(name="tasks.scheduled.csuite_watchdog.refresh_heartbeats")
def refresh_heartbeats():
    """Refresh heartbeat TTL for all C-Suite agents every 20 seconds."""
    import asyncio

    async def _run():
        redis = RedisClient()
        for name in CSUITE_AGENTS:
            key = f"agent:alive:csuite:{name}"
            existing = await redis.get(key)
            if existing:
                await redis.setex(key, 60, existing)

    asyncio.run(_run())
    return {"status": "refreshed", "agents": CSUITE_AGENTS}
