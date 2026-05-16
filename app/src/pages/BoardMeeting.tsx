import { useState } from 'react';
import { Calendar, Users, CheckCircle, ArrowRight, Video } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function BoardMeeting() {
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const { data: meetingsData } = useApi<any[]>('/api/board-meetings');
  const boardMeetings = meetingsData || [];

  const nextMeeting = boardMeetings[0];
  const now = new Date();
  const meetingTime = nextMeeting ? new Date(nextMeeting.date + 'T' + nextMeeting.time) : now;
  const diffMs = meetingTime.getTime() - now.getTime();
  const diffHrs = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const diffMins = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div><h1 className="text-2xl font-medium text-white">Board Meetings</h1><p className="text-sm text-[#adadad] mt-1">Manage your meeting schedule</p></div>

      {nextMeeting ? (
        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div><span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8a94e]/15 text-[#e8a94e] font-medium">{nextMeeting.type}</span>
              <h2 className="text-xl font-medium text-white mt-2">{nextMeeting.date} at {nextMeeting.time}</h2></div>
            <div className="text-right"><p className="text-3xl font-light text-white mono">{String(diffHrs).padStart(2, '0')}:{String(diffMins).padStart(2, '0')}</p><p className="text-xs text-[#adadad]">until next meeting</p></div>
          </div>
          <div className="space-y-2 mb-4">
            <p className="text-xs text-[#666] uppercase tracking-wider">Agenda</p>
            {(nextMeeting.agenda ? (() => {
              try { return typeof nextMeeting.agenda === 'string' ? JSON.parse(nextMeeting.agenda) : nextMeeting.agenda; }
              catch { return []; }
            })() : []).map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2"><span className="text-xs text-[#e8a94e] font-medium">{i + 1}.</span><span className="text-sm text-[#adadad]">{item}</span></div>))}
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e8a94e] text-black text-sm font-semibold hover:shadow-[0_0_20px_rgba(232,169,78,0.3)] transition-all"><Video className="w-4 h-4" /> Join Meeting</button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] text-sm text-[#adadad] hover:bg-white/[0.08]">View Full Agenda <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center"><p className="text-sm text-[#666]">No meetings scheduled</p></div>
      )}

      <div>
        <h2 className="text-lg font-medium text-white mb-4">Past Meetings</h2>
        <div className="space-y-3">
          {boardMeetings.slice(1).map(meeting => (
            <div key={meeting.id} className="glass-card overflow-hidden">
              <button onClick={() => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center"><Calendar className="w-5 h-5 text-[#e8a94e]" /></div>
                  <div><p className="text-sm font-medium text-white">{meeting.type}</p><p className="text-xs text-[#adadad]">{meeting.date} · {meeting.duration}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-[#adadad]"><CheckCircle className="w-3.5 h-3.5 text-[#4ee88a]" /> {meeting.decisions || 0} decisions</div>
                  <div className="flex items-center gap-1 text-xs text-[#adadad]"><Users className="w-3.5 h-3.5 text-[#4e8ee8]" /> {meeting.actions || 0} actions</div>
                  <ArrowRight className={`w-4 h-4 text-[#666] transition-transform ${expandedMeeting === meeting.id ? 'rotate-90' : ''}`} />
                </div>
              </button>
            </div>
          ))}
          {boardMeetings.length <= 1 && <p className="text-sm text-[#666] text-center py-4">No past meetings</p>}
        </div>
      </div>
    </div>
  );
}
