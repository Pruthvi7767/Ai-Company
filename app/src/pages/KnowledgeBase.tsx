import { useState } from 'react';
import { Search, BookOpen, TrendingUp, FileText, Target, Edit } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('wiki');
  const { data: knowledgeData } = useApi<any[]>('/api/knowledge');
  const knowledge = knowledgeData || [];

  const sections = [
    { id: 'wiki', label: 'Company Wiki', icon: BookOpen },
    { id: 'competitors', label: 'Competitors', icon: TrendingUp },
    { id: 'research', label: 'Research', icon: FileText },
    { id: 'niches', label: 'Niches', icon: Target },
  ];

  const wikiItems = knowledge.filter(k => k.section === 'wiki' || !k.section);

  return (
    <div className="space-y-6" style={{ animation: 'slide-in 0.3s ease-out' }}>
      <div><h1 className="text-2xl font-medium text-white">Knowledge Base</h1><p className="text-sm text-[#adadad] mt-1">Centralized intelligence repository</p></div>
      <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
        <input type="text" placeholder="Search knowledge base..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#666] outline-none focus:border-[#e8a94e] text-sm" /></div>
      <div className="flex gap-1">
        {sections.map(s => { const Icon = s.icon; return (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === s.id ? 'bg-[#e8a94e] text-black' : 'bg-white/[0.04] text-[#adadad] hover:bg-white/[0.07]'}`}>
            <Icon className="w-4 h-4" /> {s.label}</button>); })}
      </div>

      {activeSection === 'wiki' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wikiItems.filter(w => !search || w.title?.toLowerCase().includes(search.toLowerCase())).map(item => (
            <div key={item.id} className="glass-card-hover p-5">
              <h3 className="text-sm font-medium text-white mb-2">{item.title}</h3>
              <div className="flex items-center gap-3 text-xs text-[#adadad] mb-3"><span>Updated {item.last_updated || '-'}</span><span>{item.agents_using || 0} agents using</span></div>
              <div className="flex gap-2"><button className="px-3 py-1.5 rounded-md bg-white/[0.05] text-xs text-[#adadad] hover:bg-white/[0.08]">View</button><button className="px-3 py-1.5 rounded-md bg-white/[0.05] text-xs text-[#adadad] hover:bg-white/[0.08] flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</button></div>
            </div>
          ))}
          {wikiItems.length === 0 && <p className="text-sm text-[#666] text-center py-8 col-span-2">No wiki entries yet</p>}
        </div>
      )}

      {activeSection !== 'wiki' && (
        <div className="glass-card p-8 text-center"><p className="text-sm text-[#666]">No {activeSection} entries yet</p></div>
      )}
    </div>
  );
}
