import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const severityColors: Record<string, { bg: string; border: string }> = {
  green: { bg: 'bg-[#4ee88a]/10', border: 'border-l-[#4ee88a]' },
  yellow: { bg: 'bg-[#e8a94e]/10', border: 'border-l-[#e8a94e]' },
  orange: { bg: 'bg-[#f97316]/10', border: 'border-l-[#f97316]' },
  red: { bg: 'bg-[#e84e68]/10', border: 'border-l-[#e84e68]' },
  black: { bg: 'bg-[#666]/10', border: 'border-l-[#666]' },
};
const statusColors: Record<string, string> = {
  'auto-fixed': 'bg-[#4ee88a]/15 text-[#4ee88a]',
  'needs-attention': 'bg-[#e8a94e]/15 text-[#e8a94e]',
  'resolved': 'bg-[#4e8ee8]/15 text-[#4e8ee8]',
  'ongoing': 'bg-[#e84e68]/15 text-[#e84e68]',
};

export default function ErrorLogs() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: errorData } = useApi<any[]>('/api/errors');
  const errors = errorData || [];

  const filtered = errors.filter(e => {
    if (search && !e.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (severityFilter !== 'All' && e.severity !== severityFilter) return false;
    return true;
  });

  const stats = {
    total: errors.length,
    autoFixed: errors.filter(e => e.status === 'auto-fixed').length,
    needsAttention: errors.filter(e => e.status === 'needs-attention').length,
    critical: errors.filter(e => e.severity === 'red' || e.severity === 'black').length,
  };

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div><h1 className="text-2xl font-medium text-white">Error Logs</h1><p className="text-sm text-[#adadad] mt-1">System error monitoring and diagnostics</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label: 'Total Today', value: stats.total, color: '' }, { label: 'Auto-Fixed', value: stats.autoFixed, color: 'text-[#4ee88a]' }, { label: 'Needs Attention', value: stats.needsAttention, color: 'text-[#e8a94e]' }, { label: 'Critical', value: stats.critical, color: 'text-[#e84e68]' }].map(s => (
          <div key={s.label} className="glass-card p-3 text-center"><p className={`text-xl font-medium ${s.color || 'text-white'}`}>{s.value}</p><p className="text-[10px] text-[#adadad]">{s.label}</p></div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input type="text" placeholder="Search errors..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" />
        </div>
        <div className="flex gap-1">
          {['All', 'green', 'yellow', 'orange', 'red'].map(s => (
            <button key={s} onClick={() => setSeverityFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${severityFilter === s ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad]'}`}>
              {s === 'All' ? 'All' : <div className={`w-2 h-2 rounded-full ${s === 'green' ? 'bg-[#4ee88a]' : s === 'yellow' ? 'bg-[#e8a94e]' : s === 'orange' ? 'bg-[#f97316]' : 'bg-[#e84e68]'}`} />}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map(error => (
          <div key={error.id} className={`glass-card overflow-hidden border-l-2 ${severityColors[error.severity]?.border || 'border-l-[#666]'}`}>
            <button onClick={() => setExpandedId(expandedId === error.id ? null : error.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors">
              <span className="text-xs text-[#666] mono">{error.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{error.description}</p>
                <p className="text-xs text-[#adadad]">{error.agent} · {error.platform}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[error.status] || ''}`}>{error.status?.replace('-', ' ')}</span>
              <ChevronDown className={`w-4 h-4 text-[#666] transition-transform ${expandedId === error.id ? 'rotate-180' : ''}`} />
            </button>
            {expandedId === error.id && (
              <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-2">
                <div className="p-3 rounded-lg bg-black/30"><p className="text-[10px] text-[#666] mb-1">Full Error</p><p className="text-xs text-[#adadad] mono">{error.type}: {error.description}</p></div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-[#666] text-center py-8">No errors found</p>}
      </div>
    </div>
  );
}
