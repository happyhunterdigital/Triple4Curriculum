import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Scale, Wrench, Crown, Heart, Lightbulb, Users, Sparkles } from 'lucide-react';
import { PageShell, SectionEyebrow, SectionHeading, Body, RevealStagger } from '../components/site/Section';

export function AboutPage() {
  useEffect(() => { document.title = 'About: Triple 4 Curriculum'; }, []);
  return (
    <div className="w-full bg-[var(--color-canvas-soft)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8 lg:p-10">
          <SectionEyebrow>About T4C</SectionEyebrow>
          <h1 className="mt-2 font-display text-[30px] sm:text-[42px] font-semibold tracking-tight leading-[0.95] text-[var(--color-t4c-black)]">Education that<br />preserves fresh minds.</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 max-w-[60ch]">A global micro-school built on balance, self-reliance and intimacy, welcoming learners from across Africa and the world.</p>
          <a href="#welcome" className="inline-flex mt-5 bg-[var(--color-t4c-black)] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">Read Zanola's Letter</a>
        </div>
      </div>

      <PageShell>
        {/* WELCOME letter verbatim */}
        <RevealStagger>
          <div id="welcome" className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8 lg:p-10">
            <SectionEyebrow>Welcome</SectionEyebrow>
            <SectionHeading className="mt-2 text-[22px] sm:text-[28px]">A letter from Zanola Amanzi &amp; the T4C Team</SectionHeading>
            <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-neutral-700 max-w-[75ch]">
              <p>We are absolutely thrilled to welcome you to our global learning family. Whether you are joining us from right here in Africa or from across the world, you are now part of an educational community that does things differently.</p>
              <p>At Triple 4 Curriculum (T4C), we believe that school should inspire children, not exhaust them. Education shouldn't mean intense academic pressures, excessive screen time, work overload, or burnouts, nor should it mean drowning in mountains of evening homework. That is why we created the <strong>4-4-4 model: 4 days a week, 4 hours a day, and 4 lessons a day</strong>, led entirely by live, passionate teachers in interactive classes strictly capped at <strong>16 students</strong>.</p>
              <p>By stripping away the traditional 40-hours industrial school week, we've unlocked a new way to blend high-impact, focused synchronised learning with self-directed study. This model grants children independent space and time to become sovereign thinkers, which is the ultimate gold of a strong educational system.</p>
              <p>Our model fully satisfies <strong>SACCAI</strong> standards with targeted weekly homework, ensuring your child stays completely on track for a valid National Senior Certificate (Matric) without the burnout.</p>
              <p>Best of all, we don't just teach for exams. Our dedicated Friday homework and apprenticeship projects grants your child the freedom to build real-world vocational skills, from coding and website design to content creation, sewing, project management, business studies and more.</p>
              <p>We are here to give your family time back, protect your peace, and equip your child with the practical capabilities to thrive in this competitive, forever-changing world.</p>
              <p>Get ready for a fresh start!</p>
              <p className="font-semibold">Warmest regards,<br />Zanola Amanzi &amp; the T4C Team</p>
              <p className="italic">Where we don't just prepare students for exams, we give them the time to build a life.</p>
            </div>
            <p className="mt-8 text-[11px] font-mono tracking-widest uppercase text-[var(--color-t4c-green)]">Preserving Fresh Minds Globally.</p>
          </div>
        </RevealStagger>

        {/* ABOUT US */}
        <RevealStagger>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <SectionHeading className="text-[22px]">About Us</SectionHeading>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">Welcome to Triple 4 Curriculum (T4C), an innovative online academy redefining modern education. Built on the 4-4-4 model, 4 days a week, 4 hours a day, 4 lessons a day, with fully certified teachers guiding every class of exactly 16 students, we combine small-group efficiency with digital flexibility.</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">We believe academic excellence should never cost health, happiness, or personal passion. Friday homework and skill blocks offer real-world apprenticeships, coding, web design, sewing, project management, business studies, and more.</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">We eliminate classroom inefficiencies to protect our community from screen fatigue and deliver a premium, high-impact experience.</p>
            </div>
            <div className="bg-[var(--color-t4c-green)] text-white rounded-[16px] p-6 sm:p-8">
              <SectionHeading className="text-[22px] !text-white">The 4-4-4 Model</SectionHeading>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[{n:'4',l:'Days'},{n:'4',l:'Hours'},{n:'4×16',l:'Lessons × Cap'}].map(x=>(
                  <div key={x.l} className="bg-white/10 rounded-[12px] p-4 text-center border border-white/10"><span className="font-display text-[28px] font-bold">{x.n}</span><span className="block text-xs uppercase tracking-widest text-white/70">{x.l}</span></div>
                ))}
              </div>
              <p className="mt-4 text-sm text-white/80">By moving online and capping at 16, four hours are pure live instruction, no crowd control, no dead time.</p>
            </div>
          </div>
        </RevealStagger>

        {/* Vision + Mission */}
        <RevealStagger>
          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-t4c-green)]">Vision Statement</span>
              <p className="mt-2 font-display text-[18px] leading-snug font-medium text-[var(--color-t4c-black)]">To pioneer the future of online education where academic excellence and personal wellbeing coexist, empowering balanced, real-world ready individuals.</p>
            </div>
            <div className="lg:col-span-3 bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-t4c-green)]">Mission Statement</span>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">To deliver a premium, stress-free, uncrowded online education packed with life skills for Grade R-12 across Africa and internationally. Through 4-4-4, we commit to:</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Target, t: 'Fostering Elite Engagement', d: 'Inspiring highest potential, cap of 16 per class.' },
                  { icon: Scale, t: 'Protecting Balance', d: 'Academic success coexists with wellbeing.' },
                  { icon: Wrench, t: 'Cultivating Capabilities', d: 'Practical, real-world skills for tomorrow.' },
                  { icon: Crown, t: 'Sustaining Excellence', d: 'Supporting and empowering highly-skilled educators.' },
                ].map(c=>(
                  <div key={c.t} className="border border-black/10 rounded-[12px] p-4 flex gap-3">
                    <c.icon size={16} className="shrink-0 text-[var(--color-t4c-green)] mt-0.5" />
                    <div><p className="text-xs font-bold uppercase tracking-widest">{c.t}</p><p className="text-xs text-neutral-600 mt-1">{c.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealStagger>

        {/* Aims and Goals, 5 */}
        <RevealStagger>
          <SectionHeading>Aims and Goals</SectionHeading>
          <Body className="mt-2">Replacing burnout with high-impact, balanced education, five primary objectives.</Body>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { n:'01', t:'Beat burnout', d:'Limit live learning to 4 focused hours, eliminate screen fatigue, protect cognitive health.' },
              { n:'02', t:'Guarantee Attention', d:'Every student receives personalised focus and support.' },
              { n:'03', t:'Secure Accreditation', d:'Maintain rigorous standards and recognised qualifications.' },
              { n:'04', t:'Build Real Skills', d:'Golden achievers, academic excellence + practical innovation.' },
              { n:'05', t:'Restore Family Harmony', d:'Reduce school-related stress to bring balance home.' },
            ].map(a=>(
              <div key={a.n} className="bg-white border border-black/10 rounded-[16px] p-5">
                <span className="font-mono text-xs text-[var(--color-t4c-green)] font-bold">{a.n}</span>
                <h3 className="mt-1 font-semibold text-sm">{a.t}</h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">{a.d}</p>
              </div>
            ))}
          </div>
        </RevealStagger>

        {/* Core Values, 4 */}
        <RevealStagger>
          <SectionHeading>Our Core Values</SectionHeading>
          <Body className="mt-2">Four pillars guiding how we teach, lead, and grow.</Body>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Heart, t:'Balance', s:'Holistic wellbeing', d:'Education should enrich lives not consume them, built on rest, family, growth.' },
              { icon: Lightbulb, t:'Innovation', s:'Future-focused learning', d:'Modern digital tools and flexible, blended curriculum for a changing world.' },
              { icon: Wrench, t:'Self-Reliance', s:'Practical capabilities', d:'Friday vocational modules, entrepreneurship, trade skills, problem solving.' },
              { icon: Users, t:'Intimacy', s:'Personal connection', d:'Deep relationships and real-time mentorship, every voice heard.' },
            ].map(v=>(
              <div key={v.t} className="bg-white border border-black/10 rounded-[16px] p-6">
                <div className="w-9 h-9 rounded-full bg-[var(--color-t4c-green)] text-white flex items-center justify-center"><v.icon size={16} /></div>
                <h3 className="mt-3 font-semibold text-sm">{v.t} <span className="font-normal text-neutral-500">, {v.s}</span></h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">{v.d}</p>
              </div>
            ))}
          </div>
        </RevealStagger>

        {/* Ethos, 7 */}
        <RevealStagger>
          <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
            <SectionHeading className="text-[22px]">Ethos</SectionHeading>
            <p className="mt-2 font-display text-[16px] leading-snug text-neutral-700">At T4C, our philosophy is simple: Education should enrich a child's life, not consume it.</p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-3">
              {[
                ['Wellbeing First','Protecting mental health, happiness, sleep to drive excellence.'],
                ['Respect','Valuing time, boundaries and others.'],
                ['Deep Connection','Building meaningful relationships.'],
                ['Practical Self-Reliance','Developing real-world independence.'],
                ['Sustainable Growth','Fostering long-term healthy progress.'],
                ['Active Engagement','Diving fully into learning and life.'],
                ['Cultural Values','Staying grounded in shared heritage and principles.'],
              ].map(([t,d])=>(
                <li key={t} className="flex gap-3 text-sm"><span className="text-[var(--color-t4c-green)] mt-1"><Sparkles size={14} /></span><span><strong>{t}:</strong> <span className="text-neutral-700">{d}</span></span></li>
              ))}
            </ul>
          </div>
        </RevealStagger>

        <div className="text-center"><Link to="/how-it-works" className="inline-flex bg-[var(--color-t4c-black)] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">How the 4-4-4 works →</Link></div>
      </PageShell>
    </div>
  );
}
