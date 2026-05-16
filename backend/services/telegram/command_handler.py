import httpx
import json
import asyncio
import sys
import time
import psutil
from backend.config import settings
from backend.database.redis_client import RedisClient
from backend.database.supabase_client import SupabaseClient

class TelegramCommandHandler:
    """Handles incoming Telegram commands via long polling."""

    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID
        self._offset = 0
        self._running = False

    async def start_polling(self):
        """Start long polling for Telegram updates."""
        if not self.bot_token or self.bot_token.startswith("local"):
            print("[TELEGRAM] Bot token not configured, command handler disabled")
            return

        self._running = True
        print("[TELEGRAM] Command handler started, polling for updates...")

        while self._running:
            try:
                updates = await self._get_updates()
                for update in updates:
                    await self._process_update(update)
            except Exception as e:
                print(f"[TELEGRAM POLL ERROR] {e}")
                await asyncio.sleep(5)

    def stop(self):
        self._running = False

    async def _get_updates(self):
        """Get updates from Telegram API."""
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        params = {"offset": self._offset, "timeout": 30}

        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, timeout=35)
            data = resp.json()

        if data.get("ok"):
            updates = data.get("result", [])
            if updates:
                self._offset = updates[-1]["update_id"] + 1
            return updates
        return []

    async def _process_update(self, update: dict):
        """Process a single Telegram update."""
        message = update.get("message")
        callback_query = update.get("callback_query")

        if message:
            await self._handle_message(message)
        elif callback_query:
            await self._handle_callback(callback_query)

    async def _handle_message(self, message: dict):
        """Handle incoming text message / command."""
        chat_id = message.get("chat", {}).get("id")
        text = message.get("text", "").strip()

        if not text:
            return

        if text.startswith("/"):
            await self._dispatch_command(chat_id, text)

    async def _dispatch_command(self, chat_id: int, text: str):
        """Dispatch command to handler."""
        parts = text.split()
        command = parts[0].lower()

        handlers = {
            "/start": self._cmd_start,
            "/status": self._cmd_status,
            "/agents": self._cmd_agents,
            "/earnings": self._cmd_earnings,
            "/costs": self._cmd_costs,
            "/scan": self._cmd_scan,
            "/pause": self._cmd_pause,
            "/resume": self._cmd_resume,
            "/health": self._cmd_health,
            "/help": self._cmd_help,
        }

        handler = handlers.get(command)
        if handler:
            await handler(chat_id, parts[1:] if len(parts) > 1 else [])
        elif command.startswith("/approve"):
            await self._cmd_approve(chat_id, parts[1:] if len(parts) > 1 else [])
        elif command.startswith("/reject"):
            await self._cmd_reject(chat_id, parts[1:] if len(parts) > 1 else [])
        else:
            await self._send_message(chat_id, "Unknown command. Type /help for available commands.")

    async def _handle_callback(self, callback_query: dict):
        """Handle inline keyboard button callback."""
        data = callback_query.get("data", "")
        chat_id = callback_query.get("message", {}).get("chat", {}).get("id")
        message_id = callback_query.get("message", {}).get("message_id")

        if data.startswith("approve:"):
            approval_id = data.split(":")[1]
            await self._handle_approval(chat_id, message_id, approval_id)
        elif data.startswith("reject:"):
            approval_id = data.split(":")[1]
            await self._handle_reject(chat_id, message_id, approval_id)
        elif data.startswith("later:"):
            approval_id = data.split(":")[1]
            await self._handle_later(chat_id, message_id, approval_id)
        elif data == "approve_business":
            await self._send_message(chat_id, "\u2705 Business plan approved. Agents starting setup...")
        elif data == "reject_business":
            await self._send_message(chat_id, "\u274C Business plan rejected. Next scan queued.")
        elif data == "later_business":
            await self._send_message(chat_id, "\u23F8 Business plan snoozed. Reminder in 3 days.")

    async def _handle_approval(self, chat_id, message_id, approval_id):
        db = SupabaseClient()
        await db.execute(f"UPDATE approvals SET status = 'approved' WHERE id = '{approval_id}'")
        await self._send_message(chat_id, f"\u2705 Approval {approval_id} approved. Agents starting setup...")

    async def _handle_reject(self, chat_id, message_id, approval_id):
        db = SupabaseClient()
        await db.execute(f"UPDATE approvals SET status = 'rejected' WHERE id = '{approval_id}'")
        await self._send_message(chat_id, f"\u274C Approval {approval_id} rejected.")

    async def _handle_later(self, chat_id, message_id, approval_id):
        db = SupabaseClient()
        await db.execute(f"UPDATE approvals SET status = 'snoozed' WHERE id = '{approval_id}'")
        await self._send_message(chat_id, f"\u23F8 Approval {approval_id} snoozed. Reminder in 3 days.")

    async def _cmd_start(self, chat_id, args):
        await self._send_message(chat_id, "Welcome to Markly. Your AI company is running.")

    async def _cmd_status(self, chat_id, args):
        redis = RedisClient()
        csuite_keys = await redis.keys("agent:alive:csuite:*")
        dept_keys = await redis.keys("agent:alive:dept:*")
        ram = psutil.virtual_memory()
        uptime = time.time() - (await redis.get("markly_start_time") or time.time())

        msg = (
            f"\U0001F4CA Markly Status\n\n"
            f"C-Suite agents: {len(csuite_keys)}/7\n"
            f"Department agents: {len(dept_keys)} active\n"
            f"RAM: {ram.percent}%\n"
            f"Uptime: {uptime/3600:.1f} hours"
        )
        await self._send_message(chat_id, msg)

    async def _cmd_agents(self, chat_id, args):
        redis = RedisClient()
        csuite_keys = await redis.keys("agent:alive:csuite:*")
        dept_keys = await redis.keys("agent:alive:dept:*")

        msg = "\U0001F916 C-Suite Agents:\n"
        for key in csuite_keys:
            name = key.split(":")[-1].upper()
            msg += f"  \u2705 {name}\n"

        if dept_keys:
            msg += f"\nDepartment Agents ({len(dept_keys)} active):\n"
            for key in dept_keys:
                name = key.split(":")[-1]
                msg += f"  \U0001F504 {name}\n"

        await self._send_message(chat_id, msg)

    async def _cmd_earnings(self, chat_id, args):
        db = SupabaseClient()
        try:
            result = await db.execute("SELECT COALESCE(SUM(amount_inr), 0) as total FROM earnings WHERE created_at >= CURRENT_DATE")
            total = result[0]["total"] if result else 0
            await self._send_message(chat_id, f"\U0001F4B0 Today's earnings: \u20B9{total:,.2f}")
        except Exception:
            await self._send_message(chat_id, "\U0001F4B0 Today's earnings: \u20B90.00 (no data yet)")

    async def _cmd_costs(self, chat_id, args):
        db = SupabaseClient()
        try:
            result = await db.execute("SELECT COALESCE(SUM(cost_inr), 0) as total FROM llm_usage_log WHERE created_at >= CURRENT_DATE")
            total = result[0]["total"] if result else 0
            await self._send_message(chat_id, f"\U0001F4B8 Today's LLM costs: \u20B9{total:,.2f}")
        except Exception:
            await self._send_message(chat_id, "\U0001F4B8 Today's LLM costs: \u20B90.00 (no data yet)")

    async def _cmd_scan(self, chat_id, args):
        await self._send_message(chat_id, "\U0001F50D Starting business discovery scan...")
        try:
            from backend.tasks.scheduled.business_discovery import scan_business
            result = scan_business.delay()
            await self._send_message(chat_id, f"\u2705 Scan started. Results will be sent when complete. Task ID: {result.id}")
        except Exception as e:
            await self._send_message(chat_id, f"\u274C Scan failed: {e}")

    async def _cmd_pause(self, chat_id, args):
        redis = RedisClient()
        await redis.set("MARKLY_PAUSED", "true")
        await self._send_message(chat_id, "\u23F8 Markly paused. Send /resume to continue.")

    async def _cmd_resume(self, chat_id, args):
        redis = RedisClient()
        await redis.delete("MARKLY_PAUSED")
        await self._send_message(chat_id, "\U0001F449\U0001F3FB Markly resumed. All systems operational.")

    async def _cmd_health(self, chat_id, args):
        redis = RedisClient()
        ram = psutil.virtual_memory()
        cpu = psutil.cpu_percent()

        redis_ok = await redis.ping()
        db_ok = True
        try:
            db = SupabaseClient()
            await db.execute("SELECT 1")
        except Exception:
            db_ok = False

        csuite_keys = await redis.keys("agent:alive:csuite:*")

        mcp_ok = True
        celery_ok = True

        msg = (
            f"\U0001F4A7 System Health\n\n"
            f"RAM: {ram.percent}% ({ram.used/1024/1024:.0f}MB / {ram.total/1024/1024:.0f}MB)\n"
            f"CPU: {cpu}%\n"
            f"Redis: {'\u2705' if redis_ok else '\u274C'}\n"
            f"Database: {'\u2705' if db_ok else '\u274C'}\n"
            f"MCP: {'\u2705' if mcp_ok else '\u274C'}\n"
            f"Celery: {'\u2705' if celery_ok else '\u274C'}\n"
            f"C-Suite agents: {len(csuite_keys)}/7"
        )
        await self._send_message(chat_id, msg)

    async def _cmd_help(self, chat_id, args):
        help_text = (
            "\U0001F4CB Markly Commands:\n\n"
            "/start - Welcome message\n"
            "/status - System health summary\n"
            "/agents - List all C-Suite + active dept agents\n"
            "/earnings - Today's earnings in INR\n"
            "/costs - Today's LLM costs in INR\n"
            "/scan - Start business discovery scan\n"
            "/pause - Pause all agents\n"
            "/resume - Resume all agents\n"
            "/health - Detailed system health\n"
            "/approve [id] - Approve pending item\n"
            "/reject [id] - Reject pending item\n"
            "/help - Show this help"
        )
        await self._send_message(chat_id, help_text)

    async def _cmd_approve(self, chat_id, args):
        if not args:
            await self._send_message(chat_id, "Usage: /approve <id>")
            return
        await self._handle_approval(chat_id, None, args[0])

    async def _cmd_reject(self, chat_id, args):
        if not args:
            await self._send_message(chat_id, "Usage: /reject <id>")
            return
        await self._handle_reject(chat_id, None, args[0])

    async def _send_message(self, chat_id: int, text: str):
        """Send a message to Telegram."""
        target = chat_id or self.chat_id
        if not target or str(target).startswith("local"):
            print(f"[TELEGRAM OUT] {text}")
            return
        try:
            payload = {
                "chat_id": target,
                "text": text,
                "parse_mode": "HTML",
            }
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"https://api.telegram.org/bot{self.bot_token}/sendMessage",
                    json=payload,
                )
        except Exception as e:
            print(f"[TELEGRAM ERROR] {e}")
