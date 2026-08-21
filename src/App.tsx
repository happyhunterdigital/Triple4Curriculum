import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { ModernNavbar } from './components/ModernNavbar';
import { ModernSidebar } from './components/ModernSidebar';
import { ToastBanner } from './components/ToastBanner';
import { AIFloatingChatbot } from './components/ai/AIFloatingChatbot';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentLectures } from './components/student/StudentLectures';
import { StudentTimetable } from './components/student/StudentTimetable';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentAttendance } from './components/student/StudentAttendance';
import { StudentMessages } from './components/student/StudentMessages';
import { StudentNotifications } from './components/student/StudentNotifications';

// Lecturer Views
import { LecturerDashboard } from './components/lecturer/LecturerDashboard';
import { LearnerProgressDashboard } from './components/lecturer/LearnerProgressDashboard';
import { LecturerGrading } from './components/lecturer/LecturerGrading';
import { LecturerAuthoring } from './components/lecturer/LecturerAuthoring';
import { LecturerAttendance } from './components/lecturer/LecturerAttendance';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminDepartments } from './components/admin/AdminDepartments';
import { AdminTimetable } from './components/admin/AdminTimetable';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminReports } from './components/admin/AdminReports';
import { AdminAnnouncements } from './components/admin/AdminAnnouncements';
import { AdminUsers } from './components/admin/AdminUsers';

const MainLayout: React.FC = () => {
  const { currentRole } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname !== '/' ? window.location.pathname : '/dashboard';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentRole === 'admin' && !currentRoute.startsWith('/admin')) {
      handleNavigate('/admin/dashboard');
    } else if (currentRole === 'lecturer' && !currentRoute.startsWith('/lecturer')) {
      handleNavigate('/lecturer/dashboard');
    } else if (currentRole === 'student' && (currentRoute.startsWith('/admin') || currentRoute.startsWith('/lecturer'))) {
      handleNavigate('/dashboard');
    }
  }, [currentRole]);

  const renderCurrentView = () => {
    if (currentRole === 'admin' || currentRoute.startsWith('/admin')) {
      switch (currentRoute) {
        case '/admin/departments':
          return <AdminDepartments />;
        case '/admin/timetable':
          return <AdminTimetable />;
        case '/admin/audit-logs':
          return <AdminAuditLogs />;
        case '/admin/reports':
          return <AdminReports />;
        case '/admin/announcements':
          return <AdminAnnouncements />;
        case '/admin/users':
          return <AdminUsers />;
        case '/admin':
        case '/admin/dashboard':
        default:
          return <AdminDashboard onNavigate={handleNavigate} />;
      }
    }

    if (currentRole === 'lecturer' || currentRoute.startsWith('/lecturer')) {
      switch (currentRoute) {
        case '/lecturer/progress':
        case '/lecturer/classes':
          return <LearnerProgressDashboard onNavigate={handleNavigate} />;
        case '/lecturer/grading':
          return <LecturerGrading />;
        case '/lecturer/authoring':
          return <LecturerAuthoring />;
        case '/lecturer/attendance':
          return <LecturerAttendance />;
        case '/lecturer/timetable':
          return <StudentTimetable />;
        case '/lecturer/messages':
          return <StudentMessages />;
        case '/lecturer':
        case '/lecturer/dashboard':
        default:
          return <LecturerDashboard onNavigate={handleNavigate} />;
      }
    }

    switch (currentRoute) {
      case '/lectures':
      case '/student/lectures':
        return <StudentLectures />;
      case '/timetable':
      case '/student/timetable':
        return <StudentTimetable />;
      case '/assignments':
      case '/student/assignments':
        return <StudentAssignments />;
      case '/attendance':
      case '/student/attendance':
        return <StudentAttendance />;
      case '/messages':
      case '/student/messages':
        return <StudentMessages />;
      case '/notifications':
      case '/student/notifications':
        return <StudentNotifications />;
      case '/':
      case '/dashboard':
      case '/student':
      default:
        return <StudentDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-canvas-light)] flex flex-col antialiased">
      <ToastBanner />
      <ModernNavbar />

      <div className="w-full flex flex-1 items-stretch">
        <ModernSidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      <footer className="border-t border-[var(--color-canvas-border)] bg-[var(--color-canvas-card)] py-6 text-xs text-neutral-600">
        <div className="max-w-[1520px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
            <span className="font-bold text-[var(--color-brand-green)]">[ TRIPLE 4 CURRICULUM ]</span>
            <span>•</span>
            <span className="text-[var(--color-brand-black)] font-bold">TRIPLE 4C ACCREDITED</span>
            <span>•</span>
            <span>HIGHER EDUCATION & RESEARCH PARADIGM</span>
          </div>
          <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            SA-SAMS & DHET REGISTRY • POPIA ACT 4 // 2013 VERIFIED
          </p>
        </div>
      </footer>

      <AIFloatingChatbot />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
