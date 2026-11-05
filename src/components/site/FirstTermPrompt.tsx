import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, CalendarDays, Users, X } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { getConsent } from '../../lib/consent';
import { daysUntilTerm, TERM_LABEL, termStartLabel } from '../../lib/term';

const SESSION_KEY = 't4c:term-prompt-dismissed';

/** Routes where a "register now" nudge would be noise or actively unhelpful. */
const SUPPRESSED = ['/admissions', '/onboarding', '/login', '/contact', '/privacy', '/terms', '/child-protection'];

/**
 * Term 1 enrolment prompt.
 *
 * Fires once a visitor has read past the hero (~1.2 viewports of scrolling),
 * never for signed-in users, never on the admissions/onboarding funnel, and not
 * while the cookie banner is still waiting for a choice (they would stack).
 * Dismissal is remembered for the session only, so it is not a nag.
 */
export const FirstTermPrompt: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const suppressed =
    Boolean(currentUser) || SUPPRESSED.includes(location.pathname);

  useEffect(() => {
    if (suppressed) return;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) return;

    let cleanup = () => {};
    let timer = 0;

    const arm = () => {
      // Wait for the cookie choice: showing both at once stacks two overlays.
      if (getConsent() === null) {
        timer = window.setTimeout(arm, 500);
        return;
      }

      const onScroll = () => {
        const scrolled = window.scrollY || document.documentElement.scrollTop || 0;
        if (scrolled > window.innerHeight * 1.2) {
          returnFocus.current = document.activeElement as HTMLElement | null;
          setOpen(true);
          cleanup();
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('scroll', onScroll, { passive: true, capture: true });
      // Already deep in the page (deep link or restored scroll): fire now.
      onScroll();

      cleanup = () => {
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('scroll', onScroll, true);
      };
    };

    arm();
    return () => {
      window.clearTimeout(timer);
      cleanup();
    };
  }, [suppressed]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode — the prompt simply shows again next navigation */
    }
    setOpen(false);
    returnFocus.current?.focus?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={close}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="term-prompt-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-lg rounded-t-[24px] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45)] outline-none sm:rounded-[24px] sm:p-8"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X size={18} />
        </button>

        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-t4c-green)]">
          {TERM_LABEL} enrolment
        </p>
        <h2
          id="term-prompt-title"
          className="mt-2 font-display text-[24px] font-semibold leading-tight tracking-tight text-[var(--color-t4c-black)] sm:text-[28px]"
        >
          Secure your place for Term 1.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">
          Live classes begin {termStartLabel()} — {daysUntilTerm()} days away. Sixteen learners per
          class, four live lessons a day, taught by qualified teachers.
        </p>

        <ul className="mt-4 space-y-1.5 text-xs text-neutral-600">
          <li className="flex items-center gap-2">
            <CalendarDays size={14} className="text-[var(--color-t4c-green)]" />
            Classes commence {termStartLabel()}
          </li>
          <li className="flex items-center gap-2">
            <Users size={14} className="text-[var(--color-t4c-green)]" />
            Capped at 16 learners, every lesson live
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/admissions#apply"
            onClick={close}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-t4c-black)] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[var(--color-t4c-green)]"
          >
            Apply for Term 1 <ArrowRight size={14} />
          </Link>
          <Link
            to="/contact"
            onClick={close}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-black/15 px-5 py-3 text-xs font-bold uppercase tracking-widest text-[var(--color-t4c-black)] transition-colors hover:border-[var(--color-t4c-yellow)]"
          >
            Ask a question
          </Link>
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-3 w-full py-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500 hover:text-neutral-800"
        >
          Not now
        </button>
      </div>
    </div>
  );
};
