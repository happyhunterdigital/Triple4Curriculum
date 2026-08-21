import React, { useState, useEffect } from 'react';
import { 
  Flame, Award, BookOpen, Clock, CheckCircle2, 
  ArrowRight, ShieldCheck, Zap, Sparkles,
  ChevronRight, Compass, FileText, Check, Layers,
  Shield, Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Course, TimetableSlot, Assignment, Badge } from '../../types';
import { AITutorDrawer } from '../ai/AITutorDrawer';
import { VirtualCampusModal } from '../campus/VirtualCampusModal';
import { DocumentViewerModal } from '../modals/DocumentViewerModal';
import { DashboardSkeleton } from '../common/DashboardSkeleton';
import { StudentAttendanceSummary } from './StudentAttendanceSummary';
import { StudentProgress } from './StudentProgress';
import { Hero } from '../Hero';
import { CurriculumRegister } from '../learning/CurriculumRegister';
import { CurriculumRegistry } from '../learning/CurriculumRegistry';
import { LectureReel } from '../learning/LectureReel';
import { WorkspaceToggle } from '../learning/WorkspaceToggle';

interface StudentDashboardProps {
  onNavigate: (route: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentUser, triggerToast } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View mode switcher: 'lms_portal' vs 'public_matrix'
  const [activePortalTab, setActivePortalTab] = useState<'lms_portal' | 'public_matrix'>('lms_portal');

  // Modals & Interactive Hubs
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState<string | undefined>();
  const [vrCampusOpen, setVrCampusOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, t, a, b] = await Promise.all([
          api.getCourses(),
          api.getTimetable(),
          api.getAssignments(),
          api.getBadges()
        ]);
        setCourses(c);
        setTimetable(t);
        setAssignments(a);
        setBadges(b);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCelebrateStreak = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#C59B27', '#006D44', '#111315']
    });
    triggerToast({
      id: `toast_${Date.now()}`,
      title: 'Active Study Streak Confirmed',
      message: `You are on a ${currentUser?.streakDays || 6}-Day active streak. +50 XP bonus applied.`,
      category: 'streak',
      timestamp: 'Just now',
      read: false,
      priority: 'high'
    });
  };

  const streakDays = currentUser?.streakDays || 6;
  const xp = currentUser?.xp || 2450;
  const currentLevel = currentUser?.level || 6;
  const nextLevelXp = currentLevel * 500;
  const currentLevelProgress = ((xp % 500) / 500) * 100;
  const xpRemaining = Math.max(50, 500 - (xp % 500));

  const upcomingClass = timetable.length > 0 ? timetable[0] : {
    id: 'ts_01',
    courseId: 'crs_cs441',
    courseCode: 'CSC-441',
    courseTitle: 'Distributed Systems & Cloud Computing',
    time: '10:00 - 11:30',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Lab B2-AI Cluster / WebRTC',
    lecturer: 'Dr. Arthur Vance',
    lecturerName: 'Dr. Arthur Vance',
    lecturerId: 'fac_01',
    dayOfWeek: 'Wednesday' as const,
    type: 'Lab' as const,
    departmentId: 'dept_cs'
  };

  const pendingAssignments = assignments.slice(0, 3);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header Architectural View Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 border border-neutral-300 rounded-none shadow-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePortalTab('lms_portal')}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase transition flex items-center gap-2 cursor-pointer rounded-none border ${
              activePortalTab === 'lms_portal'
                ? 'bg-deep-onyx text-white border-deep-onyx font-bold'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-deep-onyx'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Active Student Portal (LMS)</span>
          </button>

          <button
            onClick={() => setActivePortalTab('public_matrix')}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase transition flex items-center gap-2 cursor-pointer rounded-none border ${
              activePortalTab === 'public_matrix'
                ? 'bg-deep-onyx text-white border-deep-onyx font-bold'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-deep-onyx'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-achievement-gold" />
            <span>Accreditation & 4-4-4 Matrix</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-neutral-600 hidden md:inline uppercase tracking-wider">
            DHET REGISTRY: <strong className="text-deep-onyx font-bold">NQF-LEVEL 8</strong>
          </span>
          <button
            onClick={() => setSelectedDocId('doc_444_paradigm')}
            className="font-mono text-xs uppercase tracking-wider text-deep-onyx hover:underline flex items-center gap-1.5 cursor-pointer font-bold border-b border-transparent hover:border-deep-onyx pb-0.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-deep-onyx" />
            <span>Charter Dossier</span>
            <span className="font-mono">→</span>
          </button>
        </div>
      </div>

      {activePortalTab === 'lms_portal' ? (
        <>
          {/* ========================================================================= */}
          {/* 1. CINEMATIC WIDESCREEN 21:9 MEDIA VAULT & ASYMMETRICAL EDITORIAL HERO */}
          {/* ========================================================================= */}
          <Hero />

          {/* ========================================================================= */}
          {/* 2. REFINED ASYMMETRIC 60/40 SPLIT WITH UNYIELDING VERTICAL LAYOUT LINE */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 border border-neutral-300 bg-white rounded-none shadow-none items-stretch">
            
            {/* Left 60% (Span 7): Deep Editorial Text with Massive Padding & Anchored Line */}
            <div className="lg:col-span-7 py-16 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-14 flex flex-col justify-between">
              
              <div className="border-l-2 border-deep-onyx pl-6 sm:pl-8 space-y-6">
                
                {/* Monospace Editorial Eyebrow */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    [ DISPATCH // DEAN'S SCHOLASTIC REPORT ]
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-deep-onyx border border-neutral-300">
                    TERM 3 • 2026
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-deep-onyx text-white">
                    NQF LEVEL 8
                  </span>
                </div>

                {/* High-Contrast Serif Headline */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-deep-onyx tracking-tight leading-tight max-w-xl">
                  The Architecture of Empirical Inquiry & Distributed Rigour
                </h1>

                {/* Deep Editorial Discourse */}
                <div className="space-y-4 text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans max-w-xl">
                  <p>
                    Under the Triple 4 Curriculum (444 Matrix), higher education transcends rote test metrics. Academic tenure is anchored in verifiable mathematical proofs, distributed state consensus, and statutory governance under the Higher Education Act.
                  </p>
                  <p className="text-neutral-600">
                    Candidate <strong className="text-deep-onyx">{currentUser?.name || 'Sarah Ndlovu'}</strong> is currently engaged in advanced honours research across <strong className="text-deep-onyx">{currentUser?.departmentName || 'Department of Computing & Applied AI'}</strong>, maintaining exemplary Senate standing in distributed systems and algorithmic ethics.
                  </p>
                </div>

                {/* Academic Standing Summary */}
                <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono">
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase tracking-widest">HONOURS CANDIDATE</span>
                    <span className="text-deep-onyx font-bold">{currentUser?.name || 'Sarah Ndlovu'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase tracking-widest">CUMULATIVE GPA</span>
                    <span className="text-deep-onyx font-bold">3.88 / 4.00</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[9px] uppercase tracking-widest">SENATE HONOURS</span>
                    <span className="text-deep-onyx font-bold">DEAN'S LIST</span>
                  </div>
                </div>

                {/* Raw Text-Based Interactive Anchor (Anti SaaS Slop) */}
                <div className="pt-4 flex flex-wrap items-center gap-6">
                  <button
                    onClick={() => onNavigate('/student/lectures')}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-deep-onyx hover:underline border-b border-transparent hover:border-deep-onyx pb-0.5 cursor-pointer group"
                  >
                    <span>Enter Lecture Hall & Syllabus Matrix</span>
                    <span className="font-mono text-sm transition-transform group-hover:translate-x-1">→</span>
                  </button>

                  <button
                    onClick={() => setSelectedDocId('doc_444_paradigm')}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-600 hover:text-deep-onyx hover:underline border-b border-transparent hover:border-deep-onyx pb-0.5 cursor-pointer group"
                  >
                    <span>Inspect Honours Blueprint</span>
                    <span className="font-mono text-sm transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>

              </div>

              {/* Bottom Layout Line Footnote */}
              <div className="pt-10 text-[10px] font-mono text-neutral-400 uppercase tracking-widest border-t border-neutral-200 mt-10 flex items-center justify-between">
                <span>TRIPLE 4C ACCREDITED PORTAL</span>
                <span>SA-SAMS VERIFIED • 2026</span>
              </div>

            </div>

            {/* Right 40% (Span 5): Stark Monospace Syllabus Metadata Column */}
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-neutral-300 bg-[#FAF9F5] p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
              
              <div className="space-y-6">
                
                <div className="border-b border-neutral-300 pb-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-deep-onyx">
                    [ SYLLABUS DISCIPLINE // CS-441-2026 ]
                  </span>
                  <span className="w-2 h-2 bg-academic-green" />
                </div>

                {/* Monospace Metadata Table */}
                <div className="space-y-3.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest divide-y divide-neutral-200">
                  
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">CURRICULUM:</span>
                    <span className="text-deep-onyx font-bold">TRIPLE 4C MATRIX</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">QUALIFICATION:</span>
                    <span className="text-deep-onyx font-bold">BSC (HONS) COMPUTING</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">ACCREDITATION:</span>
                    <span className="text-deep-onyx font-bold">CHE // NQF LEVEL 8</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">STATUTORY BODY:</span>
                    <span className="text-deep-onyx">SA-SAMS STATUTORY REGISTER</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">PRIVACY PROTOCOL:</span>
                    <span className="text-deep-onyx">POPIA ACT 4 [VERIFIED]</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">ACTIVE THESIS:</span>
                    <span className="text-deep-onyx">RAFT CONSENSUS SAFETY</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">SENATE STANDING:</span>
                    <span className="text-achievement-gold font-bold">TOP 5% (HONOURS)</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">ATTENDANCE LOG:</span>
                    <span className="text-deep-onyx font-bold">96.4% BIOMETRIC</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">SCHOLAR TELEMETRY:</span>
                    <span className="text-deep-onyx font-bold">LVL {currentLevel} ({xp} XP)</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-500">NEXT EXAMINATION:</span>
                    <span className="text-rose-700 font-bold">14 OCT 2026</span>
                  </div>

                </div>

                {/* Habit Streak Action - Solid White Block CTA */}
                <div 
                  onClick={handleCelebrateStreak}
                  className="mt-6 p-4 bg-white border border-neutral-300 hover:border-deep-onyx transition cursor-pointer flex items-center justify-between group rounded-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-100 border border-neutral-300 text-deep-onyx flex items-center justify-center font-mono text-xs">
                      <Flame className="w-4 h-4 text-achievement-gold" />
                    </div>
                    <div>
                      <div className="text-xs font-serif font-bold text-deep-onyx">{streakDays}-Day Active Study Streak</div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">Click to record daily check-in</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-deep-onyx group-hover:translate-x-1 transition-transform">→</span>
                </div>

              </div>

              {/* Metadata Column Footer */}
              <div className="pt-6 border-t border-neutral-300 flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                <span>SENATE REGISTER // NO. 444-8821</span>
                <span>STATUS: ACTIVE</span>
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* CURRICULUM REGISTRY // RAW ACADEMIC LEDGER 3-COLUMN LAYOUT */}
          {/* ========================================================================= */}
          <CurriculumRegistry />

          {/* ========================================================================= */}
          {/* DEMONSTRATING LEARNING ENVIRONMENT: THE LECTURE REEL */}
          {/* ========================================================================= */}
          <LectureReel />

          {/* ========================================================================= */}
          {/* DEMONSTRATING LEARNING ENVIRONMENT: THE WORKSPACE TOGGLE */}
          {/* ========================================================================= */}
          <WorkspaceToggle />

          {/* ========================================================================= */}
          {/* SA-SAMS STATUTORY ATTENDANCE MODULE */}
          {/* ========================================================================= */}
          <StudentAttendanceSummary 
            upcomingSession={upcomingClass}
            onNavigateToAttendance={() => onNavigate('/student/attendance')}
          />

          {/* ========================================================================= */}
          {/* ACADEMIC PERFORMANCE & MASTERY PROGRESS (RECHARTS + BADGES) */}
          {/* ========================================================================= */}
          <StudentProgress 
            courses={courses}
            badges={badges}
            onNavigateToCourse={(courseId) => onNavigate('/student/lectures')}
          />

          {/* ========================================================================= */}
          {/* STRUCTURAL 3-COLUMN EDITORIAL HUBS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Hub 1: 444 AI Academic Copilot */}
            <div className="bg-white border border-neutral-300 rounded-none shadow-none flex flex-col justify-between">
              <div>
                <div className="p-3 border-b border-neutral-300 bg-[#FAF9F5] flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                    [ AI // SYLLABUS COPILOT ]
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-deep-onyx" />
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-serif font-bold text-deep-onyx">
                    Academic AI Copilot
                  </h3>
                  <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                    Trained on accredited syllabi. Instant step-by-step mathematical proofs, code review, and rubric breakdowns.
                  </p>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        setAiTopic('Raft Distributed Consensus and Heartbeat Terms');
                        setAiTutorOpen(true);
                      }}
                      className="w-full text-left p-2.5 bg-[#FAF9F5] hover:bg-neutral-100 border border-neutral-300 text-xs font-mono text-deep-onyx flex items-center justify-between transition cursor-pointer rounded-none"
                    >
                      <span className="truncate">Raft Consensus Proof</span>
                      <span className="font-mono text-xs text-deep-onyx ml-2">→</span>
                    </button>

                    <button
                      onClick={() => {
                        setAiTopic('POPIA Act Telemetry and Student Data Privacy');
                        setAiTutorOpen(true);
                      }}
                      className="w-full text-left p-2.5 bg-[#FAF9F5] hover:bg-neutral-100 border border-neutral-300 text-xs font-mono text-deep-onyx flex items-center justify-between transition cursor-pointer rounded-none"
                    >
                      <span className="truncate">POPIA Data Ethics Standard</span>
                      <span className="font-mono text-xs text-deep-onyx ml-2">→</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-300 bg-[#FAF9F5]">
                <button
                  onClick={() => {
                    setAiTopic(undefined);
                    setAiTutorOpen(true);
                  }}
                  className="w-full py-2.5 bg-deep-onyx hover:bg-black text-white font-mono text-xs uppercase tracking-wider flex items-center justify-between px-4 transition cursor-pointer rounded-none border border-deep-onyx"
                >
                  <span className="flex items-center gap-2">
                    <img 
                      src="https://res.cloudinary.com/dka0498ns/image/upload/v1787326034/Triple_4_Curriculum_chabot_Icon_n2qrgg.png"
                      alt="AI"
                      className="w-4 h-4 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span>Launch Tutor Console</span>
                  </span>
                  <span className="font-mono">→</span>
                </button>
              </div>
            </div>

            {/* Hub 2: Assignments & SpeedGrader Review Queue */}
            <div className="bg-white border border-neutral-300 rounded-none shadow-none flex flex-col justify-between">
              <div>
                <div className="p-3 border-b border-neutral-300 bg-[#FAF9F5] flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                    [ WORK // ACTIVE SUBMISSIONS ]
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-neutral-100 text-deep-onyx border border-neutral-300">
                    {pendingAssignments.length} PENDING
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-serif font-bold text-deep-onyx">
                    Milestone Submissions
                  </h3>
                  <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                    Evaluated through SpeedGrader™ rubrics with automated SA-SAMS statutory transcript synchronization.
                  </p>

                  <div className="space-y-1.5 pt-2">
                    {pendingAssignments.map(a => (
                      <div 
                        key={a.id}
                        onClick={() => onNavigate('/student/assignments')}
                        className="p-2.5 bg-[#FAF9F5] hover:bg-neutral-100 border border-neutral-300 cursor-pointer transition flex items-center justify-between text-xs rounded-none"
                      >
                        <div className="truncate pr-2">
                          <p className="font-serif font-bold text-deep-onyx truncate">{a.title}</p>
                          <p className="text-[10px] font-mono text-neutral-500">{a.courseCode} • Due {a.dueDate}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-deep-onyx whitespace-nowrap">
                          {a.maxPoints} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-300 bg-[#FAF9F5]">
                <button
                  onClick={() => onNavigate('/student/assignments')}
                  className="w-full py-2.5 bg-white hover:bg-neutral-100 text-deep-onyx font-mono text-xs uppercase tracking-wider flex items-center justify-between px-4 transition cursor-pointer rounded-none border border-neutral-300"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Submit Work Dossier</span>
                  </span>
                  <span className="font-mono">→</span>
                </button>
              </div>
            </div>

            {/* Hub 3: 3D Virtual Campus Blueprint */}
            <div className="bg-white border border-neutral-300 rounded-none shadow-none flex flex-col justify-between">
              <div>
                <div className="p-3 border-b border-neutral-300 bg-[#FAF9F5] flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                    [ INFRASTRUCTURE // VIRTUAL LABS ]
                  </span>
                  <Compass className="w-3.5 h-3.5 text-deep-onyx" />
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-serif font-bold text-deep-onyx">
                    Virtual Campus Twin
                  </h3>
                  <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                    Interactive simulation labs: Computing AI Cluster, Great Senate Hall, and Health Simulation Ward.
                  </p>

                  <div className="border border-neutral-300 overflow-hidden relative h-24 group cursor-pointer rounded-none" onClick={() => setVrCampusOpen(true)}>
                    <img 
                      src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80" 
                      alt="Virtual Campus" 
                      className="w-full h-full object-cover rounded-none grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="px-3 py-1 bg-deep-onyx text-white font-mono text-[10px] uppercase tracking-wider border border-white/30 rounded-none flex items-center gap-1.5">
                        <Compass className="w-3 h-3 text-achievement-gold" />
                        <span>Explore 3D Blueprint</span>
                        <span className="font-mono">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-300 bg-[#FAF9F5]">
                <button
                  onClick={() => setVrCampusOpen(true)}
                  className="w-full py-2.5 bg-white hover:bg-neutral-100 text-deep-onyx font-mono text-xs uppercase tracking-wider flex items-center justify-between px-4 transition cursor-pointer rounded-none border border-neutral-300"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-deep-onyx" />
                    <span>Inspect Campus Map</span>
                  </span>
                  <span className="font-mono">→</span>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* ENROLLED DEGREE MODULES (GRID WITH CRISP BLUEPRINT BORDERS) */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-300 pb-3">
              <div>
                <h2 className="text-2xl font-serif font-bold text-deep-onyx">
                  Enrolled Degree Modules
                </h2>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mt-0.5">
                  Academic Progress, Lecture Attendance & SA-SAMS Credits
                </p>
              </div>

              <button
                onClick={() => onNavigate('/student/lectures')}
                className="text-xs font-mono uppercase tracking-wider text-deep-onyx hover:underline flex items-center gap-1 cursor-pointer font-bold border-b border-transparent hover:border-deep-onyx pb-0.5"
              >
                <span>Full Syllabus Index</span>
                <span className="font-mono">→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div 
                  key={course.id}
                  className="bg-white border border-neutral-300 rounded-none shadow-none flex flex-col justify-between group"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-neutral-100 text-deep-onyx border border-neutral-300 rounded-none">
                        {course.code}
                      </span>
                      <span className="text-xs font-mono text-neutral-600">
                        {course.credits} Credits
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-deep-onyx group-hover:underline transition leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed font-sans">
                      {course.description}
                    </p>
                  </div>

                  <div className="p-4 border-t border-neutral-300 bg-[#FAF9F5] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-700">
                      <span>MODULE MASTERY</span>
                      <span className="text-deep-onyx font-bold">{course.progressPercent || 68}%</span>
                    </div>

                    <div className="w-full bg-neutral-200 h-1.5 rounded-none overflow-hidden">
                      <div 
                        className="bg-deep-onyx h-full rounded-none"
                        style={{ width: `${course.progressPercent || 68}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-2 border-t border-neutral-200 mt-2">
                      <span>FACULTY: <strong className="text-deep-onyx">{course.lecturerName}</strong></span>
                      <button
                        onClick={() => onNavigate('/student/lectures')}
                        className="font-mono text-xs uppercase tracking-wider text-deep-onyx hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Enter</span>
                        <span className="font-mono">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* SPLIT-SCREEN ACCREDITATION & 444 PARADIGM MATRIX */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Sticky Anchor Information */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 bg-white p-6 sm:p-8 border border-neutral-300 rounded-none shadow-none">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-deep-onyx text-white border border-deep-onyx text-[10px] font-mono uppercase tracking-widest rounded-none">
                <ShieldCheck className="w-3.5 h-3.5 text-achievement-gold" />
                DHET & SA-SAMS ACCREDITED
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-deep-onyx leading-tight">
                The Triple 4 Curriculum (444 Matrix)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
                Engineered for higher education institutions, integrating 4 Pillars of Character, 4 Core Cognitive Competencies, and 4 Applied Industry Modules per academic term.
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F5] border border-neutral-300 space-y-3">
              <h4 className="text-xs font-mono font-bold text-deep-onyx uppercase tracking-wider">
                Institutional Core Directives
              </h4>
              <div className="space-y-2 text-xs text-neutral-800 font-sans">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-academic-green flex-shrink-0 mt-0.5" />
                  <span>Real-time statutory sync with SA-SAMS & Department of Higher Education</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-academic-green flex-shrink-0 mt-0.5" />
                  <span>Full POPIA Act 4 of 2013 data protection with audited consent telemetry</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-academic-green flex-shrink-0 mt-0.5" />
                  <span>SpeedGrader™ automated rubrics and contextual Gemini AI tutoring</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setSelectedDocId('doc_444_paradigm')}
                className="w-full py-3 bg-deep-onyx hover:bg-black text-white font-mono text-xs uppercase tracking-wider transition flex items-center justify-between px-5 cursor-pointer rounded-none border border-deep-onyx"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-achievement-gold" />
                  <span>Read Official 444 Framework</span>
                </span>
                <span className="font-mono">→</span>
              </button>

              <button
                onClick={() => setSelectedDocId('doc_sasams_2026')}
                className="w-full py-2.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-deep-onyx font-mono text-xs uppercase tracking-wider transition flex items-center justify-between px-5 cursor-pointer rounded-none"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-deep-onyx" />
                  <span>SA-SAMS Audit Manual</span>
                </span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>

          {/* Right Column: Asymmetric Scrolling Rich Media & Degrees */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Rich Media Block 1: Character & Competency Pillars */}
            <div className="p-6 sm:p-8 bg-white border border-neutral-300 rounded-none shadow-none space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-deep-onyx font-bold">
                [ ARCHITECTURE // CORE PILLARS ]
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-deep-onyx">
                4 Character Pillars & 4 Applied Competencies
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
                Traditional education measures only rote test scores. The Triple 4 Curriculum balances intellectual mastery with ethical resilience, digital citizenship, and hands-on laboratory simulation.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-[#FAF9F5] border border-neutral-300 text-xs">
                  <p className="font-serif font-bold text-deep-onyx">1. Intellectual Integrity</p>
                  <p className="text-[11px] text-neutral-600 mt-1 font-sans">Rigorous algorithmic verification & citation.</p>
                </div>
                <div className="p-3.5 bg-[#FAF9F5] border border-neutral-300 text-xs">
                  <p className="font-serif font-bold text-deep-onyx">2. Digital Citizenship</p>
                  <p className="text-[11px] text-neutral-600 mt-1 font-sans">Responsible AI usage & POPIA privacy.</p>
                </div>
                <div className="p-3.5 bg-[#FAF9F5] border border-neutral-300 text-xs">
                  <p className="font-serif font-bold text-deep-onyx">3. Systems Modeling</p>
                  <p className="text-[11px] text-neutral-600 mt-1 font-sans">Scalable cloud and distributed architecture.</p>
                </div>
                <div className="p-3.5 bg-[#FAF9F5] border border-neutral-300 text-xs">
                  <p className="font-serif font-bold text-deep-onyx">4. Applied Ethics</p>
                  <p className="text-[11px] text-neutral-600 mt-1 font-sans">Algorithmic fairness across African contexts.</p>
                </div>
              </div>
            </div>

            {/* Rich Media Block 2: Department Program Showcases */}
            <div className="p-6 sm:p-8 bg-white border border-neutral-300 rounded-none shadow-none space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-deep-onyx font-bold">
                [ FACULTIES // DEGREE TRACKS ]
              </span>
              <h3 className="text-xl font-serif font-bold text-deep-onyx">
                Undergraduate & Postgraduate Degree Tracks
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-[#FAF9F5] border border-neutral-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-serif font-bold text-deep-onyx">BSc in Distributed AI & Systems Engineering</h4>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-deep-onyx text-white rounded-none">NQF LEVEL 8</span>
                  </div>
                  <p className="text-xs text-neutral-600 font-sans">
                    Comprehensive study of distributed consensus (Raft/Paxos), GPU neural acceleration, cloud telemetry, and cybersecurity.
                  </p>
                </div>

                <div className="p-4 bg-[#FAF9F5] border border-neutral-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-serif font-bold text-deep-onyx">BCom in Digital Business, FinTech & POPIA Governance</h4>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-deep-onyx text-white rounded-none">NQF LEVEL 8</span>
                  </div>
                  <p className="text-xs text-neutral-600 font-sans">
                    Modern financial systems, blockchain ledgers, statutory data compliance, and enterprise cloud architecture.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Global Modals */}
      <AITutorDrawer
        isOpen={aiTutorOpen}
        onClose={() => setAiTutorOpen(false)}
        initialTopic={aiTopic}
      />

      <VirtualCampusModal
        isOpen={vrCampusOpen}
        onClose={() => setVrCampusOpen(false)}
      />

      <DocumentViewerModal
        documentId={selectedDocId}
        onClose={() => setSelectedDocId(null)}
      />

    </div>
  );
};
