import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  MessageSquare,
  PlayCircle,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { BentoCard, BentoGrid, BentoPill } from '../ui/Bento';

interface Course {
  id: string;
  name: string;
  code: string;
  time: string;
  status: 'live' | 'upcoming' | 'completed';
}
interface Deadline {
  id: string;
  task: string;
  subject: string;
  dueDate: string;
  urgency: 'high' | 'medium' | 'low';
}

const ELECTIVES = ['Mathematics', 'History', 'Physics', 'Coding', 'Music', 'Debate'];

export const StudentHomeDashboard: React.FC<{ onNavigate: (r: string) => void }> = ({ onNavigate }) => {
  const [courses] = useState<Course[]>([
    { id: '1', name: 'Advanced Mathematics', code: 'MAT401', time: '09:00 - 10:15', status: 'live' },
    { id: '2', name: 'Modern World History', code: 'HIS202', time: '11:00 - 12:15', status: 'upcoming' },
    { id: '3', name: 'Quantum Physics Lab', code: 'PHY305', time: '14:00 - 15:30', status: 'upcoming' },
  ]);
  const [deadlines] = useState<Deadline[]>([
    { id: '1', task: 'History Essay: The Industrial Pivot', subject: 'History', dueDate: 'Tonight, 23:59', urgency: 'high' },
    { id: '2', task: 'Trigonometry Problem Set 4', subject: 'Mathematics', dueDate: 'Thursday, Oct 15', urgency: 'medium' },
    { id: '3', task: 'Lab Report Drafting', subject: 'Physics', dueDate: 'Next Monday', urgency: 'low' },
  ]);

  const live = courses.find((c) => c.status === 'live');
  const upNext = courses.filter((c) => c.status === 'upcoming');

  return (
    <div className="w-full bg-[var(--color-canvas-soft)] text-[#0F172A] font-sans antialiased -m-3 xs:-m-4 sm:-m-5 md:-m-6 lg:-m-6 xl:-m-8">
      {/* Greeting header */}
      <header className="px-5 xs:px-7 sm:px-9 lg:px-10 pt-6 sm:pt-8 pb-2 sm:pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <p className="text-[10px] font-mono text-[#64748B] uppercase tracking-[0.18em]">Workspace overview</p>
          <h1 className="mt-1 font-display text-xl sm:text-2xl font-semibold tracking-tight">Welcome back, Sarah.</h1>
        </div>
        <div className="flex items-center gap-2">
          <BentoPill tone="green">Term 3</BentoPill>
          <BentoPill tone="neutral">Week 6</BentoPill>
        </div>
      </header>

      <div className="px-5 xs:px-7 sm:px-9 lg:px-10 py-4 sm:py-6">
        <BentoGrid>
          {/* Hero: live class, the focal block */}
          <BentoCard
            accent="green"
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
            eyebrow="Live now"
            padded
            icon={
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9C444] opacity-70" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E9C444]" />
              </span>
            }
          >
            {live ? (
              <div className="h-full flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
                      {live.code}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-white/60 flex items-center gap-1">
                      <Clock size={11} /> {live.time}
                    </span>
                  </div>
                  <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-[1.05]">
                    {live.name}
                  </h2>
                  <p className="mt-2 text-xs text-white/70 max-w-[42ch]">
                    Session is active. Join the room and pick up from the board where the class left off.
                  </p>
                  <button
                    onClick={() => onNavigate('classroom')}
                    className="mt-5 inline-flex items-center gap-2 bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                  >
                    Join portal <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/50">Up next</p>
                  <ul className="mt-2 space-y-2">
                    {upNext.map((course) => (
                      <li key={course.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{course.name}</p>
                          <p className="text-[10px] font-mono text-white/50">{course.code}</p>
                        </div>
                        <span className="text-[10px] font-mono text-white/70 shrink-0">{course.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/70">No live session right now.</p>
            )}
          </BentoCard>

          {/* Term average */}
          <BentoCard eyebrow="Term 3 average" icon={<GraduationCap size={16} className="text-[#64748B]" />}>
            <div className="flex items-end justify-between gap-3">
              <span className="font-display text-4xl font-semibold tracking-tight">78%</span>
              <Sparkles size={16} className="text-[#B99A28]" />
            </div>
            <p className="mt-1 text-[11px] text-[#64748B]">Across 6 modules</p>
            <div className="mt-3 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--color-t4c-green)]" style={{ width: '78%' }} />
            </div>
          </BentoCard>

          {/* Attendance ring */}
          <BentoCard eyebrow="Attendance" icon={<CalendarDays size={16} className="text-[#64748B]" />}>
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 36 36" className="w-14 h-14 shrink-0 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#084228"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${96 * 0.9738} ${100 * 0.9738}`}
                />
              </svg>
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight">96%</p>
                <p className="text-[11px] text-[#64748B]">Present this term</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-t4c-green)] hover:underline"
            >
              Full transcript <ArrowUpRight size={11} />
            </button>
          </BentoCard>

          {/* Today's itinerary */}
          <BentoCard
            className="sm:col-span-2"
            eyebrow="Today's academic itinerary"
            icon={<Clock size={16} className="text-[#64748B]" />}
          >
            <ol className="divide-y divide-[#F1F5F9]">
              {courses.map((course) => (
                <li key={course.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-[#64748B] shrink-0 w-[104px]">{course.time}</span>
                    <p className="text-sm font-medium truncate">{course.name}</p>
                  </div>
                  {course.status === 'live' ? (
                    <BentoPill tone="green">Active</BentoPill>
                  ) : (
                    <BentoPill tone="neutral">Scheduled</BentoPill>
                  )}
                </li>
              ))}
            </ol>
          </BentoCard>

          {/* Deadlines */}
          <BentoCard
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
            eyebrow="Action required"
            icon={<AlertCircle size={16} className="text-[#B91C1C]" />}
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
              {deadlines.map((deadline) => (
                <button
                  key={deadline.id}
                  onClick={() => onNavigate('assignments')}
                  className="w-full text-left p-3 rounded-[14px] border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors flex items-start gap-3 group"
                >
                  <span className="mt-0.5 shrink-0">
                    {deadline.urgency === 'high' ? (
                      <AlertCircle size={15} className="text-[#DC2626]" />
                    ) : deadline.urgency === 'medium' ? (
                      <Clock size={15} className="text-amber-500" />
                    ) : (
                      <CheckCircle2 size={15} className="text-emerald-500" />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-medium leading-tight group-hover:text-[var(--color-t4c-green)]">
                      {deadline.task}
                    </span>
                    <span className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">{deadline.subject}</span>
                      <span
                        className={`text-[10px] font-mono ${
                          deadline.urgency === 'high'
                            ? 'text-[#B91C1C] font-semibold'
                            : deadline.urgency === 'medium'
                              ? 'text-amber-600'
                              : 'text-[#64748B]'
                        }`}
                      >
                        {deadline.dueDate}
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
              <BookOpen size={12} /> Submit early, keep the evening
            </div>
          </BentoCard>

          {/* Recorded lesson tile */}
          <BentoCard accent="dark" eyebrow="Catch up" icon={<PlayCircle size={16} className="text-white/60" />}>
            <p className="text-sm font-medium leading-snug">History essay workshop, recorded</p>
            <p className="mt-1 text-[11px] text-white/50">42 min, with timestamps in the notes</p>
            <button
              onClick={() => onNavigate('lectures')}
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#E9C444] hover:underline"
            >
              Watch <ArrowUpRight size={12} />
            </button>
          </BentoCard>

          {/* Milestone */}
          <BentoCard accent="yellow" eyebrow="This term" icon={<Trophy size={16} className="text-[#B99A28]" />}>
            <p className="font-display text-3xl font-semibold tracking-tight">Week 6</p>
            <p className="text-[11px] text-[#7A5A00]">of 12, term 3</p>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i < 6 ? 'bg-[#B99A28]' : 'bg-[#B99A28]/20'}`}
                />
              ))}
            </div>
          </BentoCard>

          {/* Media tile */}
          <button
            onClick={() => onNavigate('learners')}
            className="group relative text-left rounded-[20px] overflow-hidden border border-[#E2E8F0] min-h-[190px]"
          >
            <img
              src="/images/learners/triple-4-curriculum-learners-reading-together.jpg"
              alt="Two learners reading side by side in front of library shelves."
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-[#111214]/90 via-[#111214]/30 to-transparent" />
            <span className="absolute bottom-0 left-0 right-0 p-4">
              <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-white/60">Life at T4C</span>
              <span className="mt-1 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-white">Learner gallery</span>
                <ArrowUpRight size={14} className="text-white/70" />
              </span>
            </span>
          </button>

          {/* Electives / quick links */}
          <BentoCard eyebrow="Subjects and electives" icon={<BookOpen size={16} className="text-[#64748B]" />}>
            <div className="flex flex-wrap gap-1.5">
              {ELECTIVES.map((subject) => (
                <button
                  key={subject}
                  onClick={() => onNavigate('curriculum')}
                  className="rounded-full border border-[#E2E8F0] px-2.5 py-1 text-[11px] text-[#334155] hover:border-[var(--color-t4c-green)] hover:text-[var(--color-t4c-green)] transition-colors"
                >
                  {subject}
                </button>
              ))}
            </div>
          </BentoCard>

          {/* Instructor observation */}
          <BentoCard
            className="sm:col-span-2"
            eyebrow="Instructor observations"
            icon={<MessageSquare size={16} className="text-[#64748B]" />}
            action={
              <button
                onClick={() => onNavigate('lectures')}
                className="text-[11px] font-medium text-[var(--color-t4c-green)] hover:underline inline-flex items-center gap-0.5"
              >
                Archive <ArrowUpRight size={11} />
              </button>
            }
          >
            <p className="text-xs leading-relaxed text-[#475569] italic">
              "Sarah exhibited profound depth in her latest Trigonometry evaluation. Her approach to solving complex
              identity verifications is elegant. Keep refining the processing pacing."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--color-t4c-green)] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                MD
              </span>
              <div>
                <p className="text-[11px] font-semibold">Mr. Marcus Davis</p>
                <p className="text-[10px] font-mono text-[#94A3B8]">Mathematics</p>
              </div>
            </div>
          </BentoCard>

          {/* Term report CTA */}
          <BentoCard accent="green" className="sm:col-span-2 flex justify-center" eyebrow="Next step">
            <div className="h-full flex flex-col justify-between gap-4">
              <p className="font-display text-lg font-semibold tracking-tight leading-snug">
                Term 3 report builds itself from live marks.
              </p>
              <button
                onClick={() => onNavigate('attendance')}
                className="inline-flex items-center gap-2 self-start bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-colors"
              >
                Open progress <ArrowUpRight size={12} />
              </button>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </div>
  );
};
