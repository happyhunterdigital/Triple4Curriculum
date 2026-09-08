import React from 'react';
import { useState } from 'react';
import { Search, Bell, ChevronDown, HelpCircle, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../lib/authContext';

interface ModernNavbarProps {
  onToggleMenu?: () => void;
  menuOpen?: boolean;
}

export const ModernNavbar: React.FC<ModernNavbarProps> = ({ onToggleMenu, menuOpen }) => {
  const { logout, currentUser } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  return (
    <header className="w-full h-14 sm:h-16 md:h-[70px] lg:h-[74px] bg-[var(--color-t4c-green)] px-3 sm:px-5 md:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50 border-b border-[var(--color-t4c-black)]/30 shadow-md transition-all">
      
      {/* Brand Identity / Left Block */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 md:gap-4 h-full border-r border-white/10 pr-3 sm:pr-5 md:pr-6 shrink-0">
        {/* Mobile / Tablet Drawer Toggle (<= 1024px) */}
        <button
          onClick={onToggleMenu}
          className="lg:hidden p-1.5 -ml-1 text-emerald-100 hover:text-[var(--color-t4c-yellow)] hover:bg-white/5 rounded transition-colors"
          aria-label="Toggle navigation drawer"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Crest Logo Locked */}
        <img
          src="https://res.cloudinary.com/dka0498ns/image/upload/v1787254845/Triple_4_Curriculum_latest_logo_variant4_hjviza.png"
          alt="Triple 4C"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[var(--color-t4c-yellow)] shadow-sm shrink-0 bg-white"
          referrerPolicy="no-referrer"
        />

        {/* Brand Text: Responsive scale */}
        <div className="hidden xs:block">
          <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-white uppercase leading-none">
            Triple 4C Platform
          </h1>
          <p className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[var(--color-t4c-yellow)] font-bold mt-0.5">
            Academic Core
          </p>
        </div>
        <div className="xs:hidden">
          <h1 className="text-xs font-extrabold tracking-tight text-white uppercase leading-none">
            Triple 4C
          </h1>
        </div>
      </div>

      {/* Saturated Query System / Center Block (Visible from >= 768px) */}
      <div className="flex-1 max-w-xs md:max-w-md lg:max-w-xl mx-3 sm:mx-6 md:mx-8 hidden md:block">
        <div className="relative w-full flex items-center">
          <Search size={14} className="absolute left-3.5 text-emerald-200/60" />
          <input
            type="text"
            className="w-full bg-[var(--color-t4c-black)]/20 border border-white/10 rounded pl-9 pr-3 py-1.5 sm:py-2 text-xs font-mono text-white placeholder-emerald-200/50 outline-none focus:bg-[var(--color-t4c-black)]/40 focus:border-[var(--color-t4c-yellow)] transition-all"
            placeholder="Query academic indexes, codes..."
          />
        </div>
      </div>

      {/* Control Utility Suite / Right Block */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 h-full shrink-0">
        {/* Dynamic Action Trigger Button */}
        <button className="bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] font-mono text-[9px] sm:text-[10px] uppercase tracking-widest px-2.5 sm:px-3.5 md:px-4 py-1.5 sm:py-2 rounded font-bold hover:bg-white transition-all shadow-xs border-b-2 border-amber-600 cursor-pointer whitespace-nowrap active:scale-95">
          <span className="hidden sm:inline">Transmit File +</span>
          <span className="sm:hidden">Transmit +</span>
        </button>

        <div className="hidden sm:block w-px h-5 sm:h-6 bg-white/10" />

        {/* Icon Utilities (Hidden on tiny screens <= 480px, visible >= 640px) */}
        <button className="hidden sm:flex text-emerald-100 hover:text-[var(--color-t4c-yellow)] cursor-pointer transition-colors p-1" aria-label="Notifications">
          <Bell size={16} />
        </button>
        <button className="hidden md:flex text-emerald-100 hover:text-[var(--color-t4c-yellow)] cursor-pointer transition-colors p-1" aria-label="Help">
          <HelpCircle size={16} />
        </button>

        {/* User Identity Module with Logout */}
        <div className="relative h-full flex items-center">
          <button onClick={() => setUserMenuOpen(o => !o)} className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-2 sm:border-l border-white/10 h-full cursor-pointer hover:bg-white/5 px-1 sm:px-2 transition-all">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--color-t4c-black)] text-white font-mono font-bold flex items-center justify-center text-[10px] sm:text-xs border-2 border-[var(--color-t4c-yellow)] shrink-0 shadow-xs">
              {(currentUser?.name?.[0] || 'S').toUpperCase()}
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-xs font-bold text-white leading-none truncate max-w-[120px]">{currentUser?.name || 'S. Student'}</p>
              <p className="text-[9px] font-mono text-emerald-200 uppercase hidden 2xl:block">{currentUser?.email || 'student@triple4c.ac.za'}</p>
            </div>
            <ChevronDown size={12} className={`text-emerald-200 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#E2E8F0] rounded-[12px] shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <p className="text-xs font-bold text-[#0F172A] truncate">{currentUser?.name || 'S. Student'}</p>
                  <p className="text-[11px] font-mono text-[#64748B] truncate">{currentUser?.email || 'guest@triple4c.ac.za'}</p>
                  <span className="inline-flex mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EFF6FF] border border-blue-200 text-[#2563EB] uppercase">{currentUser?.role || 'student'}</span>
                </div>
                <div className="p-1.5">
                  <a href="/onboarding" className="flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-[#F8FAFC] rounded-[6px] text-[#1E293B]"><User size={14} /> Profile / Switch account</a>
                  <button onClick={() => { setUserMenuOpen(false); logout(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-rose-50 rounded-[6px] text-rose-700">
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </header>
  );
};
