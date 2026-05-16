import httpx
import json
import sys
from backend.config import settings

class TelegramBot:
    @staticmethod
    def _safe_print(text: str):
        """Print text safely, falling back to ASCII on Windows console."""
        try:
            print(text)
        except UnicodeEncodeError:
            # Fallback for Windows console without UTF-8 support
            ascii_text = text.encode('ascii', 'replace').decode('ascii')
            print(ascii_text)

    @staticmethod
    async def send_message(text: str, chat_id: str = None, reply_markup: dict = None):
        """Send a message to Telegram with optional inline keyboard."""
        chat = chat_id or settings.TELEGRAM_CHAT_ID
        if not chat or chat.startswith("local"):
            TelegramBot._safe_print(f"[TELEGRAM] {text}")
            return
        try:
            payload = {
                "chat_id": chat,
                "text": text,
                "parse_mode": "HTML",
            }
            if reply_markup:
                payload["reply_markup"] = json.dumps(reply_markup)

            async with httpx.AsyncClient() as client:
                await client.post(
                    f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage",
                    json=payload,
                )
        except Exception as e:
            print(f"[TELEGRAM ERROR] {e}")

    @staticmethod
    async def send_alert(text: str):
        """Send an alert message with 🚨 prefix."""
        await TelegramBot.send_message(f"🚨 ALERT\n\n{text}")

    @staticmethod
    async def send_approval_buttons(approval_id: str, title: str):
        """Send an approval request with inline keyboard buttons."""
        text = f"📋 <b>Approval Request</b>\n\n{title}"
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "✅ Approve", "callback_data": f"approve:{approval_id}"},
                    {"text": "❌ Reject", "callback_data": f"reject:{approval_id}"},
                ],
                [
                    {"text": "⏸ Later", "callback_data": f"later:{approval_id}"},
                ]
            ]
        }
        await TelegramBot.send_message(text, reply_markup=reply_markup)

    @staticmethod
    async def send_business_plan(plan_text: str):
        """Send a business plan with approve/reject/later buttons."""
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "✅ Approve Business", "callback_data": "approve_business"},
                    {"text": "❌ Reject", "callback_data": "reject_business"},
                ],
                [
                    {"text": "⏸ Review Later", "callback_data": "later_business"},
                ]
            ]
        }
        await TelegramBot.send_message(plan_text, reply_markup=reply_markup)
