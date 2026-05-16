import { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const statusColors: Record<string, string> = { published: 'bg-[#4ee88a]/15 text-[#4ee88a]', scheduled: 'bg-[#e8a94e]/15 text-[#e8a94e]', failed: 'bg-[#e84e68]/15 text-[#e84e68]', draft: 'bg-white/[0.08] text-[#adadad]' };

export default function ContentManager() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { data: contentData } = useApi<any[]>('/api/content');
  const contentItems = contentData || [];

  const filtered = contentItems.filter(c => {
    if (search && !c.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div><h1 className="text-2xl font-medium text-white">Content Manager</h1><p className="text-sm text-[#adadad] mt-1">Manage published and scheduled content</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[{ label: 'Total Published', value: contentItems.filter(c => c.status === 'published').length }, { label: 'Scheduled', value: contentItems.filter(c => c.status === 'scheduled').length }, { label: 'Draft', value: contentItems.filter(c => c.status === 'draft').length }, { label: 'Avg QC Score', value: contentItems.length > 0 ? Math.round(contentItems.reduce((s, c) => s + (c.qc_score || 0), 0) / contentItems.length) : 0 }, { label: 'Total Earnings', value: `₹${contentItems.reduce((s, c) => s + (c.earnings || 0), 0)}` }].map(s => (
          <div key={s.label} className="glass-card p-3 text-center"><p className="text-lg font-medium text-white">{s.value}</p><p className="text-[10px] text-[#adadad]">{s.label}</p></div>))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input type="text" placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" /></div>
        {['All', 'Published', 'Scheduled', 'Draft'].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === f ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad]'}`}>{f}</button>))}
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/[0.06]">{['Title', 'Type', 'Platform', 'Agent', 'Status', 'QC', 'Published', 'Earnings', ''].map(h => (
            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#666] uppercase">{h}</th>))}</tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors">
                <td className="px-4 py-3 text-sm text-white max-w-[200px] truncate">{item.title}</td>
                <td className="px-4 py-3 text-xs text-[#adadad]">{item.type}</td>
                <td className="px-4 py-3 text-xs text-[#adadad]">{item.platform}</td>
                <td className="px-4 py-3 text-xs text-[#adadad]">{item.agent}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[item.status] || ''}`}>{item.status}</span></td>
                <td className="px-4 py-3 text-sm text-white">{item.qc_score > 0 ? item.qc_score : '-'}</td>
                <td className="px-4 py-3 text-xs text-[#adadad]">{item.published_date}</td>
                <td className="px-4 py-3 text-sm text-white">₹{item.earnings || 0}</td>
                <td className="px-4 py-3"><button className="p-1.5 rounded-md hover:bg-white/[0.08]"><MoreVertical className="w-4 h-4 text-[#666]" /></button></td>
              </tr>))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-[#666] text-center py-8">No content found</p>}
      </div>
    </div>
  );
}
