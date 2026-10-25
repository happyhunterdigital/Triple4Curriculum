import React from 'react';

/**
 * Bento and modular grid primitives for the T4C dashboard.
 *
 * The grid is four columns on desktop, two on tablet, one on mobile. Cards
 * choose their own footprint with className spans (lg:col-span-2,
 * lg:row-span-2). Dense flow keeps the layout watertight when spans mix.
 * Every tile is a BentoCard so spacing, borders and headers stay consistent.
 */
export const BentoGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 grid-flow-row-dense auto-rows-[minmax(0,auto)] ${className}`}
  >
    {children}
  </div>
);

type Accent = 'none' | 'green' | 'yellow' | 'dark';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: Accent;
  eyebrow?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  padded?: boolean;
}

const ACCENTS: Record<Accent, string> = {
  none: 'bg-white border border-[#E2E8F0] text-[#0F172A]',
  green: 'bg-[var(--color-t4c-green)] border border-[var(--color-t4c-green)] text-white',
  yellow: 'bg-[#FDF6DC] border border-[#EFD98A] text-[#0F172A]',
  dark: 'bg-[#111214] border border-[#111214] text-white',
};

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className = '',
  accent = 'none',
  eyebrow,
  title,
  icon,
  action,
  padded = true,
}) => {
  const hasHeader = Boolean(eyebrow || title || action);
  return (
    <section
      className={`${ACCENTS[accent]} rounded-[20px] overflow-hidden flex flex-col shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      {hasHeader && (
        <div
          className={`flex items-start justify-between gap-3 ${padded ? 'px-5 pt-5' : 'px-5 pt-5'}`}
        >
          <div className="min-w-0">
            {eyebrow && (
              <p
                className={`text-[10px] font-mono uppercase tracking-[0.18em] ${
                  accent === 'green' || accent === 'dark' ? 'text-white/60' : 'text-[#64748B]'
                }`}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h3
                className={`mt-1 font-display text-[15px] font-semibold tracking-tight ${
                  accent === 'green' || accent === 'dark' ? 'text-white' : 'text-[#0F172A]'
                }`}
              >
                {title}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {icon}
            {action}
          </div>
        </div>
      )}
      <div className={`flex-1 ${padded ? 'p-5' : ''} ${hasHeader && padded ? 'pt-3' : ''}`}>
        {children}
      </div>
    </section>
  );
};

/** Small status pill used inside tiles. */
export const BentoPill: React.FC<{
  children: React.ReactNode;
  tone?: 'green' | 'yellow' | 'neutral' | 'danger' | 'onDark';
}> = ({ children, tone = 'neutral' }) => {
  const tones = {
    green: 'bg-[#E8F3EE] text-[#065F46]',
    yellow: 'bg-[#FBEFC0] text-[#7A5A00]',
    neutral: 'bg-[#F1F5F9] text-[#475569]',
    danger: 'bg-[#FEE2E2] text-[#B91C1C]',
    onDark: 'bg-white/10 text-white/80',
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
};
