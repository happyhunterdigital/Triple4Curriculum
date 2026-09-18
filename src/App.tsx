import React, { useState, useEffect } from 'react';
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
import { Privacy } from './pages/Privacy';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { CurriculumPage } from './pages/CurriculumPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { SiteFooter } from './components/site/SiteFooter';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--color-t4c-black)]/10 rounded-lg sm:rounded-xl shadow-xs overflow-hidden">
      {children}
    </div>
  );
}

function DashboardRouter() {
  const { currentUser } = useAuth();
  const [fbRole, setFbRole] = useState<'learner' | 'teacher' | 'admin' | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setFbRole(null); return; }
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setFbRole(snap.data().role as 'learner' | 'teacher' | 'admin');
        else {
          const s = await getDoc(doc(db, 'students', u.uid));
          if (s.exists()) setFbRole('learner');
          else {
            const t = await getDoc(doc(db, 'teachers', u.uid));
            if (t.exists()) setFbRole('teacher');
          }
        }
      } catch {}
    });
    return () => unsub();
  }, []);

  const role = fbRole || (currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'lecturer' ? 'teacher' : currentUser?.role === 'student' ? 'learner' : null);
  if (role === 'admin') return <AdminHomeDashboard />;
  if (role === 'teacher') return <TeacherHomeDashboard onNavigate={() => {}} />;
  if (role === 'learner' && currentUser) return <StudentHomeDashboard onNavigate={() => {}} />;
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
          <Routes>
            {/* Public marketing — PDF-aligned */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/onboarding" element={<Card><OnboardingFlow /></Card>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/lectures" element={<RequireAuth><Card><StudentLectures /></Card></RequireAuth>} />
            <Route path="/timetable" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentTimetable /></div></RequireAuth>} />
            <Route path="/assignments" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentAssignments /></div></RequireAuth>} />
            <Route path="/attendance" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentAttendance /></div></RequireAuth>} />
            <Route path="/discussions" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentMessages /></div></RequireAuth>} />
            <Route path="/notices" element={<RequireAuth><div className="bg-white border rounded-xl p-4 sm:p-6"><StudentNotifications /></div></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth roles={['admin']}><AdminHomeDashboard /></RequireAuth>} />
            <Route path="/admin-dashboard" element={<RequireAuth roles={['admin']}><AdminHomeDashboard /></RequireAuth>} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route
              path="*"
              element={
                <div className="bg-white border rounded-xl p-8 text-center" role="alert">
                  <h1 className="text-lg font-bold">Page not found</h1>
                  <p className="text-sm mt-1">The route “{location.pathname}” does not exist.</p>
                  <button className="underline mt-3 text-sm" onClick={() => navigate('/dashboard')}>
                    Back to dashboard
                  </button>
                </div>
              }
            />
          </Routes>
        </div>
      </div>
      <SiteFooter />
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
