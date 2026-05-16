import sys
sys.path.insert(0, '.')
import asyncio
from backend.database.supabase_client import SupabaseClient
from backend.database.redis_client import RedisClient

async def check():
    db = SupabaseClient()
    agents = await db.select("agents")
    print(f"Agents in DB: {len(agents)}")
    for a in agents:
        print(f"  {a['id']}: {a['name']} ({a['status']})")
    
    r = RedisClient()
    csuite_keys = await r.keys("agent:alive:csuite:*")
    print(f"\nC-Suite in Redis: {len(csuite_keys)}")
    for k in csuite_keys:
        data = await r.get(k)
        print(f"  {k}: {data[:80] if data else 'empty'}")

asyncio.run(check())
