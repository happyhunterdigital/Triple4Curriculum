# Triple4Curriculum (Triple 4C Online School)

React 19 + TypeScript + Vite + Firebase. Demo LMS build, statically hosted on
Firebase Hosting (`triple4c.com`), data live in Cloud Firestore.

> **Status: Firebase-native demo - not production.** No custom backend; all
> enforcement lives in `firestore.rules` / `storage.rules`. Do not load real
> learner data until roles use custom claims and the rules below are reviewed
> against a real threat model.

## Quick start

```bash
bun install
cp .env.example .env   # fill VITE_FIREBASE_* from Firebase Console
bun run dev            # vite on :5173
```

Build / verify:

```bash
bun run lint     # tsc --noEmit
bun run test     # vitest (role mapping, registry integrity)
bun run build    # tsc + vite build -> dist/
```

Seed the catalog (departments, courses, lectures, timetable, assignments,
badges, announcements) plus demo accounts - one click, no local keys needed:

- GitHub: Actions tab > "Seed Firestore (manual)" > Run workflow
  (uses the repo's `FIREBASE_SERVICE_ACCOUNT` secret; catalog skips
  collections that already have data).

Demo account addresses and passwords are **delivered privately** (seed
workflow `demo_password` input / team channel) - never committed here.
Rotate via that workflow input or delete them in Firebase Console >
Authentication.

Or seed locally: `FIREBASE_SERVICE_ACCOUNT_JSON='{...}' bun run seed`
(`DEMO_PASSWORD='...' bun scripts/seed-users.mjs` for the accounts).

After seeding, set custom claims once (claims-only rules require them):
`FIREBASE_SERVICE_ACCOUNT_JSON='{...}' bun run set-claims`
(dry-run first with `DRY_RUN=1`).

User-linked collections (submissions, attendance, learner progress,
notifications, messages, audit logs) populate through real app use.

## Architecture (one pattern: Firebase)

- **Hosting** serves `dist/` (`firebase.json`, rewrites to `/index.html`).
- **Auth**: Firebase email/Google sessions (`src/lib/authContext.tsx`).
  Authorisation roles come from **custom claims** (`src/lib/claims.ts`), the
  same source `firestore.rules` reads. Profile docs (`users/{uid}`, fallback
  `students|teachers/{uid}`) only supply display fields and can never elevate
  a role. Self-registration always creates a learner; staff roles are granted
  by an admin through `setCustomRole`.
- **Video**: provider-agnostic (`src/lib/video.ts`). Lectures play from YouTube
  (unlisted, privacy-enhanced) or a direct MP4/HLS URL; live classes use
  Google Meet links with an embedded Jitsi fallback. See
  `docs/VIDEO-STRATEGY.md` for the path to an owned streaming pipeline.
- **Data**: every screen reads/writes Firestore through one client,
  `src/lib/api.ts` - same function names the UI has always used, now backed
  by SDK calls. No `/api/*` endpoints exist.
- **Static catalog**: `src/data/curriculum.ts` (registry text) ships in the
  bundle; everything else is Firestore content (seed it, see above).
- **Rules** (`firestore.rules`): owner-scoped writes, staff-gated management
  calls, admin-only audit reads, role field immutable from clients.
- **Video**: live classes via Google Meet (auto-recorded to Drive), recorded
  classes sync hands-off Drive → YouTube **unlisted** → `lectures.videoUrl`
  (`functions/src/youtubeSync.ts`, one-time OAuth via
  `node scripts/youtube-auth.mjs`). Playback uses `youtube-nocookie` embeds —
  Firebase never serves video bytes.

## Routes (frontend)

React Router with guards (`src/components/RequireAuth.tsx`):

- Public: `/dashboard` (guest landing), `/onboarding`, `/privacy`, marketing pages
- Signed-in: `/lectures`, `/timetable`, `/assignments`, `/attendance`,
  `/discussions`, `/notices`, `/certificates`, `/classroom`, `/live`
  (Google Meet opens externally, Jitsi embeds; attendance recorded on join)
- Lecturer: `/teach`, `/teach/grading`, `/teach/classes`, `/teach/authoring`,
  `/teach/attendance`, `/learn/progress`
- Admin: `/admin`, `/admin-dashboard`, `/admin/users`, `/admin/timetable`,
  `/admin/announcements`, `/admin/audit`, `/admin/reports`

The navbar logo and Home button both return to `/dashboard`.

## What changed in the Firebase migration

- Deleted: `server.ts`, `server/`, `src/server/` (mock DB), server-side
  vitest suites, dead `Header.tsx` (role-switcher), `metadata.json`.
- `package.json` is client-only Vite (`dev`, `build`, `preview`, `test`,
  `seed`); express/cors/helmet/rate-limit/dotenv/supertest/tsx removed.
- AI quiz calls the server-side `generateQuiz` callable, else bundled
  fallback questions (no client Gemini key).
- Staff provisioning (`AdminUsers`) creates directory profiles that activate
  when the person registers with the same email.

## Remaining work

- [x] Phase 0 security hardening done: claims-only `firestore.rules`
  (owner/staff-scoped reads, immutable roles, sized audit writes),
  scoped `storage.rules` (registrations/submissions/certificates),
  server-side quiz callable (no client Gemini key), fixed deep-link
  `actionUrl`s (`/assignments`, `/lectures`).
- [x] Phase 1 backend trust layer: XP/grades/roles/secrets in Functions
  (`completeLectureAndAwardXP`, `gradeSubmission`, `setCustomRole`,
  `generateQuiz` quota + cache, `writeAudit` quota, webhooks), App Check
  wiring, persistent Firestore cache.
- [x] Phase 2 cost/correctness: paged reads (`getUsersPaged`,
  `getSubmissionsPaged`, `getNotificationsPaged`, `getAttendancePaged`),
  `getCountFromServer` totals, bounded staff queries.
- [x] Phase 3 payments/comms: Stripe/PayFast signature-verified webhooks,
  Resend `sendEmailNudge` stub, `createCertificate` callable.
- [x] Phase 4 compliance hardening: `docs/DPIA.md`, `functions/src/retention.ts`
  (`purgeExpired` daily sweep, `exportMyDataStrict`, `eraseMyData`),
  `src/lib/sams.ts` SA-SAMS CSV builders + `api.exportSamsAttendance` /
  `api.exportSamsResults`, retention/DSR/residency in `PRIVACY.md`,
  `tests/dsr.test.ts` (guardian + CSV coverage).
- [x] Video launch layer: real YouTube-backed lecture player (no sample-video
  fallback), Google Meet live links with a Jitsi embed fallback, and a
  provider-agnostic resolver (`docs/VIDEO-STRATEGY.md`).
- Live AI quiz needs a `GEMINI_API_KEY` functions secret - the client calls
  the `generateQuiz` callable; without it the tutor serves bundled fallback
  questions.

## Deploy checklist (before real learner data)

1. **App Check:** set `VITE_RECAPTCHA_SITE_KEY`, enable App Check enforcement
   in Firebase Console (Auth/Firestore/Storage/Functions), verify debug tokens
   only in dev.
2. **Custom claims migration:** run `setCustomRole` for every staff account;
   confirm rules use claims only (no profile-doc role reads) via
   `bun run test:rules`.
3. **Secrets:** `GEMINI_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET` +
   `STRIPE_WEBHOOK_SECRET`, `PAYFAST_MERCHANT_KEY` + `PAYFAST_PASSPHRASE` in
   Secret Manager — never in `.env` / the bundle.
4. **Indexes:** `firebase deploy --only firestore:indexes` (paged + DSR/retention
   queries), then `firebase deploy --only firestore:rules,storage,functions,hosting`.
5. **Verify:** seed in staging, run `bun run test`, `bun run lint`,
   `firebase emulators` retention sweep dry-run, one SA-SAMS test-env import,
   and a DSR export/erase round-trip with `privacy@triple4c.com` SLA on the rota.
6. Still roadmap: real video pipeline, PayFast/Stripe UI, Sentry + uptime
   monitoring, Playwright e2e.
