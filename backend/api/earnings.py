from fastapi import APIRouter
from backend.database import SupabaseClient

router = APIRouter()

@router.get("")
async def get_earnings():
    db = SupabaseClient()
    earnings = await db.select("earnings")
    total_inr = sum(e.get("amount_inr", 0) for e in earnings)
    return {
        "total_inr": total_inr,
        "total_usd": total_inr / 83.5,
        "by_stream": [],
        "by_platform": [],
        "history": [{"date": e.get("date"), "amount_inr": e.get("amount_inr")} for e in earnings],
        "period": "month",
    }

@router.get("/stream/{stream_id}")
async def get_stream_earnings(stream_id: str):
    return {"stream_id": stream_id, "earnings": []}

@router.get("/realtime")
async def get_realtime_earnings():
    return {"total_inr": 0, "last_24h": []}
