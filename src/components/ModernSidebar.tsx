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
  badge?: { text: string; type: 'green' | 'gold' | 'neutral' };
  count?: number;
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

  const menuItems: NavigationItem[] = [
    { id: 'dashboard', label: "Learner Dashboard", icon: <LayoutDashboard size={18} />, active: true, badge: { text: "LIVE", type: 'green' } },
    { id: 'lectures', label: "Interactive Lectures", icon: <BookOpen size={18} />, count: unreadLectures > 0 ? unreadLectures : undefined },
    { id: 'timetable', label: "Class Timetable", icon: <Calendar size={18} /> },
    { id: 'assignments', label: "Assignments & Rubrics", icon: <FileText size={18} />, count: unreadAssignments > 0 ? unreadAssignments : undefined },
    { id: 'attendance', label: "Attendance Records", icon: <CheckSquare size={18} /> },
    { id: 'discussions', label: "Academic Discussions", icon: <MessageSquare size={18} /> },
    { id: 'notices', label: "Dispatches & Notices", icon: <Bell size={18} />, count: unreadNotices > 0 ? unreadNotices : undefined },
  ];

  return (
    <aside className="relative z-20 w-76 min-h-[calc(100vh-76px)] bg-[var(--color-canvas-card)] border-r border-[var(--color-canvas-line)] p-5 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="p-3 bg-[var(--color-canvas-soft)] border-l-4 border-[var(--color-t4c-green)] rounded-r-md">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-t4c-green)] font-bold mb-0.5">
            Institutional Node
          </p>
          <h4 className="text-xs font-bold text-[var(--color-t4c-black)] tracking-tight">
            Faculty of Applied Sciences
          </h4>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-150 group text-left cursor-pointer ${
                item.active 
                  ? 'bg-[var(--color-t4c-gold)]/15 border-l-2 border-[var(--color-t4c-gold)] text-[var(--color-t4c-black)] font-bold' 
                  : 'text-neutral-600 hover:bg-[var(--color-canvas-soft)] hover:text-[var(--color-t4c-black)]'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className={`${item.active ? 'text-[var(--color-t4c-green)]' : 'text-neutral-400 group-hover:text-[var(--color-t4c-green)]'}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] tracking-wide font-medium">{item.label}</span>
              </div>

              {item.badge && (
                <span className="font-mono text-[9px] font-bold bg-[var(--color-t4c-green)] text-white px-2 py-0.5 rounded">
                  {item.badge.text}
                </span>
              )}
              {item.count !== undefined && (
                <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center font-mono text-[10px] font-bold text-[var(--color-t4c-green)] border border-[var(--color-canvas-line)]">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-4 border-t border-[var(--color-canvas-line)]">
        <div className="bg-[var(--color-t4c-black)] text-[var(--color-canvas-soft)] p-3 rounded-lg flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-[var(--color-t4c-gold)]">
            SECURE ENGINE
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
        </div>
      </div>
    </aside>
  );
};
