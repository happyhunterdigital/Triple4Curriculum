import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  LayoutDashboard, BookOpen, Calendar, 
  FileText, CheckSquare, MessageSquare, Bell, Terminal 
} from 'lucide-react';

interface NavigationItem {
  id: 'dashboard' | 'lectures' | 'timetable' | 'assignments' | 'attendance' | 'discussions' | 'notices';
  label: string;
  icon: React.ReactNode;
  badge?: { text: string; type: 'green' | 'yellow' | 'neutral' };
  active?: boolean;
}

export const ModernSidebar: React.FC = () => {
  const [unreadLectures, setUnreadLectures] = useState<number>(0);
  const [unreadAssignments, setUnreadAssignments] = useState<number>(0);
  const [unreadNotices, setUnreadNotices] = useState<number>(0);

  const currentStudentId = 'admin@school.edu';

  useEffect(() => {
    const notificationQuery = query(
      collection(db, 'notifications'),
      where('studentId', '==', currentStudentId),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(notificationQuery, (snapshot) => {
      let lectureCount = 0;
      let assignmentCount = 0;
      let noticeCount = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.category === 'lectures') lectureCount++;
        if (data.category === 'assignments') assignmentCount++;
        if (data.category === 'notices') noticeCount++;
      });

      setUnreadLectures(lectureCount);
      setUnreadAssignments(assignmentCount);
      setUnreadNotices(noticeCount);
    }, (error) => {
      console.error("Live Synchronization Stream Interrupted:", error);
    });

    return () => unsubscribe();
  }, [currentStudentId]);

  const sidebarMenu: NavigationItem[] = [
    { id: 'dashboard', label: "Learner Dashboard", icon: <LayoutDashboard size={18} />, badge: { text: "STREAK", type: "yellow" }, active: true },
    { 
      id: 'lectures', 
      label: "Interactive Lectures", 
      icon: <BookOpen size={18} />, 
      badge: unreadLectures > 0 ? { text: `${unreadLectures} NEW`, type: "green" } : undefined 
    },
    { id: 'timetable', label: "Class Timetable", icon: <Calendar size={18} /> },
    { 
      id: 'assignments', 
      label: "Assignments & Rubrics", 
      icon: <FileText size={18} />, 
      badge: unreadAssignments > 0 ? { text: `${unreadAssignments} DUE`, type: "neutral" } : undefined 
    },
    { id: 'attendance', label: "Attendance Records", icon: <CheckSquare size={18} /> },
    { id: 'discussions', label: "Academic Discussions", icon: <MessageSquare size={18} /> },
    { 
      id: 'notices', 
      label: "Dispatches & Notices", 
      icon: <Bell size={18} />, 
      badge: unreadNotices > 0 ? { text: `${unreadNotices} NEW`, type: "green" } : undefined 
    },
  ];

  return (
    <aside className="w-80 h-[calc(100vh-70px)] bg-[var(--color-canvas-card)] border-r border-[var(--color-canvas-border)] p-6 flex flex-col justify-between select-none">
      <div className="space-y-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-1">
            Directory // Student Node
          </p>
          <h3 className="text-base font-semibold text-[var(--color-brand-black)] tracking-tight">
            Dept. of Computing & Applied Sciences
          </h3>
          <div className="flex items-center space-x-2 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 font-medium">Sync Active</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {sidebarMenu.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-200 group text-left cursor-pointer ${
                item.active 
                  ? 'bg-neutral-100/80 font-semibold text-[var(--color-brand-black)]' 
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-[var(--color-brand-black)]'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className={`${item.active ? 'text-[var(--color-brand-green)]' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                  {item.icon}
                </span>
                <span className="text-sm tracking-wide">{item.label}</span>
              </div>
              
              {item.badge && (
                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded tracking-wider transition-all ${
                  item.badge.type === 'green' ? 'bg-emerald-50 text-[var(--color-brand-green)] border border-emerald-200/50 scale-105' :
                  item.badge.type === 'yellow' ? 'bg-amber-50 text-amber-800 border border-[var(--color-brand-yellow)]' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {item.badge.text}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-[var(--color-canvas-border)]">
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-lg border border-[var(--color-canvas-border)]">
          <div className="flex items-center space-x-2.5">
            <Terminal size={14} className="text-neutral-400" />
            <span className="font-mono text-xs text-neutral-600 uppercase tracking-wider">Live Firebase Link</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-neutral-400 bg-white px-1.5 py-0.5 rounded shadow-2xs">MQTT</span>
        </div>
      </div>
    </aside>
  );
};
