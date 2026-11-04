import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, CalendarDays, Check, Clock, Copy, Link2, Plus, Video,
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { isMeetLink } from '../../lib/liveClass';
import { daysUntilTerm, hasTermStarted, TERM_LABEL, termStartLabel, termStartWeekday } from '../../lib/term';
import type { Course, TimetableSlot } from '../../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
type Day = (typeof DAYS)[number];
type SlotType = 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar';

const dayIndex = (d: string) => Math.max(0, DAYS.indexOf(d as Day));
const sortSlots = (rows: TimetableSlot[]) =>
  [...rows].sort((a, b) => dayIndex(a.dayOfWeek) - dayIndex(b.dayOfWeek) || a.startTime.localeCompare(b.startTime));

export const LecturerSchedule: React.FC = () => {
  const { currentUser } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLink, setEditLink] = useState('');

  // New class form
  const [courseId, setCourseId] = useState('');
  const [day, setDay] = useState<Day>('Monday');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [type, setType] = useState<SlotType>('Lecture');
  const [meet, setMeet] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [courseList, slotList] = await Promise.all([api.getCourses(), api.getTimetable()]);
      setCourses(courseList);
      setSlots(sortSlots(slotList));
      if (!courseId && courseList[0]) setCourseId(courseList[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the timetable.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { void load(); }, [load]);

  const mine = useMemo(
    () => slots.filter((s) => !currentUser?.id || !s.lecturerId || s.lecturerId === currentUser.id),
    [slots, currentUser?.id],
  );

  const upcoming = useMemo(() => !hasTermStarted(), []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!courseId) { setError('Choose a course first.'); return; }
    if (start >= end) { setError('The end time must be after the start time.'); return; }
    if (!meet.trim()) { setError('Paste the Google Meet link for this class.'); return; }
    if (!isMeetLink(meet.trim())) {
      setError('That is not a Google Meet link. It must look like https://meet.google.com/abc-defg-hij');
      return;
    }

    setSaving(true);
    try {
      const created = await api.createTimetableSlot({
        courseId,
        dayOfWeek: day,
        startTime: start,
        endTime: end,
        room: 'Google Meet',
        type,
        onlineLink: meet.trim(),
        lecturerId: currentUser?.id || '',
        lecturerName: currentUser?.name || '',
      });
      setSlots((prev) => sortSlots([...prev, created]));
      setMeet('');
      setNotice(`${created.courseCode} scheduled on ${created.dayOfWeek} at ${created.startTime}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not schedule that class.');
    } finally {
      setSaving(false);
    }
  };

  const copy = async (slot: TimetableSlot) => {
    const link = slot.onlineLink || '';
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(slot.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setError('Clipboard is blocked in this browser — open the link directly instead.');
    }
  };

  const saveLink = async (slot: TimetableSlot) => {
    setError(null);
    if (!isMeetLink(editLink.trim())) {
      setError('That is not a Google Meet link. It must look like https://meet.google.com/abc-defg-hij');
      return;
    }
    try {
      const updated = await api.updateTimetableSlot(slot.id, { onlineLink: editLink.trim(), room: 'Google Meet' });
      setSlots((prev) => sortSlots(prev.map((s) => (s.id === slot.id ? updated : s))));
      setEditingId(null);
      setEditLink('');
      setNotice(`Meet link updated for ${updated.courseCode} on ${updated.dayOfWeek}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update that link.');
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
          Scheduling &amp; Live Lessons
        </span>
        <h1 className="text-2xl font-black text-neutral-900 mt-2">Classes &amp; Google Meet</h1>
        <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
          Set up the classes you teach and attach a Google Meet room to each one. Learners see the
          class, the time and a Join button on their timetable from the first day of term.
        </p>
      </div>

      {upcoming && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <CalendarDays className="w-5 h-5 shrink-0 text-amber-700" />
          <div className="text-xs leading-relaxed text-amber-900">
            <p className="font-bold">
              No live classes yet — {TERM_LABEL} begins {termStartWeekday()} {termStartLabel()}.
            </p>
            <p className="mt-0.5 text-amber-800">
              Scheduling is open now ({daysUntilTerm()} days). Anything you add here appears on learner
              timetables, but joining is gated until term starts.
            </p>
          </div>
        </div>
      )}

      {(error || notice) && (
        <div
          role="alert"
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs ${
            error ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          {error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          <span>{error || notice}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6 items-start">

        {/* Create class */}
        <form onSubmit={handleCreate} className="lg:col-span-2 bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-neutral-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-700" /> Add a class
          </h2>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Course</span>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-[#fbfcf8] px-3 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-600"
            >
              {courses.length === 0 && <option value="">No courses available</option>}
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Day</span>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as Day)}
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-[#fbfcf8] px-3 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-600"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SlotType)}
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-[#fbfcf8] px-3 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-600"
              >
                {(['Lecture', 'Lab', 'Tutorial', 'Seminar'] as SlotType[]).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Starts</span>
              <input
                type="time" value={start} onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-[#fbfcf8] px-3 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-600"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Ends</span>
              <input
                type="time" value={end} onChange={(e) => setEnd(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 bg-[#fbfcf8] px-3 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-600"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Google Meet link</span>
            <input
              type="url"
              inputMode="url"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={meet}
              onChange={(e) => setMeet(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-[#fbfcf8] px-3 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-600"
            />
            <span className="mt-1 block text-[10px] text-neutral-500">
              In Google Meet choose “Create a meeting for later” and paste the link here.
            </span>
          </label>

          <button
            type="submit"
            disabled={saving || courses.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-black text-yellow-300 hover:bg-emerald-900 disabled:opacity-50 transition"
          >
            <Video className="w-4 h-4" />
            {saving ? 'Scheduling…' : 'Schedule class'}
          </button>
        </form>

        {/* Existing classes */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-emerald-950/10 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
            <h2 className="text-sm font-black text-neutral-900">Your scheduled classes</h2>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">{mine.length}</span>
          </div>

          {loading ? (
            <div className="space-y-2 p-5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-[#F1F5F9] animate-pulse" />
              ))}
            </div>
          ) : mine.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarDays className="mx-auto h-6 w-6 text-neutral-400" />
              <p className="mt-2 text-sm font-bold text-neutral-900">No classes scheduled yet</p>
              <p className="mt-1 text-xs text-neutral-500">Add your first class with a Google Meet link on the left.</p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {mine.map((slot) => {
                const hasMeet = isMeetLink(slot.onlineLink || '');
                return (
                  <li key={slot.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-neutral-900">
                          {slot.courseCode} · {slot.courseTitle}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                          <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" />{slot.dayOfWeek}</span>
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{slot.startTime}–{slot.endTime}</span>
                          <span className="inline-flex items-center gap-1"><Video className="w-3 h-3" />{slot.room}</span>
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-semibold uppercase tracking-wider">{slot.type}</span>
                        </p>
                        <p className="mt-1.5 truncate text-[11px]">
                          {hasMeet ? (
                            <a href={slot.onlineLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 underline underline-offset-2">
                              <Link2 className="w-3 h-3" />{slot.onlineLink}
                            </a>
                          ) : (
                            <span className="text-amber-700">No Meet link attached — learners fall back to an in-app room.</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copy(slot)}
                          disabled={!hasMeet}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-[11px] font-bold text-neutral-700 hover:border-emerald-500 disabled:opacity-40"
                        >
                          {copiedId === slot.id ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === slot.id ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingId(slot.id); setEditLink(slot.onlineLink || ''); }}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-[11px] font-bold text-neutral-700 hover:border-emerald-500"
                        >
                          <Link2 className="w-3.5 h-3.5" /> {hasMeet ? 'Replace link' : 'Add link'}
                        </button>
                      </div>
                    </div>

                    {editingId === slot.id && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          type="url"
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          placeholder="https://meet.google.com/abc-defg-hij"
                          className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-base sm:text-sm focus:outline-none focus:border-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={() => saveLink(slot)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-1.5 text-[11px] font-bold text-yellow-300 hover:bg-emerald-900"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingId(null); setEditLink(''); }}
                          className="inline-flex min-h-9 items-center rounded-lg border border-neutral-200 px-3 py-1.5 text-[11px] font-bold text-neutral-600"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
