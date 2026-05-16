from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient
import os
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

    soul_path = os.path.join("backend", "agents", "souls", f"{req.agent_id.lower()}.md")
    try:
        with open(soul_path, encoding="utf-8") as f:
            soul = f.read()
    except FileNotFoundError:
        soul = f"You are the {req.agent_id.upper()} agent of Markly."

    from backend.services.llm.model_selector import ModelSelector
    tier = "csuite" if req.agent_id.lower() in ["ceo", "cto", "cfo", "cmo", "coo", "cso", "cao"] else "manager"
    result = await ModelSelector.complete(
        agent_id=req.agent_id,
        tier=tier,
        prompt=f"{soul}\n\nUser: {req.text}\n\nRespond as {req.agent_id.upper()} agent. Be concise and professional."
    )

    response_text = result.get("content") or result.get("response") or result.get("error") or "I'm processing your request."
    if isinstance(response_text, dict):
        response_text = str(response_text)

    reply_id = f"msg_{int(time.time())}_reply"
    await db.insert("comms_messages", {
        "id": reply_id,
        "thread_id": req.agent_id,
        "sender": "agent",
        "text": response_text,
    })

    return {
        "id": reply_id,
        "user_msg_id": msg_id,
        "response": response_text,
        "status": "replied",
        "model": result.get("model"),
        "provider": result.get("provider"),
        "tokens_used": result.get("tokens_used", 0),
    }

@router.websocket("/ws/chat/{agent_id}")
async def websocket_chat(websocket: WebSocket, agent_id: str):
    await websocket.accept()
    db = SupabaseClient()
    soul_path = os.path.join("backend", "agents", "souls", f"{agent_id.lower()}.md")
    try:
        with open(soul_path, encoding="utf-8") as f:
            soul = f.read()
    except FileNotFoundError:
        soul = f"You are the {agent_id.upper()} agent of Markly, an autonomous AI company."

    try:
        while True:
            data = await websocket.receive_text()
            msg_id = f"msg_{int(time.time())}"
            await db.insert("comms_messages", {
                "id": msg_id,
                "thread_id": agent_id,
                "sender": "user",
                "text": data,
            })

            await websocket.send_json({"type": "typing", "agent_id": agent_id})

            from backend.services.llm.model_selector import ModelSelector
            tier = "csuite" if agent_id.lower() in ["ceo", "cto", "cfo", "cmo", "coo", "cso", "cao"] else "manager"
            result = await ModelSelector.complete(
                agent_id=agent_id,
                tier=tier,
                prompt=f"{soul}\n\nUser message: {data}\n\nReply as {agent_id.upper()} agent. Be concise and professional."
            )

            response_text = result.get("content") or result.get("response") or result.get("error") or "I'm processing your request."
            if isinstance(response_text, dict):
                response_text = str(response_text)

            reply_id = f"msg_{int(time.time())}_reply"
            await db.insert("comms_messages", {
                "id": reply_id,
                "thread_id": agent_id,
                "sender": "agent",
                "text": response_text,
            })

            await websocket.send_json({
                "id": reply_id,
                "agent_id": agent_id,
                "text": response_text,
                "sender": "agent",
                "model": result.get("model", "unknown"),
                "provider": result.get("provider", "unknown"),
                "tokens": result.get("tokens_used", 0),
            })
    except WebSocketDisconnect:
        pass
