import React from 'react';
import { Search, Shield, ChevronDown, Bell, HelpCircle, Menu, X } from 'lucide-react';

interface ModernNavbarProps {
  onToggleMenu?: () => void;
  menuOpen?: boolean;
}

export const ModernNavbar: React.FC<ModernNavbarProps> = ({ onToggleMenu, menuOpen }) => {
  return (
    <header className="w-full h-16 bg-white border-b border-[var(--color-canvas-line)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 sm:gap-4 h-full border-r border-[var(--color-canvas-line)] pr-4 sm:pr-6 shrink-0">
        <button onClick={onToggleMenu} className="lg:hidden p-2 -ml-2 text-neutral-600 hover:text-[var(--color-t4c-black)]">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="w-8 h-8 rounded bg-[var(--color-t4c-black)] flex items-center justify-center font-bold text-xs text-white border border-[var(--color-t4c-gold)] shrink-0">
          444
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold tracking-tight text-[var(--color-t4c-black)] leading-none">Triple 4C Platform</h1>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-t4c-green)] font-semibold">GA Academy</p>
        </div>
        <div className="sm:hidden">
          <h1 className="text-sm font-bold tracking-tight text-[var(--color-t4c-black)] leading-none">Triple 4C</h1>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4 sm:mx-8 hidden md:block">
        <div className="relative w-full flex items-center">
          <Search size={14} className="absolute left-4 text-neutral-400" />
          <input
            type="text"
            className="w-full bg-[var(--color-canvas-soft)] border border-[var(--color-canvas-line)] rounded pl-10 pr-4 py-1.5 text-xs font-mono placeholder-neutral-400 outline-none focus:bg-white focus:border-[var(--color-t4c-green)] transition-all"
            placeholder="Search indexing nodes, lectures, or files..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 h-full shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200/50">
          <Shield size={12} className="text-[var(--color-t4c-green)]" />
          <span className="font-mono text-[9px] text-[var(--color-t4c-green)] font-bold uppercase tracking-wider">Secure Node</span>
        </div>

        <button className="hidden sm:flex bg-[var(--color-t4c-green)] text-white font-mono text-[10px] uppercase tracking-widest px-3 sm:px-4 py-2 rounded hover:bg-[var(--color-t4c-black)] font-bold transition-all border-b-2 border-emerald-900 cursor-pointer whitespace-nowrap">
          <span className="hidden lg:inline">Transmit Deliverable +</span>
          <span className="lg:hidden">Transmit +</span>
        </button>

        <div className="hidden sm:block w-px h-6 bg-neutral-200" />

        <button className="hidden sm:flex text-neutral-400 hover:text-[var(--color-t4c-black)] cursor-pointer p-1"><Bell size={16} /></button>
        <button className="hidden sm:flex text-neutral-400 hover:text-[var(--color-t4c-black)] cursor-pointer p-1"><HelpCircle size={16} /></button>

        <button className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:border-l border-[var(--color-canvas-line)] h-full cursor-pointer hover:bg-neutral-50/50 px-1 sm:px-2 transition-colors">
          <div className="w-7 h-7 sm:w-7 sm:h-7 rounded bg-[var(--color-t4c-gold)] text-[var(--color-t4c-black)] font-bold flex items-center justify-center text-xs border border-amber-400 shadow-2xs shrink-0">
            SS
          </div>
          <div className="text-left hidden xl:block">
            <p className="text-xs font-bold text-[var(--color-t4c-black)] leading-none mb-0.5">S. Student</p>
            <p className="font-mono text-[8px] uppercase text-neutral-400 tracking-wider">Level NQF-8</p>
          </div>
          <ChevronDown size={12} className="text-neutral-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
