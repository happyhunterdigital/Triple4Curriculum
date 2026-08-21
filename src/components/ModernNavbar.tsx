import React from 'react';
import { Search, ChevronDown, Award } from 'lucide-react';

export const ModernNavbar: React.FC = () => {
  return (
    <header className="w-full h-[76px] bg-[var(--color-canvas-card)] border-b border-[var(--color-canvas-line)] px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-canvas-soft)] border-2 border-[var(--color-t4c-gold)] flex items-center justify-center overflow-hidden">
            <img 
              src="https://res.cloudinary.com/dka0498ns/image/upload/v1787254845/Triple_4_Curriculum_latest_logo_variant4_hjviza.png"
              alt="Triple 4C"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-base font-bold tracking-tight text-[var(--color-t4c-black)] hidden md:block">
            Triple 4C Platform
          </h1>
        </div>
        <div className="hidden lg:flex items-center space-x-2 bg-[var(--color-canvas-soft)] px-3 py-1.5 rounded-full border border-[var(--color-canvas-line)]">
          <Award size={12} className="text-[var(--color-t4c-green)]" />
          <span className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
            Status: Senate Certified (NQF-8)
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden sm:block">
        <div className="relative w-full flex items-center">
          <Search size={16} className="absolute left-4 text-neutral-400 pointer-events-none" />
          <input 
            type="text"
            className="w-full bg-[var(--color-canvas-soft)] border border-[var(--color-canvas-line)] rounded-full pl-11 pr-4 py-2.5 text-sm font-mono tracking-wide placeholder-neutral-400 outline-none focus:bg-white focus:border-[var(--color-t4c-green)] transition-all"
            placeholder="Query indexes or codes..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="bg-[var(--color-t4c-black)] text-white font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-[var(--color-t4c-green)] transition-colors duration-200 cursor-pointer">
          Submit Work +
        </button>

        <div className="w-px h-6 bg-[var(--color-canvas-line)]" />

        <button className="flex items-center space-x-3 hover:bg-[var(--color-canvas-soft)] p-1.5 rounded-full transition-colors text-left cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-[var(--color-t4c-gold)] text-[var(--color-t4c-black)] font-bold flex items-center justify-center text-xs border border-[var(--color-t4c-gold)]">
            SS
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-[var(--color-t4c-black)] leading-none mb-0.5">Sarah Student</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 leading-none">Matrix Active</p>
          </div>
          <ChevronDown size={14} className="text-neutral-400 hidden md:block" />
        </button>
      </div>
    </header>
  );
};
