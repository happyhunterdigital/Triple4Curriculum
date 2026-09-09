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
- `VITE_GEMINI_API_KEY` (if set) is a client key - restrict it to
  triple4c.com HTTP referrers in Google Cloud Console.

## Hardening checklist for production

1. Set `FIREBASE_SERVICE_ACCOUNT_JSON`, `ALLOWED_ORIGINS`, `ALLOW_DEV_AUTH=false`.
2. Enforce Firestore rules deploy (`firebase deploy --only firestore:rules`).
3. Rotate any credential ever committed; verify Cloudinary upload presets.
4. Enable Sentry + uptime monitoring; confirm logs contain only hashed IPs.
