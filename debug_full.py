import sys
sys.path.insert(0, '.')
import asyncio
import json

async def debug_full():
    from backend.services.llm.model_selector import ModelSelector, TIER_MODELS
    print(f"TIER_MODELS: {TIER_MODELS}")
    
    print("Calling ModelSelector.complete...")
    result = await ModelSelector.complete(
        agent_id="test",
        tier="csuite",
        prompt="Say hello in one word."
    )
    print(f"Result: {result}")

asyncio.run(debug_full())
