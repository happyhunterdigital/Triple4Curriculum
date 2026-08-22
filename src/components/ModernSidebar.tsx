import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LayoutDashboard, BookOpen, Calendar, FileText, CheckSquare, MessageSquare, Bell, User, Settings, Shield } from 'lucide-react';

interface ModernSidebarProps {
  onNavigate?: (route: string) => void;
  currentRoute?: string;
  open?: boolean;
  onClose?: () => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ onNavigate, currentRoute = 'dashboard', open = false, onClose }) => {
  const [unreadLectures, setUnreadLectures] = useState(0);
  const [unreadAssignments, setUnreadAssignments] = useState(0);
  const currentStudentId = 'admin@school.edu';

  useEffect(() => {
    const q = query(collection(db, 'notifications'), where('studentId', '==', currentStudentId), where('isRead', '==', false));
    const unsub = onSnapshot(q, (snap) => {
      let l = 0, a = 0;
      snap.docs.forEach(d => {
        const c = d.data().category;
        if (c === 'lectures') l++;
        if (c === 'assignments') a++;
      });
      setUnreadLectures(l); setUnreadAssignments(a);
    }, () => {});
    return () => unsub();
  }, []);

  const primaryMenu = [
    { id: 'dashboard', label: "Learner Dashboard", icon: <LayoutDashboard size={16} />, active: currentRoute === 'dashboard' },
    { id: 'lectures', label: "Interactive Lectures", icon: <BookOpen size={16} />, count: unreadLectures || 3, active: currentRoute === 'lectures' },
    { id: 'timetable', label: "Class Timetable", icon: <Calendar size={16} />, active: currentRoute === 'timetable' },
    { id: 'assignments', label: "Assignments & Rubrics", icon: <FileText size={16} />, count: unreadAssignments || 1, active: currentRoute === 'assignments' },
  ];

  const secondaryMenu = [
    { id: 'attendance', label: "Attendance Records", icon: <CheckSquare size={16} />, active: currentRoute === 'attendance' },
    { id: 'discussions', label: "Academic Discussions", icon: <MessageSquare size={16} />, active: currentRoute === 'discussions' },
    { id: 'notices', label: "Dispatches & Notices", icon: <Bell size={16} />, active: currentRoute === 'notices' },
  ];

  const handleClick = (id: string) => {
    onNavigate?.(id);
    onClose?.();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`w-64 min-h-[calc(100vh-74px)] bg-[var(--color-t4c-yellow)] border-r border-[var(--color-t4c-black)]/20 p-4 flex flex-col justify-between select-none shrink-0 z-40 lg:z-0 fixed lg:static inset-y-0 left-0 top-[74px] lg:top-0 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="space-y-6 overflow-y-auto">
          <div className="p-3 bg-[var(--color-t4c-black)] text-white rounded shadow-sm border-b-2 border-amber-600">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={13} className="text-[var(--color-t4c-yellow)]" />
              <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--color-t4c-yellow)] font-bold">Senate Directive</span>
            </div>
            <h4 className="text-xs font-bold tracking-tight text-neutral-100">Faculty of Applied Sciences</h4>
          </div>

          <div className="space-y-1">
            <p className="px-2 font-mono text-[9px] uppercase tracking-widest text-[var(--color-t4c-black)] font-extrabold opacity-60 mb-2">Core Ledger Navigation</p>
            {primaryMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-bold transition-all group text-left cursor-pointer border ${item.active ? 'bg-[var(--color-t4c-black)] text-white border-[var(--color-t4c-black)] shadow-sm' : 'text-[var(--color-t4c-black)] border-transparent hover:bg-[var(--color-t4c-black)]/10'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={item.active ? 'text-[var(--color-t4c-yellow)]' : 'text-[var(--color-t4c-black)]/60 group-hover:text-[var(--color-t4c-black)]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold bg-[var(--color-t4c-green)] text-white shrink-0">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-1">
            <p className="px-2 font-mono text-[9px] uppercase tracking-widest text-[var(--color-t4c-black)] font-extrabold opacity-60 mb-2">Administration</p>
            {secondaryMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold transition-all text-left cursor-pointer ${item.active ? 'bg-[var(--color-t4c-black)] text-white shadow-sm' : 'text-[var(--color-t4c-black)]/80 hover:bg-[var(--color-t4c-black)]/10'}`}
              >
                <span className={item.active ? 'text-[var(--color-t4c-yellow)]' : 'text-[var(--color-t4c-black)]/50'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-[var(--color-t4c-black)]/10 shrink-0">
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-t4c-black)] text-white rounded border border-[var(--color-t4c-black)]">
            <div className="flex items-center gap-2">
              <User size={12} className="text-[var(--color-t4c-yellow)]" />
              <span className="font-mono text-[8px] uppercase tracking-widest text-neutral-300">Terminal ID</span>
            </div>
            <span className="font-mono text-[9px] font-extrabold text-[var(--color-t4c-yellow)]">444_NODE</span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono uppercase text-[var(--color-t4c-black)] font-bold hover:bg-[var(--color-t4c-black)] hover:text-white rounded transition-all cursor-pointer border border-[var(--color-t4c-black)]/30">
            <Settings size={12} />
            <span>System Parameters</span>
          </button>
        </div>
      </aside>
    </>
  );
};
