from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient

router = APIRouter()

class ApprovalAction(BaseModel):
    note: Optional[str] = None

@router.get("")
async def list_approvals():
    db = SupabaseClient()
    all_approvals = await db.select("approvals")
    pending = [a for a in all_approvals if a.get("status") == "pending"]
    others = [a for a in all_approvals if a.get("status") != "pending"]
    return pending + others

@router.post("/{approval_id}/approve")
async def approve(approval_id: str, action: ApprovalAction = None):
    db = SupabaseClient()
    await db.update("approvals", {"id": approval_id}, {"status": "approved"})
    return {"id": approval_id, "status": "approved"}

@router.post("/{approval_id}/reject")
async def reject(approval_id: str, action: ApprovalAction = None):
    db = SupabaseClient()
    await db.update("approvals", {"id": approval_id}, {"status": "rejected"})
    return {"id": approval_id, "status": "rejected"}

@router.post("/{approval_id}/later")
async def snooze(approval_id: str, action: ApprovalAction = None):
    db = SupabaseClient()
    await db.update("approvals", {"id": approval_id}, {"status": "snoozed"})
    return {"id": approval_id, "status": "snoozed"}
