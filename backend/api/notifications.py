from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient

router = APIRouter()

class ReadRequest(BaseModel):
    pass

@router.get("")
async def list_notifications():
    db = SupabaseClient()
    return await db.select("notifications")

@router.patch("/{notif_id}/read")
async def mark_read(notif_id: str):
    db = SupabaseClient()
    await db.update("notifications", {"id": notif_id}, {"read": 1})
    return {"id": notif_id, "read": True}

@router.post("/read-all")
async def mark_all_read():
    db = SupabaseClient()
    notifs = await db.select("notifications", {"read": 0})
    for n in notifs:
        await db.update("notifications", {"id": n["id"]}, {"read": 1})
    return {"marked": len(notifs)}

@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
