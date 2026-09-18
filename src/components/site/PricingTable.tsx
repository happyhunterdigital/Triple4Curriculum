import { useState } from 'react';

type Currency = 'ZAR' | 'USD' | 'GBP';
type Tier = { key: string; label: string; grades: string; zar: number; usd: number; gbp: number; features: string[]; accent?: boolean };

const TIERS: Tier[] = [
  // PDF: Pricing table — exact amounts
  { key: 'foundation', label: 'Foundation Phase', grades: 'Grade R–3', zar: 1500, usd: 125, gbp: 100, features: ['Daily synchronized classes capped at 16', 'All required subjects', 'International curriculum', 'Live + recorded sessions', 'Assessments & progress reports', 'Homework · PE · Games · Extra activities'] },
  { key: 'intermediate', label: 'Intermediate Phase', grades: 'Grade 4–6', zar: 2500, usd: 155, gbp: 115, features: ['Daily synchronized classes capped at 16', 'All required subjects', 'International curriculum', 'Live + recorded sessions', 'Assessments & progress reports', 'Homework · PE · Games · Extra activities'] },
  { key: 'senior', label: 'Senior Phase', grades: 'Grade 7–9', zar: 3500, usd: 190, gbp: 145, features: ['Daily synchronized classes capped at 16', 'All required subjects', 'International curriculum', 'Live + recorded sessions', 'Assessments & progress reports', 'Homework · PE · Games · Extra activities'] },
  { key: 'fet', label: 'FET Phase', grades: 'Grade 10–12', zar: 4500, usd: 250, gbp: 190, features: ['Daily synchronized classes capped at 16', 'All required subjects · Exam preparation', 'International curriculum', 'Live + recorded sessions', 'Assessments & progress reports', 'Homework · PE · Games · Extra activities'], accent: true },
];

function format(t: Tier, c: Currency) {
  if (c === 'ZAR') return `R${t.zar.toLocaleString('en-ZA')}`;
  if (c === 'USD') return `$${t.usd}`;
  return `£${t.gbp}`;
}

export function PricingTable({ teaser = false }: { teaser?: boolean }) {
  const [cur, setCur] = useState<Currency>('ZAR');
  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">Monthly tuition · Pay in {cur === 'ZAR' ? 'Zar (R)' : cur === 'USD' ? 'USD ($)' : 'GBP (£)'}</p>
        <div className="inline-flex rounded-full border border-[var(--color-t4c-black)]/10 overflow-hidden bg-white">
          {(['ZAR','USD','GBP'] as Currency[]).map(k => (
            <button key={k} onClick={() => setCur(k)} className={`px-3.5 py-1.5 text-xs font-bold ${cur===k ? 'bg-[var(--color-t4c-black)] text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}>{k}</button>
          ))}
        </div>
      </div>

      <div className={`mt-4 grid gap-4 sm:gap-5 ${teaser ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {TIERS.map(t => (
          <div key={t.key} className={`rounded-[16px] border p-5 sm:p-6 flex flex-col ${t.accent ? 'bg-[var(--color-t4c-green)] text-white border-[var(--color-t4c-green)] shadow-lg' : 'bg-white border-[var(--color-t4c-black)]/10'}`}>
            <p className={`text-[11px] font-mono uppercase tracking-widest ${t.accent ? 'text-[var(--color-t4c-yellow)]' : 'text-[var(--color-t4c-green)]'}`}>{t.grades}</p>
            <h3 className="mt-1 font-display font-semibold leading-tight text-[18px]">{t.label}</h3>
            <p className={`mt-3 font-display font-bold tracking-tight text-[28px] ${t.accent ? 'text-white' : 'text-[var(--color-t4c-black)]'}`}>{format(t, cur)}<span className={`text-xs font-mono font-normal ml-1 ${t.accent ? 'text-white/70' : 'text-neutral-500'}`}>/ mo</span></p>
            <ul className="mt-4 space-y-1.5 text-xs leading-relaxed flex-1">
              {t.features.slice(0, teaser ? 3 : 10).map(f => (
                <li key={f} className={`flex gap-2 ${t.accent ? 'text-white/90' : 'text-neutral-700'}`}><span className={t.accent ? 'text-[var(--color-t4c-yellow)]' : 'text-[var(--color-t4c-green)]'}>·</span>{f}</li>
              ))}
            </ul>
            {!teaser && <p className={`mt-4 text-[11px] ${t.accent ? 'text-white/60' : 'text-neutral-500'}`}>FET aligns with SACCAI NSC requirements.</p>}
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-neutral-500 max-w-[80ch]">Annual registration &amp; application fee applies. Exclusive of all final exam fees including SACCAI Grade 12 and yearly SACCAI registration (variable). Invoiced at the payment-date exchange rate. Payments in Zar (R), USD ($) or GBP (£).</p>
    </div>
  );
}
