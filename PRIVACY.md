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

Active accounts: enrolment + 5 years, then minimised/deleted. Statutory assessment archives per
DBE/SACCAI. Contact messages: 12 months. Audit logs: admin-only, hashed identifiers.

## 5. Rights & complaints

Access/export, correction, deletion: privacy@triple4c.com. Unresolved complaints: the
**Information Regulator (SA)** — inforegulator.org.za.

## 6. Implementation pointers (repo)

- Consent enforcement: `src/components/onboarding/OnboardingFlow.tsx` (`agreePrivacy`,
  `agreeTerms`, guardian fields for minors, honeypot `companyWebsite`).
- Rules: `firestore.rules` (role never client-writable), `storage.rules` (private,
  ≤10 MB image/PDF).
- Headers: `firebase.json` (HSTS preload, nosniff, SAMEORIGIN, Referrer-Policy,
  Permissions-Policy).
- Cookies: `src/components/site/CookieConsent.tsx` (`t4c-cookie-consent` flag only).
- Export/erasure: `api.exportMyData` (live Firestore assembly); deletion via admin-gated paths.
