from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient

router = APIRouter()

class StreamCreate(BaseModel):
    name: str
    status: str = "dormant"
    color: str = "#666666"

class StreamUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    color: Optional[str] = None

@router.get("")
async def list_streams():
    db = SupabaseClient()
    return await db.select("income_streams")

@router.get("/{stream_id}")
async def get_stream(stream_id: str):
    db = SupabaseClient()
    stream = await db.get_by_id("income_streams", stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    return stream

@router.post("")
async def create_stream(data: StreamCreate):
    db = SupabaseClient()
    import time
    stream_id = f"stream_{int(time.time())}"
    await db.insert("income_streams", {"id": stream_id, **data.model_dump()})
    return {"id": stream_id, **data.model_dump()}

@router.patch("/{stream_id}")
async def update_stream(stream_id: str, data: StreamUpdate):
    db = SupabaseClient()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    await db.update("income_streams", {"id": stream_id}, update_data)
    return {"id": stream_id, **update_data}

@router.delete("/{stream_id}")
async def delete_stream(stream_id: str):
    db = SupabaseClient()
    await db.delete("income_streams", {"id": stream_id})
    return {"deleted": True}
