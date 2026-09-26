import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const SECTIONS: Array<{ id: string; h: string; body: React.ReactNode }> = [
  {
    id: 'who',
    h: '1. Who we are (Responsible Party)',
    body: (
      <p>
        Triple 4 Curriculum (“Triple 4C”, “we”, “us”) is a premium online school for Grade R–12
        (SACCAI-track). We are the <strong>Responsible Party</strong> under the Protection of
        Personal Information Act 4 of 2013 (POPIA). Our appointed{' '}
        <strong>Information Officer</strong> can be reached at{' '}
        <a href="mailto:privacy@triple4c.com" className="underline font-semibold">
          privacy@triple4c.com
        </a>
        . General enquiries: <a href="mailto:support@triple4c.com" className="underline">support@triple4c.com</a>.
      </p>
    ),
  },
  {
    id: 'what',
    h: '2. What we collect (data minimisation)',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Identity & contact:</strong> learner/parent name, email, phone, home address, date of birth.</li>
        <li><strong>Education records (FERPA-style):</strong> previous school, grade/phase, transcripts, attendance, assignments, grades, teacher notes. Access is limited to the learner, their guardian, and authorised staff.</li>
        <li><strong>Guardian data:</strong> parent/legal-guardian name and contact, plus verifiable consent record for minors.</li>
        <li><strong>Staff data:</strong> qualifications, SACE/teaching certificates, background-check consent status, masked ID/tax numbers (full numbers never stored in Firestore).</li>
        <li><strong>Technical:</strong> Firebase Auth identifiers, hashed/truncated network identifiers in audit logs. Raw IP addresses are never shown to clients.</li>
        <li><strong>We do not collect</strong> biometrics, health records beyond disclosed learning needs, or payment card numbers (payments are handled by Stripe).</li>
      </ul>
    ),
  },
  {
    id: 'basis',
    h: '3. Lawful basis & purpose (POPIA s11)',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Consent</strong> — captured at registration via the <span className="font-mono text-xs">agreePrivacy</span> checkbox and stored with a timestamp.</li>
        <li><strong>Contract</strong> — enrolment, timetabling, live classes, assessment and certification.</li>
        <li><strong>Legal obligation</strong> — DBE/SACCAI record-keeping, assessment archives, and audit trails.</li>
        <li><strong>Legitimate interest</strong> — platform security, fraud prevention, and service improvement (always balanced against learner privacy).</li>
      </ul>
    ),
  },
  {
    id: 'children',
    h: '4. Children’s privacy (Children’s Act 38 of 2005 · COPPA · GDPR)',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Learners under <strong>18</strong> register with a <strong>parent/legal guardian</strong>; guardian name, contact and consent are recorded.</li>
        <li>For children under <strong>13</strong> (COPPA) and under <strong>16</strong> where GDPR applies, we require <strong>verifiable guardian consent</strong> before processing — no account is activated without it.</li>
        <li>Live-class conduct rules protect minors: no private 1:1 staff–learner messaging outside supervised channels; recordings are for enrolled families only.</li>
        <li>Guardians may review, correct, or request deletion of their child’s data at any time (see §9).</li>
      </ul>
    ),
  },
  {
    id: 'sharing',
    h: '5. Sharing & cross-border transfers (POPIA s72)',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Processors:</strong> Firebase (Auth/Firestore/Storage/Hosting), Google Gemini (optional AI quiz, client-side restricted key), Cloudinary (media), Stripe (payments). Each processes only what it needs.</li>
        <li><strong>SACCAI/DBE:</strong> registration and Grade 12 exam data shared as legally required.</li>
        <li><strong>Cross-border:</strong> Firebase/Google infrastructure may store data outside South Africa. By enrolling you consent to s72 transfers subject to equivalent protections in our processor contracts.</li>
        <li>We never sell personal information.</li>
      </ul>
    ),
  },
  {
    id: 'retention',
    h: '6. Retention (DBE/SACCAI record-keeping)',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Enrolment & assessment records:</strong> retained for the statutory archive period required by DBE/SACCAI (assessment scripts, attendance registers, promotion schedules).</li>
        <li><strong>Active accounts:</strong> kept for the duration of enrolment plus 5 years for audit/reference, then minimised or deleted.</li>
        <li><strong>Marketing/contact messages:</strong> 12 months after last contact unless consent is renewed.</li>
        <li><strong>Audit logs:</strong> retained in admin-only collections with hashed identifiers.</li>
      </ul>
    ),
  },
  {
    id: 'security',
    h: '7. Security safeguards (POPIA s19)',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Firebase-native enforcement: owner-scoped writes, staff-gated management, admin-only audit reads; <span className="font-mono text-xs">role</span> is never client-writable (see <span className="font-mono text-xs">firestore.rules</span>).</li>
        <li>Sensitive numbers (ID, tax, bank) stored masked; documents in private Firebase Storage (≤10 MB, image/PDF only).</li>
        <li>HTTPS everywhere with HSTS preload; security headers via <span className="font-mono text-xs">firebase.json</span> (nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy).</li>
        <li>The Gemini key (<span className="font-mono text-xs">VITE_GEMINI_API_KEY</span>) is a public client key restricted to triple4c.com HTTP referrers — never a server secret. See SECURITY.md.</li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    h: '8. Cookies & local storage',
    body: (
      <p>
        We use strictly-necessary storage (Firebase Auth session, theme preference) and a single{' '}
        <span className="font-mono text-xs">t4c-cookie-consent</span> flag remembering your banner choice.
        No advertising trackers. Cookie preferences can be reset by clearing site data; see our banner’s
        Accept/Decline choice at any time.
      </p>
    ),
  },
  {
    id: 'rights',
    h: '9. Your rights (POPIA ss 14, 23–25)',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Request <strong>access/export</strong> of your data and <strong>correction or deletion</strong> (email <a href="mailto:privacy@triple4c.com" className="underline">privacy@triple4c.com</a>).</li>
        <li>Object to processing or withdraw consent — withdrawal does not affect prior lawful processing but may end enrolment-dependent services.</li>
        <li>Lodge a complaint with the <strong>Information Regulator (South Africa)</strong> if unresolved: <a href="https://www.inforegulator.org.za" target="_blank" rel="noreferrer" className="underline">inforegulator.org.za</a>.</li>
        <li>EU/UK learners additionally hold GDPR rights (access, rectification, erasure, restriction, portability, objection); US under-13 guardians hold COPPA consent rights.</li>
      </ul>
    ),
  },
  {
    id: 'changes',
    h: '10. Changes & contact',
    body: (
      <p>
        Material changes will be announced to enrolled families before taking effect. Last updated:{' '}
        <strong>19 September 2026</strong>. Information Officer:{' '}
        <a href="mailto:privacy@triple4c.com" className="underline font-semibold">privacy@triple4c.com</a>.
      </p>
    ),
  },
];

export const Privacy: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy: Triple 4 Curriculum';
  }, []);

  return (
    <main
      className="w-full max-w-3xl mx-auto bg-white border border-black/10 rounded-xl p-5 sm:p-8 my-4"
      aria-labelledby="privacy-title"
    >
      <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
        Triple 4C · Privacy Policy
      </p>
      <h1 id="privacy-title" className="text-2xl sm:text-3xl font-bold mt-2 tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs text-neutral-500">
        POPIA Act 4 of 2013 · Children’s Act 38 of 2005 · DBE/SACCAI record-keeping · GDPR · COPPA ·
        FERPA-style education records. Effective 19 September 2026.
      </p>

      <nav aria-label="Privacy sections" className="mt-4 rounded-lg bg-neutral-50 border border-black/10 p-3 text-xs">
        <ul className="grid sm:grid-cols-2 gap-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#privacy-${s.id}`} className="underline hover:text-emerald-700">
                {s.h}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 space-y-6 text-sm leading-relaxed text-neutral-700">
        {SECTIONS.map((s) => (
          <section key={s.id} id={`privacy-${s.id}`} aria-label={s.h} className="scroll-mt-4">
            <h2 className="font-semibold text-[15px] text-neutral-900">{s.h}</h2>
            <div className="mt-1.5">{s.body}</div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 border-t border-black/10 pt-4">
        <Link to="/terms" className="underline text-sm font-medium">
          Read the Terms of Service
        </Link>
        <Link to="/onboarding" className="underline text-sm">
          Back to onboarding
        </Link>
        <Link to="/" className="underline text-sm">
          Home
        </Link>
      </div>
    </main>
  );
};
