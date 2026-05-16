import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, DollarSign, UserPlus, Star, Power, FileText, TrendingUp } from 'lucide-react';
import { useApi, api } from '../hooks/useApi';

const typeIcons: Record<string, typeof CheckCircle> = {
  approval: CheckCircle, error: AlertTriangle, milestone: DollarSign, agent: UserPlus,
  platform: Star, system: Power, report: FileText, budget: TrendingUp,
};
const typeColors: Record<string, string> = {
  approval: '#4ee88a', error: '#e84e68', milestone: '#e8a94e', agent: '#4e8ee8',
  platform: '#a855f7', system: '#4ee88a', report: '#adadad', budget: '#e84e68',
};

export default function Notifications() {
  const [filter, setFilter] = useState('All');
  const { data: notifsData, refetch } = useApi<any[]>('/api/notifications');
  const notifs = notifsData || [];
  const notifWsRef = useRef<WebSocket | null>(null);

  // WebSocket for live push notifications
  useEffect(() => {
    const ws = api.ws('/ws/notifications');
    notifWsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        JSON.parse(event.data);
        refetch();
      } catch {
        // Ignore parse errors
      }
    };

    return () => { ws.close(); };
  }, []);

  const filtered = filter === 'All' ? notifs : filter === 'Unread' ? notifs.filter(n => !n.read) : notifs.filter(n => n.type === filter.toLowerCase());

  const markAllRead = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await fetch(`${API_BASE}/api/notifications/read-all`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      refetch();
    } catch {}
  };

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-white">Notifications</h1>
        <button onClick={markAllRead} className="text-xs text-[#e8a94e] hover:underline">Mark all as read</button>
      </div>
      <div className="flex gap-1 flex-wrap">
        {['All', 'Unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad] hover:bg-white/[0.07]'}`}>{f}</button>
        ))}
      </div>
      <div className="space-y-1">
        {filtered.map(notif => {
          const Icon = typeIcons[notif.type] || FileText;
          const color = typeColors[notif.type] || '#adadad';
          return (
            <div key={notif.id} className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${notif.read ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}><Icon className="w-4 h-4" style={{ color }} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-medium text-white">{notif.title}</p>{!notif.read && <div className="w-2 h-2 rounded-full bg-[#4e8ee8]" />}</div>
                <p className="text-xs text-[#adadad] mt-0.5">{notif.description}</p>
                <p className="text-[10px] text-[#666] mt-1">{notif.created_at ? notif.created_at.slice(11, 16) : ''}</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-[#666] text-center py-8">No notifications</p>}
      </div>
    </div>
  );
}
