import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, MessageSquare, Users, Plug, Layers, DollarSign,
  Calendar, CheckCircle, BarChart3, BookOpen, AlertTriangle,
  FileText, Cpu, Clock, Settings, Bell, Search, ChevronLeft,
  ChevronRight, LogOut, Shield, UserPlus, Globe
} from 'lucide-react';
import { useApi } from '../hooks/useApi';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/chat', icon: MessageSquare, label: 'Agent Chat' },
  { path: '/agents', icon: Users, label: 'Agent Directory' },
  { path: '/connectors', icon: Plug, label: 'Connectors' },
  { path: '/income-streams', icon: Layers, label: 'Income Streams' },
  { path: '/earnings', icon: DollarSign, label: 'Earnings' },
  { path: '/board-meetings', icon: Calendar, label: 'Board Meetings' },
  { path: '/approvals', icon: CheckCircle, label: 'Approvals', badgeKey: 'approvals' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/knowledge-base', icon: BookOpen, label: 'Knowledge Base' },
  { path: '/error-logs', icon: AlertTriangle, label: 'Error Logs', badgeKey: 'errors' },
  { path: '/content-manager', icon: FileText, label: 'Content Manager' },
  { path: '/capabilities', icon: Cpu, label: 'Capability Registry' },
  { path: '/audit-log', icon: Clock, label: 'Audit Log' },
  { path: '/agent-hire-fire', icon: UserPlus, label: 'Hire / Fire' },
  { path: '/browser', icon: Globe, label: 'Live Browser' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const { data: approvalsData } = useApi<any[]>('/api/approvals');
  const { data: errorsData } = useApi<any[]>('/api/errors');
  const { data: notificationsData } = useApi<any[]>('/api/notifications');
  
  const pendingApprovals = (approvalsData || []).filter(a => a.status === 'pending').length;
  const openErrors = (errorsData || []).filter(e => e.status === 'needs-attention').length;
  const unreadNotifications = (notificationsData || []).filter(n => !n.read).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const filteredNav = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #e8a94e 0%, transparent 70%)',
            top: '-10%',
            left: '-5%',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
            bottom: '-10%',
            right: '-5%',
            animation: 'float-delayed 25s ease-in-out infinite',
          }}
        />
      </div>

      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-4 gap-4"
        style={{ background: 'rgba(10,10,11,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 shrink-0">
          <img src="/images/logo.png" alt="Markly" className="w-7 h-7" />
          <span className="text-lg font-semibold tracking-tight hidden sm:block">Markly</span>
        </button>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-[#666] hover:text-[#adadad] hover:bg-white/[0.07] transition-all ml-4 w-64"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Health indicator */}
          <button
            onClick={() => navigate('/system-health')}
            className="relative p-2 rounded-lg hover:bg-white/[0.07] transition-colors"
            title="System Health"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#4ee88a]" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg hover:bg-white/[0.07] transition-colors"
          >
            <Bell className="w-5 h-5 text-[#adadad]" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e84e68] text-[9px] font-bold flex items-center justify-center">{unreadNotifications}</span>
            )}
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e8a94e] to-[#c4843c] flex items-center justify-center text-xs font-bold text-black">
                A
              </div>
              <span className="text-sm text-[#adadad] hidden sm:block">Admin</span>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl liquid-glass z-50 overflow-hidden">
                  <div className="p-3 border-b border-white/[0.08]">
                    <p className="text-sm font-medium text-white">Admin User</p>
                    <p className="text-xs text-[#666]">admin@markly.ai</p>
                  </div>
                  <div className="p-1.5">
                    <button onClick={() => { setProfileOpen(false); navigate('/settings'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#adadad] hover:bg-white/[0.07] hover:text-white transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button onClick={() => { setProfileOpen(false); navigate('/system-health'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#adadad] hover:bg-white/[0.07] hover:text-white transition-colors">
                      <Shield className="w-4 h-4" /> System Health
                    </button>
                    <div className="border-t border-white/[0.08] mt-1 pt-1">
                      <button onClick={() => navigate('/login')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#e84e68] hover:bg-white/[0.07] transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-14 bottom-0 z-30 flex flex-col transition-all duration-300"
        style={{
          width: collapsed ? 64 : 240,
          background: 'rgba(10,10,11,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            const badge = item.badgeKey === 'approvals' ? pendingApprovals : item.badgeKey === 'errors' ? openErrors : 0;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white/[0.1] text-[#e8a94e] border-l-2 border-[#e8a94e]'
                    : 'text-[#adadad] hover:bg-white/[0.07] hover:text-white'
                }`}
                style={{ marginLeft: isActive ? '-2px' : '0', paddingLeft: isActive ? '10px' : '12px' }}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {badge > 0 && (
                      <span className={`min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 ${
                        item.badgeKey === 'approvals' ? 'bg-[#e84e68]' : 'bg-[#e8a94e]'
                      } text-black`}>
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-2 border-t border-white/[0.06]">
          <button
            onClick={() => navigate('/system-health')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#adadad] hover:bg-white/[0.07] transition-colors mb-1"
          >
            <div className="w-2 h-2 rounded-full bg-[#4ee88a] shrink-0" style={{ boxShadow: '0 0 6px rgba(78,232,138,0.5)' }} />
            {!collapsed && <span className="truncate">All Systems Running</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-[#666] hover:bg-white/[0.07] hover:text-[#adadad] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="pt-14 min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? 64 : 240 }}
      >
        <div className="p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Command Palette */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-[600px] rounded-2xl liquid-glass overflow-hidden" style={{ animation: 'slide-in 0.15s ease-out' }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
              <Search className="w-5 h-5 text-[#666]" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search agents, platforms, pages..."
                className="flex-1 bg-transparent text-white placeholder:text-[#666] outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <kbd className="text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded text-[#666]">ESC</kbd>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              {filteredNav.length > 0 ? (
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-[#666] px-3 py-2">Navigation</p>
                  {filteredNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setSearchOpen(false); setSearchQuery(''); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#adadad] hover:bg-white/[0.07] hover:text-white transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <span className="text-[10px] text-[#666]">↵</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-[#666] text-sm">No results found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
