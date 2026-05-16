import sys
sys.path.insert(0, '.')
import asyncio
from backend.database.redis_client import RedisClient

async def test():
    r = RedisClient()
    
    keys = await r.keys("agent:alive:csuite:*")
    print(f"C-Suite alive keys: {len(keys)}")
    for k in sorted(keys):
        print(f"  {k}")
    
    await r.delete("MARKLY_PAUSED")
    paused = await r.get("MARKLY_PAUSED")
    print(f"Paused: {paused}")
    
    dept_keys = await r.keys("agent:alive:dept:*")
    print(f"Dept alive keys: {len(dept_keys)}")
    
    total = len(keys) + len(dept_keys)
    print(f"Total agents alive: {total}")
    
    # Test kill switch
    await r.set("MARKLY_PAUSED", "true")
    paused = await r.get("MARKLY_PAUSED")
    print(f"After pause: MARKLY_PAUSED = {paused}")
    
    await r.delete("MARKLY_PAUSED")
    paused = await r.get("MARKLY_PAUSED")
    print(f"After resume: MARKLY_PAUSED = {paused}")
    
    # Test kill one agent and verify watchdog would restart
    test_key = "agent:alive:csuite:cto"
    await r.delete(test_key)
    keys_after = await r.keys("agent:alive:csuite:*")
    print(f"After killing CTO: {len(keys_after)} C-Suite alive")
    
    # Simulate watchdog restart
    import json, time
    await r.setex(test_key, 60, json.dumps({
        "name": "cto",
        "tier": "csuite",
        "department": "C-Suite",
        "spawned_at": time.time(),
        "restarted_by": "watchdog",
    }))
    keys_after = await r.keys("agent:alive:csuite:*")
    print(f"After watchdog restart: {len(keys_after)} C-Suite alive")

asyncio.run(test())
