from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient, RedisClient
import time, json

router = APIRouter()

class SpawnRequest(BaseModel):
    department: str
    task: str

@router.get("")
async def list_agents():
    db = SupabaseClient()
    return await db.select("agents")

@router.get("/csuite")
async def get_csuite():
    db = SupabaseClient()
    return await db.select("agents", {"department": "C-Suite"})

@router.get("/spawned")
async def list_spawned():
    db = SupabaseClient()
    return await db.select("spawned_agents", {"status": "running"})

@router.post("/spawn")
async def spawn_agent(req: SpawnRequest):
    db = SupabaseClient()
    agent_id = f"{req.department}_{int(time.time())}"
    await db.insert("spawned_agents", {
        "id": agent_id,
        "department": req.department,
        "task_description": req.task,
        "spawned_by": "user",
        "status": "running",
    })
    return {"status": "spawned", "agent_id": agent_id}

@router.delete("/spawned/{agent_id}")
async def terminate_agent(agent_id: str):
    db = SupabaseClient()
    await db.update("spawned_agents", {"id": agent_id}, {"status": "terminated"})
    return {"status": "terminated", "agent_id": agent_id}

@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    db = SupabaseClient()
    agent = await db.get_by_id("agents", agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.get("/{agent_id}/memory")
async def get_agent_memory(agent_id: str):
    return {"memories": []}

@router.get("/{agent_id}/skills")
async def get_agent_skills(agent_id: str):
    return {"skills": []}

@router.get("/{agent_id}/tasks")
async def get_agent_tasks(agent_id: str):
    return {"tasks": []}
