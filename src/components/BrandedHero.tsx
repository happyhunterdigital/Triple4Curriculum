import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export const BrandedHero: React.FC = () => {
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
          {/* Institutional Branding Narrative */}
          <h1 className="font-display text-[24px] xs:text-[28px] sm:text-[36px] md:text-[46px] lg:text-[56px] font-medium leading-[1.1] tracking-tight text-[var(--color-t4c-black)]">
            Foundations of the<br />new digital epoch
          </h1>

          <p className="font-sans text-[12px] xs:text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed text-neutral-700 max-w-xl line-clamp-3 xs:line-clamp-none">
            Designing highly academic frameworks, powering campus internal structures, and laying the computational foundations of the Triple 4C Golden Achievers Network.
          </p>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="bg-[var(--color-t4c-black)] text-[var(--color-t4c-yellow)] font-mono text-[10px] xs:text-[11px] sm:text-xs uppercase tracking-widest px-5 xs:px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full border border-[var(--color-t4c-yellow)]/30 font-bold shadow-md cursor-pointer hover:bg-[var(--color-t4c-green)] hover:text-white transition-colors"
          >
            Contact Admissions
          </motion.button>
        </motion.div>
      </div>

      {/* Floating Bottom Nav Structure */}
      <div className="absolute bottom-3 xs:bottom-5 sm:bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-[340px] xs:max-w-[380px] sm:max-w-md px-3 sm:px-4">
        <motion.nav
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-between bg-white/95 backdrop-blur-2xl px-1.5 xs:px-2 py-1.5 xs:py-2 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[var(--color-t4c-black)]/10"
        >
          {/* Star Logo */}
          <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--color-t4c-black)] border border-[var(--color-t4c-yellow)] shadow-xs flex items-center justify-center text-[var(--color-t4c-yellow)] text-xs sm:text-sm font-bold shrink-0">
            ✦
          </div>

          <div className="flex items-center gap-3 xs:gap-4 sm:gap-6">
            <button className="text-[10px] xs:text-[11px] sm:text-[12px] font-bold font-sans text-neutral-600 hover:text-[var(--color-t4c-green)] cursor-pointer">
              Curriculum
            </button>
            <button className="text-[10px] xs:text-[11px] sm:text-[12px] font-bold font-sans text-neutral-600 hover:text-[var(--color-t4c-green)] cursor-pointer">
              Ledger
            </button>
          </div>

          {/* Connect Action */}
          <button className="bg-white px-3 xs:px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] xs:text-[11px] sm:text-[12px] font-bold text-[var(--color-t4c-black)] border border-neutral-200/80 shadow-xs hover:border-[var(--color-t4c-yellow)] hover:text-[var(--color-t4c-green)] transition-all flex items-center gap-0.5 sm:gap-1 cursor-pointer">
            <span>Get in touch</span>
            <ChevronRight size={12} className="shrink-0" />
          </button>
        </motion.nav>
      </div>

    </section>
  );
};
