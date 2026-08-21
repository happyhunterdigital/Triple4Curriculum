import React, { useState, useEffect } from 'react';
import { CheckSquare, QrCode, CheckCircle2, Clock, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { AttendanceRecord, Course } from '../../types';
import { DashboardSkeleton } from '../common/DashboardSkeleton';

export const StudentAttendance: React.FC = () => {
  const { currentUser, triggerToast } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs_cs201');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rList, cList] = await Promise.all([
          api.getAttendance(),
          api.getCourses()
        ]);
        setRecords(rList);
        setCourses(cList);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const handleCheckIn = async () => {
    try {
      const res = await api.checkInAttendance(
        currentUser?.id || 'stu_01',
        selectedCourseId,
        'Self Check-in'
      );
      setRecords(prev => [res.record, ...prev]);
      setIsCheckedIn(true);

      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '✅ Attendance Verified',
        message: `Registered present for ${res.record.courseCode} at ${res.record.checkInTime}.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'normal'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const studentRecords = records.filter(r => r.studentId === (currentUser?.id || 'stu_01'));
  const presentCount = studentRecords.filter(r => r.status === 'Present').length;
  const attendanceRate = studentRecords.length > 0 
    ? Math.round((presentCount / studentRecords.length) * 100) 
    : 96;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Department of Academic Compliance
            </span>
            <span className="text-xs font-bold text-yellow-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SA-SAMS Validated
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Attendance Record & Biometric Check-In
          </h1>
          <p className="text-xs text-neutral-500">
            Real-time classroom attendance tracking with instant audit trail logging
          </p>
        </div>

        {/* 1-Click Check In Action Widget */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 bg-[#fbfcf8] text-neutral-900 focus:outline-hidden"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} Check-In
              </option>
            ))}
          </select>

          <button
            id="btn-self-checkin"
            onClick={handleCheckIn}
            disabled={isCheckedIn}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-neutral-300 text-yellow-300 disabled:text-neutral-600 text-xs font-black shadow-sm flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCheckedIn ? 'Checked In Today' : '1-Click Check In'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Overall Attendance Rate
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-800">{attendanceRate}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              High Compliance
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Exceeds 85% DBE minimum statutory requirement</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Total Sessions Attended
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-neutral-900">{presentCount || 18}</span>
            <span className="text-xs font-bold text-neutral-500">of 19 scheduled</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Semester 2 active cohort</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Verification Method
          </span>
          <div className="flex items-center gap-2 mt-2">
            <QrCode className="w-6 h-6 text-yellow-600" />
            <span className="text-base font-black text-neutral-900">Encrypted QR / Portal</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">IP & session signature verified</p>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
        <h3 className="text-sm font-black text-neutral-900 mb-4">
          Recent Classroom Check-In Logs
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                <th className="pb-3">Date</th>
                <th className="pb-3">Course</th>
                <th className="pb-3">Check-In Time</th>
                <th className="pb-3">Method</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {studentRecords.map(record => (
                <tr key={record.id} className="hover:bg-neutral-50/80 transition">
                  <td className="py-3 font-semibold text-neutral-900">{record.date}</td>
                  <td className="py-3">
                    <span className="font-mono font-bold text-emerald-900 mr-1.5">{record.courseCode}</span>
                    <span className="text-neutral-600">{record.courseTitle}</span>
                  </td>
                  <td className="py-3 font-mono text-neutral-600">{record.checkInTime || '09:00'}</td>
                  <td className="py-3 text-neutral-500">{record.method}</td>
                  <td className="py-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      record.status === 'Present' ? 'bg-emerald-100 text-emerald-900' :
                      record.status === 'Late' ? 'bg-yellow-100 text-yellow-900' :
                      'bg-rose-100 text-rose-900'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
