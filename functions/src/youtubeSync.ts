/**
 * Hands-off recording pipeline:
 *
 *   Google Meet (auto-record) -> Drive file -> [this sync] -> YouTube unlisted
 *   -> recordings/{id} doc -> best-effort attach to lecture.videoUrl
 *
 * Students then play via youtube-nocookie embed — zero Firebase egress.
 *
 * One-time setup (see functions/.env.example):
 *   1. Google Cloud console: enable Drive + YouTube Data API v3
 *   2. OAuth client (Web) + consent screen, scopes:
 *      drive.readonly, youtube.upload
 *   3. node scripts/youtube-auth.mjs  -> prints YT_OAUTH_REFRESH_TOKEN
 *   4. firebase functions:secrets:set each key below
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';

const CLIENT_ID = defineSecret('YT_OAUTH_CLIENT_ID');
const CLIENT_SECRET = defineSecret('YT_OAUTH_CLIENT_SECRET');
const REFRESH_TOKEN = defineSecret('YT_OAUTH_REFRESH_TOKEN');
/** Drive folder that Meet auto-records into (from the calendar's recording settings). */
const DRIVE_FOLDER = defineSecret('YT_DRIVE_RECORDINGS_FOLDER');

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/youtube.upload';

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID.value(),
      client_secret: CLIENT_SECRET.value(),
      refresh_token: REFRESH_TOKEN.value(),
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`OAuth refresh failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

interface DriveFile { id: string; name: string; createdTime: string; videoMediaMetadata?: { durationMillis?: string }; }

async function listNewMeetRecordings(token: string, processedIds: Set<string>): Promise<DriveFile[]> {
  // Only the dedicated recordings folder is scanned. Do NOT filter on the file
  // name: Meet names recordings after the meeting title (e.g. "CSC-441 — Lesson 3"),
  // not "Meet recording", so a name filter would silently find nothing.
  const q = [
    `trashed = false`,
    `mimeType = 'video/mp4'`,
    ` '${DRIVE_FOLDER.value()}' in parents`,
  ].join(' and ');
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('fields', 'files(id,name,createdTime,videoMediaMetadata)');
  url.searchParams.set('orderBy', 'createdTime desc');
  url.searchParams.set('pageSize', '50');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Drive list failed: ${res.status}`);
  const json = (await res.json()) as { files?: DriveFile[] };
  return (json.files || []).filter((f) => !processedIds.has(f.id));
}

async function downloadFile(token: string, fileId: string): Promise<Buffer> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Resumable YouTube upload; returns the video id. Privacy is ALWAYS unlisted. */
async function uploadToYouTube(token: string, title: string, description: string, data: Buffer): Promise<string> {
  const start = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': String(data.length),
      },
      body: JSON.stringify({
        snippet: { title, description: `${description}\n\nTriple 4C Curriculum — class recording (unlisted).`, categoryId: '27' },
        status: { privacyStatus: 'unlisted', selfDeclaredMadeForKids: false },
      }),
    }
  );
  if (!start.ok) throw new Error(`YouTube session start failed: ${start.status} ${await start.text()}`);
  const uploadUrl = start.headers.get('location');
  if (!uploadUrl) throw new Error('YouTube returned no upload URL');

  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(data.length) },
    body: new Uint8Array(data),
  });
  if (!put.ok) throw new Error(`YouTube upload failed: ${put.status}`);
  const json = (await put.json()) as { id: string };
  return json.id;
}

/** "Meet recording - CSC-441 Lecture 3 ..." -> course code match, best effort. */
async function attachToLecture(filename: string, youtubeId: string, videoUrl: string, db: FirebaseFirestore.Firestore) {
  const lectures = await db.collection('lectures').limit(100).get();
  const lower = filename.toLowerCase();
  const match = lectures.docs.find((d) => {
    const code = String(d.data().courseCode || '').toLowerCase();
    return code && code !== '' && lower.includes(code);
  });
  if (!match) return null;
  const data = match.data();
  // Don't overwrite an existing lecture video — lecturer decides replacements.
  if (data.videoUrl && !/gtv-videos-bucket|BigBuckBunny/.test(String(data.videoUrl))) return null;
  await match.ref.set({ videoUrl, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return match.id;
}

export const syncMeetRecordings = onSchedule(
  { schedule: 'every 6 hours', region: 'europe-west1', secrets: [CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, DRIVE_FOLDER] },
  async () => {
    const db = getFirestore();
    const token = await getAccessToken();
    const processedSnap = await db.collection('drive_sync').limit(500).get();
    const processed = new Set(processedSnap.docs.map((d) => d.id));
    const files = await listNewMeetRecordings(token, processed);
    console.log(`drive->youtube sync: ${files.length} new recording(s)`);

    for (const file of files) {
      try {
        const data = await downloadFile(token, file.id);
        const videoId = await uploadToYouTube(
          token,
          file.name.replace(/\.mp4$/i, ''),
          `Recorded ${file.createdTime}`,
          data
        );
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const lectureId = await attachToLecture(file.name, videoId, videoUrl, db);

        await db.collection('recordings').add({
          driveFileId: file.id,
          driveName: file.name,
          youtubeId: videoId,
          youtubeUrl: videoUrl,
          privacy: 'unlisted',
          lectureId: lectureId || null,
          recordedAt: file.createdTime,
          syncedAt: FieldValue.serverTimestamp(),
        });
        await db.collection('drive_sync').doc(file.id).set({ processedAt: FieldValue.serverTimestamp(), youtubeId: videoId });
        console.log(`- uploaded ${file.name} -> ${videoUrl}${lectureId ? ` (attached to ${lectureId})` : ''}`);
      } catch (e) {
        console.error(`- failed ${file.name}:`, e);
        // Do NOT mark processed — retried next run.
      }
    }
  }
);

/** Staff manual hook: attach any synced recording to a lecture. */
export const attachRecording = onCall({ region: 'europe-west1', secrets: [CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN] }, async (req) => {
  const role = (req.auth?.token as { role?: string } | undefined)?.role;
  if (role !== 'teacher' && role !== 'admin' && role !== 'lecturer') {
    throw new HttpsError('permission-denied', 'Staff only.');
  }
  const { recordingId, lectureId } = (req.data || {}) as { recordingId?: string; lectureId?: string };
  if (!recordingId || !lectureId) throw new HttpsError('invalid-argument', 'recordingId + lectureId required.');
  const db = getFirestore();
  const rec = await db.collection('recordings').doc(recordingId).get();
  if (!rec.exists) throw new HttpsError('not-found', 'Recording not found.');
  await db.collection('lectures').doc(lectureId).set(
    { videoUrl: rec.data()?.youtubeUrl || '', updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  await rec.ref.set({ lectureId, attachedBy: req.auth?.uid || 'unknown' }, { merge: true });
  return { success: true, lectureId };
});
