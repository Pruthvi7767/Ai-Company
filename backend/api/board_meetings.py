from fastapi import APIRouter
from backend.database import SupabaseClient

router = APIRouter()

@router.get("")
async def list_meetings():
    db = SupabaseClient()
    return await db.select("board_meetings")

@router.get("/{meeting_id}")
async def get_meeting(meeting_id: str):
    db = SupabaseClient()
    meeting = await db.get_by_id("board_meetings", meeting_id)
    return meeting or {}

@router.post("/trigger")
async def trigger_emergency():
    return {"status": "emergency_meeting_triggered"}
