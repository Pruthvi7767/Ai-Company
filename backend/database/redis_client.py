import os
import json
import asyncio
from typing import Any, Optional

try:
    import redis
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False

class RedisClient:
    """Redis client with in-memory fallback."""

    _shared_memory: dict = {}
    _shared_pubsub_channels: dict = {}

    def __init__(self):
        self.url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self._client = None
        self._connect()

    def _connect(self):
        if HAS_REDIS:
            try:
                self._client = redis.from_url(self.url, decode_responses=True)
                self._client.ping()
                return
            except Exception:
                pass
        self._client = None

    def _get(self, key: str) -> Optional[str]:
        if self._client:
            return self._client.get(key)
        return self._shared_memory.get(key)

    def _set(self, key: str, value: str, ex: int = None):
        if self._client:
            if ex:
                self._client.setex(key, ex, value)
            else:
                self._client.set(key, value)
        else:
            self._shared_memory[key] = value

    async def get(self, key: str) -> Optional[str]:
        return self._get(key)

    async def set(self, key: str, value: str, ex: int = None):
        self._set(key, value, ex)

    async def setex(self, key: str, ttl: int, value: str):
        self._set(key, value, ttl)

    async def delete(self, key: str):
        if self._client:
            self._client.delete(key)
        self._shared_memory.pop(key, None)

    async def keys(self, pattern: str) -> list:
        if self._client:
            return self._client.keys(pattern)
        import fnmatch
        return [k for k in self._shared_memory if fnmatch.fnmatch(k, pattern)]

    async def publish(self, channel: str, message: str):
        if self._client:
            self._client.publish(channel, message)
        if channel in self._shared_pubsub_channels:
            for cb in self._shared_pubsub_channels[channel]:
                asyncio.create_task(cb(message))

    async def subscribe(self, channel: str, callback):
        if channel not in self._shared_pubsub_channels:
            self._shared_pubsub_channels[channel] = []
        self._shared_pubsub_channels[channel].append(callback)

    async def hset(self, key: str, field: str, value: str):
        if self._client:
            self._client.hset(key, field, value)
        else:
            if key not in self._shared_memory:
                self._shared_memory[key] = {}
            self._shared_memory[key][field] = value

    async def hget(self, key: str, field: str) -> Optional[str]:
        if self._client:
            return self._client.hget(key, field)
        return self._shared_memory.get(key, {}).get(field)

    async def hgetall(self, key: str) -> dict:
        if self._client:
            return self._client.hgetall(key)
        return self._shared_memory.get(key, {})

    async def lpush(self, key: str, value: str):
        if self._client:
            self._client.lpush(key, value)
        else:
            if key not in self._shared_memory:
                self._shared_memory[key] = []
            self._shared_memory[key].insert(0, value)

    async def lrange(self, key: str, start: int, end: int) -> list:
        if self._client:
            return self._client.lrange(key, start, end)
        return self._shared_memory.get(key, [])[start:end+1 if end >= 0 else None]

    async def ping(self) -> bool:
        if self._client:
            try:
                return self._client.ping()
            except Exception:
                return False
        return True
