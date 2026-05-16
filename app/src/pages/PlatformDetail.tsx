import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, BarChart3, Activity, DollarSign, Settings, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useApi';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PlatformDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { data: connectorData } = useApi<any>(`/api/connectors/${id}`);
  const { data: earningsData } = useApi<any[]>('/api/earnings');
  const name = connectorData?.name || id;
  
  const platformEarnings = (() => {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayTotal = (earningsData || [])
        .filter(e => e.platform_id === id && e.date === dateStr)
        .reduce((sum, e) => sum + (e.amount_inr || 0), 0);
      data.push({ date: dayNames[d.getDay()], earnings: dayTotal });
    }
    return data;
  })();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logs', label: 'Logs', icon: FileText },
  ];

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <button onClick={() => navigate('/connectors')} className="flex items-center gap-2 text-sm text-[#adadad] hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Connectors</button>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: 'linear-gradient(135deg, rgba(232,169,78,0.2), rgba(232,169,78,0.05))' }}>{name?.[0]}</div>
        <div>
          <h1 className="text-2xl font-medium text-white">{name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4ee88a]/15 text-[#4ee88a] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {connectorData?.status || 'connected'}</span>
            <span className="text-xs text-[#adadad]">Since {connectorData?.connected_since || '-'}</span>
          </div>
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
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium text-white mb-4">About</h3>
              <p className="text-sm text-[#adadad]">{connectorData?.description || 'Platform integration'}</p>
              <div className="mt-4 flex items-center gap-2"><span className="text-xs text-[#666]">Category:</span><span className="text-xs text-[#e8a94e]">{connectorData?.category || '-'}</span></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[{ label: 'Status', value: connectorData?.status || '-' }, { label: 'Category', value: connectorData?.category || '-' }, { label: 'Last Used', value: connectorData?.last_used || '-' }, { label: 'Agent', value: connectorData?.agent_using || '-' }].map(s => (
                <div key={s.label} className="glass-card p-3 text-center"><p className="text-lg font-medium text-white">{s.value}</p><p className="text-[10px] text-[#adadad]">{s.label}</p></div>))}
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-white mb-4">Potential Earnings</h3>
            <p className="text-2xl font-medium text-[#e8a94e]">{connectorData?.potential_earnings || '-'}</p>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="glass-card p-5"><p className="text-sm text-[#666] text-center py-8">Activity log loading...</p></div>
      )}

      {activeTab === 'earnings' && (
        <div className="glass-card p-5">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformEarnings.length > 0 ? platformEarnings : [{ date: 'No data', earnings: 0 }]}>
                <defs><linearGradient id="platGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8a94e" stopOpacity={0.2} /><stop offset="100%" stopColor="#e8a94e" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="earnings" stroke="#e8a94e" fill="url(#platGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-card p-5 max-w-xl space-y-4">
          <div><label className="text-xs text-[#adadad] block mb-1.5">Status</label><span className="text-sm text-white">{connectorData?.status}</span></div>
          <div><label className="text-xs text-[#adadad] block mb-1.5">Category</label><span className="text-sm text-white">{connectorData?.category}</span></div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="glass-card p-5"><p className="text-sm text-[#666] text-center py-8">No logs yet</p></div>
      )}
    </div>
  );
}
