import React from 'react';
import { LayoutDashboard, BookOpen, Calendar, FileText, CheckSquare, MessageSquare, Bell } from 'lucide-react';


export const ModernSidebar: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  const menuItems = [
    { label: "Learner Dashboard", icon: <LayoutDashboard size={18} />, active: true, badge: "SYS" },
    { label: "Interactive Lectures", icon: <BookOpen size={18} />, count: 3 },
    { label: "Class Timetable", icon: <Calendar size={18} /> },
    { label: "Assignments & Rubrics", icon: <FileText size={18} />, count: 1 },
    { label: "Attendance Records", icon: <CheckSquare size={18} /> },
    { label: "Academic Discussions", icon: <MessageSquare size={18} /> },
    { label: "Dispatches & Notices", icon: <Bell size={18} /> },
  ];


  return (
    <aside className="relative w-76 min-h-[calc(100vh-76px)] bg-white border-r border-[var(--color-canvas-line)] p-5 flex flex-col justify-between relative">
      {/* 🎨 Designer Framing Highlight: Elegant Top-To-Bottom Gold Rail */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-t4c-gold)]" />


      <div className="space-y-6 pl-2">
        {/* Department Cluster Stencil */}
        <div className="p-3 bg-[var(--color-canvas-soft)] border-l-4 border-[var(--color-t4c-green)] rounded-r-md">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-t4c-green)] font-bold mb-0.5">
            Institutional Node
          </p>
          <h4 className="text-xs font-bold text-[var(--color-t4c-black)] tracking-tight">
            Faculty of Applied Sciences
          </h4>
        </div>


        {/* Custom Framed Navigation Menu Links */}
        <nav className="space-y-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center justify-between px-4 py-3 rounded transition-all duration-150 group text-left cursor-pointer ${
                item.active 
                  ? 'bg-[var(--color-t4c-green)]/10 text-[var(--color-t4c-green)] font-bold border-r-4 border-[var(--color-t4c-green)]' 
                  : 'text-neutral-600 hover:bg-[var(--color-canvas-soft)] hover:text-[var(--color-t4c-black)]'}
              `}
              onClick={() => onNavigate?.(item.id)}
            >
              <div className="flex items-center space-x-3.5">
                <span className={`${item.active ? 'text-[var(--color-t4c-green)]' : 'text-neutral-400 group-hover:text-[var(--color-t4c-green)]'}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] tracking-wide font-medium">{item.label}</span>
              </div>


              {/* Functional Indicator Badges */}
              {item.badge && (
                <span className="font-mono text-[9px] font-bold bg-[var(--color-t4c-gold)] text-[var(--color-t4c-black)] px-1.5 py-0.5 rounded border border-amber-400">
                  {item.badge}
                </span>
              )}
              {item.count && (
                <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center font-mono text-[10px] font-bold text-[var(--color-t4c-green)] border border-[var(--color-canvas-line)]">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>


      {/* Footer Utility Module (Visually separate from main footer) */}
      <div className="pt-4 border-t border-[var(--color-canvas-line)] pl-2">
        <div className="bg-[var(--color-t4c-black)] text-[var(--color-canvas-soft)] p-3 rounded flex items-center justify-between shadow-xs">
          <span className="font-mono text-[9px] tracking-widest uppercase font-bold text-[var(--color-t4c-gold)]">
            SECURE ENGINE
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
        </div>
      </div>
    </aside>
  );
};