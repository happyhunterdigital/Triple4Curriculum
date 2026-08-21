import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { TimetableSlot, Course } from '../../types';

export const AdminTimetable: React.FC = () => {
  const { triggerToast } = useAuth();
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  
  // New Slot Form State
  const [courseId, setCourseId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [room, setRoom] = useState('Turing Hall A');
  const [type, setType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');
  const [clashError, setClashError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sList, cList] = await Promise.all([
          api.getTimetable(),
          api.getCourses()
        ]);
        setSlots(sList);
        setCourses(cList);
        if (cList.length > 0) setCourseId(cList[0].id);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setClashError(null);
    setIsSaving(true);

    try {
      const newSlot = await api.createTimetableSlot({
        courseId,
        dayOfWeek,
        startTime,
        endTime,
        room,
        type
      });

      setSlots(prev => [...prev, newSlot]);
      setModalOpen(false);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '🗓️ Class Scheduled',
        message: `${newSlot.courseCode} booked in ${newSlot.room} on ${newSlot.dayOfWeek}. Zero clashes detected.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'normal'
      });
    } catch (err: any) {
      setClashError(err.message || 'Timetable clash detected');
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
              Institutional Master Scheduler
            </span>
            <span className="text-xs font-bold text-yellow-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Automated Clash Detector Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Master Timetable & Room Allocations
          </h1>
          <p className="text-xs text-neutral-500">
            Schedule lecture halls, virtual streaming rooms, and prevent room/faculty overlapping conflicts
          </p>
        </div>

        <button
          id="btn-schedule-class"
          onClick={() => {
            setClashError(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 text-xs font-black shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Class Slot</span>
        </button>
      </div>

      {/* Timetable Table */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider">
                <th className="pb-3">Day</th>
                <th className="pb-3">Time Window</th>
                <th className="pb-3">Course</th>
                <th className="pb-3">Faculty Lecturer</th>
                <th className="pb-3">Room / Stream</th>
                <th className="pb-3 text-right">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {slots.map(slot => (
                <tr key={slot.id} className="hover:bg-neutral-50/80 transition">
                  <td className="py-3 font-bold text-neutral-900">{slot.dayOfWeek}</td>
                  <td className="py-3 font-mono text-emerald-900 font-bold">
                    {slot.startTime} - {slot.endTime}
                  </td>
                  <td className="py-3">
                    <span className="font-mono font-bold text-neutral-900 mr-1.5">{slot.courseCode}</span>
                    <span className="text-neutral-600">{slot.courseTitle}</span>
                  </td>
                  <td className="py-3 text-neutral-700">{slot.lecturerName}</td>
                  <td className="py-3 font-semibold text-neutral-800">{slot.room}</td>
                  <td className="py-3 text-right">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-yellow-100 text-yellow-950 border border-yellow-300">
                      {slot.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal with Clash Detection */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-neutral-900">
                Schedule New Timetable Slot
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold"
              >
                ✕
              </button>
            </div>

            {clashError && (
              <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Clash Resolution Required</p>
                  <p>{clashError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateSlot} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:outline-hidden"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Day</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-neutral-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Turing Hall A"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Slot Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black text-xs shadow-md transition"
                >
                  {isSaving ? 'Validating Clashes...' : 'Book Room & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
