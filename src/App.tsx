import React, { useState } from 'react';
import { AuthProvider } from './lib/authContext';
import { ModernNavbar } from './components/ModernNavbar';
import { ModernSidebar } from './components/ModernSidebar';
import { ClassroomWorkspace } from './components/learning/ClassroomWorkspace';
import { AssignmentLedger } from './components/AssignmentLedger';
import { AIFloatingChatbot } from './components/ai/AIFloatingChatbot';
import { StudentTimetable } from './components/student/StudentTimetable';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentAttendance } from './components/student/StudentAttendance';
import { StudentMessages } from './components/student/StudentMessages';
import { StudentNotifications } from './components/student/StudentNotifications';
import { StudentLectures } from './components/student/StudentLectures';

function AppInner() {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (route: string) => {
    const id = route.replace(/^\//, '');
    setCurrentRoute(id);
    window.history.pushState({}, '', `/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentRoute) {
      case 'lectures': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded shadow-xs overflow-hidden"><StudentLectures /></div>;
      case 'timetable': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded shadow-xs p-4 sm:p-6 overflow-hidden"><StudentTimetable /></div>;
      case 'assignments': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded shadow-xs p-4 sm:p-6 overflow-hidden"><StudentAssignments /></div>;
      case 'attendance': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded shadow-xs p-4 sm:p-6 overflow-hidden"><StudentAttendance /></div>;
      case 'discussions': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded shadow-xs p-4 sm:p-6 overflow-hidden"><StudentMessages /></div>;
      case 'notices': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded shadow-xs p-4 sm:p-6 overflow-hidden"><StudentNotifications /></div>;
      default:
        return (
          <>
            <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded shadow-xs overflow-hidden">
              <ClassroomWorkspace />
            </div>
            <div className="mt-6 bg-white border border-[var(--color-t4c-black)]/10 rounded shadow-xs p-4 sm:p-6 overflow-x-auto">
              <AssignmentLedger />
            </div>
          </>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-canvas-soft)] flex flex-col antialiased">
      <ModernNavbar onToggleMenu={() => setMenuOpen(o => !o)} menuOpen={menuOpen} />
      <div className="w-full flex flex-1 items-stretch overflow-hidden">
        <ModernSidebar onNavigate={handleNavigate} currentRoute={currentRoute} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--color-canvas-soft)] p-4 sm:p-6 min-w-0">
          {renderView()}
        </div>
      </div>
      <AIFloatingChatbot />
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
