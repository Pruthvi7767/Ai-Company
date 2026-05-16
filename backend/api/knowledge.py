from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient, FTS5Client

router = APIRouter()

class KnowledgeCreate(BaseModel):
    title: str
    section: str = "wiki"
    content: str = ""

@router.get("")
async def list_knowledge():
    db = SupabaseClient()
    return await db.select("knowledge")

@router.post("")
async def create_knowledge(data: KnowledgeCreate):
    db = SupabaseClient()
    import time
    kid = f"kb_{int(time.time())}"
    await db.insert("knowledge", {"id": kid, **data.model_dump()})
    return {"id": kid, **data.model_dump()}

@router.get("/search")
async def search_knowledge(q: str):
    fts = FTS5Client()
    results = await fts.search(q, limit=10)
    return results

@router.delete("/{knowledge_id}")
async def delete_knowledge(knowledge_id: str):
    db = SupabaseClient()
    await db.delete("knowledge", {"id": knowledge_id})
    return {"deleted": True}
