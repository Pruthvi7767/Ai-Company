import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Pause, FileText, BarChart3, Cpu, Clock, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useApi';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { data: agentData } = useApi<any>(`/api/agents/${id}`);
  const { data: agentsData } = useApi<any[]>('/api/agents');
  const { data: auditData } = useApi<any[]>(`/api/audit-log`);
  const agents = agentsData || [];
  const agent = agentData || agents.find(a => a.id === id) || agents[0];
  const parentAgent = agents.find(a => a.id === agent?.parent_id);
  const subAgents = agents.filter(a => a.parent_id === agent?.id);
  
  const agentAudit = (auditData || []).filter(a => a.agent_id === id || a.agent === agent?.name);
  const performanceData = (() => {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayAudit = agentAudit.filter(a => a.created_at?.startsWith(d.toISOString().slice(0, 10)));
      data.push({
        day: dayNames[d.getDay()],
        tasks: dayAudit.length || (agent?.tasks_today ? Math.floor(agent.tasks_today / 7) : 0),
        success: agent?.success_rate || 95,
        cost: dayAudit.reduce((sum, a) => sum + (a.cost_inr || 0), 0)
      });
    }
    return data;
  })();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'skills', label: 'Skills', icon: Cpu },
    { id: 'tasks', label: 'Task History', icon: Clock },
    { id: 'config', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <button onClick={() => navigate('/agents')} className="flex items-center gap-2 text-sm text-[#adadad] hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Directory</button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/[0.08] flex items-center justify-center text-2xl font-bold text-[#e8a94e]">{(agent?.name || 'A')[0]}</div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a0a0b] ${agent?.status === 'active' ? 'bg-[#4ee88a]' : agent?.status === 'idle' ? 'bg-[#e8a94e]' : 'bg-[#666]'}`} />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-white">{agent?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-[#adadad]">{agent?.role}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-[#adadad]">{agent?.department}</span>
              <span className="text-[10px] text-[#666]">v{agent?.version || '2.0'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/chat')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] text-sm text-[#adadad] hover:bg-white/[0.08] transition-colors"><MessageSquare className="w-4 h-4" /> Chat</button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] text-sm text-[#adadad] hover:bg-white/[0.08] transition-colors"><Pause className="w-4 h-4" /> Pause</button>
          <button onClick={() => navigate('/error-logs')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] text-sm text-[#adadad] hover:bg-white/[0.08] transition-colors"><FileText className="w-4 h-4" /> Logs</button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06] pb-px">
        {tabs.map(tab => { const Icon = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id ? 'text-[#e8a94e] border-[#e8a94e]' : 'text-[#adadad] border-transparent hover:text-white'}`}>
            <Icon className="w-4 h-4" /> {tab.label}</button>); })}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-white mb-4">Current Status</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-[#666]">Current Task</p><p className="text-sm text-white">{agent?.current_task || 'Idle'}</p></div>
              <div><p className="text-xs text-[#666]">Tier</p><p className="text-sm text-white">{agent?.tier || 'manager'}</p></div>
              <div><p className="text-xs text-[#666]">Status</p><p className={`text-sm ${agent?.status === 'active' ? 'text-[#4ee88a]' : 'text-[#e8a94e]'}`}>{agent?.status}</p></div>
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-white mb-4">Agent File</h3>
            <div className="space-y-3">
              <div><p className="text-xs text-[#666]">Agent ID</p><p className="text-sm text-white mono">{agent?.id?.toUpperCase()}-AGENT</p></div>
              <div><p className="text-xs text-[#666]">Parent</p><p className="text-sm text-white">{parentAgent?.name || 'None (Root)'}</p></div>
              <div><p className="text-xs text-[#666]">Sub-agents</p><p className="text-sm text-white">{subAgents.length}</p></div>
              <div><p className="text-xs text-[#666]">Heartbeat</p><p className="text-sm text-white">Every 30s · Last: {agent?.last_heartbeat || '30s ago'}</p></div>
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-xs text-[#adadad]">Tasks Today</span><span className="text-sm text-white font-medium">{agent?.tasks_today || 0}</span></div>
              <div className="flex justify-between"><span className="text-xs text-[#adadad]">Success Rate</span><span className="text-sm text-[#4ee88a] font-medium">{agent?.success_rate || 0}%</span></div>
              <div className="flex justify-between"><span className="text-xs text-[#adadad]">ROI Score</span><span className="text-sm text-[#e8a94e] font-medium">{agent?.roi || 0}x</span></div>
              <div className="flex justify-between"><span className="text-xs text-[#adadad]">Department</span><span className="text-sm text-white font-medium">{agent?.department || '-'}</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5"><h3 className="text-sm font-medium text-white mb-4">Tasks Completed</h3>
              <div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={performanceData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="day" stroke="#666" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} /><Line type="monotone" dataKey="tasks" stroke="#e8a94e" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
            </div>
            <div className="glass-card p-5"><h3 className="text-sm font-medium text-white mb-4">Success Rate</h3>
              <div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={performanceData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="day" stroke="#666" fontSize={11} tickLine={false} axisLine={false} /><YAxis domain={[80, 100]} stroke="#666" fontSize={11} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} /><Line type="monotone" dataKey="success" stroke="#4ee88a" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="glass-card p-8 text-center"><p className="text-sm text-[#666]">Skills loading from FTS5...</p></div>
      )}

      {activeTab === 'tasks' && (
        <div className="glass-card p-8 text-center"><p className="text-sm text-[#666]">Task history loading...</p></div>
      )}

      {activeTab === 'config' && (
        <div className="glass-card p-5 max-w-2xl">
          <h3 className="text-sm font-medium text-white mb-4">Agent Configuration</h3>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06]">
              <p className="text-xs text-[#666] mb-1">SOUL.md</p>
              <pre className="text-xs text-[#adadad] mono whitespace-pre-wrap">{`# ${agent?.name} - Agent Configuration\n## Role: ${agent?.role}\n## Department: ${agent?.department}\n\n### Core Directives\n- Process tasks with high accuracy\n- Report results regularly\n- Collaborate via ACP`}</pre>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-[#666]">Heartbeat Interval</p><p className="text-sm text-white">30 seconds</p></div>
              <div><p className="text-xs text-[#666]">Budget Limit</p><p className="text-sm text-white">$50/day</p></div>
              <div><p className="text-xs text-[#666]">Primary Model</p><p className="text-sm text-white">{agent?.tier === 'csuite' ? 'NVIDIA Nemotron 340B' : 'NVIDIA Llama 70B'}</p></div>
              <div><p className="text-xs text-[#666]">Timeout</p><p className="text-sm text-white">300 seconds</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
