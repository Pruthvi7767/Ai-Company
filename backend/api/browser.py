from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from backend.database import RedisClient
from backend.services.mcp.mcp_client import ScrapingOrchestrator
import json

router = APIRouter()

class MCPTestRequest(BaseModel):
    url: str = "https://trends.google.com"

@router.get("/mcp/status")
async def mcp_status():
    redis = RedisClient()
    tabs = []
    for i in range(5):
        tab_data = await redis.get(f"mcp:tab:{i}")
        if tab_data:
            tabs.append(json.loads(tab_data))
        else:
            tabs.append({"tab_id": i, "url": None, "agent": None, "status": "idle"})
    return {"tabs": tabs, "connected": True}

@router.post("/mcp/test")
async def mcp_test(req: MCPTestRequest):
    orchestrator = ScrapingOrchestrator()
    result = await orchestrator.scrape(req.url, agent_id="test")
    return {
        "success": result.get("success", False),
        "method": result.get("method", "unknown"),
        "content_length": len(result.get("content", "")),
        "error": result.get("error"),
    }

@router.get("/sessions")
async def list_sessions():
    return {"sessions": []}

@router.post("/sessions/{session_id}/heartbeat")
async def force_session_heartbeat(session_id: str):
    return {"status": "heartbeat_sent"}

@router.websocket("/ws/browser-screenshot")
async def websocket_browser(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
