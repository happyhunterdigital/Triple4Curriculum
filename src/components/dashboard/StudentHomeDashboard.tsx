import React, { useEffect, useState } from 'react';
import { Play, Clock, CheckCircle2, Award, Bell, FileText, Download, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';

interface StudentHomeDashboardProps { onNavigate: (r: string) => void; }

export const StudentHomeDashboard: React.FC<StudentHomeDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => { api.getCourses().then(setCourses); api.getAssignments().then(setAssignments); }, []);

  const now = new Date();
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Welcome back, {currentUser?.name?.split(' ')[0] || 'Sarah'}</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">Your centralized learner home — courses, progress & deadlines</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-[6px]">NQF-8 • Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left 8 cols: Course Overview + Progress + Grades */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Course Overview: Resume buttons */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2"><Play size={16} className="text-[var(--color-t4c-green)]" /> Course Overview</h2>
              <button onClick={() => onNavigate('lectures')} className="text-xs font-mono text-[var(--color-t4c-green)] hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {courses.slice(0, 4).map(c => (
                <div key={c.id} className="border border-[#E2E8F0] rounded-[12px] p-4 hover:border-[var(--color-t4c-green)] transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">{c.code}</p>
                      <h3 className="font-semibold text-sm leading-tight mt-1 truncate">{c.title}</h3>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{c.description}</p>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#E2E8F0] rounded shrink-0">{c.credits} cr</span>
                  </div>
                  <button onClick={() => onNavigate('lectures')} className="mt-3 w-full h-8 rounded-[6px] bg-[var(--color-t4c-black)] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[var(--color-t4c-green)] transition-colors">
                    <Play size={12} /> Resume
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Trackers: bars + rings */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6">
            <h2 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-[var(--color-t4c-yellow)]" /> Progress Trackers</h2>
            <div className="space-y-4">
              {courses.slice(0, 3).map(c => {
                const pct = c.progressPercent || Math.floor(40 + Math.random() * 50);
                return (
                  <div key={`prog-${c.id}`} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium truncate pr-2">{c.title}</span>
                      <span className="font-mono text-neutral-500">{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[var(--color-t4c-green)] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-1">
                      {[25, 50, 75, 100].map(m => (
                        <span key={m} className={`text-[10px] font-mono px-1 rounded ${pct >= m ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-50 text-neutral-400 border border-neutral-200'}`}>{m}%</span>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: 'Chapter', v: 68 },
                  { label: 'Term', v: 42 },
                  { label: 'Overall', v: 76 },
                ].map(r => (
                  <div key={r.label} className="border border-[#E2E8F0] rounded-[12px] p-3 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full border-4 border-[#E2E8F0] flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(var(--color-t4c-green) ${r.v}%, #E2E8F0 0)` }} />
                      <span className="relative bg-white w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold">{r.v}%</span>
                    </div>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 mt-2">{r.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grades and Feedback */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2"><Award size={16} className="text-amber-500" /> Grades & Feedback</h2>
              <span className="font-mono text-xs px-2 py-1 bg-amber-50 border border-amber-200 rounded">GPA 3.88</span>
            </div>
            <div className="h-24 flex items-end gap-1.5">
              {[62, 78, 85, 73, 90, 88, 76].map((v, i) => (
                <div key={i} className="flex-1 bg-[var(--color-t4c-green)]/10 border border-[#E2E8F0] rounded-t flex flex-col justify-end overflow-hidden">
                  <div className="bg-[var(--color-t4c-green)] transition-all" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
              <span>Term 1</span><span>Term 4</span>
            </div>
            <div className="mt-4 space-y-2">
              {assignments.slice(0, 2).map(a => (
                <div key={a.id} className="flex items-center justify-between text-xs border border-[#E2E8F0] rounded-[6px] px-3 py-2">
                  <span className="truncate pr-2">{a.title}</span>
                  <span className="font-mono font-bold text-[var(--color-t4c-green)]">{a.maxPoints ? `${Math.floor(a.maxPoints * 0.85)}/${a.maxPoints}` : 'A-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 cols: To-Do, Notifications, Resources */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* To-Do Lists and Deadlines */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2 mb-3"><Calendar size={16} className="text-[var(--color-t4c-green)]" /> To-Do & Deadlines</h2>
            <div className="space-y-2.5">
              {[
                { title: 'RA Paper Draft', due: 'Due in 2 days', color: 'emerald' },
                { title: 'Quiz: Adaptive Bitrate', due: 'Due tomorrow', color: 'amber' },
                { title: 'Lab Report', due: 'Overdue', color: 'rose' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3 border border-[#E2E8F0] rounded-[6px] px-3 py-2.5">
                  <Clock size={14} className={t.color === 'rose' ? 'text-rose-600' : t.color === 'amber' ? 'text-amber-600' : 'text-emerald-600'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{t.title}</p>
                    <p className={`text-[11px] font-mono ${t.color === 'rose' ? 'text-rose-600' : t.color === 'amber' ? 'text-amber-600' : 'text-emerald-600'}`}>{t.due}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${t.color === 'rose' ? 'bg-rose-500' : t.color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </div>
              ))}
              <button onClick={() => onNavigate('assignments')} className="w-full text-xs font-mono text-[var(--color-t4c-green)] hover:underline mt-1">View calendar →</button>
            </div>
          </div>

          {/* Notifications and Messages */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2 mb-3"><Bell size={16} className="text-[var(--color-t4c-yellow)]" /> Notifications & Messages</h2>
            <div className="space-y-2">
              {[
                { from: 'Dr. Vance', msg: 'Feedback on Raft draft available', time: '2h ago' },
                { from: 'System', msg: 'Live class starts in 30m', time: '5h ago' },
                { from: 'Forum', msg: 'New reply in Discussions', time: '1d ago' },
              ].map((n, i) => (
                <div key={i} className="border border-[#E2E8F0] rounded-[6px] px-3 py-2">
                  <p className="text-xs font-medium">{n.from}</p>
                  <p className="text-xs text-neutral-600 truncate">{n.msg}</p>
                  <p className="text-[11px] font-mono text-neutral-400">{n.time}</p>
                </div>
              ))}
              <button onClick={() => onNavigate('notices')} className="w-full text-xs font-mono text-[var(--color-t4c-green)] hover:underline">Open inbox →</button>
            </div>
          </div>

          {/* Resources and Certificates */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2 mb-3"><Download size={16} className="text-neutral-700" /> Resources & Certificates</h2>
            <div className="space-y-2">
              {[
                { name: 'Course Notes - Ch.3 PDF', icon: <FileText size={14} /> },
                { name: 'Digital Systems Textbook', icon: <FileText size={14} /> },
                { name: 'Certificate: Term 2 Complete', icon: <Award size={14} className="text-amber-500" /> },
              ].map(r => (
                <a key={r.name} className="flex items-center gap-2 border border-[#E2E8F0] rounded-[6px] px-3 py-2 text-xs hover:border-[var(--color-t4c-green)] transition-colors cursor-pointer">
                  <span className="text-neutral-500">{r.icon}</span>
                  <span className="flex-1 truncate">{r.name}</span>
                  <Download size={12} className="text-neutral-400" />
                </a>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-neutral-500">
              <CheckCircle2 size={12} className="text-emerald-600" /> POPIA-protected downloads
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
