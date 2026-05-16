import time
from typing import Optional

class CredentialPool:
    """Manages API key pools with rate limit tracking and automatic rotation."""

    _rate_limited: dict = {}  # key -> timestamp when rate limited
    _rate_limit_cooldown = 300  # 5 minutes before retrying a rate-limited key

    @staticmethod
    def get_keys(provider: str) -> list:
        """Get available keys for a provider, filtering out rate-limited ones."""
        from backend.config import settings
        if provider == "NVIDIA":
            all_keys = settings.NVIDIA_API_KEYS
        else:
            all_keys = settings.GROQ_API_KEYS

        now = time.time()
        available = []
        for key in all_keys:
            limited_at = CredentialPool._rate_limited.get(key)
            if limited_at and (now - limited_at) < CredentialPool._rate_limit_cooldown:
                continue  # Still in cooldown
            elif limited_at:
                # Cooldown expired, remove from rate-limited set
                del CredentialPool._rate_limited[key]
            available.append(key)

        # If all keys are rate-limited, clear and return all (desperate mode)
        if not available:
            CredentialPool._rate_limited.clear()
            return all_keys

        return available

    @staticmethod
    def mark_rate_limited(provider: str, key: str):
        """Mark a key as rate-limited with current timestamp."""
        CredentialPool._rate_limited[key] = time.time()

    @staticmethod
    def get_next_key(provider: str, current_key: Optional[str] = None) -> Optional[str]:
        """Get the next available key after the current one (rotation)."""
        keys = CredentialPool.get_keys(provider)
        if not keys:
            return None
        if current_key is None:
            return keys[0]
        try:
            idx = keys.index(current_key)
            return keys[(idx + 1) % len(keys)]
        except ValueError:
            return keys[0]

    @staticmethod
    def get_stats() -> dict:
        """Get pool statistics."""
        from backend.config import settings
        now = time.time()
        nvidia_active = sum(1 for k in settings.NVIDIA_API_KEYS
                           if k not in CredentialPool._rate_limited
                           or (now - CredentialPool._rate_limited.get(k, 0)) > CredentialPool._rate_limit_cooldown)
        groq_active = sum(1 for k in settings.GROQ_API_KEYS
                         if k not in CredentialPool._rate_limited
                         or (now - CredentialPool._rate_limited.get(k, 0)) > CredentialPool._rate_limit_cooldown)
        return {
            "nvidia_total": len(settings.NVIDIA_API_KEYS),
            "nvidia_active": nvidia_active,
            "groq_total": len(settings.GROQ_API_KEYS),
            "groq_active": groq_active,
            "rate_limited_count": len(CredentialPool._rate_limited),
        }
