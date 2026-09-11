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
badges, announcements) plus public demo accounts - one click, no local keys
needed:

- GitHub: Actions tab > "Seed Firestore (manual)" > Run workflow
  (uses the repo's `FIREBASE_SERVICE_ACCOUNT` secret; catalog skips
  collections that already have data).

Demo logins (public by design - rotate via the workflow's `demo_password`
input, or delete them in Firebase Console > Authentication):

- Student: `student@triple4c.demo`
- Lecturer: `lecturer@triple4c.demo`
- Admin: `admin@triple4c.demo`
- Password: `Triple4-Demo-2026` (default; change at seed time)

Or seed locally: `FIREBASE_SERVICE_ACCOUNT_JSON='{...}' bun run seed`
(`DEMO_PASSWORD='...' bun scripts/seed-users.mjs` for the accounts).

User-linked collections (submissions, attendance, learner progress,
notifications, messages, audit logs) populate through real app use.

## Architecture (one pattern: Firebase)

- **Hosting** serves `dist/` (`firebase.json`, rewrites to `/index.html`).
- **Auth**: Firebase email/Google sessions (`src/lib/authContext.tsx`).
  Profile resolves from `users/{uid}` with fallback to `students/{uid}` /
  `teachers/{uid}` written by onboarding. Stored roles are
  `learner` / `teacher` / `admin`, mapped to app roles
  `student` / `lecturer` / `admin` at the boundary (`toAppRole`).
- **Data**: every screen reads/writes Firestore through one client,
  `src/lib/api.ts` - same function names the UI has always used, now backed
  by SDK calls. No `/api/*` endpoints exist.
- **Static catalog**: `src/data/curriculum.ts` (registry text) ships in the
  bundle; everything else is Firestore content (seed it, see above).
- **Rules** (`firestore.rules`): owner-scoped writes, staff-gated management
  calls, admin-only audit reads, role field immutable from clients.

## Routes (frontend)

React Router with guards (`src/components/RequireAuth.tsx`):

- Public: `/dashboard` (guest landing), `/onboarding`, `/privacy`
- Signed-in: `/lectures`, `/timetable`, `/assignments`, `/attendance`,
  `/discussions`, `/notices`
- Admin: `/admin`, `/admin-dashboard`

The navbar logo and Home button both return to `/dashboard`.

## What changed in the Firebase migration

- Deleted: `server.ts`, `server/`, `src/server/` (mock DB), server-side
  vitest suites, dead `Header.tsx` (role-switcher), `metadata.json`.
- `package.json` is client-only Vite (`dev`, `build`, `preview`, `test`,
  `seed`); express/cors/helmet/rate-limit/dotenv/supertest/tsx removed.
- AI quiz calls Gemini directly from the client when `VITE_GEMINI_API_KEY`
  is set, else bundled fallback questions.
- Staff provisioning (`AdminUsers`) creates directory profiles that activate
  when the person registers with the same email.

## Remaining work

- Live AI quiz needs a `VITE_GEMINI_API_KEY` (or `GEMINI_API_KEY`) repo
  secret - the build already wires it in; without it the tutor serves
  bundled fallback questions. Restrict the key to triple4c.com referrers.
- Custom claims for roles (remove profile-doc role reads from rules).
- Real video pipeline, certificates, payments (PayFast/Stripe), email
  provider, Sentry + uptime monitoring, Playwright e2e, rules-unit tests.
