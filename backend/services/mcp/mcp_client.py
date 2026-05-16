import asyncio
import aiohttp
import json
from backend.config import settings
from backend.database import RedisClient

class MCPBrowser:
    MCP_URL = settings.MCP_BRONEW_URL
    MAX_TABS = 5
    TIMEOUT = 10

    def __init__(self):
        self.active_tabs: dict = {}
        self.session: aiohttp.ClientSession = None
        self.connected = False

    async def connect(self) -> bool:
        try:
            self.session = aiohttp.ClientSession()
            async with self.session.get(self.MCP_URL, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status in (200, 404, 405):
                    self.connected = True
                    return True
            return False
        except Exception:
            return False

    async def open_tab(self, url: str, agent_id: str) -> dict:
        if len(self.active_tabs) >= self.MAX_TABS:
            return {"success": False, "reason": "all_tabs_busy"}
        try:
            if self.session and self.connected:
                try:
                    payload = {"tool": "browser_navigate", "arguments": {"url": url}}
                    async with self.session.post(
                        f"{self.MCP_URL}/tools/call",
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as resp:
                        if resp.status == 200:
                            result = await resp.json()
                            tab_id = result.get("tab_id", len(self.active_tabs))
                        else:
                            tab_id = len(self.active_tabs)
                except Exception:
                    tab_id = len(self.active_tabs)
            else:
                tab_id = len(self.active_tabs)

            self.active_tabs[tab_id] = {"url": url, "agent": agent_id, "status": "active"}
            redis = RedisClient()
            await redis.set(f"mcp:tab:{tab_id}", json.dumps(self.active_tabs[tab_id]), ex=3600)
            return {"success": True, "tab_id": tab_id}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def extract_text(self, tab_id: int) -> dict:
        if tab_id not in self.active_tabs:
            return {"success": False, "error": "tab_not_found"}
        try:
            if self.session and self.connected:
                payload = {"tool": "browser_extract_text", "arguments": {"tab_id": tab_id}}
                async with self.session.post(
                    f"{self.MCP_URL}/tools/call",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as resp:
                    if resp.status == 200:
                        result = await resp.json()
                        return {"success": True, "content": result.get("text", "")}
            return {"success": False, "error": "extraction_failed"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def close_tab(self, tab_id: int):
        if tab_id in self.active_tabs:
            try:
                if self.session and self.connected:
                    payload = {"tool": "browser_close", "arguments": {"tab_id": tab_id}}
                    async with self.session.post(
                        f"{self.MCP_URL}/tools/call",
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=10)
                    ) as resp:
                        pass
            except Exception:
                pass
            del self.active_tabs[tab_id]
            redis = RedisClient()
            await redis.delete(f"mcp:tab:{tab_id}")

    async def get_tab_status(self) -> list:
        tabs = []
        for i in range(self.MAX_TABS):
            redis = RedisClient()
            tab_data = await redis.get(f"mcp:tab:{i}")
            if tab_data:
                tabs.append(json.loads(tab_data))
            else:
                tabs.append({"tab_id": i, "url": None, "agent": None, "status": "idle"})
        return tabs


class ScrapingOrchestrator:
    """
    3-layer scraping with automatic fallback.
    Always try Layer 1 (MCP) -> Layer 2 (Crawl4AI) -> Layer 3 (Playwright Firefox).
    """

    def __init__(self):
        self.mcp = MCPBrowser()
        self.crawl4ai = None
        self.playwright = None

    async def _get_crawl4ai(self):
        if self.crawl4ai is None:
            from backend.services.scraping.crawl4ai_scraper import Crawl4AIScraper
            self.crawl4ai = Crawl4AIScraper()
        return self.crawl4ai

    async def _get_playwright(self):
        if self.playwright is None:
            from backend.services.scraping.playwright_firefox import PlaywrightFirefoxScraper
            self.playwright = PlaywrightFirefoxScraper()
        return self.playwright

    async def scrape(self, url: str, agent_id: str = "system", task: str = "") -> dict:
        result = await self._try_mcp(url, agent_id)
        if result["success"]:
            return result

        await self._alert_failure("MCP", url)

        result = await self._try_crawl4ai(url)
        if result["success"]:
            return result

        await self._alert_failure("Crawl4AI", url)

        result = await self._try_playwright(url)
        if result["success"]:
            return result

        await self._alert_failure("ALL_SCRAPERS", url)
        return {"success": False, "error": "all_scrapers_failed", "url": url}

    async def _try_mcp(self, url: str, agent_id: str) -> dict:
        try:
            tab = await self.mcp.open_tab(url, agent_id)
            if not tab.get("success"):
                return {"success": False, "method": "mcp"}
            content_result = await self.mcp.extract_text(tab["tab_id"])
            await self.mcp.close_tab(tab["tab_id"])
            if content_result.get("success"):
                return {"success": True, "content": content_result.get("content", ""), "method": "mcp"}
            return {"success": False, "method": "mcp"}
        except Exception:
            return {"success": False, "method": "mcp"}

    async def _try_crawl4ai(self, url: str) -> dict:
        try:
            crawler = await self._get_crawl4ai()
            result = await crawler.scrape(url)
            if result.get("success"):
                return {"success": True, "content": result.get("content", ""), "method": "crawl4ai"}
            return {"success": False, "method": "crawl4ai"}
        except Exception:
            return {"success": False, "method": "crawl4ai"}

    async def _try_playwright(self, url: str) -> dict:
        try:
            scraper = await self._get_playwright()
            result = await scraper.scrape(url)
            if result.get("success"):
                return {"success": True, "content": result.get("content", ""), "method": "playwright_firefox"}
            return {"success": False, "method": "playwright_firefox", "error": "all_scrapers_failed"}
        except Exception as e:
            return {"success": False, "method": "playwright_firefox", "error": str(e)}

    async def _alert_failure(self, layer: str, url: str):
        """Send Telegram alert when a scraping layer fails."""
        try:
            from backend.services.telegram.bot import TelegramBot
            await TelegramBot.send_alert(
                f"Scraping layer failed: {layer}\nURL: {url}"
            )
        except Exception:
            pass
