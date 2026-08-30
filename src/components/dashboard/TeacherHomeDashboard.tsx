import React, { useState } from 'react';
import { LayoutDashboard, Users, ClipboardList, MessageSquare, BookOpen, Clock, AlertTriangle, CheckCircle2, ChevronRight, TrendingDown } from 'lucide-react';

interface QueuedTask { id: string; type: 'grade' | 'review' | 'respond'; title: string; context: string; count?: number; urgency: 'high' | 'medium' | 'low'; }
interface StudentAlert { id: string; name: string; metric: string; reason: string; severity: 'high' | 'medium'; }

export const TeacherHomeDashboard: React.FC<{ onNavigate: (r: string) => void }> = ({ onNavigate }) => {
  const [tasks] = useState<QueuedTask[]>([
    { id: '1', type: 'grade', title: 'Grade 11 Math Exams', context: 'Trigonometry midterm submissions', count: 12, urgency: 'high' },
    { id: '2', type: 'review', title: 'Extension Request: Sarah Jenkins', context: 'History Essay timeline adjustments', urgency: 'medium' },
    { id: '3', type: 'respond', title: 'Unread Parent Inquiries', context: 'Awaiting portal messaging dispatch', count: 4, urgency: 'low' },
  ]);
  const [alerts] = useState<StudentAlert[]>([
    { id: '1', name: 'John Doe', metric: 'Attendance', reason: 'Missed 3 consecutive live sessions', severity: 'high' },
    { id: '2', name: 'Alex Smith', metric: 'Performance', reason: 'Weighted math scores decreased by >12%', severity: 'medium' },
  ]);

  return (
    <div className="w-full bg-[#F8FAFC] text-[#1E293B] font-sans antialiased -m-3 xs:-m-4 sm:-m-5 md:-m-6 lg:-m-6 xl:-m-8">
      <header className="px-6 xs:px-8 sm:px-10 pt-6 sm:pt-8 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 bg-transparent">
        <div>
          <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-widest">Faculty Operations</p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">Welcome back, Mr. Davis.</h1>
        </div>
        <div className="text-xs text-[#64748B] font-medium font-mono">3 Lectures Scheduled • 16 Actions Pending</div>
      </header>

      <div className="px-6 xs:px-8 sm:px-10 py-4 sm:py-6 space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Left Column: Core Workflows (2/3) */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6">
              <h3 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4">Urgent Action Queue</h3>
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="p-3 sm:p-4 border border-[#E2E8F0] rounded-md flex flex-col xs:flex-row xs:items-center justify-between gap-3 hover:border-[#94A3B8] transition-colors">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {task.type === 'grade' && <span className="text-[10px] font-mono font-bold bg-[#FEE2E2] text-[#EF4444] px-1.5 py-0.5 rounded uppercase">Grade</span>}
                        {task.type === 'review' && <span className="text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#D97706] px-1.5 py-0.5 rounded uppercase">Review</span>}
                        {task.type === 'respond' && <span className="text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0284C7] px-1.5 py-0.5 rounded uppercase">Inbox</span>}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2 flex-wrap">{task.title} {task.count && <span className="text-xs font-normal text-[#64748B]">({task.count})</span>}</h4>
                        <p className="text-xs text-[#64748B] mt-0.5">{task.context}</p>
                      </div>
                    </div>
                    <button onClick={() => onNavigate(task.type === 'grade' ? 'assignments' : task.type === 'review' ? 'discussions' : 'notices')} className="text-xs font-medium text-[#0F172A] border border-[#E2E8F0] px-3 py-1.5 rounded hover:bg-[#F8FAFC] transition-colors flex items-center gap-1 shrink-0 self-start xs:self-auto">Execute <ChevronRight className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6">
              <h3 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4">Today's Academic Deployments</h3>
              <div className="divide-y divide-[#F1F5F9]">
                {[
                  { time: '09:00 - 10:15', name: 'Grade 10 Mathematics', sub: '(Section A)', status: 'Concluded', tone: 'slate' },
                  { time: '11:00 - 12:15', name: 'Grade 11 Pure Mathematics', sub: '(Advanced Level)', status: 'Active Broadcast', tone: 'blue' },
                  { time: '14:00 - 14:45', name: 'Faculty Office Hours', sub: '(Open Consulting)', status: 'Up Next', tone: 'slate' },
                ].map(r => (
                  <div key={r.name} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <p className={`text-xs font-mono ${r.tone === 'blue' ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>{r.time}</p>
                      <p className="text-sm font-medium text-[#1E293B] truncate">{r.name} <span className="text-xs font-normal text-[#64748B]">{r.sub}</span></p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded shrink-0 ${r.tone === 'blue' ? 'text-[#2563EB] bg-[#EFF6FF]' : 'text-[#64748B] bg-[#F1F5F9]'}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Risk Management & Class Overview (1/3) */}
          <div className="space-y-5 sm:space-y-6">
            <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6">
              <h3 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4">Risk Intervention Signals</h3>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-3 border border-[#E2E8F0] rounded-md flex items-start gap-3 hover:bg-[#F8FAFC] transition-colors">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${alert.severity === 'high' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0F172A]">{alert.name} <span className="font-normal text-[#64748B]">— {alert.metric}</span></p>
                      <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">{alert.reason}</p>
                      <span className={`inline-flex mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${alert.severity === 'high' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#FEF3C7] text-[#92400E]'}`}>{alert.severity === 'high' ? 'High' : 'Medium'} Risk</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-6">
              <h3 className="text-[11px] font-bold text-[#475569] uppercase tracking-widest mb-4">Direct Metrics Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'Grade 11A', v: '82% Avg', sub: '28 students' },
                  { label: 'Grade 10B', v: '71% Avg', sub: '31 students' },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">{m.label}</p>
                      <p className="text-[11px] text-[#64748B]">{m.sub}</p>
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">{m.v}</span>
                  </div>
                ))}
                <button onClick={() => onNavigate('lectures')} className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-[#2563EB] hover:underline pt-1"><BookOpen size={12} /> View analytics suite</button>
              </div>
            </section>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-[#94A3B8] border-t border-[#E2E8F0] pt-4">
          <span>— Overview —</span><span className="flex-1 h-px bg-[#E2E8F0]" /><span>ACTION REQUIRED</span><span className="flex-1 h-px bg-[#E2E8F0]" /><span>TODAY'S SCHEDULE</span>
        </div>
      </div>
    </div>
  );
};
