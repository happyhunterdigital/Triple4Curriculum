import React, { useState, useEffect } from 'react';
import { AuthProvider } from './lib/authContext';
import { ModernNavbar } from './components/ModernNavbar';
import { ModernSidebar } from './components/ModernSidebar';
import { BrandedHero } from './components/BrandedHero';
import { MarqueeScroller } from './components/MarqueeScroller';
import { ClassroomWorkspace } from './components/learning/ClassroomWorkspace';
import { AssignmentLedger } from './components/AssignmentLedger';
import { AIFloatingChatbot } from './components/ai/AIFloatingChatbot';
import { StudentTimetable } from './components/student/StudentTimetable';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentAttendance } from './components/student/StudentAttendance';
import { StudentMessages } from './components/student/StudentMessages';
import { StudentNotifications } from './components/student/StudentNotifications';
import { StudentLectures } from './components/student/StudentLectures';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

function AppInner() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const p = window.location.pathname.replace(/^\//, '');
    return p || 'dashboard';
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      const p = window.location.pathname.replace(/^\//, '');
      setCurrentRoute(p || 'dashboard');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (route: string) => {
    const id = route.replace(/^\//, '');
    setCurrentRoute(id);
    window.history.pushState({}, '', `/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    if (currentRoute === 'onboarding') {
      return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs overflow-hidden"><OnboardingFlow /></div>;
    }
    switch (currentRoute) {
      case 'lectures': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs overflow-hidden"><StudentLectures /></div>;
      case 'timetable': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs p-3 xs:p-4 sm:p-6 lg:p-8 overflow-hidden"><StudentTimetable /></div>;
      case 'assignments': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs p-3 xs:p-4 sm:p-6 lg:p-8 overflow-hidden"><StudentAssignments /></div>;
      case 'attendance': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs p-3 xs:p-4 sm:p-6 lg:p-8 overflow-hidden"><StudentAttendance /></div>;
      case 'discussions': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs p-3 xs:p-4 sm:p-6 lg:p-8 overflow-hidden"><StudentMessages /></div>;
      case 'notices': return <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs p-3 xs:p-4 sm:p-6 lg:p-8 overflow-hidden"><StudentNotifications /></div>;
      default:
        return (
          <>
            <BrandedHero />
            <MarqueeScroller />
            <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs overflow-hidden">
              <ClassroomWorkspace />
            </div>
            <div className="mt-3 xs:mt-4 sm:mt-6 bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs p-3 xs:p-4 sm:p-6 lg:p-8 overflow-hidden">
              <AssignmentLedger />
            </div>
          </>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-canvas-soft)] flex flex-col antialiased overflow-x-hidden">
      <ModernNavbar onToggleMenu={() => setMenuOpen(o => !o)} menuOpen={menuOpen} />
      {/* Layout: stacked on mobile/tablet portrait, split on tablet landscape+ */}
      <div className="w-full flex flex-1 items-stretch overflow-hidden">
        <ModernSidebar onNavigate={handleNavigate} currentRoute={currentRoute} open={menuOpen} onClose={() => setMenuOpen(false)} />
        {/* Main viewport: responsive padding & gap across 6 breakpoints */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-canvas-soft)] p-3 xs:p-4 sm:p-5 md:p-6 lg:p-6 xl:p-8 gap-3 xs:gap-4 sm:gap-5 md:gap-6 min-w-0 max-w-full">
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
