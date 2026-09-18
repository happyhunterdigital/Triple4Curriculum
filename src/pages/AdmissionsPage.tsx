import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, School, Home } from 'lucide-react';
import { PageShell, SectionEyebrow, SectionHeading, Body, RevealStagger } from '../components/site/Section';
import { PricingTable } from '../components/site/PricingTable';

export function AdmissionsPage() {
  useEffect(() => { document.title = 'Admissions & Fees — Triple 4 Curriculum'; }, []);
  return (
    <div className="w-full bg-[var(--color-canvas-soft)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8 lg:p-10">
          <SectionEyebrow>Admissions</SectionEyebrow>
          <h1 className="mt-2 font-display text-[30px] sm:text-[42px] font-semibold tracking-tight leading-[0.95]">Two ways to join.<br />One standard.</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 max-w-[60ch]">Choose Online School or Homeschool support — same 16-cap live classes, same accredited path.</p>
          <a href="#apply" className="inline-flex mt-5 bg-[var(--color-t4c-black)] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">Start Application <ArrowRight size={14} className="ml-1" /></a>
        </div>
      </div>

      <PageShell>
        {/* 2 enrollment types — bento */}
        <RevealStagger>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <div className="w-10 h-10 rounded-full bg-[var(--color-t4c-green)] text-white flex items-center justify-center"><School size={18} /></div>
              <h3 className="mt-3 font-display font-semibold text-[18px]">Online School Enrollment</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">Daily synchronized classes capped at just 16 — collaborative and engaging. Full access to online services, course materials, regular assessments, termly progress reports, and dedicated 1-on-1 support.</p>
              <p className="mt-3 text-xs text-neutral-500">Best for families wanting a complete online school.</p>
            </div>
            <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <div className="w-10 h-10 rounded-full bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] flex items-center justify-center border border-black/10"><Home size={18} /></div>
              <h3 className="mt-3 font-display font-semibold text-[18px]">Homeschool Enrollment</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">Teachers present to guide and instruct at all times — peace of mind for parents. Extensive materials, flexible and accessible syllabi tailored to every learner.</p>
              <p className="mt-3 text-xs text-neutral-500">Best for families homeschooling with teacher support.</p>
            </div>
          </div>
        </RevealStagger>

        {/* Pricing — price cards full */}
        <RevealStagger>
          <div id="fees" className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
            <SectionHeading className="text-[22px]">Online and Homeschool enrollment &amp; fees</SectionHeading>
            <Body className="mt-2">Monthly or annual tuition — annual registration &amp; application fee applies. See pricing below.</Body>
            <div className="mt-6"><PricingTable /></div>
          </div>
        </RevealStagger>

        {/* Fine print — full-width editorial */}
        <RevealStagger>
          <div className="bg-[var(--color-t4c-black)] text-white rounded-[16px] p-6 sm:p-8">
            <h3 className="font-semibold text-sm">Payments &amp; important notes</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">All enrollment fees are exclusive of all final exam fees including the SACCAI Grade 12 final exams. Additionally, the yearly SACCAI registration fees — subject to change and increase — are also excluded. Payments can be made in Zar (R), USD ($), or British Pounds (£). Please be aware that exchange rates fluctuate.</p>
          </div>
        </RevealStagger>

        {/* Docs required — staggered checklist */}
        <RevealStagger>
          <div id="docs">
            <SectionHeading className="text-[22px]">Admission &amp; registration requirements</SectionHeading>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">T4C is an inclusive, non-discriminatory institution — welcoming all learners regardless of gender, ethnicity, religion, race or background, provided they meet our minimum criteria. Parents must submit documents for both learner and parent — the school will verify all records.</p>
            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
                <h3 className="font-semibold text-sm">Learner documents</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
                  <li className="flex gap-2"><Check size={14} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />ID photo or passport — recent copy</li>
                  <li className="flex gap-2"><Check size={14} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />Birth certificate — full copy</li>
                  <li className="flex gap-2"><Check size={14} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />Most recent school report (if currently enrolled)</li>
                  <li className="flex gap-2"><Check size={14} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />Homeschool letter — parent letter explaining home study subjects &amp; curriculum (if homeschooled)</li>
                </ul>
              </div>
              <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
                <h3 className="font-semibold text-sm">Parent documents</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
                  <li className="flex gap-2"><Check size={14} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />ID document — certified copy of ID or passport</li>
                  <li className="flex gap-2"><Check size={14} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />Proof of residence — valid document confirming home address</li>
                </ul>
                <p className="mt-4 text-xs text-neutral-500">Upload during application — our team verifies every record before confirmation.</p>
              </div>
            </div>
          </div>
        </RevealStagger>

        {/* Admissions FAQs */}
        <RevealStagger>
          <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
            <h3 className="font-semibold">Admissions FAQs</h3>
            <div className="mt-3 divide-y divide-black/10">
              {[
                ['When is the annual registration fee due?','At enrollment — see the fee table above. Contact admissions@t4c.com for the current year amount.'],
                ['Are exam fees included?','No — SACCAI Grade 12 final exam fees and yearly SACCAI registration are excluded and invoiced separately.'],
                ['Can we pay in USD or GBP?','Yes — ZAR, USD or GBP at the payment-date exchange rate.'],
              ].map(([q,a])=>(
                <details key={q} className="py-3 group"><summary className="list-none flex justify-between gap-4 cursor-pointer text-sm font-medium">{q}<ArrowRight size={14} className="shrink-0 group-open:rotate-90 transition-transform text-[var(--color-t4c-green)]" /></summary><p className="mt-1 text-sm text-neutral-600">{a}</p></details>
              ))}
            </div>
            <Link to="/faq" className="inline-flex mt-3 text-xs font-bold uppercase tracking-widest underline decoration-[var(--color-t4c-yellow)] decoration-2 underline-offset-4">All FAQs →</Link>
          </div>
        </RevealStagger>

        {/* Apply — form anchor */}
        <RevealStagger>
          <div id="apply" className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8 lg:p-10">
            <SectionHeading className="text-[22px]">Apply to T4C</SectionHeading>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">Start your application — our admissions team will guide you through document verification and placement.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/onboarding" className="inline-flex bg-[var(--color-t4c-black)] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">Start Application</Link>
              <a href="mailto:admissions@t4c.com" className="inline-flex border border-black/10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:border-[var(--color-t4c-yellow)]">Email admissions@t4c.com</a>
              <a href="https://wa.me/447577924174" target="_blank" rel="noreferrer" className="inline-flex border border-black/10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:border-[var(--color-t4c-yellow)]">WhatsApp UK</a>
            </div>
            <p className="mt-4 text-xs text-neutral-500">Prefer to talk? Call SA +27 689-758-960 / +27 639-642-288 or see <Link to="/contact" className="underline">Contact</Link>.</p>
          </div>
        </RevealStagger>
      </PageShell>
    </div>
  );
}
