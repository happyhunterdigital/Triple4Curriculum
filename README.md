# Triple4Curriculum (Triple 4C Online School)

React 19 + TypeScript + Express + Firebase. Demo LMS/MOOC build deployed to
Firebase Hosting (`triple4c.com`).

> **Status: demo/hardened — not production.** See audit follow-ups below. Do not
> load real learner data until Firebase Auth + Firestore persistence are wired
> end-to-end in production.

## Quick start

```bash
bun install
cp .env.example .env   # fill Firebase + secrets
bun run dev            # vite + express on :3000
```

Build / verify:

```bash
bun run lint     # tsc --noEmit
bun run test     # vitest (auth, grading, POPIA helpers)
bun run build    # vite + esbuild server bundle
```

## Security model (post-audit)

- Legacy credential backdoor (`admin@school.edu / password123`) **removed**.
  `/api/v1/auth/gateway` now returns `410 Gone`.
- All `/api/v1/*` routes except health/curriculum/auth/privacy require
  authentication (`server/middleware/auth.ts`):
  - Production: Firebase ID token via `verifyIdToken` (set
    `FIREBASE_SERVICE_ACCOUNT_JSON`).
  - Dev/demo: `x-dev-user-id` / `x-dev-role` headers or `dev-<role>-<id>`
    bearer. Lock with `ALLOW_DEV_AUTH=false` in production.
- `requireRole('admin' | 'lecturer' | 'student')` on writes; students are
  scoped to their own `uid` (no `studentId` body-param IDOR).
- `firestore.rules`: `role` is never client-writable; reads scoped to
  owner/admin; notifications create scoped; default deny.
- API hardening: `helmet`, CORS whitelist (`ALLOWED_ORIGINS`), rate limits on
  `/auth/*` and `/ai/*`, zod validation on every write body, `crypto.randomUUID`
  IDs, central error handler (no stacks in prod), `dotenv/config` loaded.
- POPIA: consent checkbox enforced server-side (`agreePrivacy: true`),
  `/privacy` notice + `/api/v1/privacy`, export-my-data + delete-my-account
  stubs, IPs truncated+hashed (`hashIp`), audit logs admin-only and sanitised.

## Routes (frontend)

React Router with guards (`src/components/RequireAuth.tsx`):

- Public: `/dashboard` (guest landing), `/onboarding`, `/privacy`
- Signed-in: `/lectures`, `/timetable`, `/assignments`, `/attendance`,
  `/discussions`, `/notices`
- Admin: `/admin`, `/admin-dashboard`

Dev impersonation (`switchUserByRole`) only works when
`VITE_DEV_IMPERSONATION=true` and is audit-logged.

## Roadmap honesty

Marketing copy that claimed certified POPIA/SA-SAMS/DRM/biometric features now
reads **Demo / Roadmap** until the integrations exist. Health endpoint reports
`standards: ['POPIA-Controls-In-Progress', 'Demo-Build-Not-Production']`.

## Remaining work (Phase 2+)

- Firestore persistence for users/courses/enrollments (replace in-memory
  `DatabaseStore`; seeds marked fictional in `src/server/mockDb.ts`).
- Real video pipeline (Storage → transcode → HLS signed URLs), certificates
  with verifiable hash/QR, payments (PayFast/Stripe), email provider, Sentry +
  uptime monitoring, Playwright e2e + rules-unit tests.
