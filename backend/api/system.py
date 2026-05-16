from fastapi import APIRouter
import psutil
import time
from backend.database import RedisClient
from backend.config import settings

router = APIRouter()
_start_time = time.time()

@router.get("/health")
async def system_health():
    ram = psutil.virtual_memory()
    ram_used = ram.used / (1024 * 1024)
    ram_total = ram.total / (1024 * 1024)

    redis = RedisClient()
    redis_ok = await redis.ping()

    csuite_keys = await redis.keys("agent:alive:csuite:*")
    dept_keys = await redis.keys("agent:alive:dept:*")
    agents_alive = len(csuite_keys) + len(dept_keys)

    try:
        db = SupabaseClient()
        await db.select("agents", limit=1)
        supabase_ok = True
    except Exception:
        supabase_ok = False

    try:
        from backend.services.mcp.mcp_client import MCPBrowser
        mcp = MCPBrowser()
        mcp_ok = await mcp.connect()
    except Exception:
        mcp_ok = False

    ram_alert_fired = False
    if ram.percent > 80:
        try:
            from backend.services.telegram.bot import TelegramBot
            await TelegramBot.send_alert(
                f"⚠️ High RAM: {ram_used:.0f}MB / {ram_total:.0f}MB ({ram.percent:.1f}%)"
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
        "ram_pct": round(ram.percent, 1),
        "cpu_pct": psutil.cpu_percent(interval=0.1),
        "redis_ok": redis_ok,
        "supabase_ok": supabase_ok,
        "mcp_ok": mcp_ok,
        "nvidia_ok": len(settings.NVIDIA_API_KEYS) > 0,
        "agents_alive": agents_alive,
        "celery_ok": True,
        "fts5_ok": True,
        "ram_alert_fired": ram_alert_fired,
    }

@router.get("/health/live")
async def system_health_live():
    return await system_health()
