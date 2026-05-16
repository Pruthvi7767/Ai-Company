import sys
sys.path.insert(0, '.')
import asyncio
import json
from datetime import datetime

async def test_llm_call():
    from backend.services.llm.model_selector import ModelSelector
    result = await ModelSelector.complete(
        agent_id="test",
        tier="csuite",
        prompt="List 3 business ideas in India under Rs.50000. Return as JSON array with name, cost, description."
    )
    print(f"Success: {result.get('success')}")
    print(f"Provider: {result.get('provider')}")
    print(f"Model: {result.get('model')}")
    print(f"Tokens: {result.get('tokens_used')}")
    content = result.get('content', '')
    if isinstance(content, str):
        print(f"Content: {content[:500]}")
    else:
        print(f"Content: {json.dumps(content, indent=2)[:500]}")

asyncio.run(test_llm_call())
