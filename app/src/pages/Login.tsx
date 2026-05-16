import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, #e8a94e 0%, transparent 70%)', top: '-10%', left: '-10%', animation: 'float 20s ease-in-out infinite' }} />
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', bottom: '-10%', right: '-10%', animation: 'float-delayed 25s ease-in-out infinite' }} />

      <div className="relative w-full max-w-[440px] px-4">
        {/* Access Card */}
        <div className="rounded-2xl p-10" style={{ background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 24px 48px rgba(0,0,0,0.4)' }}>
          {/* Brand Header */}
          <div className="text-center mb-8">
            <img src="/images/logo.png" alt="Markly" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-light tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>Markly</h1>
            <p className="text-sm text-[#adadad] mt-2">Autonomous Command Interface</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#e84e68]/10 border border-[#e84e68]/20 text-[#e84e68] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-[#adadad] mb-1.5">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-[#666] outline-none transition-all focus:border-[#e8a94e] text-sm"
                style={{ boxShadow: 'none' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-[#adadad] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-3 pr-10 text-white placeholder:text-[#666] outline-none transition-all focus:border-[#e8a94e] text-sm"
                  style={{ boxShadow: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#adadad] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#adadad] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/[0.2] bg-black/40 checked:bg-[#e8a94e] accent-[#e8a94e]"
                />
                <span className="text-xs">Keep me logged in</span>
              </label>
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-xs text-[#e8a94e] hover:underline"
              >
                Recover Access
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#e8a94e] text-black font-semibold rounded-lg transition-all hover:shadow-[0_0_20px_rgba(232,169,78,0.3)] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Access Dashboard'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] text-[#666] mt-6 mono">v2.4.0-stable</p>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowReset(false)} />
          <div className="relative w-full max-w-[400px] rounded-2xl liquid-glass p-6 mx-4">
            <button onClick={() => setShowReset(false)} className="absolute top-4 right-4 text-[#666] hover:text-white">
              ✕
            </button>
            <h3 className="text-lg font-medium text-white mb-2">Recover Access</h3>
            <p className="text-sm text-[#adadad] mb-4">Enter your email to receive a reset link.</p>
            {resetSent ? (
              <div className="p-3 rounded-lg bg-[#4ee88a]/10 border border-[#4ee88a]/20 text-[#4ee88a] text-sm">
                Reset link sent! Check your inbox.
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setResetSent(true); }} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e] text-sm"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowReset(false)} className="flex-1 h-10 rounded-lg border border-white/[0.1] text-sm text-[#adadad] hover:bg-white/[0.05]">Cancel</button>
                  <button type="submit" className="flex-1 h-10 bg-[#e8a94e] text-black font-semibold rounded-lg text-sm hover:shadow-[0_0_20px_rgba(232,169,78,0.3)]">Send Link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
