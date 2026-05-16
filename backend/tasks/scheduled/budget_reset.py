from backend.tasks.celery_app import celery_app
from backend.database import SupabaseClient
import datetime
import asyncio

def _run_async(coro):
    """Safely run async code from sync Celery task."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, coro)
                return future.result(timeout=30)
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)

@celery_app.task(name="tasks.scheduled.budget_reset.run")
def reset_budgets():
    """Reset daily token budgets and spending counters for all agents at midnight."""
    now = datetime.datetime.now().isoformat()
    db = SupabaseClient()

    agents = _run_async(db.select("agents"))
    reset_count = 0
    for agent in agents:
        agent_id = agent.get("id")
        try:
            _run_async(db.update("agents", {"id": agent_id}, {
                "tokens_used_today": 0,
                "tasks_today": 0,
            }))
            reset_count += 1
        except Exception as e:
            print(f"[BUDGET RESET] Failed for {agent_id}: {e}")

    print(f"[BUDGET RESET] {now} - Reset budgets for {reset_count}/{len(agents)} agents")
    return {"reset_count": reset_count, "total_agents": len(agents), "timestamp": now}
