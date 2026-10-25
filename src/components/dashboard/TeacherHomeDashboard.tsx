import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock,
  LayoutDashboard,
  MessageSquare,
  Users,
} from 'lucide-react';
import { BentoCard, BentoGrid, BentoPill } from '../ui/Bento';

interface QueuedTask {
  id: string;
  type: 'grade' | 'review' | 'respond';
  title: string;
  context: string;
  count?: number;
  urgency: 'high' | 'medium' | 'low';
}
interface StudentAlert {
  id: string;
  name: string;
  metric: string;
  reason: string;
  severity: 'high' | 'medium';
}

const SCHEDULE = [
  { time: '09:00 - 10:15', name: 'Grade 10 Mathematics', sub: 'Section A', status: 'Concluded', live: false },
  { time: '11:00 - 12:15', name: 'Grade 11 Pure Mathematics', sub: 'Advanced level', status: 'Active broadcast', live: true },
  { time: '14:00 - 14:45', name: 'Faculty office hours', sub: 'Open consulting', status: 'Up next', live: false },
];

const CLASS_METRICS = [
  { label: 'Grade 11A', value: '82%', sub: '28 students', pct: 82 },
  { label: 'Grade 10B', value: '71%', sub: '31 students', pct: 71 },
];

export const TeacherHomeDashboard: React.FC<{ onNavigate: (r: string) => void }> = ({ onNavigate }) => {
  const [tasks] = useState<QueuedTask[]>([
    { id: '1', type: 'grade', title: 'Grade 11 Math Exams', context: 'Trigonometry midterm submissions', count: 12, urgency: 'high' },
    { id: '2', type: 'review', title: 'Extension Request: Sarah Jenkins', context: 'History Essay timeline adjustments', urgency: 'medium' },
    { id: '3', type: 'respond', title: 'Unread Parent Inquiries', context: 'Awaiting portal messaging dispatch', count: 4, urgency: 'low' },
  ]);
  const [alerts] = useState<StudentAlert[]>([
    { id: '1', name: 'John Doe', metric: 'Attendance', reason: 'Missed 3 consecutive live sessions', severity: 'high' },
    { id: '2', name: 'Alex Smith', metric: 'Performance', reason: 'Weighted math scores decreased by more than 12%', severity: 'medium' },
  ]);

  const liveSlot = SCHEDULE.find((slot) => slot.live);
  const upNext = SCHEDULE.filter((slot) => !slot.live && slot.status === 'Up next');

  const taskTarget = (type: QueuedTask['type']) =>
    type === 'grade' ? 'assignments' : type === 'review' ? 'discussions' : 'notices';

  return (
    <div className="w-full bg-[var(--color-canvas-soft)] text-[#0F172A] font-sans antialiased -m-3 xs:-m-4 sm:-m-5 md:-m-6 lg:-m-6 xl:-m-8">
      <header className="px-5 xs:px-7 sm:px-9 lg:px-10 pt-6 sm:pt-8 pb-2 sm:pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <p className="text-[10px] font-mono text-[#64748B] uppercase tracking-[0.18em]">Faculty operations</p>
          <h1 className="mt-1 font-display text-xl sm:text-2xl font-semibold tracking-tight">Welcome back, Mr. Davis.</h1>
        </div>
        <div className="flex items-center gap-2">
          <BentoPill tone="green">3 lectures</BentoPill>
          <BentoPill tone="yellow">16 actions pending</BentoPill>
        </div>
      </header>

      <div className="px-5 xs:px-7 sm:px-9 lg:px-10 py-4 sm:py-6">
        <BentoGrid>
          {/* Hero: today's teaching day */}
          <BentoCard
            accent="green"
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
            eyebrow="Teaching day"
            icon={
              liveSlot ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9C444] opacity-70" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E9C444]" />
                </span>
              ) : undefined
            }
          >
            <div className="h-full flex flex-col justify-between gap-6">
              <div>
                {liveSlot && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-widest bg-white/10 text-white/80 px-2 py-0.5 rounded-full uppercase">
                        Active broadcast
                      </span>
                      <span className="text-[10px] font-mono tracking-widest text-white/60 flex items-center gap-1">
                        <Clock size={11} /> {liveSlot.time}
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-[1.05]">
                      {liveSlot.name}
                    </h2>
                    <p className="mt-1 text-xs text-white/60">{liveSlot.sub}</p>
                    <button
                      onClick={() => onNavigate('classroom')}
                      className="mt-5 inline-flex items-center gap-2 bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                    >
                      Open classroom <ArrowUpRight size={14} />
                    </button>
                  </>
                )}
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/50">Today</p>
                <ul className="mt-2 space-y-2">
                  {SCHEDULE.map((slot) => (
                    <li key={slot.name} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-xs truncate ${slot.live ? 'text-white font-medium' : 'text-white/80'}`}>{slot.name}</p>
                        <p className="text-[10px] font-mono text-white/50">{slot.sub}</p>
                      </div>
                      <span className="text-[10px] font-mono text-white/60 shrink-0">{slot.time.split(' - ')[0]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </BentoCard>

          {/* Pending actions metric */}
          <BentoCard eyebrow="Actions pending" icon={<ClipboardList size={16} className="text-[#64748B]" />}>
            <p className="font-display text-4xl font-semibold tracking-tight">16</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <BentoPill tone="danger">12 to grade</BentoPill>
              <BentoPill tone="neutral">4 inquiries</BentoPill>
            </div>
            <p className="mt-3 text-[11px] text-[#64748B]">Across 3 classes this week</p>
          </BentoCard>

          {/* Class metric A */}
          <BentoCard accent="yellow" eyebrow={CLASS_METRICS[0].label} icon={<Users size={16} className="text-[#B99A28]" />}>
            <div className="flex items-end justify-between gap-2">
              <span className="font-display text-3xl font-semibold tracking-tight">{CLASS_METRICS[0].value}</span>
              <span className="text-[10px] font-mono text-[#7A5A00]">avg</span>
            </div>
            <p className="mt-1 text-[11px] text-[#7A5A00]">{CLASS_METRICS[0].sub}</p>
            <div className="mt-3 h-1.5 rounded-full bg-[#B99A28]/20 overflow-hidden">
              <div className="h-full rounded-full bg-[#B99A28]" style={{ width: `${CLASS_METRICS[0].pct}%` }} />
            </div>
          </BentoCard>

          {/* Class metric B */}
          <BentoCard eyebrow={CLASS_METRICS[1].label} icon={<Users size={16} className="text-[#64748B]" />}>
            <div className="flex items-end justify-between gap-2">
              <span className="font-display text-3xl font-semibold tracking-tight">{CLASS_METRICS[1].value}</span>
              <span className="text-[10px] font-mono text-[#64748B]">avg</span>
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">{CLASS_METRICS[1].sub}</p>
            <div className="mt-3 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--color-t4c-green)]" style={{ width: `${CLASS_METRICS[1].pct}%` }} />
            </div>
          </BentoCard>

          {/* Analytics tile */}
          <BentoCard
            accent="dark"
            eyebrow="Analytics"
            icon={<LayoutDashboard size={16} className="text-white/60" />}
          >
            <div className="flex items-end gap-1 h-10 mt-1">
              {[38, 52, 44, 68, 82].map((h, i) => (
                <span key={i} className="flex-1 rounded-sm bg-[#E9C444]/80" style={{ height: `${h}%` }} />
              ))}
            </div>
            <button
              onClick={() => onNavigate('lectures')}
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#E9C444] hover:underline"
            >
              Open suite <ArrowUpRight size={12} />
            </button>
          </BentoCard>

          {/* Urgent action queue */}
          <BentoCard
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
            eyebrow="Urgent action queue"
            icon={<ClipboardList size={16} className="text-[#64748B]" />}
            action={
              <button
                onClick={() => onNavigate('assignments')}
                className="text-[11px] font-medium text-[var(--color-t4c-green)] hover:underline inline-flex items-center gap-0.5"
              >
                All work <ArrowUpRight size={11} />
              </button>
            }
          >
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-[14px] border border-[#E2E8F0] flex items-start gap-3 hover:bg-[#F8FAFC] transition-colors"
                >
                  <span className="mt-0.5 shrink-0">
                    {task.type === 'grade' && <BentoPill tone="danger">Grade</BentoPill>}
                    {task.type === 'review' && <BentoPill tone="yellow">Review</BentoPill>}
                    {task.type === 'respond' && <BentoPill tone="neutral">Inbox</BentoPill>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight">
                      {task.title}
                      {task.count ? <span className="ml-1 font-normal text-[#64748B]">({task.count})</span> : null}
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{task.context}</p>
                  </div>
                  <button
                    onClick={() => onNavigate(taskTarget(task.type))}
                    className="shrink-0 text-[10px] font-mono uppercase tracking-widest border border-[#E2E8F0] px-2.5 py-1.5 rounded-full hover:bg-white transition-colors inline-flex items-center gap-1"
                  >
                    Execute <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Risk signals */}
          <BentoCard
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
            eyebrow="Risk intervention signals"
            icon={<AlertTriangle size={16} className="text-[#B91C1C]" />}
            action={
              <button
                onClick={() => onNavigate('teach/attendance')}
                className="text-[11px] font-medium text-[var(--color-t4c-green)] hover:underline inline-flex items-center gap-0.5"
              >
                Attendance <ArrowUpRight size={11} />
              </button>
            }
          >
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-[14px] border border-[#E2E8F0] flex items-start gap-3">
                  <AlertTriangle
                    className={`h-4 w-4 mt-0.5 shrink-0 ${alert.severity === 'high' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">
                      {alert.name} <span className="font-normal text-[#64748B]">· {alert.metric}</span>
                    </p>
                    <p className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">{alert.reason}</p>
                    <div className="mt-1.5">
                      <BentoPill tone={alert.severity === 'high' ? 'danger' : 'yellow'}>
                        {alert.severity === 'high' ? 'High risk' : 'Medium risk'}
                      </BentoPill>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {upNext.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
                <CalendarDays size={12} /> Office hours follow the broadcast
              </div>
            )}
          </BentoCard>

          {/* Message inbox shortcut */}
          <BentoCard eyebrow="Parent desk" icon={<MessageSquare size={16} className="text-[#64748B]" />}>
            <p className="text-sm font-medium leading-snug">4 unread parent inquiries</p>
            <p className="mt-1 text-[11px] text-[#64748B]">Portal messages, awaiting dispatch</p>
            <button
              onClick={() => onNavigate('notices')}
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--color-t4c-green)] hover:underline"
            >
              Open inbox <ArrowUpRight size={12} />
            </button>
          </BentoCard>

          {/* Curriculum shortcut */}
          <BentoCard className="sm:col-span-2" eyebrow="Curriculum" icon={<BookOpen size={16} className="text-[#64748B]" />}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-[#475569] leading-relaxed max-w-[52ch]">
                Grade 10 and 11 plans are live for the term. Authoring and grading rubrics sit one click from here.
              </p>
              <button
                onClick={() => onNavigate('curriculum')}
                className="shrink-0 inline-flex items-center gap-2 bg-[var(--color-t4c-black)] text-white px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest hover:opacity-90"
              >
                Open curriculum <ArrowUpRight size={12} />
              </button>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </div>
  );
};
