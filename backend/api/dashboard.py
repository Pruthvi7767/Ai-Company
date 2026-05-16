from fastapi import APIRouter
from backend.database import SupabaseClient, RedisClient

router = APIRouter()

@router.get("/summary")
async def dashboard_summary():
    db = SupabaseClient()
    agents = await db.select("agents")
    approvals = await db.select("approvals", {"status": "pending"})
    earnings = await db.select("earnings")
    activity = await db.select("activity_feed", limit=10)
    streams = await db.select("income_streams")

    total_revenue = sum(e.get("amount_inr", 0) for e in earnings)
    active_agents = len([a for a in agents if a.get("status") == "active"])
    tasks_today = sum(a.get("tasks_today", 0) for a in agents)

    return {
        "total_revenue_inr": total_revenue,
        "total_revenue_usd": total_revenue / 83.5,
        "active_agents": active_agents,
        "total_agents": len(agents),
        "tasks_completed_today": tasks_today,
        "pending_approvals": len(approvals),
        "revenue_trend_pct": 12.5,
        "agent_trend_pct": 3.2,
        "earnings_chart": [],
        "activity_feed": activity,
        "income_streams_summary": streams,
    }
