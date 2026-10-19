import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Video, CheckCircle2, Loader2, ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { createLiveRoom, roomNameFromUrl } from '../../lib/jitsi';
import { providerForUrl } from '../../lib/liveClass';

/**
 * /live — branded live class entry point.
 *
 * Jitsi rooms are embedded so attendance can be recorded on join.
 * Google Meet cannot be framed by third-party sites, so Meet links open in a
 * new tab from here and attendance is recorded when the learner clicks Join.
 */
export const LiveClassroom: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const checkedInRef = useRef(false);

  const [status, setStatus] = useState<'connecting' | 'in-class' | 'external' | 'error'>('connecting');
  const [attendance, setAttendance] = useState<'pending' | 'recorded' | 'skipped' | 'failed'>('pending');
  const [error, setError] = useState('');

  const rawRoom = params.get('room') || '';
  const courseId = params.get('courseId') || '';
  const title = params.get('title') || 'Live Class';
  const code = params.get('code') || '';
  const roomName = rawRoom ? roomNameFromUrl(rawRoom) : '';
  const provider = rawRoom ? providerForUrl(rawRoom) : 'external';
  const isEmbedded = provider === 'jitsi';

  const recordAttendance = () => {
    if (checkedInRef.current || !currentUser || !courseId) {
      setAttendance(checkedInRef.current ? 'recorded' : 'skipped');
      return;
    }
    checkedInRef.current = true;
    api
      .checkInAttendance(currentUser.id, courseId, 'Self Check-in')
      .then(() => setAttendance('recorded'))
      .catch(() => setAttendance('failed'));
  };

  useEffect(() => {
    if (!roomName) {
      setStatus('error');
      setError('No room specified. Join a live session from your timetable.');
      return;
    }

    // External providers (Google Meet) open in their own tab, not an iframe.
    if (!isEmbedded) {
      setStatus('external');
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    let dispose: (() => void) | null = null;
    let cancelled = false;

    createLiveRoom({
      roomName,
      displayName: currentUser?.name || 'Learner',
      subject: code ? `${code} — ${title}` : title,
      container: el,
      callbacks: {
        onJoined: () => {
          if (cancelled) return;
          setStatus('in-class');
          recordAttendance();
        },
        onLeft: () => {
          if (!cancelled) setStatus('connecting');
        },
        onClosed: () => {
          if (cancelled) return;
          navigate('/timetable', { replace: true });
        },
      },
    })
      .then((d) => {
        if (cancelled) d();
        else dispose = d;
      })
      .catch((e) => {
        if (!cancelled) {
          setStatus('error');
          setError(e instanceof Error ? e.message : 'Could not connect to the live room.');
        }
      });

    return () => {
      cancelled = true;
      dispose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, isEmbedded]);

  const joinExternal = () => {
    recordAttendance();
    window.open(rawRoom, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Session header */}
      <div className="bg-white rounded-2xl border border-emerald-950/10 shadow-xs px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-emerald-800 text-yellow-300 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {code && (
                <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-yellow-400">
                  {code}
                </span>
              )}
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                status === 'in-class' ? 'text-emerald-700' : 'text-neutral-400'
              }`}>
                {status === 'in-class' ? '● LIVE' : status === 'connecting' ? 'Connecting…' : status === 'external' ? 'Ready to join' : 'Offline'}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-neutral-900 truncate">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Attendance status pill */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold border ${
            attendance === 'recorded'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : attendance === 'failed'
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-neutral-50 text-neutral-500 border-neutral-200'
          }`}>
            {attendance === 'recorded' ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Attendance recorded</>
            ) : attendance === 'failed' ? (
              'Attendance failed — contact lecturer'
            ) : status === 'in-class' ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Recording attendance…</>
            ) : (
              'Attendance on join'
            )}
          </span>
          <button
            onClick={() => navigate('/timetable')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-emerald-500 text-neutral-600 hover:text-emerald-900 font-bold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Leave
          </button>
        </div>
      </div>

      {/* Safeguarding note (minors school) */}
      <p className="flex items-start gap-1.5 text-[11px] text-neutral-500">
        <ShieldCheck className="w-3.5 h-3.5 mt-px shrink-0 text-emerald-700" />
        Live sessions are recorded for academic purposes per POPIA consent captured at enrolment.
        Keep your camera/mic use class-appropriate — lecturers can mute or remove participants.
      </p>

      {/* Conference frame */}
      {status === 'error' ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3">
          <p className="text-sm font-bold text-rose-700">{error}</p>
          <button
            onClick={() => navigate('/timetable')}
            className="px-4 py-2 rounded-xl bg-emerald-800 text-yellow-300 text-xs font-black"
          >
            Back to timetable
          </button>
        </div>
      ) : status === 'external' ? (
        <div className="bg-white rounded-2xl border border-emerald-950/10 p-8 text-center space-y-4">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
            <Video className="h-7 w-7" />
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-black text-neutral-900">This class runs on Google Meet</h2>
            <p className="mx-auto max-w-md text-xs text-neutral-500">
              Google Meet opens in a new tab. Keep this page open so your attendance is recorded when you join.
            </p>
          </div>
          <button
            onClick={joinExternal}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-xs font-black text-yellow-300 shadow-xs transition hover:bg-emerald-900"
          >
            <ExternalLink className="h-4 w-4" />
            Join in Google Meet
          </button>
        </div>
      ) : (
        <div className="bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800" style={{ height: 'min(70vh, 720px)' }}>
          <div ref={containerRef} className="w-full h-full" />
        </div>
      )}
    </div>
  );
};
