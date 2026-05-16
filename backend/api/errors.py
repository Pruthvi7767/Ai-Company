from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient

router = APIRouter()

class ResolveRequest(BaseModel):
    note: Optional[str] = None

@router.get("")
async def list_errors():
    db = SupabaseClient()
    return await db.select("error_logs")

@router.get("/{error_id}")
async def get_error(error_id: str):
    db = SupabaseClient()
    error = await db.get_by_id("error_logs", error_id)
    if not error:
        raise HTTPException(status_code=404, detail="Error not found")
    return error

@router.post("/{error_id}/resolve")
async def resolve_error(error_id: str, req: ResolveRequest = None):
    db = SupabaseClient()
    await db.update("error_logs", {"id": error_id}, {"status": "resolved"})
    return {"id": error_id, "status": "resolved"}

@router.delete("/{error_id}")
async def delete_error(error_id: str):
    db = SupabaseClient()
    await db.delete("error_logs", {"id": error_id})
    return {"deleted": True}
