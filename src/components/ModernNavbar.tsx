import React from 'react';
import { Search, ChevronDown, Award } from 'lucide-react';

export const ModernNavbar: React.FC = () => {
  return (
    <header className="w-full h-[70px] bg-[var(--color-canvas-card)] border-b border-[var(--color-canvas-border)] px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-brand-black)] text-white flex items-center justify-center font-bold text-xs tracking-tighter">
            444
          </div>
          <h1 className="text-base font-bold tracking-tight text-[var(--color-brand-black)] hidden md:block">
            Triple 4C Platform
          </h1>
        </div>
        <div className="hidden lg:flex items-center space-x-2 bg-neutral-50 px-3 py-1 rounded-full border border-[var(--color-canvas-border)]">
          <Award size={12} className="text-[var(--color-brand-green)]" />
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
            className="w-full bg-neutral-50 border border-[var(--color-canvas-border)] rounded-full pl-11 pr-4 py-2 text-sm font-mono tracking-wide placeholder-neutral-400 outline-none focus:bg-white focus:border-[var(--color-brand-green)] transition-all"
            placeholder="Query indexes or codes..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="bg-[var(--color-brand-black)] text-white font-mono text-xs uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-[var(--color-brand-green)] transition-colors duration-200 cursor-pointer">
          Submit Work +
        </button>

        <div className="w-px h-6 bg-[var(--color-canvas-border)]" />

        <button className="flex items-center space-x-3 hover:bg-neutral-50 p-1.5 rounded-full transition-colors text-left cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[var(--color-brand-yellow)] text-[var(--color-brand-black)] font-bold flex items-center justify-center text-xs border border-amber-300 shadow-2xs">
            SS
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-[var(--color-brand-black)] leading-none mb-0.5">Sarah Student</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 leading-none">Matrix Active</p>
          </div>
          <ChevronDown size={14} className="text-neutral-400 hidden md:block" />
        </button>
      </div>
    </header>
  );
};
