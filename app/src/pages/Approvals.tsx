import { useState } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function Approvals() {
  const [filter, setFilter] = useState('All');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const { data: approvalsData, refetch } = useApi<any[]>('/api/approvals');
  const approvals = approvalsData || [];

  const pending = approvals.filter(a => a.status === 'pending');
  const filtered = filter === 'All' ? pending : filter === 'Urgent' ? pending.filter(a => a.priority === 'urgent') : pending.filter(a => a.priority === 'normal');

  const handleAction = async (id: string, action: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await fetch(`${API_BASE}/api/approvals/${id}/${action}`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      refetch();
    } catch {}
  };

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium text-white">Approvals</h1>
          <span className="min-w-[24px] h-6 rounded-full bg-[#e84e68] text-black text-xs font-bold flex items-center justify-center px-1.5">{pending.length}</span>
        </div>
        <div className="flex gap-1">
          {['All', 'Urgent', 'Normal'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad] hover:bg-white/[0.07]'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(approval => (
          <div key={approval.id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${approval.priority === 'urgent' ? 'bg-[#e84e68]/15 text-[#e84e68]' : 'bg-[#4e8ee8]/15 text-[#4e8ee8]'}`}>{approval.priority}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-[#adadad]">{approval.type}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#666]"><Clock className="w-3.5 h-3.5" /><span>Waiting {approval.waiting_time}</span></div>
            </div>
            <h3 className="text-sm font-medium text-white mb-2">{approval.title}</h3>
            <p className="text-xs text-[#adadad] mb-4">Requested by {approval.agent}</p>
            <div className="flex gap-2">
              <button onClick={() => handleAction(approval.id, 'approve')} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4ee88a]/15 text-[#4ee88a] text-xs font-medium hover:bg-[#4ee88a]/25 transition-colors"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
              <button onClick={() => handleAction(approval.id, 'reject')} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e84e68]/15 text-[#e84e68] text-xs font-medium hover:bg-[#e84e68]/25 transition-colors"><XCircle className="w-3.5 h-3.5" /> Reject</button>
              <button onClick={() => handleAction(approval.id, 'later')} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e8a94e]/15 text-[#e8a94e] text-xs font-medium hover:bg-[#e8a94e]/25 transition-colors"><Clock className="w-3.5 h-3.5" /> Defer</button>
              <button onClick={() => setShowDetail(showDetail === approval.id ? null : approval.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.05] text-[#adadad] text-xs hover:bg-white/[0.08]">Details <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetail === approval.id ? 'rotate-180' : ''}`} /></button>
            </div>
            {showDetail === approval.id && (
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
                <p className="text-xs text-[#adadad]"><span className="text-[#666]">Context:</span> {approval.context || 'Auto-generated based on current performance analysis.'}</p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-[#666] text-center py-8">No pending approvals</p>}
      </div>
    </div>
  );
}
