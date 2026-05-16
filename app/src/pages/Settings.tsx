import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import type { ThemeName } from '../context/ThemeContext';
import { Bell, Shield, Wallet, Cpu, Globe, Moon, Sun, Monitor } from 'lucide-react';
import { useApi, api } from '../hooks/useApi';

const tabs = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'advanced', label: 'Advanced', icon: Cpu },
];

const themes: { id: ThemeName; label: string; icon: typeof Sun }[] = [
  { id: 'midnight', label: 'Midnight', icon: Moon },
  { id: 'obsidian', label: 'Obsidian', icon: Monitor },
  { id: 'slate', label: 'Slate', icon: Monitor },
  { id: 'emerald', label: 'Emerald', icon: Monitor },
  { id: 'ruby', label: 'Ruby', icon: Monitor },
  { id: 'amber', label: 'Amber', icon: Sun },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const { data: settingsData } = useApi<any>('/api/settings');
  const { data: llmData } = useApi<any>('/api/settings/llm');
  
  const defaultNotif = { system: true, critical: true, approvals: true, daily: true, weekly: true };
  const defaultBudget = { opus: 50, sonnet: 30, haiku: 15, gpt4: 20, image: 10, alert: 80 };
  
  const [notifSettings, setNotifSettings] = useState(settingsData?.notifications || defaultNotif);
  const [budgetLimits, setBudgetLimits] = useState(llmData || defaultBudget);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [debugMode, setDebugMode] = useState(settingsData?.debug_mode || false);
  const [verboseLogging, setVerboseLogging] = useState(settingsData?.verbose_logging ?? true);

  const handleSaveSettings = async () => {
    try {
      await api.patch('/api/settings', { key: 'notifications', value: notifSettings });
    } catch (e) { console.error('Failed to save settings', e); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    try {
      await api.post('/api/auth/login', { email: 'admin@markly.ai', password: currentPassword });
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) { console.error('Password change failed', e); }
  };

  const handleSaveBudget = async () => {
    try {
      await api.patch('/api/settings', { key: 'budget', value: budgetLimits });
    } catch (e) { console.error('Failed to save budget', e); }
  };

  const handleStopAgents = async () => {
    try {
      await api.patch('/api/settings', { key: 'MARKLY_PAUSED', value: true });
    } catch (e) { console.error('Failed to stop agents', e); }
  };

  const handleFactoryReset = async () => {
    if (!confirm('Are you sure you want to reset all settings?')) return;
    try {
      await api.patch('/api/settings', { key: 'reset', value: true });
    } catch (e) { console.error('Factory reset failed', e); }
  };

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <h1 className="text-2xl font-medium text-white">Settings</h1>
      <div className="flex gap-1 border-b border-white/[0.06] pb-px">
        {tabs.map(tab => { const Icon = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id ? 'text-[#e8a94e] border-[#e8a94e]' : 'text-[#adadad] border-transparent hover:text-white'}`}>
            <Icon className="w-4 h-4" /> {tab.label}</button>); })}
      </div>

      {activeTab === 'general' && (
        <div className="max-w-xl space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-medium text-white">Profile</h3>
            <div><label className="text-xs text-[#adadad] block mb-1.5">Product Name</label><input type="text" defaultValue={settingsData?.product_name || 'Markly'} className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white" /></div>
            <div><label className="text-xs text-[#adadad] block mb-1.5">Owner Name</label><input type="text" defaultValue={settingsData?.owner_name || 'Admin User'} className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white" /></div>
            <div><label className="text-xs text-[#adadad] block mb-1.5">Owner Email</label><input type="email" defaultValue={settingsData?.owner_email || 'admin@markly.ai'} className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white" /></div>
          </div>
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-medium text-white">Appearance</h3>
            <div><label className="text-xs text-[#adadad] block mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {themes.map(t => { const Icon = t.icon; return (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${theme === t.id ? 'border-[#e8a94e] bg-[#e8a94e]/10' : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]'}`}>
                    <Icon className="w-4 h-4 text-[#adadad]" /><span className="text-xs text-white">{t.label}</span></button>); })}
              </div></div>
          </div>
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-medium text-white">System</h3>
            <div className="flex justify-between text-sm"><span className="text-[#adadad]">Version</span><span className="text-white">{settingsData?.version || '2.0.0'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#adadad]">Status</span><span className={`font-medium ${settingsData?.status === 'online' ? 'text-[#4ee88a]' : 'text-[#e8a94e]'}`}>{settingsData?.status || 'Online'}</span></div>
          </div>
          <button onClick={handleSaveSettings} className="px-6 py-2.5 rounded-lg bg-[#e8a94e] text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(232,169,78,0.3)] transition-all">Save Changes</button>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-xl glass-card p-5 space-y-4">
          <h3 className="text-sm font-medium text-white">Notification Types</h3>
          {Object.entries(notifSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2">
              <span className="text-sm text-[#adadad] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <button onClick={() => setNotifSettings(prev => ({ ...prev, [key]: !value }))}
                className={`w-10 h-5 rounded-full transition-all ${value ? 'bg-[#e8a94e]' : 'bg-white/[0.1]'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
            </div>))}
          <button onClick={handleSaveSettings} className="mt-4 px-6 py-2.5 rounded-lg bg-[#e8a94e] text-black text-sm font-semibold">Save</button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-xl space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-medium text-white">Password</h3>
            <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#666]" />
            <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#666]" />
            <button onClick={handleChangePassword} className="px-4 py-2 rounded-lg bg-white/[0.05] text-sm text-[#adadad] hover:bg-white/[0.08]">Change Password</button>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="max-w-xl glass-card p-5 space-y-5">
          <h3 className="text-sm font-medium text-white">Daily AI Model Budgets (USD)</h3>
          {[{ key: 'opus', label: 'NVIDIA Nemotron', val: 50 }, { key: 'sonnet', label: 'NVIDIA Llama 70B', val: 30 }, { key: 'haiku', label: 'NVIDIA Llama 8B', val: 15 }, { key: 'gpt4', label: 'Groq 70B', val: 20 }, { key: 'image', label: 'Groq 8B', val: 10 }].map(model => (
            <div key={model.key}>
              <div className="flex justify-between text-xs mb-1.5"><span className="text-[#adadad]">{model.label}</span><span className="text-white">${budgetLimits[model.key as keyof typeof budgetLimits]}</span></div>
              <input type="range" min={0} max={100} value={budgetLimits[model.key as keyof typeof budgetLimits]}
                onChange={(e) => setBudgetLimits(prev => ({ ...prev, [model.key]: parseInt(e.target.value) }))} className="w-full accent-[#e8a94e]" />
            </div>))}
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="flex justify-between text-sm mb-2"><span className="text-[#adadad]">Total Daily Cap</span><span className="text-white font-medium">${Object.values(budgetLimits).slice(0, 5).reduce((a, b) => a + b, 0)}</span></div>
          </div>
          <button onClick={handleSaveBudget} className="px-6 py-2.5 rounded-lg bg-[#e8a94e] text-black text-sm font-semibold">Save Budget</button>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="max-w-xl space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-medium text-white">System Controls</h3>
            <div className="flex items-center justify-between"><span className="text-sm text-[#adadad]">Debug Mode</span><button onClick={() => setDebugMode(!debugMode)} className={`w-10 h-5 rounded-full transition-all ${debugMode ? 'bg-[#e8a94e]' : 'bg-white/[0.1]'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${debugMode ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
            <div className="flex items-center justify-between"><span className="text-sm text-[#adadad]">Verbose Logging</span><button onClick={() => setVerboseLogging(!verboseLogging)} className={`w-10 h-5 rounded-full transition-all ${verboseLogging ? 'bg-[#e8a94e]' : 'bg-white/[0.1]'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${verboseLogging ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
          </div>
          <div className="glass-card p-5 border border-[#e84e68]/20">
            <h3 className="text-sm font-medium text-[#e84e68] mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><div><p className="text-sm text-white">Stop All Agents</p><p className="text-xs text-[#666]">Immediately pause all agents</p></div><button onClick={handleStopAgents} className="px-4 py-2 rounded-lg bg-[#e84e68]/15 text-[#e84e68] text-xs font-medium hover:bg-[#e84e68]/25">Stop</button></div>
              <div className="flex items-center justify-between"><div><p className="text-sm text-white">Factory Reset</p><p className="text-xs text-[#666]">Reset all settings to defaults</p></div><button onClick={handleFactoryReset} className="px-4 py-2 rounded-lg bg-[#e84e68]/15 text-[#e84e68] text-xs font-medium hover:bg-[#e84e68]/25">Reset</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
