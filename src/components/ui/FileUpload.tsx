import React, { useRef, useState } from 'react';
import { Upload, CheckCircle2, X, AlertCircle, FileText, Loader2 } from 'lucide-react';

export interface UploadedFileMeta {
  path: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean
  required?: boolean;
  onUploaded: (files: UploadedFileMeta[]) => void;
  /** Storage upload fn injected by parent so this component stays pure UI */
  uploadFile: (file: File) => Promise<UploadedFileMeta>;
  uploaded: UploadedFileMeta[];
  error?: string;
  hint?: string;
}

const MAX_SIZE_MB = 10;
const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

export const FileUpload: React.FC<FileUploadProps> = ({
  label, accept = 'image/jpeg,image/jpg,image/png,image/webp,application/pdf',
  multiple = false, required = false, onUploaded, uploadFile, uploaded, error, hint,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const validate = (file: File): string | null => {
    if (!VALID_TYPES.includes(file.type)) return `${file.name}: unsupported type (${file.type || 'unknown'}). Use JPG, PNG, WebP or PDF.`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `${file.name}: exceeds ${MAX_SIZE_MB}MB limit.`;
    if (file.size === 0) return `${file.name}: file is empty.`;
    return null;
  };

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setLocalError(null);
    const files = multiple ? Array.from(fileList) : [fileList[0]];
    const results: UploadedFileMeta[] = [];
    let hadError = false;

    for (const file of files) {
      const vErr = validate(file);
      if (vErr) { setLocalError(vErr); hadError = true; continue; }
      setBusy(true);
      try {
        const meta = await uploadFile(file);
        results.push(meta);
      } catch (e) {
        setLocalError(e instanceof Error ? e.message : `Failed to upload ${file.name}`);
        hadError = true;
      } finally {
        setBusy(false);
      }
    }

    if (results.length > 0) {
      onUploaded(multiple ? [...uploaded, ...results] : [results[0]]);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (path: string) => {
    onUploaded(uploaded.filter(f => f.path !== path));
  };

  const fmtSize = (bytes: number) => bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;
  const showErr = localError || error;

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium flex items-center gap-1.5">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>

      {/* Drop zone / picker */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-[12px] border-2 border-dashed px-4 py-5 text-center transition-colors ${dragOver ? 'border-[var(--color-t4c-green)] bg-emerald-50/40' : showErr ? 'border-rose-300 bg-rose-50/30' : 'border-[#E2E8F0] bg-white hover:border-[var(--color-t4c-green)] hover:bg-[var(--color-canvas-soft)]'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={e => processFiles(e.target.files)}
        />
        {busy ? (
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <Loader2 size={16} className="animate-spin text-[var(--color-t4c-green)]" /> Uploading…
          </div>
        ) : (
          <>
            <Upload size={18} className="mx-auto text-neutral-400" />
            <p className="text-xs text-neutral-600 mt-1.5 font-medium">Drag & drop or <span className="text-[var(--color-t4c-green)] underline underline-offset-2">browse</span></p>
            <p className="text-[11px] text-neutral-400 mt-0.5">JPG, PNG, WebP or PDF — max {MAX_SIZE_MB}MB{multiple ? ' each, multiple allowed' : ''}</p>
          </>
        )}
      </div>

      {showErr && (
        <p className="flex items-start gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-[6px] px-2.5 py-1.5">
          <AlertCircle size={14} className="shrink-0 mt-0.5" /> {showErr}
        </p>
      )}
      {!showErr && hint && <p className="text-[11px] text-neutral-400">{hint}</p>}

      {/* Uploaded file chips */}
      {uploaded.length > 0 && (
        <div className="space-y-1.5">
          {uploaded.map(f => (
            <div key={f.path} className="flex items-center gap-2 border border-emerald-200 bg-emerald-50/40 rounded-[6px] px-2.5 py-1.5">
              <FileText size={14} className="text-emerald-700 shrink-0" />
              <span className="text-xs text-neutral-700 truncate flex-1">{f.name}</span>
              <span className="text-[10px] font-mono text-neutral-400 shrink-0">{fmtSize(f.size)}</span>
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <button type="button" onClick={() => removeFile(f.path)} className="text-neutral-400 hover:text-rose-600 shrink-0" aria-label={`Remove ${f.name}`}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
