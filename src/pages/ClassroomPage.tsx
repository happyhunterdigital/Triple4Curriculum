import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Video, Camera, Mic, Wifi, ShieldCheck, Clock, ExternalLink, ArrowRight,
  CheckCircle2, Users, GraduationCap, CalendarDays,
} from 'lucide-react';
import { PageShell, SectionEyebrow, SectionHeading, Body, RevealStagger } from '../components/site/Section';
import { useAuth } from '../lib/authContext';
import { api } from '../lib/api';
import { getLiveLink } from '../lib/liveClass';
import type { TimetableSlot } from '../types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CHECKLIST = [
  { icon: Camera, title: 'Camera on', text: 'Show your face and stay visible unless a teacher agrees otherwise.' },
  { icon: Mic, title: 'Mic muted', text: 'Join muted, then unmute when your teacher invites you to speak.' },
  { icon: Wifi, title: 'Stable connection', text: 'Wired or strong Wi-Fi. Headphones help you hear every word.' },
  { icon: ShieldCheck, title: 'Private space', text: 'A quiet, shared room — not a bedroom. Dress for school.' },
];

const STEPS = [
  { n: '1', title: 'Join five minutes early', text: 'Open your timetable, press Join and wait in the Meet lobby.' },
  { n: '2', title: 'Your teacher admits you', text: 'Attendance is recorded the moment you join from the class link.' },
  { n: '3', title: 'Learn live, replay later', text: 'Every lesson is teacher-led and recorded for catch-up.' },
];

const FAQS = [
  {
    q: 'Do I need a Google account to join?',
    a: 'Yes — sign in with the account you registered with. Only that learner is admitted; please do not share the link with siblings or friends.',
  },
  {
    q: 'Why does Meet open in a separate window?',
    a: 'Google blocks Meet from being embedded inside other websites for security, so it opens in a dedicated classroom window. The T4C tab stays open behind it, and your attendance is recorded when you join from the platform.',
  },
  {
    q: 'What if the Meet link does not work?',
    a: 'Refresh your timetable. If the class link is still missing, contact your teacher or support@triple4c.com. A temporary Jitsi classroom is provided as a fallback.',
  },
  {
    q: 'Are lessons recorded?',
    a: 'Yes. Lessons may be recorded for quality and for learners who missed a session. Recordings are shared privately through the school and handled under our Privacy Statement.',
  },
  {
    q: 'What equipment do I need?',
    a: 'A laptop or tablet, a stable connection, and a browser such as Chrome, Edge or Safari. Headphones are recommended.',
  },
];

export function ClassroomPage() {
  useEffect(() => {
    document.title = 'T4C Classroom: Live Lessons on Google Meet';
  }, []);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getTimetable()
      .then((data) => {
        if (!cancelled) setSlots(data);
      })
      .catch(() => {
        // Guests / rules may block the read; the page still renders.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const today = DAY_NAMES[new Date().getDay()];
  const todaySlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.dayOfWeek === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots, today],
  );

  const joinClass = (slot: TimetableSlot) => {
    const live = getLiveLink(slot);
    const isInApp = live.canEmbed || live.provider === 'google-meet';
    if (isInApp) {
      const query = new URLSearchParams({
        room: live.url,
        courseId: slot.courseId,
        title: slot.courseTitle,
        code: slot.courseCode,
      });
      navigate(`/live?${query.toString()}`);
    } else {
      window.open(live.url, '_blank', 'noopener');
    }
  };

  return (
    <div className="w-full bg-[var(--color-canvas-soft)]">
      {/* Hero */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8 lg:p-10">
          <SectionEyebrow>T4C Classroom</SectionEyebrow>
          <h1 className="mt-2 font-display text-[30px] sm:text-[42px] font-semibold tracking-tight leading-[0.95]">
            Every lesson, live on T4C Classroom.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 max-w-[62ch]">
            Sixteen learners, one certified teacher, four focused lessons a day. Join from your timetable,
            learn face to face, and catch up with the recording if you miss a class.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://meet.google.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--color-t4c-green)] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-t4c-black)] transition-colors"
            >
              <Video size={14} /> Open Google Meet <ExternalLink size={12} />
            </a>
            <Link
              to={currentUser ? '/timetable' : '/onboarding'}
              className="inline-flex items-center gap-2 bg-[var(--color-t4c-black)] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-t4c-green)] transition-colors"
            >
              {currentUser ? 'View full timetable' : 'Sign in / Apply'} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <PageShell>
        {/* Today's classes */}
        <RevealStagger>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionHeading>Today&apos;s classes</SectionHeading>
              <Body className="mt-2">
                {today} · live lessons open in Google Meet. Attendance is saved when you join.
              </Body>
            </div>
            {currentUser && (
              <Link to="/timetable" className="text-xs font-bold uppercase tracking-widest text-[var(--color-t4c-green)] underline underline-offset-4">
                Full week
              </Link>
            )}
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="h-28 rounded-[16px] border border-black/10 bg-white animate-pulse" />
            ) : !currentUser ? (
              <div className="rounded-[16px] border border-black/10 bg-white p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-t4c-green)]/10 text-[var(--color-t4c-green)] flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Sign in to see your class links</p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Class links are private to each enrolled learner. Sign in with your school account to join.
                  </p>
                </div>
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-2 bg-[var(--color-t4c-black)] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                >
                  Sign in <ArrowRight size={14} />
                </Link>
              </div>
            ) : todaySlots.length === 0 ? (
              <div className="rounded-[16px] border border-black/10 bg-white p-6">
                <p className="text-sm font-semibold">No live classes scheduled today</p>
                <p className="text-xs text-neutral-600 mt-1">Fridays are for apprenticeships and targeted homework. See your timetable for the rest of the week.</p>
                <Link to="/timetable" className="inline-flex items-center gap-2 mt-3 text-xs font-bold uppercase tracking-widest text-[var(--color-t4c-green)] underline underline-offset-4">
                  Open timetable <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {todaySlots.map((slot) => {
                  const live = getLiveLink(slot);
                  return (
                    <div key={slot.id} className="rounded-[16px] border border-black/10 bg-white p-5 flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-[var(--color-t4c-black)] text-white px-2 py-1 rounded">
                          {slot.courseCode}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-500">
                          {slot.startTime}–{slot.endTime}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold leading-snug">{slot.courseTitle}</h3>
                      <p className="mt-1 text-xs text-neutral-600 flex items-center gap-1.5">
                        <Clock size={12} /> {slot.type || 'Lecture'} · {slot.lecturerName}
                      </p>
                      <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
                        {live.provider === 'google-meet'
                          ? 'Google Meet · attendance recorded on join'
                          : live.isFallback
                            ? 'Temporary classroom (no Meet link set yet)'
                            : 'Live classroom'}
                      </p>
                      <button
                        onClick={() => joinClass(slot)}
                        className="mt-4 inline-flex items-center justify-center gap-2 bg-[var(--color-t4c-green)] text-white px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-t4c-black)] transition-colors"
                      >
                        <Video size={14} /> Join live
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </RevealStagger>

        {/* Before you join */}
        <RevealStagger>
          <SectionHeading className="text-[22px] sm:text-[28px]">Before you join</SectionHeading>
          <Body className="mt-2">A calm setup makes a better lesson. Four quick checks.</Body>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHECKLIST.map((item) => (
              <div key={item.title} className="rounded-[16px] border border-black/10 bg-white p-5">
                <div className="w-8 h-8 rounded-full bg-[var(--color-t4c-green)] text-white flex items-center justify-center">
                  <item.icon size={14} />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">{item.text}</p>
              </div>
            ))}
          </div>
        </RevealStagger>

        {/* How it works */}
        <RevealStagger>
          <div className="rounded-[16px] bg-[var(--color-t4c-green)] text-white p-6 sm:p-8">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-t4c-yellow)] font-semibold">How a Meet lesson runs</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.n} className="rounded-[14px] bg-white/10 p-5">
                  <span className="text-[11px] font-mono font-bold text-[var(--color-t4c-yellow)]">STEP {step.n}</span>
                  <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/80">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealStagger>

        {/* Parents + safety */}
        <RevealStagger>
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-[16px] border border-black/10 bg-white p-6 sm:p-7">
              <div className="w-9 h-9 rounded-full bg-[var(--color-t4c-green)] text-white flex items-center justify-center">
                <Users size={16} />
              </div>
              <h3 className="mt-3 text-lg font-semibold">For parents &amp; guardians</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
                {[
                  'Teachers lead every class — parents help Foundation learners log in, then step back.',
                  'Class links are for enrolled learners only. Please keep them private.',
                  'Learners keep cameras on, microphones muted, and use the Raise Hand button to speak.',
                  'Lessons may be recorded for quality and catch-up; recordings stay within the school.',
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-t4c-green)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[16px] border border-black/10 bg-white p-6 sm:p-7">
              <div className="w-9 h-9 rounded-full bg-[var(--color-t4c-green)] text-white flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <h3 className="mt-3 text-lg font-semibold">Safeguarding in every session</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                One-to-one sessions are pre-scheduled, recorded and open to leadership review. Staff never contact
                learners outside school accounts or personal messaging apps.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-neutral-600">
                If something in a class feels wrong, tell a teacher immediately or email our Designated Safeguarding
                Lead. Reports are acknowledged within 24 hours.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/child-protection" className="text-xs font-bold uppercase tracking-widest text-[var(--color-t4c-green)] underline underline-offset-4">
                  Child Protection Policy
                </Link>
                <a href="mailto:support@triple4c.com" className="text-xs font-bold uppercase tracking-widest text-[var(--color-t4c-green)] underline underline-offset-4">
                  support@triple4c.com
                </a>
              </div>
            </div>
          </div>
        </RevealStagger>

        {/* FAQ */}
        <RevealStagger>
          <SectionHeading className="text-[22px] sm:text-[28px]">Classroom questions</SectionHeading>
          <div className="mt-4 divide-y divide-black/10 rounded-[16px] border border-black/10 bg-white overflow-hidden">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  {faq.q}
                  <span className="text-[var(--color-t4c-green)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </RevealStagger>

        {/* CTA */}
        <RevealStagger>
          <div className="rounded-[16px] bg-[var(--color-t4c-black)] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">Not enrolled yet?</h3>
              <p className="mt-1 text-sm text-white/70">
                See how a 16-learner class works, or book a discovery call with a real teacher.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/admissions" className="inline-flex items-center gap-2 bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">
                Admissions &amp; fees <ArrowRight size={14} />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 border border-white/30 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10">
                Book a call
              </Link>
            </div>
          </div>
        </RevealStagger>

        {/* Helpful link strip */}
        <RevealStagger>
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> Timetable lives in your dashboard</span>
            <Link to="/how-it-works" className="underline underline-offset-4 hover:text-[var(--color-t4c-green)]">How the 4-4-4 day works</Link>
            <Link to="/terms" className="underline underline-offset-4 hover:text-[var(--color-t4c-green)]">Classroom code of conduct</Link>
          </div>
        </RevealStagger>
      </PageShell>
    </div>
  );
}
