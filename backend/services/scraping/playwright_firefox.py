import httpx
import re
import json
import sys
from backend.config import settings
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

SESSION_DIR = Path(__file__).parent.parent.parent.parent / "data" / "browser_sessions"
SESSION_DIR.mkdir(exist_ok=True)

class PlaywrightFirefoxScraper:
    """Layer 3: Full browser automation with Firefox fallback."""

    def __init__(self):
        self._playwright_available = None

    async def _check_playwright(self) -> bool:
        if self._playwright_available is None:
            try:
                from playwright.async_api import async_playwright
                self._playwright_available = True
            except ImportError:
                self._playwright_available = False
        return self._playwright_available

    async def scrape(self, url: str) -> dict:
        """Scrape a URL using Playwright Firefox if available, else httpx fallback."""
        if await self._check_playwright():
            result = await self._scrape_with_playwright(url)
            if result.get("success"):
                return result
            # Playwright failed (e.g., browser not installed), fall back to httpx
        return await self._scrape_with_httpx(url)

    async def _scrape_with_playwright(self, url: str) -> dict:
        """Use actual Playwright + Firefox for full browser automation."""
        try:
            from playwright.async_api import async_playwright
            async with async_playwright() as pw:
                browser = await pw.firefox.launch(headless=True, args=["--no-sandbox"])
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
                    viewport={"width": 1280, "height": 720},
                )
                page = await context.new_page()
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                content = await page.content()
                text = re.sub(r'<[^>]+>', ' ', content)
                text = re.sub(r'\s+', ' ', text).strip()
                await browser.close()
                return {"success": True, "content": text[:10000], "method": "playwright_firefox"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _scrape_with_httpx(self, url: str) -> dict:
        """Fallback: HTTP-only scraping with Firefox user agent."""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(url, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
                })
                if resp.status_code == 200:
                    text = re.sub(r'<[^>]+>', ' ', resp.text)
                    text = re.sub(r'\s+', ' ', text).strip()
                    return {"success": True, "content": text[:10000], "method": "playwright_firefox"}
                return {"success": False, "error": f"HTTP {resp.status_code}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def login(self, url: str, credentials: dict) -> dict:
        """Login to a platform and save session cookies."""
        if not await self._check_playwright():
            return {"success": False, "error": "Playwright not installed, login requires browser"}

        try:
            from playwright.async_api import async_playwright
            async with async_playwright() as pw:
                browser = await pw.firefox.launch(headless=True, args=["--no-sandbox"])
                context = await browser.new_context()
                page = await context.new_page()
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)

                # Fill login form
                username_field = credentials.get("username_field", "input[name='username']")
                password_field = credentials.get("password_field", "input[name='password']")
                submit_button = credentials.get("submit_field", "button[type='submit']")

                await page.fill(username_field, credentials["username"])
                await page.fill(password_field, credentials["password"])
                await page.click(submit_button)
                await page.wait_for_load_state("networkidle", timeout=15000)

                # Extract cookies
                cookies = await context.cookies()
                session_data = {
                    "cookies": cookies,
                    "url": page.url,
                    "title": await page.title(),
                }

                # Save session to disk
                session_file = SESSION_DIR / f"session_{credentials.get('platform_id', 'unknown')}.json"
                with open(session_file, 'w') as f:
                    json.dump(session_data, f)

                await browser.close()
                return {"success": True, "cookies": cookies, "session_file": str(session_file)}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_session_cookies(self, platform_id: str) -> dict:
        """Load saved session cookies for a platform."""
        session_file = SESSION_DIR / f"session_{platform_id}.json"
        if session_file.exists():
            with open(session_file, 'r') as f:
                return json.load(f)
        return {}
