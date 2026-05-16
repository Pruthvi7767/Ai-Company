import asyncio
import json
import time
from typing import Any, Optional
from pathlib import Path

class BaseAgent:
    def __init__(self, agent_id: str, department: str, soul_path: str, tier: str = "manager"):
        self.agent_id = agent_id
        self.department = department
        self.tier = tier
        self.soul = self._load_soul(soul_path)
        self.tokens_used = 0
        self.start_time = time.time()
        self.confidence_threshold = 0.70
        self._services_initialized = False
        self.memory = None
        self.fts = None
        self.skills = None
        self.acp = None
        self.redis = None
        self.supabase = None

    def _load_soul(self, path: str) -> str:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return f"# {self.agent_id}\nDepartment: {self.department}\nTier: {self.tier}"
        except UnicodeDecodeError:
            with open(path, 'r', encoding='latin-1') as f:
                return f.read()

    async def _init_services(self):
        """Lazy-init heavy services to save RAM on spawn."""
        if self._services_initialized:
            return
        from backend.services.memory.mem0_client import Mem0Client
        from backend.database.sqlite_fts import FTS5Client
        from backend.services.skills.skills_hub import SkillsHub
        from backend.services.acp.agent_bus import ACPBus
        from backend.database.redis_client import RedisClient
        from backend.database.supabase_client import SupabaseClient

        self.memory = Mem0Client(namespace=self.agent_id)
        self.fts = FTS5Client(namespace=self.department)
        self.skills = SkillsHub()
        self.acp = ACPBus(agent_id=self.agent_id)
        self.redis = RedisClient()
        self.supabase = SupabaseClient()
        self._services_initialized = True

        if self.tier == "csuite":
            await self.redis.setex(f"agent:alive:csuite:{self.agent_id}", 60, json.dumps({
                "name": self.agent_id,
                "tier": self.tier,
                "department": self.department,
                "spawned_at": self.start_time,
            }))

    async def think(self, prompt: str, context: dict = None) -> dict:
        """Think through a prompt using LLM with soul, memory, and skills context."""
        await self._init_services()
        context = context or {}

        # 1. Search FTS5 for similar past tasks
        past_skills = await self.fts.search(prompt, limit=3) if self.fts else []

        # 2. Load relevant memories
        memories = await self.memory.search(prompt, limit=5) if self.memory else []

        # 3. Build full context
        full_prompt = f"""
{self.soul}

RELEVANT PAST SKILLS:
{json.dumps(past_skills, indent=2)}

RELEVANT MEMORIES:
{json.dumps(memories, indent=2)}

CURRENT TASK:
{prompt}

CONTEXT:
{json.dumps(context, indent=2)}

IMPORTANT: Always include a confidence score (0.0-1.0) in your response JSON.
If confidence < 0.7, explain why and what additional information you need.
"""
        # 4. Call LLM (auto model select + fallback)
        from backend.services.llm.model_selector import ModelSelector
        response = await ModelSelector.complete(
            agent_id=self.agent_id,
            tier=self.tier,
            prompt=full_prompt
        )

        # 5. Track tokens
        self.tokens_used += response.get("tokens_used", 0)

        # 6. Check confidence and escalate if needed
        result = response.get("content", {})
        if isinstance(result, dict) and result.get("confidence", 1.0) < self.confidence_threshold:
            await self._escalate_to_telegram(prompt, result)

        return result

    async def execute_task(self, task: dict) -> dict:
        """Execute a task with checkpointing, skill creation, and audit logging."""
        await self._init_services()

        if self.redis:
            paused = await self.redis.get("MARKLY_PAUSED")
            if paused == "true":
                print(f"[{self.agent_id}] System paused, waiting...")
                while await self.redis.get("MARKLY_PAUSED") == "true":
                    await asyncio.sleep(5)

        checkpoint_key = f"checkpoint:{self.agent_id}:{task.get('task_id', 'default')}"

        existing = await self.redis.get(checkpoint_key) if self.redis else None
        if existing:
            return await self._resume_from_checkpoint(existing, task)

        try:
            result = await self.think(task.get("description", ""), task)

            await self._create_skill(task, result)

            if self.memory:
                await self.memory.add(f"Completed: {task.get('description', '')}", metadata=result)

            if self.supabase:
                await self.supabase.insert("audit_log", {
                    "agent_id": self.agent_id,
                    "task_id": task.get("task_id", "default"),
                    "action": task.get("description", ""),
                    "result": "success",
                    "tokens_used": self.tokens_used,
                    "cost_inr": self._tokens_to_inr(self.tokens_used)
                })

            return result
        except Exception as e:
            await self._handle_error(task, e)
            raise

    async def _create_skill(self, task: dict, result: dict):
        """Create a skill entry from a completed task for FTS5 learning loop."""
        skill = {
            "department": self.department,
            "task_type": task.get("type", "general"),
            "description": task.get("description", ""),
            "approach": result.get("approach", "") if isinstance(result, dict) else "",
            "outcome": result.get("outcome", "") if isinstance(result, dict) else "",
            "success": True,
            "tokens_used": self.tokens_used,
        }
        if self.fts:
            await self.fts.insert_skill(skill)
        if self.skills:
            await self.skills.publish(skill)

    async def _escalate_to_telegram(self, task: str, result: dict):
        """Escalate to Telegram when confidence is below threshold."""
        from backend.services.telegram.bot import TelegramBot
        confidence = result.get("confidence", 0) if isinstance(result, dict) else 0
        reason = result.get("reason", "Unknown") if isinstance(result, dict) else "Unknown"
        await TelegramBot.send_alert(
            f"⚠️ Agent {self.agent_id} needs guidance\n"
            f"Task: {task[:200]}\n"
            f"Confidence: {confidence:.0%}\n"
            f"Reason: {reason}"
        )

    async def _resume_from_checkpoint(self, checkpoint: str, task: dict) -> dict:
        """Resume task execution from a saved checkpoint."""
        data = json.loads(checkpoint) if isinstance(checkpoint, str) else checkpoint
        return await self.think(f"Resume task: {task.get('description', '')}", {**task, "checkpoint": data})

    async def _handle_error(self, task: dict, error: Exception):
        """Log errors and escalate if critical."""
        if self.supabase:
            await self.supabase.insert("audit_log", {
                "agent_id": self.agent_id,
                "task_id": task.get("task_id", "default"),
                "action": task.get("description", ""),
                "result": f"error: {str(error)}",
                "tokens_used": self.tokens_used,
                "cost_inr": self._tokens_to_inr(self.tokens_used)
            })
        if self.redis:
            await self.redis.set(f"agent:error:{self.agent_id}", str(error), ex=3600)

    def _tokens_to_inr(self, tokens: int) -> float:
        """Convert token usage to INR cost."""
        usd_cost = (tokens / 1000) * 0.008
        return usd_cost * 83.5

    async def terminate(self):
        """Clean up, save final state, flush memory."""
        if self.memory:
            await self.memory.flush()
        if self.redis:
            await self.redis.delete(f"agent:alive:{self.agent_id}")
            await self.redis.delete(f"agent:alive:csuite:{self.agent_id}")
            await self.redis.delete(f"agent:alive:dept:{self.agent_id}")
            await self.redis.delete(f"agent:error:{self.agent_id}")
