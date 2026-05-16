from backend.tasks.celery_app import celery_app
from backend.database import SupabaseClient, RedisClient
import datetime

@celery_app.task(name="tasks.scheduled.heartbeat_cron.ping_all")
def ping_all():
    """Ping all connected platforms and update heartbeat timestamps."""
    now = datetime.datetime.now().isoformat()
    db = SupabaseClient()
    redis = RedisClient()

    connectors = db.select("connectors", {"status": "connected"})
    pinged = 0
    for connector in connectors:
        platform_id = connector.get("id")
        try:
            redis.set(f"heartbeat:{platform_id}", now, ex=300)
            pinged += 1
        except Exception as e:
            print(f"[HEARTBEAT] Failed for {platform_id}: {e}")

    print(f"[HEARTBEAT] {now} - Pinged {pinged}/{len(connectors)} platforms")
    return {"timestamp": now, "pinged": pinged, "total": len(connectors)}
