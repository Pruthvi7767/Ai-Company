import httpx
import time
from backend.config import settings
from backend.database import RedisClient

class INRConverter:
    """USD to INR conversion with live rate fetching and caching."""

    FALLBACK_RATE = 83.5
    _cache: dict = {"rate": FALLBACK_RATE, "fetched_at": 0}
    CACHE_TTL = 3600  # 1 hour

    @classmethod
    async def _get_live_rate(cls) -> float:
        """Fetch live USD/INR rate from OpenExchangeRates or fallback."""
        now = time.time()
        if now - cls._cache["fetched_at"] < cls.CACHE_TTL:
            return cls._cache["rate"]

        # Try Redis cache first
        redis = RedisClient()
        cached_rate = await redis.get("inr_rate")
        if cached_rate:
            rate = float(cached_rate)
            cls._cache = {"rate": rate, "fetched_at": now}
            return rate

        # Try live API
        if settings.OPENEXCHANGERATES_API_KEY and not settings.OPENEXCHANGERATES_API_KEY.startswith("local"):
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    resp = await client.get(
                        "https://openexchangerates.org/api/latest.json",
                        params={"app_id": settings.OPENEXCHANGERATES_API_KEY, "symbols": "INR"}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        rate = data["rates"]["INR"]
                        cls._cache = {"rate": rate, "fetched_at": now}
                        await redis.set("inr_rate", str(rate), ex=cls.CACHE_TTL)
                        return rate
            except Exception:
                pass  # Fall through to fallback

        # Use fallback rate
        return cls.FALLBACK_RATE

    @staticmethod
    async def usd_to_inr(usd: float) -> float:
        rate = await INRConverter._get_live_rate()
        return usd * rate

    @staticmethod
    async def inr_to_usd(inr: float) -> float:
        rate = await INRConverter._get_live_rate()
        return inr / rate

    @staticmethod
    async def get_current_rate() -> float:
        """Get the current cached or live rate."""
        return await INRConverter._get_live_rate()


class GSTCalculator:
    GST_RATE = 0.18

    @staticmethod
    def calculate_gst(amount_inr: float) -> float:
        return amount_inr * GSTCalculator.GST_RATE

    @staticmethod
    def calculate_tds(amount_inr: float, rate: float = 0.15) -> float:
        if amount_inr < 30000:
            return 0
        return amount_inr * rate
