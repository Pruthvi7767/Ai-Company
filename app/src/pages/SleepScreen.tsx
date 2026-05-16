import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BOOT_MESSAGES = [
  'Initializing CEO Agent...',
  'Loading C-Suite agents...',
  'Connecting to Telegram...',
  'Starting FTS5 learning engine...',
  'Connecting MCP bronew server...',
  'Loading department souls...',
  'Warming up NVIDIA Nemotron...',
  'Establishing Redis connection...',
  'Starting session heartbeat...',
  'All systems operational.',
];

interface SleepScreenProps {
  status?: 'booting' | 'paused' | 'maintenance' | 'online';
}

export default function SleepScreen({ status = 'booting' }: SleepScreenProps) {
  const navigate = useNavigate();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(new Date());
  const [showEnter, setShowEnter] = useState(false);

  useEffect(() => {
    if (status === 'paused' || status === 'maintenance') return;

    const msgInterval = setInterval(() => {
      setMsgIndex(prev => {
        if (prev >= BOOT_MESSAGES.length - 1) {
          clearInterval(msgInterval);
          setShowEnter(true);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(msgInterval);
  }, [status]);

  useEffect(() => {
    if (status === 'booting' && msgIndex > 0) {
      setProgress((msgIndex / (BOOT_MESSAGES.length - 1)) * 100);
    }
  }, [msgIndex, status]);

  useEffect(() => {
    if (status === 'booting' && showEnter) {
      const timer = setTimeout(() => navigate('/login'), 1500);
      return () => clearTimeout(timer);
    }
  }, [showEnter, status, navigate]);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const statusMessage = status === 'paused'
    ? 'Markly is paused. Send /resume to Telegram to continue.'
    : status === 'maintenance'
    ? 'System maintenance in progress.'
    : BOOT_MESSAGES[msgIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, #e8a94e 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="absolute w-0.5 h-0.5 rounded-full bg-white"
          style={{ opacity: 0.01, left: `${(i * 5) % 100}%`, top: `${(i * 7) % 100}%`, animation: `float ${10 + i}s ease-in-out infinite` }} />
      ))}

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center">
        <img src="/images/logo.png" alt="Markly" className="w-20 h-20 mb-6" />
        <h1 className="text-3xl font-light tracking-[0.3em] text-[#e8a94e] mb-8">MARKLY</h1>

        {/* Status message */}
        <p className="text-sm text-[#adadad] mb-6 h-5 transition-all duration-300" style={{ animation: 'fade-in 0.5s ease-out' }}>
          {statusMessage}
        </p>

        {/* Progress bar */}
        {status === 'booting' && (
          <div className="w-64 h-1 rounded-full bg-white/[0.08] overflow-hidden mb-4">
            <div className="h-full rounded-full bg-[#e8a94e] transition-all duration-500"
              style={{ width: `${progress}%`, boxShadow: progress === 100 ? '0 0 10px rgba(232,169,78,0.5)' : 'none' }} />
          </div>
        )}

        {/* Online indicator */}
        {showEnter && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4ee88a]" style={{ boxShadow: '0 0 6px rgba(78,232,138,0.5)' }} />
            <span className="text-sm text-[#4ee88a]">Online</span>
          </div>
        )}

        {status === 'paused' && (
          <button onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 rounded-lg bg-[#e8a94e] text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(232,169,78,0.3)] transition-all">
            Enter Markly
          </button>
        )}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-xs text-[#666]">
        <span>v{import.meta.env.VITE_MARKLY_VERSION || '2.0.0'}</span>
        <span className="mono">{time.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
