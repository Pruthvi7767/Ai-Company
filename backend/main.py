import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.config import settings
from backend.api import auth, dashboard, agents, comms, earnings, income_streams
from backend.api import connectors, business, approvals, board_meetings, knowledge
from backend.api import capabilities, content, analytics, system, errors, audit_log
from backend.api import notifications, settings as settings_api, browser, hire_fire, websocket

app = FastAPI(title="Markly", version=settings.MARKLY_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(comms.router, prefix="/api/comms", tags=["comms"])
app.include_router(earnings.router, prefix="/api/earnings", tags=["earnings"])
app.include_router(income_streams.router, prefix="/api/income-streams", tags=["income-streams"])
app.include_router(connectors.router, prefix="/api/connectors", tags=["connectors"])
app.include_router(business.router, prefix="/api/business", tags=["business"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["approvals"])
app.include_router(board_meetings.router, prefix="/api/board-meetings", tags=["board-meetings"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["knowledge"])
app.include_router(capabilities.router, prefix="/api/capabilities", tags=["capabilities"])
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(system.router, prefix="/api/system", tags=["system"])
app.include_router(errors.router, prefix="/api/errors", tags=["errors"])
app.include_router(audit_log.router, prefix="/api/audit-log", tags=["audit-log"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(settings_api.router, prefix="/api/settings", tags=["settings"])
app.include_router(browser.router, prefix="/api/browser", tags=["browser"])
app.include_router(hire_fire.router, prefix="/api/hire-fire", tags=["hire-fire"])
app.include_router(websocket.router, tags=["websocket"])

@app.on_event("startup")
async def startup_event():
    import asyncio
    from backend.database.redis_client import RedisClient
    redis = RedisClient()
    import time
    await redis.set("markly_start_time", str(time.time()))
    print(f"Markly v{settings.MARKLY_VERSION} startup event fired")

@app.get("/")
async def root():
    return {"name": "Markly", "version": settings.MARKLY_VERSION, "status": "online"}

@app.get("/health")
async def health():
    from backend.database import RedisClient
    redis = RedisClient()
    csuite_keys = await redis.keys("agent:alive:csuite:*")
    dept_keys = await redis.keys("agent:alive:dept:*")
    agents_alive = len(csuite_keys) + len(dept_keys)
    return {"status": "ok", "version": settings.MARKLY_VERSION, "agents_alive": agents_alive}

class LLMTestRequest(BaseModel):
    tier: str = "csuite"
    prompt: str = "What is 2+2? Reply in one word."

@app.post("/api/test/llm")
async def test_llm(req: LLMTestRequest):
    from backend.services.llm.model_selector import ModelSelector
    result = await ModelSelector.complete(
        agent_id="test",
        tier=req.tier,
        prompt=req.prompt
    )
    return result
