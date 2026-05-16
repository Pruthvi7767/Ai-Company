from backend.config import settings

TIER_MODELS = {
    "csuite": {
        "nvidia": "meta/llama-3.1-70b-instruct",
        "groq": "llama-3.3-70b-versatile",
    },
    "manager": {
        "nvidia": "meta/llama-3.1-70b-instruct",
        "groq": "llama-3.3-70b-versatile",
    },
    "worker": {
        "nvidia": "meta/llama-3.1-8b-instruct",
        "groq": "llama-3.1-8b-instant",
    },
    "research": {
        "nvidia": "mistralai/mixtral-8x7b-instruct-v0.1",
        "groq": "llama-3.1-8b-instant",
    },
}

class ModelSelector:
    @staticmethod
    def get_model(tier: str) -> dict:
        return TIER_MODELS.get(tier, TIER_MODELS["worker"])

    @staticmethod
    async def complete(agent_id: str, tier: str, prompt: str) -> dict:
        model_config = ModelSelector.get_model(tier)

        for key in settings.NVIDIA_API_KEYS:
            try:
                from backend.services.llm.nvidia_client import NVIDIAClient
                result = await NVIDIAClient.complete(model_config["nvidia"], prompt, key)
                if result.get("success"):
                    result["model"] = model_config["nvidia"]
                    result["provider"] = "nvidia"
                    result["tier"] = tier
                    return result
            except Exception:
                continue

        for key in settings.GROQ_API_KEYS:
            try:
                from backend.services.llm.groq_client import GroqClient
                result = await GroqClient.complete(model_config["groq"], prompt, key)
                if result.get("success"):
                    result["model"] = model_config["groq"]
                    result["provider"] = "groq"
                    result["tier"] = tier
                    return result
            except Exception:
                continue

        from backend.services.telegram.bot import TelegramBot
        try:
            await TelegramBot.send_alert(
                f"All LLM providers exhausted for agent {agent_id} (tier: {tier})"
            )
        except Exception:
            pass

        return {"success": False, "error": "All LLM providers exhausted", "tokens_used": 0}
