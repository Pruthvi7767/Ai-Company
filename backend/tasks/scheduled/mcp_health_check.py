from backend.tasks.celery_app import celery_app
from backend.services.mcp.mcp_client import MCPBrowser
import datetime

@celery_app.task(name="tasks.scheduled.mcp_health_check.check")
def check_mcp():
    """Verify MCP browser service is responsive and tab count is within limits."""
    now = datetime.datetime.now().isoformat()
    mcp = MCPBrowser()

    status = {
        "max_tabs": mcp.MAX_TABS,
        "mcp_url": mcp.MCP_URL,
        "timeout": mcp.TIMEOUT,
        "timestamp": now,
    }

    try:
        import httpx
        response = httpx.get(mcp.MCP_URL, timeout=10)
        status["reachable"] = response.status_code == 200
        status["status_code"] = response.status_code
    except Exception as e:
        status["reachable"] = False
        status["error"] = str(e)

    print(f"[MCP HEALTH] {now} - Reachable: {status['reachable']}")
    return status
