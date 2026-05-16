import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const COLORS = ['#e8a94e', '#4ee88a', '#4e8ee8', '#a855f7', '#f97316'];

export default function Earnings() {
  const [period, setPeriod] = useState('Month');
  const { data: earningsData } = useApi<any[]>('/api/earnings');
  const { data: streamsData } = useApi<any[]>('/api/income-streams');
  const streams = streamsData || [];
  const earnings = earningsData || [];

  const totalEarnings = earnings.reduce((sum, e) => sum + (e.amount_inr || 0), 0);
  const totalStreams = streams.filter(s => s.status === 'active').reduce((s, st) => s + (st.earnings_this_month || 0), 0);
  const displayTotal = totalEarnings || totalStreams;
  
  const pieData = streams.filter(s => s.status === 'active').map(s => {
    const streamEarnings = earnings.filter(e => e.stream_id === s.id).reduce((sum, e) => sum + (e.amount_inr || 0), 0);
    return { name: s.name, value: streamEarnings || s.earnings_this_month || 0 };
  });

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-white">Earnings</h1>
        <div className="flex gap-1 bg-white/[0.04] rounded-lg p-0.5">
          {['Today', 'Week', 'Month', 'Year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-[#e8a94e] text-black' : 'text-[#adadad] hover:text-white'}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-xs text-[#adadad] uppercase tracking-wider mb-1">Total Earnings</p>
            <p className="text-4xl font-light text-white">₹{totalEarnings.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp className="w-4 h-4 text-[#4ee88a]" />
            <span className="text-sm text-[#4ee88a]">+{displayTotal > 0 ? ((totalEarnings / Math.max(totalStreams, 1)) * 100 - 100).toFixed(1) : 0}%</span>
            <span className="text-xs text-[#666]">vs last {period.toLowerCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-white mb-4">By Stream</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-xs text-[#adadad]">{d.name}: ₹{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-white mb-4">By Platform</h3>
          <div className="space-y-3">
            {streams.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-sm text-white w-32">{s.name}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${totalEarnings > 0 ? ((s.earnings_this_month || 0) / totalEarnings) * 100 : 0}%`, backgroundColor: s.color || '#e8a94e' }} />
                </div>
                <span className="text-sm font-medium text-[#e8a94e]">₹{(s.earnings_this_month || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
