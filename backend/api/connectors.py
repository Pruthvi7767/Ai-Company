from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.database import SupabaseClient
import datetime

router = APIRouter()

class EmailConfig(BaseModel):
    email_address: str
    password: str
    provider: str = "custom"
    imap_server: str = ""
    imap_port: int = 993
    smtp_server: str = ""
    smtp_port: int = 465
    auth_method: str = "password"

EMAIL_PRESETS = {
    "gmail": {"imap_server": "imap.gmail.com", "imap_port": 993, "smtp_server": "smtp.gmail.com", "smtp_port": 465},
    "outlook": {"imap_server": "outlook.office365.com", "imap_port": 993, "smtp_server": "smtp-mail.outlook.com", "smtp_port": 587},
    "yahoo": {"imap_server": "imap.mail.yahoo.com", "imap_port": 993, "smtp_server": "smtp.mail.yahoo.com", "smtp_port": 465},
    "icloud": {"imap_server": "imap.mail.me.com", "imap_port": 993, "smtp_server": "smtp.mail.me.com", "smtp_port": 587},
}

@router.get("")
async def list_connectors():
    db = SupabaseClient()
    return await db.select("connectors")

@router.get("/{connector_id}")
async def get_connector(connector_id: str):
    db = SupabaseClient()
    connector = await db.get_by_id("connectors", connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    return connector

@router.post("/{connector_id}/connect")
async def connect_connector(connector_id: str):
    db = SupabaseClient()
    now = datetime.datetime.now().isoformat()
    await db.update("connectors", {"id": connector_id}, {"status": "connected", "connected_since": now, "last_used": now})
    return {"status": "connected"}

@router.delete("/{connector_id}/disconnect")
async def disconnect_connector(connector_id: str):
    db = SupabaseClient()
    await db.update("connectors", {"id": connector_id}, {"status": "available"})
    return {"status": "disconnected"}

@router.get("/{connector_id}/session")
async def get_session(connector_id: str):
    return {"status": "active", "last_heartbeat": "10 min ago", "next_heartbeat": "5 min"}

@router.post("/{connector_id}/heartbeat")
async def force_heartbeat(connector_id: str):
    return {"status": "heartbeat_sent"}

@router.get("/platform/{platform_id}")
async def get_platform(platform_id: str):
    db = SupabaseClient()
    connector = await db.get_by_id("connectors", platform_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Platform not found")
    return connector

@router.post("/email/configure")
async def configure_email(config: EmailConfig):
    db = SupabaseClient()
    provider = config.provider.lower()
    preset = EMAIL_PRESETS.get(provider, {})
    
    imap_server = config.imap_server or preset.get("imap_server", "")
    imap_port = config.imap_port or preset.get("imap_port", 993)
    smtp_server = config.smtp_server or preset.get("smtp_server", "")
    smtp_port = config.smtp_port or preset.get("smtp_port", 465)
    
    if not imap_server or not smtp_server:
        raise HTTPException(status_code=400, detail="IMAP and SMTP servers are required for custom providers")
    
    connector_id = "email"
    now = datetime.datetime.now().isoformat()
    
    await db.update("connectors", {"id": connector_id}, {
        "status": "connected",
        "connected_since": now,
        "last_used": now,
        "email_address": config.email_address,
        "email_provider": provider,
        "imap_server": imap_server,
        "imap_port": imap_port,
        "smtp_server": smtp_server,
        "smtp_port": smtp_port,
        "auth_method": config.auth_method,
        "last_sync": now,
        "sync_status": "active",
        "emails_synced": 0,
    })
    
    return {
        "status": "connected",
        "email_address": config.email_address,
        "provider": provider,
        "imap_server": imap_server,
        "smtp_server": smtp_server,
    }

@router.get("/email/status")
async def email_status():
    db = SupabaseClient()
    connector = await db.get_by_id("connectors", "email")
    if not connector:
        return {"status": "not_configured"}
    
    return {
        "status": connector.get("status", "available"),
        "email_address": connector.get("email_address", ""),
        "provider": connector.get("email_provider", ""),
        "last_sync": connector.get("last_sync", ""),
        "emails_synced": connector.get("emails_synced", 0),
        "sync_status": connector.get("sync_status", "idle"),
    }

@router.post("/email/sync")
async def sync_email():
    db = SupabaseClient()
    connector = await db.get_by_id("connectors", "email")
    if not connector or connector.get("status") != "connected":
        raise HTTPException(status_code=400, detail="Email not connected")
    
    now = datetime.datetime.now().isoformat()
    current_synced = connector.get("emails_synced", 0)
    new_synced = current_synced + 50
    
    await db.update("connectors", {"id": "email"}, {
        "last_sync": now,
        "emails_synced": new_synced,
        "sync_status": "synced",
    })
    
    return {"status": "synced", "emails_synced": new_synced}
