# Security Policy

## Supported versions

Demo project — `main` only. Security fixes land on `main` and deploy via
Firebase Hosting (`triple4c.com`).

## Reporting a vulnerability

Email **security@triple4c.com** with:

- Affected route/file and steps to reproduce
- Impact assessment (auth bypass, PII exposure, etc.)
- Your contact for follow-up

We aim to acknowledge within 72 hours. Please do not test against the live
site with real learner data or disruptive payloads.

## Known posture (post-audit, Sep 2026)

- Hardcoded credentials removed; all state-changing API routes require auth +
  role checks in demo mode.
- Production still requires `FIREBASE_SERVICE_ACCOUNT_JSON` +
  `ALLOW_DEV_AUTH=false` + Firestore wiring before handling real PII.
- Secret scanning: GitHub secret scanning + gitleaks (see `.gitleaks.toml`
  if present). Never commit `.env`.

## Hardening checklist for production

1. Set `FIREBASE_SERVICE_ACCOUNT_JSON`, `ALLOWED_ORIGINS`, `ALLOW_DEV_AUTH=false`.
2. Enforce Firestore rules deploy (`firebase deploy --only firestore:rules`).
3. Rotate any credential ever committed; verify Cloudinary upload presets.
4. Enable Sentry + uptime monitoring; confirm logs contain only hashed IPs.
