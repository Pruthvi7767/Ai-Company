import asyncio
import json
import time
from backend.database import RedisClient, SupabaseClient
from backend.api.websocket import manager

class AgentSpawner:
    MAX_CONCURRENT = 3

    async def _is_paused(self) -> bool:
        redis = RedisClient()
        paused = await redis.get("MARKLY_PAUSED")
        return paused == "true"

    async def spawn(self, department: str, task: dict, triggered_by: str = "system") -> dict:
        if await self._is_paused():
            return {"status": "error", "error": "System paused", "code": 503}

        redis = RedisClient()
        alive = await redis.keys("agent:alive:dept:*")
        if len(alive) >= self.MAX_CONCURRENT:
            return {"status": "queued"}

        agent_id = f"{department}_{int(time.time())}"

        await redis.setex(f"agent:alive:dept:{agent_id}", 3600, json.dumps({
            "department": department,
            "task": task.get("description", ""),
            "spawned_by": triggered_by,
        }))

        db = SupabaseClient()
        await db.insert("hire_fire_log", {
            "agent_id": agent_id,
            "department": department,
            "action": "hired",
            "triggered_by": triggered_by,
            "task": task.get("description", ""),
        })

        await manager.broadcast("agent-events", {
            "type": "agent_spawned",
            "agent_id": agent_id,
            "department": department,
        })

        asyncio.create_task(self._run_and_terminate(agent_id, department, task))

        return {"status": "spawned", "agent_id": agent_id}

    async def _run_and_terminate(self, agent_id: str, department: str, task: dict):
        start = time.time()
        try:
            from backend.agents.departments import get_agent_for_department
            agent_cls = get_agent_for_department(department)
            if agent_cls:
                agent = agent_cls()
                agent.agent_id = agent_id
                await agent._init_services()

                if await agent.redis.get("MARKLY_PAUSED") == "true":
                    print(f"[SPAWNER] System paused, agent {agent_id} waiting...")
                    while await agent.redis.get("MARKLY_PAUSED") == "true":
                        await asyncio.sleep(5)

                await agent.execute_task(task)
        except Exception as e:
            print(f"[SPAWNER] Agent {agent_id} error: {e}")
        finally:
            redis = RedisClient()
            await redis.delete(f"agent:alive:dept:{agent_id}")
            db = SupabaseClient()
            await db.insert("hire_fire_log", {
                "agent_id": agent_id,
                "action": "fired",
                "duration_seconds": int(time.time() - start),
                "cost_inr": 0.0,
            })
            await manager.broadcast("agent-events", {
                "type": "agent_terminated",
                "agent_id": agent_id,
            })
