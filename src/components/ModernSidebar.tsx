import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  LayoutDashboard, BookOpen, Calendar, FileText,
  CheckSquare, MessageSquare, Bell, Settings,
  LogOut, ChevronLeft, ChevronRight, Plus, FolderPlus, FilePlus, X
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  subItems?: { label: string; count?: number }[];
}

interface ModernSidebarProps {
  onNavigate?: (route: string) => void;
  currentRoute?: string;
  open?: boolean;
  onClose?: () => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ onNavigate, currentRoute = 'dashboard', open = false, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateFlyout, setShowCreateFlyout] = useState(false);
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

  const handleNavigate = (id: string) => {
    onNavigate?.(id);
    onClose?.();
  };

  const primaryMenu: MenuItem[] = [
    { id: 'dashboard', label: "Learner Dashboard", icon: <LayoutDashboard size={20} strokeWidth={2.4} /> },
    { id: 'lectures', label: "Interactive Lectures", icon: <BookOpen size={20} strokeWidth={2.4} /> },
    {
      id: 'assignments',
      label: "Assignments",
      icon: <FileText size={20} strokeWidth={2.4} />,
      subItems: [
        { label: "Drafts", count: unreadAssignments || 3 },
        { label: "Scheduled", count: 1 },
        { label: "Submitted", count: 14 }
      ]
    },
    { id: 'timetable', label: "Class Timetable", icon: <Calendar size={20} strokeWidth={2.4} /> },
  ];

  const secondaryMenu: MenuItem[] = [
    { id: 'attendance', label: "Attendance Records", icon: <CheckSquare size={20} strokeWidth={2.4} /> },
    { id: 'discussions', label: "Academic Discussions", icon: <MessageSquare size={20} strokeWidth={2.4} /> },
    { id: 'notices', label: "Dispatches & Notices", icon: <Bell size={20} strokeWidth={2.4} />, count: 2 },
  ];

  return (
    <>
      {/* Mobile & Tablet Portrait Backdrop Overlay (<= 1024px) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div className="relative flex h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] md:h-[calc(100vh-70px)] lg:h-[calc(100vh-74px)] shrink-0">
        <aside
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => { setIsExpanded(false); setShowCreateFlyout(false); }}
          className={`h-full bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] border-r border-[var(--color-t4c-black)]/10 flex flex-col justify-between transition-all duration-300 ease-in-out select-none
            ${isExpanded ? 'w-64' : 'w-16'}
            fixed lg:static inset-y-0 left-0 top-14 sm:top-16 md:top-[70px] lg:top-0 z-40 lg:z-0 shadow-xl lg:shadow-none
            ${open ? 'translate-x-0 !w-64 max-w-[85vw]' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="overflow-y-auto overflow-x-hidden flex-1">
            
            {/* Top User Profile Header / Mobile Close */}
            <div className={`p-3 sm:p-4 flex items-center border-b border-[var(--color-t4c-black)]/10 ${(isExpanded || open) ? 'justify-between' : 'justify-center'}`}>
              <div className={`flex items-center gap-3 overflow-hidden ${(!isExpanded && !open) ? 'justify-center w-full' : ''}`}>
                <div className="w-8 h-8 rounded-md bg-[var(--color-t4c-black)] text-white font-mono font-bold flex items-center justify-center text-xs border border-white/20 shrink-0 shadow-xs">
                  SS
                </div>
                {(isExpanded || open) && (
                  <div className="truncate">
                    <p className="text-xs font-bold leading-none mb-0.5">Sarah Student</p>
                    <p className="font-mono text-[8px] uppercase tracking-wider text-[var(--color-t4c-black)]/60 font-semibold">Matrix Node</p>
                  </div>
                )}
              </div>

              {/* Desktop Expand Toggle / Mobile Close Button */}
              <div className="flex items-center gap-1">
                {open && (
                  <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded hover:bg-[var(--color-t4c-black)]/10 text-[var(--color-t4c-black)] cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded hover:bg-[var(--color-t4c-black)]/10 text-[var(--color-t4c-black)] cursor-pointer hidden lg:flex shrink-0 border border-black/5"
                  title={isExpanded ? "Collapse" : "Expand"}
                  aria-label="Toggle sidebar width"
                >
                  {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>

            {/* Action Trigger Block: File Submission */}
            <div className="p-2 sm:p-3 relative">
              <button
                onClick={() => (isExpanded || open) && setShowCreateFlyout(!showCreateFlyout)}
                className={`w-full flex items-center bg-[var(--color-t4c-black)] text-white text-xs font-bold rounded py-2 sm:py-2.5 border border-amber-600 transition-colors cursor-pointer hover:bg-neutral-800 active:scale-98 ${(isExpanded || open) ? 'justify-between px-3' : 'justify-center px-2'}`}
                title="File Submission"
              >
                <div className="flex items-center gap-2">
                  <Plus size={16} strokeWidth={2.6} className="text-[var(--color-t4c-yellow)] shrink-0" />
                  {(isExpanded || open) && <span>File Submission</span>}
                </div>
              </button>

              {/* Floating Action Flyout */}
              {showCreateFlyout && (isExpanded || open) && (
                <div className="absolute top-14 left-2 right-2 sm:left-3 sm:right-3 bg-[var(--color-t4c-black)] text-white border border-neutral-800 rounded shadow-xl p-1.5 space-y-0.5 z-50">
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-medium hover:bg-white/10 rounded text-left cursor-pointer">
                    <FilePlus size={12} className="text-amber-400" />
                    <span>Upload Assignment</span>
                  </button>
                  <button className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-medium hover:bg-white/10 rounded text-left cursor-pointer">
                    <FolderPlus size={12} className="text-amber-400" />
                    <span>Create Workspace Folder</span>
                  </button>
                </div>
              )}
            </div>

            {/* Core Registry Menu */}
            <nav className="px-2 space-y-0.5 mt-1 sm:mt-2">
              {(isExpanded || open) && (
                <p className="px-2 font-mono text-[8px] uppercase tracking-widest text-[var(--color-t4c-black)]/60 font-extrabold mb-1.5">
                  Core Registry
                </p>
              )}
              {primaryMenu.map((item) => {
                const isSelected = currentRoute === item.id;
                return (
                  <div key={item.id} className="space-y-0.5">
                    <button
                      onClick={() => handleNavigate(item.id)}
                      title={item.label}
                      className={`w-full flex items-center ${(isExpanded || open) ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded text-xs font-bold transition-all border group text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--color-t4c-black)] text-white border-[var(--color-t4c-black)] shadow-xs'
                          : 'text-[var(--color-t4c-black)] border-transparent hover:bg-[var(--color-t4c-black)]/10'
                      }`}
                    >
                      <div className={`flex items-center ${(isExpanded || open) ? 'gap-3' : 'justify-center'}`}>
                        <span className={`${isSelected ? 'text-[var(--color-t4c-yellow)]' : 'text-[var(--color-t4c-black)]'} shrink-0`}>
                          {item.icon}
                        </span>
                        {(isExpanded || open) && <span>{item.label}</span>}
                      </div>
                    </button>

                    {/* Sub-Nested Links */}
                    {item.subItems && isSelected && (isExpanded || open) && (
                      <div className="pl-8 pr-2 py-1 space-y-0.5 border-l border-[var(--color-t4c-black)]/10 ml-5 mt-0.5">
                        {item.subItems.map((sub, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleNavigate(item.id)}
                            className="w-full flex items-center justify-between py-1 text-[11px] text-[var(--color-t4c-black)]/80 hover:text-[var(--color-t4c-black)] font-medium text-left cursor-pointer"
                          >
                            <span>{sub.label}</span>
                            {sub.count !== undefined && (
                              <span className="font-mono text-[9px] font-bold bg-[var(--color-t4c-green)] text-white px-1 rounded">
                                {sub.count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Administration Menu */}
            <nav className="px-2 space-y-0.5 pt-3 sm:pt-4">
              {(isExpanded || open) && (
                <p className="px-2 font-mono text-[8px] uppercase tracking-widest text-[var(--color-t4c-black)]/60 font-extrabold mb-1.5">
                  Administration
                </p>
              )}
              {secondaryMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  title={item.label}
                  className={`w-full flex items-center ${(isExpanded || open) ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded text-xs font-bold transition-all text-left cursor-pointer ${
                    currentRoute === item.id
                      ? 'bg-[var(--color-t4c-black)] text-white shadow-xs'
                      : 'text-[var(--color-t4c-black)]/80 hover:bg-[var(--color-t4c-black)]/10'
                  }`}
                >
                  <div className={`flex items-center ${(isExpanded || open) ? 'gap-3' : 'justify-center'}`}>
                    <span className={`${currentRoute === item.id ? 'text-[var(--color-t4c-yellow)]' : 'text-[var(--color-t4c-black)]'} shrink-0`}>
                      {item.icon}
                    </span>
                    {(isExpanded || open) && <span>{item.label}</span>}
                  </div>
                  {item.count && (isExpanded || open) && (
                    <span className="w-4 h-4 rounded-full bg-[var(--color-t4c-green)] text-white text-[9px] flex items-center justify-center font-mono shrink-0">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Utilities */}
          <div className="p-2 space-y-1 border-t border-[var(--color-t4c-black)]/10 shrink-0">
            <button
              title="System Settings"
              className={`w-full flex items-center ${(isExpanded || open) ? 'px-3' : 'justify-center px-2'} py-2 text-xs font-bold rounded text-[var(--color-t4c-black)]/80 hover:bg-[var(--color-t4c-black)]/10 text-left cursor-pointer`}
            >
              <Settings size={18} strokeWidth={2.4} className="text-[var(--color-t4c-black)] shrink-0" />
              {(isExpanded || open) && <span className="ml-3">System Settings</span>}
            </button>
            <button
              title="Terminate Link"
              className={`w-full flex items-center ${(isExpanded || open) ? 'px-3' : 'justify-center px-2'} py-2 text-xs font-bold rounded text-red-800 hover:bg-red-900/10 text-left cursor-pointer`}
            >
              <LogOut size={18} strokeWidth={2.4} className="shrink-0" />
              {(isExpanded || open) && <span className="ml-3">Terminate Link</span>}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};
