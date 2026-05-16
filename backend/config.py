import os
import yaml
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

CONFIG_PATH = Path(__file__).parent.parent / "config.yaml"

def load_config():
    with open(CONFIG_PATH) as f:
        return yaml.safe_load(f)

config = load_config()

class Settings:
    NVIDIA_API_KEYS = [k.strip() for k in os.getenv("NVIDIA_API_KEYS", "").split(",") if k.strip()]
    GROQ_API_KEYS = [k.strip() for k in os.getenv("GROQ_API_KEYS", "").split(",") if k.strip()]
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
    MCP_BRONEW_URL = os.getenv("MCP_BRONEW_URL", "https://good90-bronew.hf.space/mcp")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    VAULT_ENCRYPTION_KEY = os.getenv("VAULT_ENCRYPTION_KEY", "dev-vault-key-change-in-production")
    MARKLY_VERSION = os.getenv("MARKLY_VERSION", "2.0.0")
    MARKLY_PAUSED = os.getenv("MARKLY_PAUSED", "false").lower() == "true"
    VITE_API_URL = os.getenv("VITE_API_URL", "http://localhost:8000")
    OPENEXCHANGERATES_API_KEY = os.getenv("OPENEXCHANGERATES_API_KEY", "")

settings = Settings()
