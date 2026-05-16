from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time
import hashlib
from backend.config import settings

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

# Simple token store (in production use JWT)
_tokens: dict = {}

@router.post("/login")
async def login(req: LoginRequest):
    if not req.email or len(req.password) < 6:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = hashlib.sha256(f"{req.email}{time.time()}{settings.SECRET_KEY}".encode()).hexdigest()
    _tokens[token] = {"email": req.email, "role": "admin", "name": "Admin User"}
    return {"token": token, "user": {"email": req.email, "name": "Admin User", "role": "admin"}}

@router.post("/logout")
async def logout():
    return {"success": True}

@router.get("/me")
async def get_me():
    return {"user": {"email": "admin@markly.ai", "name": "Admin User", "role": "admin", "permissions": ["*"]}}
