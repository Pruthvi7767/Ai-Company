from backend.tasks.celery_app import celery_app
from backend.database import SupabaseClient
from backend.services.telegram.bot import TelegramBot
import datetime

@celery_app.task(name="tasks.scheduled.weekly_report.send")
def send_weekly_report():
    """Compile and send weekly strategic summary via Telegram."""
    now = datetime.datetime.now().isoformat()
    db = SupabaseClient()

    agents = db.select("agents")
    streams = db.select("income_streams")
    approvals = db.select("approvals")
    opportunities = db.select("business_opportunities")

    pending_approvals = [a for a in approvals if a.get("status") == "pending"]
    approved_opps = [o for o in opportunities if o.get("status") == "approved"]

    report = (
        f"Markly Weekly Report - Week {datetime.date.today().isocalendar()[1]}\n"
        f"Agents: {len(agents)} | Income Streams: {len(streams)}\n"
        f"Pending Approvals: {len(pending_approvals)}\n"
        f"Approved Opportunities: {len(approved_opps)}"
    )

    try:
        TelegramBot.send_message(report)
        sent = True
    except Exception:
        sent = False
        print(f"[WEEKLY REPORT] Telegram not configured, logging report: {report}")

    print(f"[WEEKLY REPORT] {now} - {report}")
    return {"timestamp": now, "agents": len(agents), "streams": len(streams), "pending": len(pending_approvals), "sent": sent}
