"""
Celery Beat task aggregator.
All tasks are defined in their dedicated modules.
This file only re-exports them for Celery Beat scheduling convenience.
"""

from backend.tasks.scheduled.heartbeat_cron import ping_all
from backend.tasks.scheduled.mcp_health_check import check_mcp
from backend.tasks.scheduled.business_discovery import scan_business
from backend.tasks.scheduled.daily_report import send_daily_report
from backend.tasks.scheduled.weekly_report import send_weekly_report
from backend.tasks.scheduled.account_detection import check_accounts
from backend.tasks.scheduled.budget_reset import reset_budgets
from backend.tasks.scheduled.fts5_optimize import optimize_fts5
from backend.tasks.scheduled.csuite_watchdog import check_and_restart, refresh_heartbeats

__all__ = [
    "ping_all",
    "check_mcp",
    "scan_business",
    "send_daily_report",
    "send_weekly_report",
    "check_accounts",
    "reset_budgets",
    "optimize_fts5",
    "check_and_restart",
    "refresh_heartbeats",
]
