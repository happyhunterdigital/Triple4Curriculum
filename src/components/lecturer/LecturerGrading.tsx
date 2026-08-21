import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, CheckCircle2, FileText, Send, 
  Award, Sparkles, User, MessageSquare, Shield, ChevronLeft, ChevronRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Assignment, AssignmentSubmission } from '../../types';

export const LecturerGrading: React.FC = () => {
  const { currentUser, triggerToast } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  
  // SpeedGrader Form State
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [feedbackText, setFeedbackText] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [aList, sList] = await Promise.all([
          api.getAssignments(),
          api.getSubmissions()
        ]);
        setAssignments(aList);
        setSubmissions(sList);
        if (sList.length > 0) {
          selectSubmissionForGrading(sList[0], aList);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const selectSubmissionForGrading = (sub: AssignmentSubmission, aList: Assignment[] = assignments) => {
    setSelectedSubmission(sub);
    const parentAssignment = aList.find(a => a.id === sub.assignmentId);
    
    // Initialize rubric scores
    const initialScores: Record<string, number> = {};
    parentAssignment?.rubric.forEach(r => {
      initialScores[r.id] = sub.rubricScores?.[r.id] ?? Math.round(r.maxScore * 0.9);
    });
    setRubricScores(initialScores);
    setFeedbackText(sub.feedback || 'Excellent execution of the core requirements with clean modular architecture.');
  };

  const currentAssignment = assignments.find(a => a.id === selectedSubmission?.assignmentId);

  const calculateTotalGrade = (): number => {
    return Object.values(rubricScores).reduce<number>((acc, curr) => acc + (Number(curr) || 0), 0);
  };

  const handleScoreChange = (criterionId: string, val: number, max: number) => {
    const clamped = Math.min(Math.max(0, val), max);
    setRubricScores(prev => ({
      ...prev,
      [criterionId]: clamped
    }));
  };

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsGrading(true);
    const calculatedGrade = calculateTotalGrade();

    try {
      const res = await api.gradeSubmission(selectedSubmission.id, {
        grade: calculatedGrade,
        feedback: feedbackText,
        rubricScores,
        graderName: currentUser?.name || 'Dr. Arthur Vance'
      });

      // Update local state
      setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? res.submission : s));
      setSelectedSubmission(res.submission);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308', '#22c55e']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '🎯 Grade Released to Student',
        message: `Evaluation published for ${selectedSubmission.studentName}: ${calculatedGrade}/${selectedSubmission.maxGrade} Pts.`,
        category: 'grading',
        timestamp: 'Just now',
        read: false,
        priority: 'high'
      });
    } catch (e) {
      console.error('SpeedGrader grade submit error:', e);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Canvas-Inspired SpeedGrader™ Suite
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Weighted Rubrics • Instant Passback & Automated Notifications
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            SpeedGrader Assignment Evaluation
          </h1>
          <p className="text-xs text-neutral-500">
            Review student submissions, score weighted rubrics, and deliver verified faculty feedback
          </p>
        </div>
      </div>

      {/* Main 2-Column SpeedGrader Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Submission Queue */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Grading Queue ({submissions.length})
          </h3>

          <div className="space-y-2.5">
            {submissions.map(sub => {
              const isSelected = selectedSubmission?.id === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => selectSubmissionForGrading(sub)}
                  className={`w-full text-left p-4 rounded-2xl border transition flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-emerald-50/90 border-emerald-800 ring-2 ring-emerald-700 shadow-sm' 
                      : 'bg-white border-neutral-200 hover:border-emerald-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-neutral-900">{sub.studentName}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        sub.status === 'graded' 
                          ? 'bg-emerald-100 text-emerald-900' 
                          : 'bg-yellow-100 text-yellow-900'
                      }`}>
                        {sub.status === 'graded' ? `${sub.grade}/${sub.maxGrade}` : 'Needs Grading'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 truncate">{sub.assignmentTitle}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-200/60 text-[10px] text-neutral-500 font-mono">
                    <span>{sub.fileName}</span>
                    <span>{sub.submittedAt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: SpeedGrader Workspace */}
        <div className="lg:col-span-2 space-y-5">
          {selectedSubmission && currentAssignment ? (
            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-6">
              
              {/* Submission Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-neutral-900 text-yellow-400 font-mono text-xs font-bold">
                      {currentAssignment.courseCode}
                    </span>
                    <span className="text-xs font-bold text-neutral-600">
                      {currentAssignment.title}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-neutral-900 mt-1">
                    Student: {selectedSubmission.studentName} ({selectedSubmission.studentEmail})
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-neutral-500">Submitted at</span>
                  <p className="font-mono text-xs font-bold text-neutral-900">{selectedSubmission.submittedAt}</p>
                </div>
              </div>

              {/* Artifact Viewer Simulation */}
              <div className="p-5 rounded-2xl bg-neutral-900 text-white space-y-3 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-yellow-400" />
                    <span className="font-mono text-xs font-bold text-yellow-300">
                      {selectedSubmission.fileName} ({selectedSubmission.fileSizeKb} KB)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-500">
                    Encrypted Checksum Verified
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 leading-relaxed">
                  <p className="text-neutral-500 font-bold mb-1">// Student Submission Notes & Architecture:</p>
                  {selectedSubmission.contentNotes}
                </div>
              </div>

              {/* SpeedGrader Weighted Rubric Form */}
              <form onSubmit={handleSubmitGrade} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      SpeedGrader™ Weighted Rubric Scoring
                    </h4>
                    <div className="text-sm font-black text-emerald-900 bg-yellow-100 px-3 py-1 rounded-xl border border-yellow-300">
                      Total Calculated Grade: {calculateTotalGrade()} / {currentAssignment.maxPoints} Pts
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentAssignment.rubric.map(criterion => {
                      const score = rubricScores[criterion.id] ?? 0;
                      return (
                        <div 
                          key={criterion.id}
                          className="p-4 rounded-xl border border-neutral-200 bg-[#fbfcf8] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-neutral-900">{criterion.title}</h5>
                              <p className="text-[11px] text-neutral-500">{criterion.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <input
                                type="number"
                                min={0}
                                max={criterion.maxScore}
                                value={score}
                                onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value) || 0, criterion.maxScore)}
                                className="w-16 px-2 py-1 text-xs font-bold text-center rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                              />
                              <span className="text-xs font-bold text-neutral-500">/ {criterion.maxScore}</span>
                            </div>
                          </div>

                          {/* Range Slider for rapid grading */}
                          <input
                            type="range"
                            min={0}
                            max={criterion.maxScore}
                            value={score}
                            onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value) || 0, criterion.maxScore)}
                            className="w-full accent-emerald-800 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Faculty Feedback Notes */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Faculty Feedback & Annotation Comments
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide constructive feedback aligning with the 444 Curriculum principles..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-neutral-300 bg-[#fbfcf8] focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                  <button
                    type="submit"
                    disabled={isGrading}
                    className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-yellow-300 font-black text-xs shadow-md flex items-center gap-2 transition transform hover:scale-105"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>{isGrading ? 'Publishing Grade...' : 'Save & Publish Grade to Student Portal'}</span>
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-neutral-500 border border-neutral-200">
              Select a submission from the queue on the left to begin SpeedGrader evaluation.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
