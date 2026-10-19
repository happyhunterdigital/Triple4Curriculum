import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/authContext';
import { Navbar } from './components/Navbar';
import { AppSidebar } from './components/AppSidebar';
import { AIFloatingChatbot } from './components/ai/AIFloatingChatbot';
import { StudentTimetable } from './components/student/StudentTimetable';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentAttendance } from './components/student/StudentAttendance';
import { StudentMessages } from './components/student/StudentMessages';
import { StudentNotifications } from './components/student/StudentNotifications';
import { StudentLectures } from './components/student/StudentLectures';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { StudentHomeDashboard } from './components/dashboard/StudentHomeDashboard';
import { TeacherHomeDashboard } from './components/dashboard/TeacherHomeDashboard';
import { AdminHomeDashboard } from './components/dashboard/AdminHomeDashboard';
import { RequireAuth } from './components/RequireAuth';
import LegalDoc from './pages/LegalDoc';
import { NotFound } from './pages/NotFound';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { SiteFooter } from './components/site/SiteFooter';
import { CookieConsent } from './components/site/CookieConsent';
import { DashboardSkeleton } from './components/common/DashboardSkeleton';

// ── Phase 2 lazy role routes (named exports mapped to default for React.lazy) ──
const TeachDashboard = lazy(() => import('./components/lecturer/LecturerDashboard').then(m => ({ default: m.LecturerDashboard })));
const TeachGrading = lazy(() => import('./components/lecturer/LecturerGrading').then(m => ({ default: m.LecturerGrading })));
const TeachClasses = lazy(() => import('./components/lecturer/LecturerClasses').then(m => ({ default: m.LecturerClasses })));
const TeachAuthoring = lazy(() => import('./components/lecturer/LecturerAuthoring').then(m => ({ default: m.LecturerAuthoring })));
const TeachAttendance = lazy(() => import('./components/lecturer/LecturerAttendance').then(m => ({ default: m.LecturerAttendance })));
const LearnProgress = lazy(() => import('./components/lecturer/LearnerProgressDashboard').then(m => ({ default: m.LearnerProgressDashboard })));
const AdminUsers = lazy(() => import('./components/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminTimetable = lazy(() => import('./components/admin/AdminTimetable').then(m => ({ default: m.AdminTimetable })));
const AdminAnnouncements = lazy(() => import('./components/admin/AdminAnnouncements').then(m => ({ default: m.AdminAnnouncements })));
const AdminAudit = lazy(() => import('./components/admin/AdminAuditLogs').then(m => ({ default: m.AdminAuditLogs })));
const AdminReports = lazy(() => import('./components/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const CertificatesRoute = lazy(() => import('./components/student/CertificatesView').then(m => ({ default: m.CertificatesView })));
const ClassroomRoute = lazy(() => import('./components/learning/ClassroomWorkspace').then(m => ({ default: m.ClassroomWorkspace })));
const LiveRoute = lazy(() => import('./components/learning/LiveClassroom').then(m => ({ default: m.LiveClassroom })));

/** Lecturer dashboard adapter: bridges AppSidebar string-nav to the dashboard's onNavigate prop. */
function TeachDashboardRoute() {
  const navigate = useNavigate();
  return <TeachDashboard onNavigate={(r: string) => navigate(`/${String(r).replace(/^\//, '')}`)} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs overflow-hidden">
      {children}
    </div>
  );
}

function DashboardRouter() {
  // Role comes from Firebase Auth custom claims (via AuthProvider), matching
  // firestore.rules. No Firestore profile lookups decide what a user can see.
  const { currentUser, currentRole } = useAuth();

  if (currentRole === 'admin') return <AdminHomeDashboard />;
  if (currentRole === 'lecturer') return <TeacherHomeDashboard onNavigate={() => {}} />;
  if (currentUser) return <StudentHomeDashboard onNavigate={() => {}} />;
  // Guest fallback points to marketing home for consistency.
  return <HomePage />;
}

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentRoute = location.pathname.replace(/^\//, '') || 'dashboard';

  const handleNavigate = (route: string) => {
    const id = route.replace(/^\//, '');
    navigate(`/${id}`);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-canvas-soft)] flex flex-col antialiased overflow-x-hidden">
      <Navbar onToggleMenu={() => setMenuOpen((o) => !o)} menuOpen={menuOpen} />
      <div className="w-full flex flex-1 items-stretch overflow-hidden">
        <AppSidebar onNavigate={handleNavigate} currentRoute={currentRoute} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-canvas-soft)] p-3 xs:p-4 sm:p-5 md:p-6 lg:p-6 xl:p-8 gap-3 xs:gap-4 sm:gap-5 md:gap-6 min-w-0 max-w-full">
          <Suspense fallback={<DashboardSkeleton />}>
          <Routes>
            {/* Public marketing, PDF-aligned */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/onboarding" element={<Card><OnboardingFlow /></Card>} />
            <Route path="/privacy" element={<LegalDoc />} />
            <Route path="/terms" element={<LegalDoc />} />
            <Route path="/child-protection" element={<LegalDoc />} />
            <Route path="/lectures" element={<RequireAuth><Card><StudentLectures /></Card></RequireAuth>} />
            <Route path="/timetable" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentTimetable /></div></RequireAuth>} />
            <Route path="/assignments" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentAssignments /></div></RequireAuth>} />
            <Route path="/attendance" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentAttendance /></div></RequireAuth>} />
            <Route path="/discussions" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentMessages /></div></RequireAuth>} />
            <Route path="/notices" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentNotifications /></div></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth roles={['admin']}><AdminHomeDashboard /></RequireAuth>} />
            <Route path="/admin-dashboard" element={<RequireAuth roles={['admin']}><AdminHomeDashboard /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth roles={['admin']}><AdminUsers /></RequireAuth>} />
            <Route path="/admin/timetable" element={<RequireAuth roles={['admin']}><AdminTimetable /></RequireAuth>} />
            <Route path="/admin/announcements" element={<RequireAuth roles={['admin']}><AdminAnnouncements /></RequireAuth>} />
            <Route path="/admin/audit" element={<RequireAuth roles={['admin']}><AdminAudit /></RequireAuth>} />
            <Route path="/admin/reports" element={<RequireAuth roles={['admin']}><AdminReports /></RequireAuth>} />
            <Route path="/teach" element={<RequireAuth roles={['lecturer', 'admin']}><TeachDashboardRoute /></RequireAuth>} />
            <Route path="/teach/grading" element={<RequireAuth roles={['lecturer', 'admin']}><TeachGrading /></RequireAuth>} />
            <Route path="/teach/classes" element={<RequireAuth roles={['lecturer', 'admin']}><TeachClasses /></RequireAuth>} />
            <Route path="/teach/authoring" element={<RequireAuth roles={['lecturer', 'admin']}><TeachAuthoring /></RequireAuth>} />
            <Route path="/teach/attendance" element={<RequireAuth roles={['lecturer', 'admin']}><TeachAttendance /></RequireAuth>} />
            <Route path="/learn/progress" element={<RequireAuth><LearnProgress /></RequireAuth>} />
            <Route path="/certificates" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><CertificatesRoute /></div></RequireAuth>} />
            <Route path="/classroom" element={<RequireAuth><ClassroomRoute /></RequireAuth>} />
            <Route path="/live" element={<RequireAuth><LiveRoute /></RequireAuth>} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </div>
      </div>
      <SiteFooter />
      <CookieConsent />
      <AIFloatingChatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}
