import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Clock, CheckCircle2, 
  ArrowRight, FileText, ClipboardCheck, Sparkles, Video, Calendar,
  TrendingUp, Award, AlertTriangle, Send, Eye, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Course, AssignmentSubmission, TimetableSlot, LearnerCourseProgress } from '../../types';

interface LecturerDashboardProps {
  onNavigate: (route: string) => void;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<AssignmentSubmission[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [learners, setLearners] = useState<LearnerCourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, s, t, lp] = await Promise.all([
          api.getCourses(),
          api.getSubmissions(),
          api.getTimetable(),
          api.getLearnerProgress({ teacherId: currentUser?.id })
        ]);
        setCourses(c);
        setPendingSubmissions(s.filter(item => item.status === 'submitted'));
        setTimetable(t.filter(slot => slot.lecturerId === currentUser?.id || slot.courseCode === 'CSC-441'));
        setLearners(lp);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  const atRiskLearners = learners.filter(l => l.performanceBand === 'At Risk' || l.performanceBand === 'Needs Attention');

  return (
    <div className="space-y-6 pb-12">
      
      {/* Faculty Hero Banner */}
      <div className="rounded-3xl bg-white border-2 border-academic-green/30 shadow-xs relative overflow-hidden">
        {/* Banner with Photographic Image & Bright Gradient */}
        <div className="relative w-full h-48 sm:h-56 overflow-hidden">
          <img 
            src="https://res.cloudinary.com/dka0498ns/image/upload/v1787253903/Triple4c_learners_hero_image_mzxiye.jpg"
            alt="Faculty Command Center"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-black/25" />
          
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-achievement-gold text-deep-onyx border border-black/10 text-xs font-black">
              <span>Faculty Command Center • {currentUser?.departmentName || 'Applied AI & Computing'}</span>
            </span>
            <span className="text-xs font-mono font-bold bg-white/95 px-3 py-1 rounded-lg border border-neutral-200 text-deep-onyx">
              Faculty ID: {currentUser?.employeeId || '444-FAC-104'}
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 z-10">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-deep-onyx">
              Good day, {currentUser?.name || 'Professor'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-800 font-bold">
              Triple 4C Curriculum • Academic Year 2026
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-white flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200">
          <div className="text-xs text-neutral-600 font-medium">
            Manage course rubrics, real-time learner cohorts, and statutory SA-SAMS register.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/lecturer/progress')}
              className="px-4 py-2.5 rounded-xl bg-achievement-gold hover:bg-yellow-400 text-deep-onyx text-xs font-black shadow-xs flex items-center gap-2 transition"
            >
              <Users className="w-4 h-4 text-deep-onyx" />
              <span>Learner Progress Tracker</span>
            </button>
            <button
              onClick={() => onNavigate('/lecturer/authoring')}
              className="px-4 py-2.5 rounded-xl bg-academic-green hover:bg-academic-green/90 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-achievement-gold" />
              <span>Create Lecture</span>
            </button>
            <button
              onClick={() => onNavigate('/lecturer/grading')}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-neutral-100 text-deep-onyx text-xs font-bold border-2 border-neutral-300 shadow-xs flex items-center gap-2 transition"
            >
              <ClipboardCheck className="w-4 h-4 text-academic-green" />
              <span>SpeedGrader ({pendingSubmissions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs cursor-pointer hover:border-emerald-500 transition" onClick={() => onNavigate('/lecturer/progress')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Cohort Size</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-emerald-900 mt-1">{learners.length > 0 ? learners.length : 12} Learners</div>
          <p className="text-[11px] text-neutral-500 mt-1">Across assigned course syllabi</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs cursor-pointer hover:border-emerald-500 transition" onClick={() => onNavigate('/lecturer/grading')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Pending Grading</span>
            <ClipboardCheck className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-3xl font-black text-yellow-600 mt-1">{pendingSubmissions.length} Items</div>
          <p className="text-[11px] text-neutral-500 mt-1">SpeedGrader queue ready</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs cursor-pointer hover:border-emerald-500 transition" onClick={() => onNavigate('/lecturer/progress')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Average Mastery</span>
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-emerald-800 mt-1">
            {learners.length > 0 ? Math.round(learners.reduce((s, l) => s + l.averageQuizScore, 0) / learners.length) : 88}%
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">444 Mastery Benchmark</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Attendance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-neutral-900 mt-1">96.1%</div>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">✓ SA-SAMS Audit Passed</p>
        </div>
      </div>

      {/* Real-Time Learner Progress Snapshot */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-black text-neutral-900">
                Learner Progress & Telemetry Snapshot
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live syllabus progress, quiz performance, and active streak days of students enrolled in your courses
            </p>
          </div>

          <button
            onClick={() => onNavigate('/lecturer/progress')}
            className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-yellow-300 text-xs font-black flex items-center gap-2 shadow-xs transition"
          >
            <span>Open Full Teacher Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {learners.slice(0, 4).map(learner => {
            const isHighDist = learner.performanceBand === 'High Distinction';
            const isOnTrack = learner.performanceBand === 'On Track';
            const isNeedsAttn = learner.performanceBand === 'Needs Attention';
            const isAtRisk = learner.performanceBand === 'At Risk';

            return (
              <div 
                key={learner.id}
                onClick={() => onNavigate('/lecturer/progress')}
                className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-white hover:border-emerald-600/60 hover:shadow-md transition cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-black text-neutral-900">{learner.studentName}</h4>
                    <p className="text-[10px] font-mono text-neutral-500">{learner.studentIdNumber} • {learner.courseCode}</p>
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    isHighDist ? 'bg-emerald-100 text-emerald-900' :
                    isOnTrack ? 'bg-sky-100 text-sky-900' :
                    isNeedsAttn ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {learner.performanceBand}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-neutral-500">Progress:</span>
                    <span className="text-emerald-900 font-mono">{learner.overallProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${learner.overallProgressPercent}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-neutral-200/60 text-neutral-600 font-medium">
                  <span>Quiz: <b className="text-yellow-700 font-mono">{learner.averageQuizScore}%</b></span>
                  <span>Streak: <b className="text-amber-700">{learner.streakDays}d 🔥</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Faculty Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: My Active Courses & Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">Courses Under Instruction</h3>
                <p className="text-xs text-neutral-500">444 Curriculum Syllabus Management</p>
              </div>
              <button
                onClick={() => onNavigate('/lecturer/progress')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>View Full Cohorts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {courses.slice(0, 3).map(course => (
                <div 
                  key={course.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-[#fbfcf8] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-yellow-400">
                        {course.code}
                      </span>
                      <span className="text-neutral-500 font-semibold">{course.credits} Credits • {course.semester}</span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 mt-1">
                      {course.title}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {course.modulesCount} Learning Modules • {course.totalHours} Lecture Hours
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onNavigate('/lecturer/progress')}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700"
                    >
                      Learner Progress
                    </button>
                    <button
                      onClick={() => onNavigate('/lecturer/authoring')}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700"
                    >
                      Edit Syllabus
                    </button>
                    <button
                      onClick={() => onNavigate('/lecturer/grading')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-yellow-300 text-xs font-bold"
                    >
                      SpeedGrader
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Timetable & SpeedGrader Queue */}
        <div className="space-y-6">
          
          {/* SpeedGrader Queue */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-black text-neutral-900">Grading Queue</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-900">
                {pendingSubmissions.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {pendingSubmissions.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">All current submissions graded!</p>
              ) : (
                pendingSubmissions.slice(0, 3).map(sub => (
                  <div key={sub.id} className="p-3 rounded-xl border border-neutral-200 bg-[#fbfcf8]">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-neutral-900">{sub.studentName}</span>
                      <span className="font-mono text-emerald-900">{sub.courseCode}</span>
                    </div>
                    <p className="text-xs text-neutral-600 truncate">{sub.assignmentTitle}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/60">
                      <span className="text-[10px] text-neutral-400 font-mono">{sub.submittedAt}</span>
                      <button
                        onClick={() => onNavigate('/lecturer/grading')}
                        className="text-xs font-bold text-emerald-800 hover:underline"
                      >
                        Open SpeedGrader →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Teaching Schedule */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-600" />
                <h3 className="text-base font-black text-neutral-900">Live Lectures</h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {timetable.slice(0, 2).map(slot => (
                <div key={slot.id} className="p-3 rounded-xl border border-neutral-200 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-emerald-900">{slot.courseCode}</span>
                    <span className="text-neutral-500">{slot.startTime} - {slot.endTime}</span>
                  </div>
                  <p className="text-neutral-900 font-semibold mt-0.5">{slot.room}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

