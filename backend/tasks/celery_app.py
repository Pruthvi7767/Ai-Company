from celery import Celery
from celery.schedules import crontab
from backend.config import settings

celery_app = Celery(
    "markly",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "backend.tasks.scheduled.heartbeat_cron",
        "backend.tasks.scheduled.mcp_health_check",
        "backend.tasks.scheduled.business_discovery",
        "backend.tasks.scheduled.daily_report",
        "backend.tasks.scheduled.weekly_report",
        "backend.tasks.scheduled.account_detection",
        "backend.tasks.scheduled.budget_reset",
        "backend.tasks.scheduled.fts5_optimize",
        "backend.tasks.scheduled.csuite_watchdog",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_routes={
        "tasks.scheduled.*": {"queue": "default"},
    },
    beat_schedule={
        "heartbeat-ping-all": {
            "task": "tasks.scheduled.heartbeat_cron.ping_all",
            "schedule": crontab(minute="*/10"),
        },
        "mcp-health-check": {
            "task": "tasks.scheduled.mcp_health_check.check_mcp",
            "schedule": crontab(minute="*/5"),
        },
        "business-discovery-scan": {
            "task": "tasks.scheduled.business_discovery.scan_business",
            "schedule": crontab(hour=0, minute=0),
        },
        "daily-report": {
            "task": "tasks.scheduled.daily_report.send_daily_report",
            "schedule": crontab(hour=2, minute=0),
        },
        "weekly-report": {
            "task": "tasks.scheduled.weekly_report.send_weekly_report",
            "schedule": crontab(hour=2, minute=0, day_of_week=0),
        },
        "account-detection": {
            "task": "tasks.scheduled.account_detection.check_accounts",
            "schedule": crontab(minute=0, hour="*/12"),
        },
        "budget-reset": {
            "task": "tasks.scheduled.budget_reset.reset_budgets",
            "schedule": crontab(hour=0, minute=1),
        },
        "fts5-optimize": {
            "task": "tasks.scheduled.fts5_optimize.optimize_fts5",
            "schedule": crontab(hour=3, minute=0),
        },
        "csuite-watchdog": {
            "task": "tasks.scheduled.csuite_watchdog.check_and_restart",
            "schedule": 30,
        },
        "csuite-heartbeat": {
            "task": "tasks.scheduled.csuite_watchdog.refresh_heartbeats",
            "schedule": 20,
        },
    },
)
