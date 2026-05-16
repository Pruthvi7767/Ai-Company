import json
import asyncio
from backend.database import RedisClient

class ACPBus:
    """Agent Communication Protocol — Redis pub/sub message bus."""

    def __init__(self, agent_id: str = ""):
        self.agent_id = agent_id
        self.redis = RedisClient()

    async def send(self, to_agent: str, message: dict):
        payload = json.dumps({"from": self.agent_id, "to": to_agent, "message": message})
        await self.redis.publish(f"acp:{to_agent}", payload)

    async def listen(self, callback):
        async def handler(msg):
            await callback(json.loads(msg))
        await self.redis.subscribe(f"acp:{self.agent_id}", handler)

    async def broadcast(self, message: dict):
        payload = json.dumps({"from": self.agent_id, "message": message})
        await self.redis.publish("acp:broadcast", payload)
