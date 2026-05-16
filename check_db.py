import sys
sys.path.insert(0, '.')
import asyncio
from backend.database.supabase_client import SupabaseClient

async def check():
    db = SupabaseClient()
    agents = await db.select("agents")
    print(f"Agents in DB: {len(agents)}")
    for a in agents:
        print(f"  {a['id']}: {a['name']} ({a['status']})")
    
    connectors = await db.select("connectors")
    print(f"\nConnectors in DB: {len(connectors)}")
    for c in connectors:
        print(f"  {c['id']}: {c['name']} ({c['status']})")

asyncio.run(check())
