import httpx
import asyncio
import re
import sys
from backend.config import settings

# Fix Windows console encoding for Crawl4AI
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

class Crawl4AIScraper:
    """Layer 2: Headless browser scraping via Crawl4AI."""

    def __init__(self):
        self._crawl4ai_available = None

    async def _check_crawl4ai(self) -> bool:
        if self._crawl4ai_available is None:
            try:
                from crawl4ai import AsyncWebCrawler
                self._crawl4ai_available = True
            except ImportError:
                self._crawl4ai_available = False
        return self._crawl4ai_available

    async def scrape(self, url: str, js_wait: bool = False) -> dict:
        """Scrape a URL using Crawl4AI if available, else httpx fallback."""
        if await self._check_crawl4ai():
            return await self._scrape_with_crawl4ai(url, js_wait)
        return await self._scrape_with_httpx(url)

    async def _scrape_with_crawl4ai(self, url: str, js_wait: bool) -> dict:
        """Use actual Crawl4AI for headless browser scraping."""
        try:
            from crawl4ai import AsyncWebCrawler
            async with AsyncWebCrawler(verbose=False) as crawler:
                result = await crawler.arun(url=url, js_code=js_wait)
                if result and result.success:
                    return {
                        "success": True,
                        "content": result.markdown or result.cleaned_html or "",
                        "method": "crawl4ai",
                        "url": url,
                    }
                return {"success": False, "error": "Crawl4AI returned no content"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _scrape_with_httpx(self, url: str) -> dict:
        """Fallback: HTTP-only scraping with stealth headers."""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(url, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "text/html,application/xhtml+xml",
                })
                if resp.status_code == 200:
                    # Use UTF-8 encoding with fallback
                    try:
                        text = resp.text
                    except Exception:
                        text = resp.content.decode('utf-8', errors='replace')
                    text = re.sub(r'<[^>]+>', ' ', text)
                    text = re.sub(r'\s+', ' ', text).strip()
                    return {"success": True, "content": text[:10000], "method": "httpx", "url": url}
                return {"success": False, "error": f"HTTP {resp.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def scrape_multiple(self, urls: list) -> list:
        """Scrape multiple URLs concurrently."""
        tasks = [self.scrape(url) for url in urls]
        return await asyncio.gather(*tasks)
