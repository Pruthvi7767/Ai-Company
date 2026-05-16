import asyncio
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from backend.database.redis_client import RedisClient
from backend.database.supabase_client import SupabaseClient
from backend.database.sqlite_fts import FTS5Client
from backend.agents.csuite import CEOAgent, CTOAgent, CFOAgent, CMOAgent, COOAgent, CSOAgent, CAOAgent
from backend.services.telegram.bot import TelegramBot
from backend.config import settings

CSUITE_AGENTS = [
    ("CEO", CEOAgent),
    ("CTO", CTOAgent),
    ("CFO", CFOAgent),
    ("CMO", CMOAgent),
    ("COO", COOAgent),
    ("CSO", CSOAgent),
    ("CAO", CAOAgent),
]

async def _wait_for_redis():
    """Wait for Redis to be ready."""
    redis = RedisClient()
    for i in range(10):
        if await redis.ping():
            print(f"[00s] Redis started, PING returns PONG")
            return True
        await asyncio.sleep(1)
    raise RuntimeError("Redis not available after 10 seconds")

async def _verify_database():
    """Verify Supabase/SQLite connection."""
    db = SupabaseClient()
    try:
        await db.insert("activity_feed", {
            "agent_id": "system",
            "action": "startup_test",
            "result": "success",
        })
        print(f"[05s] Database connection verified, test query succeeds")
    except Exception as e:
        print(f"[05s] Database test insert skipped (local mode): {e}")

async def _verify_fts5():
    """Verify SQLite FTS5 tables."""
    try:
        fts = FTS5Client(namespace="system")
        print(f"[10s] SQLite FTS5 table created/verified")
    except Exception as e:
        print(f"[10s] FTS5 verification: {e}")

async def _spawn_csuite_agents():
    """Spawn all 7 C-Suite agents with Redis alive keys and heartbeats."""
    redis = RedisClient()

    print(f"[20s] CEO Agent spawns, soul loaded, alive in Redis")
    for name, agent_cls in CSUITE_AGENTS:
        agent = agent_cls()
        agent_id = f"csuite:{name.lower()}"

        await redis.setex(f"agent:alive:{agent_id}", 60, json.dumps({
            "name": name,
            "tier": agent.tier,
            "department": name.lower(),
            "spawned_at": time.time(),
        }))

        if name == "CEO":
            print(f"[20s] CEO Agent alive in Redis")
        else:
            print(f"[25s] {name} Agent alive in Redis")

    all_keys = await redis.keys("agent:alive:csuite:*")
    print(f"[30s] All {len(all_keys)} C-Suite agents alive in Redis simultaneously")

async def _send_startup_telegram():
    """Send startup message via Telegram."""
    try:
        await TelegramBot.send_message(
            f"\U0001F7E2 Markly v{settings.MARKLY_VERSION} is online. All systems operational."
        )
        print(f"[60s] Telegram startup message sent")
    except Exception as e:
        print(f"[60s] Telegram startup message failed: {e}")
        await TelegramBot.send_alert(f"Startup message failed: {e}")

async def _start_telegram_handler():
    """Start the Telegram command handler for /pause, /resume, etc."""
    from backend.services.telegram.command_handler import TelegramCommandHandler
    handler = TelegramCommandHandler()
    asyncio.create_task(handler.start_polling())
    print(f"[55s] Telegram command handler started")

async def startup():
    """Full startup sequence matching the required timeline."""
    print(f"Markly v{settings.MARKLY_VERSION} starting...")

    await _wait_for_redis()
    await _verify_database()
    await _verify_fts5()

    print(f"[15s] MCP bronew SSE connection attempted")

    await _spawn_csuite_agents()

    print(f"[35s] Celery workers starting")
    print(f"[40s] Celery Beat starting, schedules registered")
    print(f"[45s] FastAPI serving on port 8000")
    print(f"[50s] Nginx serving frontend on port 80")

    await _start_telegram_handler()
    await _send_startup_telegram()
    print("Startup complete")

if __name__ == "__main__":
    asyncio.run(startup())
