import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Search, Filter, ArrowUpDown, 
  CheckCircle2, AlertTriangle, XCircle, Award, 
  Send, Sparkles, FileSpreadsheet, ChevronRight, 
  Calendar, Clock, TrendingUp, Flame, MessageSquare, 
  Edit3, Check, RefreshCw, Eye, UserCheck, ShieldAlert,
  GraduationCap, Bell, BarChart3, Download
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/authContext';
import { LearnerCourseProgress, Course, TeacherSummary } from '../../types';

interface LearnerProgressDashboardProps {
  initialTeacherId?: string;
  initialCourseId?: string;
  onNavigate?: (route: string) => void;
}

export const LearnerProgressDashboard: React.FC<LearnerProgressDashboardProps> = ({
  initialTeacherId,
  initialCourseId,
  onNavigate
}) => {
  const { currentUser } = useAuth();

  // Teachers state
  const [teachers, setTeachers] = useState<(TeacherSummary & { coursesList: Course[] })[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialTeacherId || currentUser?.id || 'lec_01');

  // Courses & progress state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || 'all');
  const [learnerRecords, setLearnerRecords] = useState<LearnerCourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBand, setSelectedBand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'progress_desc' | 'progress_asc' | 'quiz_desc' | 'attendance_desc' | 'name_asc'>('progress_desc');

  // Detail Modal & Nudge Modal
  const [selectedLearner, setSelectedLearner] = useState<LearnerCourseProgress | null>(null);
  const [teacherNoteInput, setTeacherNoteInput] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Nudge / Broadcast modal
  const [nudgeModalOpen, setNudgeModalOpen] = useState(false);
  const [nudgeType, setNudgeType] = useState<'warning' | 'praise' | 'info'>('warning');
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [nudgeTargetBand, setNudgeTargetBand] = useState<string>('all');
  const [nudgeSending, setNudgeSending] = useState(false);
  const [nudgeSuccessAlert, setNudgeSuccessAlert] = useState<string | null>(null);

  // Fetch teachers and courses on mount
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const [teachersData, coursesData] = await Promise.all([
          api.getTeachers(),
          api.getCourses()
        ]);
        setTeachers(teachersData);
        setCourses(coursesData);

        // If user is a lecturer and in list, default to them
        if (currentUser?.role === 'lecturer' && teachersData.some(t => t.id === currentUser.id)) {
          setSelectedTeacherId(currentUser.id);
        } else if (teachersData.length > 0 && !initialTeacherId) {
          setSelectedTeacherId(teachersData[0].id);
        }
      } catch (err) {
        console.error('Failed to load teachers or courses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [currentUser]);

  // Fetch learner progress whenever teacher or course selection changes
  const fetchLearnerData = async () => {
    try {
      setRefreshing(true);
      const data = await api.getLearnerProgress({
        teacherId: selectedTeacherId,
        courseId: selectedCourseId !== 'all' ? selectedCourseId : undefined,
        performanceBand: selectedBand !== 'all' ? selectedBand : undefined,
        search: searchQuery || undefined
      });
      setLearnerRecords(data);
    } catch (err) {
      console.error('Failed to fetch learner progress:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (teachers.length > 0) {
      fetchLearnerData();
    }
  }, [selectedTeacherId, selectedCourseId, selectedBand, searchQuery]);

  // Active Teacher details
  const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];
  const teacherCourses = activeTeacher?.coursesList || courses.filter(c => c.lecturerId === selectedTeacherId);

  // Filter & Sort learner records
  const processedLearners = [...learnerRecords].sort((a, b) => {
    if (sortBy === 'progress_desc') return b.overallProgressPercent - a.overallProgressPercent;
    if (sortBy === 'progress_asc') return a.overallProgressPercent - b.overallProgressPercent;
    if (sortBy === 'quiz_desc') return b.averageQuizScore - a.averageQuizScore;
    if (sortBy === 'attendance_desc') return b.attendanceRatePercent - a.attendanceRatePercent;
    if (sortBy === 'name_asc') return a.studentName.localeCompare(b.studentName);
    return 0;
  });

  // Calculate Cohort Metrics
  const totalLearners = learnerRecords.length;
  const avgProgress = totalLearners > 0 
    ? Math.round(learnerRecords.reduce((sum, l) => sum + l.overallProgressPercent, 0) / totalLearners)
    : 0;
  const avgQuizScore = totalLearners > 0
    ? Math.round(learnerRecords.reduce((sum, l) => sum + l.averageQuizScore, 0) / totalLearners)
    : 0;
  const avgAttendance = totalLearners > 0
    ? Math.round(learnerRecords.reduce((sum, l) => sum + l.attendanceRatePercent, 0) / totalLearners)
    : 0;

  const bandCounts = {
    highDistinction: learnerRecords.filter(l => l.performanceBand === 'High Distinction').length,
    onTrack: learnerRecords.filter(l => l.performanceBand === 'On Track').length,
    needsAttention: learnerRecords.filter(l => l.performanceBand === 'Needs Attention').length,
    atRisk: learnerRecords.filter(l => l.performanceBand === 'At Risk').length,
  };

  // Open learner inspection modal
  const handleOpenDetail = (learner: LearnerCourseProgress) => {
    setSelectedLearner(learner);
    setTeacherNoteInput(learner.teacherNotes || '');
    setNoteSuccess(false);
  };

  // Save Teacher Notes
  const handleSaveNotes = async () => {
    if (!selectedLearner) return;
    try {
      setNoteSaving(true);
      await api.updateLearnerNotes(selectedLearner.id, teacherNoteInput, activeTeacher?.name);
      setNoteSuccess(true);
      // update local state
      setLearnerRecords(prev => prev.map(l => l.id === selectedLearner.id ? { ...l, teacherNotes: teacherNoteInput } : l));
      setSelectedLearner(prev => prev ? { ...prev, teacherNotes: teacherNoteInput } : null);
      setTimeout(() => setNoteSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setNoteSaving(false);
    }
  };

  // Send Direct Nudge to individual student
  const handleSendSingleNudge = async (learner: LearnerCourseProgress, type: 'warning' | 'praise' | 'info') => {
    try {
      const defaultMsg = type === 'warning'
        ? `Hi ${learner.studentName}, please note that you have pending course requirements in ${learner.courseCode}. Let's catch up during office hours!`
        : type === 'praise'
        ? `Outstanding work in ${learner.courseCode}, ${learner.studentName}! Your high quiz mastery of ${learner.averageQuizScore}% is exemplary.`
        : `Important update regarding your progress in ${learner.courseCode}. Please check your lecture notes.`;

      await api.nudgeLearner(learner.id, {
        message: defaultMsg,
        type,
        teacherName: activeTeacher?.name
      });
      setNudgeSuccessAlert(`Direct ${type} notification dispatched to ${learner.studentName}!`);
      setTimeout(() => setNudgeSuccessAlert(null), 4000);
    } catch (err) {
      console.error('Failed to send nudge:', err);
    }
  };

  // Send Broadcast Nudge
  const handleSendBroadcast = async () => {
    try {
      setNudgeSending(true);
      const res = await api.broadcastNudge({
        courseId: selectedCourseId !== 'all' ? selectedCourseId : undefined,
        targetBand: nudgeTargetBand !== 'all' ? nudgeTargetBand : undefined,
        message: nudgeMessage || `Important reminder regarding your coursework in Triple 4 Curriculum.`,
        teacherName: activeTeacher?.name
      });
      setNudgeModalOpen(false);
      setNudgeMessage('');
      setNudgeSuccessAlert(`Broadcast alert successfully dispatched to ${res.dispatchedCount} learners!`);
      setTimeout(() => setNudgeSuccessAlert(null), 4000);
    } catch (err) {
      console.error('Failed to dispatch broadcast:', err);
    } finally {
      setNudgeSending(false);
    }
  };

  // Export CSV of Learner Progress
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Email', 'Course Code', 'Course Title', 'Progress %', 'Lectures Done', 'Quiz Avg %', 'Attendance %', 'Streak Days', 'Performance Band', 'Teacher Notes'];
    const rows = processedLearners.map(l => [
      l.studentIdNumber,
      `"${l.studentName}"`,
      l.studentEmail,
      l.courseCode,
      `"${l.courseTitle}"`,
      `${l.overallProgressPercent}%`,
      `${l.completedLecturesCount}/${l.totalLecturesCount}`,
      `${l.averageQuizScore}%`,
      `${l.attendanceRatePercent}%`,
      l.streakDays,
      l.performanceBand,
      `"${l.teacherNotes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Triple4C_Learner_Progress_${activeTeacher?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Alert Banner if Nudge Dispatched */}
      {nudgeSuccessAlert && (
        <div className="p-4 rounded-xl bg-emerald-900 text-yellow-300 font-bold text-xs flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-yellow-400" />
            <span>{nudgeSuccessAlert}</span>
          </div>
          <button onClick={() => setNudgeSuccessAlert(null)} className="text-yellow-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header & Faculty Selector */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Multi-Teacher Cohort Intelligence • Triple 4C System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              Teacher & Learner Progress Hub
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
              Real-time monitoring of learner syllabus completion, video engagement, quiz mastery scores, assignment submissions, and attendance tracking across all faculty courses.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setNudgeTargetBand('all');
                setNudgeModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4 text-yellow-300" />
              <span>Broadcast Cohort Nudge</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold border border-neutral-300 shadow-xs flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-neutral-700" />
              <span>Export Roster (CSV)</span>
            </button>

            <button
              onClick={fetchLearnerData}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-700' : ''}`} />
            </button>
          </div>
        </div>

        {/* Multi-Teacher Switcher Bar */}
        <div className="pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-800" />
              Select Instructor / Faculty Workspace:
            </span>
            <span className="text-xs font-bold text-emerald-800">
              {teachers.length} Active Teachers Registered
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {teachers.map(teacher => {
              const isSelected = selectedTeacherId === teacher.id;
              return (
                <button
                  key={teacher.id}
                  id={`teacher-btn-${teacher.id}`}
                  onClick={() => {
                    setSelectedTeacherId(teacher.id);
                    setSelectedCourseId('all');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 relative ${
                    isSelected
                      ? 'bg-emerald-950 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600'
                      : 'bg-neutral-50/70 hover:bg-neutral-100/90 border-neutral-200/80 text-neutral-800'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    isSelected ? 'bg-yellow-400 text-neutral-950' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {teacher.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {teacher.name}
                    </p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-emerald-300' : 'text-neutral-500'}`}>
                      {teacher.departmentName.replace('Department of ', '')}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                        isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        {teacher.employeeId}
                      </span>
                      <span className={isSelected ? 'text-emerald-300' : 'text-neutral-500'}>
                        {teacher.coursesAssigned.length} {teacher.coursesAssigned.length === 1 ? 'course' : 'courses'}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-yellow-400 absolute top-3 right-3 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cohort Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Enrolled Learners</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-neutral-900 mt-2">{totalLearners}</div>
          <p className="text-[11px] text-neutral-500 mt-1">Across {teacherCourses.length} syllabus modules</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Average Syllabus Progress</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-emerald-800 mt-2">{avgProgress}%</div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-700 h-1.5 rounded-full transition-all" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Average Quiz Mastery</span>
            <Award className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-3xl font-black text-yellow-600 mt-2">{avgQuizScore}%</div>
          <p className="text-[11px] text-neutral-500 mt-1">444 Institutional Grade Benchmark</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Attendance Compliance</span>
            <UserCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-neutral-900 mt-2">{avgAttendance}%</div>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">✓ SA-SAMS Statutory Minimum Met</p>
        </div>
      </div>

      {/* Course Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-emerald-950/10 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider pl-2 pr-1 flex-shrink-0">
          Course Filter:
        </span>
        <button
          onClick={() => setSelectedCourseId('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            selectedCourseId === 'all'
              ? 'bg-emerald-950 text-yellow-300 font-black shadow-xs'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          <span>All Assigned Courses</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-white font-mono">
            {totalLearners}
          </span>
        </button>

        {teacherCourses.map(c => {
          const count = learnerRecords.filter(l => l.courseId === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
                selectedCourseId === c.id
                  ? 'bg-emerald-950 text-yellow-300 font-black shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              <span className="font-mono text-emerald-400 font-bold">{c.code}</span>
              <span className="truncate max-w-[200px]">{c.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-white font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Performance Band Pills & Search & Sort */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs space-y-4">
        
        {/* Interactive Performance Band Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-1">
              Performance Filter:
            </span>

            <button
              onClick={() => setSelectedBand('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedBand === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <span>All Statuses</span>
              <span className="font-mono text-[10px]">{totalLearners}</span>
            </button>

            <button
              onClick={() => setSelectedBand('High Distinction')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedBand === 'High Distinction'
                  ? 'bg-emerald-800 text-white ring-2 ring-emerald-500'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>High Distinction</span>
              <span className="font-mono text-[10px] bg-emerald-200/60 px-1 rounded">{bandCounts.highDistinction}</span>
            </button>

            <button
              onClick={() => setSelectedBand('On Track')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedBand === 'On Track'
                  ? 'bg-sky-800 text-white ring-2 ring-sky-500'
                  : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              <span>On Track</span>
              <span className="font-mono text-[10px] bg-sky-200/60 px-1 rounded">{bandCounts.onTrack}</span>
            </button>

            <button
              onClick={() => setSelectedBand('Needs Attention')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedBand === 'Needs Attention'
                  ? 'bg-amber-800 text-white ring-2 ring-amber-500'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Needs Attention</span>
              <span className="font-mono text-[10px] bg-amber-200/60 px-1 rounded">{bandCounts.needsAttention}</span>
            </button>

            <button
              onClick={() => setSelectedBand('At Risk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedBand === 'At Risk'
                  ? 'bg-rose-800 text-white ring-2 ring-rose-500'
                  : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>At Risk (Alert)</span>
              <span className="font-mono text-[10px] bg-rose-200/60 px-1 rounded">{bandCounts.atRisk}</span>
            </button>
          </div>

          {/* Quick Action for At-Risk Learners */}
          {bandCounts.atRisk > 0 && (
            <button
              onClick={() => {
                setNudgeTargetBand('At Risk');
                setNudgeType('warning');
                setNudgeModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-300 text-xs font-black flex items-center gap-1.5 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
              <span>Nudge All {bandCounts.atRisk} At-Risk Learners</span>
            </button>
          )}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-neutral-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, ID, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50/70 focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-neutral-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-neutral-300 bg-neutral-50/70 focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            >
              <option value="progress_desc">Overall Progress (High to Low)</option>
              <option value="progress_asc">Overall Progress (Low to High)</option>
              <option value="quiz_desc">Quiz Score (Highest)</option>
              <option value="attendance_desc">Attendance Compliance</option>
              <option value="name_asc">Student Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Learner Progress Table */}
      <div className="bg-white rounded-2xl border border-emerald-950/10 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-neutral-900">
              Learner Cohort Roster ({processedLearners.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Instructor: <span className="font-bold text-emerald-900">{activeTeacher?.name}</span> • Showing active enrollments & mastery telemetry
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
            {processedLearners.length} of {totalLearners} learners matching filter
          </span>
        </div>

        {processedLearners.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-neutral-400 mx-auto" />
            <p className="text-sm font-bold text-neutral-700">No learners match the current search / filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBand('all');
                setSelectedCourseId('all');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] border-b border-neutral-200">
                  <th className="py-3.5 px-4">Learner Identity</th>
                  <th className="py-3.5 px-4">Enrolled Course</th>
                  <th className="py-3.5 px-4">Syllabus Progress</th>
                  <th className="py-3.5 px-4">Quiz Mastery</th>
                  <th className="py-3.5 px-4">Assignments</th>
                  <th className="py-3.5 px-4">Attendance & Streak</th>
                  <th className="py-3.5 px-4">Status Band</th>
                  <th className="py-3.5 px-4 text-right">Teacher Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {processedLearners.map(learner => {
                  const isHighDist = learner.performanceBand === 'High Distinction';
                  const isOnTrack = learner.performanceBand === 'On Track';
                  const isNeedsAttn = learner.performanceBand === 'Needs Attention';
                  const isAtRisk = learner.performanceBand === 'At Risk';

                  return (
                    <tr 
                      key={learner.id}
                      className="hover:bg-neutral-50/80 transition group"
                    >
                      {/* Learner Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-950 font-black text-xs flex items-center justify-center border border-emerald-300">
                            {learner.studentName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <button
                              onClick={() => handleOpenDetail(learner)}
                              className="font-bold text-neutral-900 hover:text-emerald-800 text-left transition flex items-center gap-1.5"
                            >
                              <span>{learner.studentName}</span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-700 transition" />
                            </button>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-500 font-mono">
                              <span className="bg-neutral-100 px-1 rounded font-bold text-neutral-700">{learner.studentIdNumber}</span>
                              <span>•</span>
                              <span>{learner.studentEmail}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Course */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-emerald-900 block text-xs">
                          {learner.courseCode}
                        </span>
                        <span className="text-[11px] text-neutral-500 truncate max-w-[150px] block">
                          {learner.courseTitle}
                        </span>
                      </td>

                      {/* Progress Bar & Lecture count */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className={learner.overallProgressPercent >= 80 ? 'text-emerald-800' : 'text-neutral-800'}>
                            {learner.overallProgressPercent}%
                          </span>
                          <span className="text-neutral-400 font-normal text-[10px]">
                            {learner.completedLecturesCount}/{learner.totalLecturesCount} lects
                          </span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              learner.overallProgressPercent >= 80 ? 'bg-emerald-600' :
                              learner.overallProgressPercent >= 60 ? 'bg-sky-600' :
                              learner.overallProgressPercent >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${learner.overallProgressPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Quiz Mastery */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-900 font-mono font-bold text-xs border border-neutral-200">
                          <Award className={`w-3.5 h-3.5 ${learner.averageQuizScore >= 90 ? 'text-yellow-600' : 'text-neutral-500'}`} />
                          <span>{learner.averageQuizScore}%</span>
                        </div>
                        <span className="block text-[10px] text-neutral-400 mt-0.5">
                          {learner.quizzesAttemptedCount}/{learner.quizzesTotalCount} passed
                        </span>
                      </td>

                      {/* Assignments */}
                      <td className="py-3.5 px-4">
                        {learner.latestAssignmentGrade !== undefined ? (
                          <div>
                            <span className="font-bold text-neutral-900 text-xs">
                              {learner.latestAssignmentGrade}/100
                            </span>
                            <span className="block text-[10px] text-emerald-700 font-bold">
                              ✓ Graded
                            </span>
                          </div>
                        ) : learner.assignmentsSubmittedCount > 0 ? (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Review Pending
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            0 Submitted ⚠️
                          </span>
                        )}
                      </td>

                      {/* Attendance & Streak */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${learner.attendanceRatePercent < 75 ? 'text-rose-700 font-mono' : 'text-neutral-800'}`}>
                            {learner.attendanceRatePercent}%
                          </span>
                          {learner.streakDays > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                              <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                              {learner.streakDays}d
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          Active: {learner.lastActive}
                        </span>
                      </td>

                      {/* Status Band */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border ${
                          isHighDist ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                          isOnTrack ? 'bg-sky-100 text-sky-950 border-sky-300' :
                          isNeedsAttn ? 'bg-amber-100 text-amber-950 border-amber-300' :
                          'bg-rose-100 text-rose-950 border-rose-300'
                        }`}>
                          {isHighDist && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          {isOnTrack && <TrendingUp className="w-3 h-3 text-sky-700" />}
                          {isNeedsAttn && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                          {isAtRisk && <XCircle className="w-3 h-3 text-rose-700" />}
                          <span>{learner.performanceBand}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(learner)}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold border border-neutral-200 flex items-center gap-1 transition"
                            title="Inspect Detailed Progress"
                          >
                            <Eye className="w-3.5 h-3.5 text-neutral-600" />
                            <span className="hidden sm:inline">Inspect</span>
                          </button>

                          {isAtRisk || isNeedsAttn ? (
                            <button
                              onClick={() => handleSendSingleNudge(learner, 'warning')}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold border border-rose-300 flex items-center gap-1 transition"
                              title="Send Catch-up Alert"
                            >
                              <Send className="w-3.5 h-3.5 text-rose-700" />
                              <span className="hidden sm:inline">Nudge</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendSingleNudge(learner, 'praise')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 flex items-center gap-1 transition"
                              title="Send Kudos Recognition"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="hidden sm:inline">Kudos</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* IN-DEPTH LEARNER INSPECTION MODAL / DRAWER */}
      {/* ========================================================= */}
      {selectedLearner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-emerald-950/20 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-yellow-300 font-black text-xl flex items-center justify-center shadow-sm">
                  {selectedLearner.studentName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-neutral-900">
                      {selectedLearner.studentName}
                    </h2>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      selectedLearner.performanceBand === 'High Distinction' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                      selectedLearner.performanceBand === 'On Track' ? 'bg-sky-100 text-sky-950 border-sky-300' :
                      selectedLearner.performanceBand === 'Needs Attention' ? 'bg-amber-100 text-amber-950 border-amber-300' :
                      'bg-rose-100 text-rose-950 border-rose-300'
                    }`}>
                      {selectedLearner.performanceBand}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Student ID: <span className="text-neutral-800 font-bold">{selectedLearner.studentIdNumber}</span> • Email: {selectedLearner.studentEmail}
                  </p>
                  <p className="text-xs text-emerald-900 font-bold mt-1">
                    Course: {selectedLearner.courseCode} - {selectedLearner.courseTitle}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedLearner(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics Bar in Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-center">
              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Syllabus Progress</span>
                <div className="text-xl font-black text-emerald-900 mt-0.5">{selectedLearner.overallProgressPercent}%</div>
                <span className="text-[10px] text-neutral-500">{selectedLearner.completedLecturesCount}/{selectedLearner.totalLecturesCount} Modules</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Average Quiz</span>
                <div className="text-xl font-black text-yellow-600 mt-0.5">{selectedLearner.averageQuizScore}%</div>
                <span className="text-[10px] text-neutral-500">{selectedLearner.quizzesAttemptedCount} Attempted</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Attendance</span>
                <div className="text-xl font-black text-neutral-900 mt-0.5">{selectedLearner.attendanceRatePercent}%</div>
                <span className="text-[10px] text-emerald-700 font-bold">SA-SAMS Logged</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Active Streak</span>
                <div className="text-xl font-black text-amber-600 mt-0.5">{selectedLearner.streakDays} Days 🔥</div>
                <span className="text-[10px] text-neutral-500">Last: {selectedLearner.lastActive}</span>
              </div>
            </div>

            {/* Module Breakdown Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                Lecture & Interactive Module Progression Timeline:
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedLearner.moduleDetails.map((module, idx) => (
                  <div 
                    key={module.moduleId}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      module.completed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        module.completed ? 'bg-emerald-700 text-white' : 'bg-neutral-300 text-neutral-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900">{module.lectureTitle}</p>
                        <p className="text-[10px] text-neutral-500">{module.moduleName} • {module.timeSpentMinutes} min study time</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {module.completed ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                            Quiz: {module.quizScore}%
                          </span>
                          <span className="text-[10px] text-emerald-800 font-bold">✓ Complete</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          {module.watchedPercent}% Watched
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments & Rubric Submissions */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-emerald-800" />
                Submitted Coursework & Rubric Evaluations:
              </h4>

              {selectedLearner.submittedAssignments.length === 0 ? (
                <p className="text-xs text-neutral-500 italic bg-neutral-50 p-3 rounded-xl">No assignment submissions on record yet.</p>
              ) : (
                <div className="space-y-2">
                  {selectedLearner.submittedAssignments.map(asg => (
                    <div key={asg.assignmentId} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900">{asg.title}</span>
                        {asg.status === 'graded' ? (
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            Grade: {asg.grade}/{asg.maxGrade}
                          </span>
                        ) : asg.status === 'submitted' ? (
                          <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Pending Faculty Evaluation
                          </span>
                        ) : (
                          <span className="font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                            Missing Submission ⚠️
                          </span>
                        )}
                      </div>
                      {asg.feedback && (
                        <p className="text-[11px] text-neutral-600 bg-white p-2 rounded-lg border border-neutral-200">
                          <span className="font-bold text-emerald-900">Faculty Rubric Feedback:</span> "{asg.feedback}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teacher Academic Notes Section */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center justify-between">
                <span>Private Faculty Memos & Intervention Notes:</span>
                {noteSuccess && <span className="text-emerald-700 font-bold">✓ Notes saved successfully</span>}
              </label>
              <textarea
                rows={2}
                value={teacherNoteInput}
                onChange={(e) => setTeacherNoteInput(e.target.value)}
                placeholder="Record private academic counseling notes, support accommodations, or capstone readiness comments..."
                className="w-full p-3 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-neutral-400">POPIA Act compliant encrypted faculty log.</p>
                <button
                  onClick={handleSaveNotes}
                  disabled={noteSaving}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-900 text-yellow-300 text-xs font-bold hover:bg-emerald-800 transition"
                >
                  {noteSaving ? 'Saving...' : 'Save Faculty Memo'}
                </button>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendSingleNudge(selectedLearner, 'praise')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs font-bold border border-emerald-300 flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Send Kudos Praise</span>
                </button>
                <button
                  onClick={() => handleSendSingleNudge(selectedLearner, 'warning')}
                  className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-950 text-xs font-bold border border-rose-300 flex items-center gap-1.5 transition"
                >
                  <Bell className="w-3.5 h-3.5 text-rose-700" />
                  <span>Send Academic Warning</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedLearner(null)}
                className="px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BROADCAST COHORT NUDGE MODAL */}
      {/* ========================================================= */}
      {nudgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-emerald-950/20 shadow-2xl p-6 sm:p-8 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-900 text-yellow-300 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">Broadcast Cohort Nudge</h3>
                  <p className="text-xs text-neutral-500">Instructor: {activeTeacher?.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setNudgeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Target Cohort Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Target Learner Segment:</label>
              <select
                value={nudgeTargetBand}
                onChange={(e) => setNudgeTargetBand(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 bg-neutral-50 font-bold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              >
                <option value="all">All Enrolled Learners ({totalLearners} students)</option>
                <option value="At Risk">At-Risk Learners Only ({bandCounts.atRisk} students) ⚠️</option>
                <option value="Needs Attention">Needs Attention Learners ({bandCounts.needsAttention} students)</option>
                <option value="On Track">On-Track Learners ({bandCounts.onTrack} students)</option>
                <option value="High Distinction">High Distinction Honors Cohort ({bandCounts.highDistinction} students)</option>
              </select>
            </div>

            {/* Predefined Templates */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Quick Template Shortcuts:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setNudgeMessage(`Please ensure you have watched all lecture videos and attempted the module quizzes before the upcoming practical lab.`)}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200"
                >
                  Quiz & Lecture Catch-up
                </button>
                <button
                  type="button"
                  onClick={() => setNudgeMessage(`Reminder: Assignment submissions for this milestone close this Friday at 23:59 SAST. Please submit via the portal.`)}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200"
                >
                  Deadline Alert
                </button>
                <button
                  type="button"
                  onClick={() => setNudgeMessage(`Faculty Office Hours are open this Thursday at 14:00. If you need 1-on-1 assistance, please join the live session.`)}
                  className="text-[10px] font-bold px-2 py-1 rounded bg-neutral-100 text-neutral-800 hover:bg-neutral-200 border border-neutral-200"
                >
                  Office Hours Invite
                </button>
              </div>
            </div>

            {/* Custom Message Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Notification Message:</label>
              <textarea
                rows={3}
                value={nudgeMessage}
                onChange={(e) => setNudgeMessage(e.target.value)}
                placeholder="Write message to appear in student push notification stream..."
                className="w-full p-3 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setNudgeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={nudgeSending || !nudgeMessage.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-900 text-yellow-300 text-xs font-black hover:bg-emerald-800 shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{nudgeSending ? 'Dispatched...' : 'Dispatch Broadcast'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
