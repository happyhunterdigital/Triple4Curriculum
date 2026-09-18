import React from 'react';
import { motion } from 'framer-motion';

export const LandingHero: React.FC = () => {
  return (
    <section className="relative w-full max-w-[1400px] mx-auto rounded-[24px] xs:rounded-[32px] md:rounded-[44px] lg:rounded-[48px] bg-white border border-[var(--color-t4c-black)]/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] overflow-hidden h-[440px] xs:h-[480px] sm:h-[520px] md:h-[560px] lg:h-[600px] flex flex-col my-1 sm:my-3 md:my-6 shrink-0 transition-all">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <img
          src="https://res.cloudinary.com/dka0498ns/image/upload/v1787253903/Triple4c_learners_hero_image_mzxiye.jpg"
          alt="Triple4C Learners"
          className="w-full h-full object-cover scale-105 grayscale-[10%] contrast-[105%]"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Hero Text Content Wrapper with Responsive Gradients */}
      <div className="relative z-20 flex-1 px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 pt-6 xs:pt-8 sm:pt-12 md:pt-16 pb-20 flex flex-col items-start bg-gradient-to-r from-white/95 via-white/70 to-transparent sm:from-white/90 sm:via-white/50 h-full justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xs xs:max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl space-y-3 sm:space-y-4 md:space-y-6"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--color-t4c-green)] font-semibold">Preserving Fresh Minds Globally</p>
          <h1 className="font-display text-[24px] xs:text-[28px] sm:text-[36px] md:text-[46px] lg:text-[52px] font-semibold leading-[1.05] tracking-tight text-[var(--color-t4c-black)]">
            Small Classes.<br />Big Futures.
          </h1>

          <p className="font-sans text-[12px] xs:text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed text-neutral-700 max-w-xl">
            4 days a week, 4 hours a day, 4 lessons a day — live teachers, 16 per class.
          </p>

          <div className="flex flex-wrap gap-3">
            <motion.a
              href="/admissions#apply"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-[var(--color-t4c-black)] text-white font-mono text-[10px] xs:text-[11px] sm:text-xs uppercase tracking-widest px-5 xs:px-6 sm:px-7 py-2.5 sm:py-3 rounded-full font-bold shadow-md hover:bg-[var(--color-t4c-green)] transition-colors"
            >
              Check Availability
            </motion.a>
            <a href="/how-it-works" className="inline-flex items-center gap-2 bg-white border border-black/10 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:border-[var(--color-t4c-yellow)] transition-colors">Discover the Model</a>
          </div>
        </motion.div>
      </div>

      <p className="absolute bottom-3 left-4 sm:left-8 text-[11px] font-mono text-neutral-600 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 border border-black/10">SACCAI-track · CAPS + International · 16 per class</p>

    </section>
  );
};
