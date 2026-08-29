import React, { useEffect, useState } from 'react';
import { Users, BookOpen, FileCheck, Clock, TrendingUp, MessageSquare, Award, Calendar, ArrowRight, Upload, Eye } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';

export const TeacherHomeDashboard: React.FC<{ onNavigate: (r: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => { api.getCourses().then(setCourses); api.getAssignments().then(setAssignments); }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Teacher Workspace, {currentUser?.name?.split(' ')[0] || 'Professor'}</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">Manage classes, grade submissions & track cohort performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('lectures')} className="h-8 px-3 rounded-[6px] bg-[var(--color-t4c-black)] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-800"><Upload size={14} /> New Module</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Active Classes', v: courses.length || 4, icon: <BookOpen size={16} />, color: 'emerald' },
          { label: 'Students', v: 127, icon: <Users size={16} />, color: 'amber' },
          { label: 'To Grade', v: assignments.length || 12, icon: <FileCheck size={16} />, color: 'rose' },
          { label: 'Avg Performance', v: '82%', icon: <TrendingUp size={16} />, color: 'green' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-[12px] p-4">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-[6px] bg-[var(--color-canvas-soft)] border border-[#E2E8F0] flex items-center justify-center text-[var(--color-t4c-green)]">{s.icon}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${s.color === 'rose' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>Live</span>
            </div>
            <p className="text-2xl font-bold mt-3">{s.v}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Teaching Modules */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2"><BookOpen size={16} className="text-[var(--color-t4c-green)]" /> My Teaching Modules</h2>
              <button onClick={() => onNavigate('lectures')} className="text-xs font-mono text-[var(--color-t4c-green)] hover:underline flex items-center gap-1">Manage <ArrowRight size={12} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.slice(0, 4).map(c => (
                <div key={c.id} className="border border-[#E2E8F0] rounded-[12px] p-4 hover:border-[var(--color-t4c-green)] transition-colors">
                  <p className="font-mono text-[10px] text-neutral-400 uppercase">{c.code}</p>
                  <h3 className="font-semibold text-sm mt-1 line-clamp-2">{c.title}</h3>
                  <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500">
                    <Users size={12} /> {Math.floor(20 + Math.random() * 40)} students
                    <span className="ml-auto flex items-center gap-1"><Eye size={12} /> {c.progressPercent || 72}%</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-t4c-yellow)]" style={{ width: `${c.progressPercent || 65}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grading Queue */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6">
            <h2 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2 mb-4"><FileCheck size={16} className="text-amber-600" /> Grading Queue</h2>
            <div className="space-y-2">
              {assignments.slice(0, 4).map(a => (
                <div key={a.id} className="flex items-center gap-3 border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 hover:border-amber-200 transition-colors">
                  <div className="w-8 h-8 rounded-[6px] bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-mono text-xs font-bold">{a.maxPoints || 100}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{a.title}</p>
                    <p className="text-[11px] font-mono text-neutral-500">{a.courseCode} • {a.dueDate}</p>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded">PENDING</span>
                  <button onClick={() => onNavigate('assignments')} className="text-xs font-bold text-[var(--color-t4c-green)] hover:underline">Grade →</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Cohort Performance */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2 mb-3"><TrendingUp size={16} className="text-emerald-600" /> Cohort Performance</h2>
            <div className="h-20 flex items-end gap-1">
              {[70, 82, 78, 85, 90, 76, 88].map((v, i) => (
                <div key={i} className="flex-1 bg-amber-100 border border-amber-200 rounded-t overflow-hidden flex flex-col justify-end">
                  <div className="bg-[var(--color-t4c-yellow)]" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1"><span>W1</span><span>W7</span></div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Award size={14} className="text-amber-500" /> <span className="font-mono font-bold">3.82 avg</span> <span className="text-neutral-500">cohort GPA</span>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2 mb-3"><Calendar size={16} /> Upcoming Schedule</h2>
            <div className="space-y-2">
              {[
                { t: 'Lecture: Raft Consensus', d: 'Today 10:00', c: 'CS-441' },
                { t: 'Office Hours', d: 'Tomorrow 14:00', c: 'Consult' },
                { t: 'Grading Deadline', d: 'Fri 23:59', c: 'Due' },
              ].map(e => (
                <div key={e.t} className="border border-[#E2E8F0] rounded-[6px] px-3 py-2 flex items-center gap-2">
                  <Clock size={14} className="text-neutral-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{e.t}</p>
                    <p className="text-[11px] font-mono text-neutral-500">{e.d} • {e.c}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2 mb-3"><MessageSquare size={16} /> Student Inbox</h2>
            <div className="space-y-2">
              {[
                { n: 'Sarah Ndlovu', m: 'Question on assignment rubric', t: '10m ago' },
                { n: 'James K.', m: 'Request extension', t: '2h ago' },
              ].map(x => (
                <div key={x.n} className="border border-[#E2E8F0] rounded-[6px] px-3 py-2">
                  <p className="text-xs font-medium">{x.n}</p>
                  <p className="text-xs text-neutral-600 truncate">{x.m}</p>
                  <p className="text-[11px] font-mono text-neutral-400">{x.t}</p>
                </div>
              ))}
              <button onClick={() => onNavigate('discussions')} className="w-full text-xs font-mono text-[var(--color-t4c-green)] hover:underline">Open messages →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
