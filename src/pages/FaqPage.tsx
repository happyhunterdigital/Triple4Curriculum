import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageShell, SectionEyebrow, SectionHeading, Body, RevealStagger } from '../components/site/Section';

const GROUPS: { title: string; items: { q: string; a: string; href: string }[] }[] = [
  { title: 'Triple-Benefits of Our Model', items: [
    { q:'What do children gain?', a:'Interactive classrooms of 16, seen, heard, engaged by a live teacher, with a 4-day week for passion and rest.', href:'/how-it-works' },
    { q:'What do parents gain?', a:'Hands-off supervision, certified teachers lead every class. A safe 16-person community and evenings/weekends back.', href:'/how-it-works' },
    { q:'What do teachers gain?', a:'Focused workloads, 16 students, 4 lessons/day, and a 5th day for prep and upskilling.', href:'/how-it-works' },
  ]},
  { title: 'Blended Model', items: [
    { q:'What is the blended model?', a:'CAPS plus international benchmarks, rigorous standards with self-paced digital resources. Learning is complete when four hours are done.', href:'/curriculum' },
  ]},
  { title: 'Why 4 Days / 4 Hours / 4 Lessons / 16 Students', items: [
    { q:'Why 4 days?', a:'Morale, burnout prevention, growth opportunities, and lower operational costs.', href:'/how-it-works' },
    { q:'Why 4 hours?', a:'Prevents cognitive overload, maximizes peak engagement, reduces burnout.', href:'/how-it-works' },
    { q:'Why 4 lessons?', a:'Four shorter sessions protect attention, prevent fatigue, and improve long-term retention.', href:'/how-it-works' },
    { q:'Why 16?', a:'Controlled environment, individual attention, confidence, and lower stress.', href:'/how-it-works' },
  ]},
  { title: 'T4C Model & Schedule', items: [
    { q:'How do you cover the full curriculum in 4 hours?', a:'We eliminate dead time, crowd control, assemblies, transitions, so four hours are pure high-impact instruction.', href:'/how-it-works' },
    { q:'Is there homework?', a:'Yes, targeted, manageable independent study that fulfils SACCAI benchmarks without busywork.', href:'/how-it-works' },
  ]},
  { title: 'Curriculum & Academics', items: [
    { q:'Is this international as well as South African?', a:'Yes, a dual approach preparing learners for SACCAI Matric and international transitions.', href:'/curriculum' },
    { q:'How do you handle Grade R-3 online?', a:'Highly active, sensory, playful lessons, props, songs, interactive tools, minimal screen fatigue.', href:'/curriculum' },
    { q:'Is the Matric valid?', a:'Yes, FET (10-12) aligns with SACCAI; SBAs and study hours lead to a recognised NSC certificate.', href:'/curriculum' },
  ]},
  { title: 'Class Environment & Support', items: [
    { q:'Are lessons live or recorded?', a:'All 4 daily lessons are 100% live. Recordings are provided for review and self-paced catch-up.', href:'/how-it-works' },
    { q:'Why cap at 16?', a:'So teachers know every child by name and no one hides behind mute.', href:'/how-it-works' },
    { q:'What do parents do during school hours?', a:'After Foundation login help, parents step back, T4C is fully teacher-led.', href:'/how-it-works' },
  ]},
];

export function FaqPage() {
  useEffect(() => { document.title = 'FAQ: Triple 4 Curriculum'; }, []);
  return (
    <div className="w-full bg-[var(--color-canvas-soft)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8 lg:p-10">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h1 className="mt-2 font-display text-[30px] sm:text-[42px] font-semibold tracking-tight leading-[0.95]">Straight answers.<br />No repeats.</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 max-w-[60ch]">Short answers here. Deep dives on their home pages, click Read more.</p>
          <Link to="/contact" className="inline-flex mt-5 bg-[var(--color-t4c-black)] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">Still stuck? Contact us</Link>
        </div>
      </div>
      <PageShell>
        {GROUPS.map(g=>(
          <RevealStagger key={g.title}>
            <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <h2 className="font-display font-semibold text-[18px] text-[var(--color-t4c-black)]">{g.title}</h2>
              <div className="mt-4 divide-y divide-black/10">
                {g.items.map(it=>(
                  <details key={it.q} className="py-3 group">
                    <summary className="list-none flex justify-between gap-4 cursor-pointer text-sm font-medium">{it.q}<ArrowRight size={14} className="shrink-0 group-open:rotate-90 transition-transform text-[var(--color-t4c-green)]" /></summary>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">{it.a} <Link to={it.href} className="underline decoration-[var(--color-t4c-green)]">Read more</Link></p>
                  </details>
                ))}
              </div>
            </div>
          </RevealStagger>
        ))}
        <RevealStagger>
          <div className="rounded-[16px] bg-[var(--color-t4c-black)] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div><h3 className="font-display text-[18px] font-semibold">Need a human?</h3><p className="text-sm text-white/70">SA or UK, we reply within one school day.</p></div>
            <Link to="/contact" className="shrink-0 bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">Contact us</Link>
          </div>
        </RevealStagger>
      </PageShell>
    </div>
  );
}
