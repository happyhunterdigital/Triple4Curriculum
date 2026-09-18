import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-t4c-green)] font-semibold">{children}</p>;
}
export function SectionHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`font-display text-[28px] sm:text-[32px] lg:text-[40px] font-semibold tracking-tight leading-[1.05] text-[var(--color-t4c-black)] ${className}`}>{children}</h2>;
}
export function Body({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[14px] sm:text-[15px] leading-relaxed text-neutral-700 max-w-[65ch] ${className}`}>{children}</p>;
}
export function RevealStagger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-10 sm:gap-12 lg:gap-16">{children}</div>;
}
