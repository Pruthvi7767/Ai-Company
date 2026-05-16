import sys
sys.path.insert(0, '.')
import asyncio
import httpx

async def test_direct():
    key = "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"
    print("Calling NVIDIA API directly...")
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": "meta/llama-3.1-70b-instruct",
                "messages": [{"role": "user", "content": "List 3 business ideas in India under Rs.50000. Return as JSON."}],
                "temperature": 0.7,
                "max_tokens": 1000,
            },
        )
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            print(f"Content: {content[:1000]}")
        else:
            print(f"Error: {resp.text[:500]}")

asyncio.run(test_direct())
