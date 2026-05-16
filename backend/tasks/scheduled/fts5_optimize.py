from backend.tasks.celery_app import celery_app
from backend.database import FTS5Client
import datetime

@celery_app.task(name="tasks.scheduled.fts5_optimize.run")
def optimize_fts5():
    """Run FTS5 optimization (rebuild index, vacuum) for faster skill searches."""
    now = datetime.datetime.now().isoformat()
    fts = FTS5Client("global")

    try:
        conn = fts._get_conn()
        conn.execute("INSERT INTO skills_fts(skills_fts) VALUES('optimize')")
        conn.execute("VACUUM")
        conn.commit()
        print(f"[FTS5 OPTIMIZE] {now} - Index optimized successfully")
        return {"status": "optimized", "timestamp": now}
    except Exception as e:
        print(f"[FTS5 OPTIMIZE] {now} - Error: {e}")
        return {"status": "error", "error": str(e), "timestamp": now}
