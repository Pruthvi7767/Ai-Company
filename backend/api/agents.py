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
    from backend.services.memory.mem0_client import Mem0Client
    memory = Mem0Client(namespace=agent_id)
    memories = await memory.search("", limit=20)
    return {"memories": memories, "agent_id": agent_id}

@router.get("/{agent_id}/skills")
async def get_agent_skills(agent_id: str):
    from backend.database.sqlite_fts import FTS5Client
    db = SupabaseClient()
    agent = await db.get_by_id("agents", agent_id)
    dept = agent.get("department", agent_id) if agent else agent_id
    fts = FTS5Client(namespace=dept)
    skills = await fts.search("", limit=20)
    return {"skills": skills, "agent_id": agent_id, "department": dept}

@router.get("/{agent_id}/tasks")
async def get_agent_tasks(agent_id: str):
    db = SupabaseClient()
    tasks = await db.select("audit_log", {"agent_id": agent_id}, limit=50)
    return {"tasks": tasks, "total": len(tasks)}
