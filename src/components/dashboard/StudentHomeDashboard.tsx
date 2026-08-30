import React, { useState } from 'react';
import { BookOpen, Calendar, GraduationCap, Inbox, Clock, AlertCircle, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';

interface Course { id: string; name: string; code: string; time: string; status: 'live' | 'upcoming' | 'completed'; }
interface Deadline { id: string; task: string; subject: string; dueDate: string; urgency: 'high' | 'medium' | 'low'; }

export const StudentHomeDashboard: React.FC<{ onNavigate: (r: string) => void }> = ({ onNavigate }) => {
  const [courses] = useState<Course[]>([
    { id: '1', name: 'Advanced Mathematics', code: 'MAT401', time: '09:00 - 10:15', status: 'live' },
    { id: '2', name: 'Modern World History', code: 'HIS202', time: '11:00 - 12:15', status: 'upcoming' },
    { id: '3', name: 'Quantum Physics Lab', code: 'PHY305', time: '14:00 - 15:30', status: 'upcoming' },
  ]);
  const [deadlines] = useState<Deadline[]>([
    { id: '1', task: 'History Essay: The Industrial Pivot', subject: 'History', dueDate: 'Tonight, 23:59', urgency: 'high' },
    { id: '2', task: 'Trigonometry Problem Set 4', subject: 'Mathematics', dueDate: 'Thursday, Oct 15', urgency: 'medium' },
    { id: '3', task: 'Lab Report Drafting', subject: 'Physics', dueDate: 'Next Monday', urgency: 'low' },
  ]);

  return (
    <div className="w-full bg-[#F8FAFC] text-[#1E293B] font-sans antialiased -m-3 xs:-m-4 sm:-m-5 md:-m-6 lg:-m-6 xl:-m-8">
      {/* Editorial Greeting Header */}
      <header className="px-6 xs:px-8 sm:px-10 pt-6 sm:pt-8 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-4 bg-transparent">
        <div>
          <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-widest">Workspace Overview</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">Welcome back, Sarah.</h1>
        </div>
        <div className="text-xs text-[#64748B] font-medium font-mono">Term 3 • Week 6</div>
      </header>

      <div className="px-6 xs:px-8 sm:px-10 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Zero-Friction Live Class Banner */}
        {courses.filter(c => c.status === 'live').map(liveCourse => (
          <div key={liveCourse.id} className="bg-white border-l-4 border-[#2563EB] rounded-r-lg border-y border-r border-[#E2E8F0] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded font-medium">{liveCourse.code}</span>
                  <h2 className="text-sm font-semibold text-[#0F172A] truncate">{liveCourse.name}</h2>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3 inline shrink-0" /> Session is currently active ({liveCourse.time})
                </p>
              </div>
            </div>
            <button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded text-xs font-medium transition-colors tracking-wide shrink-0 w-full sm:w-auto">Join Portal</button>
          </div>
        ))}

        {/* Two Column Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Left Column: Academic Itinerary & Schedule (2/3) */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6">
              <h3 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4">Today's Academic Itinerary</h3>
              <div className="divide-y divide-[#F1F5F9]">
                {courses.map(course => (
                  <div key={course.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-mono text-[#64748B]">{course.time}</p>
                      <p className="text-sm font-medium text-[#1E293B] truncate">{course.name}</p>
                    </div>
                    <div className="shrink-0">
                      {course.status === 'live' ? (
                        <span className="text-[11px] font-medium text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">Active</span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded">Scheduled</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6">
              <div className="flex justify-between items-center mb-4 gap-3">
                <h3 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">Instructor Observations</h3>
                <button onClick={() => onNavigate('lectures')} className="text-xs font-medium text-[#2563EB] hover:underline flex items-center gap-0.5 shrink-0">View Archive <ChevronRight className="h-3 w-3" /></button>
              </div>
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#0F172A]">Mr. Marcus Davis</span>
                  <span className="text-[10px] text-[#94A3B8] font-mono">• Mathematics</span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed italic">"Sarah exhibited profound depth in her latest Trigonometry evaluation. Her approach to solving complex identity verifications is elegant. Keep refining the processing pacing."</p>
              </div>
            </section>
          </div>

          {/* Right Column: Deadlines & Metrics Pillar (1/3) */}
          <div className="space-y-5 sm:space-y-6">
            <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6">
              <h3 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4">Action Required</h3>
              <div className="space-y-3">
                {deadlines.map(deadline => (
                  <div key={deadline.id} onClick={() => onNavigate('assignments')} className="p-3 border border-[#E2E8F0] rounded-md flex items-start gap-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer group">
                    <div className="mt-0.5 shrink-0">
                      {deadline.urgency === 'high' ? <AlertCircle size={14} className="text-[#EF4444]" /> : deadline.urgency === 'medium' ? <Clock size={14} className="text-amber-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#0F172A] leading-tight group-hover:text-[#2563EB]">{deadline.task}</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">{deadline.subject} • <span className={deadline.urgency === 'high' ? 'text-[#EF4444] font-medium' : deadline.urgency === 'medium' ? 'text-amber-600' : 'text-[#64748B]'}>{deadline.dueDate}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6">
              <h3 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4">Data Utility</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">Term 3 Average</p>
                    <p className="text-[11px] text-[#64748B]">Across 6 modules</p>
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">78%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">Attendance</p>
                    <p className="text-[11px] text-[#64748B]">96% present</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <button onClick={() => onNavigate('attendance')} className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-[#2563EB] hover:underline pt-1"><MessageSquare size={12} /> View full transcript</button>
              </div>
            </section>
          </div>
        </div>

        {/* ASCII Blueprint Alignment Bar — shows responsive grid fidelity */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-[#94A3B8] border-t border-[#E2E8F0] pt-4">
          <span>— Desk —</span><span className="flex-1 h-px bg-[#E2E8F0]" /><span>WEEK AT A GLANCE</span><span className="flex-1 h-px bg-[#E2E8F0]" /><span>PROGRESS TRACK</span>
        </div>
      </div>
    </div>
  );
};
