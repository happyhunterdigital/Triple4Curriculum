# Security Policy

## Supported versions

Demo project - `main` only. Security fixes land on `main` and deploy via
Firebase Hosting (`triple4c.com`).

## Reporting a vulnerability

Email **security@triple4c.com** with:

- Affected route/file and steps to reproduce
- Impact assessment (auth bypass, PII exposure, etc.)
- Your contact for follow-up

We aim to acknowledge within 72 hours. Please do not test against the live
site with real learner data or disruptive payloads.

## Known posture (Firebase-native, Sep 2026)

- No custom backend. All enforcement is in `firestore.rules` /
  `storage.rules`: owner-scoped writes, staff-gated management, admin-only
  audit reads, `role` never client-writable.
- Auth is Firebase email/Google; sessions persist via the Auth SDK.
- Phase 1 trust layer (`functions/src/index.ts`): privileged writes run in
  callable Cloud Functions, never in the client bundle —
  `setCustomRole` (admin-only custom claims), `generateQuiz` (auth + 20/day
  quota + cache, Gemini via the `GEMINI_API_KEY` functions secret, canned
  fallback otherwise), `completeLectureAndAwardXP` (transactional server-side
  XP — the client never writes `xp`), `gradeSubmission` (staff-only),
  `writeAudit` (30/min quota), `sendEmailNudge` (staff-only, Resend stub),
  `createCertificate`, plus `payfastWebhook` (signature + server-side
  validation). Secrets live in Cloud Functions config
  (`firebase functions:secrets:set`), never in `VITE_*` client env.
- There is NO `VITE_GEMINI_API_KEY` client key. AI quiz calls go through the
  `generateQuiz` callable; the browser bundle contains no AI secret.
  No server keys (`GEMINI_API_KEY`, `RESEND_API_KEY`, `PAYFAST_PASSPHRASE`, service
  accounts) may ever carry a `VITE_` prefix or enter the client bundle.
- Security headers ship via `firebase.json` (HSTS preload, nosniff, SAMEORIGIN,
  Referrer-Policy, Permissions-Policy). Verify after each deploy with
  `curl -sI https://triple4c.com | grep -i -E "strict|x-content|x-frame|referrer|permissions"`.

## Hardening checklist for production

1. Set `FIREBASE_SERVICE_ACCOUNT_JSON`, `ALLOWED_ORIGINS`, `ALLOW_DEV_AUTH=false`.
2. Enforce Firestore rules + indexes deploy (`firebase deploy --only firestore:rules,firestore:indexes`).
3. Rotate any credential ever committed; verify Cloudinary upload presets.
4. Enable Sentry + uptime monitoring; confirm logs contain only hashed IPs.
5. Set functions secrets (`firebase functions:secrets:set GEMINI_API_KEY RESEND_API_KEY PAYFAST_MERCHANT_ID PAYFAST_MERCHANT_KEY PAYFAST_PASSPHRASE ...`)
   and deploy functions (`firebase deploy --only functions`) — never expose them as `VITE_*`.
