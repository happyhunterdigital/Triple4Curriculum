import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export const BrandedHero: React.FC = () => {
  return (
    <section className="relative w-full max-w-[1400px] mx-auto rounded-[32px] sm:rounded-[48px] bg-white border border-[var(--color-t4c-black)]/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden h-[520px] sm:h-[600px] flex flex-col my-2 sm:my-6 shrink-0">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <video
          className="w-full h-full object-cover scale-105 grayscale-[15%] contrast-[105%]"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <div className="relative z-20 flex-1 px-6 sm:px-8 md:px-16 pt-8 sm:pt-12 md:pt-16 flex flex-col items-start bg-gradient-to-r from-white/95 via-white/60 to-transparent sm:from-white/90 sm:via-white/40 h-full justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl space-y-4 sm:space-y-6"
        >
          <h1 className="font-display text-[32px] sm:text-[42px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-[var(--color-t4c-black)]">
            Foundations of the<br />new digital epoch
          </h1>
          <p className="font-sans text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed text-neutral-600 max-w-xl">
            Designing highly academic frameworks, powering campus internal structures, and laying the computational foundations of the Triple 4C Golden Achievers Network.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[var(--color-t4c-black)] text-[var(--color-t4c-yellow)] font-mono text-xs uppercase tracking-widest px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border border-[var(--color-t4c-yellow)]/30 font-bold shadow-md cursor-pointer hover:bg-[var(--color-t4c-green)] hover:text-white transition-colors"
          >
            Contact Admissions
          </motion.button>
        </motion.div>
      </div>

      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
        <motion.nav
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-between bg-white/90 backdrop-blur-2xl px-2 py-2 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[var(--color-t4c-black)]/10"
        >
          <div className="w-9 h-9 rounded-full bg-[var(--color-t4c-black)] border border-[var(--color-t4c-yellow)] shadow-sm flex items-center justify-center text-[var(--color-t4c-yellow)] font-bold">
            ✦
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="text-[11px] sm:text-[12px] font-bold font-sans text-neutral-500 hover:text-[var(--color-t4c-green)] cursor-pointer">Curriculum</button>
            <button className="text-[11px] sm:text-[12px] font-bold font-sans text-neutral-500 hover:text-[var(--color-t4c-green)] cursor-pointer">Ledger</button>
          </div>
          <button className="bg-white px-4 sm:px-5 py-2 rounded-full text-[11px] sm:text-[12px] font-bold text-[var(--color-t4c-black)] border border-neutral-200/80 shadow-sm hover:border-[var(--color-t4c-yellow)] hover:text-[var(--color-t4c-green)] transition-all flex items-center gap-1 cursor-pointer">
            <span>Get in touch</span>
            <ChevronRight size={14} />
          </button>
        </motion.nav>
      </div>
    </section>
  );
};
