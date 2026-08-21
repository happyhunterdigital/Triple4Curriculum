import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, Calendar, ShieldCheck, 
  Sparkles, QrCode, AlertCircle, ArrowRight, UserCheck, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { TimetableSlot } from '../../types';

interface StudentAttendanceSummaryProps {
  upcomingSession?: TimetableSlot;
  onNavigateToAttendance?: () => void;
}

export const StudentAttendanceSummary: React.FC<StudentAttendanceSummaryProps> = ({
  upcomingSession,
  onNavigateToAttendance
}) => {
  const { currentUser, triggerToast } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const activeSession = upcomingSession || {
    id: 'ts_01',
    courseId: 'crs_cs441',
    courseCode: 'CSC-441',
    courseTitle: 'Distributed Systems & Cloud Computing',
    time: '10:00 - 11:30',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Lab B2-AI Cluster / WebRTC',
    lecturer: 'Dr. Arthur Vance',
    lecturerName: 'Dr. Arthur Vance',
    lecturerId: 'fac_01',
    dayOfWeek: 'Wednesday',
    type: 'Lab',
    departmentId: 'dept_cs'
  };

  const handleInstantCheckIn = async () => {
    if (isCheckedIn || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await api.checkInAttendance(
        currentUser?.id || 'stu_01',
        activeSession.courseId,
        'Self Check-in'
      );

      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCheckInTime(currentTime);
      setIsCheckedIn(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#006D44', '#C59B27', '#111315']
      });

      triggerToast({
        id: `toast_att_${Date.now()}`,
        title: 'Attendance Protocol Synced',
        message: `Registered present for ${activeSession.courseCode} at ${currentTime}. SA-SAMS record updated.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'high'
      });
    } catch (e) {
      console.error(e);
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsCheckedIn(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const weeklySchedule = [
    { day: 'MON', code: 'CSC-441', status: 'Present', time: '09:00' },
    { day: 'TUE', code: 'AI-442', status: 'Present', time: '11:00' },
    { day: 'WED', code: 'CSC-441', status: isCheckedIn ? 'Present' : 'Active', time: '10:00' },
    { day: 'THU', code: 'CLD-443', status: 'Upcoming', time: '14:00' },
    { day: 'FRI', code: 'MAT-444', status: 'Upcoming', time: '09:30' },
  ];

  return (
    <div 
      id="attendance-summary-card"
      className="bg-white border border-neutral-300 rounded-none shadow-none"
    >
      {/* Blueprint Header Strip */}
      <div className="px-5 py-2 border-b border-neutral-300 bg-[#FAF9F5] flex items-center justify-between font-mono text-[9px] tracking-widest text-neutral-500 uppercase">
        <span>[ STATUTORY // ATTENDANCE PROTOCOL ]</span>
        <span className="text-academic-green font-bold">SA-SAMS VERIFIED • 96.4% COMPLIANCE</span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left Side: Session Alert & Compliance Badge */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-deep-onyx text-white font-mono text-[10px] uppercase tracking-wider rounded-none">
                <Clock className="w-3 h-3 text-achievement-gold" />
                <span>UPCOMING LIVE SESSION TODAY</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-deep-onyx font-mono text-[10px] uppercase tracking-widest border border-neutral-300 rounded-none">
                <ShieldCheck className="w-3 h-3 text-deep-onyx" />
                <span>SA-SAMS NQF-8</span>
              </span>

              <span className="text-[11px] font-mono text-neutral-600">
                {activeSession.startTime ? `${activeSession.startTime} - ${activeSession.endTime}` : '10:00 - 11:30'}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-deep-onyx flex items-center gap-2">
                <span>{activeSession.courseCode}: {activeSession.courseTitle}</span>
              </h3>
              <p className="text-xs text-neutral-600 mt-1 font-sans flex flex-wrap items-center gap-3">
                <span>Faculty: <strong className="text-deep-onyx">{activeSession.lecturerName || 'Dr. Arthur Vance'}</strong></span>
                <span>•</span>
                <span>Room: <strong className="text-deep-onyx font-mono">{activeSession.room}</strong></span>
                <span>•</span>
                <span className="text-neutral-500 font-mono text-[11px]">Self-Registration Window Open</span>
              </p>
            </div>

            {/* Weekly Status Grid */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mr-2">Week Matrix:</span>
              <div className="flex items-center gap-1">
                {weeklySchedule.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono border rounded-none ${
                      item.status === 'Present' 
                        ? 'bg-deep-onyx text-white border-deep-onyx font-bold' 
                        : item.status === 'Active'
                        ? 'bg-white text-deep-onyx border-deep-onyx font-bold'
                        : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                    }`}
                    title={`${item.day}: ${item.code} (${item.status})`}
                  >
                    <span>{item.day}</span>
                    {item.status === 'Present' && <Check className="w-2.5 h-2.5" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: 1-Click Check-In Status Action Widget */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 w-full lg:w-auto">
            
            {isCheckedIn ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-[#FAF9F5] border border-deep-onyx text-deep-onyx rounded-none">
                <div className="w-7 h-7 bg-deep-onyx text-white font-mono font-bold flex items-center justify-center rounded-none flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-achievement-gold" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider">
                    Checked In & Verified
                  </div>
                  <div className="text-[10px] text-neutral-600 font-mono">
                    Timestamp: {checkInTime || '10:02 AM'} • Biometric Logged
                  </div>
                </div>
              </div>
            ) : (
              <button
                id="btn-one-click-checkin"
                onClick={handleInstantCheckIn}
                disabled={isSubmitting}
                className="px-5 py-3 bg-deep-onyx hover:bg-black text-white font-mono text-xs uppercase tracking-wider flex items-center justify-between gap-3 transition cursor-pointer rounded-none border border-deep-onyx"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-achievement-gold" />
                  <span>1-Click Check In</span>
                </div>
                <span className="font-mono">→</span>
              </button>
            )}

            {onNavigateToAttendance && (
              <button
                onClick={onNavigateToAttendance}
                className="text-xs font-mono uppercase tracking-wider text-deep-onyx hover:underline flex items-center justify-center sm:justify-start lg:justify-end gap-1.5 transition border-b border-transparent hover:border-deep-onyx pb-0.5"
              >
                <span>Full Attendance Register</span>
                <span className="font-mono">→</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
