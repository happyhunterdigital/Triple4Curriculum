import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Users, CheckCircle2, Filter, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { TimetableSlot } from '../../types';

export const StudentTimetable: React.FC = () => {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getTimetable();
        setSlots(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredSlots = selectedDay === 'All' 
    ? slots 
    : slots.filter(s => s.dayOfWeek === selectedDay);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 border border-yellow-300">
              Semester 2 Master Schedule
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Triple 4C Curriculum
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Class Timetable & Live Stream Schedule
          </h1>
          <p className="text-xs text-neutral-500">
            Synchronized with Academic Room Allocations & Live Lecture Streams
          </p>
        </div>

        {/* Day Filter */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto">
          {days.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedDay === d ? 'bg-emerald-800 text-yellow-300 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSlots.map(slot => (
          <div 
            key={slot.id}
            className="bg-white rounded-2xl p-5 border border-emerald-950/10 hover:border-emerald-500 shadow-xs transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-mono font-bold px-2.5 py-1 rounded-md bg-neutral-900 text-yellow-400">
                  {slot.courseCode}
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                  slot.type === 'Lecture' ? 'bg-emerald-100 text-emerald-900' :
                  slot.type === 'Lab' ? 'bg-amber-100 text-amber-900' :
                  'bg-blue-100 text-blue-900'
                }`}>
                  {slot.type}
                </span>
              </div>

              <h3 className="text-sm font-black text-neutral-900 group-hover:text-emerald-900 transition line-clamp-2">
                {slot.courseTitle}
              </h3>
              
              <div className="mt-4 space-y-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-800 flex-shrink-0" />
                  <span className="font-semibold">{slot.dayOfWeek}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <span className="font-semibold">{slot.startTime} – {slot.endTime} SAST</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span className="truncate">{slot.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span>{slot.lecturerName}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-800">
                Mandatory Attendance
              </span>
              {slot.onlineLink && (
                <a
                  href={slot.onlineLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-bold text-xs shadow-xs transition"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Live Stream</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
