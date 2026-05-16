from backend.tasks.celery_app import celery_app
from backend.database import SupabaseClient
from backend.services.scoring.business_scorer import BusinessScorer
from backend.services.telegram.bot import TelegramBot
import datetime
import asyncio

@celery_app.task(name="tasks.scheduled.business_discovery.scan_business")
def scan_business():
    """Run automated business opportunity discovery across configured sources."""
    now = datetime.datetime.now().isoformat()
    db = SupabaseClient()
    scorer = BusinessScorer()

    sources = [
        "https://www.producthunt.com/topics/latest",
        "https://news.ycombinator.com/",
        "https://www.reddit.com/r/entrepreneur/",
        "https://www.reddit.com/r/startups/",
        "https://www.indiehackers.com/",
    ]

    async def _run():
        from backend.services.mcp.mcp_client import ScrapingOrchestrator
        orchestrator = ScrapingOrchestrator()

        raw_opportunities = []
        for source_url in sources:
            try:
                result = await orchestrator.scrape(source_url)
                if result.get("success"):
                    content = result.get("content", "")[:2000]
                    raw_opportunities.append({
                        "source": source_url,
                        "content": content,
                        "method": result.get("method", "unknown"),
                    })
                    print(f"[BUSINESS SCAN] Scraped {source_url} via {result.get('method')}")
                else:
                    print(f"[BUSINESS SCAN] Failed to scrape {source_url}")
            except Exception as e:
                print(f"[BUSINESS SCAN] Error scraping {source_url}: {e}")

        print(f"[BUSINESS SCAN] Found {len(raw_opportunities)} raw opportunities")

        scored_opportunities = []
        for i, raw in enumerate(raw_opportunities):
            score_result = await scorer.score_opportunity(raw["content"])
            score = score_result.get("score", 0)
            score_pct = int(score * 100) if score <= 1 else int(score)

            opp = {
                "name": score_result.get("name", f"Opportunity {i+1}"),
                "type": raw["source"],
                "score": score if score <= 1 else score / 100,
                "score_pct": score_pct,
                "status": "pending",
                "description": score_result.get("description", ""),
                "market_size": score_result.get("market_size", ""),
                "competition": score_result.get("competition", ""),
            }

            if opp["score"] >= 0.90:
                opp["status"] = "approved"
                print(f"[BUSINESS SCAN] Score: {score_pct}% -- APPROVED -- generating plan...")
                await TelegramBot.send_business_plan(
                    f"\U0001F4BC Business Opportunity\n\n"
                    f"Name: {opp['name']}\n"
                    f"Score: {score_pct}%\n"
                    f"Market: {opp['market_size']}\n"
                    f"Competition: {opp['competition']}\n\n"
                    f"{opp['description']}"
                )
            else:
                opp["status"] = "rejected"
                print(f"[BUSINESS SCAN] Score: {score_pct}% -- REJECTED")

            scored_opportunities.append(opp)
            try:
                db.insert("business_opportunities", opp)
            except Exception as e:
                print(f"[BUSINESS SCAN] Error inserting opportunity: {e}")

        print(f"[BUSINESS SCAN] {now} - Scored {len(scored_opportunities)} opportunities, "
              f"{sum(1 for o in scored_opportunities if o['status'] == 'approved')} approved")
        return scored_opportunities

    return asyncio.run(_run())
