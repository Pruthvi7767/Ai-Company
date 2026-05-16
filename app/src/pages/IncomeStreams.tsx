import { useState } from 'react';
import { Activity, Pause, Settings, Lock, ArrowRight, TrendingUp, Layers } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useApi';

export default function IncomeStreams() {
  const [expandedStream, setExpandedStream] = useState<string | null>(null);
  const { data: streamsData } = useApi<any[]>('/api/income-streams');
  const { data: earningsData } = useApi<any[]>('/api/earnings');
  const incomeStreams = streamsData || [];
  const earnings = earningsData || [];

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">Income Streams</h1>
          <p className="text-sm text-[#adadad] mt-1">{incomeStreams.filter(s => s.status === 'active').length} active streams</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#adadad]">
          <Layers className="w-4 h-4" />
          <span>Total: ₹{incomeStreams.filter(s => s.status === 'active').reduce((s, st) => s + (st.earnings_this_month || 0), 0).toLocaleString()}/mo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {incomeStreams.map(stream => {
          const isExpanded = expandedStream === stream.id;
          const isDormant = stream.status === 'dormant';
          const streamEarnings = earnings.filter(e => e.stream_id === stream.id);
          const history = (() => {
            const today = new Date();
            const data = [];
            for (let i = 6; i >= 0; i--) {
              const d = new Date(today);
              d.setDate(d.getDate() - i);
              const dateStr = d.toISOString().slice(0, 10);
              const dayTotal = streamEarnings.filter(e => e.date === dateStr).reduce((sum, e) => sum + (e.amount_inr || 0), 0);
              data.push({ i, v: dayTotal || (stream.earnings_this_month ? stream.earnings_this_month / 7 : 0) });
            }
            return data;
          })();
          const streamTotal = streamEarnings.reduce((sum, e) => sum + (e.amount_inr || 0), 0);
          const prevTotal = stream.earnings_this_month || 0;
          const growth = prevTotal > 0 ? (((streamTotal - prevTotal) / prevTotal) * 100).toFixed(1) : '0.0';

          return (
            <div key={stream.id} className={`glass-card overflow-hidden transition-all ${isDormant ? 'opacity-60' : ''}`}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stream.color || '#e8a94e'}15` }}>
                      {isDormant ? <Lock className="w-5 h-5 text-[#666]" /> : <Activity className="w-5 h-5" style={{ color: stream.color || '#e8a94e' }} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{stream.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${stream.status === 'active' ? 'bg-[#4ee88a]' : stream.status === 'paused' ? 'bg-[#e8a94e]' : 'bg-[#666]'}`} />
                        <span className="text-[10px] text-[#adadad] capitalize">{stream.status}</span>
                      </div>
                    </div>
                  </div>
                  {!isDormant && (
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-md hover:bg-white/[0.08] text-[#666]"><Pause className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-md hover:bg-white/[0.08] text-[#666]"><Settings className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-2xl font-medium text-white">₹{(stream.earnings_this_month || 0).toLocaleString()}</p>
                    <p className="text-xs text-[#adadad]">this month</p>
                  </div>
                  {!isDormant && (
                    <div className="w-24 h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history.map((v, i) => ({ i, v }))}>
                          <Line type="monotone" dataKey="v" stroke={stream.color || '#e8a94e'} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {!isDormant ? (
                  <div className="flex items-center justify-between text-xs text-[#adadad]">
                    <span>{stream.platform_count || 0} platforms</span>
                    <span>{stream.agent_count || 0} agents</span>
                    <button onClick={() => setExpandedStream(isExpanded ? null : stream.id)}
                      className="text-[#e8a94e] hover:underline flex items-center gap-1">{isExpanded ? 'Less' : 'More'} <ArrowRight className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="text-center"><p className="text-xs text-[#666] mb-2">Requires: Platform Connection</p></div>
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-white/[0.06] p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-[#666]">Growth</p><div className={`flex items-center gap-1 ${Number(growth) >= 0 ? 'text-[#4ee88a]' : 'text-[#e84e68]'}`}><TrendingUp className="w-3 h-3" /><span className="text-sm">{Number(growth) >= 0 ? '+' : ''}{growth}%</span></div></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
