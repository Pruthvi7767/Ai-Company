-- Markly v2.0.0 — Full Supabase Schema

-- Agents
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT DEFAULT 'idle',
    avatar TEXT,
    parent_id TEXT REFERENCES agents(id),
    tasks_today INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0,
    roi REAL DEFAULT 0,
    current_task TEXT,
    hire_date TEXT,
    version TEXT,
    last_heartbeat TEXT,
    tier TEXT DEFAULT 'manager',
    tokens_used_today INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spawned agents (active temp agents)
CREATE TABLE IF NOT EXISTS spawned_agents (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    task_description TEXT,
    spawned_by TEXT,
    status TEXT DEFAULT 'running',
    tokens_used INTEGER DEFAULT 0,
    cost_inr REAL DEFAULT 0,
    spawned_at TIMESTAMPTZ DEFAULT NOW(),
    terminated_at TIMESTAMPTZ,
    duration_seconds INTEGER
);

-- Hire/fire log
CREATE TABLE IF NOT EXISTS hire_fire_log (
    id SERIAL PRIMARY KEY,
    agent_id TEXT NOT NULL,
    department TEXT,
    action TEXT NOT NULL,
    triggered_by TEXT,
    task TEXT,
    tokens_used INTEGER,
    cost_inr REAL,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connectors / Platforms
CREATE TABLE IF NOT EXISTS connectors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'available',
    connected_since TEXT,
    last_used TEXT,
    agent_using TEXT,
    description TEXT,
    potential_earnings TEXT,
    api_key_encrypted TEXT,
    refresh_token_encrypted TEXT,
    rate_limit INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform sessions
CREATE TABLE IF NOT EXISTS platform_sessions (
    id SERIAL PRIMARY KEY,
    platform_id TEXT REFERENCES connectors(id),
    platform_name TEXT,
    status TEXT DEFAULT 'active',
    cookies_encrypted TEXT,
    cookie_expires_at TIMESTAMPTZ,
    heartbeat_url TEXT,
    login_url TEXT,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Income streams
CREATE TABLE IF NOT EXISTS income_streams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'dormant',
    earnings_this_month REAL DEFAULT 0,
    platform_count INTEGER DEFAULT 0,
    agent_count INTEGER DEFAULT 0,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Earnings
CREATE TABLE IF NOT EXISTS earnings (
    id SERIAL PRIMARY KEY,
    stream_id TEXT REFERENCES income_streams(id),
    platform_id TEXT REFERENCES connectors(id),
    amount_inr REAL NOT NULL,
    amount_usd REAL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id TEXT PRIMARY KEY,
    agent TEXT NOT NULL,
    action TEXT NOT NULL,
    platform TEXT,
    result TEXT DEFAULT 'success',
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals
CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    agent TEXT NOT NULL,
    waiting_time TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'pending',
    context TEXT,
    expected_outcome TEXT,
    risk TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board meetings
CREATE TABLE IF NOT EXISTS board_meetings (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration TEXT,
    decisions INTEGER DEFAULT 0,
    actions INTEGER DEFAULT 0,
    agenda JSONB,
    transcript TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base
CREATE TABLE IF NOT EXISTS knowledge (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    section TEXT DEFAULT 'wiki',
    content TEXT,
    last_updated TEXT,
    agents_using INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capabilities / Skills
CREATE TABLE IF NOT EXISTS capabilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'dormant',
    required_api TEXT,
    platforms INTEGER DEFAULT 0,
    agents INTEGER DEFAULT 0,
    activated_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content
CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT,
    platform TEXT,
    agent TEXT,
    status TEXT DEFAULT 'draft',
    qc_score INTEGER DEFAULT 0,
    published_date TEXT,
    earnings REAL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error logs
CREATE TABLE IF NOT EXISTS error_logs (
    id TEXT PRIMARY KEY,
    severity TEXT NOT NULL,
    agent TEXT,
    platform TEXT,
    type TEXT,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'needs-attention',
    stack_trace TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    agent_id TEXT,
    task_id TEXT,
    action TEXT NOT NULL,
    result TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost_inr REAL DEFAULT 0,
    duration TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business opportunities
CREATE TABLE IF NOT EXISTS business_opportunities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    score REAL,
    status TEXT DEFAULT 'pending',
    plan JSONB,
    telegram_message_id TEXT,
    accounts_needed JSONB,
    risks JSONB,
    projections JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comms threads
CREATE TABLE IF NOT EXISTS comms_threads (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comms messages
CREATE TABLE IF NOT EXISTS comms_messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT REFERENCES comms_threads(id),
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Agent memory (Mem0 backup)
CREATE TABLE IF NOT EXISTS agent_memories (
    id SERIAL PRIMARY KEY,
    agent_id TEXT NOT NULL,
    memory TEXT NOT NULL,
    metadata JSONB,
    embedding_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically
-- Anon key can only SELECT, not INSERT/UPDATE/DELETE
