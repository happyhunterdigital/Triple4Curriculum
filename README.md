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
- [x] Phase 3 payments/comms: PayFast checkout (`createPayfastCheckout`) with
  signature + PayFast validation in `payfastWebhook`, Resend `sendEmailNudge`
  stub, `createCertificate` callable.
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

## Images & media (performance policy)

Every image must be served optimised — this keeps hosting egress and mobile data low:

1. **Cloudinary:** wrap the URL in `cloudinaryImage(url, width)` from `src/lib/image.ts`.
   It injects `f_auto,q_auto,w_<width>,c_limit` (AVIF/WebP, right size, never upscaled).
   Pick the width to match the rendered slot (~2x for small logos/avatars, 1x for
   full-bleed backgrounds). Don't hard-code untransformed Cloudinary URLs in JSX.
2. **Favicons/social cards:** request fixed transforms directly in `index.html`
   (`f_png,w_64`, `f_png,w_180`, `f_auto,q_auto,w_1200`).
3. **Other CDNs:** Unsplash (`auto=format&fit=crop&w=…&q=…`) and YouTube thumbnails
   (`i.ytimg.com`) are already optimised — leave as-is.
4. **Attributes:** every `<img>` needs `loading="lazy" decoding="async"`, except the
   above-the-fold hero which uses `loading="eager" fetchPriority="high"`.
5. **Never commit image binaries** to the repo — host them on Cloudinary and reference them.

## Payments (PayFast)

- **Checkout:** onboarding (learner, tuition) calls `createPayfastCheckout`, which
  computes the amount server-side from the selected phase (Foundation R1 500,
  Intermediate R2 500, Senior R3 500, FET R4 500 monthly; annual = 12 months)
  and returns a signed PayFast form that the browser POSTs to PayFast. Card,
  Instant EFT, SnapScan and Mobicred are supported; T4C never sees card data.
- **Webhook:** `payfastWebhook` verifies the MD5 signature (with passphrase),
  matches the amount to the pending `payments/{m_payment_id}` doc, calls
  PayFast's server-to-server validation endpoint, then marks
  `students/{uid}.payment.status = "paid"` and writes an audit log.
- **Setup:** `firebase functions:secrets:set PAYFAST_MERCHANT_ID` /
  `PAYFAST_MERCHANT_KEY` / `PAYFAST_PASSPHRASE`, set the notify URL in the
  PayFast dashboard, and add `PAYFAST_SANDBOX=true` to `functions/.env` while
  testing against sandbox credentials.

## Deploy checklist (before real learner data)

> **⚠️ Deploy via GitHub Actions only (push to `main`).** A production build
> requires the `VITE_FIREBASE_*` env vars; CI injects them from repo secrets.
> Building/deploying from a machine without a populated `.env` used to ship a
> bundle with `apiKey: undefined`, which crashed the live site to a blank page
> (`auth/invalid-api-key`). The build now **refuses to run** without
> `VITE_FIREBASE_API_KEY` for exactly this reason. If you must deploy locally,
> create `.env` first (see step 1) and use `firebase deploy --only hosting`.

1. **App Check:** set `VITE_RECAPTCHA_SITE_KEY`, enable App Check enforcement
   in Firebase Console (Auth/Firestore/Storage/Functions), verify debug tokens
   only in dev.
2. **Custom claims migration:** run `setCustomRole` for every staff account;
   confirm rules use claims only (no profile-doc role reads) via
   `bun run test:rules`.
3. **Secrets:** `GEMINI_API_KEY`, `RESEND_API_KEY`, `YT_OAUTH_*`,
   `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY` + `PAYFAST_PASSPHRASE` in
   Secret Manager — never in `.env` / the bundle. PayFast checkout requires all
   three; set the PayFast dashboard **notify URL** to
   `https://us-central1-triple4curriculum.cloudfunctions.net/payfastWebhook`.
4. **Indexes:** `firebase deploy --only firestore:indexes` (paged + DSR/retention
   queries), then `firebase deploy --only firestore:rules,storage,functions,hosting`.
5. **Verify:** seed in staging, run `bun run test`, `bun run lint`,
   `firebase emulators` retention sweep dry-run, one SA-SAMS test-env import,
   and a DSR export/erase round-trip with `privacy@triple4c.com` SLA on the rota.
6. Still roadmap: Sentry + uptime monitoring, Playwright e2e.
