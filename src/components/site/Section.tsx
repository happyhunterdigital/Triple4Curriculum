import * as React from 'react';

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-t4c-green)] font-semibold">{children}</p>;
}
export function SectionHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`font-display text-[28px] sm:text-[32px] lg:text-[40px] font-semibold tracking-tight leading-[1.05] text-[var(--color-t4c-black)] ${className}`}>{children}</h2>;
}
export function Body({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[14px] sm:text-[15px] leading-relaxed text-neutral-700 max-w-[65ch] ${className}`}>{children}</p>;
}

/**
 * Scroll-in reveal for marketing sections.
 *
 * Implemented with IntersectionObserver + a CSS transition instead of
 * framer-motion: same 0.6s ease and 18px rise, but ~42KB of runtime is no
 * longer shipped to every visitor. Sections already in the first viewport paint
 * immediately (no animation) so they never hold back LCP, and the whole effect
 * is skipped for prefers-reduced-motion.
 */
export function RevealStagger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [state, setState] = React.useState<'hidden' | 'revealing' | 'visible'>('hidden');

  // useLayoutEffect so above-the-fold content is switched to visible *before*
  // the first paint, rather than fading in after hydration.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      setState('visible');
      return;
    }

    const rect = el.getBoundingClientRect();
    const inFirstViewport = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    if (inFirstViewport) {
      setState('visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState('revealing');
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      // Content is only visually offset while hidden — never display:none — so
      // it stays in the accessibility tree and readable by crawlers.
      ref={ref}
      className={`reveal reveal--${state} ${className}`}
    >
      {children}
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-10 sm:gap-12 lg:gap-16">{children}</div>;
}
