import httpx
import asyncio

async def test_groq_models():
    key = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")
    models = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
        "llama3-70b-8192",
    ]
    for m in models:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={"model": m, "messages": [{"role": "user", "content": "Say hello"}], "max_tokens": 10},
            )
            print(f"  {m}: {r.status_code}")

asyncio.run(test_groq_models())
