import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="w-full bg-[var(--color-t4c-green)] text-white border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/dka0498ns/image/upload/v1787254845/Triple_4_Curriculum_latest_logo_variant4_hjviza.png"
                alt="Triple 4C"
                className="w-9 h-9 rounded-full border border-[var(--color-t4c-yellow)] bg-white object-cover"
              />
              <span className="text-sm font-extrabold tracking-tight uppercase leading-none">Triple 4C Curriculum</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/80">4 days a week, 4 hours a day, 4 lessons a day, live teachers, 16 students per class.</p>
            <p className="mt-2 text-[11px] font-mono tracking-widest uppercase text-[var(--color-t4c-yellow)]">Preserving Fresh Minds Globally.</p>
          </div>

          <div>
            <p className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/60">Explore</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-[var(--color-t4c-yellow)] transition-colors">About</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[var(--color-t4c-yellow)] transition-colors">How it Works</Link></li>
              <li><Link to="/curriculum" className="hover:text-[var(--color-t4c-yellow)] transition-colors">Curriculum</Link></li>
              <li><Link to="/admissions" className="hover:text-[var(--color-t4c-yellow)] transition-colors">Admissions & Fees</Link></li>
              <li><Link to="/faq" className="hover:text-[var(--color-t4c-yellow)] transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-[var(--color-t4c-yellow)] transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-[var(--color-t4c-yellow)] transition-colors">Privacy</Link></li>
              <li><Link to="/onboarding" className="hover:text-[var(--color-t4c-yellow)] transition-colors">Sign in / Apply</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/60">Contact</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed">
              <li><a href="tel:+27689758960" className="hover:text-[var(--color-t4c-yellow)] transition-colors">SA: +27 689-758-960</a> <span className="text-white/50">/</span> <a href="tel:+27639642288" className="hover:text-[var(--color-t4c-yellow)] transition-colors">+27 639-642-288</a></li>
              <li><a href="https://wa.me/447577924174" target="_blank" rel="noreferrer" className="hover:text-[var(--color-t4c-yellow)] transition-colors">UK WhatsApp: +44 757-7924-174</a></li>
              <li><a href="mailto:info@t4c.com" className="hover:text-[var(--color-t4c-yellow)] transition-colors">info@t4c.com</a> <span className="text-white/50">·</span> <a href="mailto:admissions@t4c.com" className="hover:text-[var(--color-t4c-yellow)] transition-colors">admissions@t4c.com</a></li>
              <li><a href="mailto:support@triple4c.com" className="hover:text-[var(--color-t4c-yellow)] transition-colors">support@triple4c.com</a></li>
              <li><a href="https://www.triple4c.com" target="_blank" rel="noreferrer" className="hover:text-[var(--color-t4c-yellow)] transition-colors">www.triple4c.com</a></li>
              <li className="text-white/60 text-xs">Facebook · Instagram · TikTok</li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-mono tracking-[0.16em] uppercase text-white/60">Fees note</p>
            <p className="mt-3 text-xs leading-relaxed text-white/75">Fees exclusive of SACCAI Grade 12 final exam fees and yearly SACCAI registration (variable). Invoiced at the payment-date exchange rate. Annual registration & application fee applies.</p>
            <Link to="/admissions#fees" className="inline-flex mt-4 text-xs font-bold tracking-wide uppercase bg-[var(--color-t4c-yellow)] text-[var(--color-t4c-black)] px-3.5 py-2 rounded hover:bg-white transition-colors">View fee table</Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/60">
          <span>© {new Date().getFullYear()} Triple 4 Curriculum (T4C). All rights reserved.</span>
          <span>Built for Grade R-12 · SACCAI-track NSC</span>
        </div>
      </div>
    </footer>
  );
}
