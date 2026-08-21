import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, CheckCircle2, Clock, 
  AlertTriangle, FileUp, Sparkles, ChevronRight, Award, MessageSquare 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Assignment, AssignmentSubmission } from '../../types';

export const StudentAssignments: React.FC = () => {
  const { currentUser, triggerToast } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  
  // Submission Form State
  const [uploadFileName, setUploadFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [aList, sList] = await Promise.all([
          api.getAssignments(),
          api.getSubmissions()
        ]);
        setAssignments(aList);
        setSubmissions(sList);
        if (aList.length > 0) {
          setSelectedAssignment(aList[0]);
        }
      } catch (err) {
        console.error('Failed to load assignments:', err);
      }
    }
    load();
  }, []);

  const currentSubmission = submissions.find(
    s => s.assignmentId === selectedAssignment?.id && s.studentId === (currentUser?.id || 'stu_01')
  );

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setIsSubmitting(true);
    try {
      const fileName = uploadFileName.trim() || `${currentUser?.name.replace(/\s+/g, '_')}_Assignment.zip`;
      const res = await api.submitAssignment(selectedAssignment.id, {
        studentId: currentUser?.id || 'stu_01',
        fileName,
        contentNotes: notes || '444 Academic Milestone Submission.'
      });

      // Update state
      setSubmissions(prev => [res.submission, ...prev.filter(s => s.assignmentId !== selectedAssignment.id)]);
      setSubmissionModalOpen(false);
      setUploadFileName('');
      setNotes('');

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#15803d', '#eab308', '#22c55e']
      });

      triggerToast({
        id: `toast_${Date.now()}`,
        title: '✅ Milestone Submitted!',
        message: `Your work for "${selectedAssignment.title}" has been transmitted to SpeedGrader.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'high'
      });
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Assessment Engine & SpeedGrader
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              Weighted Rubrics • Automated Grade Passback
            </span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mt-1">
            Assignments & Academic Milestones
          </h1>
          <p className="text-xs text-neutral-500">
            Submit coursework, track rubric criteria, and review verified faculty feedback
          </p>
        </div>
      </div>

      {/* Main Layout: List and Detailed Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Assignment List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
            Coursework Milestones ({assignments.length})
          </h3>

          {assignments.map(asg => {
            const isSelected = selectedAssignment?.id === asg.id;
            const sub = submissions.find(s => s.assignmentId === asg.id && s.studentId === (currentUser?.id || 'stu_01'));
            
            return (
              <button
                key={asg.id}
                onClick={() => setSelectedAssignment(asg)}
                className={`w-full text-left p-4 rounded-2xl border transition flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-emerald-50/80 border-emerald-700 shadow-xs ring-1 ring-emerald-700' 
                    : 'bg-white border-neutral-200 hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-emerald-900">{asg.courseCode}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      sub?.status === 'graded' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      sub?.status === 'submitted' ? 'bg-yellow-100 text-yellow-900 border border-yellow-300' :
                      'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}>
                      {sub?.status ? (sub.status === 'graded' ? `Graded: ${sub.grade}/${sub.maxGrade}` : 'Submitted') : 'Pending'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-neutral-900 line-clamp-2">
                    {asg.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    {asg.dueDate}
                  </span>
                  <span className="font-bold text-neutral-900">{asg.maxPoints} Points</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right 2 Cols: Detailed Rubrics, Submission Status & Feedback */}
        <div className="lg:col-span-2 space-y-5">
          {selectedAssignment && (
            <div className="bg-white rounded-2xl p-6 border border-emerald-950/10 shadow-xs space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-neutral-900 text-yellow-400">
                      {selectedAssignment.courseCode}
                    </span>
                    <span className="text-neutral-500 font-semibold">{selectedAssignment.courseTitle}</span>
                  </div>
                  <h2 className="text-xl font-black text-neutral-900 mt-2">
                    {selectedAssignment.title}
                  </h2>
                  <p className="text-xs text-neutral-600 mt-1">
                    Due: <span className="font-bold text-neutral-900">{selectedAssignment.dueDate} SAST</span> • Max Grade: <span className="font-bold text-emerald-800">{selectedAssignment.maxPoints} Pts</span>
                  </p>
                </div>

                {/* Submission CTA Button */}
                <div>
                  {currentSubmission ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Submitted
                      </span>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {currentSubmission.submittedAt}
                      </p>
                    </div>
                  ) : (
                    <button
                      id="btn-open-submit-modal"
                      onClick={() => setSubmissionModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 text-xs font-black shadow-md flex items-center gap-2 transition transform hover:scale-105"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Submit Assignment</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment Prompt / Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Academic Instructions
                </h4>
                <div className="p-4 rounded-xl bg-[#fbfcf8] border border-emerald-900/10 text-xs text-neutral-800 leading-relaxed">
                  {selectedAssignment.description}
                </div>
              </div>

              {/* SpeedGrader Weighted Rubric Matrix */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Grading Rubric Breakdown
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-800">
                    Total: {selectedAssignment.maxPoints} Points
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedAssignment.rubric.map(crit => {
                    const studentCriterionScore = currentSubmission?.rubricScores?.[crit.id];
                    return (
                      <div 
                        key={crit.id}
                        className="p-3.5 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-neutral-900">{crit.title}</h5>
                          <p className="text-[11px] text-neutral-600 mt-0.5">{crit.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {studentCriterionScore !== undefined ? (
                            <span className="font-mono font-bold text-xs text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                              {studentCriterionScore} / {crit.maxScore} Pts
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-neutral-500">
                              {crit.maxScore} Pts Max
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verified Grade & SpeedGrader Feedback */}
              {currentSubmission?.status === 'graded' && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-yellow-50 border-2 border-emerald-500/60 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-800" />
                      <h4 className="text-sm font-black text-neutral-900">
                        Official SpeedGrader Evaluation
                      </h4>
                    </div>
                    <span className="text-lg font-black text-emerald-900">
                      {currentSubmission.grade} / {currentSubmission.maxGrade} ({Math.round(((currentSubmission.grade || 0) / currentSubmission.maxGrade) * 100)}%)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs text-neutral-800 leading-relaxed">
                    <div className="flex items-center gap-1 text-emerald-800 font-bold mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Evaluator Comment from {currentSubmission.gradedBy}:</span>
                    </div>
                    <p>{currentSubmission.feedback}</p>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* Submission Modal */}
      {submissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-emerald-700 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  {selectedAssignment?.courseCode}
                </span>
                <h3 className="text-base font-black text-neutral-900">
                  Submit: {selectedAssignment?.title}
                </h3>
              </div>
              <button
                onClick={() => setSubmissionModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Upload Assignment Artifact (PDF / ZIP / Code Archive)
                </label>
                <div className="border-2 border-dashed border-neutral-300 hover:border-emerald-600 rounded-2xl p-5 text-center cursor-pointer bg-[#fbfcf8]">
                  <FileUp className="w-8 h-8 text-emerald-800 mx-auto mb-2" />
                  <p className="text-xs font-bold text-neutral-800">
                    Click to browse or drag and drop your file here
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Accepts .pdf, .zip, .tar.gz, .py, .ts (Max 50MB)
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. Sarah_Khumalo_Distributed_Raft_Cluster.zip"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="mt-3 w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Submission Notes / Architectural Explanation
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain your approach, assumptions, or specific test harness details..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black text-xs shadow-md transition"
                >
                  {isSubmitting ? 'Encrypting & Transmitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
