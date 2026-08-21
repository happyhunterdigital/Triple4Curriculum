import React, { useState, useEffect } from 'react';
import { 
  Edit3, Sparkles, BookOpen, Plus, 
  CheckCircle2, Video, Lock, HelpCircle, Layers 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Course, Lecture } from '../../types';

export const LecturerAuthoring: React.FC = () => {
  const { triggerToast } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs_cs201');
  
  // New Lecture Form State
  const [title, setTitle] = useState('');
  const [moduleName, setModuleName] = useState('Module 3: Advanced Architectures');
  const [summary, setSummary] = useState('');
  const [readingNotes, setReadingNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  // AI Quiz Generation State
  const [quizQuestion, setQuizQuestion] = useState('Under the Raft consensus protocol, what happens when a follower node does not receive heartbeats for election_timeout duration?');
  const [quizOptions, setQuizOptions] = useState<string[]>([
    'It transitions to Candidate state, increments currentTerm, and requests votes from peers',
    'It shuts down its socket server',
    'It immediately writes to disk without consensus',
    'It resets the cluster master clock'
  ]);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState<number>(0);
  const [quizExplanation, setQuizExplanation] = useState('When the heartbeat timer expires without leader contact, the follower assumes leader failure and transitions to Candidate.');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const cList = await api.getCourses();
        setCourses(cList);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleGenerateAiQuiz = async () => {
    setIsGeneratingAi(true);
    try {
      const topic = title || 'Distributed Systems & Adaptive Streaming Protocols';
      const aiResult = await api.generateAiQuiz(topic, 'Undergraduate 444 Curriculum Level');
      
      setQuizQuestion(aiResult.question);
      setQuizOptions(aiResult.options);
      setQuizCorrectIndex(aiResult.correctIndex);
      setQuizExplanation(aiResult.explanation);

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '🤖 AI Checkpoint Generated',
        message: 'High-yield quiz question and options constructed via server-side Gemini intelligence.',
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'normal'
      });
    } catch (e) {
      console.error('AI Quiz error:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const newLec = await api.createLecture({
        courseId: selectedCourseId,
        title: title.trim(),
        moduleName: moduleName.trim(),
        summary: summary || 'Comprehensive academic lecture module covering 444 Curriculum principles.',
        readingNotes: readingNotes || 'Key reading notes and reference theorems for this module.',
        videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quiz: {
          question: quizQuestion,
          options: quizOptions,
          correctIndex: quizCorrectIndex,
          explanation: quizExplanation,
          xpReward: 150
        }
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '📚 Module Published!',
        message: `"${newLec.title}" is now active in the student learning portal with DRM encryption.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'high'
      });

      // Reset form
      setTitle('');
      setSummary('');
      setReadingNotes('');
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
              Course & Curriculum Authoring Suite
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Drip Feeding • AI Assessment Builder
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Author New Lecture Module
          </h1>
          <p className="text-xs text-neutral-500">
            Publish interactive multimedia lessons, ABS stream definitions, and AI-assisted checkpoint quizzes
          </p>
        </div>
      </div>

      {/* Authoring Form */}
      <form onSubmit={handleSaveLecture} className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-950/10 shadow-xs space-y-6">
        
        {/* Course & Module Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Target Academic Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-neutral-300 bg-[#fbfcf8] text-neutral-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Module Pathway Section
            </label>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="e.g. Module 3: Distributed State Machines"
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Lecture Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lecture 3: Raft Consensus Invariants & Byzantine Fault Tolerance"
            className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        {/* Video URL & ABS Info */}
        <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-yellow-400 flex items-center gap-1.5">
              <Video className="w-4 h-4" /> Adaptive Bitrate Video Source
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">HLS / MP4 CDN</span>
          </div>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-700 bg-neutral-950 text-white focus:outline-hidden font-mono"
          />
          <p className="text-[11px] text-neutral-400">
            System automatically encodes source into 1080p, 720p, and 480p ABS ladders with dynamic DRM watermarking on delivery.
          </p>
        </div>

        {/* Summary & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Pedagogical Summary
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Outline the core learning objectives according to the 444 Curriculum..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Interactive Reading Notes (Markdown / Formulations)
            </label>
            <textarea
              rows={4}
              value={readingNotes}
              onChange={(e) => setReadingNotes(e.target.value)}
              placeholder="Include mathematical formulations, theorems, code snippets, and glossaries..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        {/* Embedded AI Quiz Section */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-yellow-50 via-emerald-50 to-white border-2 border-yellow-400 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-yellow-900 font-black text-sm">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <span>Embedded Checkpoint Assessment & AI Assistant</span>
              </div>
              <p className="text-xs text-neutral-600">
                Gamified XP quiz embedded at the end of this lecture module
              </p>
            </div>

            <button
              type="button"
              id="btn-generate-ai-quiz"
              onClick={handleGenerateAiQuiz}
              disabled={isGeneratingAi}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-yellow-300 text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? 'Synthesizing with Gemini...' : 'Generate with AI Assistant'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Assessment Question
            </label>
            <input
              type="text"
              value={quizQuestion}
              onChange={(e) => setQuizQuestion(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">
              Multiple Choice Options (Select the correct radio button)
            </label>
            {quizOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-option"
                  checked={quizCorrectIndex === idx}
                  onChange={() => setQuizCorrectIndex(idx)}
                  className="accent-emerald-800"
                />
                <span className="font-mono font-bold text-xs text-neutral-700">{String.fromCharCode(65 + idx)}.</span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...quizOptions];
                    newOpts[idx] = e.target.value;
                    setQuizOptions(newOpts);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-hidden"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Pedagogical Explanation
            </label>
            <input
              type="text"
              value={quizExplanation}
              onChange={(e) => setQuizExplanation(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="submit"
            disabled={isSaving || !title.trim()}
            className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-yellow-300 font-black text-xs shadow-md flex items-center gap-2 transition transform hover:scale-105"
          >
            <BookOpen className="w-4 h-4" />
            <span>{isSaving ? 'Publishing Module...' : 'Publish Module to 444 Syllabus'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
