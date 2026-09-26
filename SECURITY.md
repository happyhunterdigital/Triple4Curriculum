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
- `VITE_GEMINI_API_KEY` (if set) is a **public client key, never a server secret**.
  It ships in the browser bundle (`src/lib/api.ts` → `generateAiQuiz`) and must be locked
  down in Google Cloud Console, otherwise anyone can reuse it:
  - APIs & Services → Credentials → select the key → **API restrictions: Generative Language API only**.
  - **Application restrictions → HTTP referrers**: `https://triple4c.com/*` and
    `https://www.triple4c.com/*` (plus `http://localhost:*/*` for local dev only).
  - Set a daily quota / budget alert; rotate immediately if ever committed.
  - No server keys (`FIREBASE_SERVICE_ACCOUNT_JSON`, Stripe secrets) may ever carry a
    `VITE_` prefix or enter the client bundle — they live in CI/hosting env only.
- Security headers ship via `firebase.json` (HSTS preload, nosniff, SAMEORIGIN,
  Referrer-Policy, Permissions-Policy). Verify after each deploy with
  `curl -sI https://triple4c.com | grep -i -E "strict|x-content|x-frame|referrer|permissions"`.

## Hardening checklist for production

1. Set `FIREBASE_SERVICE_ACCOUNT_JSON`, `ALLOWED_ORIGINS`, `ALLOW_DEV_AUTH=false`.
2. Enforce Firestore rules deploy (`firebase deploy --only firestore:rules`).
3. Rotate any credential ever committed; verify Cloudinary upload presets.
4. Enable Sentry + uptime monitoring; confirm logs contain only hashed IPs.
