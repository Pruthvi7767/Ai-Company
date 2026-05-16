from fastapi import APIRouter
from backend.database import SupabaseClient
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/overview")
async def analytics_overview():
    db = SupabaseClient()
    agents = await db.select("agents")
    earnings = await db.select("earnings")
    connectors = await db.select("connectors")
    
    total_revenue = sum(e.get("amount_inr", 0) for e in earnings)
    active_agents = len([a for a in agents if a.get("status") == "active"])
    
    return {
        "total_revenue": total_revenue,
        "active_agents": active_agents,
        "total_agents": len(agents),
        "connected_platforms": len([c for c in connectors if c.get("status") == "connected"]),
        "revenue_trend": [],
        "agent_performance": [{"name": a.get("name"), "tasks": a.get("tasks_today", 0), "roi": a.get("roi", 0)} for a in agents],
        "platform_growth": []
    }

@router.get("/agents")
async def agent_analytics():
    db = SupabaseClient()
    agents = await db.select("agents")
    return [{"name": a.get("name"), "tasks": a.get("tasks_today"), "roi": a.get("roi")} for a in agents]

@router.get("/revenue")
async def revenue_analytics():
    db = SupabaseClient()
    earnings = await db.select("earnings")
    streams = await db.select("income_streams")
    
    total = sum(e.get("amount_inr", 0) for e in earnings)
    
    by_stream = []
    for s in streams:
        stream_earnings = [e for e in earnings if e.get("stream_id") == s.get("id")]
        by_stream.append({
            "name": s.get("name"),
            "total": sum(e.get("amount_inr", 0) for e in stream_earnings),
            "status": s.get("status")
        })
    
    today = datetime.now()
    trend = []
    for i in range(6, -1, -1):
        date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        day_earnings = sum(e.get("amount_inr", 0) for e in earnings if e.get("date") == date)
        trend.append({"date": date, "amount": day_earnings})
    
    return {"total": total, "trend": trend, "by_stream": by_stream}

@router.get("/tasks")
async def task_analytics():
    db = SupabaseClient()
    agents = await db.select("agents")
    completed = sum(a.get("tasks_today", 0) for a in agents)
    return {"completed": completed, "pending": 0, "failed": 0}

@router.get("/platforms")
async def platform_analytics():
    db = SupabaseClient()
    connectors = await db.select("connectors")
    earnings = await db.select("earnings")
    
    platforms = []
    for c in connectors:
        if c.get("status") == "connected":
            platform_earnings = [e for e in earnings if e.get("platform_id") == c.get("id")]
            total = sum(e.get("amount_inr", 0) for e in platform_earnings)
            platforms.append({
                "name": c.get("name"),
                "category": c.get("category"),
                "total_earnings": total,
                "status": c.get("status")
            })
    
    return platforms

@router.get("/competitive")
async def competitive_intelligence():
    db = SupabaseClient()
    agents = await db.select("agents")
    connectors = await db.select("connectors")
    streams = await db.select("income_streams")
    
    active_agents = len([a for a in agents if a.get("status") == "active"])
    connected = len([c for c in connectors if c.get("status") == "connected"])
    active_streams = len([s for s in streams if s.get("status") == "active"])
    
    return {
        "market_opportunity": f"₹{sum(s.get('earnings_this_month', 0) for s in streams):,.0f}",
        "active_agents": active_agents,
        "connected_platforms": connected,
        "active_streams": active_streams,
        "total_agents": len(agents),
        "total_platforms": len(connectors)
    }
