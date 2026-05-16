from backend.tasks.celery_app import celery_app
from backend.database import SupabaseClient
from backend.services.telegram.bot import TelegramBot
import datetime

@celery_app.task(name="tasks.scheduled.daily_report.send")
def send_daily_report():
    """Compile and send daily performance report via Telegram."""
    now = datetime.datetime.now().isoformat()
    db = SupabaseClient()

    agents = db.select("agents")
    total_tasks = sum(a.get("tasks_today", 0) for a in agents)
    avg_success = sum(a.get("success_rate", 0) for a in agents) / max(len(agents), 1)
    total_roi = sum(a.get("roi", 0) for a in agents)

    streams = db.select("income_streams")
    active_streams = [s for s in streams if s.get("status") == "active"]

    report = (
        f"Markly Daily Report - {datetime.date.today()}\n"
        f"Agents: {len(agents)} | Tasks Today: {total_tasks}\n"
        f"Avg Success Rate: {avg_success:.1f}% | Total ROI: {total_roi:.1f}x\n"
        f"Active Income Streams: {len(active_streams)}/{len(streams)}"
    )

    try:
        TelegramBot.send_message(report)
        sent = True
    except Exception:
        sent = False
        print(f"[DAILY REPORT] Telegram not configured, logging report: {report}")

    print(f"[DAILY REPORT] {now} - {report}")
    return {"timestamp": now, "agents": len(agents), "tasks": total_tasks, "avg_success": avg_success, "sent": sent}
