export interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'idle' | 'error' | 'dormant';
  avatar: string;
  parent_id?: string;
  tasks_today: number;
  success_rate: number;
  roi: number;
  current_task: string;
  hire_date: string;
  version: string;
  last_heartbeat: string;
}

export const agents: Agent[] = [
  { id: 'ceo', name: 'CEO Agent', role: 'Chief Executive', department: 'C-Suite', status: 'active', avatar: '/images/agent_ceo.png', tasks_today: 45, success_rate: 98, roi: 4.2, current_task: 'Reviewing Q3 strategic plan', hire_date: '2024-01-15', version: '2.4.0', last_heartbeat: '2 min ago' },
  { id: 'coo', name: 'COO Agent', role: 'Chief Operations', department: 'C-Suite', status: 'active', avatar: '/images/agent_coo.png', parent_id: 'ceo', tasks_today: 38, success_rate: 96, roi: 3.8, current_task: 'Optimizing workflow pipelines', hire_date: '2024-02-01', version: '2.3.8', last_heartbeat: '5 min ago' },
  { id: 'ops-mgr', name: 'Operations Manager', role: 'Operations Lead', department: 'Operations', status: 'active', avatar: '/images/agent_coo.png', parent_id: 'coo', tasks_today: 28, success_rate: 94, roi: 3.1, current_task: 'Monitoring daily operations', hire_date: '2024-03-10', version: '2.3.5', last_heartbeat: '1 min ago' },
  { id: 'hr-mgr', name: 'HR Manager', role: 'Human Resources', department: 'Operations', status: 'idle', avatar: '/images/agent_coo.png', parent_id: 'coo', tasks_today: 12, success_rate: 99, roi: 2.5, current_task: 'Processing agent evaluations', hire_date: '2024-03-15', version: '2.3.2', last_heartbeat: '15 min ago' },
  { id: 'cs-mgr', name: 'Customer Success Manager', role: 'Customer Success', department: 'Operations', status: 'active', avatar: '/images/agent_coo.png', parent_id: 'coo', tasks_today: 22, success_rate: 97, roi: 3.4, current_task: 'Responding to client inquiries', hire_date: '2024-04-01', version: '2.3.0', last_heartbeat: '3 min ago' },
  { id: 'cto', name: 'CTO Agent', role: 'Chief Technology', department: 'C-Suite', status: 'active', avatar: '/images/agent_cto.png', parent_id: 'ceo', tasks_today: 52, success_rate: 95, roi: 4.5, current_task: 'Architecting new data pipeline', hire_date: '2024-01-20', version: '2.4.1', last_heartbeat: '30 sec ago' },
  { id: 'tech-mgr', name: 'Tech Manager', role: 'Technical Lead', department: 'Technology', status: 'active', avatar: '/images/agent_cto.png', parent_id: 'cto', tasks_today: 35, success_rate: 93, roi: 3.9, current_task: 'Debugging connector integration', hire_date: '2024-02-15', version: '2.3.6', last_heartbeat: '1 min ago' },
  { id: 'cmo', name: 'CMO Agent', role: 'Chief Marketing', department: 'C-Suite', status: 'active', avatar: '/images/agent_cmo.png', parent_id: 'ceo', tasks_today: 30, success_rate: 91, roi: 3.2, current_task: 'Analyzing campaign performance', hire_date: '2024-02-10', version: '2.3.7', last_heartbeat: '4 min ago' },
  { id: 'mkt-mgr', name: 'Marketing Manager', role: 'Marketing Lead', department: 'Marketing', status: 'idle', avatar: '/images/agent_cmo.png', parent_id: 'cmo', tasks_today: 18, success_rate: 89, roi: 2.8, current_task: 'Preparing content calendar', hire_date: '2024-04-10', version: '2.3.1', last_heartbeat: '20 min ago' },
  { id: 'design-mgr', name: 'Design Manager', role: 'Design Lead', department: 'Marketing', status: 'active', avatar: '/images/agent_cmo.png', parent_id: 'cmo', tasks_today: 24, success_rate: 96, roi: 3.0, current_task: 'Creating brand assets', hire_date: '2024-04-15', version: '2.3.0', last_heartbeat: '6 min ago' },
  { id: 'cfo', name: 'CFO Agent', role: 'Chief Financial', department: 'C-Suite', status: 'active', avatar: '/images/agent_cfo.png', parent_id: 'ceo', tasks_today: 40, success_rate: 99, roi: 5.1, current_task: 'Reconciling monthly earnings', hire_date: '2024-01-10', version: '2.4.0', last_heartbeat: '1 min ago' },
  { id: 'finance-mgr', name: 'Finance Manager', role: 'Finance Lead', department: 'Finance', status: 'active', avatar: '/images/agent_cfo.png', parent_id: 'cfo', tasks_today: 32, success_rate: 98, roi: 4.0, current_task: 'Forecasting Q4 budget', hire_date: '2024-03-01', version: '2.3.4', last_heartbeat: '3 min ago' },
  { id: 'cso', name: 'CSO Agent', role: 'Chief Security', department: 'C-Suite', status: 'active', avatar: '/images/agent_cso.png', parent_id: 'ceo', tasks_today: 36, success_rate: 92, roi: 4.8, current_task: 'Auditing platform security protocols', hire_date: '2024-02-05', version: '2.3.9', last_heartbeat: '2 min ago' },
  { id: 'sales-mgr', name: 'Sales Manager', role: 'Sales Lead', department: 'Sales', status: 'idle', avatar: '/images/agent_cso.png', parent_id: 'cso', tasks_today: 20, success_rate: 88, roi: 3.5, current_task: 'Following up on leads', hire_date: '2024-04-20', version: '2.3.0', last_heartbeat: '25 min ago' },
  { id: 'legal-mgr', name: 'Legal Manager', role: 'Legal Lead', department: 'Legal', status: 'dormant', avatar: '/images/agent_cso.png', parent_id: 'cso', tasks_today: 5, success_rate: 100, roi: 1.8, current_task: 'Compliance audit', hire_date: '2024-05-01', version: '2.2.9', last_heartbeat: '2 hr ago' },
  { id: 'cao', name: 'CAO Agent', role: 'Chief Analytics', department: 'C-Suite', status: 'active', avatar: '/images/agent_cao.png', parent_id: 'ceo', tasks_today: 48, success_rate: 97, roi: 4.0, current_task: 'Running performance analysis', hire_date: '2024-02-20', version: '2.3.8', last_heartbeat: '1 min ago' },
  { id: 'analytics-mgr', name: 'Analytics Manager', role: 'Analytics Lead', department: 'Analytics', status: 'active', avatar: '/images/agent_cao.png', parent_id: 'cao', tasks_today: 30, success_rate: 95, roi: 3.3, current_task: 'Building reporting dashboard', hire_date: '2024-04-05', version: '2.3.2', last_heartbeat: '4 min ago' },
];

export const departmentColors: Record<string, string> = {
  'C-Suite': '#e8a94e',
  'Operations': '#4e8ee8',
  'Technology': '#4ee88a',
  'Marketing': '#a855f7',
  'Finance': '#14b8a6',
  'Sales': '#f97316',
  'Legal': '#64748b',
  'Analytics': '#22d3ee',
};

export interface Connector {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'needs_attention' | 'error' | 'available';
  connectedSince?: string;
  lastUsed?: string;
  agentUsing?: string;
  description: string;
  potentialEarnings?: string;
}

export const connectors: Connector[] = [
  { id: 'stripe', name: 'Stripe', category: 'Payments', status: 'connected', connectedSince: '2024-01-15', lastUsed: '2 min ago', agentUsing: 'CFO Agent', description: 'Payment processing and subscription management', potentialEarnings: '$2,400/mo' },
  { id: 'shopify', name: 'Shopify', category: 'E-Commerce', status: 'connected', connectedSince: '2024-02-01', lastUsed: '5 min ago', agentUsing: 'COO Agent', description: 'E-commerce store management and product syncing', potentialEarnings: '$3,100/mo' },
  { id: 'twitter', name: 'X (Twitter)', category: 'Social', status: 'connected', connectedSince: '2024-01-20', lastUsed: '1 min ago', agentUsing: 'CMO Agent', description: 'Social media posting and engagement tracking', potentialEarnings: '$1,800/mo' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Social', status: 'connected', connectedSince: '2024-03-01', lastUsed: '15 min ago', agentUsing: 'CSO Agent', description: 'Professional networking and lead generation', potentialEarnings: '$2,200/mo' },
  { id: 'instagram', name: 'Instagram', category: 'Social', status: 'needs_attention', connectedSince: '2024-03-10', lastUsed: '2 hr ago', agentUsing: 'Marketing Manager', description: 'Visual content publishing and analytics', potentialEarnings: '$1,500/mo' },
  { id: 'youtube', name: 'YouTube', category: 'Video', status: 'connected', connectedSince: '2024-02-15', lastUsed: '30 min ago', agentUsing: 'CMO Agent', description: 'Video content management and monetization', potentialEarnings: '$2,800/mo' },
  { id: 'github', name: 'GitHub', category: 'Development', status: 'connected', connectedSince: '2024-01-10', lastUsed: '10 min ago', agentUsing: 'CTO Agent', description: 'Code repository management and CI/CD', potentialEarnings: '$0/mo' },
  { id: 'gmail', name: 'Gmail', category: 'Communication', status: 'connected', connectedSince: '2024-01-05', lastUsed: '3 min ago', agentUsing: 'CEO Agent', description: 'Email automation and inbox management', potentialEarnings: '$900/mo' },
  { id: 'alibaba', name: 'Alibaba', category: 'E-Commerce', status: 'available', description: 'Supplier sourcing and product research', potentialEarnings: '$4,200/mo' },
  { id: 'tiktok', name: 'TikTok', category: 'Social', status: 'available', description: 'Short-form video content and trends', potentialEarnings: '$3,500/mo' },
  { id: 'reddit', name: 'Reddit', category: 'Social', status: 'available', description: 'Community engagement and research', potentialEarnings: '$1,200/mo' },
  { id: 'canva', name: 'Canva', category: 'Design', status: 'available', description: 'Graphic design and content creation', potentialEarnings: '$600/mo' },
];

export interface IncomeStream {
  id: string;
  name: string;
  icon: string;
  status: 'active' | 'dormant' | 'paused';
  earningsThisMonth: number;
  platformCount: number;
  agentCount: number;
  color: string;
  history: number[];
}

export const incomeStreams: IncomeStream[] = [
  { id: 'affiliate', name: 'Affiliate Marketing', icon: 'Link', status: 'active', earningsThisMonth: 4520, platformCount: 4, agentCount: 3, color: '#e8a94e', history: [3200, 3400, 3100, 3800, 4200, 3900, 4520] },
  { id: 'ecommerce', name: 'E-Commerce', icon: 'ShoppingBag', status: 'active', earningsThisMonth: 8230, platformCount: 2, agentCount: 4, color: '#4ee88a', history: [6100, 6800, 7200, 7500, 7800, 8100, 8230] },
  { id: 'content', name: 'Content Monetization', icon: 'FileText', status: 'active', earningsThisMonth: 3150, platformCount: 3, agentCount: 2, color: '#4e8ee8', history: [2100, 2300, 2500, 2700, 2800, 3000, 3150] },
  { id: 'saas', name: 'SaaS Subscriptions', icon: 'Cloud', status: 'active', earningsThisMonth: 12400, platformCount: 1, agentCount: 2, color: '#a855f7', history: [9800, 10200, 10500, 11000, 11500, 12000, 12400] },
  { id: 'consulting', name: 'Consulting Services', icon: 'Briefcase', status: 'dormant', earningsThisMonth: 0, platformCount: 0, agentCount: 0, color: '#666666', history: [0, 0, 0, 0, 0, 0, 0] },
  { id: 'investment', name: 'Investment Returns', icon: 'TrendingUp', status: 'active', earningsThisMonth: 2180, platformCount: 2, agentCount: 1, color: '#f97316', history: [1500, 1600, 1700, 1800, 1900, 2000, 2180] },
];

export interface ActivityItem {
  id: string;
  agent: string;
  action: string;
  platform: string;
  result: 'success' | 'failed' | 'warning';
  time: string;
  details?: string;
}

export const activityFeed: ActivityItem[] = [
  { id: '1', agent: 'CEO Agent', action: 'Approved Q3 payout request', platform: 'Stripe', result: 'success', time: '2 min ago' },
  { id: '2', agent: 'CTO Agent', action: 'Hit rate limit on API', platform: 'Twitter', result: 'warning', time: '5 min ago' },
  { id: '3', agent: 'CFO Agent', action: 'Completed monthly reconciliation', platform: 'Stripe', result: 'success', time: '8 min ago' },
  { id: '4', agent: 'CMO Agent', action: 'Published campaign content', platform: 'LinkedIn', result: 'success', time: '12 min ago' },
  { id: '5', agent: 'COO Agent', action: 'Inventory sync failed', platform: 'Shopify', result: 'failed', time: '15 min ago' },
  { id: '6', agent: 'CSO Agent', action: 'Closed enterprise deal', platform: 'Gmail', result: 'success', time: '20 min ago' },
  { id: '7', agent: 'CAO Agent', action: 'Generated weekly analytics report', platform: 'Internal', result: 'success', time: '25 min ago' },
  { id: '8', agent: 'Tech Manager', action: 'Connector timeout error', platform: 'Instagram', result: 'warning', time: '30 min ago' },
  { id: '9', agent: 'CFO Agent', action: 'Processed vendor payment', platform: 'Stripe', result: 'success', time: '35 min ago' },
  { id: '10', agent: 'Marketing Manager', action: 'Scheduled social posts', platform: 'Twitter', result: 'success', time: '40 min ago' },
];

export interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  agent: string;
  waitingTime: string;
  priority: 'urgent' | 'normal';
  status: 'pending' | 'approved' | 'rejected';
}

export const approvals: ApprovalItem[] = [
  { id: '1', type: 'Financial', title: 'Approve $5,000 marketing budget increase', agent: 'CMO Agent', waitingTime: '2 hr', priority: 'urgent', status: 'pending' },
  { id: '2', type: 'Platform', title: 'Connect new TikTok account', agent: 'CMO Agent', waitingTime: '4 hr', priority: 'normal', status: 'pending' },
  { id: '3', type: 'Content', title: 'Publish blog post: "AI Trends 2026"', agent: 'Marketing Manager', waitingTime: '6 hr', priority: 'normal', status: 'pending' },
  { id: '4', type: 'System', title: 'Upgrade CTO Agent to v2.5.0', agent: 'CTO Agent', waitingTime: '1 hr', priority: 'urgent', status: 'pending' },
  { id: '5', type: 'Financial', title: 'Approve server scaling budget ($800/mo)', agent: 'CTO Agent', waitingTime: '3 hr', priority: 'normal', status: 'pending' },
];

export interface ErrorLogItem {
  id: string;
  severity: 'green' | 'yellow' | 'orange' | 'red' | 'black';
  time: string;
  agent: string;
  platform: string;
  type: string;
  description: string;
  status: 'auto-fixed' | 'needs-attention' | 'resolved' | 'ongoing';
}

export const errorLogs: ErrorLogItem[] = [
  { id: 'ERR-001', severity: 'red', time: '14:23', agent: 'CTO Agent', platform: 'Instagram', type: 'API Rate Limit', description: 'Rate limit exceeded on media upload endpoint', status: 'auto-fixed' },
  { id: 'ERR-002', severity: 'yellow', time: '13:45', agent: 'COO Agent', platform: 'Shopify', type: 'Sync Timeout', description: 'Inventory sync took longer than 30 seconds', status: 'needs-attention' },
  { id: 'ERR-003', severity: 'orange', time: '12:10', agent: 'CMO Agent', platform: 'Twitter', type: 'Auth Expired', description: 'OAuth token expired, re-authentication required', status: 'resolved' },
  { id: 'ERR-004', severity: 'green', time: '11:30', agent: 'Tech Manager', platform: 'GitHub', type: 'Webhook Delay', description: 'Webhook delivery delayed by 45 seconds', status: 'auto-fixed' },
  { id: 'ERR-005', severity: 'black', time: '10:15', agent: 'CFO Agent', platform: 'Stripe', type: 'Payment Failed', description: 'Recurring payment failed for customer #4821', status: 'ongoing' },
  { id: 'ERR-006', severity: 'yellow', time: '09:50', agent: 'CSO Agent', platform: 'LinkedIn', type: 'Rate Limit Warning', description: 'Approaching daily API rate limit', status: 'needs-attention' },
];

export const earningsData = [
  { date: 'Mon', affiliate: 680, ecommerce: 1200, content: 450, saas: 1800, consulting: 0, investment: 320 },
  { date: 'Tue', affiliate: 720, ecommerce: 1350, content: 480, saas: 1850, consulting: 0, investment: 340 },
  { date: 'Wed', affiliate: 650, ecommerce: 1100, content: 520, saas: 1750, consulting: 0, investment: 310 },
  { date: 'Thu', affiliate: 780, ecommerce: 1400, content: 490, saas: 1900, consulting: 0, investment: 360 },
  { date: 'Fri', affiliate: 820, ecommerce: 1550, content: 550, saas: 1950, consulting: 0, investment: 380 },
  { date: 'Sat', affiliate: 590, ecommerce: 900, content: 380, saas: 1600, consulting: 0, investment: 290 },
  { date: 'Sun', affiliate: 620, ecommerce: 950, content: 410, saas: 1650, consulting: 0, investment: 300 },
];

export const platformEarnings = [
  { name: 'Stripe', stream: 'SaaS', today: 420, week: 2840, month: 12400, change: 12.5 },
  { name: 'Shopify', stream: 'E-Commerce', today: 380, week: 1920, month: 8230, change: 8.3 },
  { name: 'Twitter', stream: 'Affiliate', today: 95, week: 640, month: 2810, change: -2.1 },
  { name: 'LinkedIn', stream: 'Affiliate', today: 120, week: 780, month: 1710, change: 15.7 },
  { name: 'YouTube', stream: 'Content', today: 210, week: 1120, month: 4850, change: 22.4 },
  { name: 'Instagram', stream: 'Content', today: 85, week: 520, month: 2180, change: -5.2 },
  { name: 'Gmail', stream: 'Consulting', today: 150, week: 890, month: 3650, change: 6.8 },
];

export const healthMetrics = {
  vps: { ram: { used: 14.2, total: 32 }, cpu: 45, disk: { used: 180, total: 500 }, uptime: '45d 12h 30m', location: 'us-east-1' },
  database: { storage: { used: 2.1, total: 10 }, rows: '1.2M', connections: 24, queryTime: '12ms', bandwidth: '45GB' },
  cache: { memory: { used: 512, total: 1024 }, keys: '45K', hitRate: 94.2, clients: 18 },
  watchdog: { lastCheck: '30s ago', checksToday: 1440, interventions: 3 },
};

export const notifications = [
  { id: '1', type: 'approval', title: 'New approval request', description: 'CMO Agent requests $5,000 budget increase', time: '5 min ago', read: false },
  { id: '2', type: 'error', title: 'Critical error detected', description: 'Stripe payment failed for customer #4821', time: '15 min ago', read: false },
  { id: '3', type: 'milestone', title: 'Earnings milestone reached', description: 'Daily earnings exceeded $2,000 target', time: '1 hr ago', read: false },
  { id: '4', type: 'system', title: 'System backup completed', description: 'Automated daily backup finished successfully', time: '2 hr ago', read: true },
  { id: '5', type: 'agent', title: 'Agent hired', description: 'Legal Manager joined the team', time: '3 hr ago', read: true },
  { id: '6', type: 'platform', title: 'Platform recommended', description: 'TikTok integration recommended by CMO Agent', time: '4 hr ago', read: true },
  { id: '7', type: 'report', title: 'Daily report ready', description: 'Your daily earnings report is available', time: '6 hr ago', read: true },
  { id: '8', type: 'budget', title: 'Budget alert', description: 'API costs at 75% of daily limit', time: '8 hr ago', read: true },
];

export const capabilities = [
  { id: '1', name: 'Payment Processing', status: 'active' as const, requiredApi: 'Stripe API', platforms: 3, agents: 4, activatedDate: '2024-01-15' },
  { id: '2', name: 'Social Media Publishing', status: 'active' as const, requiredApi: 'Twitter API', platforms: 4, agents: 3, activatedDate: '2024-01-20' },
  { id: '3', name: 'E-Commerce Automation', status: 'active' as const, requiredApi: 'Shopify API', platforms: 2, agents: 4, activatedDate: '2024-02-01' },
  { id: '4', name: 'Video Content Creation', status: 'partial' as const, requiredApi: 'YouTube API', platforms: 1, agents: 2, activatedDate: '2024-02-15' },
  { id: '5', name: 'Advanced Analytics', status: 'active' as const, requiredApi: 'Internal', platforms: 1, agents: 2, activatedDate: '2024-02-20' },
  { id: '6', name: 'Affiliate Tracking', status: 'dormant' as const, requiredApi: 'Impact API', platforms: 0, agents: 0 },
  { id: '7', name: 'Email Automation', status: 'active' as const, requiredApi: 'Gmail API', platforms: 1, agents: 3, activatedDate: '2024-01-05' },
  { id: '8', name: 'Legal Compliance', status: 'active' as const, requiredApi: 'Internal', platforms: 1, agents: 2, activatedDate: '2024-03-20' },
];

export const contentItems = [
  { id: '1', title: 'AI Trends Reshaping Business in 2026', type: 'Article', platform: 'LinkedIn', agent: 'CMO Agent', status: 'published', qcScore: 92, publishedDate: '2026-05-14', earnings: 145 },
  { id: '2', title: 'Product Demo: Markly v2.4', type: 'Video', platform: 'YouTube', agent: 'CMO Agent', status: 'published', qcScore: 88, publishedDate: '2026-05-13', earnings: 320 },
  { id: '3', title: 'Weekly Industry Roundup', type: 'Post', platform: 'Twitter', agent: 'Marketing Manager', status: 'published', qcScore: 85, publishedDate: '2026-05-13', earnings: 45 },
  { id: '4', title: 'E-Commerce Strategy Guide', type: 'Article', platform: 'Shopify', agent: 'COO Agent', status: 'scheduled', qcScore: 0, publishedDate: '2026-05-15', earnings: 0 },
  { id: '5', title: 'Customer Success Stories', type: 'Article', platform: 'LinkedIn', agent: 'CS Manager', status: 'published', qcScore: 90, publishedDate: '2026-05-12', earnings: 89 },
  { id: '6', title: 'API Documentation Update', type: 'Asset', platform: 'GitHub', agent: 'CTO Agent', status: 'published', qcScore: 95, publishedDate: '2026-05-11', earnings: 0 },
];

export const auditLogs = [
  { id: 'ACT-001', timestamp: '14:30:22', agent: 'CEO Agent', type: 'Approval', platform: 'Internal', description: 'Approved Q3 budget allocation', status: 'success', duration: '0.3s', cost: 0.02 },
  { id: 'ACT-002', timestamp: '14:28:15', agent: 'CFO Agent', type: 'Payment', platform: 'Stripe', description: 'Processed vendor invoice #4821', status: 'success', duration: '1.2s', cost: 0.05 },
  { id: 'ACT-003', timestamp: '14:25:00', agent: 'CMO Agent', type: 'Publish', platform: 'LinkedIn', description: 'Published article on AI trends', status: 'success', duration: '3.5s', cost: 0.08 },
  { id: 'ACT-004', timestamp: '14:20:45', agent: 'CTO Agent', type: 'API Call', platform: 'Instagram', description: 'Upload media to Instagram', status: 'failed', duration: '5.0s', cost: 0.04 },
  { id: 'ACT-005', timestamp: '14:15:30', agent: 'COO Agent', type: 'Sync', platform: 'Shopify', description: 'Sync inventory with Shopify', status: 'success', duration: '8.2s', cost: 0.12 },
  { id: 'ACT-006', timestamp: '14:10:00', agent: 'CSO Agent', type: 'Email', platform: 'Gmail', description: 'Send proposal to enterprise client', status: 'success', duration: '2.1s', cost: 0.06 },
  { id: 'ACT-007', timestamp: '14:05:15', agent: 'CAO Agent', type: 'Analysis', platform: 'Internal', description: 'Generate weekly performance report', status: 'success', duration: '12.5s', cost: 0.25 },
  { id: 'ACT-008', timestamp: '14:00:00', agent: 'Tech Manager', type: 'Deploy', platform: 'GitHub', description: 'Deploy connector update v2.3.6', status: 'success', duration: '45.0s', cost: 0.35 },
];

export const knowledgeItems = {
  wiki: [
    { id: '1', title: 'Agent Onboarding Guide', lastUpdated: '2026-05-10', agentsUsing: 12 },
    { id: '2', title: 'Platform Integration Best Practices', lastUpdated: '2026-05-08', agentsUsing: 8 },
    { id: '3', title: 'Financial Reporting Standards', lastUpdated: '2026-05-05', agentsUsing: 5 },
    { id: '4', title: 'Content Quality Guidelines', lastUpdated: '2026-05-01', agentsUsing: 6 },
  ],
  competitors: [
    { id: '1', name: 'AutoGPT', lastMonitored: '2026-05-14', insights: 24 },
    { id: '2', name: 'AgentGPT', lastMonitored: '2026-05-13', insights: 18 },
    { id: '3', name: 'MetaGPT', lastMonitored: '2026-05-12', insights: 15 },
  ],
  research: [
    { id: '1', topic: 'AI Agent Market Size 2026', date: '2026-05-10', agent: 'CAO Agent' },
    { id: '2', topic: 'E-Commerce Trends Q2 2026', date: '2026-05-08', agent: 'COO Agent' },
    { id: '3', topic: 'Social Media Algorithm Changes', date: '2026-05-05', agent: 'CMO Agent' },
  ],
  niches: [
    { id: '1', name: 'AI Productivity Tools', competition: 85, potential: 92, saturation: 'high', platforms: ['Twitter', 'LinkedIn', 'YouTube'], status: 'active' },
    { id: '2', name: 'No-Code Automation', competition: 72, potential: 88, saturation: 'medium', platforms: ['LinkedIn', 'YouTube'], status: 'testing' },
    { id: '3', name: 'Digital Nomad Lifestyle', competition: 90, potential: 65, saturation: 'high', platforms: ['Instagram', 'TikTok'], status: 'retired' },
    { id: '4', name: 'Developer Tools', competition: 60, potential: 95, saturation: 'low', platforms: ['GitHub', 'Twitter', 'YouTube'], status: 'active' },
  ],
};

export const boardMeetings = [
  { id: '1', type: 'Daily Standup', date: '2026-05-14', time: '09:00', duration: '15 min', decisions: 2, actions: 3, agenda: ['Yesterday\'s wins', 'Today\'s priorities', 'Blockers'] },
  { id: '2', type: 'Weekly Board', date: '2026-05-12', time: '14:00', duration: '45 min', decisions: 5, actions: 8, agenda: ['Weekly performance review', 'Strategic initiatives', 'Budget status'] },
  { id: '3', type: 'Monthly Strategy', date: '2026-05-01', time: '10:00', duration: '2 hr', decisions: 8, actions: 12, agenda: ['Monthly earnings report', 'Agent performance review', 'Platform expansion plan'] },
];
