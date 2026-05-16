from backend.tasks.celery_app import celery_app
from backend.database import SupabaseClient, RedisClient
import datetime
import asyncio

def _run_async(coro):
    """Safely run async code from sync Celery task."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Already in an event loop (e.g., from another task)
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, coro)
                return future.result(timeout=30)
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)

@celery_app.task(name="tasks.scheduled.account_detection.check_all")
def check_accounts():
    """Scan all connected platforms for new accounts, sessions, and auth tokens."""
    now = datetime.datetime.now().isoformat()
    db = SupabaseClient()
    redis = RedisClient()

    connectors = _run_async(db.select("connectors", {"status": "connected"}))
    detected = 0
    for connector in connectors:
        platform_id = connector.get("id")
        try:
            session_data = _run_async(redis.hgetall(f"session:{platform_id}"))
            if session_data:
                detected += 1
                _run_async(redis.hset(f"session:{platform_id}:last_check", "checked_at", now))
        except Exception as e:
            print(f"[ACCOUNT DETECTION] Failed for {platform_id}: {e}")

    print(f"[ACCOUNT DETECTION] {now} - Checked {len(connectors)} connectors, {detected} active sessions found")
    return {"checked": len(connectors), "active_sessions": detected, "timestamp": now}
