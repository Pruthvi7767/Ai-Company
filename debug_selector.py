import sys
sys.path.insert(0, '.')
import asyncio
import json

async def debug_model_selector():
    from backend.config import settings
    print(f"NVIDIA_API_KEYS: {settings.NVIDIA_API_KEYS}")
    print(f"GROQ_API_KEYS: {settings.GROQ_API_KEYS}")
    
    from backend.services.llm.credential_pool import CredentialPool
    nvidia_keys = CredentialPool.get_keys("NVIDIA")
    print(f"Available NVIDIA keys: {len(nvidia_keys)}")
    
    from backend.services.llm.nvidia_client import NVIDIAClient
    if nvidia_keys:
        result = await NVIDIAClient.complete(
            "meta/llama-3.1-70b-instruct",
            "Say hello in one word.",
            nvidia_keys[0]
        )
        print(f"NVIDIA result: {result}")

asyncio.run(debug_model_selector())
