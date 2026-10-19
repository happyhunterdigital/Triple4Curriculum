# Privacy Policy — Triple 4 Curriculum (Online School, Grade R–12)

**Effective:** 19 September 2026 · **Information Officer:** privacy@triple4c.com ·
**Support:** support@triple4c.com · **Routes:** `/privacy` (this policy), `/terms`

This policy governs the Triple 4C platform (Vite React + Firebase). It replaces the earlier
demo stub and applies to all real learner processing.

## 1. Legal framework

- **POPIA — Protection of Personal Information Act 4 of 2013 (SA):** we act as Responsible
  Party; consent is captured at registration (`agreePrivacy`, timestamped) and processing
  follows POPIA ss 11 (lawful basis), 14 (access), 19 (safeguards), 23–25 (rights), 72
  (cross-border).
- **Children's Act 38 of 2005 (SA):** best-interests-of-the-child standard; guardian consent
  for under-18 enrolments; safeguarding rules for live classes.
- **DBE/SACCAI record-keeping:** enrolment registers, attendance, assessment scripts, SBAs and
  promotion schedules retained for the statutory archive period.
- **GDPR (EU/UK learners):** access, rectification, erasure, restriction, portability, objection.
- **COPPA (US under-13):** verifiable guardian consent before any processing; no account
  activated without it.
- **FERPA-style education records:** grades, attendance, teacher notes accessible only to the
  learner, their guardian, and authorised staff.

## 2. Data we collect (minimised)

Identity/contact, education records, guardian consent records, staff qualifications (masked
ID/tax numbers only), Firebase Auth identifiers, hashed/truncated network identifiers in audit
logs. No biometrics. No card numbers (Stripe handles payments).

## 3. Sharing & cross-border (POPIA s72)

Processors: Firebase (Auth/Firestore/Storage/Hosting), Google Gemini (optional client-side AI
quiz), Cloudinary (media), Stripe (payments). SACCAI/DBE exam data shared as legally required.
Firebase/Google infra may store data outside SA — enrolment constitutes s72 consent subject to
equivalent processor protections. We never sell personal information.

## 4. Retention

| Data | Retention | Disposal |
|---|---|---|
| Enrolment & statutory assessment archives (registers, scripts, SBAs, promotion schedules) | Statutory DBE/SACCAI archive period | Minimised/deleted only after clearance — DBE hold overrides deletion requests (records are anonymised instead) |
| Active accounts | Enrolment + 5 years, then minimised/deleted | `eraseMyData` callable / admin purge |
| Contact / marketing messages | 12 months after last contact (unless consent renewed) | Auto-deleted daily by `purgeExpired` |
| Audit logs (admin-only, hashed identifiers) | 2 years identifiable, then anonymised (`userId`→SHA-256, name→`redacted`) | Auto-anonymised daily by `purgeExpired` |
| Notifications / nudges | Enrolment + 1 year | Deleted on erasure (`eraseMyData`) |
| Unverified accounts | 30-day grace, then manual review (report-only; no auto-delete) | Manual review |

Enforcement: `functions/src/retention.ts` (`purgeExpired`, scheduled every 24 h). Full
assessment: `docs/DPIA.md` §5.

### Data residency

Primary data plane is Firebase (Auth/Firestore/Storage/Hosting) with Google infrastructure
that may store or replicate data **outside South Africa**. Enrolment constitutes POPIA s72
consent to such transfers, subject to equivalent processor protections in our contracts.
Statutory SACCAI/DBE submissions are filed from the retained archive regardless of region.

## 5. Rights & complaints (DSR — how to exercise them)

Email **privacy@triple4c.com** (or support@triple4c.com, forwarded within 2 school days):

1. **Access/export** — we run `exportMyDataStrict` (self-service `api.exportMyData`, or the
   callable for a verified subject) and deliver JSON (+ SA-SAMS CSVs on request) within 30 days.
2. **Correction** — reply with the corrected details; we update the profile/education record
   and notify staff holders of the correction.
3. **Deletion/erasure** — we run `eraseMyData` (`{ confirm: true }`): messages/notifications
   hard-deleted; profile, submissions, attendance and progress anonymised (`name→Erased`,
   `email→''`, `guardian→null`). Statutory DBE/SACCAI archives are anonymised, not deleted,
   until the archive hold clears.
4. **Guardian requests for minors** — supply learner name + DOB + guardian contact matching
   the consent record (under-13: original verification method). Guardians may review, correct,
   or request deletion at any time.
5. Every DSR writes an `audit_logs` entry (`DSR_EXPORT` / `DSR_ERASURE`) and you are told the
   outcome.

Unresolved complaints: the **Information Regulator (SA)** — inforegulator.org.za. EU/UK
learners additionally hold GDPR rights (access, rectification, erasure, restriction,
portability, objection); US under-13 guardians hold COPPA consent rights.

## 6. Implementation pointers (repo)

- Consent enforcement: `src/components/onboarding/OnboardingFlow.tsx` (`agreePrivacy`,
  `agreeTerms`, guardian fields for minors, honeypot `companyWebsite`).
- Rules: `firestore.rules` (role never client-writable), `storage.rules` (private,
  ≤10 MB image/PDF).
- Headers: `firebase.json` (HSTS preload, nosniff, SAMEORIGIN, Referrer-Policy,
  Permissions-Policy).
- Cookies: `src/components/site/CookieConsent.tsx` (`t4c-cookie-consent` flag only).
- Export/erasure: `api.exportMyData` (live Firestore assembly); strict DSR via
  `exportMyDataStrict` / `eraseMyData` callables + `purgeExpired` retention sweep
  (`functions/src/retention.ts`); SA-SAMS CSVs via `src/lib/sams.ts`; DPIA in `docs/DPIA.md`.
