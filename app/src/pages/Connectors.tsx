import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plug, CheckCircle, AlertTriangle, XCircle, MoreVertical, TrendingUp, Mail, Server, Lock, RefreshCw, Eye, EyeOff, Shield } from 'lucide-react';
import { useApi, api } from '../hooks/useApi';

const EMAIL_PROVIDERS = [
  { id: 'gmail', name: 'Gmail', imap: 'imap.gmail.com', smtp: 'smtp.gmail.com', icon: 'G' },
  { id: 'outlook', name: 'Outlook', imap: 'outlook.office365.com', smtp: 'smtp-mail.outlook.com', icon: 'O' },
  { id: 'yahoo', name: 'Yahoo', imap: 'imap.mail.yahoo.com', smtp: 'smtp.mail.yahoo.com', icon: 'Y' },
  { id: 'icloud', name: 'iCloud', imap: 'imap.mail.me.com', smtp: 'smtp.mail.me.com', icon: 'i' },
  { id: 'custom', name: 'Custom (IMAP/SMTP)', imap: '', smtp: '', icon: 'C' },
];

export default function Connectors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showEmailSetup, setShowEmailSetup] = useState(false);
  const [emailForm, setEmailForm] = useState({
    email_address: '',
    password: '',
    provider: 'gmail',
    imap_server: 'imap.gmail.com',
    imap_port: 993,
    smtp_server: 'smtp.gmail.com',
    smtp_port: 465,
    auth_method: 'password',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [emailSyncing, setEmailSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  const { data: connectorsData, refetch } = useApi<any[]>('/api/connectors');
  const connectors = connectorsData || [];

  const connected = connectors.filter(c => c.status === 'connected' || c.status === 'needs_attention');
  const available = connectors.filter(c => c.status === 'available');

  const filteredConnected = connected.filter(c => {
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    const fetchEmailStatus = async () => {
      try {
        const res = await api.get('/api/connectors/email/status');
        setEmailStatus(res);
      } catch {}
    };
    fetchEmailStatus();
  }, []);

  const statusIcons: Record<string, React.ReactNode> = {
    connected: <CheckCircle className="w-4 h-4 text-[#4ee88a]" />,
    needs_attention: <AlertTriangle className="w-4 h-4 text-[#e8a94e]" />,
    error: <XCircle className="w-4 h-4 text-[#e84e68]" />,
    available: <Plug className="w-4 h-4 text-[#666]" />,
  };

  const handleConnect = async (id: string) => {
    if (id === 'email') {
      setShowEmailSetup(true);
      return;
    }
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await fetch(`${API_BASE}/api/connectors/${id}/connect`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } });
      refetch();
    } catch {}
  };

  const handleProviderChange = (provider: string) => {
    const preset = EMAIL_PROVIDERS.find(p => p.id === provider);
    if (preset && provider !== 'custom') {
      setEmailForm(prev => ({
        ...prev,
        provider,
        imap_server: preset.imap,
        smtp_server: preset.smtp,
      }));
    } else {
      setEmailForm(prev => ({ ...prev, provider }));
    }
  };

  const handleEmailConnect = async () => {
    setConnecting(true);
    setConnectError('');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE}/api/connectors/email/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify(emailForm),
      });
      if (!res.ok) {
        const err = await res.json();
        setConnectError(err.detail || 'Connection failed');
        return;
      }
      setShowEmailSetup(false);
      refetch();
      const statusRes = await api.get('/api/connectors/email/status');
      setEmailStatus(statusRes);
    } catch (e: any) {
      setConnectError(e.message || 'Connection failed');
    }
    setConnecting(false);
  };

  const handleEmailSync = async () => {
    setEmailSyncing(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await fetch(`${API_BASE}/api/connectors/email/sync`, { method: 'POST' });
      const statusRes = await api.get('/api/connectors/email/status');
      setEmailStatus(statusRes);
    } catch {}
    setEmailSyncing(false);
  };

  const handleDisconnect = async (id: string) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await fetch(`${API_BASE}/api/connectors/${id}/disconnect`, { method: 'DELETE' });
      refetch();
      if (id === 'email') setEmailStatus(null);
    } catch {}
  };

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div>
        <h1 className="text-2xl font-medium text-white">Connectors</h1>
        <p className="text-sm text-[#adadad] mt-1">{connected.length} connected, {available.length} available</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input type="text" placeholder="Search connectors..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" />
        </div>
        {['All', 'Connected', 'Needs Attention'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad] hover:bg-white/[0.07]'}`}>{f}</button>
        ))}
      </div>

      {/* Email Setup Modal */}
      {showEmailSetup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1b] border border-white/[0.1] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e8a94e]/15 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#e8a94e]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">Email Setup</h2>
                    <p className="text-xs text-[#adadad]">Connect any email via IMAP/SMTP</p>
                  </div>
                </div>
                <button onClick={() => setShowEmailSetup(false)} className="text-[#666] hover:text-white">✕</button>
              </div>

              {/* Provider Selection */}
              <div className="mb-6">
                <label className="text-xs text-[#adadad] mb-2 block">Email Provider</label>
                <div className="grid grid-cols-5 gap-2">
                  {EMAIL_PROVIDERS.map(p => (
                    <button key={p.id} onClick={() => handleProviderChange(p.id)}
                      className={`p-3 rounded-lg border text-center transition-all ${emailForm.provider === p.id ? 'border-[#e8a94e] bg-[#e8a94e]/10' : 'border-white/[0.08] hover:border-white/[0.15]'}`}>
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mx-auto mb-1 text-sm font-bold">{p.icon}</div>
                      <span className="text-[10px] text-[#adadad]">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Address */}
              <div className="mb-4">
                <label className="text-xs text-[#adadad] mb-1 block">Email Address</label>
                <input type="email" value={emailForm.email_address} onChange={(e) => setEmailForm(prev => ({ ...prev, email_address: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="text-xs text-[#adadad] mb-1 block">
                  {emailForm.provider === 'gmail' ? 'App Password' : 'Password'}
                  {emailForm.provider === 'gmail' && <span className="text-[#e8a94e] ml-1">(Generate at myaccount.google.com/apppasswords)</span>}
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={emailForm.password} onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Auth Method */}
              <div className="mb-4">
                <label className="text-xs text-[#adadad] mb-1 block">Auth Method</label>
                <select value={emailForm.auth_method} onChange={(e) => setEmailForm(prev => ({ ...prev, auth_method: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#e8a94e]">
                  <option value="password" className="bg-[#1a1a1b]">Password</option>
                  <option value="oauth2" className="bg-[#1a1a1b]">OAuth2</option>
                </select>
              </div>

              {/* Custom Server Fields */}
              {emailForm.provider === 'custom' && (
                <div className="space-y-4 mb-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-[#e8a94e]" />
                    <span className="text-sm font-medium text-white">IMAP Server (Incoming)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#adadad]">Server</label>
                      <input type="text" value={emailForm.imap_server} onChange={(e) => setEmailForm(prev => ({ ...prev, imap_server: e.target.value }))}
                        placeholder="imap.example.com"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#adadad]">Port</label>
                      <input type="number" value={emailForm.imap_port} onChange={(e) => setEmailForm(prev => ({ ...prev, imap_port: parseInt(e.target.value) || 993 }))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#e8a94e]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2 mt-4">
                    <Server className="w-4 h-4 text-[#4ee88a]" />
                    <span className="text-sm font-medium text-white">SMTP Server (Outgoing)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#adadad]">Server</label>
                      <input type="text" value={emailForm.smtp_server} onChange={(e) => setEmailForm(prev => ({ ...prev, smtp_server: e.target.value }))}
                        placeholder="smtp.example.com"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#adadad]">Port</label>
                      <input type="number" value={emailForm.smtp_port} onChange={(e) => setEmailForm(prev => ({ ...prev, smtp_port: parseInt(e.target.value) || 465 }))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#e8a94e]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Note */}
              <div className="flex items-start gap-2 mb-6 p-3 rounded-lg bg-[#4ee88a]/5 border border-[#4ee88a]/20">
                <Shield className="w-4 h-4 text-[#4ee88a] mt-0.5 shrink-0" />
                <p className="text-[10px] text-[#adadad]">Your credentials are encrypted and stored securely. We use SSL/TLS for all connections. For Gmail, use an App Password, not your regular password.</p>
              </div>

              {connectError && (
                <div className="mb-4 p-3 rounded-lg bg-[#e84e68]/10 border border-[#e84e68]/20">
                  <p className="text-xs text-[#e84e68]">{connectError}</p>
                </div>
              )}

              <button onClick={handleEmailConnect} disabled={connecting || !emailForm.email_address || !emailForm.password}
                className="w-full py-3 rounded-lg bg-[#e8a94e] text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(232,169,78,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {connecting ? 'Connecting...' : 'Connect Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Status Card (when connected) */}
      {emailStatus && emailStatus.status === 'connected' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8a94e]/15 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#e8a94e]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">{emailStatus.email_address}</h3>
                <p className="text-[10px] text-[#adadad]">{emailStatus.provider} • Last sync: {emailStatus.last_sync ? new Date(emailStatus.last_sync).toLocaleString() : 'Never'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleEmailSync} disabled={emailSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] text-xs text-[#adadad] hover:bg-white/[0.07] disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${emailSyncing ? 'animate-spin' : ''}`} /> Sync
              </button>
              <button onClick={() => handleDisconnect('email')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e84e68]/15 text-[#e84e68] text-xs hover:bg-[#e84e68]/25">
                Disconnect
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <p className="text-[10px] text-[#adadad]">Emails Synced</p>
              <p className="text-lg font-medium text-white">{emailStatus.emails_synced || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <p className="text-[10px] text-[#adadad]">Sync Status</p>
              <p className="text-lg font-medium text-[#4ee88a] capitalize">{emailStatus.sync_status || 'idle'}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <p className="text-[10px] text-[#adadad]">Provider</p>
              <p className="text-lg font-medium text-white capitalize">{emailStatus.provider}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium text-white mb-4">Connected</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnected.filter(c => c.id !== 'email').map(conn => (
            <div key={conn.id} className="glass-card-hover p-5 cursor-pointer" onClick={() => navigate(`/platform/${conn.id}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: 'linear-gradient(135deg, rgba(232,169,78,0.2), rgba(232,169,78,0.05))' }}>{conn.name?.[0]}</div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{conn.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-[#adadad]">{conn.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">{statusIcons[conn.status]}<button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-md hover:bg-white/[0.08]"><MoreVertical className="w-4 h-4 text-[#666]" /></button></div>
              </div>
              <div className="space-y-1.5 text-xs text-[#adadad]">
                <div className="flex justify-between"><span>Connected</span><span>{conn.connected_since || '-'}</span></div>
                <div className="flex justify-between"><span>Last used</span><span>{conn.last_used || '-'}</span></div>
                <div className="flex justify-between"><span>Agent</span><span>{conn.agent_using || '-'}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-white mb-4">Available</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {available.map(conn => (
            <div key={conn.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold bg-white/[0.05]">
                    {conn.id === 'email' ? <Mail className="w-5 h-5 text-[#e8a94e]" /> : conn.name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{conn.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-[#adadad]">{conn.category}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#adadad] mb-3">{conn.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-[#e8a94e]"><TrendingUp className="w-3 h-3" /><span>{conn.potential_earnings}</span></div>
                <button onClick={() => handleConnect(conn.id)}
                  className="px-4 py-2 rounded-lg bg-[#e8a94e] text-black text-xs font-semibold hover:shadow-[0_0_20px_rgba(232,169,78,0.3)] transition-all">
                  {conn.id === 'email' ? 'Setup' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
