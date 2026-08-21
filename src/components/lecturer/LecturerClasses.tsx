import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Mail, CheckCircle2, Search, Award, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { Course, User } from '../../types';

export const LecturerClasses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cList, uList] = await Promise.all([
          api.getCourses(),
          api.getUsers()
        ]);
        setCourses(cList);
        setStudents(uList.filter(u => u.role === 'student'));
        if (cList.length > 0) setSelectedCourse(cList[0]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Cohort Management & Rosters
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Triple 4C Academic Directory
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            My Classes & Student Cohorts
          </h1>
          <p className="text-xs text-neutral-500">
            View active course registrations, individual mastery levels, streaks, and contact students
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student roster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourse(course)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              selectedCourse?.id === course.id 
                ? 'bg-emerald-800 text-yellow-300 shadow-sm border border-emerald-900' 
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <span className="font-mono">{course.code}</span>
            <span>•</span>
            <span>{course.title}</span>
          </button>
        ))}
      </div>

      {/* Cohort Roster Table */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-black text-neutral-900">
              Enrolled Students ({filteredStudents.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Class Roster for {selectedCourse?.code}: {selectedCourse?.title}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 text-xs font-bold">
            Semester 2 - 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                <th className="pb-3">Student Name & ID</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Academic Department</th>
                <th className="pb-3">Gamified Level & XP</th>
                <th className="pb-3">Streak</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-neutral-50/80 transition">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-800 text-yellow-300 font-bold text-xs flex items-center justify-center">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900">{student.name}</p>
                        <p className="font-mono text-[11px] text-neutral-500">{student.studentId || '444-STU-8821'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-neutral-600">{student.email}</td>
                  <td className="py-3 text-neutral-700">{student.departmentName || 'Computer Science'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-bold text-[10px]">
                        LVL {student.level || 1}
                      </span>
                      <span className="font-bold text-emerald-900">{student.xp || 0} XP</span>
                    </div>
                  </td>
                  <td className="py-3 font-bold text-amber-700">
                    🔥 {student.streakDays || 1} Days
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Enrolled
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
