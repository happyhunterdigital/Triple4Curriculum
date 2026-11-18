import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Video, GraduationCap, Heart, Shield, Lightbulb, ArrowRight, Award, BookOpen } from 'lucide-react';
import { PageShell, SectionEyebrow, SectionHeading, Body, RevealStagger } from '../components/site/Section';
import { PricingTable } from '../components/site/PricingTable';
import { cloudinaryImage, cloudinarySrcSet } from '../lib/image';

const HERO_IMAGE = 'https://res.cloudinary.com/x4agmmbo/image/upload/v1793762771/T4C_hero_image.png';

function FaqTeaser() {
  const items = [
    { q: 'How do you cover the full curriculum in only 4 hours a day?', a: 'No dead time, with 16 per class there is no crowd control or transitions. Four hours are pure live instruction.' },
    { q: 'Is there homework after the 4 lessons?', a: 'Yes, targeted and manageable, it fulfils SACCAI registration and exam benchmarks without busywork.' },
    { q: 'Are lessons live or recorded?', a: 'Every lesson is 100% live with a certified teacher on camera. Recordings are included for review.' },
    { q: 'Will my child receive a valid Matric certificate?', a: 'Yes, FET Grades 10-12 aligns with SACCAI and leads to a recognised NSC Matric.' },
    { q: 'Why cap classes at 16?', a: 'So every child is known by name, monitored closely, and actively participates, no hiding behind mute.' },
  ];
  return (
    <div className="divide-y divide-black/10 border border-black/10 rounded-[16px] overflow-hidden bg-white">
      {items.map(it => (
        <details key={it.q} className="group p-4 sm:p-5 open:bg-[var(--color-canvas-soft)]">
          <summary className="list-none flex justify-between gap-4 cursor-pointer font-semibold text-sm text-[var(--color-t4c-black)]">{it.q}<ArrowRight size={14} className="shrink-0 mt-1 group-open:rotate-90 transition-transform text-[var(--color-t4c-green)]" /></summary>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{it.a} <Link to="/faq" className="underline decoration-[var(--color-t4c-green)] hover:text-[var(--color-t4c-green)]">More</Link></p>
        </details>
      ))}
    </div>
  );
}

export function HomePage() {
  useEffect(() => { document.title = 'Triple 4 Curriculum: Small Classes. Big Futures.'; }, []);
  return (
    <div className="w-full bg-[var(--color-canvas-soft)]">
      {/* Hero: brand collage. 16:9 uncropped on mobile; from sm up the copy sits
         at the bottom of the image, touching the baseline, so the faces stay clear. */}
      <section className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative rounded-[24px] sm:rounded-[40px] overflow-hidden bg-white border border-black/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] flex flex-col sm:block sm:min-h-[560px]">
          <img
            src={cloudinaryImage(HERO_IMAGE, 960)}
            srcSet={cloudinarySrcSet(HERO_IMAGE, [480, 768, 1024, 1600])}
            sizes="(min-width: 1400px) 1400px, 100vw"
            alt="Triple 4 Curriculum - Small Classes. Big Futures."
            width={2048}
            height={1143}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="block w-full h-auto sm:object-cover sm:object-[center_52%]"
          />
          {/* Left navigation panel */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-20 flex flex-col justify-start p-4 sm:p-6 border-r border-black/10">
            <nav className="space-y-2 text-sm">
              <a href="/admissions" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[var(--color-t4c-black)] hover:text-white transition-colors">
                <div className="w-3 h-3 rounded-full bg-[var(--color-t4c-green)]"></div>
                General
              </a>
              <a href="/admissions" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[var(--color-t4c-black)] hover:text-white transition-colors">
                <div className="w-3 h-3 rounded-full bg-[var(--color-t4c-green)]"></div>
                Admissions:
              </a>
              <a href="/contact" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[var(--color-t4c-black)] hover:text-white transition-colors">
                <div className="w-3 h-3 rounded-full bg-[var(--color-t4c-green)]"></div>
                Help and Support:
              </a>
            </nav>
          </div>
          {/* Text panel: glassmorphism at bottom of image, clear faces */}
          <div className="relative z-10 flex flex-col justify-end px-5 sm:px-8 lg:px-10 py-6 sm:py-8 max-w-[640px] sm:max-w-[560px] sm:ms-8 bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm border-t border-white/5">
            <SectionEyebrow>Preserving Fresh Minds Globally</SectionEyebrow>
            <h1 className="mt-2 font-display text-[30px] sm:text-[42px] lg:text-[52px] font-semibold tracking-tight leading-[0.95] text-[var(--color-t4c-black)]">Small Classes.<br />Big Futures.</h1>
            <p className="mt-2 text-[14px] sm:text-[15px] leading-relaxed text-neutral-700 max-w-[48ch]">Daily live classes capped at 16. Four days, four hours, four lessons, with a Friday for real-world skills.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/admissions#apply" className="inline-flex items-center gap-2 bg-[var(--color-t4c-black)] text-white px-6 py-3 min-h-11 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-t4c-green)] transition-colors">Check Availability <ArrowRight size={14} /></Link>
              <Link to="/how-it-works" className="inline-flex items-center gap-2 bg-white border border-black/10 px-6 py-3 min-h-11 rounded-full text-xs font-bold uppercase tracking-widest hover:border-[var(--color-t4c-yellow)] transition-colors">Discover the Model</Link>
            </div>
            <p className="mt-2 text-xs text-neutral-500">SACCAI-track · CAPS + international · Grade R-12 · 100% live</p>
          </div>
        </div>
      </section>
      {/* Black Friday Special Promo */}
      <section className="bg-[var(--color-t4c-black)] text-white border-y border-black/10 rounded-[24px] sm:rounded-[40px] overflow-hidden mt-6 sm:mt-10">
        <div className="relative px-6 py-8 sm:py-12 max-w-[640px] sm:max-w-[520px] mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-t4c-yellow)] flex items-center justify-center flex-shrink-0">
              <span className="text-[20px] font-bold">🏃</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-t4c-yellow)] mb-1">BLACK FRIDAY SPECIAL</p>
              <h2 className="text-2xl font-black tracking-tight">10% off all terms</h2>
              <p className="text-neutral-300 mt-2">Use code BLACKFRIEND10 at checkout. Limited to new registrations only. Offer ends midnight Sunday.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
            <Link to="/admissions#apply" className="flex-1 bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
              Claim My Discount
            </Link>
            <Link to="/fees" className="px-4 py-3 rounded-full text-sm text-neutral-300 hover:text-white transition-colors">View Fees</Link>
          </div>
        </div>
      </section>

      <PageShell>
        {/* Triple-Benefits Bento, PDF: FAQ Triple-Benefits */}
        <RevealStagger>
          <div className="text-center max-w-[70ch] mx-auto">
            <SectionHeading>The 4×4×16 advantage</SectionHeading>
            <Body className="mx-auto mt-2">One intentional structure, children, parents and teachers thrive together.</Body>
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: Users, title: 'For Children', bullets: ['Interactive classrooms, 16 peers, every voice heard', 'Live teacher every lesson, questions answered instantly', '4-day week, a full day for sport, arts, or rest'] },
              { icon: Heart, title: 'For Parents', bullets: ['Hands-off supervision, certified teachers lead every class', 'Close-knit community, 16 is safe, not overwhelming', 'Family time back, 4 hours protects evenings & weekends'] },
              { icon: GraduationCap, title: 'For Teachers', bullets: ['Focused cohort of 16, meaningful feedback', '4 live lessons/day, maximum energy every session', '5th day for prep & upskilling, sustainable careers'] },
            ].map(card => (
              <div key={card.title} className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-7">
                <div className="w-9 h-9 rounded-full bg-[var(--color-t4c-green)] text-white flex items-center justify-center"><card.icon size={16} /></div>
                <h3 className="mt-3 font-semibold text-[var(--color-t4c-black)]">{card.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">{card.bullets.map(b => <li key={b} className="flex gap-2"><span className="text-[var(--color-t4c-green)]">·</span>{b}</li>)}</ul>
              </div>
            ))}
          </div>
        </RevealStagger>

        {/* ABOUT teaser, staggered reveal */}
        <RevealStagger>
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <SectionHeading>Built on the 4-4-4 model</SectionHeading>
              <Body className="mt-3">By moving online and capping classes at 16, we eliminate dead time. Four hours are pure, high-impact live instruction, covering the full curriculum without draining your child's energy.</Body>
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { n: '4', l: 'Days / week', d: 'Mon-Thu live, Fri skills' },
                  { n: '4', l: 'Hours / day', d: 'Peak-focus window' },
                  { n: '4', l: 'Lessons / day', d: 'Protects attention span' },
                  { n: '16', l: 'Per class', d: 'Known by name' },
                ].map(s => (
                  <li key={s.l} className="bg-white border border-black/10 rounded-[14px] p-4">
                    <span className="font-display text-[28px] font-bold tracking-tight text-[var(--color-t4c-green)]">{s.n}</span>
                    <span className="ml-2 text-xs font-bold uppercase tracking-widest text-[var(--color-t4c-black)]">{s.l}</span>
                    <p className="text-xs text-neutral-600 mt-1">{s.d}</p>
                  </li>
                ))}
              </ul>
              <Link to="/how-it-works" className="inline-flex items-center min-h-11 mt-5 text-xs font-bold uppercase tracking-widest underline decoration-[var(--color-t4c-yellow)] decoration-2 underline-offset-4 hover:text-[var(--color-t4c-green)]">How the week works →</Link>
            </div>
            <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Why it works</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-neutral-700">
                <li className="flex gap-3"><Clock size={16} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />Cuts cognitive overload, young minds cannot focus 6-8 hours straight.</li>
                <li className="flex gap-3"><Video size={16} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />Eliminates busywork, targeted homework fulfils SACCAI benchmarks.</li>
                <li className="flex gap-3"><BookOpen size={16} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />Blended CAPS + international, local matric + global readiness.</li>
                <li className="flex gap-3"><Award size={16} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />FET Grades 10-12 leads to a valid NSC Matric certificate.</li>
              </ul>
            </div>
          </div>
        </RevealStagger>

        {/* Class environment full-width editorial */}
        <RevealStagger>
          <div className="rounded-[16px] overflow-hidden border border-black/10 bg-white grid lg:grid-cols-2">
            <div className="h-auto sm:h-[320px] bg-neutral-100 overflow-hidden">
              {/* Brand film replaces the collage: muted autoplay loop, Cloudinary-
                  optimised; mobile keeps natural height so nothing is cropped. */}
              <video
                src="https://res.cloudinary.com/dka0498ns/video/upload/q_auto,w_960/v1787426745/Triple_4_Curriculum_Gold_particles_forming_medallion_wgxtl4.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Triple 4 Curriculum brand film"
                className="w-full h-auto sm:h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <SectionHeading className="text-[22px] sm:text-[26px]">100% live. Capped at 16. Parent hands-off.</SectionHeading>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">Every lesson has a certified teacher on camera for its full duration, teaching, facilitating, answering, mentoring. With only 16 learners, no one hides behind mute. Foundation parents help with login; beyond that, teachers own the room.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-full bg-[var(--color-t4c-green)] text-white">16 cap</span>
                <span className="px-2.5 py-1 rounded-full border border-black/10">Daily synchronized</span>
                <span className="px-2.5 py-1 rounded-full border border-black/10">Recordings included</span>
              </div>
            </div>
          </div>
        </RevealStagger>

        {/* Pricing teaser, Price Cards */}
        <RevealStagger>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <SectionHeading>Fees that respect families</SectionHeading>
              <Body className="mt-2">Same 16-cap live classes across every phase, monthly or annual, in ZAR, USD or GBP.</Body>
            </div>
            <Link to="/admissions#fees" className="shrink-0 inline-flex items-center min-h-11 text-xs font-bold uppercase tracking-widest border border-black/10 rounded-full px-5 py-2.5 hover:border-[var(--color-t4c-yellow)] transition-colors">View full fees</Link>
          </div>
          <div className="mt-5"><PricingTable teaser /></div>
        </RevealStagger>

        {/* FAQ teaser, FAQ Accordion */}
        <RevealStagger>
          <SectionHeading>Straight answers</SectionHeading>
          <Body className="mt-2">Top questions from families, full answers live on the FAQ page.</Body>
          <div className="mt-5"><FaqTeaser /></div>
          <Link to="/faq" className="inline-flex items-center min-h-11 mt-4 text-xs font-bold uppercase tracking-widest underline decoration-[var(--color-t4c-yellow)] decoration-2 underline-offset-4">Browse all questions →</Link>
        </RevealStagger>

        {/* Final CTA banner */}
        <RevealStagger>
          <div className="rounded-[16px] bg-[var(--color-t4c-black)] text-white p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-[20px] sm:text-[24px] font-semibold tracking-tight">Keep childhood fresh. Keep learning elite.</h3>
              <p className="text-sm text-white/70 mt-1">Talk to a real teacher, SA or UK, within one school day.</p>
            </div>
            <Link to="/contact" className="shrink-0 bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] px-6 py-3 min-h-11 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">Book a discovery call</Link>
          </div>
        </RevealStagger>
      </PageShell>
    </div>
  );
}
