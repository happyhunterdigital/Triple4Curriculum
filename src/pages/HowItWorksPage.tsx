import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, BookOpen, Zap, ArrowRight } from 'lucide-react';
import { PageShell, SectionEyebrow, SectionHeading, Body, RevealStagger } from '../components/site/Section';

export function HowItWorksPage() {
  useEffect(() => { document.title = 'How It Works: Triple 4 Curriculum'; }, []);
  return (
    <div className="w-full bg-[var(--color-canvas-soft)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8 lg:p-10">
          <SectionEyebrow>How It Works</SectionEyebrow>
          <h1 className="mt-2 font-display text-[30px] sm:text-[42px] font-semibold tracking-tight leading-[0.95]">Four hours.<br />Zero dead time.</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 max-w-[60ch]">We cover the full curriculum in four focused hours, eliminating crowd control and transitions that waste traditional school days.</p>
          <Link to="/curriculum" className="inline-flex mt-5 bg-[var(--color-t4c-black)] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">View Curriculum</Link>
        </div>
      </div>

      <PageShell>
        {/* Why 4?, 4 cards staggered */}
        <RevealStagger>
          <SectionHeading>Why 4?</SectionHeading>
          <Body className="mt-2">Each number is intentional, backed by wellbeing and learning science.</Body>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, h:'Why 4 days a week?', bullets:['Boost staff morale, extra day for planning','Reduces student burnout, longer weekend to recharge','Growth opportunities, jobs & volunteering','Cuts operational costs'] },
              { icon: Clock, h:'Why 4 hours a day?', bullets:['Prevents cognitive overload','Maximizes peak engagement','Reduces teacher burnout'] },
              { icon: BookOpen, h:'Why 4 lessons a day?', bullets:['Protects natural attention span','Prevents mental fatigue','Builds consistency & retention'] },
              { icon: Zap, h:'Why 16 per class?', bullets:['Controlled environment','Accelerates growth & confidence','Individual attention','Reduces mental stress'] },
            ].map(c=>(
              <div key={c.h} className="bg-white border border-black/10 rounded-[16px] p-6">
                <div className="w-8 h-8 rounded-full bg-[var(--color-t4c-green)] text-white flex items-center justify-center"><c.icon size={14} /></div>
                <h3 className="mt-3 font-semibold text-sm">{c.h}</h3>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-neutral-700">{c.bullets.map(b=><li key={b} className="flex gap-2"><span className="text-[var(--color-t4c-green)]">·</span>{b}</li>)}</ul>
              </div>
            ))}
          </div>
        </RevealStagger>

        {/* T4C Model & Schedule, zig-zag 1/2 */}
        <RevealStagger>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <SectionHeading className="text-[22px]">The T4C Model &amp; Schedule</SectionHeading>
              <h3 className="mt-3 font-semibold text-sm">How can a student cover the full curriculum in only 4 hours?</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">Traditional schools spend hours on crowd control, assemblies and transitions. By moving online and capping at 16, we eliminate dead time, four hours are pure, high-impact live instruction led by a teacher, covering the entire curriculum more efficiently without draining energy.</p>
              <h3 className="mt-4 font-semibold text-sm">Is there homework after the 4 lessons?</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700">Yes, highly structured and manageable. Targeted independent study fulfils national registration and exam benchmarks without overwhelming busywork.</p>
            </div>
            <div className="bg-[var(--color-t4c-green)] text-white rounded-[16px] p-6 sm:p-8">
              <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-t4c-yellow)]">A four-hour day</p>
              <div className="mt-4 space-y-2">
                {['08:00-09:00 · Lesson 1','09:00-10:00 · Lesson 2','10:00-10:15 · Break','10:15-11:15 · Lesson 3','11:15-12:15 · Lesson 4'].map(s=>(
                  <div key={s} className={`px-3 py-2 rounded-full text-xs font-mono ${s.includes('Break') ? 'bg-white/15 text-white/80' : 'bg-white text-[var(--color-t4c-black)] font-bold'}`}>{s}</div>
                ))}
              </div>
              <p className="mt-4 text-xs text-white/70">Mon-Thu live · Fri apprenticeship &amp; targeted homework · Recordings included</p>
            </div>
          </div>
        </RevealStagger>

        {/* Blended Model, zig-zag 2/2 */}
        <RevealStagger>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div className="order-2 lg:order-1 rounded-[16px] overflow-hidden border border-black/10 h-[280px] bg-neutral-100">
              <img src="https://res.cloudinary.com/dka0498ns/image/upload/v1787253903/Triple4c_learners_hero_image_mzxiye.jpg" alt="Blended learning" className="w-full h-full object-cover" />
            </div>
            <div className="order-1 lg:order-2 bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <SectionHeading className="text-[22px]">How our blended model works</SectionHeading>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">We bridge world-class standards and personalized flexibility, integrating South African national standards (CAPS) with globally recognised international frameworks. Students are prepared for SACCAI Matric and smooth transition internationally.</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">Focused, live teacher-led instruction in 4 daily lessons plus premium self-paced digital resources, mastering concepts actively, eliminating repetitive busywork. When four hours are done, learning is complete.</p>
            </div>
          </div>
        </RevealStagger>

        {/* Class environment, full-width editorial (must not be followed by zig-zag) */}
        <RevealStagger>
          <div className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8">
            <SectionHeading className="text-[22px]">Class environment &amp; support</SectionHeading>
            <div className="mt-5 grid md:grid-cols-3 gap-4">
              <div className="border border-black/10 rounded-[12px] p-5"><h3 className="font-semibold text-sm">Are lessons pre-recorded or live?</h3><p className="mt-1 text-xs leading-relaxed text-neutral-600">Every single one of the 4 daily lessons is <strong>100% live</strong>. A certified teacher is on camera for the full lesson, teaching, facilitating, answering in real time, mentoring.</p></div>
              <div className="border border-black/10 rounded-[12px] p-5"><h3 className="font-semibold text-sm">Why strictly 16 per class?</h3><p className="mt-1 text-xs leading-relaxed text-neutral-600">Many online schools pack hundreds into a call. We cap at exactly 16 so teachers monitor progress, call on names, and no one hides behind mute.</p></div>
              <div className="border border-black/10 rounded-[12px] p-5"><h3 className="font-semibold text-sm">What role do parents play?</h3><p className="mt-1 text-xs leading-relaxed text-neutral-600">Aside from helping Grade R / Foundation log in, parents step back completely, T4C is fully teacher-led.</p></div>
            </div>
          </div>
        </RevealStagger>

        {/* Contextual FAQ */}
        <RevealStagger>
          <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
            <h3 className="font-semibold">Schedule FAQs</h3>
            <div className="mt-3 divide-y divide-black/10">
              {[
                ['What if we miss a live lesson?','Recordings are provided for review, self-paced catch-up without pressure.'],
                ['Does the 4-day week affect SACCAI hours?','No, targeted Friday homework fulfils required study hours and SBAs.'],
                ['How are 16 caps enforced?','At enrollment and timetabling, no class exceeds 16. See Admissions.'],
              ].map(([q,a])=>(
                <details key={q} className="py-3 group"><summary className="list-none flex justify-between gap-4 cursor-pointer text-sm font-medium">{q}<ArrowRight size={14} className="shrink-0 group-open:rotate-90 transition-transform text-[var(--color-t4c-green)]" /></summary><p className="mt-1 text-sm text-neutral-600">{a}</p></details>
              ))}
            </div>
            <Link to="/faq" className="inline-flex mt-4 text-xs font-bold uppercase tracking-widest underline decoration-[var(--color-t4c-yellow)] decoration-2 underline-offset-4">All FAQs →</Link>
          </div>
        </RevealStagger>
      </PageShell>
    </div>
  );
}
