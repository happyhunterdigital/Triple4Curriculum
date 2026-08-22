import React from 'react';
import { Search, ShieldAlert, Bell, ChevronDown, HelpCircle, Menu, X } from 'lucide-react';

interface ModernNavbarProps {
  onToggleMenu?: () => void;
  menuOpen?: boolean;
}

export const ModernNavbar: React.FC<ModernNavbarProps> = ({ onToggleMenu, menuOpen }) => {
  return (
    <header className="w-full h-[74px] bg-[var(--color-t4c-green)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 border-b border-[var(--color-t4c-black)]/30 shadow-md">
      <div className="flex items-center gap-3 sm:gap-4 h-full border-r border-white/10 pr-4 sm:pr-6 shrink-0">
        <button onClick={onToggleMenu} className="lg:hidden p-2 -ml-2 text-emerald-100 hover:text-[var(--color-t4c-yellow)]">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="w-9 h-9 rounded bg-[var(--color-t4c-black)] flex items-center justify-center font-mono font-bold text-xs text-[var(--color-t4c-yellow)] border border-[var(--color-t4c-yellow)] shadow-sm shrink-0">
          444
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-extrabold tracking-tight text-white uppercase leading-none">Triple 4C Platform</h1>
          <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-t4c-yellow)] font-bold">Academic Core</p>
        </div>
        <div className="sm:hidden">
          <h1 className="text-sm font-extrabold tracking-tight text-white uppercase leading-none">Triple 4C</h1>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-4 sm:mx-8 hidden md:block">
        <div className="relative w-full flex items-center">
          <Search size={14} className="absolute left-4 text-emerald-200/60" />
          <input
            type="text"
            className="w-full bg-[var(--color-t4c-black)]/20 border border-white/10 rounded pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-emerald-200/50 outline-none focus:bg-[var(--color-t4c-black)]/40 focus:border-[var(--color-t4c-yellow)] transition-all"
            placeholder="Query academic indexes..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-5 h-full shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 bg-[var(--color-t4c-black)]/30 px-3 py-1 rounded border border-[var(--color-t4c-yellow)]/30">
          <ShieldAlert size={12} className="text-[var(--color-t4c-yellow)]" />
          <span className="font-mono text-[9px] text-[var(--color-t4c-yellow)] font-bold uppercase tracking-wider">SYSTEM AUTHENTICATED</span>
        </div>

        <button className="hidden sm:flex bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] font-mono text-[10px] uppercase tracking-widest px-3 sm:px-4 py-2 rounded font-bold hover:bg-white transition-all shadow-xs border-b-2 border-amber-600 cursor-pointer whitespace-nowrap">
          <span className="hidden lg:inline">Transmit File +</span><span className="lg:hidden">Transmit +</span>
        </button>

        <div className="hidden sm:block w-px h-6 bg-white/10" />

        <button className="hidden sm:flex text-emerald-100 hover:text-[var(--color-t4c-yellow)] cursor-pointer transition-colors p-1"><Bell size={16} /></button>
        <button className="hidden sm:flex text-emerald-100 hover:text-[var(--color-t4c-yellow)] cursor-pointer transition-colors p-1"><HelpCircle size={16} /></button>

        <button className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:border-l border-white/10 h-full cursor-pointer hover:bg-white/5 px-1 sm:px-2 transition-all">
          <div className="w-8 h-8 rounded-full bg-[var(--color-t4c-black)] text-white font-mono font-bold flex items-center justify-center text-xs border-2 border-[var(--color-t4c-yellow)] shrink-0">
            SS
          </div>
          <div className="text-left hidden xl:block">
            <p className="text-xs font-bold text-white leading-none mb-0.5">S. Student</p>
            <p className="font-mono text-[8px] uppercase text-emerald-200 tracking-wider font-semibold">Matrix Validated</p>
          </div>
          <ChevronDown size={12} className="text-emerald-200 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
