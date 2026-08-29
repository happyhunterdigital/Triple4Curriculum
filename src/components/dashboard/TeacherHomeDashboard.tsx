import React, { useEffect, useState } from 'react';
import { Users, BookOpen, FileCheck, Clock, TrendingUp, MessageSquare, Award, Calendar, ArrowRight, Upload, Eye, ShieldAlert, Flame, BarChart3, Megaphone, Video, EyeOff, Check, AlertTriangle, Mic, Headphones } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';

export const TeacherHomeDashboard: React.FC<{ onNavigate: (r: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [publishState, setPublishState] = useState<Record<string, boolean>>({ 'crs_1': true, 'crs_2': false, 'crs_3': true, 'crs_4': true });
  const [feedbackDraft, setFeedbackDraft] = useState("");

  useEffect(() => { api.getCourses().then(setCourses); api.getAssignments().then(setAssignments); }, []);

  const atRisk = [
    { name: 'Thabo M.', course: 'CSC-441', reason: 'Attendance 62% • Grade 54%', avatar: 'TM' },
    { name: 'Aisha K.', course: 'AI-442', reason: 'No login 8 days', avatar: 'AK' },
    { name: 'Lerato P.', course: 'SYS-443', reason: 'Grade drop 78→61%', avatar: 'LP' },
  ];

  const heatmap = Array.from({ length: 35 }, (_, i) => Math.floor(Math.random() * 4));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Command Center — {currentUser?.name?.split(' ')[0] || 'Professor'}</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">Oversight, analytics & workflow automation — not personal progress</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-[6px]"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live telemetry</span>
          <button onClick={() => onNavigate('lectures')} className="h-8 px-3 rounded-[6px] bg-[var(--color-t4c-black)] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-800"><Upload size={14} /> New Module</button>
        </div>
      </div>

      {/* 1. Class Analytics & Insights — Visual Center */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-[var(--color-t4c-green)]" />
          <h2 className="font-display font-semibold text-sm sm:text-base">Class Analytics & Insights</h2>
          <span className="ml-auto text-[11px] font-mono text-neutral-500 hidden sm:inline">Spot trends • Early intervention</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Engagement Heatmaps */}
          <div className="lg:col-span-4 border border-[#E2E8F0] rounded-[12px] p-4">
            <h3 className="text-xs font-bold flex items-center gap-1.5"><Flame size={14} className="text-amber-500" /> Engagement Heatmaps</h3>
            <p className="text-[11px] text-neutral-500 mt-1">Portal logins • Video watch • Participation (35 days)</p>
            <div className="grid grid-cols-7 gap-1 mt-3">
              {heatmap.map((v, i) => (
                <div key={i} className={`h-6 rounded-[4px] border ${v === 0 ? 'bg-neutral-50 border-[#E2E8F0]' : v === 1 ? 'bg-amber-100 border-amber-200' : v === 2 ? 'bg-emerald-200 border-emerald-300' : 'bg-[var(--color-t4c-green)] border-emerald-800'}`} title={`Day ${i + 1}: level ${v}`} />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-neutral-500"><span>Less</span><div className="flex gap-1"><span className="w-3 h-3 rounded-sm bg-neutral-50 border border-[#E2E8F0]" /><span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200" /><span className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-300" /><span className="w-3 h-3 rounded-sm bg-[var(--color-t4c-green)]" /></div><span>More</span></div>
          </div>

          {/* Performance Distribution — Bell Curve */}
          <div className="lg:col-span-5 border border-[#E2E8F0] rounded-[12px] p-4">
            <h3 className="text-xs font-bold flex items-center gap-1.5"><TrendingUp size={14} className="text-[var(--color-t4c-yellow)]" /> Performance Distribution</h3>
            <p className="text-[11px] text-neutral-500 mt-1">Grade averages across 3 classes — Period: Term 3</p>
            <div className="mt-3 h-28 relative border-b border-l border-[#E2E8F0] px-2">
              <svg viewBox="0 0 200 80" className="w-full h-full">
                <path d="M0 70 Q 50 70 80 40 T 130 20 T 200 70" fill="none" stroke="var(--color-t4c-green)" strokeWidth="2" />
                <path d="M0 70 Q 50 70 80 40 T 130 20 T 200 70 L 200 70 L 0 70 Z" fill="rgba(8,66,40,0.08)" />
                {[40, 80, 120, 160].map(x => <line key={x} x1={x} y1={70} x2={x} y2={0} stroke="#E2E8F0" strokeDasharray="2 2" />)}
              </svg>
              <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1"><span>F</span><span>D</span><span>C</span><span>B</span><span>A</span></div>
            </div>
            <div className="flex gap-2 mt-2 text-[11px]">
              <span className="px-2 py-1 bg-white border border-[#E2E8F0] rounded">CSC-441 avg 74%</span>
              <span className="px-2 py-1 bg-white border border-[#E2E8F0] rounded">AI-442 avg 81%</span>
              <span className="px-2 py-1 bg-white border border-[#E2E8F0] rounded">SYS-443 avg 69%</span>
            </div>
          </div>

          {/* At-Risk Alerts */}
          <div className="lg:col-span-3 border border-rose-200 bg-rose-50/40 rounded-[12px] p-4">
            <h3 className="text-xs font-bold flex items-center gap-1.5 text-rose-700"><AlertTriangle size={14} /> At-Risk Alerts</h3>
            <p className="text-[11px] text-neutral-600 mt-1">Auto-flagged — grades/attendance drop</p>
            <div className="space-y-2 mt-3">
              {atRisk.map(s => (
                <div key={s.name} className="flex items-center gap-2 bg-white border border-rose-200 rounded-[6px] px-2.5 py-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-[10px] font-bold text-rose-700 shrink-0">{s.avatar}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-none">{s.name} <span className="font-mono text-[10px] text-neutral-500">• {s.course}</span></p>
                    <p className="text-[11px] text-rose-600 truncate">{s.reason}</p>
                  </div>
                  <ShieldAlert size={14} className="text-rose-500 shrink-0" />
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('lectures')} className="w-full mt-3 text-xs font-mono text-rose-700 hover:underline">Intervene →</button>
          </div>
        </div>
      </div>

      {/* 2. Grading & Feedback Queue — Workflow Engine */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2"><FileCheck size={16} className="text-amber-600" /> Grading & Feedback Queue</h2>
          <span className="text-[11px] font-mono px-2 py-1 bg-amber-50 border border-amber-200 rounded">{assignments.length || 5} pending</span>
        </div>
        <div className="space-y-2">
          {[
            { title: 'Raft Consensus Draft — Thabo M.', course: 'CSC-441', due: 'Due 2d ago', points: 100, plag: 2, ai: 12 },
            { title: 'POPIA Case Study — Aisha K.', course: 'AI-442', due: 'Due yesterday', points: 50, plag: 18, ai: 4 },
            { title: 'Kernel Module Lab — James K.', course: 'SYS-443', due: 'Due today', points: 100, plag: 0, ai: 1 },
          ].map((a, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-[#E2E8F0] rounded-[8px] px-3 py-3 hover:border-amber-200 transition-colors">
              <div className="w-10 h-10 rounded-[6px] bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-mono text-xs font-bold shrink-0">{a.points}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{a.title}</p>
                <p className="text-[11px] font-mono text-neutral-500">{a.course} • {a.due}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${a.plag > 10 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}><ShieldAlert size={10} /> Plag {a.plag}%</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${a.ai > 10 ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-neutral-50 border-[#E2E8F0] text-neutral-600'}`}>AI {a.ai}%</span>
              </div>
              <button onClick={() => onNavigate('assignments')} className="text-xs font-bold text-[var(--color-t4c-green)] hover:underline shrink-0">Grade →</button>
            </div>
          ))}
        </div>
        <div className="mt-4 border border-dashed border-[#E2E8F0] rounded-[8px] p-3 bg-[var(--color-canvas-soft)]">
          <p className="text-xs font-semibold flex items-center gap-1.5"><Mic size={14} /> Feedback Templates</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Great reasoning — cite Raft §3.2', 'Clarify quorum math', 'Excellent code — add comments'].map(t => (
              <button key={t} onClick={() => setFeedbackDraft(t)} className="text-[11px] px-2.5 py-1 rounded-[6px] border bg-white border-[#E2E8F0] hover:border-[var(--color-t4c-green)] flex items-center gap-1"><Headphones size={10} /> {t}</button>
            ))}
          </div>
          {feedbackDraft && <div className="mt-2 flex gap-2"><input value={feedbackDraft} onChange={e => setFeedbackDraft(e.target.value)} className="flex-1 h-8 rounded-[6px] border border-[#E2E8F0] px-2 text-xs" /><button className="h-8 px-3 bg-[var(--color-t4c-green)] text-white rounded-[6px] text-xs">Insert</button></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* 3. Lesson Planner & Content Management */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-6">
          <h2 className="font-display font-semibold text-sm sm:text-base flex items-center gap-2"><Calendar size={16} className="text-[var(--color-t4c-green)]" /> Lesson Planner & Content Management</h2>
          <div className="mt-4 border-l-2 border-[#E2E8F0] pl-4 space-y-4 ml-2">
            {[
              { time: '09:00 — 10:30', title: 'Lecture: Raft Leader Election', type: 'Live • Meet', link: 'meet.444/l/raft-3', live: true },
              { time: '11:00 — 12:00', title: 'Office Hours — AI Ethics', type: 'In-person • B-201', live: false },
              { time: '14:00 — 15:30', title: 'Lab: Kernel Modules', type: 'Virtual Classroom', live: false },
            ].map(e => (
              <div key={e.title} className="relative">
                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${e.live ? 'bg-emerald-500 border-white shadow animate-pulse' : 'bg-white border-[#E2E8F0]'}`} />
                <p className="font-mono text-[11px] text-neutral-500">{e.time} • {e.type}</p>
                <p className="text-xs font-semibold mt-0.5">{e.title}</p>
                {e.link && <a className="text-[11px] font-mono text-[var(--color-t4c-green)] hover:underline flex items-center gap-1"><Video size={10} /> {e.link}</a>}
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-bold">Curriculum Progress — Semester 1</h3>
            {courses.slice(0, 3).map(c => (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-xs"><span className="font-medium truncate pr-2">{c.code} — {c.title}</span><span className="font-mono text-neutral-500">{c.progressPercent || 64}%</span></div>
                <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full bg-[var(--color-t4c-yellow)]" style={{ width: `${c.progressPercent || 64}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <h3 className="text-xs font-bold">Quick-Publish Toggle</h3>
            {[
              { id: 'crs_1', name: 'Module 4 — Log Replication Quiz' },
              { id: 'crs_2', name: 'Module 5 — POPIA Audit Lab' },
              { id: 'crs_3', name: 'Week 6 — Reading Pack (PDF)' },
            ].map(m => (
              <div key={m.id} className="flex items-center justify-between border border-[#E2E8F0] rounded-[6px] px-3 py-2 text-xs">
                <span>{m.name}</span>
                <button
                  onClick={() => setPublishState(s => ({ ...s, [m.id]: !s[m.id] }))}
                  className={`h-6 w-11 rounded-full border flex items-center p-0.5 transition-colors ${publishState[m.id] ? 'bg-[var(--color-t4c-green)] border-emerald-800 justify-end' : 'bg-neutral-200 border-[#E2E8F0] justify-start'}`}
                  aria-label="Publish toggle"
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow flex items-center justify-center">{publishState[m.id] ? <Eye size={10} /> : <EyeOff size={10} />}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Communication & Support Hub */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2"><Users size={16} className="text-[var(--color-t4c-yellow)]" /> Parent-Teacher Portal</h2>
            <div className="space-y-2 mt-3">
              {[
                { parent: 'Mrs. Mokoena (Thabo M.)', msg: 'Concerned about attendance drop', time: '09:14' },
                { parent: 'Mr. Khumalo (Aisha K.)', msg: 'Request meeting re: AI elective', time: 'Yesterday' },
              ].map(p => (
                <div key={p.parent} className="border border-[#E2E8F0] rounded-[6px] px-3 py-2">
                  <p className="text-xs font-semibold">{p.parent}</p>
                  <p className="text-xs text-neutral-600 truncate">{p.msg}</p>
                  <p className="text-[11px] font-mono text-neutral-400">{p.time} • <button className="text-[var(--color-t4c-green)] hover:underline">Reply</button></p>
                </div>
              ))}
              <button className="w-full text-xs font-mono text-[var(--color-t4c-green)] hover:underline">Open portal →</button>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2"><Megaphone size={16} className="text-amber-600" /> Discussion Moderation</h2>
            <div className="space-y-2 mt-3">
              {[
                { post: '“Is Raft faster than Paxos?” — L. Patel', flag: 'Needs answer', time: '1h ago' },
                { post: '“POPIA requires consent for…” — Forum #AI-442', flag: 'Flagged: verify citation', time: '3h ago' },
              ].map(d => (
                <div key={d.post} className="border border-amber-200 bg-amber-50/50 rounded-[6px] px-3 py-2">
                  <p className="text-xs font-medium line-clamp-2">{d.post}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-amber-200 rounded">{d.flag}</span>
                    <span className="text-[11px] font-mono text-neutral-500">{d.time}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="text-[11px] px-2 py-1 rounded-[6px] bg-[var(--color-t4c-green)] text-white">Approve</button>
                    <button className="text-[11px] px-2 py-1 rounded-[6px] border bg-white">Reply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 sm:p-5">
            <h2 className="font-display font-semibold text-sm flex items-center gap-2"><Clock size={16} /> Office Hour Booking</h2>
            <div className="space-y-2 mt-3">
              {[
                { s: 'Aisha K. — Raft log replication', t: 'Wed 15:00 (15m)' },
                { s: 'James P. — Kernel panic debug', t: 'Thu 10:30 (20m)' },
                { s: 'Group — AI Ethics debate prep', t: 'Fri 09:00 (30m)' },
              ].map(b => (
                <div key={b.s} className="border border-[#E2E8F0] rounded-[6px] px-3 py-2 flex items-center gap-2">
                  <Calendar size={14} className="text-neutral-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{b.s}</p>
                    <p className="text-[11px] font-mono text-neutral-500">{b.t}</p>
                  </div>
                  <Check size={14} className="text-emerald-600" />
                </div>
              ))}
              <button onClick={() => onNavigate('timetable')} className="w-full text-xs font-mono text-[var(--color-t4c-green)] hover:underline">Manage calendar →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
