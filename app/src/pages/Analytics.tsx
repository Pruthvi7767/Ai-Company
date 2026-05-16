import { useState } from 'react';
import { Download, TrendingUp, Users, Globe, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApi } from '../hooks/useApi';

export default function Analytics() {
  const [period, setPeriod] = useState('Month');
  const { data: agentsData } = useApi<any[]>('/api/agents');
  const { data: analyticsAgents } = useApi<any[]>('/api/analytics/agents');
  const { data: revenueData } = useApi<any>('/api/analytics/revenue');
  const { data: platformData } = useApi<any[]>('/api/analytics/platforms');
  const { data: competitiveData } = useApi<any>('/api/analytics/competitive');
  
  const agents = agentsData || [];
  const agentPerfData = (analyticsAgents || agents.slice(0, 8)).map(a => ({ name: (a.name || '').split(' ')[0], tasks: a.tasks_today || a.tasks || 0, roi: a.roi || 0 }));
  
  const chartData = (revenueData?.trend || []).map((t: any) => ({
    month: t.date?.slice(5) || '',
    revenue: t.amount || 0
  }));
  
  const platformGrowth = (platformData || []).map(p => ({
    platform: p.name,
    growth: p.total_earnings > 0 ? Math.round((p.total_earnings / 1000) * 10) / 10 : 0,
    earnings: p.total_earnings
  }));
  
  const totalRevenue = revenueData?.total || 0;
  const marketOpp = competitiveData?.market_opportunity || '₹0';
  const activeAgents = competitiveData?.active_agents || 0;
  const connectedPlatforms = competitiveData?.connected_platforms || 0;

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-white">Analytics</h1>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-white/[0.04] rounded-lg p-0.5">
            {['Today', 'Week', 'Month', 'Year'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-[#e8a94e] text-black' : 'text-[#adadad]'}`}>{p}</button>))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] text-xs text-[#adadad] hover:bg-white/[0.07]"><Download className="w-3.5 h-3.5" /> Export</button>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-[#e8a94e]" /><h2 className="text-lg font-medium text-white">Revenue Intelligence</h2><span className="ml-auto text-sm text-[#adadad]">Total: ₹{(totalRevenue / 1000).toFixed(1)}k</span></div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.length > 0 ? chartData : [{ month: 'No data', revenue: 0 }]}>
              <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8a94e" stopOpacity={0.2} /><stop offset="100%" stopColor="#e8a94e" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#e8a94e" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-[#4e8ee8]" /><h2 className="text-lg font-medium text-white">Agent Performance</h2></div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="tasks" fill="#e8a94e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-[#4ee88a]" /><h2 className="text-lg font-medium text-white">Platform Growth</h2></div>
          <div className="space-y-3">
            {platformGrowth.length > 0 ? platformGrowth.map(p => (
              <div key={p.platform} className="flex items-center gap-3">
                <span className="text-sm text-white w-24">{p.platform}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(p.growth) * 3, 100)}%`, backgroundColor: p.growth >= 0 ? '#4ee88a' : '#e84e68' }} />
                </div>
                <span className={`text-sm font-medium ${p.growth >= 0 ? 'text-[#4ee88a]' : 'text-[#e84e68]'}`}>{p.growth > 0 ? '+' : ''}{p.growth}%</span>
              </div>)) : <p className="text-sm text-[#666] text-center py-4">No platform data</p>}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4"><Target className="w-5 h-5 text-[#e84e68]" /><h2 className="text-lg font-medium text-white">Competitive Intelligence</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03]">
            <p className="text-xs text-[#666] mb-1">Market Opportunity</p><p className="text-lg font-medium text-white">{marketOpp}</p><p className="text-xs text-[#adadad] mt-1">Across {connectedPlatforms} platforms</p><p className="text-xs text-[#e8a94e] mt-1">{activeAgents} active agents</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03]">
            <p className="text-xs text-[#666] mb-1">Active Agents</p><p className="text-lg font-medium text-white">{activeAgents}</p><p className="text-xs text-[#adadad] mt-1">Processing tasks</p><p className="text-xs text-[#4ee88a] mt-1">All systems running</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.03]">
            <p className="text-xs text-[#666] mb-1">Connected Platforms</p><p className="text-lg font-medium text-white">{connectedPlatforms}</p><p className="text-xs text-[#adadad] mt-1">Integrations active</p><p className="text-xs text-[#4e8ee8] mt-1">Syncing data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
