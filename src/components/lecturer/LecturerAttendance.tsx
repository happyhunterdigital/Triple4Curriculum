import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, CalendarDays, CheckCircle2, Clock, Save, Users, XCircle,
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { hasTermStarted, TERM_LABEL, termStartLabel } from '../../lib/term';
import type { AttendanceRecord, Course, User } from '../../types';

type Status = 'Present' | 'Late' | 'Absent';

const TZ = 'Africa/Johannesburg';
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());

export const LecturerAttendance: React.FC = () => {
  const { triggerToast } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [roster, setRoster] = useState<User[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // courses
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.getCourses();
        if (cancelled) return;
        setCourses(list);
        if (list[0]) setCourseId(list[0].id);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load courses.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // roster + existing register for the selected course
  const loadCourse = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [students, history] = await Promise.all([
        api.getCourseRoster(id),
        api.getAttendanceForCourse(id),
      ]);
      setRoster(students);
      setRecords(history);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the register.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCourse(courseId); }, [courseId, loadCourse]);

  // prefill the selected date from what has already been recorded
  useEffect(() => {
    const forDate = records.filter((r) => r.date === date);
    const next: Record<string, Status> = {};
    roster.forEach((student) => {
      const prior = forDate.find((r) => r.studentId === student.id);
      next[student.id] = (prior?.status as Status) || 'Present';
    });
    setStatuses(next);
  }, [records, roster, date]);

  const history = useMemo(() => {
    const byDate = new Map<string, AttendanceRecord[]>();
    records.forEach((r) => {
      if (!byDate.has(r.date)) byDate.set(r.date, []);
      byDate.get(r.date)!.push(r);
    });
    return [...byDate.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([d, rows]) => ({
        date: d,
        present: rows.filter((r) => r.status === 'Present').length,
        late: rows.filter((r) => r.status === 'Late').length,
        absent: rows.filter((r) => r.status === 'Absent').length,
      }));
  }, [records]);

  const course = courses.find((c) => c.id === courseId);
  const alreadySaved = records.some((r) => r.date === date);

  const save = async () => {
    if (!courseId || roster.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await api.markAttendance(
        courseId,
        date,
        roster.map((student) => ({ student, status: statuses[student.id] || 'Present' })),
      );
      const refreshed = await api.getAttendanceForCourse(courseId);
      setRecords(refreshed);
      triggerToast({
        id: `toast_${Date.now()}`,
        title: 'Attendance saved',
        message: `${course?.code || 'Course'} register for ${date} saved.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'normal',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the register.');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = (studentId: string, status: Status) =>
    setStatuses((prev) => ({ ...prev, [studentId]: status }));

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
          Attendance Register
        </span>
        <h1 className="text-2xl font-black text-neutral-900 mt-2">Class attendance</h1>
        <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
          Mark the register for a class and date. Learners see the same records on their own
          attendance page, and re-saving a day corrects it rather than duplicating it.
        </p>
      </div>

      {!hasTermStarted() && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <CalendarDays className="w-5 h-5 shrink-0 text-amber-700" />
          <div className="text-xs leading-relaxed text-amber-900">
            <p className="font-bold">{TERM_LABEL} begins {termStartLabel()} — no live classes yet.</p>
            <p className="mt-0.5 text-amber-800">
              You can still record historical or ad-hoc sessions; the register unlocks fully when teaching starts.
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-950/10 shadow-xs flex flex-wrap items-end gap-3">
        <label className="block min-w-[220px] flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Course</span>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-300 bg-[#fbfcf8] px-3 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-600"
          >
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 rounded-xl border border-neutral-300 bg-[#fbfcf8] px-3 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-600"
          />
        </label>

        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || roster.length === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-black text-yellow-300 hover:bg-emerald-900 disabled:opacity-50 transition"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : alreadySaved ? 'Update register' : 'Save register'}
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* Roster */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-950/10 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-black text-neutral-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" /> Register · {date}
            </h2>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              {roster.length} enrolled
            </span>
          </div>

          {loading ? (
            <div className="space-y-2 p-5" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-[#F1F5F9] animate-pulse" />)}
            </div>
          ) : roster.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="mx-auto h-6 w-6 text-neutral-400" />
              <p className="mt-2 text-sm font-bold text-neutral-900">No learners enrolled in this course</p>
              <p className="mt-1 text-xs text-neutral-500">
                Enrolments are created by admissions; once a learner is enrolled they appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {roster.map((student) => {
                const status = statuses[student.id] || 'Present';
                return (
                  <li key={student.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-neutral-900">{student.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {student.studentId || 'No student number'}{student.departmentName ? ` · ${student.departmentName}` : ''}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-xl bg-stone-100 p-1">
                      {([
                        ['Present', <CheckCircle2 key="c" className="w-3 h-3" />, 'bg-emerald-700 text-white'],
                        ['Late', <Clock key="cl" className="w-3 h-3" />, 'bg-yellow-400 text-neutral-950'],
                        ['Absent', <XCircle key="x" className="w-3 h-3" />, 'bg-rose-700 text-white'],
                      ] as const).map(([value, icon, activeClass]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setStatus(student.id, value)}
                          aria-pressed={status === value}
                          className={`inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                            status === value ? activeClass : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {icon}{value}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent registers */}
        <div className="bg-white rounded-2xl border border-emerald-950/10 shadow-xs overflow-hidden">
          <div className="border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-black text-neutral-900">Recent registers</h2>
            <p className="mt-0.5 text-[11px] text-neutral-500">{course ? `${course.code} · ${course.title}` : 'Select a course'}</p>
          </div>
          {history.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              Nothing recorded yet for this course.
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {history.map((row) => (
                <li key={row.date} className="flex items-center justify-between gap-3 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setDate(row.date)}
                    className="text-left text-xs font-bold text-neutral-900 hover:text-emerald-700"
                  >
                    {row.date}
                  </button>
                  <span className="text-[11px] text-neutral-500">
                    {row.present} present · {row.late} late · {row.absent} absent
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
