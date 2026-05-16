import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, CheckCircle, AlertCircle, ArrowRight, Activity, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { departmentColors } from '../data/mockData';
import { useApi, api } from '../hooks/useApi';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: summary, refetch: refetchSummary } = useApi<any>('/api/dashboard/summary');
  const { data: agentsData, refetch: refetchAgents } = useApi<any[]>('/api/agents');
  const { data: approvalsData, refetch: refetchApprovals } = useApi<any[]>('/api/approvals');
  const { data: streamsData } = useApi<any[]>('/api/income-streams');
  const { data: earningsData } = useApi<any[]>('/api/earnings');
  const activityWsRef = useRef<WebSocket | null>(null);
  const healthWsRef = useRef<WebSocket | null>(null);

  const agents = agentsData || [];
  const approvals = approvalsData || [];
  const incomeStreams = streamsData || [];
  const activityFeed = summary?.activity_feed || [];
  
  const chartData = (() => {
    const byDate: Record<string, Record<string, number>> = {};
    const streamColors: Record<string, string> = {};
    incomeStreams.forEach(s => { streamColors[s.id] = s.color || '#e8a94e'; });
    
    (earningsData || []).forEach(e => {
      const date = e.date || '';
      const streamId = e.stream_id || '';
      const amount = e.amount_inr || 0;
      if (!byDate[date]) byDate[date] = {};
      byDate[date][streamId] = (byDate[date][streamId] || 0) + amount;
    });
    
    return Object.entries(byDate).slice(-7).map(([date, amounts]) => {
      const d = new Date(date);
      return { date: dayNames[d.getDay()], ...amounts };
    });
  })();

  const activeAgents = agents.filter((a: any) => a.status === 'active').length;
  const pendingApprovals = approvals.filter((a: any) => a.status === 'pending').length;
  const totalEarnings = incomeStreams.reduce((sum: number, s: any) => sum + (s.earnings_this_month || 0), 0);

  // WebSocket for live activity feed
  useEffect(() => {
    const ws = api.ws('/ws/activity');
    activityWsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        JSON.parse(event.data);
        refetchSummary();
        refetchAgents();
        refetchApprovals();
      } catch {
        // Ignore parse errors
      }
    };

    return () => { ws.close(); };
  }, []);

  // WebSocket for system health
  useEffect(() => {
    const ws = api.ws('/ws/system/health');
    healthWsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        JSON.parse(event.data);
        // Could update health indicators here
      } catch {
        // Ignore parse errors
      }
    };

    return () => { ws.close(); };
  }, []);

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div>
        <h1 className="text-2xl font-medium text-white">Dashboard</h1>
        <p className="text-sm text-[#adadad] mt-1">Welcome back to your command center</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${(totalEarnings / 1000).toFixed(1)}k`} trend={{ direction: 'up', value: 12.5 }} icon={<DollarSign className="w-5 h-5 text-[#e8a94e]" />} onClick={() => navigate('/earnings')} />
        <StatCard label="Active Agents" value={`${activeAgents}/${agents.length}`} trend={{ direction: 'up', value: 3.2 }} icon={<div className="w-2 h-2 rounded-full bg-[#4ee88a]" style={{ boxShadow: '0 0 6px rgba(78,232,138,0.5)', animation: 'pulse-glow 2s ease-in-out infinite' }} />} onClick={() => navigate('/agents')} />
        <StatCard label="Tasks Completed" value={agents.reduce((s: number, a: any) => s + (a.tasks_today || 0), 0).toLocaleString()} trend={{ direction: 'up', value: 8.7 }} icon={<CheckCircle className="w-5 h-5 text-[#4e8ee8]" />} onClick={() => navigate('/audit-log')} />
        <StatCard label="Pending Approvals" value={pendingApprovals.toString()} trend={{ direction: 'down', value: pendingApprovals > 5 ? 20 : 0 }} icon={<AlertCircle className={`w-5 h-5 ${pendingApprovals > 5 ? 'text-[#e84e68]' : 'text-[#e8a94e]'}`} />} onClick={() => navigate('/approvals')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-white">Earnings Overview</h2>
              <p className="text-xs text-[#adadad] mt-0.5">Revenue across all income streams</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{ date: 'No data' }]}>
                <defs><linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8a94e" stopOpacity={0.2} /><stop offset="100%" stopColor="#e8a94e" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                {incomeStreams.filter((s: any) => s.status === 'active').map((s: any, i: number) => (
                  <Area key={s.id} type="monotone" dataKey={s.id} stackId="1" stroke={s.color || '#e8a94e'} fill={i === 0 ? "url(#earningsGrad)" : "transparent"} strokeWidth={2} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {incomeStreams.filter((s: any) => s.status === 'active').map((s: any) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || '#e8a94e' }} />
                <span className="text-xs text-[#adadad]">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Live Activity</h2>
            <button onClick={() => navigate('/audit-log')} className="text-xs text-[#e8a94e] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-0 max-h-[340px] overflow-y-auto">
            {activityFeed.slice(0, 8).map((item: any, i: number) => (
              <div key={item.id || i} className={`py-3 ${i < 7 ? 'border-b border-white/[0.05]' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.result === 'success' ? 'bg-[#4ee88a]' : item.result === 'warning' ? 'bg-[#e8a94e]' : 'bg-[#e84e68]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.agent}</p>
                    <p className="text-xs text-[#adadad] truncate">{item.action}</p>
                    <p className="text-[10px] text-[#666] mt-0.5">{item.created_at ? item.created_at.slice(11, 16) : ''} · {item.platform}</p>
                  </div>
                </div>
              </div>
            ))}
            {activityFeed.length === 0 && <p className="text-sm text-[#666] text-center py-8">No activity yet</p>}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Department Status</h2>
          <button onClick={() => navigate('/agents')} className="text-xs text-[#e8a94e] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(departmentColors).map(([dept, color]) => {
            const deptAgents = agents.filter((a: any) => a.department === dept);
            const activeCount = deptAgents.filter((a: any) => a.status === 'active').length;
            const taskTotal = deptAgents.reduce((sum: number, a: any) => sum + (a.tasks_today || 0), 0);
            return (
              <button key={dept} onClick={() => navigate('/agents')} className="glass-card-hover p-5 text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">{dept}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCount === deptAgents.length && deptAgents.length > 0 ? '#4ee88a' : activeCount > 0 ? '#e8a94e' : '#e84e68', boxShadow: `0 0 6px ${activeCount === deptAgents.length && deptAgents.length > 0 ? 'rgba(78,232,138,0.5)' : activeCount > 0 ? 'rgba(232,169,78,0.5)' : 'rgba(232,78,104,0.5)'}` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#adadad]">{activeCount}/{deptAgents.length} active</span>
                  <span className="text-xs text-[#adadad]">{taskTotal} tasks</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${deptAgents.length > 0 ? (activeCount / deptAgents.length) * 100 : 0}%`, backgroundColor: color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Income Streams</h2>
            <button onClick={() => navigate('/income-streams')} className="text-xs text-[#e8a94e] hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeStreams.filter((s: any) => s.status === 'active').map((stream: any) => (
              <button key={stream.id} onClick={() => navigate('/income-streams')} className="glass-card-hover p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stream.color || '#e8a94e'}15` }}>
                      <Activity className="w-4 h-4" style={{ color: stream.color || '#e8a94e' }} />
                    </div>
                    <span className="text-sm font-medium text-white">{stream.name}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ee88a]" />
                </div>
                <p className="text-xl font-medium text-white">₹{(stream.earnings_this_month || 0).toLocaleString()}</p>
                <p className="text-xs text-[#adadad] mt-0.5">this month</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-[#666]">
                  <span>{stream.platform_count || 0} platforms</span>
                  <span>{stream.agent_count || 0} agents</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Needs Your Approval</h2>
            <button onClick={() => navigate('/approvals')} className="text-xs text-[#e8a94e] hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {approvals.filter((a: any) => a.status === 'pending').slice(0, 3).map((approval: any) => (
              <div key={approval.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${approval.priority === 'urgent' ? 'bg-[#e84e68]/15 text-[#e84e68]' : 'bg-[#4e8ee8]/15 text-[#4e8ee8]'}`}>{approval.priority}</span>
                  <span className="text-[10px] text-[#666]">{approval.type}</span>
                </div>
                <p className="text-sm text-white mb-1.5 line-clamp-2">{approval.title}</p>
                <p className="text-xs text-[#adadad] mb-3">{approval.agent} · {approval.waiting_time}</p>
                <div className="flex gap-2">
                  <button className="flex-1 h-8 rounded-md bg-[#4ee88a]/15 text-[#4ee88a] text-xs font-medium hover:bg-[#4ee88a]/25 transition-colors">Approve</button>
                  <button className="flex-1 h-8 rounded-md bg-[#e84e68]/15 text-[#e84e68] text-xs font-medium hover:bg-[#e84e68]/25 transition-colors">Reject</button>
                </div>
              </div>
            ))}
            {approvals.filter((a: any) => a.status === 'pending').length === 0 && <p className="text-sm text-[#666] text-center py-4">All caught up!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon, onClick }: { label: string; value: string; trend: { direction: 'up' | 'down'; value: number }; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left group">
      <div className="glass-card-hover p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#adadad] uppercase tracking-wider">{label}</span>
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">{icon}</div>
        </div>
        <p className="text-2xl font-medium text-white">{value}</p>
        <div className="flex items-center gap-1 mt-1.5">
          {trend.direction === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-[#4ee88a]" /> : <TrendingDown className="w-3.5 h-3.5 text-[#e84e68]" />}
          <span className={`text-xs ${trend.direction === 'up' ? 'text-[#4ee88a]' : 'text-[#e84e68]'}`}>{trend.value}%</span>
          <span className="text-xs text-[#666]">vs yesterday</span>
        </div>
      </div>
    </button>
  );
}
