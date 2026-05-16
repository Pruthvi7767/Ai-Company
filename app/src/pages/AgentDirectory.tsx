import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid3X3, List } from 'lucide-react';
import { departmentColors } from '../lib/constants';
import { useApi } from '../hooks/useApi';

export default function AgentDirectory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('name');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data: agentsData } = useApi<any[]>('/api/agents');
  const agents = agentsData || [];

  const departments = ['All', ...Object.keys(departmentColors)];
  const statuses = ['All', 'Active', 'Idle', 'Error', 'Dormant'];

  let filtered = agents.filter((a: any) => {
    if (search && !a.name?.toLowerCase().includes(search.toLowerCase()) && !a.role?.toLowerCase().includes(search.toLowerCase())) return false;
    if (department !== 'All' && a.department !== department) return false;
    if (status !== 'All' && a.status !== status.toLowerCase()) return false;
    return true;
  });

  if (sort === 'name') filtered = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  else if (sort === 'roi') filtered = [...filtered].sort((a, b) => (b.roi || 0) - (a.roi || 0));
  else if (sort === 'tasks') filtered = [...filtered].sort((a, b) => (b.tasks_today || 0) - (a.tasks_today || 0));

  const activeCount = agents.filter((a: any) => a.status === 'active').length;
  const dormantCount = agents.filter((a: any) => a.status === 'dormant').length;

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div>
        <h1 className="text-2xl font-medium text-white">Agent Directory</h1>
        <p className="text-sm text-[#adadad] mt-1">{agents.length} total agents</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input type="text" placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" />
        </div>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#e8a94e]">
          {departments.map(d => <option key={d} value={d} className="bg-[#1a1a1b]">{d}</option>)}
        </select>
        <div className="flex gap-1">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${status === s ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad] hover:bg-white/[0.07]'}`}>{s}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#e8a94e]">
          <option value="name" className="bg-[#1a1a1b]">Name A-Z</option>
          <option value="roi" className="bg-[#1a1a1b]">Highest ROI</option>
          <option value="tasks" className="bg-[#1a1a1b]">Most Active</option>
        </select>
        <div className="flex gap-1 ml-auto">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg ${view === 'grid' ? 'bg-white/[0.1] text-white' : 'text-[#666] hover:text-[#adadad]'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg ${view === 'list' ? 'bg-white/[0.1] text-white' : 'text-[#666] hover:text-[#adadad]'}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label: 'Total', value: agents.length }, { label: 'Active', value: activeCount }, { label: 'Dormant', value: dormantCount }, { label: 'Avg ROI', value: `${(agents.reduce((s: number, a: any) => s + (a.roi || 0), 0) / (agents.length || 1)).toFixed(1)}x` }].map(stat => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <p className="text-xl font-medium text-white">{stat.value}</p>
            <p className="text-xs text-[#adadad]">{stat.label}</p>
          </div>
        ))}
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent: any) => (
            <div key={agent.id} className="glass-card-hover p-5 cursor-pointer group relative" onClick={() => navigate(`/agents/${agent.id}`)}>
              <div className="flex items-start gap-3 mb-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/[0.08] flex items-center justify-center text-lg font-bold text-[#e8a94e]">{(agent.name || 'A')[0]}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0b] ${agent.status === 'active' ? 'bg-[#4ee88a]' : agent.status === 'idle' ? 'bg-[#e8a94e]' : agent.status === 'error' ? 'bg-[#e84e68]' : 'bg-[#666]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{agent.name}</h3>
                  <p className="text-xs text-[#adadad] truncate">{agent.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${departmentColors[agent.department] || '#666'}15`, color: departmentColors[agent.department] || '#666' }}>{agent.department}</span>
                <span className="text-[10px] text-[#666]">v{agent.version || '2.0'}</span>
              </div>
              <p className="text-xs text-[#adadad] truncate mb-3">{agent.current_task || 'Idle'}</p>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.05]">
                <div className="text-center"><p className="text-sm font-medium text-white">{agent.tasks_today || 0}</p><p className="text-[10px] text-[#666]">Tasks</p></div>
                <div className="text-center"><p className="text-sm font-medium text-white">{agent.success_rate || 0}%</p><p className="text-[10px] text-[#666]">Success</p></div>
                <div className="text-center"><p className="text-sm font-medium text-[#e8a94e]">{agent.roi || 0}x</p><p className="text-[10px] text-[#666]">ROI</p></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.06]">
              {['Agent', 'Role', 'Department', 'Status', 'Tasks', 'Success', 'ROI'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#666] uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((agent: any) => (
                <tr key={agent.id} onClick={() => navigate(`/agents/${agent.id}`)} className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-sm font-bold text-[#e8a94e]">{(agent.name || 'A')[0]}</div>
                      <span className="text-sm text-white">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#adadad]">{agent.role}</td>
                  <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${departmentColors[agent.department] || '#666'}15`, color: departmentColors[agent.department] || '#666' }}>{agent.department}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs capitalize ${agent.status === 'active' ? 'text-[#4ee88a]' : agent.status === 'idle' ? 'text-[#e8a94e]' : 'text-[#666]'}`}>{agent.status}</span></td>
                  <td className="px-4 py-3 text-sm text-white">{agent.tasks_today || 0}</td>
                  <td className="px-4 py-3 text-sm text-white">{agent.success_rate || 0}%</td>
                  <td className="px-4 py-3 text-sm text-[#e8a94e]">{agent.roi || 0}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
