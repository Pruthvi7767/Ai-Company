from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient

router = APIRouter()

class ContentCreate(BaseModel):
    title: str
    type: str = "Article"
    platform: str = ""
    agent: str = ""

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None

@router.get("")
async def list_content():
    db = SupabaseClient()
    return await db.select("content")

@router.post("")
async def create_content(data: ContentCreate):
    db = SupabaseClient()
    import time
    cid = f"content_{int(time.time())}"
    await db.insert("content", {"id": cid, **data.model_dump()})
    return {"id": cid, **data.model_dump()}

@router.patch("/{content_id}")
async def update_content(content_id: str, data: ContentUpdate):
    db = SupabaseClient()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    await db.update("content", {"id": content_id}, update_data)
    return {"id": content_id, **update_data}

@router.delete("/{content_id}")
async def delete_content(content_id: str):
    db = SupabaseClient()
    await db.delete("content", {"id": content_id})
    return {"deleted": True}

@router.post("/{content_id}/publish")
async def publish_content(content_id: str):
    db = SupabaseClient()
    await db.update("content", {"id": content_id}, {"status": "published"})
    return {"id": content_id, "status": "published"}
