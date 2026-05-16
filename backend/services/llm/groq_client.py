import httpx

class GroqClient:
    BASE_URL = "https://api.groq.com/openai/v1"

    @staticmethod
    async def complete(model: str, prompt: str, api_key: str) -> dict:
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    f"{GroqClient.BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.7,
                        "max_tokens": 4096,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    tokens = data.get("usage", {}).get("total_tokens", 0)
                    return {"success": True, "content": content, "tokens_used": tokens}
                return {"success": False, "error": f"HTTP {resp.status_code}", "tokens_used": 0}
        except Exception as e:
            return {"success": False, "error": str(e), "tokens_used": 0}
