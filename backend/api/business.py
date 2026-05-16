from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient

router = APIRouter()

class ScanRequest(BaseModel):
    sources: list = ["trends.google.com", "reddit.com/r/entrepreneur", "producthunt.com"]

class StatusUpdate(BaseModel):
    status: str

@router.get("")
async def list_business():
    db = SupabaseClient()
    return await db.select("business_opportunities")

@router.get("/active")
async def active_business():
    db = SupabaseClient()
    return await db.select("business_opportunities", {"status": "active"})

@router.post("/scan")
async def trigger_scan(req: ScanRequest = None):
    return {"status": "scan_triggered", "sources": req.sources if req else ["default"]}

@router.get("/{business_id}")
async def get_business(business_id: str):
    db = SupabaseClient()
    biz = await db.get_by_id("business_opportunities", business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    return biz

@router.patch("/{business_id}/status")
async def update_status(business_id: str, data: StatusUpdate):
    db = SupabaseClient()
    await db.update("business_opportunities", {"id": business_id}, {"status": data.status})
    return {"id": business_id, "status": data.status}
