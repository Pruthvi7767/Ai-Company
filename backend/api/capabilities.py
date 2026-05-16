from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient

router = APIRouter()

class CapabilityCreate(BaseModel):
    name: str
    status: str = "dormant"
    required_api: str = ""

class CapabilityUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None

@router.get("")
async def list_capabilities():
    db = SupabaseClient()
    return await db.select("capabilities")

@router.get("/{department}")
async def get_dept_capabilities(department: str):
    db = SupabaseClient()
    return await db.select("capabilities")

@router.post("")
async def create_capability(data: CapabilityCreate):
    db = SupabaseClient()
    import time
    cid = f"cap_{int(time.time())}"
    await db.insert("capabilities", {"id": cid, **data.model_dump()})
    return {"id": cid, **data.model_dump()}

@router.patch("/{cap_id}")
async def update_capability(cap_id: str, data: CapabilityUpdate):
    db = SupabaseClient()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    await db.update("capabilities", {"id": cap_id}, update_data)
    return {"id": cap_id, **update_data}
