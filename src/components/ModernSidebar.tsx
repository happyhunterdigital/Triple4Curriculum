import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LayoutDashboard, BookOpen, Calendar, FileText, CheckSquare, MessageSquare, Bell, GraduationCap, Settings, User } from 'lucide-react';

interface ModernSidebarProps {
  onNavigate?: (route: string) => void;
  currentRoute?: string;
  open?: boolean;
  onClose?: () => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ onNavigate, currentRoute = 'dashboard', open = false, onClose }) => {
  const [unreadLectures, setUnreadLectures] = useState(0);
  const [unreadAssignments, setUnreadAssignments] = useState(0);
  const [unreadNotices, setUnreadNotices] = useState(0);
  const currentStudentId = 'admin@school.edu';

  useEffect(() => {
    const q = query(collection(db, 'notifications'), where('studentId', '==', currentStudentId), where('isRead', '==', false));
    const unsub = onSnapshot(q, (snap) => {
      let l = 0, a = 0, n = 0;
      snap.docs.forEach(d => {
        const c = d.data().category;
        if (c === 'lectures') l++;
        if (c === 'assignments') a++;
        if (c === 'notices') n++;
      });
      setUnreadLectures(l); setUnreadAssignments(a); setUnreadNotices(n);
    }, () => {});
    return () => unsub();
  }, []);

  const primaryMenu = [
    { id: 'dashboard', label: "Learner Dashboard", icon: <LayoutDashboard size={16} />, count: undefined as number | undefined, active: currentRoute === 'dashboard' },
    { id: 'lectures', label: "Interactive Lectures", icon: <BookOpen size={16} />, count: unreadLectures || 3, active: currentRoute === 'lectures' },
    { id: 'timetable', label: "Class Timetable", icon: <Calendar size={16} />, count: undefined, active: currentRoute === 'timetable' },
    { id: 'assignments', label: "Assignments & Rubrics", icon: <FileText size={16} />, count: unreadAssignments || 1, active: currentRoute === 'assignments' },
  ];

  const secondaryMenu = [
    { id: 'attendance', label: "Attendance Records", icon: <CheckSquare size={16} />, active: currentRoute === 'attendance' },
    { id: 'discussions', label: "Academic Discussions", icon: <MessageSquare size={16} />, active: currentRoute === 'discussions' },
    { id: 'notices', label: "Dispatches & Notices", icon: <Bell size={16} />, count: unreadNotices || undefined, active: currentRoute === 'notices' },
  ];

  const handleClick = (id: string) => {
    onNavigate?.(id);
    onClose?.();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`w-64 min-h-[calc(100vh-64px)] bg-white border-r border-[var(--color-canvas-line)] flex flex-col justify-between shrink-0 z-40 lg:z-0
        fixed lg:static inset-y-0 left-0 top-16 lg:top-0 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="p-3 bg-[var(--color-canvas-soft)] rounded border border-[var(--color-canvas-line)]">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap size={16} className="text-[var(--color-t4c-green)]" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Active Registration</span>
            </div>
            <p className="text-xs font-bold text-[var(--color-t4c-black)]">Faculty of Applied Sciences</p>
            <div className="mt-2 pt-2 border-t border-neutral-200/60 flex justify-between items-center text-[10px] font-mono">
              <span className="text-neutral-400">TERM STATUS</span>
              <span className="text-[var(--color-t4c-green)] font-bold uppercase">[ VALIDATED ]</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-3 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-2">Core Registry</p>
            {primaryMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all group text-left cursor-pointer ${
                  item.active ? 'bg-[var(--color-t4c-green)] text-white font-bold shadow-xs' : 'text-neutral-600 hover:bg-neutral-50 hover:text-[var(--color-t4c-black)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={item.active ? 'text-white' : 'text-neutral-400 group-hover:text-[var(--color-t4c-green)]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold shrink-0 ${item.active ? 'bg-white text-[var(--color-t4c-green)]' : 'bg-neutral-100 text-[var(--color-t4c-green)] border border-neutral-200'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2">
            <p className="px-3 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-2">Administration</p>
            {secondaryMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all group text-left cursor-pointer ${item.active ? 'bg-[var(--color-t4c-green)] text-white font-bold shadow-xs' : 'text-neutral-600 hover:bg-neutral-50 hover:text-[var(--color-t4c-black)]'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={item.active ? 'text-white' : 'text-neutral-400 group-hover:text-[var(--color-t4c-green)]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center font-mono text-[9px] font-bold text-[var(--color-t4c-green)] border border-neutral-200">{item.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--color-canvas-line)] space-y-2 shrink-0">
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--color-canvas-soft)] rounded border border-[var(--color-canvas-line)]">
            <div className="flex items-center gap-2">
              <User size={12} className="text-neutral-400" />
              <span className="font-mono text-[9px] text-neutral-500 uppercase">System Key</span>
            </div>
            <span className="font-mono text-[9px] font-bold text-[var(--color-t4c-gold)]">444_SECURE</span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono uppercase text-neutral-400 hover:text-[var(--color-t4c-black)] transition-colors cursor-pointer border border-dashed border-neutral-200 rounded hover:border-neutral-300">
            <Settings size={12} />
            <span>System Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
