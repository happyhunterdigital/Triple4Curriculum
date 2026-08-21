import React, { useState, useEffect } from 'react';
import { CheckSquare, Users, CheckCircle2, XCircle, Clock, Save, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { User, Course } from '../../types';

export const LecturerAttendance: React.FC = () => {
  const { triggerToast } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs_cs201');
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Late' | 'Absent'>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [cList, uList] = await Promise.all([
          api.getCourses(),
          api.getUsers()
        ]);
        setCourses(cList);
        const stuList = uList.filter(u => u.role === 'student');
        setStudents(stuList);

        // default all to present
        const initMap: Record<string, 'Present' | 'Late' | 'Absent'> = {};
        stuList.forEach(s => {
          initMap[s.id] = 'Present';
        });
        setAttendanceMap(initMap);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleStatusToggle = (studentId: string, status: 'Present' | 'Late' | 'Absent') => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      // Record attendance entries for each student
      for (const student of students) {
        const status = attendanceMap[student.id] || 'Present';
        if (status === 'Present' || status === 'Late') {
          await api.checkInAttendance(student.id, selectedCourseId, 'Lecturer Roster');
        }
      }

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '📋 Attendance Roster Saved',
        message: 'Cohort attendance certified and logged into the POPIA audit trail.',
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'normal'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Live Classroom Attendance Marker
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              SA-SAMS Daily Log
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Class Attendance Register
          </h1>
          <p className="text-xs text-neutral-500">
            Mark attendance status for live classroom lectures and automated DBE reporting
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 bg-[#fbfcf8] text-neutral-900 focus:outline-hidden"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-yellow-300 text-xs font-black shadow-sm flex items-center gap-1.5 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Roster...' : 'Save & Sync Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                <th className="pb-3">Student Name</th>
                <th className="pb-3">Student ID</th>
                <th className="pb-3">Department</th>
                <th className="pb-3 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {students.map(student => {
                const status = attendanceMap[student.id] || 'Present';
                return (
                  <tr key={student.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3 font-bold text-neutral-900">{student.name}</td>
                    <td className="py-3 font-mono text-neutral-600">{student.studentId || '444-STU-8821'}</td>
                    <td className="py-3 text-neutral-700">{student.departmentName}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                        <button
                          onClick={() => handleStatusToggle(student.id, 'Present')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                            status === 'Present' 
                              ? 'bg-emerald-700 text-white shadow-xs' 
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Present</span>
                        </button>
                        <button
                          onClick={() => handleStatusToggle(student.id, 'Late')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                            status === 'Late' 
                              ? 'bg-yellow-400 text-neutral-950 shadow-xs' 
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Late</span>
                        </button>
                        <button
                          onClick={() => handleStatusToggle(student.id, 'Absent')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                            status === 'Absent' 
                              ? 'bg-rose-700 text-white shadow-xs' 
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Absent</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
