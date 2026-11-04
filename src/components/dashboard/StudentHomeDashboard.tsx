import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowRight, Award, BookOpen, CalendarDays, CheckCircle2,
  Clock, FileText, Flame, GraduationCap, MapPin, TrendingUp, Video,
} from 'lucide-react';
import { BentoCard, BentoGrid, BentoPill } from '../ui/Bento';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import type {
  Assignment, AssignmentSubmission, AttendanceRecord, Course, Enrollment,
  LearnerCourseProgress, TimetableSlot,
} from '../../types';
import { AccountSettingsModal } from '../modals/AccountSettingsModal';

interface DashboardData {
  enrollments: Enrollment[];
  courses: Course[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  attendance: AttendanceRecord[];
  timetable: TimetableSlot[];
  progress: LearnerCourseProgress[];
}

const EMPTY: DashboardData = {
  enrollments: [], courses: [], assignments: [], submissions: [],
  attendance: [], timetable: [], progress: [],
};

const TZ = 'Africa/Johannesburg';

function nowParts() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const weekday = get('weekday');
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
  return { weekday, minutes, iso };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = (hhmm || '0:0').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const fmtTime = (hhmm: string) => (hhmm || '').slice(0, 5);

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const due = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(due)) return null;
  const today = Date.parse(`${nowParts().iso}T00:00:00Z`);
  return Math.round((due - today) / 86_400_000);
}

function dueLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d === null) return 'No due date';
  if (d < 0) return `${Math.abs(d)} day${Math.abs(d) === 1 ? '' : 's'} overdue`;
  if (d === 0) return 'Due today';
  if (d === 1) return 'Due tomorrow';
  return `Due in ${d} days`;
}

const pct = (n: number) => `${Math.round(n)}%`;

export const StudentHomeDashboard: React.FC<{ onNavigate: (r: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const firstName = (currentUser?.name || '').trim().split(/\s+/)[0];

  const load = React.useCallback(async () => {
    setLoading(true);
    setFailed(false);
    const safe = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);
    try {
      const [enrollments, courses, assignments, submissions, attendance, timetable, progress] =
        await Promise.all([
          safe(api.getMyEnrollments(), [] as Enrollment[]),
          safe(api.getMyCourses(), [] as Course[]),
          safe(api.getMyAssignments(), [] as Assignment[]),
          safe(api.getSubmissions(), [] as AssignmentSubmission[]),
          safe(api.getAttendance(), [] as AttendanceRecord[]),
          safe(api.getTimetable(), [] as TimetableSlot[]),
          safe(api.getMyProgress(), [] as LearnerCourseProgress[]),
        ]);
      setData({ enrollments, courses, assignments, submissions, attendance, timetable, progress });
      setFailed(enrollments.length === 0 && courses.length === 0 && timetable.length === 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const view = useMemo(() => {
    const { weekday, minutes, iso } = nowParts();

    const todaySlots = data.timetable
      .filter((s) => s.dayOfWeek === weekday)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    const nextSlot = todaySlots.find((s) => toMinutes(s.endTime) > minutes) || todaySlots[0] || null;

    const submittedIds = new Set(data.submissions.map((s) => s.assignmentId));
    const pending = data.assignments.filter((a) => !submittedIds.has(a.id));
    const deadlines = [...pending].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')).slice(0, 3);
    const overdue = pending.filter((a) => (daysUntil(a.dueDate) ?? 0) < 0);

    const present = data.attendance.filter((a) => a.status !== 'Absent').length;
    const attendanceRate = data.attendance.length ? (present / data.attendance.length) * 100 : null;

    const graded = data.submissions.filter((s) => typeof s.grade === 'number' && s.maxGrade > 0);
    const averageGrade = graded.length
      ? (graded.reduce((sum, s) => sum + (Number(s.grade) / s.maxGrade) * 100, 0) / graded.length)
      : null;

    const progressByCourse = new Map(data.progress.map((p) => [p.courseId, p]));

    const warnings: Array<{ tone: 'danger' | 'warning' | 'info'; title: string; detail: string; go?: string }> = [];
    if (data.enrollments.length === 0) {
      warnings.push({
        tone: 'warning',
        title: 'No courses assigned yet',
        detail: 'Your enrolment is being processed. Admissions can confirm your course list on admissions@t4c.com.',
      });
    }
    if (overdue.length) {
      warnings.push({
        tone: 'danger',
        title: `${overdue.length} overdue assignment${overdue.length === 1 ? '' : 's'}`,
        detail: `${overdue[0].title} (${overdue[0].courseCode}) — ${dueLabel(overdue[0].dueDate)}.`,
        go: 'assignments',
      });
    }
    if (attendanceRate !== null && attendanceRate < 80) {
      warnings.push({
        tone: 'warning',
        title: 'Attendance below 80%',
        detail: `${pct(attendanceRate)} across ${data.attendance.length} recorded session${data.attendance.length === 1 ? '' : 's'}.`,
        go: 'attendance',
      });
    }
    if (!currentUser?.studentId) {
      warnings.push({
        tone: 'info',
        title: 'Finish your profile',
        detail: 'Add your student number so certificates and records carry the right identifier.',
      });
    }

    return {
      weekday, iso, minutes, todaySlots, nextSlot, deadlines, overdue, pending,
      attendanceRate, present, absent: data.attendance.length - present,
      averageGrade, gradedCount: graded.length, progressByCourse, warnings,
    };
  }, [data, currentUser?.studentId]);

  const initials = (currentUser?.name || 'T4')
    .trim().split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const xp = currentUser?.xp ?? 0;
  const level = currentUser?.level ?? 1;
  const streak = currentUser?.streakDays ?? 0;

  /**
   * Panels paint immediately and fill in as their queries resolve — the page
   * structure never disappears behind a full-screen loader.
   */
  const PanelBody: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    loading ? (
      <div className="space-y-2 py-1" aria-hidden="true">
        <div className="h-3 w-2/3 rounded bg-[#E2E8F0] animate-pulse" />
        <div className="h-3 w-full rounded bg-[#F1F5F9] animate-pulse" />
        <div className="h-3 w-4/5 rounded bg-[#F1F5F9] animate-pulse" />
      </div>
    ) : (
      <>{children}</>
    );

  if (failed) {
    return (
      <div className="w-full bg-[var(--color-canvas-soft)] -m-3 xs:-m-4 sm:-m-5 md:-m-6 lg:-m-6 xl:-m-8 p-5 sm:p-7 lg:p-9">
        <div className="max-w-xl rounded-[20px] border border-[#FECACA] bg-[#FEF2F2] p-6">
          <p className="font-display text-lg font-semibold text-[#7F1D1D]">We could not load your workspace</p>
          <p className="mt-1 text-sm text-[#991B1B]">
            This is usually a connection problem. Your data is safe — try again.
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#7F1D1D] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#991B1B]"
          >
            Retry <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--color-canvas-soft)] text-[#0F172A] font-sans antialiased -m-3 xs:-m-4 sm:-m-5 md:-m-6 lg:-m-6 xl:-m-8">

      {/* ── Greeting ── */}
      <header className="px-5 xs:px-7 sm:px-9 lg:px-10 pt-6 sm:pt-8 pb-1 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <p className="text-[10px] font-mono text-[#64748B] uppercase tracking-[0.18em]">Workspace overview</p>
          <h1 className="mt-1 font-display text-xl sm:text-2xl font-semibold tracking-tight">
            Welcome back, {firstName || 'learner'}.
          </h1>
          <p className="mt-1 text-xs text-[#64748B]">
            {loading
              ? 'Loading your workspace…'
              : `${view.weekday} · ${data.courses.length} course${data.courses.length === 1 ? '' : 's'} · ${view.todaySlots.length} class${view.todaySlots.length === 1 ? '' : 'es'} today`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <BentoPill tone="green">Level {level}</BentoPill>
          <BentoPill tone="neutral">{view.pending.length} due</BentoPill>
          {streak > 0 && <BentoPill tone="yellow">{streak}-day streak</BentoPill>}
        </div>
      </header>

      <div className="px-5 xs:px-7 sm:px-9 lg:px-10 py-5 sm:py-6">
        <BentoGrid>

          {/* ── Profile ── */}
          <BentoCard accent="dark" eyebrow="Profile" title="Your record" className="lg:col-span-2 lg:row-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-mono text-lg font-bold text-[var(--color-t4c-yellow)] border border-white/15">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-semibold text-white">{currentUser?.name || 'Learner'}</p>
                <p className="truncate text-xs text-white/60">{currentUser?.email}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {currentUser?.studentId && <BentoPill tone="onDark">ID {currentUser.studentId}</BentoPill>}
                  {currentUser?.departmentName && <BentoPill tone="onDark">{currentUser.departmentName}</BentoPill>}
                  <BentoPill tone="onDark">Level {level}</BentoPill>
                </div>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: 'XP', value: xp.toLocaleString('en-ZA') },
                { label: 'Streak', value: `${streak}d` },
                { label: 'Courses', value: loading ? '�' : String(data.courses.length) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <dt className="text-[10px] font-mono uppercase tracking-wider text-white/50">{stat.label}</dt>
                  <dd className="mt-0.5 font-display text-base font-semibold text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-t4c-yellow)] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--color-t4c-black)] hover:bg-white transition-colors"
              >
                Manage account
              </button>
              <button
                type="button"
                onClick={() => onNavigate('certificates')}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:border-[var(--color-t4c-yellow)] hover:text-[var(--color-t4c-yellow)] transition-colors"
              >
                Certificates <ArrowRight size={13} />
              </button>
            </div>
          </BentoCard>

          {/* ── Courses ── */}
          <BentoCard
            eyebrow="Enrolled"
            title="Your courses"
            icon={<GraduationCap size={16} className="text-[#64748B]" />}
            action={<span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">{loading ? '·' : data.courses.length}</span>}
            className="lg:col-span-2 lg:row-span-2"
            onClick={() => onNavigate('lectures')}
            ariaLabel="Open your courses and lectures"
          >
            <PanelBody>{data.courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#CBD5E1] p-6 text-center">
                <GraduationCap size={22} className="mx-auto text-[#94A3B8]" />
                <p className="mt-2 text-sm font-semibold text-[#0F172A]">No courses assigned yet</p>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                  Once admissions enrols you, your courses, lectures and assignments appear here.
                </p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {data.courses.map((course) => {
                  const p = view.progressByCourse.get(course.id);
                  const progress = Math.max(0, Math.min(100, Math.round(p?.overallProgressPercent ?? course.progressPercent ?? 0)));
                  return (
                    <li key={course.id} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-[#0F172A]">{course.title}</p>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-[#64748B]">{course.code}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-[#64748B]">
                        {course.lecturerName || 'Lecturer to be assigned'} · {course.credits} credits
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div className="h-full rounded-full bg-[var(--color-t4c-green)]" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="w-9 shrink-0 text-right font-mono text-[10px] text-[#64748B]">{progress}%</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}</PanelBody>
          </BentoCard>

          {/* ── Today ── */}
          <BentoCard
            eyebrow="Timetable"
            title="Today"
            icon={<CalendarDays size={16} className="text-[#64748B]" />}
            onClick={() => onNavigate('timetable')}
            ariaLabel="Open class timetable"
          >
            <PanelBody>{view.todaySlots.length === 0 ? (
              <div className="flex h-full flex-col justify-center py-4 text-center">
                <CheckCircle2 size={20} className="mx-auto text-[#94A3B8]" />
                <p className="mt-2 text-xs font-semibold text-[#0F172A]">No live classes today</p>
                <p className="mt-0.5 text-[11px] text-[#64748B]">Use the day for revision or catch up on lectures.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {view.todaySlots.slice(0, 3).map((slot) => {
                  const isLive =
                    toMinutes(slot.startTime) <= view.minutes && view.minutes < toMinutes(slot.endTime);
                  return (
                    <li key={slot.id} className="flex items-start gap-2.5">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isLive ? 'bg-[#DC2626]' : 'bg-[var(--color-t4c-green)]'}`} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#0F172A]">{slot.courseTitle}</p>
                        <p className="text-[11px] text-[#64748B]">
                          {fmtTime(slot.startTime)}–{fmtTime(slot.endTime)} · {slot.room}
                        </p>
                      </div>
                    </li>
                  );
                })}
                {view.nextSlot && (
                  <li className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#E8F3EE] px-2.5 py-2 text-[11px] font-semibold text-[#065F46]">
                    <Video size={12} /> Next: {view.nextSlot.courseCode} at {fmtTime(view.nextSlot.startTime)}
                  </li>
                )}
              </ul>
            )}</PanelBody>
          </BentoCard>

          {/* ── Deadlines ── */}
          <BentoCard
            eyebrow="Deadlines"
            title="Assignments"
            icon={<FileText size={16} className="text-[#64748B]" />}
            onClick={() => onNavigate('assignments')}
            ariaLabel="Open assignments"
          >
            <PanelBody>{view.deadlines.length === 0 ? (
              <div className="flex h-full flex-col justify-center py-4 text-center">
                <CheckCircle2 size={20} className="mx-auto text-[#94A3B8]" />
                <p className="mt-2 text-xs font-semibold text-[#0F172A]">Nothing due</p>
                <p className="mt-0.5 text-[11px] text-[#64748B]">You are up to date on submissions.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {view.deadlines.map((a) => {
                  const late = (daysUntil(a.dueDate) ?? 0) < 0;
                  return (
                    <li key={a.id}>
                      <p className="truncate text-xs font-semibold text-[#0F172A]">{a.title}</p>
                      <p className={`text-[11px] ${late ? 'font-semibold text-[#B91C1C]' : 'text-[#64748B]'}`}>
                        {a.courseCode} · {dueLabel(a.dueDate)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}</PanelBody>
          </BentoCard>

          {/* ── Attendance record ── */}
          <BentoCard
            eyebrow="Record"
            title="Attendance"
            icon={<CheckCircle2 size={16} className="text-[#64748B]" />}
            onClick={() => onNavigate('attendance')}
            ariaLabel="Open attendance records"
          >
            <PanelBody>{view.attendanceRate === null ? (
              <div className="flex h-full flex-col justify-center py-4 text-center">
                <p className="text-xs font-semibold text-[#0F172A]">No sessions recorded</p>
                <p className="mt-0.5 text-[11px] text-[#64748B]">Check in to your first live class to start your record.</p>
              </div>
            ) : (
              <div>
                <p className="font-display text-2xl font-semibold text-[#0F172A]">{pct(view.attendanceRate)}</p>
                <p className="text-[11px] text-[#64748B]">{view.present} present · {view.absent} absent</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div className="h-full rounded-full bg-[var(--color-t4c-green)]" style={{ width: `${view.attendanceRate}%` }} />
                </div>
                <p className={`mt-2 text-[10px] font-mono uppercase tracking-wider ${view.attendanceRate < 80 ? 'text-[#B91C1C]' : 'text-[#64748B]'}`}>
                  {view.attendanceRate < 80 ? 'Below 80% requirement' : 'Meeting requirement'}
                </p>
              </div>
            )}</PanelBody>
          </BentoCard>

          {/* ── Performance ── */}
          <BentoCard
            eyebrow="Performance"
            title="Results & progress"
            icon={<TrendingUp size={16} className="text-[#64748B]" />}
            onClick={() => onNavigate('assignments')}
            ariaLabel="Open graded assignments"
          >
            <PanelBody><div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-display text-2xl font-semibold text-[#0F172A]">
                  {view.averageGrade === null ? '—' : pct(view.averageGrade)}
                </p>
                <p className="text-[11px] text-[#64748B]">Avg. grade</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-[#0F172A]">{view.gradedCount}</p>
                <p className="text-[11px] text-[#64748B]">Graded</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#F1F5F9] px-2.5 py-2 text-[11px] font-semibold text-[#475569]">
              <Flame size={12} className="text-[#B45309]" /> {xp.toLocaleString('en-ZA')} XP · Level {level}
            </div></PanelBody>
          </BentoCard>

          {/* ── Warnings ── */}
          <BentoCard
            eyebrow="Action needed"
            title={loading ? 'Checking…' : view.warnings.length ? `${view.warnings.length} item${view.warnings.length === 1 ? '' : 's'} to review` : 'All clear'}
            icon={<AlertTriangle size={16} className={view.warnings.length ? 'text-[#B45309]' : 'text-[#94A3B8]'} />}
            className="lg:col-span-4"
          >
            <PanelBody>{view.warnings.length === 0 ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-3">
                <CheckCircle2 size={16} className="shrink-0 text-[#15803D]" />
                <p className="text-xs text-[#166534]">Attendance, submissions and profile all look good. Nothing needs your attention.</p>
              </div>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {view.warnings.map((w) => {
                  const tones = {
                    danger: 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]',
                    warning: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]',
                    info: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155]',
                  }[w.tone];
                  const alert = {
                    danger: <AlertTriangle size={15} className="shrink-0" />,
                    warning: <AlertTriangle size={15} className="shrink-0" />,
                    info: <BookOpen size={15} className="shrink-0" />,
                  }[w.tone];
                  const body = (
                    <>
                      <span className="mt-0.5">{alert}</span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold">{w.title}</span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed opacity-80">{w.detail}</span>
                      </span>
                      {w.go && <ArrowRight size={14} className="ml-auto shrink-0 self-center opacity-60" />}
                    </>
                  );
                  return (
                    <li key={w.title}>
                      {w.go ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(w.go as string)}
                          className={`flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-colors hover:brightness-[0.98] ${tones}`}
                        >
                          {body}
                        </button>
                      ) : (
                        <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 ${tones}`}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}</PanelBody>
          </BentoCard>

          {/* ── Quick links ── */}
          <BentoCard eyebrow="Shortcuts" title="Jump to" className="lg:col-span-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'lectures', label: 'Lectures', icon: <BookOpen size={15} /> },
                { id: 'classroom', label: 'Classroom', icon: <Video size={15} /> },
                { id: 'certificates', label: 'Certificates', icon: <Award size={15} /> },
                { id: 'attendance', label: 'Attendance', icon: <Clock size={15} /> },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onNavigate(l.id)}
                  className="inline-flex min-h-11 items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] transition-colors hover:border-[var(--color-t4c-green)] hover:text-[var(--color-t4c-green)]"
                >
                  <span className="inline-flex items-center gap-2">{l.icon}{l.label}</span>
                  <ArrowRight size={13} />
                </button>
              ))}
            </div>
          </BentoCard>

        </BentoGrid>

        <p className="mt-4 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
          <MapPin size={11} /> Times shown in SAST · updated {new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <AccountSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
