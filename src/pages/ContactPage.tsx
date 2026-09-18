import { useEffect, useState } from 'react';
import { Phone, MessageCircle, Mail, Share2 } from 'lucide-react';
import { PageShell, SectionEyebrow, SectionHeading, Body, RevealStagger } from '../components/site/Section';

export function ContactPage() {
  useEffect(() => { document.title = 'Contact — Triple 4 Curriculum'; }, []);
  const [sent, setSent] = useState(false);
  return (
    <div className="w-full bg-[var(--color-canvas-soft)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-[16px] bg-white border border-black/10 p-6 sm:p-8 lg:p-10">
          <SectionEyebrow>Contact</SectionEyebrow>
          <h1 className="mt-2 font-display text-[30px] sm:text-[42px] font-semibold tracking-tight leading-[0.95]">Talk to a real teacher.</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 max-w-[60ch]">South Africa or UK — we reply within one school day. Mon–Thu live teaching, Fri admin &amp; support.</p>
          <a href="https://wa.me/447577924174" target="_blank" rel="noreferrer" className="inline-flex mt-5 bg-[var(--color-t4c-black)] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest">Send WhatsApp → +44 757-7924-174</a>
        </div>
      </div>

      <PageShell>
        <RevealStagger>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="tel:+27689758960" className="bg-white border border-black/10 rounded-[16px] p-6 hover:border-[var(--color-t4c-yellow)] transition-colors">
              <Phone size={18} className="text-[var(--color-t4c-green)]" />
              <h3 className="mt-2 font-semibold text-sm">SA Call</h3>
              <p className="text-sm text-neutral-700 mt-1">+27 689-758-960</p>
              <p className="text-sm text-neutral-700">+27 639-642-288</p>
              <p className="text-xs text-neutral-500 mt-1">Admissions &amp; enquiries</p>
            </a>
            <a href="https://wa.me/447577924174" target="_blank" rel="noreferrer" className="bg-white border border-black/10 rounded-[16px] p-6 hover:border-[var(--color-t4c-yellow)] transition-colors">
              <MessageCircle size={18} className="text-[var(--color-t4c-green)]" />
              <h3 className="mt-2 font-semibold text-sm">UK WhatsApp</h3>
              <p className="text-sm text-neutral-700 mt-1">+44 757-7924-174</p>
              <p className="text-xs text-neutral-500 mt-1">Tap to open WhatsApp</p>
            </a>
            <div className="bg-white border border-black/10 rounded-[16px] p-6">
              <Mail size={18} className="text-[var(--color-t4c-green)]" />
              <h3 className="mt-2 font-semibold text-sm">Email</h3>
              <p className="text-xs mt-1"><a href="mailto:info@t4c.com" className="underline">info@t4c.com</a> <span className="text-neutral-400">·</span> General</p>
              <p className="text-xs"><a href="mailto:admissions@t4c.com" className="underline">admissions@t4c.com</a> <span className="text-neutral-400">·</span> Admissions</p>
              <p className="text-xs"><a href="mailto:support@triple4c.com" className="underline">support@triple4c.com</a> <span className="text-neutral-400">·</span> Help</p>
            </div>
            <div className="bg-white border border-black/10 rounded-[16px] p-6">
              <Share2 size={18} className="text-[var(--color-t4c-green)]" />
              <h3 className="mt-2 font-semibold text-sm">Follow</h3>
              <p className="text-sm text-neutral-700 mt-1">Facebook · Instagram · TikTok</p>
              <p className="text-xs mt-1"><a href="https://www.triple4c.com" target="_blank" rel="noreferrer" className="underline">www.triple4c.com</a></p>
            </div>
          </div>
        </RevealStagger>

        <RevealStagger>
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <h3 className="font-semibold">Send a message</h3>
              <p className="text-xs text-neutral-500 mt-1">We use your message only to reply — see Privacy.</p>
              {sent ? (
                <div className="mt-6 rounded-[12px] bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">Thanks — your message is queued. We'll reply within one school day.</div>
              ) : (
                <form onSubmit={e=>{e.preventDefault(); setSent(true);}} className="mt-5 grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5 text-xs font-semibold">Name<input required name="name" placeholder="Your name" className="border border-black/15 rounded-[10px] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-t4c-green)]" /></label>
                    <label className="flex flex-col gap-1.5 text-xs font-semibold">Email<input required type="email" name="email" placeholder="you@example.com" className="border border-black/15 rounded-[10px] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-t4c-green)]" /></label>
                  </div>
                  <label className="flex flex-col gap-1.5 text-xs font-semibold">Phone<input name="phone" placeholder="+27 ..." className="border border-black/15 rounded-[10px] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-t4c-green)]" /></label>
                  <label className="flex flex-col gap-1.5 text-xs font-semibold">Message<textarea required name="message" rows={4} placeholder="How can we help?" className="border border-black/15 rounded-[10px] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-t4c-green)] resize-none" /></label>
                  <button type="submit" className="justify-self-start bg-[var(--color-t4c-black)] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-t4c-green)] transition-colors">Send Message</button>
                </form>
              )}
            </div>
            <div className="lg:col-span-2 bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
              <h3 className="font-semibold">Hours &amp; response</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-700">
                <li>• Mon–Thu: live teaching — replies may be after lessons</li>
                <li>• Friday: admin &amp; support — full response day</li>
                <li>• Best time to call SA: 09:00–16:00 SAST</li>
                <li>• WhatsApp UK monitored daily</li>
              </ul>
              <div className="mt-6 rounded-[12px] bg-[var(--color-canvas-soft)] border border-black/10 p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Admissions team</p>
                <p className="text-sm mt-1"><a href="mailto:admissions@t4c.com" className="underline">admissions@t4c.com</a> — document checks, placement</p>
              </div>
            </div>
          </div>
        </RevealStagger>

        <RevealStagger>
          <div className="bg-white border border-black/10 rounded-[16px] p-6 sm:p-8">
            <h3 className="font-semibold">Contact FAQs</h3>
            <div className="mt-3 divide-y divide-black/10 text-sm">
              <details className="py-3"><summary className="list-none cursor-pointer font-medium">Which number should I call? — South Africa or UK?</summary><p className="mt-1 text-neutral-600">ZA families call +27 numbers; international / UK families use WhatsApp +44 757-7924-174. All emails reach the same admissions team.</p></details>
              <details className="py-3"><summary className="list-none cursor-pointer font-medium">Do you reply on weekends?</summary><p className="mt-1 text-neutral-600">Replies target one school day — weekend messages are answered Monday.</p></details>
            </div>
          </div>
        </RevealStagger>
      </PageShell>
    </div>
  );
}
