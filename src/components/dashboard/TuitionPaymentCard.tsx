import React, { useEffect, useState } from 'react';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { BentoCard } from '../ui/Bento';
import { useAuth } from '../../lib/authContext';
import { getDb } from '../../lib/firebase';
import { createPayfastCheckout, payfastErrorMessage, submitPayfastCheckout } from '../../lib/payfast';

type PayStatus = 'loading' | 'pending' | 'paid' | 'scholarship' | 'none';

/**
 * Pay-later entry point for learners who registered but have not paid tuition
 * yet (the onboarding hand-off can be skipped when PayFast is unreachable, and
 * returning applicants never see the onboarding payment step again).
 */
export const TuitionPaymentCard: React.FC = () => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<PayStatus>('loading');
  const [phase, setPhase] = useState('');
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const uid = currentUser?.id;
    if (!uid) return;
    (async () => {
      try {
        const db = await getDb();
        const snap = await getDoc(doc(db, 'students', uid));
        if (cancelled) return;
        if (!snap.exists()) {
          setStatus('none');
          return;
        }
        const data = snap.data() as {
          department?: string;
          payment?: { status?: string; method?: string };
        };
        const paymentStatus = data.payment?.status || '';
        setPhase(String(data.department || currentUser?.departmentId || ''));
        if (paymentStatus === 'paid') setStatus('paid');
        else if (paymentStatus.startsWith('scholarship')) setStatus('scholarship');
        else setStatus('pending');
      } catch {
        if (!cancelled) setStatus('none');
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser?.id, currentUser?.departmentId]);

  const pay = async () => {
    setError(null);
    setBusy(true);
    try {
      const checkout = await createPayfastCheckout({ plan, phase: phase || undefined });
      submitPayfastCheckout(checkout);
    } catch (e) {
      setError(payfastErrorMessage(e));
      setBusy(false);
    }
  };

  if (status === 'loading' || status === 'none') return null;

  if (status === 'paid' || status === 'scholarship') {
    return (
      <BentoCard eyebrow="Tuition" title="Payment status" icon={<ShieldCheck size={16} className="text-[#15803D]" />} className="lg:col-span-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-3">
          <ShieldCheck size={16} className="shrink-0 text-[#15803D]" />
          <p className="text-xs text-[#166534]">
            {status === 'paid'
              ? 'Tuition received - your place is secured. Thank you.'
              : 'Scholarship application is being reviewed. No payment is due while it is assessed.'}
          </p>
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard
      accent="yellow"
      eyebrow="Action needed"
      title="Pay tuition"
      icon={<CreditCard size={16} className="text-[#92400E]" />}
      className="lg:col-span-4"
    >
      <p className="text-xs leading-relaxed text-[#92400E]">
        Your registration is saved, but tuition for your phase has not been paid yet. Pay securely by
        card, Instant EFT, SnapScan or Mobicred - you are redirected to PayFast and T4C never sees your
        card details.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(['monthly', 'annual'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlan(p)}
            aria-pressed={plan === p}
            className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${
              plan === p
                ? 'border-[var(--color-t4c-black)] bg-[var(--color-t4c-black)] text-white'
                : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[var(--color-t4c-green)]'
            }`}
          >
            {p === 'monthly' ? 'Monthly tuition' : 'Annual (12 months)'}
          </button>
        ))}
        <button
          type="button"
          onClick={pay}
          disabled={busy}
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-t4c-green)] px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
          {busy ? 'Opening PayFast' : 'Pay with PayFast'}
        </button>
      </div>
      {error && (
        <p className="mt-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-xs leading-relaxed text-[#991B1B]">
          {error}
        </p>
      )}
    </BentoCard>
  );
};
