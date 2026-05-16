from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import asyncio
import psutil
import time
from backend.database import RedisClient

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)

    async def broadcast(self, channel: str, message: dict):
        if channel in self.active_connections:
            dead = set()
            for conn in self.active_connections[channel]:
                try:
                    await conn.send_json(message)
                except Exception:
                    dead.add(conn)
            for d in dead:
                self.active_connections[channel].discard(d)

manager = ConnectionManager()

@router.websocket("/ws/activity")
async def websocket_activity(websocket: WebSocket):
    await manager.connect(websocket, "activity")
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "activity")

@router.websocket("/ws/agent-events")
async def websocket_agent_events(websocket: WebSocket):
    await manager.connect(websocket, "agent-events")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "agent-events")

@router.websocket("/ws/system/health")
async def websocket_system_health(websocket: WebSocket):
    await manager.connect(websocket, "system-health")
    try:
        while True:
            redis = RedisClient()
            csuite_keys = await redis.keys("agent:alive:csuite:*")
            dept_keys = await redis.keys("agent:alive:dept:*")
            ram = psutil.virtual_memory()

            await websocket.send_json({
                "type": "system_health",
                "ram_used_mb": round(ram.used / 1024 / 1024, 1),
                "ram_pct": round(ram.percent, 1),
                "cpu_pct": psutil.cpu_percent(),
                "agents_alive": len(csuite_keys) + len(dept_keys),
                "timestamp": time.time(),
            })
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket, "system-health")

@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await manager.connect(websocket, "notifications")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, "notifications")
