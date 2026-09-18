import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Sparkles, ArrowRight } from 'lucide-react';
import { PageShell, SectionEyebrow, SectionHeading, Body, RevealStagger } from '../components/site/Section';

export function CurriculumPage() {
  useEffect(() => { document.title = 'Curriculum — Triple 4 Curriculum'; }, []);
  return (
    <div className="w-full bg-[var(--color-canvas-soft)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8 lg:p-10">
          <SectionEyebrow>Academics</SectionEyebrow>
          <h1 className="mt-2 font-display text-[30px] sm:text-[42px] font-semibold tracking-tight leading-[0.95]">A blended path<br />to a valid NSC.</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 max-w-[60ch]">CAPS plus international depth — from playful Foundation to SACCAI-aligned FET Matric.</p>
          <Link to="/admissions#docs" className="inline-flex mt-5 bg-[var(--color-t4c-black)] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">Check eligibility</Link>
        </div>
      </div>

      <PageShell>
        {/* Timeline */}
        <RevealStagger>
          <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
            <SectionHeading className="text-[22px]">Grade progression</SectionHeading>
            <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { k:'Foundation', g:'Grade R–3', d:'Playful, sensory, movement' },
                { k:'Intermediate', g:'Grade 4–6', d:'Core mastery & inquiry' },
                { k:'Senior', g:'Grade 7–9', d:'Depth & subject choice' },
                { k:'FET', g:'Grade 10–12', d:'SACCAI NSC Matric' },
              ].map(s=>(
                <div key={s.k} className="border border-black/10 rounded-[12px] p-4 text-center">
                  <p className="font-display font-bold text-[var(--color-t4c-green)]">{s.k}</p>
                  <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">{s.g}</p>
                  <p className="text-xs text-neutral-600 mt-1">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealStagger>

        {/* Blended explained — full-width editorial */}
        <RevealStagger>
          <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
            <SectionHeading className="text-[22px]">What is a blended curriculum model?</SectionHeading>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700 max-w-[75ch]">Our curriculum blends the comprehensive benchmarks of South African international educational standards. This dual approach ensures students are equipped to register through assessment bodies like <strong>SACCAI</strong>, write local Matric examinations, or transition smoothly internationally.</p>
            <div className="mt-5 grid sm:grid-cols-3 gap-4">
              {[
                { icon: BookOpen, t:'Required subjects', d:'All required subjects per phase, taught live.' },
                { icon: Sparkles, t:'Live + recorded', d:'Daily synchronized lessons plus recordings for review.' },
                { icon: Award, t:'Assessments & reports', d:'Formal term assessments and termly progress reports.' },
              ].map(c=>(
                <div key={c.t} className="border border-black/10 rounded-[12px] p-4 flex gap-3"><c.icon size={16} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" /><div><p className="text-sm font-semibold">{c.t}</p><p className="text-xs text-neutral-600">{c.d}</p></div></div>
              ))}
            </div>
          </div>
        </RevealStagger>

        {/* Grade R-3 bento */}
        <RevealStagger>
          <SectionHeading className="text-[22px]">How we cater to Grade R–3 online</SectionHeading>
          <Body className="mt-2">Our youngest learners cannot sit for hours — lessons are highly active, sensory, and playful while keeping screen fatigue minimal.</Body>
          <div className="mt-5 grid sm:grid-cols-3 gap-4">
            {[
              { t:'Play-based', d:'Songs, physical props, and interactive digital tools keep learners moving.' },
              { t:'Movement', d:'Teachers design for standing, doing, and discovering — not passive watching.' },
              { t:'Discovery', d:'Short, varied segments protect attention and build joy in learning.' },
            ].map(c=>(
              <div key={c.t} className="bg-white border border-black/10 rounded-[16px] p-6"><h3 className="font-semibold text-sm">{c.t}</h3><p className="mt-1 text-xs leading-relaxed text-neutral-600">{c.d}</p></div>
            ))}
          </div>
        </RevealStagger>

        {/* FET & SACCAI — single zig-zag isolated */}
        <RevealStagger>
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div className="bg-[var(--color-t4c-green)] text-white rounded-[16px] p-6 sm:p-8 lg:p-10">
              <SectionHeading className="text-[22px] !text-white">FET &amp; valid Matric</SectionHeading>
              <p className="mt-3 text-sm leading-relaxed text-white/90">Will my child receive a valid matric certificate at the end of Grade 12? <strong>Yes.</strong> Our FET phase (Grades 10–12) aligns with SACCAI requirements — SBAs, practical tasks, and required study hours — so matriculants sit for accredited final national examinations and graduate with a universally recognised <strong>NSC</strong> Matric certificate.</p>
              <Link to="/admissions#fees" className="inline-flex mt-4 bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">See FET fees</Link>
            </div>
            <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">FET at a glance</p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
                <li className="flex gap-2"><span className="text-[var(--color-t4c-green)]">·</span>All required subjects + exam preparation</li>
                <li className="flex gap-2"><span className="text-[var(--color-t4c-green)]">·</span>School-based assessments (SBAs) and practical tasks</li>
                <li className="flex gap-2"><span className="text-[var(--color-t4c-green)]">·</span>SACCAI-registered final examinations</li>
                <li className="flex gap-2"><span className="text-[var(--color-t4c-green)]">·</span>Universally recognised NSC certificate</li>
              </ul>
            </div>
          </div>
        </RevealStagger>

        <RevealStagger>
          <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
            <h3 className="font-semibold">Curriculum FAQs</h3>
            <div className="mt-3 divide-y divide-black/10">
              {[
                ['Is the FET certificate recognised internationally?','SACCAI NSC is recognised for university entrance and international transitions.'],
                ['Do you use CAPS?','We integrate CAPS benchmarks with international frameworks — the blended model.'],
                ['What subjects are offered?','All required subjects per phase — see Admissions for fees & features.'],
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
