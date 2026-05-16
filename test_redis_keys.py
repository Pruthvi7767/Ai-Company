import sys
sys.path.insert(0, '.')
import asyncio
from backend.agents.csuite import CEOAgent
from backend.database.redis_client import RedisClient

async def test():
    a = CEOAgent()
    print(f"Agent ID: {a.agent_id}")
    print(f"Tier: {a.tier}")
    await a._init_services()
    print(f"Services initialized: {a._services_initialized}")
    
    r = RedisClient()
    keys = await r.keys("agent:alive:*")
    print(f"All alive keys: {keys}")
    
    csuite_keys = await r.keys("agent:alive:csuite:*")
    print(f"C-Suite keys: {csuite_keys}")
    
    ceo_key = await r.get("agent:alive:csuite:ceo")
    print(f"CEO key data: {ceo_key}")

asyncio.run(test())
