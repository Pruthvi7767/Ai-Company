import { useState, useEffect } from 'react';
import { Globe, RefreshCw, Activity } from 'lucide-react';
import { api } from '../hooks/useApi';

export default function BrowserView() {
  const [mcpStatus, setMcpStatus] = useState<any>({ tabs: [], connected: false });
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mcpRes, sessRes] = await Promise.all([
        api.get('/api/browser/mcp/status'),
        api.get('/api/browser/sessions'),
      ]);
      setMcpStatus(mcpRes);
      setSessions(Array.isArray(sessRes.sessions) ? sessRes.sessions : []);
    } catch {}
    setLoading(false);
  };

  const handleHeartbeat = async (id: string) => {
    try {
      await api.post(`/api/browser/sessions/${id}/heartbeat`, {});
      fetchData();
    } catch {}
  };

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-white">Live Browser</h1>
          <p className="text-sm text-[#adadad] mt-1">MCP browser and session management</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] text-xs text-[#adadad] hover:bg-white/[0.07]">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* MCP Browser Status */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[#e8a94e]" />
          <h2 className="text-lg font-medium text-white">MCP Browser (5 Tabs)</h2>
          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${mcpStatus.connected ? 'bg-[#4ee88a]/15 text-[#4ee88a]' : 'bg-[#666]/15 text-[#666]'}`}>
            {mcpStatus.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {(mcpStatus.tabs || []).map((tab: any, i: number) => (
            <div key={i} className={`p-3 rounded-lg border ${
              tab.status === 'active' ? 'border-[#4ee88a]/30 bg-[#4ee88a]/5' :
              tab.status === 'failed' ? 'border-[#e84e68]/30 bg-[#e84e68]/5' :
              'border-white/[0.06] bg-white/[0.02]'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  tab.status === 'active' ? 'bg-[#4ee88a]' :
                  tab.status === 'failed' ? 'bg-[#e84e68]' : 'bg-[#666]'
                }`} />
                <span className="text-xs text-white">Tab {i + 1}</span>
              </div>
              {tab.url ? (
                <>
                  <p className="text-[10px] text-[#adadad] truncate">{tab.url}</p>
                  <p className="text-[10px] text-[#666] mt-1">{tab.agent || 'Unknown'}</p>
                </>
              ) : (
                <p className="text-[10px] text-[#666]">Idle</p>
              )}
              {tab.status === 'failed' && (
                <p className="text-[10px] text-[#e84e68] mt-1">MCP Alert Sent to Telegram</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Session Health */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-[#4e8ee8]" />
          <h2 className="text-lg font-medium text-white">Session Health</h2>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-[#666] text-center py-8">No active sessions</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <div>
                  <p className="text-sm text-white">{session.platform_name || 'Session'}</p>
                  <p className="text-xs text-[#adadad]">Last heartbeat: {session.last_heartbeat || 'Unknown'}</p>
                </div>
                <button onClick={() => handleHeartbeat(session.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#4e8ee8]/15 text-[#4e8ee8] text-xs hover:bg-[#4e8ee8]/25 transition-colors">
                  Force Heartbeat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
