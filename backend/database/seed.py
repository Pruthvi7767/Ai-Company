"""Seed local SQLite database with mock data from frontend."""
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import SupabaseClient

async def seed():
    db = SupabaseClient()

    agents = [
        {"id": "ceo", "name": "CEO Agent", "role": "Chief Executive", "department": "C-Suite", "status": "active", "avatar": "/images/agent_ceo.png", "tasks_today": 45, "success_rate": 98, "roi": 4.2, "current_task": "Reviewing Q3 strategic plan", "hire_date": "2024-01-15", "version": "2.4.0", "last_heartbeat": "2 min ago", "tier": "csuite"},
        {"id": "coo", "name": "COO Agent", "role": "Chief Operations", "department": "C-Suite", "status": "active", "avatar": "/images/agent_coo.png", "parent_id": "ceo", "tasks_today": 38, "success_rate": 96, "roi": 3.8, "current_task": "Optimizing workflow pipelines", "hire_date": "2024-02-01", "version": "2.3.8", "last_heartbeat": "5 min ago", "tier": "csuite"},
        {"id": "cto", "name": "CTO Agent", "role": "Chief Technology", "department": "C-Suite", "status": "active", "avatar": "/images/agent_cto.png", "parent_id": "ceo", "tasks_today": 52, "success_rate": 95, "roi": 4.5, "current_task": "Architecting new data pipeline", "hire_date": "2024-01-20", "version": "2.4.1", "last_heartbeat": "30 sec ago", "tier": "csuite"},
        {"id": "cmo", "name": "CMO Agent", "role": "Chief Marketing", "department": "C-Suite", "status": "active", "avatar": "/images/agent_cmo.png", "parent_id": "ceo", "tasks_today": 30, "success_rate": 91, "roi": 3.2, "current_task": "Analyzing campaign performance", "hire_date": "2024-02-10", "version": "2.3.7", "last_heartbeat": "4 min ago", "tier": "csuite"},
        {"id": "cfo", "name": "CFO Agent", "role": "Chief Financial", "department": "C-Suite", "status": "active", "avatar": "/images/agent_cfo.png", "parent_id": "ceo", "tasks_today": 40, "success_rate": 99, "roi": 5.1, "current_task": "Reconciling monthly earnings", "hire_date": "2024-01-10", "version": "2.4.0", "last_heartbeat": "1 min ago", "tier": "csuite"},
        {"id": "cso", "name": "CSO Agent", "role": "Chief Security", "department": "C-Suite", "status": "active", "avatar": "/images/agent_cso.png", "parent_id": "ceo", "tasks_today": 36, "success_rate": 92, "roi": 4.8, "current_task": "Auditing platform security protocols", "hire_date": "2024-02-05", "version": "2.3.9", "last_heartbeat": "2 min ago", "tier": "csuite"},
        {"id": "cao", "name": "CAO Agent", "role": "Chief Analytics", "department": "C-Suite", "status": "active", "avatar": "/images/agent_cao.png", "parent_id": "ceo", "tasks_today": 48, "success_rate": 97, "roi": 4.0, "current_task": "Running performance analysis", "hire_date": "2024-02-20", "version": "2.3.8", "last_heartbeat": "1 min ago", "tier": "csuite"},
    ]

    for a in agents:
        try:
            await db.insert("agents", a)
        except Exception:
            pass

    connectors = [
        {"id": "stripe", "name": "Stripe", "category": "Payments", "status": "connected", "connected_since": "2024-01-15", "last_used": "2 min ago", "agent_using": "CFO Agent", "description": "Payment processing and subscription management", "potential_earnings": "$2,400/mo"},
        {"id": "shopify", "name": "Shopify", "category": "E-Commerce", "status": "connected", "connected_since": "2024-02-01", "last_used": "5 min ago", "agent_using": "COO Agent", "description": "E-commerce store management and product syncing", "potential_earnings": "$3,100/mo"},
        {"id": "twitter", "name": "X (Twitter)", "category": "Social", "status": "connected", "connected_since": "2024-01-20", "last_used": "1 min ago", "agent_using": "CMO Agent", "description": "Social media posting and engagement tracking", "potential_earnings": "$1,800/mo"},
        {"id": "linkedin", "name": "LinkedIn", "category": "Social", "status": "connected", "connected_since": "2024-03-01", "last_used": "15 min ago", "agent_using": "CSO Agent", "description": "Professional networking and lead generation", "potential_earnings": "$2,200/mo"},
        {"id": "instagram", "name": "Instagram", "category": "Social", "status": "needs_attention", "connected_since": "2024-03-10", "last_used": "2 hr ago", "agent_using": "Marketing Manager", "description": "Visual content publishing and analytics", "potential_earnings": "$1,500/mo"},
        {"id": "youtube", "name": "YouTube", "category": "Video", "status": "connected", "connected_since": "2024-02-15", "last_used": "30 min ago", "agent_using": "CMO Agent", "description": "Video content management and monetization", "potential_earnings": "$2,800/mo"},
        {"id": "github", "name": "GitHub", "category": "Development", "status": "connected", "connected_since": "2024-01-10", "last_used": "10 min ago", "agent_using": "CTO Agent", "description": "Code repository management and CI/CD", "potential_earnings": "$0/mo"},
        {"id": "gmail", "name": "Gmail", "category": "Communication", "status": "connected", "connected_since": "2024-01-05", "last_used": "3 min ago", "agent_using": "CEO Agent", "description": "Email automation and inbox management", "potential_earnings": "$900/mo"},
        {"id": "alibaba", "name": "Alibaba", "category": "E-Commerce", "status": "available", "description": "Supplier sourcing and product research", "potential_earnings": "$4,200/mo"},
        {"id": "tiktok", "name": "TikTok", "category": "Social", "status": "available", "description": "Short-form video content and trends", "potential_earnings": "$3,500/mo"},
        {"id": "reddit", "name": "Reddit", "category": "Social", "status": "available", "description": "Community engagement and research", "potential_earnings": "$1,200/mo"},
        {"id": "canva", "name": "Canva", "category": "Design", "status": "available", "description": "Graphic design and content creation", "potential_earnings": "$600/mo"},
        {"id": "email", "name": "Email (IMAP/SMTP)", "category": "Communication", "status": "available", "description": "Full email integration via IMAP/SMTP for any provider (Gmail, Outlook, Yahoo, custom). Enables automated inbox management, email parsing, auto-replies, and agent-driven email workflows.", "potential_earnings": "$1,200/mo"},
    ]

    for c in connectors:
        try:
            await db.insert("connectors", c)
        except Exception:
            pass

    streams = [
        {"id": "affiliate", "name": "Affiliate Marketing", "status": "active", "earnings_this_month": 4520, "platform_count": 4, "agent_count": 3, "color": "#e8a94e"},
        {"id": "ecommerce", "name": "E-Commerce", "status": "active", "earnings_this_month": 8230, "platform_count": 2, "agent_count": 4, "color": "#4ee88a"},
        {"id": "content", "name": "Content Monetization", "status": "active", "earnings_this_month": 3150, "platform_count": 3, "agent_count": 2, "color": "#4e8ee8"},
        {"id": "saas", "name": "SaaS Subscriptions", "status": "active", "earnings_this_month": 12400, "platform_count": 1, "agent_count": 2, "color": "#a855f7"},
        {"id": "consulting", "name": "Consulting Services", "status": "dormant", "earnings_this_month": 0, "platform_count": 0, "agent_count": 0, "color": "#666666"},
        {"id": "investment", "name": "Investment Returns", "status": "active", "earnings_this_month": 2180, "platform_count": 2, "agent_count": 1, "color": "#f97316"},
    ]

    for s in streams:
        try:
            await db.insert("income_streams", s)
        except Exception:
            pass

    approvals_data = [
        {"id": "1", "type": "Financial", "title": "Approve $5,000 marketing budget increase", "agent": "CMO Agent", "waiting_time": "2 hr", "priority": "urgent", "status": "pending"},
        {"id": "2", "type": "Platform", "title": "Connect new TikTok account", "agent": "CMO Agent", "waiting_time": "4 hr", "priority": "normal", "status": "pending"},
        {"id": "3", "type": "Content", "title": 'Publish blog post: "AI Trends 2026"', "agent": "Marketing Manager", "waiting_time": "6 hr", "priority": "normal", "status": "pending"},
        {"id": "4", "type": "System", "title": "Upgrade CTO Agent to v2.5.0", "agent": "CTO Agent", "waiting_time": "1 hr", "priority": "urgent", "status": "pending"},
        {"id": "5", "type": "Financial", "title": "Approve server scaling budget ($800/mo)", "agent": "CTO Agent", "waiting_time": "3 hr", "priority": "normal", "status": "pending"},
    ]

    for a in approvals_data:
        try:
            await db.insert("approvals", a)
        except Exception:
            pass

    print("Database seeded successfully!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(seed())
