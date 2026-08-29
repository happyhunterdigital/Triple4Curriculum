import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const DEPARTMENTS = ["Faculty of Applied Sciences", "Faculty of Commerce", "Faculty of Education", "Faculty of Engineering"];

const step1Schema = z.object({ role: z.enum(['learner', 'teacher']) });
const step2Schema = z.object({ department: z.string().min(1, "Select a department") });
const step3Schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});
const combinedSchema = step1Schema.merge(step2Schema).merge(step3Schema);
type FormValues = z.infer<typeof combinedSchema>;

export const OnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: { role: undefined, department: "", name: "", email: "", password: "" },
    mode: "onChange",
  });

  const next = async () => {
    let valid = false;
    if (step === 1) valid = await form.trigger("role");
    if (step === 2) valid = await form.trigger("department");
    if (step === 3) valid = await form.trigger(["name", "email", "password"]);
    if (valid) setStep(s => Math.min(4, s + 1));
  };
  const back = () => setStep(s => Math.max(1, s - 1));

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(cred.user, { displayName: data.name });
      const collectionName = data.role === 'teacher' ? 'teachers' : 'students';
      const payload: Record<string, unknown> = {
        uid: cred.user.uid,
        role: data.role,
        department: data.department,
        name: data.name,
        email: data.email,
        provider: 'email',
        createdAt: serverTimestamp(),
      };
      if (data.role === 'teacher') {
        const bioEl = document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="Distributed Systems"]');
        if (bioEl?.value) payload.bio = bioEl.value;
        payload.verificationStatus = 'pending';
      } else {
        payload.enrollmentStatus = 'active';
        payload.level = 'NQF-8';
      }
      await setDoc(doc(db, collectionName, cred.user.uid), payload);
      await setDoc(doc(db, 'users', cred.user.uid), { uid: cred.user.uid, role: data.role, email: data.email, provider: 'email', createdAt: serverTimestamp() }, { merge: true });
      setCompleted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    if (!form.getValues('role')) { form.setError('role', { message: 'Select a role first' }); return; }
    if (!form.getValues('department')) { setError('Select a department first (Step 2)'); setStep(2); return; }
    setError(null);
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const data = form.getValues();
      const collectionName = data.role === 'teacher' ? 'teachers' : 'students';
      const payload: Record<string, unknown> = {
        uid: cred.user.uid,
        role: data.role,
        department: data.department,
        name: cred.user.displayName || data.name || cred.user.email?.split('@')[0] || 'Google User',
        email: cred.user.email || data.email,
        photoURL: cred.user.photoURL || null,
        provider: 'google',
        createdAt: serverTimestamp(),
      };
      if (data.role === 'teacher') payload.verificationStatus = 'pending';
      else { payload.enrollmentStatus = 'active'; payload.level = 'NQF-8'; }
      await setDoc(doc(db, collectionName, cred.user.uid), payload, { merge: true });
      await setDoc(doc(db, 'users', cred.user.uid), { uid: cred.user.uid, role: data.role, email: cred.user.email, provider: 'google', createdAt: serverTimestamp() }, { merge: true });
      setCompleted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed';
      setError(msg.includes('popup') ? 'Popup blocked — allow popups for this site and retry' : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const role = form.watch("role");
  const dept = form.watch("department");

  return (
    <div className="w-full max-w-[640px] mx-auto px-3 xs:px-4 py-6 xs:py-8 sm:py-12">
      <div className="mb-6 xs:mb-8 space-y-3 xs:space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] xs:text-[11px] uppercase tracking-widest text-neutral-500">Step {completed ? 4 : step} of 4</p>
          <div className="flex gap-1 xs:gap-1.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1.5 w-6 xs:w-8 rounded-full transition-colors ${ (completed || step >= i) ? 'bg-[var(--color-t4c-green)]' : 'bg-[#E2E8F0]'}`} />
            ))}
          </div>
        </div>
        <div className="h-1 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--color-t4c-green)] transition-all duration-300" style={{ width: `${(completed ? 4 : step) / 4 * 100}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {completed ? (
          <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-[var(--color-t4c-green)]" />
            </div>
            <div>
              <h1 className="font-display text-[28px] font-medium tracking-tight text-[var(--color-t4c-black)]" style={{ fontFamily: 'Playfair Display, serif' }}>Welcome to Triple 4C</h1>
              <p className="font-sans text-sm text-neutral-600 mt-2 max-w-md mx-auto">Your academy profile is ready. You’ll be routed to your {role === 'teacher' ? 'teaching workspace' : 'learning dashboard'}.</p>
            </div>
            <Button onClick={() => { window.location.href = '/dashboard'; }}>Go to Dashboard <ArrowRight size={16} className="ml-2" /></Button>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            {step === 1 && (
              <div className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight text-[var(--color-t4c-black)] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>How are you joining the academy today?</h1>
                  <p className="font-sans text-xs xs:text-sm text-neutral-600 mt-2">One tap instantly advances — we’ll tailor the next steps.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                  {[
                    { id: 'learner', title: 'Learner', desc: 'Access lectures, assignments & progress', icon: <GraduationCap size={28} /> },
                    { id: 'teacher', title: 'Teacher', desc: 'Manage classes, grading & cohorts', icon: <Users size={28} /> },
                  ].map(card => (
                    <Card
                      key={card.id}
                      onClick={() => { form.setValue('role', card.id as any, { shouldValidate: true }); setTimeout(next, 180); }}
                      className={`cursor-pointer p-6 flex flex-col gap-4 hover:border-[var(--color-t4c-green)] transition-colors ${role === card.id ? 'border-[var(--color-t4c-green)] ring-1 ring-[var(--color-t4c-green)]' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-[6px] flex items-center justify-center border ${role === card.id ? 'bg-[var(--color-t4c-green)] text-white border-[var(--color-t4c-green)]' : 'bg-[var(--color-canvas-soft)] border-[#E2E8F0] text-[var(--color-t4c-black)]'}`}>
                        {card.icon}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>{card.title}</p>
                        <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{card.desc}</p>
                      </div>
                    </Card>
                  ))}
                </div>
                {form.formState.errors.role && <p className="text-xs text-rose-600">{form.formState.errors.role.message}</p>}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Which department are you interested in?</h1>
                  <p className="text-xs xs:text-sm text-neutral-600 mt-2">Select one — you can change later in settings.</p>
                </div>
                <div className="space-y-2">
                  {DEPARTMENTS.map(d => (
                    <button
                      key={d}
                      onClick={() => form.setValue('department', d, { shouldValidate: true })}
                      className={`w-full text-left px-4 py-4 rounded-[12px] border text-sm font-medium flex items-center justify-between ${dept === d ? 'bg-[var(--color-t4c-black)] text-white border-[var(--color-t4c-black)]' : 'bg-white border-[#E2E8F0] hover:border-[var(--color-t4c-green)]'}`}
                    >
                      <span>{d}</span>
                      {dept === d && <CheckCircle2 size={16} className="text-[var(--color-t4c-yellow)]" />}
                    </button>
                  ))}
                </div>
                {form.formState.errors.department && <p className="text-xs text-rose-600">{form.formState.errors.department.message as string}</p>}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={back} className="gap-2"><ArrowLeft size={16} /> Back</Button>
                  <Button onClick={next} className="ml-auto gap-2">Continue <ArrowRight size={16} /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Create your account</h1>
                  <p className="text-xs xs:text-sm text-neutral-600 mt-2">Use your institutional email — or continue with Google. <span className="font-mono text-[10px]">Public name will be <span className="font-bold">Triple4Curriculum</span></span></p>
                </div>
                <button type="button" onClick={handleGoogle} disabled={submitting} className="w-full flex items-center justify-center gap-2 h-10 rounded-[6px] border border-[#E2E8F0] bg-white hover:bg-neutral-50 text-sm font-medium transition-colors disabled:opacity-50">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-4 h-4" /> Continue with Google
                </button>
                <div className="flex items-center gap-3"><div className="h-px flex-1 bg-[#E2E8F0]" /><span className="text-[11px] text-neutral-400 uppercase tracking-widest">or</span><div className="h-px flex-1 bg-[#E2E8F0]" /></div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Full name</label>
                    <Input placeholder="Sarah Student" {...form.register("name")} />
                    {form.formState.errors.name && <p className="text-xs text-rose-600">{form.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Email</label>
                    <Input placeholder="sarah@university.ac.za" {...form.register("email")} />
                    {form.formState.errors.email && <p className="text-xs text-rose-600">{form.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Password</label>
                    <Input type="password" placeholder="••••••••" {...form.register("password")} />
                    {form.formState.errors.password && <p className="text-xs text-rose-600">{form.formState.errors.password.message}</p>}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={back} className="gap-2"><ArrowLeft size={16} /> Back</Button>
                  <Button type="button" onClick={next} className="ml-auto gap-2">Continue <ArrowRight size={16} /></Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {role === 'learner' ? 'Secure your enrolment' : 'Set up your teaching profile'}
                  </h1>
                  <p className="text-xs xs:text-sm text-neutral-600 mt-2">
                    {role === 'learner' ? 'Payment is handled by Stripe and synced to Firestore — test mode for now.' : 'Tell learners what you teach — you can invite a class right after.'}
                  </p>
                </div>
                {role === 'learner' ? (
                  <Card className="bg-[var(--color-canvas-soft)] border-dashed">
                    <p className="text-sm font-medium">Stripe Payment Gateway</p>
                    <p className="text-xs text-neutral-600 mt-1">Run Payments with Stripe extension will sync subscription status to `customers/{'{uid}'}/subscriptions`. Click Complete to simulate success.</p>
                    <div className="mt-4 h-10 rounded-[6px] border bg-white flex items-center px-3 text-xs text-neutral-400">Card number • MM/YY • CVC (Stripe Elements placeholder)</div>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Teaching bio (optional)</label>
                    <textarea className="w-full min-h-[96px] rounded-[6px] border border-[#E2E8F0] bg-white p-3 text-sm focus:outline-none focus:border-[var(--color-t4c-green)]" placeholder="I teach Distributed Systems at..." />
                  </div>
                )}
                {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={back} className="gap-2" disabled={submitting}><ArrowLeft size={16} /> Back</Button>
                  <Button onClick={form.handleSubmit(onSubmit)} className="ml-auto gap-2" disabled={submitting}>{submitting ? 'Creating...' : 'Complete'} <CheckCircle2 size={16} /></Button>
                </div>
                <p className="text-[11px] text-neutral-500 text-center">By completing you agree to POPIA data processing and role-based access via Custom Claims. Data is stored separately in <span className="font-mono font-bold">{role === 'teacher' ? 'teachers' : 'students'}</span> collection.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
