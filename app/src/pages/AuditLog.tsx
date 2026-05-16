import { useState } from 'react';
import { Search, Download, CheckCircle, XCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function AuditLog() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const { data: auditData } = useApi<any[]>('/api/audit-log');
  const auditLogs = auditData || [];

  const filtered = auditLogs.filter(a => {
    if (search && !a.description?.toLowerCase().includes(search.toLowerCase()) && !a.agent_id?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && a.result !== statusFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div><h1 className="text-2xl font-medium text-white">Audit Log</h1><p className="text-sm text-[#adadad] mt-1">Complete record of every system action</p></div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input type="text" placeholder="Search audit log..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" /></div>
        {['All', 'Success', 'Failed'].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === f ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad]'}`}>{f}</button>))}
        <div className="flex gap-2 ml-auto">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] text-xs text-[#adadad] hover:bg-white/[0.07]"><Download className="w-3.5 h-3.5" /> CSV</button>
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/[0.06]">{['Time', 'ID', 'Agent', 'Type', 'Description', 'Status', 'Duration', 'Cost'].map(h => (
            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#666] uppercase">{h}</th>))}</tr></thead>
          <tbody>
            {filtered.map(log => (
              <>
                <tr key={log.id} onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-xs text-[#666] mono">{log.created_at ? log.created_at.slice(11, 19) : '-'}</td>
                  <td className="px-4 py-3 text-xs text-[#666] mono">{log.id}</td>
                  <td className="px-4 py-3 text-sm text-white">{log.agent_id}</td>
                  <td className="px-4 py-3 text-xs text-[#adadad]">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-white max-w-[200px] truncate">{log.description || log.action}</td>
                  <td className="px-4 py-3">{log.result === 'success' ? <CheckCircle className="w-4 h-4 text-[#4ee88a]" /> : <XCircle className="w-4 h-4 text-[#e84e68]" />}</td>
                  <td className="px-4 py-3 text-xs text-[#adadad]">{log.duration || '-'}</td>
                  <td className="px-4 py-3 text-xs text-white">₹{(log.cost_inr || 0).toFixed(2)}</td>
                </tr>
                {expandedId === log.id && (
                  <tr><td colSpan={8} className="px-4 py-4 bg-white/[0.02]">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div><span className="text-[#666]">Model:</span> <span className="text-white">NVIDIA Llama 70B</span></div>
                      <div><span className="text-[#666]">Tokens:</span> <span className="text-white">{log.tokens_used || 0}</span></div>
                      <div><span className="text-[#666]">Cost INR:</span> <span className="text-white">₹{(log.cost_inr || 0).toFixed(2)}</span></div>
                    </div>
                  </td></tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-[#666] text-center py-8">No audit entries</p>}
      </div>
    </div>
  );
}
