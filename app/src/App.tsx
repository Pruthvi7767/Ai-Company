import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import SleepScreen from './pages/SleepScreen';
import Dashboard from './pages/Dashboard';
import AgentChat from './pages/AgentChat';
import AgentDirectory from './pages/AgentDirectory';
import AgentDetail from './pages/AgentDetail';
import Connectors from './pages/Connectors';
import IncomeStreams from './pages/IncomeStreams';
import PlatformDetail from './pages/PlatformDetail';
import Earnings from './pages/Earnings';
import BoardMeeting from './pages/BoardMeeting';
import Approvals from './pages/Approvals';
import KnowledgeBase from './pages/KnowledgeBase';
import ErrorLogs from './pages/ErrorLogs';
import Settings from './pages/Settings';
import SystemHealth from './pages/SystemHealth';
import Notifications from './pages/Notifications';
import CapabilityRegistry from './pages/CapabilityRegistry';
import ContentManager from './pages/ContentManager';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import AgentHireFire from './pages/AgentHireFire';
import BrowserView from './pages/BrowserView';

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/sleep" element={<SleepScreen />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<AgentChat />} />
          <Route path="/chat/:agentId" element={<AgentChat />} />
          <Route path="/agents" element={<AgentDirectory />} />
          <Route path="/agents/:id" element={<AgentDetail />} />
          <Route path="/connectors" element={<Connectors />} />
          <Route path="/income-streams" element={<IncomeStreams />} />
          <Route path="/platform/:id" element={<PlatformDetail />} />
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/board-meetings" element={<BoardMeeting />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/error-logs" element={<ErrorLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/system-health" element={<SystemHealth />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/capabilities" element={<CapabilityRegistry />} />
          <Route path="/content-manager" element={<ContentManager />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="/agent-hire-fire" element={<AgentHireFire />} />
          <Route path="/browser" element={<BrowserView />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
