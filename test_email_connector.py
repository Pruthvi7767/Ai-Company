import sys
sys.path.insert(0, '.')
import asyncio
from backend.database.supabase_client import SupabaseClient

async def test():
    db = SupabaseClient()
    connectors = await db.select("connectors")
    email = [c for c in connectors if c["id"] == "email"]
    print(f"Total connectors: {len(connectors)}")
    print(f"Email connector: {'FOUND' if email else 'NOT FOUND'}")
    if email:
        e = email[0]
        print(f"  Name: {e['name']}")
        print(f"  Category: {e['category']}")
        print(f"  Status: {e['status']}")
        print(f"  Description: {e['description'][:80]}...")

asyncio.run(test())
