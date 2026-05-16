from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient
from backend.config import settings

router = APIRouter()

class SettingsUpdate(BaseModel):
    key: Optional[str] = None
    value: Optional[dict] = None

class TelegramUpdate(BaseModel):
    bot_token: Optional[str] = None
    chat_id: Optional[str] = None

class LLMUpdate(BaseModel):
    primary_model: Optional[str] = None
    fallback_model: Optional[str] = None

@router.get("")
async def get_settings():
    db = SupabaseClient()
    all_settings = await db.select("settings")
    result = {"version": settings.MARKLY_VERSION, "paused": settings.MARKLY_PAUSED}
    for s in all_settings:
        result[s["key"]] = s.get("value")
    return result

@router.patch("")
async def update_settings(data: SettingsUpdate):
    db = SupabaseClient()
    if data.key:
        import json
        await db.update("settings", {"key": data.key}, {"value": json.dumps(data.value)})
    return {"updated": True}

@router.get("/telegram")
async def get_telegram():
    return {"bot_token": "***" + settings.TELEGRAM_BOT_TOKEN[-4:] if settings.TELEGRAM_BOT_TOKEN else "", "chat_id": settings.TELEGRAM_CHAT_ID}

@router.patch("/telegram")
async def update_telegram(data: TelegramUpdate):
    return {"updated": True}

@router.post("/test-telegram")
async def test_telegram():
    return {"sent": True, "message": "Test message from Markly"}

@router.get("/llm")
async def get_llm():
    return {
        "nvidia_models": ["nvidia/nemotron-4-340b-instruct", "meta/llama-3.1-70b-instruct", "meta/llama-3.1-8b-instruct"],
        "groq_models": ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
        "current_primary": "nvidia/nemotron-4-340b-instruct",
        "current_fallback": "llama-3.1-70b-versatile",
    }

@router.patch("/llm")
async def update_llm(data: LLMUpdate):
    return {"updated": True}
