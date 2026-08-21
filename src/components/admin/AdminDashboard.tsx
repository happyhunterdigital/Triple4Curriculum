import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, ShieldAlert, FileSpreadsheet, 
  Calendar, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp, Sparkles 
} from 'lucide-react';
import { api } from '../../lib/api';
import { Department, AuditLog } from '../../types';

interface AdminDashboardProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dList, aList, rep] = await Promise.all([
          api.getDepartments(),
          api.getAuditLogs(),
          api.getReportsSummary()
        ]);
        setDepartments(dList);
        setAuditLogs(aList);
        setSummary(rep);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Executive Banner */}
      <div className="rounded-3xl bg-white border-2 border-academic-green/30 shadow-xs relative overflow-hidden">
        <div className="relative w-full h-48 sm:h-56 overflow-hidden">
          <img 
            src="https://res.cloudinary.com/dka0498ns/image/upload/v1787253903/Triple4c_learners_hero_image_mzxiye.jpg"
            alt="Institutional Command Center"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-black/25" />

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-achievement-gold text-deep-onyx border border-black/10 text-xs font-black">
              <ShieldAlert className="w-3.5 h-3.5 text-academic-green" />
              <span>Triple 4C Institutional Administration • POPIA & SA-SAMS Certified</span>
            </div>
            <span className="text-xs font-mono font-bold bg-white/95 px-3 py-1 rounded-lg border border-neutral-200 text-deep-onyx">
              DHET NQF 8
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 z-10">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-deep-onyx">
              Institutional Command Center
            </h1>
            <p className="text-xs sm:text-sm text-neutral-800 font-bold">
              Overseeing 5 Academic Departments • 1,205 Active Scholars • Real-Time Audit Integrity
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 bg-white flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200">
          <div className="text-xs text-neutral-600 font-medium">
            Statutory South African Higher Education compliance with DHET and SETA reporting.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/admin/reports')}
              className="px-4 py-2.5 rounded-xl bg-achievement-gold hover:bg-yellow-400 text-deep-onyx text-xs font-black shadow-xs flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-deep-onyx" />
              <span>SA-SAMS Quarterly Export</span>
            </button>
            <button
              onClick={() => onNavigate('/admin/timetable')}
              className="px-4 py-2.5 rounded-xl bg-academic-green hover:bg-academic-green/90 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
            >
              <Calendar className="w-4 h-4 text-achievement-gold" />
              <span>Master Timetable</span>
            </button>
            <button
              onClick={() => onNavigate('/admin/audit-logs')}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-neutral-100 text-deep-onyx text-xs font-bold border-2 border-neutral-300 shadow-xs flex items-center gap-2 transition"
            >
              <ShieldAlert className="w-4 h-4 text-academic-green" />
              <span>POPIA Audit Stream</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Enrolled Scholars</span>
          <div className="text-3xl font-black text-neutral-900 mt-1">1,205</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">↑ 12% Semester over Semester</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Average Cohort Grade</span>
          <div className="text-3xl font-black text-emerald-800 mt-1">{summary?.averageGradePercent || 81.6}%</div>
          <p className="text-[11px] text-neutral-500 mt-1">444 Curriculum Standard</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Attendance Compliance</span>
          <div className="text-3xl font-black text-yellow-600 mt-1">{summary?.averageAttendanceRate || 94.2}%</div>
          <p className="text-[11px] text-neutral-500 mt-1">DBE Threshold: 85%</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">B-BBEE / SETA Score</span>
          <div className="text-3xl font-black text-emerald-900 mt-1">24.8 Pts</div>
          <p className="text-[11px] text-neutral-500 mt-1">Level 1 Skills Development</p>
        </div>
      </div>

      {/* 2-Column Administrative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Academic Departments & Retention Alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Department Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">Academic Departments</h3>
                <p className="text-xs text-neutral-500">Curriculum allocations and faculty leadership</p>
              </div>
              <button
                onClick={() => onNavigate('/admin/departments')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>Manage Departments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {departments.map(dept => (
                <div 
                  key={dept.id}
                  className="p-4 rounded-xl border border-neutral-200 bg-[#fbfcf8] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.code.split('-')[1]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-neutral-900">{dept.code}</span>
                        <span className="text-xs font-bold text-emerald-900">{dept.name}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Head of Dept: {dept.headOfDepartment}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs flex-shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-neutral-900">{dept.studentCount}</span>
                      <p className="text-[10px] text-neutral-500">Students</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-800">{dept.facultyCount}</span>
                      <p className="text-[10px] text-neutral-500">Faculty</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* At-Risk Intervention Alert */}
          <div className="bg-white rounded-2xl p-6 border-2 border-yellow-400 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-900 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-neutral-900">
                  Automated Dropout Risk & Early Intervention Alerts
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900">
                2 Flagged
              </span>
            </div>

            <div className="space-y-2">
              {summary?.atRiskStudents?.map((stu: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-50/60 border border-yellow-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-neutral-900">{stu.name}</span>
                    <span className="font-mono text-[11px] text-neutral-500 ml-2">({stu.studentId})</span>
                    <p className="text-neutral-600 mt-0.5">Reason: {stu.reason}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('/admin/announcements')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-800 text-yellow-300 font-bold text-xs shadow-xs"
                  >
                    Dispatch Counselor
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Live Audit Log Stream */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-800" />
                <h3 className="text-base font-black text-neutral-900">Audit Stream</h3>
              </div>
              <button
                onClick={() => onNavigate('/admin/audit-logs')}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Full Trail →
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-3 rounded-xl border border-neutral-200 bg-[#fbfcf8] text-xs">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-neutral-900">{log.action}</span>
                    <span className="font-mono text-[10px] text-neutral-400">{log.timestamp.split(' ')[1]}</span>
                  </div>
                  <p className="text-neutral-600 text-[11px] line-clamp-2">{log.details}</p>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-200/60 text-[10px]">
                    <span className="font-semibold text-emerald-800">{log.userName}</span>
                    <span className="font-mono text-neutral-400">{log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
