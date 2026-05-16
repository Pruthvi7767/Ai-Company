from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient
import time

router = APIRouter()

class MessageRequest(BaseModel):
    agent_id: str
    text: str

@router.get("/threads")
async def get_threads():
    db = SupabaseClient()
    return await db.select("comms_threads")

@router.get("/threads/{agent_id}")
async def get_thread(agent_id: str):
    db = SupabaseClient()
    threads = await db.select("comms_threads", {"agent_id": agent_id})
    if threads:
        return await db.select("comms_messages", {"thread_id": threads[0]["id"]})
    return []

@router.post("/message")
async def send_message(req: MessageRequest):
    db = SupabaseClient()
    msg_id = f"msg_{int(time.time())}"
    await db.insert("comms_messages", {
        "id": msg_id,
        "thread_id": req.agent_id,
        "sender": "user",
        "text": req.text,
    })
    return {"id": msg_id, "status": "sent"}

@router.websocket("/ws/chat/{agent_id}")
async def websocket_chat(websocket: WebSocket, agent_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            response = f"Agent {agent_id} received: {data}"
            await websocket.send_json({"agent_id": agent_id, "text": response, "sender": "agent"})
    except WebSocketDisconnect:
        pass
