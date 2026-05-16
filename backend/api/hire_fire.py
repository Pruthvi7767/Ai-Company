from fastapi import APIRouter
from pydantic import BaseModel
from backend.database import SupabaseClient, RedisClient
from backend.agents.spawner import AgentSpawner
import time

router = APIRouter()

class SpawnRequest(BaseModel):
    department: str
    task: str

@router.get("/active")
async def active_agents():
    redis = RedisClient()
    dept_keys = await redis.keys("agent:alive:dept:*")
    agents = []
    for key in dept_keys:
        data = await redis.get(key)
        if data:
            import json
            agents.append({"key": key, "data": json.loads(data)})
    return agents

@router.post("/spawn")
async def spawn(req: SpawnRequest):
    spawner = AgentSpawner()
    task = {"description": req.task, "type": "user_requested"}
    result = await spawner.spawn(req.department, task, triggered_by="user")
    return result

@router.delete("/terminate/{agent_id}")
async def terminate(agent_id: str):
    redis = RedisClient()
    await redis.delete(f"agent:alive:dept:{agent_id}")
    db = SupabaseClient()
    await db.insert("hire_fire_log", {
        "agent_id": agent_id,
        "action": "fired",
        "duration_seconds": 0,
        "cost_inr": 0.0,
    })
    return {"status": "terminated"}

@router.get("/log")
async def hire_fire_log():
    db = SupabaseClient()
    return await db.select("hire_fire_log", limit=100)
