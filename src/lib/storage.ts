import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadedSubmissionMeta {
  path: string;
  name: string;
  size: number;
  type: string;
  downloadURL: string;
}

export const SUBMISSION_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function validateSubmissionFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `${file.name}: unsupported type (${file.type || 'unknown'}). Use PDF or an image (JPG, PNG, WebP).`;
  }
  if (file.size > SUBMISSION_MAX_BYTES) return `${file.name}: exceeds 10MB limit.`;
  if (file.size === 0) return `${file.name}: file is empty.`;
  return null;
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/** Upload an assignment submission to submissions/{uid}/{assignmentId}/{timestamp_name}. */
export async function uploadSubmissionFile(
  file: File,
  uid: string,
  assignmentId: string,
  onProgress?: (percent: number) => void,
): Promise<UploadedSubmissionMeta> {
  const err = validateSubmissionFile(file);
  if (err) throw new Error(err);
  if (!uid) throw new Error('Sign in before uploading a submission.');
  if (!assignmentId) throw new Error('Assignment is required.');
  const path = `submissions/${uid}/${assignmentId}/${Date.now()}_${safeName(file.name)}`;
  const storageRef = ref(storage, path);
  if (onProgress) {
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => {
          const pct = snap.totalBytes > 0 ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0;
          onProgress(pct);
        },
        reject,
        () => resolve(),
      );
    });
  } else {
    await uploadBytes(storageRef, file, { contentType: file.type });
  }
  const downloadURL = await getDownloadURL(storageRef);
  return { path, name: file.name, size: file.size, type: file.type, downloadURL };
}

/** Upload a registration document to registrations/{uid}/{timestamp_name}. */
export async function uploadRegistrationDoc(
  file: File,
  uid: string,
  onProgress?: (percent: number) => void,
): Promise<UploadedSubmissionMeta> {
  const err = validateSubmissionFile(file);
  if (err) throw new Error(err);
  if (!uid) throw new Error('Sign in (Step 3) before uploading documents.');
  const path = `registrations/${uid}/${Date.now()}_${safeName(file.name)}`;
  const storageRef = ref(storage, path);
  if (onProgress) {
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => {
          const pct = snap.totalBytes > 0 ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0;
          onProgress(pct);
        },
        reject,
        () => resolve(),
      );
    });
  } else {
    await uploadBytes(storageRef, file, { contentType: file.type });
  }
  const downloadURL = await getDownloadURL(storageRef);
  return { path, name: file.name, size: file.size, type: file.type, downloadURL };
}

/** Resolve a download URL for a known Storage path. */
export async function getDownloadUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path));
}
