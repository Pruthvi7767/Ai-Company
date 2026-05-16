import sys
sys.path.insert(0, '.')
import asyncio
from backend.database.sqlite_fts import FTS5Client

async def test():
    fts = FTS5Client(namespace='test_verify2')
    print('FTS5 initialized')
    
    # Insert a skill
    skill_id = await fts.insert_skill({
        'department': 'Test',
        'task_type': 'verification',
        'description': 'Test FTS5 search',
        'approach': 'Insert and search',
        'outcome': 'Success',
        'success': 1,
        'tokens_used': 100,
    })
    print(f'Inserted skill ID: {skill_id}')
    
    # Check if skill exists in the table
    conn = fts._get_conn()
    rows = conn.execute('SELECT * FROM skills').fetchall()
    print(f'Skills in table: {len(rows)}')
    for r in rows:
        print(f'  - {dict(r)}')
    
    # Check FTS5 index
    fts_rows = conn.execute('SELECT * FROM skills_fts').fetchall()
    print(f'Skills in FTS5: {len(fts_rows)}')
    for r in fts_rows:
        print(f'  - {dict(r)}')
    
    # Try different search queries
    queries = ['Test', 'verification', 'FTS5', 'search', 'Test verification']
    for q in queries:
        results = await fts.search(q, limit=5)
        print(f'Search "{q}": {len(results)} results')

asyncio.run(test())
