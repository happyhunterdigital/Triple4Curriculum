import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync with browser history and handle popstate for multi-page architecture
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
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Adjust default route when switching roles if route doesn't match current role
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
    // Admin Routes
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

    // Lecturer Routes
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

    // Student Routes
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
    <div className="min-h-screen bg-[#FAF9F5] text-deep-onyx flex flex-col font-sans selection:bg-achievement-gold selection:text-deep-onyx">
      
      {/* Toast Notification Stream */}
      <ToastBanner />

      {/* Global Header */}
      <Header 
        currentRoute={currentRoute}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} 
        onNavigate={handleNavigate}
      />

      {/* Main Workspace with Structural 1px Blueprint Grid lines */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1520px] mx-auto pl-3 pr-3 sm:pl-8 sm:pr-4 lg:pl-12 lg:pr-6 py-6 gap-6">
        
        {/* Navigation Sidebar */}
        <Sidebar 
          currentRoute={currentRoute} 
          onNavigate={handleNavigate} 
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Dynamic Route Content Area with Architectural Asymmetric Editorial Padding */}
        <main className="flex-1 min-w-0">
          {renderCurrentView()}
        </main>

      </div>

      {/* Institutional Blueprint Footer */}
      <footer className="border-t border-neutral-300 bg-white py-6 text-xs text-neutral-600">
        <div className="max-w-[1520px] mx-auto pl-4 pr-3 sm:pl-8 sm:pr-6 lg:pl-12 lg:pr-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
            <span className="font-bold text-academic-green">[ TRIPLE 4 CURRICULUM ]</span>
            <span>•</span>
            <span className="text-deep-onyx font-bold">TRIPLE 4C ACCREDITED</span>
            <span>•</span>
            <span>HIGHER EDUCATION & RESEARCH PARADIGM</span>
          </div>
          <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
            SA-SAMS & DHET REGISTRY • POPIA ACT 4 // 2013 VERIFIED
          </p>
        </div>
      </footer>

      {/* Floating AI Study Copilot Action Button */}
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
