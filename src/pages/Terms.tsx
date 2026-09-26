import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const SECTIONS: Array<{ h: string; body: React.ReactNode }> = [
  {
    h: '1. The school & the 4-4-4 model',
    body: (
      <p>
        Triple 4 Curriculum (“Triple 4C”) is an online school for Grade R–12 (SACCAI-track). The
        4-4-4 model means <strong>4 days a week (Mon–Thu live), 4 hours a day, 4 lessons a day</strong>,
        with classes capped at <strong>16 learners</strong> and Fridays reserved for skills,
        catch-up and support. Timetables, phases and class caps published on the site form part of
        this agreement.
      </p>
    ),
  },
  {
    h: '2. Admissions & enrolment',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Applications via /onboarding; placement depends on phase availability, prior records, and the 16-per-class cap.</li>
        <li>Guardians warrant that enrolment details are accurate and that they hold authority to enrol the learner.</li>
        <li>Under-18 enrolments require guardian consent; under-13 enrolments require verifiable guardian consent (see Privacy Policy §4).</li>
        <li>We may request transcripts, ID/address documents, and placement work before confirming a seat.</li>
      </ul>
    ),
  },
  {
    h: '3. Fees, billing & SACCAI costs',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Fees are published on /admissions; monthly or annual billing in ZAR, USD or GBP at the payment-date exchange rate.</li>
        <li>Fees exclude SACCAI Grade 12 final exam fees and yearly SACCAI registration (variable, invoiced separately). An annual registration & application fee applies.</li>
        <li>Non-payment may suspend live-class access after reasonable notice; assessment records are retained per DBE/SACCAI rules.</li>
        <li>Card payments are processed by Stripe — we never store card numbers.</li>
      </ul>
    ),
  },
  {
    h: '4. Live-class conduct & safeguarding',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>All lessons are 100% live with a certified teacher on camera. Recordings are provided for review to enrolled families only and may not be redistributed.</li>
        <li>Learners must attend on time, keep conduct respectful, and follow teacher instructions. Bullying, hate speech, cheating, or sharing class links/recordings leads to warnings, suspension, or expulsion.</li>
        <li>No private 1:1 staff–learner contact outside supervised school channels. Safeguarding concerns may be reported to support@triple4c.com.</li>
        <li>Parents of Foundation Phase learners assist with login only; beyond that classrooms are teacher-led.</li>
      </ul>
    ),
  },
  {
    h: '5. Academic integrity, assessment & progression',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Submitted work must be the learner’s own unless collaboration is explicitly allowed. Plagiarism/AI-misuse policies apply to assignments and exams.</li>
        <li>FET Grades 10–12 follows SACCAI requirements (SBAs, exams) toward the NSC Matric; progression and certification depend on meeting those standards.</li>
        <li>Attendance registers, scripts and promotion schedules are archived per DBE/SACCAI record-keeping duties.</li>
      </ul>
    ),
  },
  {
    h: '6. Withdrawals, suspensions & refunds',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Guardians may withdraw with one calendar month’s written notice to admissions@t4c.com; access runs to the end of the paid period.</li>
        <li>Annual plans: pro-rata refund of unused full months less registration/SACCAI charges; monthly plans are not refunded mid-cycle.</li>
        <li>We may suspend or expel for serious misconduct or persistent non-payment after notice; statutory records are still preserved.</li>
      </ul>
    ),
  },
  {
    h: '7. Intellectual property of the curriculum',
    body: (
      <p>
        All curriculum materials, lesson recordings, slides, quizzes and platform content are the
        exclusive property of Triple 4C (or its licensors). Enrolment grants a limited,
        non-transferable licence for personal study only. Copying, republishing, reselling, or
        training external models on our materials is prohibited.
      </p>
    ),
  },
  {
    h: '8. Acceptable use & liability',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Do not misuse the platform, probe security, scrape content, or upload unlawful material.</li>
        <li>Services are provided “as is”; to the maximum extent permitted by law (including the Consumer Protection Act 68 of 2008 where applicable), Triple 4C is not liable for indirect or consequential loss.</li>
        <li>Nothing limits liability for gross negligence, wilful misconduct, or where the law does not permit limitation.</li>
      </ul>
    ),
  },
  {
    h: '9. Privacy, POPIA & communications',
    body: (
      <p>
        Processing of personal information is governed by our{' '}
        <Link to="/privacy" className="underline font-semibold">Privacy Policy</Link> (POPIA Act 4 of
        2013). By accepting these Terms you confirm the guardian consents referenced there. We may
        send service messages (timetable, grades, safeguarding); marketing only with opt-in consent.
      </p>
    ),
  },
  {
    h: '10. Governing law, disputes & contact',
    body: (
      <p>
        These Terms are governed by the laws of South Africa. Disputes will first be addressed
        through good-faith discussion with support@triple4c.com, then mediation in Cape Town before
        litigation. Contact: admissions@t4c.com · support@triple4c.com. Last updated:{' '}
        <strong>19 September 2026</strong>.
      </p>
    ),
  },
];

export const Terms: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service: Triple 4 Curriculum';
  }, []);

  return (
    <main
      className="w-full max-w-3xl mx-auto bg-white border border-black/10 rounded-xl p-5 sm:p-8 my-4"
      aria-labelledby="terms-title"
    >
      <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
        Triple 4C · Terms of Service
      </p>
      <h1 id="terms-title" className="text-2xl sm:text-3xl font-bold mt-2 tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-xs text-neutral-500">
        Admissions · fees · 4-4-4 model · live-class conduct · withdrawals · curriculum IP ·
        liability. Effective 19 September 2026.
      </p>
      <div className="mt-4 space-y-6 text-sm leading-relaxed text-neutral-700">
        {SECTIONS.map((s) => (
          <section key={s.h} aria-label={s.h}>
            <h2 className="font-semibold text-[15px] text-neutral-900">{s.h}</h2>
            <div className="mt-1.5">{s.body}</div>
          </section>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-4 border-t border-black/10 pt-4">
        <Link to="/privacy" className="underline text-sm font-medium">
          Read the Privacy Policy
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
