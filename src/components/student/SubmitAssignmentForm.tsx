import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { uploadSubmissionFile } from '../../lib/storage';
import { FileUpload, type UploadedFileMeta } from '../ui/FileUpload';
import type { AssignmentSubmission } from '../../types';

type StoredFile = UploadedFileMeta & { downloadURL?: string };

interface SubmitAssignmentFormProps {
  assignmentId: string;
  assignmentTitle?: string;
  onSubmitted?: (submission: AssignmentSubmission) => void;
  onCancel?: () => void;
}

export const SubmitAssignmentForm: React.FC<SubmitAssignmentFormProps> = ({
  assignmentId,
  assignmentTitle,
  onSubmitted,
  onCancel,
}) => {
  const { currentUser, triggerToast } = useAuth();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uid = (currentUser as unknown as { id?: string; uid?: string } | null)?.id
    || (currentUser as unknown as { uid?: string } | null)?.uid
    || '';

  const uploadFile = async (file: File): Promise<UploadedFileMeta> => {
    setError(null);
    setProgress(0);
    try {
      const meta = await uploadSubmissionFile(file, uid, assignmentId, setProgress);
      return { path: meta.path, name: meta.name, size: meta.size, type: meta.type, downloadURL: meta.downloadURL };
    } finally {
      setProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (files.length === 0) {
      setError('Upload your assignment file (PDF or image, max 10MB) before submitting.');
      return;
    }
    if (!notes.trim()) {
      setError('Add a short note explaining your approach before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const file = files[0];
      const res = await api.submitAssignment(assignmentId, {
        studentId: uid,
        fileName: file.name,
        contentNotes: notes.trim(),
        fileMeta: {
          path: file.path,
          name: file.name,
          sizeKb: Math.round(file.size / 1024),
          downloadURL: file.downloadURL || '',
        },
      });
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ['#15803d', '#eab308', '#22c55e'] });
      triggerToast({
        id: `toast_${Date.now()}`,
        title: '✅ Milestone Submitted!',
        message: `Your work${assignmentTitle ? ` for "${assignmentTitle}"` : ''} has been transmitted to SpeedGrader.`,
        category: 'academic',
        timestamp: 'Just now',
        read: false,
        priority: 'high',
      });
      onSubmitted?.(res.submission);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FileUpload
        label="Upload Assignment Artifact (PDF / Image)"
        hint="PDF, JPG, PNG or WebP — max 10MB. Stored at submissions/{uid}/{assignmentId}."
        onUploaded={setFiles}
        uploadFile={uploadFile}
        uploaded={files}
        error={error || undefined}
        required
      />
      {progress !== null && (
        <div className="h-2 rounded-full bg-neutral-100 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-emerald-700 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
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
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-black text-xs shadow-md transition inline-flex items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isSubmitting ? 'Transmitting...' : 'Confirm Submission'}
        </button>
      </div>
    </form>
  );
};
