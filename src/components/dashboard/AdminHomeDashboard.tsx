import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  BookOpen,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Search,
  Shield,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { BentoCard, BentoGrid, BentoPill } from '../ui/Bento';

type UserRole = 'teacher' | 'learner';

interface BaseProfile {
  id: string; name: string; avatar: string; email: string; phone: string; location: string; joinDate: string;
  status: 'Active' | 'On Leave' | 'Probation' | 'Suspended';
}
interface TeacherProfile extends BaseProfile {
  role: 'teacher'; department: string; coursesCount: number; rating: number; gradingTurnaround: string; salary: string;
  courses: Array<{ id: string; name: string; students: number; averageGrade: string }>;
  recentLogs: Array<{ id: string; action: string; time: string }>;
}
interface LearnerProfile extends BaseProfile {
  role: 'learner'; major: string; gpa: number; attendance: string; creditsEarned: number; outstandingBalance: string;
  courses: Array<{ id: string; name: string; progress: number; currentGrade: string }>;
  recentLogs: Array<{ id: string; action: string; time: string }>;
}
type Profile = TeacherProfile | LearnerProfile;

const MOCK_TEACHERS: TeacherProfile[] = [
  { id: 'T-101', role: 'teacher', name: 'Dr. Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?img=5', email: 's.jenkins@academy.edu', phone: '+1 (555) 234-5678', location: 'Boston, MA', joinDate: 'Aug 2021', status: 'Active', department: 'Computer Science', coursesCount: 3, rating: 4.9, gradingTurnaround: '1.4 Days', salary: '$92,000/yr', courses: [{ id: 'CS-101', name: 'Introduction to React & TypeScript', students: 142, averageGrade: 'A-' }, { id: 'CS-302', name: 'Advanced Data Structures', students: 64, averageGrade: 'B+' }, { id: 'CS-499', name: 'Senior Capstone Mentor', students: 12, averageGrade: 'A' }], recentLogs: [{ id: 'l1', action: 'Published Final Exam Grades for CS-101', time: '2 hours ago' }, { id: 'l2', action: 'Updated Syllabus Document for CS-302', time: 'Yesterday' }, { id: 'l3', action: 'Requested Leave for Medical Checkup', time: '3 days ago' }] },
  { id: 'T-102', role: 'teacher', name: 'Prof. Marcus Vance', avatar: 'https://i.pravatar.cc/150?img=12', email: 'm.vance@academy.edu', phone: '+1 (555) 876-5432', location: 'Cambridge, MA', joinDate: 'Jan 2019', status: 'Active', department: 'Mathematics & Analytics', coursesCount: 2, rating: 4.6, gradingTurnaround: '2.1 Days', salary: '$98,500/yr', courses: [{ id: 'MATH-201', name: 'Linear Algebra & Matrices', students: 95, averageGrade: 'B' }, { id: 'DATA-501', name: 'Statistical Foundations', students: 48, averageGrade: 'A-' }], recentLogs: [{ id: 'l4', action: 'Scheduled Live Office Hours via Zoom', time: '5 hours ago' }, { id: 'l5', action: 'Uploaded Week 6 Homework Assignment', time: '2 days ago' }] },
  { id: 'T-103', role: 'teacher', name: 'Elena Rostova', avatar: 'https://i.pravatar.cc/150?img=9', email: 'e.rostova@academy.edu', phone: '+1 (555) 432-1098', location: 'Providence, RI', joinDate: 'Sep 2023', status: 'On Leave', department: 'Digital Arts & Design', coursesCount: 1, rating: 4.8, gradingTurnaround: '1.1 Days', salary: '$78,000/yr', courses: [{ id: 'ART-105', name: 'UX/UI Foundations & Prototyping', students: 110, averageGrade: 'A-' }], recentLogs: [{ id: 'l6', action: 'Marked Cohort 2 Assignments as Reviewed', time: '4 days ago' }, { id: 'l7', action: 'Status toggled to Out of Office / Leave', time: '5 days ago' }] },
];

const MOCK_LEARNERS: LearnerProfile[] = [
  { id: 'L-501', role: 'learner', name: 'Amara Okafor', avatar: 'https://i.pravatar.cc/150?img=8', email: 'amara.ok@student.edu', phone: '+1 (555) 901-2345', location: 'Boston, MA', joinDate: 'Sep 2022', status: 'Active', major: 'Software Engineering', gpa: 3.92, attendance: '98.4%', creditsEarned: 74, outstandingBalance: '$0.00', courses: [{ id: 'CS-101', name: 'Introduction to React & TypeScript', progress: 85, currentGrade: 'A' }, { id: 'MATH-201', name: 'Linear Algebra & Matrices', progress: 92, currentGrade: 'A-' }, { id: 'ART-105', name: 'UX/UI Foundations & Prototyping', progress: 70, currentGrade: 'B+' }], recentLogs: [{ id: 'l10', action: 'Submitted Assignment: Milestone 3 Prototype', time: '1 hour ago' }, { id: 'l11', action: 'Passed Quiz: Matrix Operations (94%)', time: 'Yesterday' }, { id: 'l12', action: 'Logged into Student Dashboard via Mobile', time: '2 days ago' }] },
  { id: 'L-502', role: 'learner', name: 'Devon Miller', avatar: 'https://i.pravatar.cc/150?img=15', email: 'd.miller@student.edu', phone: '+1 (555) 345-6789', location: 'Quincy, MA', joinDate: 'Jan 2023', status: 'Probation', major: 'Data Science & Machine Learning', gpa: 2.45, attendance: '81.2%', creditsEarned: 42, outstandingBalance: '$1,250.00', courses: [{ id: 'CS-101', name: 'Introduction to React & TypeScript', progress: 42, currentGrade: 'C-' }, { id: 'DATA-501', name: 'Statistical Foundations', progress: 55, currentGrade: 'C+' }], recentLogs: [{ id: 'l13', action: 'Missed Live Lecture: Data Structures Lab', time: 'Yesterday' }, { id: 'l14', action: 'Automated Academic Flag Issued: Low Quiz Average', time: '3 days ago' }, { id: 'l15', action: 'Payment Reminder Notification Dispatched', time: '4 days ago' }] },
  { id: 'L-503', role: 'learner', name: 'Yuki Tanaka', avatar: 'https://i.pravatar.cc/150?img=22', email: 'y.tanaka@student.edu', phone: '+1 (555) 678-9012', location: 'Newton, MA', joinDate: 'Sep 2022', status: 'Active', major: 'Interactive Media Track', gpa: 3.78, attendance: '96.8%', creditsEarned: 80, outstandingBalance: '$0.00', courses: [{ id: 'CS-101', name: 'Introduction to React & TypeScript', progress: 95, currentGrade: 'A' }, { id: 'ART-105', name: 'UX/UI Foundations & Prototyping', progress: 91, currentGrade: 'A' }], recentLogs: [{ id: 'l16', action: 'Completed Capstone Proposal Submission', time: '3 hours ago' }, { id: 'l17', action: 'Unlocked Achievement: Semester High-Engagement', time: '5 days ago' }] },
];

const QUICK_LINKS = [
  { label: 'Users', route: 'admin/users' },
  { label: 'Timetable', route: 'admin/timetable' },
  { label: 'Announcements', route: 'admin/announcements' },
  { label: 'Reports', route: 'admin/reports' },
];

export const AdminHomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const go = (route: string) => navigate(`/${route.replace(/^\//, '')}`);
  const [activeTab, setActiveTab] = useState<UserRole>('teacher');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    const base = activeTab === 'teacher' ? MOCK_TEACHERS : MOCK_LEARNERS;
    return base.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, searchQuery, statusFilter]);

  const currentSelectedProfile = useMemo(() => {
    if (!selectedProfileId) return null;
    return [...MOCK_TEACHERS, ...MOCK_LEARNERS].find((p) => p.id === selectedProfileId) || null;
  }, [selectedProfileId]);

  return (
    <div className="w-full bg-[var(--color-canvas-soft)] text-[#0F172A] font-sans antialiased -m-3 xs:-m-4 sm:-m-5 md:-m-6 lg:-m-6 xl:-m-8">
      <header className="px-5 xs:px-7 sm:px-9 lg:px-10 pt-6 sm:pt-8 pb-2 sm:pb-3 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono text-[#64748B] uppercase tracking-[0.18em] flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" /> Institutional control
          </p>
          <h1 className="mt-1 font-display text-xl sm:text-2xl font-semibold tracking-tight">Nexus academic command</h1>
          <p className="mt-1 text-[11px] text-[#64748B]">System-wide oversight, compliance, user management, resource allocation</p>
        </div>
        <div className="flex items-center gap-2">
          <BentoPill tone="green">Triple 4C</BentoPill>
          <BentoPill tone="neutral">Superadmin</BentoPill>
        </div>
      </header>

      <div className="px-5 xs:px-7 sm:px-9 lg:px-10 py-4 sm:py-6">
        <BentoGrid>
          {/* Hero: registered cohorts */}
          <BentoCard
            accent="green"
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2"
            eyebrow="Registered cohorts"
            icon={<GraduationCap size={16} className="text-white/60" />}
          >
            <div className="h-full flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-end gap-3">
                  <p className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">2,840</p>
                  <BentoPill tone="onDark">+12% active yield</BentoPill>
                </div>
                <div className="mt-4 flex items-end gap-1 h-12">
                  {[36, 44, 41, 55, 62, 58, 71, 78].map((h, i) => (
                    <span key={i} className="flex-1 rounded-sm bg-[#E9C444]/80" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-white/50">Enrolment trend, last 8 weeks</p>
              </div>
              <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-mono text-[11px] font-bold text-white">A</span>
                  <div>
                    <p className="text-[11px] font-medium text-white">Admin account</p>
                    <p className="text-[10px] font-mono text-white/50">Triple 4C superadmin</p>
                  </div>
                </div>
                <button
                  onClick={() => go('admin/reports')}
                  className="inline-flex items-center gap-2 bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Open reports <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          </BentoCard>

          {/* Faculty pool */}
          <BentoCard eyebrow="Total faculty pool" icon={<Users size={16} className="text-[#64748B]" />}>
            <div className="flex items-end justify-between">
              <p className="font-display text-3xl font-semibold tracking-tight">142</p>
              <BentoPill tone="neutral">3 open postings</BentoPill>
            </div>
            <p className="mt-2 text-[11px] text-[#64748B]">Across 9 departments</p>
          </BentoCard>

          {/* System flags */}
          <BentoCard accent="yellow" eyebrow="System logs" icon={<AlertTriangle size={16} className="text-[#B99A28]" />}>
            <div className="flex items-end justify-between">
              <p className="font-display text-3xl font-semibold tracking-tight">12</p>
              <BentoPill tone="yellow">Review</BentoPill>
            </div>
            <p className="mt-2 text-[11px] text-[#7A5A00]">Flags require admin review</p>
          </BentoCard>

          {/* Retention */}
          <BentoCard eyebrow="Retention baseline" icon={<TrendingUp size={16} className="text-[#64748B]" />}>
            <div className="flex items-end justify-between">
              <p className="font-display text-3xl font-semibold tracking-tight">94.2%</p>
              <BentoPill tone="green">On target</BentoPill>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--color-t4c-green)]" style={{ width: '94.2%' }} />
            </div>
            <p className="mt-2 text-[11px] text-[#64748B]">Within target matrix</p>
          </BentoCard>

          {/* Quick actions */}
          <BentoCard eyebrow="Quick actions" icon={<ChevronRight size={16} className="text-[#64748B]" />}>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.route}
                  onClick={() => go(link.route)}
                  className="rounded-full border border-[#E2E8F0] px-2.5 py-1 text-[11px] text-[#334155] hover:border-[var(--color-t4c-green)] hover:text-[var(--color-t4c-green)] transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </BentoCard>

          {/* Cohort directory */}
          <BentoCard
            className="sm:col-span-2 lg:col-span-4"
            padded={false}
            eyebrow="Cohort directories"
            title="Faculty and learner registry"
            icon={<Users size={16} className="text-[#64748B]" />}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 sm:p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex gap-1.5 bg-white p-1 rounded-lg border border-[#E2E8F0] w-fit">
                <button
                  onClick={() => { setActiveTab('teacher'); setStatusFilter('All'); }}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${activeTab === 'teacher' ? 'bg-[#F1F5F9] text-[var(--color-t4c-green)] border border-[#E2E8F0] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                >
                  Faculty matrix ({MOCK_TEACHERS.length})
                </button>
                <button
                  onClick={() => { setActiveTab('learner'); setStatusFilter('All'); }}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${activeTab === 'learner' ? 'bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                >
                  Learner registry ({MOCK_LEARNERS.length})
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1 sm:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search members by name, ID or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#94A3B8]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#334155] focus:outline-none"
                >
                  <option>All Standings</option><option>Active</option><option>On Leave</option><option>Probation</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-mono uppercase tracking-widest text-[#64748B]">
                    <th className="py-3 px-4 font-medium">Identified profile</th>
                    <th className="py-3 px-4 font-medium">System key / ID</th>
                    <th className="py-3 px-4 font-medium">{activeTab === 'teacher' ? 'Department cluster' : 'Core major tracking'}</th>
                    <th className="py-3 px-4 font-medium">{activeTab === 'teacher' ? 'Aggregate score' : 'Calculated GPA'}</th>
                    <th className="py-3 px-4 font-medium">System standing</th>
                    <th className="py-3 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <p className="text-sm text-[#64748B]">No system records match your query.</p>
                        <button
                          onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                          className="mt-2 text-xs text-[var(--color-t4c-green)] underline underline-offset-4"
                        >
                          Clear all filters
                        </button>
                      </td>
                    </tr>
                  ) : filteredData.map((user) => (
                    <tr key={user.id} onClick={() => setSelectedProfileId(user.id)} className="hover:bg-[#F8FAFC] cursor-pointer transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt={user.name} loading="lazy" decoding="async" className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" />
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A] group-hover:text-[var(--color-t4c-green)]">{user.name}</p>
                            <p className="text-xs text-[#64748B]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4"><span className="font-mono text-xs px-2 py-1 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[#334155]">{user.id}</span></td>
                      <td className="py-3 px-4 text-xs text-[#334155]">{user.role === 'teacher' ? (user as TeacherProfile).department : (user as LearnerProfile).major}</td>
                      <td className="py-3 px-4">
                        {user.role === 'teacher' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#92400E] bg-[#FEF3C7] border border-amber-200 px-2 py-0.5 rounded"><Award size={12} /> {(user as TeacherProfile).rating} / 5.0</span>
                        ) : (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${(user as LearnerProfile).gpa >= 3.5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (user as LearnerProfile).gpa < 2.5 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {(user as LearnerProfile).gpa.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-mono px-2 py-1 rounded-full border ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : user.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{user.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right"><span className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] group-hover:text-[#0F172A]">Inspect <ChevronRight size={12} /></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>

      {/* Detailed slide-over */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-white border-l border-[#E2E8F0] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${currentSelectedProfile ? 'translate-x-0' : 'translate-x-full'}`}>
        {currentSelectedProfile && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border ${currentSelectedProfile.role === 'teacher' ? 'bg-[#E8F3EE] text-[var(--color-t4c-green)] border-[#BFDCCC]' : 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]'}`}>
                  {currentSelectedProfile.role} account
                </span>
                <span className="font-mono text-xs text-[#64748B]">{currentSelectedProfile.id}</span>
              </div>
              <button onClick={() => setSelectedProfileId(null)} className="p-2 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#94A3B8]">
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-4 border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
              <img src={currentSelectedProfile.avatar} alt={currentSelectedProfile.name} loading="lazy" decoding="async" className="w-16 h-16 rounded-lg object-cover border border-[#E2E8F0]" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-[#0F172A]">{currentSelectedProfile.name}</h2>
                <p className="text-xs text-[#64748B]">{currentSelectedProfile.role === 'teacher' ? (currentSelectedProfile as TeacherProfile).department : (currentSelectedProfile as LearnerProfile).major}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-mono text-[#64748B]">
                  <span className="flex items-center gap-1"><Mail size={10} /> {currentSelectedProfile.email}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {currentSelectedProfile.location}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentSelectedProfile.role === 'teacher' ? (
                <>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3"><p className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">Evaluation performance</p><p className="text-lg font-bold text-[#0F172A] mt-1">{(currentSelectedProfile as TeacherProfile).rating} <span className="text-xs font-normal text-[#64748B]">/ 5.0</span></p></div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3"><p className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">Turnaround buffer</p><p className="text-lg font-bold text-[#0F172A] mt-1">{(currentSelectedProfile as TeacherProfile).gradingTurnaround}</p></div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3"><p className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">Salary band</p><p className="text-sm font-bold text-[#0F172A] mt-1 flex items-center gap-1"><DollarSign size={12} /> {(currentSelectedProfile as TeacherProfile).salary}</p></div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3"><p className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">Contracted courses</p><p className="text-lg font-bold text-[#0F172A] mt-1">{(currentSelectedProfile as TeacherProfile).coursesCount}</p></div>
                </>
              ) : (
                <>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3"><p className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">Calculated GPA</p><p className="text-lg font-bold text-[#0F172A] mt-1">{(currentSelectedProfile as LearnerProfile).gpa.toFixed(2)}</p></div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3"><p className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">Attendance compliance</p><p className="text-lg font-bold text-[#0F172A] mt-1">{(currentSelectedProfile as LearnerProfile).attendance}</p></div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3"><p className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">Credits earned</p><p className="text-lg font-bold text-[#0F172A] mt-1">{(currentSelectedProfile as LearnerProfile).creditsEarned}</p></div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3"><p className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">Outstanding balance</p><p className={`text-sm font-bold mt-1 flex items-center gap-1 ${currentSelectedProfile.outstandingBalance !== '$0.00' ? 'text-rose-600' : 'text-emerald-600'}`}><DollarSign size={12} /> {currentSelectedProfile.outstandingBalance}</p></div>
                </>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#334155] mb-3 flex items-center gap-2">
                <BookOpen size={14} /> {currentSelectedProfile.role === 'teacher' ? 'Allocated class clusters' : 'Enrolled course progress'}
              </h3>
              <div className="space-y-2">
                {currentSelectedProfile.courses.map((course: any) => (
                  <div key={course.id} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono text-[#64748B]">{course.id}</p>
                      <p className="text-sm font-semibold text-[#0F172A]">{course.name}</p>
                    </div>
                    <div className="text-right">
                      {currentSelectedProfile.role === 'teacher' ? (
                        <>
                          <p className="text-xs text-[#334155] flex items-center gap-1 justify-end"><Users size={12} /> {course.students} students</p>
                          <p className="text-[11px] font-mono text-[#64748B]">{course.averageGrade} avg</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-[#0F172A]">{course.currentGrade}</p>
                          <p className="text-[11px] font-mono text-[#64748B]">Progress: {course.progress}%</p>
                          <div className="w-20 h-1 bg-[#E2E8F0] rounded-full overflow-hidden mt-1 ml-auto">
                            <div className="h-full bg-[var(--color-t4c-green)]" style={{ width: `${course.progress}%` }} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#334155] mb-3 flex items-center gap-2"><Clock size={14} /> Live platform audit logs</h3>
              <div className="space-y-2">
                {currentSelectedProfile.recentLogs.map((log: any) => (
                  <div key={log.id} className="flex gap-3 border-l-2 border-[#E2E8F0] pl-3 py-1">
                    <div className="flex-1">
                      <p className="text-xs text-[#1E293B]">{log.action}</p>
                      <p className="text-[11px] font-mono text-[#64748B]">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#E2E8F0]">
              <button className="flex-1 h-9 rounded-lg bg-[#0F172A] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-black"><FileText size={14} /> Export profile PDF</button>
              <button className="flex-1 h-9 rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#F8FAFC]"><Shield size={14} /> Modify credentials</button>
            </div>
          </div>
        )}
      </div>
      {currentSelectedProfile && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSelectedProfileId(null)} />}
    </div>
  );
};
