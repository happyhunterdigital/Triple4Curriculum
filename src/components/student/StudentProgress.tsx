import React, { useState } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  ShieldCheck, Zap, Trophy, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { Course, Badge } from '../../types';

interface StudentProgressProps {
  courses?: Course[];
  badges?: Badge[];
  onNavigateToCourse?: (courseId: string) => void;
}

export const StudentProgress: React.FC<StudentProgressProps> = ({
  courses = [],
  badges = [],
  onNavigateToCourse
}) => {
  const { currentUser } = useAuth();
  const [activeRange, setActiveRange] = useState<'term' | 'annual'>('term');

  // Academic Course Completion Data
  const courseCompletionData = courses.length > 0 ? courses.map(c => ({
    name: c.code,
    title: c.title,
    progress: c.progressPercent || Math.floor(Math.random() * 30 + 65),
    credits: c.credits,
    target: 100
  })) : [
    { name: 'CSC-441', title: 'Distributed Systems', progress: 84, credits: 16, target: 100 },
    { name: 'AI-442', title: 'Applied AI & Ethics', progress: 92, credits: 16, target: 100 },
    { name: 'CLD-443', title: 'Cloud Infrastructure', progress: 76, credits: 14, target: 100 },
    { name: 'MAT-444', title: 'Applied Cryptography', progress: 68, credits: 14, target: 100 },
  ];

  // Weekly Study Hours & Telemetry Data
  const weeklyStudyTelemetry = [
    { day: 'MON', hours: 4.5, quizzes: 2, xp: 220 },
    { day: 'TUE', hours: 5.2, quizzes: 3, xp: 310 },
    { day: 'WED', hours: 6.8, quizzes: 4, xp: 450 },
    { day: 'THU', hours: 3.9, quizzes: 1, xp: 180 },
    { day: 'FRI', hours: 5.0, quizzes: 3, xp: 290 },
    { day: 'SAT', hours: 7.2, quizzes: 5, xp: 520 },
    { day: 'SUN', hours: 4.1, quizzes: 2, xp: 210 },
  ];

  // 4-Pillar Mastery Breakdown Data
  const pillarMasteryData = [
    { name: 'Character & Ethics', score: 94, fill: '#006D44' },
    { name: 'Competencies & Theory', score: 88, fill: '#C59B27' },
    { name: 'Laboratory Simulation', score: 91, fill: '#111315' },
    { name: 'SpeedGrader Rubrics', score: 85, fill: '#006D44' }
  ];

  // Badge Status & Earned Stats
  const earnedBadgesCount = 6;
  const totalBadgesCount = 8;
  const badgeCompletionPercent = Math.round((earnedBadgesCount / totalBadgesCount) * 100);

  const displayBadges = [
    { id: 'b1', name: 'Senate Pioneer', icon: '🚀', category: 'Academic', xp: 500, unlocked: true, desc: 'Ranked in top 5% of cohort' },
    { id: 'b2', name: '7-Day Streak', icon: '🔥', category: 'Habit', xp: 350, unlocked: true, desc: 'Consistent daily attendance' },
    { id: 'b3', name: 'Quiz Master', icon: '🧠', category: 'Mastery', xp: 400, unlocked: true, desc: 'Scored 100% on 10 quizzes' },
    { id: 'b4', name: 'SpeedGrader Ace', icon: '⚡', category: 'Milestone', xp: 300, unlocked: true, desc: 'All rubrics submitted on time' },
    { id: 'b5', name: 'POPIA Guardian', icon: '🛡️', category: 'Compliance', xp: 450, unlocked: true, desc: '100% data ethics score' },
    { id: 'b6', name: 'AI Explorer', icon: '✨', category: 'Innovation', xp: 350, unlocked: true, desc: 'Used 444 Copilot 50+ times' },
    { id: 'b7', name: 'Metaverse Scholar', icon: '🌐', category: 'Simulation', xp: 500, unlocked: false, desc: 'Complete 3D Lab Simulation' },
    { id: 'b8', name: 'Senate Laureate', icon: '👑', category: 'Honours', xp: 1000, unlocked: false, desc: 'Achieve Level 10 Scholar' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Architectural Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-neutral-300 rounded-none shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-neutral-100 text-deep-onyx border border-neutral-300 rounded-none">
              DHET NQF-8 TELEMETRY
            </span>
            <span className="text-xs font-mono text-neutral-600 flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-academic-green" /> SA-SAMS TRANSCRIPT VERIFIED
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-deep-onyx mt-1">
            Academic Performance & Mastery Telemetry
          </h2>
          <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mt-0.5">
            Module Completion Rates, Effort Hours & Senate Milestones
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#FAF9F5] p-1 border border-neutral-300 rounded-none">
          <button
            onClick={() => setActiveRange('term')}
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition cursor-pointer rounded-none border ${
              activeRange === 'term'
                ? 'bg-deep-onyx text-white border-deep-onyx font-bold'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-deep-onyx'
            }`}
          >
            Term 3 Active
          </button>
          <button
            onClick={() => setActiveRange('annual')}
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition cursor-pointer rounded-none border ${
              activeRange === 'annual'
                ? 'bg-deep-onyx text-white border-deep-onyx font-bold'
                : 'bg-white text-neutral-600 border-neutral-300 hover:border-deep-onyx'
            }`}
          >
            Full Academic Year
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN ARCHITECTURAL ANALYTICS MATRIX */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Course Completion Rates (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-neutral-300 rounded-none shadow-none flex flex-col justify-between">
          <div className="p-4 border-b border-neutral-300 bg-[#FAF9F5] flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block">
                [ MODULE MASTERY MATRIX ]
              </span>
              <h3 className="text-base font-serif font-bold text-deep-onyx">
                Course Completion Rates (%)
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-600 font-bold">
              AVG: 80.0%
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="p-6">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#111315' }} stroke="#D1D5DB" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#4B5563' }} stroke="#D1D5DB" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-deep-onyx text-white p-3 border border-achievement-gold font-mono text-xs rounded-none">
                            <p className="font-bold text-achievement-gold">{data.name}: {data.title}</p>
                            <p className="text-white mt-1">Progress: {data.progress}%</p>
                            <p className="text-neutral-400 text-[10px]">Credits: {data.credits} pts</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="progress" 
                    fill="#006D44" 
                    radius={[0, 0, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 border border-neutral-300 divide-x divide-y sm:divide-y-0 divide-neutral-300 mt-4">
              {courseCompletionData.map((c, i) => (
                <div key={i} className="p-2.5 bg-[#FAF9F5] text-xs">
                  <p className="font-mono font-bold text-deep-onyx truncate">{c.name}</p>
                  <div className="flex items-center justify-between mt-1 font-mono">
                    <span className="text-academic-green font-bold">{c.progress}%</span>
                    <span className="text-[10px] text-neutral-500">{c.credits} Cr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Study Telemetry (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-neutral-300 rounded-none shadow-none flex flex-col justify-between">
          <div className="p-4 border-b border-neutral-300 bg-[#FAF9F5] flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block">
                [ TIME // EFFORT TELEMETRY ]
              </span>
              <h3 className="text-base font-serif font-bold text-deep-onyx">
                Weekly Study Time (Hours)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-academic-green">
              36.7 HRS TOTAL
            </span>
          </div>

          <div className="p-6">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyStudyTelemetry} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#111315' }} stroke="#D1D5DB" />
                  <YAxis domain={[0, 8]} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#4B5563' }} stroke="#D1D5DB" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-deep-onyx text-white p-3 border border-academic-green font-mono text-xs rounded-none">
                            <p className="font-bold text-achievement-gold">{data.day} Log</p>
                            <p className="text-white mt-0.5">Hours: {data.hours} hrs</p>
                            <p className="text-neutral-400 text-[10px]">XP: +{data.xp} pts</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="linear" 
                    dataKey="hours" 
                    stroke="#006D44" 
                    strokeWidth={2}
                    fill="#E6F3EC" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#FAF9F5] border border-neutral-300 mt-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-achievement-gold" />
                <span className="font-bold text-academic-green">PACE: 124% OF QUOTA</span>
              </div>
              <span className="text-[10px] text-neutral-600">EXCEEDS 30 HRS/WEEK STANDARD</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* BADGE SHOWCASE & 4-PILLAR MASTERY MATRIX */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Badges Earned (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-neutral-300 rounded-none shadow-none space-y-0">
          <div className="p-4 border-b border-neutral-300 bg-[#FAF9F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-deep-onyx text-achievement-gold border border-deep-onyx flex items-center justify-center rounded-none font-mono">
                <Trophy className="w-4 h-4 text-achievement-gold" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-deep-onyx">
                  Senate Honours Badges
                </h3>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                  {earnedBadgesCount} of {totalBadgesCount} unlocked ({badgeCompletionPercent}%)
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base font-mono font-bold text-academic-green">
                2,450 XP
              </span>
            </div>
          </div>

          {/* Badge Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {displayBadges.map(b => (
                <div 
                  key={b.id}
                  className={`p-3 border transition-all flex flex-col justify-between space-y-2 rounded-none ${
                    b.unlocked
                      ? 'bg-white border-neutral-300 hover:border-deep-onyx'
                      : 'bg-neutral-50 border-dashed border-neutral-300 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{b.icon}</span>
                    <span className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded-none ${
                      b.unlocked 
                        ? 'bg-deep-onyx text-achievement-gold' 
                        : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      +{b.xp} XP
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-serif font-bold text-deep-onyx truncate">
                      {b.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5 font-sans">
                      {b.desc}
                    </p>
                  </div>

                  <div className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1 pt-1 border-t border-neutral-100">
                    {b.unlocked ? (
                      <span className="text-academic-green flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" /> UNLOCKED
                      </span>
                    ) : (
                      <span className="text-neutral-400">LOCKED</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4-Pillar Curriculum Mastery Breakdown (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-neutral-300 rounded-none shadow-none flex flex-col justify-between">
          <div className="p-4 border-b border-neutral-300 bg-[#FAF9F5] flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block">
                [ ACCREDITATION // 444 ARCHITECTURE ]
              </span>
              <h3 className="text-base font-serif font-bold text-deep-onyx">
                Pillar Mastery Breakdown
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-academic-green text-white rounded-none">
              89.5%
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {pillarMasteryData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-800 uppercase tracking-wider">{item.name}</span>
                    <span className="font-bold text-deep-onyx">{item.score}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1.5 rounded-none overflow-hidden">
                    <div 
                      className="h-full rounded-none"
                      style={{ 
                        width: `${item.score}%`,
                        backgroundColor: item.fill 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#FAF9F5] border border-neutral-300 flex items-center justify-between text-xs font-mono mt-4">
              <span className="text-neutral-700">
                HONOURS TRACK: <strong className="text-deep-onyx">DISTINCTION (CUM LAUDE)</strong>
              </span>
              <span className="text-academic-green font-bold">ON TARGET</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
