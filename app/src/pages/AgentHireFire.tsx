import { useState, useEffect } from 'react';
import { Send, Trash2, DollarSign } from 'lucide-react';
import { api } from '../hooks/useApi';

export default function AgentHireFire() {
  const [activeAgents, setActiveAgents] = useState<any[]>([]);
  const [department, setDepartment] = useState('research');
  const [task, setTask] = useState('');
  const [log, setLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const departments = ['research', 'finance', 'marketing', 'sales', 'engineering', 'operations', 'legal', 'analytics'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agentsRes, logRes] = await Promise.all([
        api.get('/api/hire-fire/active'),
        api.get('/api/hire-fire/log'),
      ]);
      setActiveAgents(Array.isArray(agentsRes) ? agentsRes : []);
      setLog(Array.isArray(logRes) ? logRes : []);
    } catch {}
  };

  const handleSpawn = async () => {
    if (!task.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/hire-fire/spawn', { department, task });
      setTask('');
      fetchData();
    } catch {}
    setLoading(false);
  };

  const handleTerminate = async (id: string) => {
    try {
      await api.delete(`/api/hire-fire/terminate/${id}`);
      fetchData();
    } catch {}
  };

  const totalCost = log.reduce((sum, l) => sum + (l.cost_inr || 0), 0);

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div>
        <h1 className="text-2xl font-medium text-white">Agent Hire / Fire</h1>
        <p className="text-sm text-[#adadad] mt-1">Manage agent spawning and lifecycle</p>
      </div>

      {/* Active Agents */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Active Agents ({activeAgents.length})</h2>
          <button onClick={fetchData} className="text-xs text-[#e8a94e] hover:underline">Refresh</button>
        </div>
        {activeAgents.length === 0 ? (
          <p className="text-sm text-[#666] text-center py-8">No agents currently active</p>
        ) : (
          <div className="space-y-2">
            {activeAgents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#4ee88a]" style={{ boxShadow: '0 0 6px rgba(78,232,138,0.5)' }} />
                  <div>
                    <p className="text-sm text-white">{agent.id}</p>
                    <p className="text-xs text-[#adadad]">{agent.department} · {agent.task_description}</p>
                  </div>
                </div>
                <button onClick={() => handleTerminate(agent.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e84e68]/15 text-[#e84e68] text-xs hover:bg-[#e84e68]/25 transition-colors">
                  <Trash2 className="w-3 h-3" /> Terminate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spawn Panel */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-medium text-white mb-4">Spawn Agent</h2>
        <div className="flex flex-wrap gap-3">
          <select value={department} onChange={e => setDepartment(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#e8a94e]">
            {departments.map(d => <option key={d} value={d} className="bg-[#1a1a1b]">{d}</option>)}
          </select>
          <input type="text" value={task} onChange={e => setTask(e.target.value)}
            placeholder="Task description..."
            className="flex-1 min-w-[200px] bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" />
          <button onClick={handleSpawn} disabled={loading || !task.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e8a94e] text-black text-sm font-semibold disabled:opacity-50 hover:shadow-[0_0_20px_rgba(232,169,78,0.3)] transition-all">
            <Send className="w-4 h-4" /> {loading ? 'Spawning...' : 'Spawn'}
          </button>
        </div>
      </div>

      {/* Hire/Fire Log */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">Today's Log</h2>
          <div className="flex items-center gap-1 text-xs text-[#e8a94e]">
            <DollarSign className="w-3 h-3" />
            <span>₹{totalCost.toFixed(2)}</span>
          </div>
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-[#666] text-center py-4">No activity today</p>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/[0.06]">
                {['Agent', 'Department', 'Action', 'Time', 'Cost'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-medium text-[#666] uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {log.slice(0, 20).map((entry, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="px-4 py-2 text-xs text-white mono">{entry.agent_id}</td>
                    <td className="px-4 py-2 text-xs text-[#adadad]">{entry.department || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${entry.action === 'hired' ? 'bg-[#4ee88a]/15 text-[#4ee88a]' : 'bg-[#e84e68]/15 text-[#e84e68]'}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-[#666]">{entry.created_at ? entry.created_at.slice(11, 19) : '-'}</td>
                    <td className="px-4 py-2 text-xs text-[#e8a94e]">₹{(entry.cost_inr || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
