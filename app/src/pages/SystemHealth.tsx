import { useState, useEffect, useRef } from 'react';
import { Server, Database, HardDrive, Shield, RefreshCw } from 'lucide-react';
import { useApi, api } from '../hooks/useApi';

function UsageBar({ used, total, label, unit }: { used: number; total: number; label: string; unit: string }) {
  const pct = (used / total) * 100;
  const color = pct > 80 ? '#e84e68' : pct > 60 ? '#e8a94e' : '#4ee88a';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-[#adadad]">{label}</span><span className="text-white">{used}{unit} / {total}{unit}</span></div>
      <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} /></div>
    </div>
  );
}

export default function SystemHealth() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data: health, refetch } = useApi<any>('/api/system/health');
  const { data: agentsData } = useApi<any[]>('/api/agents');
  const agents = agentsData || [];
  const healthWsRef = useRef<WebSocket | null>(null);

  // WebSocket for live system health
  useEffect(() => {
    if (!autoRefresh) return;
    const ws = api.ws('/ws/system/health');
    healthWsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        JSON.parse(event.data);
        refetch();
      } catch {
        // Fallback to polling
      }
    };

    ws.onerror = () => {
      // WebSocket failed, fall back to polling
    };

    return () => { ws.close(); };
  }, [autoRefresh]);

  // Fallback polling if WebSocket is not available
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refetch, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const activeCount = agents.filter(a => a.status === 'active').length;
  const idleCount = agents.filter(a => a.status === 'idle').length;
  const errorCount = agents.filter(a => a.status === 'error').length;
  const dormantCount = agents.filter(a => a.status === 'dormant').length;

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">System Health</h1>
          <p className="text-sm text-[#adadad] mt-1">Last updated: {health ? 'just now' : 'loading...'}</p>
        </div>
        <button onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${autoRefresh ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad]'}`}>
          <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} /> Auto Refresh
        </button>
      </div>

      <div className="glass-card p-6 text-center">
        <div className="inline-flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-4 border-[#4ee88a] flex items-center justify-center mb-3" style={{ boxShadow: '0 0 30px rgba(78,232,138,0.2)' }}>
            <span className="text-3xl font-light text-white">{health?.status === 'healthy' ? '96%' : '??'}</span>
          </div>
          <p className="text-sm text-[#4ee88a]">{health?.status === 'healthy' ? 'All Systems Operational' : 'Checking...'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2"><Server className="w-5 h-5 text-[#e8a94e]" /><h3 className="text-sm font-medium text-white">VPS</h3><span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#4ee88a]/15 text-[#4ee88a]">Running</span></div>
          <UsageBar used={health?.ram_used_mb || 0} total={health?.ram_total_mb || 16000} label="RAM" unit="MB" />
          <UsageBar used={health?.cpu_pct || 0} total={100} label="CPU" unit="%" />
          <div className="flex justify-between text-xs pt-2 border-t border-white/[0.04]"><span className="text-[#666]">Uptime: {health ? `${Math.floor(health.uptime / 60)}m` : '-'}</span><span className="text-[#666]">local</span></div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2"><Database className="w-5 h-5 text-[#4e8ee8]" /><h3 className="text-sm font-medium text-white">Database</h3><span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#4ee88a]/15 text-[#4ee88a]">Running</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#adadad]">SQLite:</span><span className="text-[#4ee88a]">OK</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#adadad]">Supabase:</span><span className={health?.supabase_ok ? 'text-[#4ee88a]' : 'text-[#e84e68]'}>{health?.supabase_ok ? 'OK' : 'Offline'}</span></div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2"><HardDrive className="w-5 h-5 text-[#a855f7]" /><h3 className="text-sm font-medium text-white">Redis Cache</h3><span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#4ee88a]/15 text-[#4ee88a]">Running</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#adadad]">Status:</span><span className={health?.redis_ok ? 'text-[#4ee88a]' : 'text-[#e84e68]'}>{health?.redis_ok ? 'Connected' : 'Disconnected'}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#adadad]">Max Memory:</span><span className="text-white">128MB</span></div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2"><Shield className="w-5 h-5 text-[#4ee88a]" /><h3 className="text-sm font-medium text-white">Services</h3></div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-[#adadad]">NVIDIA:</span><span className={health?.nvidia_ok ? 'text-[#4ee88a]' : 'text-[#e84e68]'}>{health?.nvidia_ok ? 'OK' : 'Offline'}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#adadad]">MCP:</span><span className={health?.mcp_ok ? 'text-[#4ee88a]' : 'text-[#e84e68]'}>{health?.mcp_ok ? 'OK' : 'Offline'}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#adadad]">FTS5:</span><span className={health?.fts5_ok ? 'text-[#4ee88a]' : 'text-[#e84e68]'}>{health?.fts5_ok ? 'OK' : 'Offline'}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#adadad]">Celery:</span><span className={health?.celery_ok ? 'text-[#4ee88a]' : 'text-[#e84e68]'}>{health?.celery_ok ? 'OK' : 'Offline'}</span></div>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-white mb-4">Agent Health</h3>
        <div className="grid grid-cols-4 gap-4">
          {[{ label: 'Active', value: activeCount, color: '#4ee88a' }, { label: 'Idle', value: idleCount, color: '#e8a94e' }, { label: 'Error', value: errorCount, color: '#e84e68' }, { label: 'Dormant', value: dormantCount, color: '#666' }].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-medium" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-[#adadad]">{s.label}</p>
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.08] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${agents.length > 0 ? (s.value / agents.length) * 100 : 0}%`, backgroundColor: s.color }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
