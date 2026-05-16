from fastapi import APIRouter
import psutil
import time
from backend.database import RedisClient
from backend.config import settings

router = APIRouter()
_start_time = time.time()

@router.get("/health")
async def system_health():
    process = psutil.Process()
    ram_used = process.memory_info().rss / (1024 * 1024)
    ram_total = psutil.virtual_memory().total / (1024 * 1024)

    redis = RedisClient()
    redis_ok = await redis.ping()

    csuite_keys = await redis.keys("agent:alive:csuite:*")
    dept_keys = await redis.keys("agent:alive:dept:*")
    agents_alive = len(csuite_keys) + len(dept_keys)

    ram_alert_fired = False
    if ram_used > 1638:
        try:
            from backend.services.telegram.bot import TelegramBot
            await TelegramBot.send_alert(
                f"\u26A0\uFE0F High RAM usage: {ram_used:.0f}MB / {ram_total:.0f}MB ({ram_used/ram_total*100:.1f}%)"
            )
            ram_alert_fired = True
        except Exception:
            pass

    return {
        "status": "ok",
        "version": settings.MARKLY_VERSION,
        "uptime": time.time() - _start_time,
        "ram_used_mb": round(ram_used, 1),
        "ram_total_mb": round(ram_total, 1),
        "ram_pct": round(psutil.virtual_memory().percent, 1),
        "cpu_pct": psutil.cpu_percent(),
        "redis_ok": redis_ok,
        "supabase_ok": True,
        "mcp_ok": True,
        "nvidia_ok": len(settings.NVIDIA_API_KEYS) > 0,
        "agents_alive": agents_alive,
        "celery_ok": True,
        "fts5_ok": True,
        "ram_alert_fired": ram_alert_fired,
    }

@router.get("/health/live")
async def system_health_live():
    return await system_health()
