import httpx
import asyncio

async def test_model(model_name):
    key = "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"
    async with httpx.AsyncClient() as c:
        r = await c.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": model_name, "messages": [{"role": "user", "content": "Say hello in one word"}], "max_tokens": 10},
            timeout=30
        )
        print(f"  {model_name}: {r.status_code} - {r.text[:200]}")
        return r.status_code == 200

async def main():
    models = [
        "nvidia/nemotron-4-340b-instruct",
        "meta/llama-3.1-70b-instruct",
        "meta/llama-3.1-8b-instruct",
        "mistralai/mixtral-8x7b-instruct-v0.1",
    ]
    for m in models:
        await test_model(m)

asyncio.run(main())
