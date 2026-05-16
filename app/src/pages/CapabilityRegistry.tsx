import { useState } from 'react';
import { Zap, Lock } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const statusConfig = { active: { color: '#4ee88a', label: 'Active' }, dormant: { color: '#666', label: 'Dormant' }, partial: { color: '#e8a94e', label: 'Partial' } };

export default function CapabilityRegistry() {
  const [filter, setFilter] = useState('All');
  const { data: capsData } = useApi<any[]>('/api/capabilities');
  const capabilities = capsData || [];
  const filtered = filter === 'All' ? capabilities : capabilities.filter(c => c.status === filter.toLowerCase());
  const activeCount = capabilities.filter(c => c.status === 'active').length;
  const dormantCount = capabilities.filter(c => c.status === 'dormant').length;

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div><h1 className="text-2xl font-medium text-white">Capability Registry</h1><p className="text-sm text-[#adadad] mt-1">Manage agent capabilities and integrations</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label: 'Active', value: activeCount }, { label: 'Dormant', value: dormantCount }, { label: 'Total', value: capabilities.length }, { label: 'Agents', value: capabilities.reduce((s, c) => s + (c.agents || 0), 0) }].map(s => (
          <div key={s.label} className="glass-card p-3 text-center"><p className="text-xl font-medium text-white">{s.value}</p><p className="text-[10px] text-[#adadad]">{s.label}</p></div>))}
      </div>
      <div className="flex gap-1">{['All', 'Active', 'Dormant', 'Partial'].map(f => (
        <button key={f} onClick={() => setFilter(f)}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad] hover:bg-white/[0.07]'}`}>{f}</button>))}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cap => {
          const config = statusConfig[cap.status as keyof typeof statusConfig] || statusConfig.dormant;
          return (
            <div key={cap.id} className="glass-card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${config.color}15` }}>
                  {cap.status === 'dormant' ? <Lock className="w-5 h-5" style={{ color: config.color }} /> : <Zap className="w-5 h-5" style={{ color: config.color }} />}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${config.color}15`, color: config.color }}>{config.label}</span>
              </div>
              <h3 className="text-sm font-medium text-white mb-1">{cap.name}</h3>
              <p className="text-xs text-[#666] mb-3">{cap.required_api}</p>
              <div className="flex items-center justify-between text-xs text-[#adadad]"><span>{cap.platforms || 0} platforms</span><span>{cap.agents || 0} agents</span></div>
            </div>);
        })}
        {filtered.length === 0 && <p className="text-sm text-[#666] text-center py-8 col-span-3">No capabilities found</p>}
      </div>
    </div>
  );
}
