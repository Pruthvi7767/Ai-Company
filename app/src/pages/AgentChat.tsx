import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Paperclip, Mic, Command, Info, Minimize, MoreVertical, CheckCheck } from 'lucide-react';
import { api, useApi } from '../hooks/useApi';

interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'idle' | 'error' | 'dormant';
  avatar: string;
  parent_id?: string;
  tasks_today: number;
  success_rate: number;
  roi: number;
  current_task: string;
  hire_date: string;
  version: string;
  last_heartbeat: string;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'approval' | 'data';
}

const quickCommands = [
  'Give me daily report',
  'Show earnings today',
  'What needs my approval',
  'System health check',
  'What are you working on',
];

export default function AgentChat() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [selectedAgent, setSelectedAgent] = useState(agentId || 'ceo');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: agents } = useApi<Agent[]>('/api/agents');
  useApi<any[]>('/api/comms/threads');

  const currentAgent = agents?.find(a => a.id === selectedAgent);
  const ceoAgent = agents?.find(a => a.id === 'ceo');

  const hierarchy = ceoAgent
    ? [{ ...ceoAgent, children: agents?.filter(a => a.parent_id === 'ceo' && a.role.includes('Chief')) || [] }]
    : [];

  useEffect(() => {
    if (agentId) setSelectedAgent(agentId);
  }, [agentId]);

  useEffect(() => {
    // Load messages for selected agent
    const loadMessages = async () => {
      try {
        const msgs = await api.get(`/api/comms/threads/${selectedAgent}`);
        setMessages(msgs.messages || []);
      } catch {
        setMessages([]);
      }
    };
    loadMessages();
  }, [selectedAgent]);

  useEffect(() => {
    // Connect WebSocket for live chat
    const ws = api.ws(`/ws/chat/${selectedAgent}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.sender === 'agent') {
          const newMsg: Message = {
            id: Date.now().toString(),
            sender: 'agent',
            text: data.text || data.content || '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
          };
          setMessages(prev => [...prev, newMsg]);
        }
      } catch {
        // Ignore parse errors
      }
    };

    ws.onerror = () => {
      // WebSocket error - fallback to HTTP
    };

    return () => {
      ws.close();
    };
  }, [selectedAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setShowCommands(false);

    // Send via WebSocket if available
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: inputText, agent_id: selectedAgent }));
    } else {
      // Fallback to HTTP
      try {
        const response = await api.post('/api/comms/message', {
          agent_id: selectedAgent,
          text: inputText,
        });
        const agentMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: response.text || response.content || 'Message received. Processing...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
        };
        setMessages(prev => [...prev, agentMsg]);
      } catch {
        const agentMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: 'I\'ve received your message. Processing now...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
        };
        setMessages(prev => [...prev, agentMsg]);
      }
    }
  };

  const handleAgentSelect = (id: string) => {
    setSelectedAgent(id);
    navigate(`/chat/${id}`);
  };

  const handleQuickCommand = async (cmd: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: cmd,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, newMsg]);
    setShowCommands(false);

    try {
      const response = await api.post('/api/comms/message', {
        agent_id: selectedAgent,
        text: cmd,
      });
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: response.text || response.content || 'Processing your request...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: 'Processing your request...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };
      setMessages(prev => [...prev, agentMsg]);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex gap-4" style={{ animation: 'slide-in 0.3s ease-out' }}>
      {/* Left Panel - Agent Hierarchy */}
      <div className="w-[280px] shrink-0 glass-card flex flex-col overflow-hidden">
        <div className="p-3 border-b border-white/[0.06]">
          <input
            type="text"
            placeholder="Search agents..."
            className="w-full bg-black/30 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e]"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {hierarchy.map(dept => (
            <div key={dept.id}>
              <button
                onClick={() => handleAgentSelect(dept.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                  selectedAgent === dept.id ? 'bg-white/[0.1] border-l-2 border-[#e8a94e]' : 'hover:bg-white/[0.05]'
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${dept.status === 'active' ? 'bg-[#4ee88a]' : dept.status === 'idle' ? 'bg-[#e8a94e]' : 'bg-[#e84e68]'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${selectedAgent === dept.id ? 'text-[#e8a94e]' : 'text-white'}`}>{dept.name}</p>
                  <p className="text-xs text-[#666] truncate">{dept.current_task}</p>
                </div>
                <span className="text-[10px] text-[#666]">{dept.last_heartbeat}</span>
              </button>

              {dept.children?.map(child => {
                const grandChildren = agents?.filter(a => a.parent_id === child.id) || [];
                return (
                  <div key={child.id}>
                    <button
                      onClick={() => handleAgentSelect(child.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-all ml-3 ${
                        selectedAgent === child.id ? 'bg-white/[0.1] border-l-2 border-[#e8a94e]' : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${child.status === 'active' ? 'bg-[#4ee88a]' : child.status === 'idle' ? 'bg-[#e8a94e]' : 'bg-[#666]'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${selectedAgent === child.id ? 'text-[#e8a94e]' : 'text-[#adadad]'}`}>{child.name}</p>
                        <p className="text-[10px] text-[#666] truncate">{child.current_task}</p>
                      </div>
                    </button>

                    {grandChildren.map(gc => (
                      <button
                        key={gc.id}
                        onClick={() => handleAgentSelect(gc.id)}
                        className={`w-full flex items-center gap-2 px-3 py-1 rounded-lg text-left transition-all ml-6 ${
                          selectedAgent === gc.id ? 'bg-white/[0.1] border-l-2 border-[#e8a94e]' : 'hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${gc.status === 'active' ? 'bg-[#4ee88a]' : gc.status === 'idle' ? 'bg-[#e8a94e]' : 'bg-[#666]'}`} />
                        <p className={`text-xs truncate flex-1 ${selectedAgent === gc.id ? 'text-[#e8a94e]' : 'text-[#666]'}`}>{gc.name}</p>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden" style={{ borderRadius: 24 }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            {currentAgent && (
              <>
                <div className="relative">
                  <img src={currentAgent.avatar} alt={currentAgent.name} className="w-9 h-9 rounded-full" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0b] ${
                    currentAgent.status === 'active' ? 'bg-[#4ee88a]' : currentAgent.status === 'idle' ? 'bg-[#e8a94e]' : 'bg-[#666]'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{currentAgent.name}</p>
                  <p className="text-xs text-[#adadad]">{currentAgent.role} · {currentAgent.status === 'active' ? 'Processing tasks' : currentAgent.status === 'idle' ? 'Idle' : 'Dormant'}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowInfo(!showInfo)} className="p-2 rounded-lg hover:bg-white/[0.07] text-[#adadad]"><Info className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg hover:bg-white/[0.07] text-[#adadad]"><Minimize className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg hover:bg-white/[0.07] text-[#adadad]"><MoreVertical className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-[#666] text-sm">
              Start a conversation with {currentAgent?.name || 'an agent'}
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${msg.sender === 'user' ? 'order-1' : ''}`}>
                {msg.sender === 'agent' && currentAgent && (
                  <div className="flex items-center gap-2 mb-1">
                    <img src={currentAgent.avatar} alt="" className="w-5 h-5 rounded-full" />
                    <span className="text-xs text-[#adadad]">{currentAgent.name}</span>
                  </div>
                )}
                <div className={`px-4 py-3 ${
                  msg.sender === 'user'
                    ? 'bg-[#e8a94e]/20 rounded-2xl rounded-tr-sm'
                    : 'bg-white/[0.05] rounded-2xl rounded-tl-sm'
                }`}>
                  <p className="text-sm text-white whitespace-pre-line">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  <span className="text-[10px] text-[#666]">{msg.timestamp}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-[#4ee88a]" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-5 py-2 border-t border-white/[0.04] flex items-center gap-2">
          <span className="text-xs text-[#666]">Talking to: <span className="text-[#adadad]">{currentAgent?.name}</span></span>
          <div className="flex gap-2 ml-auto">
            {['Daily Report', 'Earnings', 'System Status'].map(action => (
              <button
                key={action}
                onClick={() => handleQuickCommand(action === 'Daily Report' ? 'Give me daily report' : action === 'Earnings' ? 'Show earnings today' : 'System health check')}
                className="px-2.5 py-1 rounded-md bg-white/[0.05] text-xs text-[#adadad] hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-4 pt-2">
          <div className="flex items-end gap-2 bg-black/40 border border-white/[0.1] rounded-xl px-4 py-3 focus-within:border-[#e8a94e] transition-colors">
            <button className="p-1.5 text-[#666] hover:text-[#adadad] transition-colors shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder={`Message ${currentAgent?.name}...`}
              className="flex-1 bg-transparent text-white placeholder:text-[#666] outline-none resize-none text-sm max-h-24 min-h-[20px]"
              rows={1}
            />
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setShowCommands(!showCommands)} className="p-1.5 text-[#666] hover:text-[#adadad] transition-colors relative">
                <Command className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-[#666] hover:text-[#adadad] transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2 rounded-lg bg-[#e8a94e] text-black disabled:opacity-30 hover:shadow-[0_0_15px_rgba(232,169,78,0.3)] transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showCommands && (
            <div className="mt-2 p-2 rounded-xl bg-[#141414] border border-white/[0.08] space-y-1">
              {quickCommands.map(cmd => (
                <button
                  key={cmd}
                  onClick={() => handleQuickCommand(cmd)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#adadad] hover:bg-white/[0.07] hover:text-white transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
