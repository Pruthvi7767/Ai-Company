from fastapi import APIRouter, Query
from backend.database import SupabaseClient

router = APIRouter()

@router.get("")
async def get_audit_log(agent: str = Query(None), action: str = Query(None)):
    db = SupabaseClient()
    filters = {}
    if agent:
        filters["agent_id"] = agent
    if action:
        filters["action"] = action
    return await db.select("audit_log", filters if filters else None, limit=200)
