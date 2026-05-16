import httpx
import asyncio
import json

async def test_nvidia():
    key = "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"
    async with httpx.AsyncClient() as c:
        r = await c.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": "meta/llama-3.1-8b-instruct", "messages": [{"role": "user", "content": "Say hello in one word"}], "max_tokens": 10},
            timeout=30
        )
        print(f"NVIDIA Status: {r.status_code}")
        print(f"Response: {r.text[:500]}")
        return r.status_code == 200

async def test_groq():
    key = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")
    async with httpx.AsyncClient() as c:
        r = await c.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": "llama-3.1-8b-instant", "messages": [{"role": "user", "content": "Say hello in one word"}], "max_tokens": 10},
            timeout=30
        )
        print(f"Groq Status: {r.status_code}")
        print(f"Response: {r.text[:500]}")
        return r.status_code == 200

async def main():
    print("Testing NVIDIA API key...")
    nv_ok = await test_nvidia()
    print()
    print("Testing Groq API key...")
    gq_ok = await test_groq()
    print()
    print(f"NVIDIA: {'WORKING' if nv_ok else 'FAILED'}")
    print(f"Groq: {'WORKING' if gq_ok else 'FAILED'}")

asyncio.run(main())
