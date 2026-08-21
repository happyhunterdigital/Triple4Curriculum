import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, Settings, Shield, 
  CheckCircle2, HelpCircle, Award, Sparkles, BookOpen, 
  Layers, Lock, Download, Video, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Lecture, Course } from '../../types';

export const StudentLectures: React.FC = () => {
  const { currentUser, refreshCurrentUser, triggerToast } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs_cs201');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [selectedBitrate, setSelectedBitrate] = useState<string>('Auto (Adaptive)');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  
  // Interactive Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'quiz'>('video');

  useEffect(() => {
    async function load() {
      try {
        const [cList, lList] = await Promise.all([
          api.getCourses(),
          api.getLectures(selectedCourseId)
        ]);
        setCourses(cList);
        setLectures(lList);
        if (lList.length > 0) {
          setActiveLecture(lList[0]);
        }
      } catch (e) {
        console.error('Failed to load lectures:', e);
      }
    }
    load();
  }, [selectedCourseId]);

  const handleSelectLecture = (lec: Lecture) => {
    setActiveLecture(lec);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setIsPlaying(false);
  };

  const handleQuizSubmit = async () => {
    if (selectedOption === null || !activeLecture?.quiz) return;
    
    const isRight = selectedOption === activeLecture.quiz.correctIndex;
    setQuizCorrect(isRight);
    setQuizSubmitted(true);

    if (isRight) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#eab308', '#15803d', '#22c55e']
      });

      // Call completion API
      try {
        await api.completeLecture(activeLecture.id, currentUser?.id || 'stu_01', true);
        await refreshCurrentUser();
        triggerToast({
          id: `toast_${Date.now()}`,
          title: '🎉 +150 XP Earned!',
          message: `Flawless quiz answer on "${activeLecture.title}". Academic streak updated.`,
          category: 'streak',
          timestamp: 'Just now',
          read: false,
          priority: 'high'
        });
      } catch (err) {
        console.error('Error recording completion:', err);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Course Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Interactive E-Learning Hub
            </span>
            <span className="text-xs font-bold text-yellow-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> DRM Encrypted
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Course Lectures & Cognitive Modules
          </h1>
          <p className="text-xs text-neutral-500">
            Powered by Adaptive Bitrate Streaming (ABS) and Dynamic Watermark Protection
          </p>
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-neutral-600">Active Course:</label>
          <select
            id="select-active-course"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-neutral-300 bg-[#fbfcf8] text-neutral-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Lecture Arena: Player & Playlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Player, Tabs (Video, Notes, Checkpoint Quiz) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Active Lecture Header */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-950/10 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-yellow-400 font-bold flex items-center justify-center">
                #{activeLecture?.order || 1}
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  {activeLecture?.moduleName}
                </span>
                <h2 className="text-base font-black text-neutral-900">
                  {activeLecture?.title}
                </h2>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                id="btn-tab-video"
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'video' ? 'bg-white text-emerald-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Video Player
              </button>
              <button
                id="btn-tab-notes"
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'notes' ? 'bg-white text-emerald-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Interactive Notes
              </button>
              <button
                id="btn-tab-quiz"
                onClick={() => setActiveTab('quiz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === 'quiz' ? 'bg-yellow-400 text-neutral-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quiz Checkpoint</span>
              </button>
            </div>
          </div>

          {/* TAB 1: VIDEO PLAYER WITH DRM & ABS */}
          {activeTab === 'video' && (
            <div className="bg-neutral-950 rounded-2xl overflow-hidden shadow-xl border border-neutral-800 relative group">
              
              {/* Dynamic Watermark Overlay (DRM Anti-Piracy Protection) */}
              <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-40 select-none font-mono text-[11px] text-yellow-300 bg-neutral-900/80 px-2.5 py-1 rounded border border-yellow-400/30">
                DRM: {currentUser?.email || 'sarah.k@triple4c.edu'} • ID: {currentUser?.studentId || '444-STU-8821'}
              </div>

              {/* Video Simulated Stage */}
              <div className="aspect-video w-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 flex flex-col items-center justify-center p-8 text-center relative">
                
                {/* Floating animated watermark across center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 font-black text-2xl text-white select-none rotate-[-15deg]">
                  TRIPLE 4C • {currentUser?.studentId} • CONFIDENTIAL
                </div>

                <div className="w-20 h-20 rounded-full bg-yellow-400 text-neutral-950 flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition transform group-hover:bg-yellow-300"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-neutral-950" /> : <Play className="w-8 h-8 fill-neutral-950 ml-1" />}
                </div>

                <h3 className="text-white text-base font-bold mt-4 max-w-md">
                  {activeLecture?.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Duration: {activeLecture?.videoDurationMinutes} mins • {selectedBitrate}
                </p>

                {isPlaying && (
                  <div className="mt-3 px-3 py-1 rounded-full bg-emerald-900/80 text-emerald-300 text-xs font-mono border border-emerald-500 animate-pulse">
                    Streaming HLS Segments • ABS Network Active
                  </div>
                )}
              </div>

              {/* Video Controls Bar */}
              <div className="bg-neutral-900 p-3.5 flex flex-wrap items-center justify-between gap-3 text-white border-t border-neutral-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-yellow-400 transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsPlaying(false)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                    title="Restart"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    <span>14:20</span>
                    <span>/</span>
                    <span>{activeLecture?.videoDurationMinutes}:00</span>
                  </div>
                </div>

                {/* Adaptive Bitrate & Speed Selectors */}
                <div className="flex items-center gap-3">
                  {/* Speed Selector */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-neutral-400">Speed:</span>
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="bg-neutral-800 text-xs font-bold text-yellow-300 rounded px-1.5 py-1 border border-neutral-700 focus:outline-hidden"
                    >
                      <option value={1.0}>1.0x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2.0}>2.0x</option>
                    </select>
                  </div>

                  {/* ABS Selector */}
                  <div className="flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-yellow-400" />
                    <select
                      id="select-bitrate-quality"
                      value={selectedBitrate}
                      onChange={(e) => setSelectedBitrate(e.target.value)}
                      className="bg-neutral-800 text-xs font-bold text-emerald-300 rounded px-2 py-1 border border-neutral-700 focus:outline-hidden"
                    >
                      {activeLecture?.bitrates.map(b => (
                        <option key={b.label} value={b.label}>
                          {b.label} ({b.resolution})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE READING NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <BookOpen className="w-5 h-5" />
                  <span>Module Reading Notes & Formulations</span>
                </div>
                <button
                  onClick={() => alert('Offline PDF generated with cryptographic DRM stamp.')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Stamped PDF</span>
                </button>
              </div>

              <div className="prose max-w-none text-neutral-800 text-sm leading-relaxed space-y-3">
                <p className="font-semibold text-emerald-950">
                  {activeLecture?.summary}
                </p>
                <div className="p-4 rounded-xl bg-[#fbfcf8] border border-emerald-900/10 font-mono text-xs text-neutral-800 whitespace-pre-wrap">
                  {activeLecture?.readingNotes}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHECKPOINT QUIZ */}
          {activeTab === 'quiz' && activeLecture?.quiz && (
            <div className="bg-white rounded-2xl p-6 border-2 border-yellow-400 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-yellow-100 text-yellow-900 font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-neutral-900">Checkpoint Assessment</h3>
                    <p className="text-xs text-neutral-500">Test your mastery to claim +150 XP & reinforce your streak</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 font-bold text-xs border border-yellow-300">
                  +150 XP Reward
                </span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-bold text-sm">
                {activeLecture.quiz.question}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {activeLecture.quiz.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  let optStyle = 'border-neutral-200 bg-white hover:border-emerald-500 text-neutral-800';
                  
                  if (quizSubmitted) {
                    if (idx === activeLecture.quiz?.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400';
                    } else if (isSelected && !quizCorrect) {
                      optStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-yellow-500 bg-yellow-50 text-neutral-950 font-bold ring-2 ring-yellow-400';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => !quizSubmitted && setSelectedOption(idx)}
                      disabled={quizSubmitted}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between ${optStyle}`}
                    >
                      <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                      {quizSubmitted && idx === activeLecture.quiz?.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit / Result feedback */}
              {!quizSubmitted ? (
                <button
                  id="btn-submit-checkpoint-quiz"
                  onClick={handleQuizSubmit}
                  disabled={selectedOption === null}
                  className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-yellow-300 font-black text-xs shadow-md transition"
                >
                  Submit Answer & Claim XP
                </button>
              ) : (
                <div className={`p-4 rounded-xl text-xs ${
                  quizCorrect ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' : 'bg-rose-50 border border-rose-300 text-rose-900'
                }`}>
                  <p className="font-bold mb-1">
                    {quizCorrect ? '✅ Correct! High-Yield Understanding.' : '❌ Review the explanation below:'}
                  </p>
                  <p className="leading-relaxed">{activeLecture.quiz.explanation}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Col: Course Syllabus & Module Playlist */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-emerald-950/10 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-black text-neutral-900">Course Modules</h3>
              </div>
              <span className="text-[11px] font-bold text-neutral-500">
                {lectures.length} Lectures
              </span>
            </div>

            <div className="space-y-2.5">
              {lectures.map((lec) => {
                const isActive = activeLecture?.id === lec.id;
                return (
                  <button
                    key={lec.id}
                    onClick={() => handleSelectLecture(lec)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-start gap-3 ${
                      isActive 
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs' 
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      lec.completed 
                        ? 'bg-emerald-700 text-white' 
                        : isActive 
                        ? 'bg-neutral-900 text-yellow-300' 
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {lec.completed ? <Check className="w-3.5 h-3.5" /> : lec.order}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold truncate">
                        {lec.moduleName}
                      </p>
                      <h5 className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                        {lec.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-1">
                        <span>{lec.videoDurationMinutes} mins</span>
                        <span>•</span>
                        <span>Quiz (+150 XP)</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drip Feed & Academic Schedule Card */}
          <div className="p-4 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 mb-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Drip-Feed Pacing Policy</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Module 3 unlocks next Monday at 08:00 SAST to ensure steady pedagogical assimilation and deep group discussion.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
