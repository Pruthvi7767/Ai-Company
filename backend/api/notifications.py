from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
import asyncio
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
    db = SupabaseClient()
    last_count = -1
    try:
        while True:
            notifs = await db.select("notifications", {"read": False}, limit=5)
            if len(notifs) != last_count:
                last_count = len(notifs)
                await websocket.send_json({
                    "type": "notification_update",
                    "unread_count": last_count,
                    "latest": notifs[:3] if notifs else [],
                })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        pass
