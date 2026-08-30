import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Users, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck,
  FileText, CreditCard, Award, Briefcase, Landmark, Upload, User
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { FileUpload, type UploadedFileMeta } from '../ui/FileUpload';
import { auth, db, storage } from '../../lib/firebase';
import {
  createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, type User as FbUser
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DEPARTMENTS = ["Faculty of Applied Sciences", "Faculty of Commerce", "Faculty of Education", "Faculty of Engineering"];
const TOTAL_STEPS = 6;

const registrationSchema = z.object({
  role: z.enum(['learner', 'teacher']).optional(),
  department: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  // Learner — Personal
  dob: z.string().optional(),
  homeAddress: z.string().optional(),
  isMinor: z.boolean().optional(),
  guardianName: z.string().optional(),
  guardianContact: z.string().optional(),
  // Learner — Academic + Legal
  previousSchool: z.string().optional(),
  lastGrade: z.string().optional(),
  agreeConduct: z.boolean().optional(),
  agreePrivacy: z.boolean().optional(),
  // Learner — Payment
  paymentMethod: z.string().optional(),
  payerName: z.string().optional(),
  // Teacher — Identity
  idType: z.string().optional(),
  idNumber: z.string().optional(),
  addressVerified: z.boolean().optional(),
  // Teacher — Qualifications + Background
  highestDegree: z.string().optional(),
  degreeField: z.string().optional(),
  teachingCertificate: z.string().optional(),
  backgroundCheckConsent: z.boolean().optional(),
  // Teacher — Professional + Financial
  yearsExperience: z.string().optional(),
  referenceContact: z.string().optional(),
  taxId: z.string().optional(),
  bankDetails: z.string().optional(),
});

type FormValues = z.infer<typeof registrationSchema>;

const mask = (v?: string, keep = 3) => (v && v.length > keep ? '****' + v.slice(-keep) : v || '');

export const OnboardingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<FbUser | null>(null);

  // ── Real file upload state (Firebase Storage) ──
  const [uploads, setUploads] = useState<Record<string, UploadedFileMeta[]>>({
    teacherIdDoc: [], addressDoc: [], teacherDegreeDocs: [],
    learnerTranscripts: [], scholarshipDoc: [], teacherResume: [],
  });
  const [uploadErrors, setUploadErrors] = useState<Record<string, string | undefined>>({});

  const uploadToStorage = async (file: File): Promise<UploadedFileMeta> => {
    const uid = googleUser?.uid || auth.currentUser?.uid;
    if (!uid) throw new Error('Sign in (Step 3) before uploading documents.');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `registrations/${uid}/${Date.now()}_${safeName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    const url = await getDownloadURL(storageRef);
    return { path, name: file.name, size: file.size, type: file.type, downloadURL: url } as UploadedFileMeta;
  };

  const makeUploadHandler = (key: string, required = false) => ({
    onUploaded: (files: UploadedFileMeta[]) => {
      setUploads(prev => ({ ...prev, [key]: files }));
      setUploadErrors(prev => ({ ...prev, [key]: undefined }));
      if (required && files.length === 0) {
        setUploadErrors(prev => ({ ...prev, [key]: 'At least one document is required.' }));
      }
    },
    uploaded: uploads[key] || [],
    uploadFile: uploadToStorage,
    error: uploadErrors[key],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      role: undefined, department: '', name: '', email: '', password: '',
      dob: '', homeAddress: '', isMinor: false, guardianName: '', guardianContact: '',
      previousSchool: '', lastGrade: '', agreeConduct: false, agreePrivacy: false,
      paymentMethod: 'tuition', payerName: '',
      idType: 'national_id', idNumber: '', addressVerified: false,
      highestDegree: '', degreeField: '', teachingCertificate: '', backgroundCheckConsent: false,
      yearsExperience: '', referenceContact: '', taxId: '', bankDetails: '',
    },
    mode: 'onChange',
  });

  const role = form.watch('role');
  const dept = form.watch('department');
  const isMinor = form.watch('isMinor');

  const setErr = (field: keyof FormValues, msg: string) => form.setError(field, { message: msg } as never);

  const next = async () => {
    setError(null);
    const v = form.getValues();
    let valid = true;

    if (step === 1 && !v.role) valid = false;
    if (step === 2 && !v.department) valid = false;
    if (step === 3 && !googleUser) {
      if (!v.name || v.name.length < 2) { setErr('name', 'Name is required'); valid = false; }
      if (!v.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) { setErr('email', 'Invalid email'); valid = false; }
      if (!v.password || v.password.length < 6) { setErr('password', 'Min 6 characters'); valid = false; }
    }

    if (step === 4 && role === 'learner') {
      if (!v.dob) { setErr('dob', 'Date of birth required'); valid = false; }
      if (!v.homeAddress || v.homeAddress.length < 5) { setErr('homeAddress', 'Home address required'); valid = false; }
      if (v.isMinor) {
        if (!v.guardianName || v.guardianName.length < 2) { setErr('guardianName', 'Guardian name required for minors'); valid = false; }
        if (!v.guardianContact || v.guardianContact.length < 5) { setErr('guardianContact', 'Guardian contact required'); valid = false; }
      }
    }
    if (step === 4 && role === 'teacher') {
      if (!v.idNumber || v.idNumber.length < 4) { setErr('idNumber', 'Government ID number required'); valid = false; }
      if (!v.addressVerified) { setErr('addressVerified', 'Proof of address must be confirmed'); valid = false; }
      if (uploads.teacherIdDoc.length === 0) { setUploadErrors(p => ({ ...p, teacherIdDoc: 'Government photo ID upload is required.' })); valid = false; }
    }

    if (step === 5 && role === 'learner') {
      if (!v.previousSchool || v.previousSchool.length < 2) { setErr('previousSchool', 'Previous school required'); valid = false; }
      if (!v.lastGrade) { setErr('lastGrade', 'Last grade completed required'); valid = false; }
      if (uploads.learnerTranscripts.length === 0) { setUploadErrors(p => ({ ...p, learnerTranscripts: 'At least one report card / transcript / placement result is required.' })); valid = false; }
      if (!v.agreeConduct) { setErr('agreeConduct', 'Code of conduct must be accepted'); valid = false; }
      if (!v.agreePrivacy) { setErr('agreePrivacy', 'Privacy policy must be accepted'); valid = false; }
    }
    if (step === 5 && role === 'teacher') {
      if (!v.highestDegree || v.highestDegree.length < 2) { setErr('highestDegree', 'Highest degree required'); valid = false; }
      if (!v.degreeField || v.degreeField.length < 2) { setErr('degreeField', 'Field of study required'); valid = false; }
      if (!v.teachingCertificate || v.teachingCertificate.length < 2) { setErr('teachingCertificate', 'Teaching certificate required'); valid = false; }
      if (uploads.teacherDegreeDocs.length === 0) { setUploadErrors(p => ({ ...p, teacherDegreeDocs: 'Degree / certificate scans are required.' })); valid = false; }
      if (!v.backgroundCheckConsent) { setErr('backgroundCheckConsent', 'Criminal record clearance consent required'); valid = false; }
    }

    if (step === 6 && role === 'learner') {
      if (!v.payerName || v.payerName.length < 2) { setErr('payerName', 'Payer name required'); valid = false; }
      if (v.paymentMethod === 'scholarship' && uploads.scholarshipDoc.length === 0) {
        setUploadErrors(p => ({ ...p, scholarshipDoc: 'Scholarship documentation is required for scholarship applications.' }));
        valid = false;
      }
    }
    if (step === 6 && role === 'teacher') {
      if (!v.yearsExperience) { setErr('yearsExperience', 'Years of experience required'); valid = false; }
      if (!v.referenceContact || v.referenceContact.length < 5) { setErr('referenceContact', 'Verified reference contact required'); valid = false; }
      if (uploads.teacherResume.length === 0) { setUploadErrors(p => ({ ...p, teacherResume: 'Resume upload is required.' })); valid = false; }
      if (!v.taxId || v.taxId.length < 4) { setErr('taxId', 'Tax identification number required'); valid = false; }
      if (!v.bankDetails || v.bankDetails.length < 4) { setErr('bankDetails', 'Banking details required for payroll'); valid = false; }
    }

    if (valid) setStep(s => Math.min(TOTAL_STEPS, s + 1));
  };
  const back = () => setStep(s => Math.max(1, s - 1));

  const handleGoogle = async () => {
    if (!form.getValues('role')) { setErr('role', 'Select a role first'); return; }
    if (!form.getValues('department')) { setError('Select a department first (Step 2)'); setStep(2); return; }
    setError(null);
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      setGoogleUser(cred.user);
      if (!form.getValues('name')) form.setValue('name', cred.user.displayName || cred.user.email?.split('@')[0] || '');
      if (!form.getValues('email')) form.setValue('email', cred.user.email || '');
      setStep(4);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed';
      setError(msg.includes('popup') ? 'Popup blocked — allow popups and retry' : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.role || !data.department) return;
    setError(null);
    setSubmitting(true);
    try {
      let fbUser = googleUser;
      if (!fbUser) {
        const cred = await createUserWithEmailAndPassword(auth, data.email!, data.password!);
        await updateProfile(cred.user, { displayName: data.name });
        fbUser = cred.user;
      }

      const provider = googleUser ? 'google' : 'email';
      const base = {
        uid: fbUser.uid, role: data.role, department: data.department,
        name: data.name || fbUser.displayName || fbUser.email, email: data.email || fbUser.email,
        provider, createdAt: serverTimestamp(),
      };

      const fileMetas = (key: string) => (uploads[key] || []).map(f => ({ path: f.path, name: f.name, size: f.size, type: f.type, downloadURL: (f as any).downloadURL || '' }));

      if (data.role === 'learner') {
        await setDoc(doc(db, 'students', fbUser.uid), {
          ...base,
          personal: {
            dob: data.dob || '', homeAddress: data.homeAddress || '',
            isMinor: !!data.isMinor,
            guardian: data.isMinor ? { name: data.guardianName || '', contact: data.guardianContact || '', consentGiven: true } : null,
          },
          academic: {
            previousSchool: data.previousSchool || '', lastGrade: data.lastGrade || '',
            transcriptsProvided: uploads.learnerTranscripts.length > 0,
            documents: fileMetas('learnerTranscripts'),
          },
          legal: {
            codeOfConductAccepted: !!data.agreeConduct,
            privacyPolicyAccepted: !!data.agreePrivacy,
            popiaCompliant: true,
          },
          payment: {
            method: data.paymentMethod || 'tuition',
            payerName: data.payerName || '',
            status: data.paymentMethod === 'scholarship' ? 'scholarship_pending_verification' : 'invoice_pending',
            documents: fileMetas('scholarshipDoc'),
          },
          enrollmentStatus: 'active', level: 'NQF-8',
        });
      } else {
        await setDoc(doc(db, 'teachers', fbUser.uid), {
          ...base,
          identity: {
            idType: data.idType || 'national_id',
            idNumberMasked: mask(data.idNumber),
            addressProofVerified: !!data.addressVerified,
            idDocuments: fileMetas('teacherIdDoc'),
            addressDocuments: fileMetas('addressDoc'),
          },
          qualifications: {
            highestDegree: data.highestDegree || '', degreeField: data.degreeField || '',
            teachingCertificate: data.teachingCertificate || '',
            documents: fileMetas('teacherDegreeDocs'),
          },
          backgroundCheck: { consented: !!data.backgroundCheckConsent, status: 'clearance_pending' },
          professional: {
            yearsExperience: data.yearsExperience || '',
            referenceContact: data.referenceContact || '',
            resumeProvided: uploads.teacherResume.length > 0,
            documents: fileMetas('teacherResume'),
          },
          payroll: {
            taxIdMasked: mask(data.taxId),
            bankProvided: !!data.bankDetails,
          },
          verificationStatus: 'pending',
        });
      }

      await setDoc(doc(db, 'users', fbUser.uid), {
        uid: fbUser.uid, role: data.role, email: base.email, provider, createdAt: serverTimestamp(),
      }, { merge: true });

      setCompleted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Registration failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const label = 'text-xs font-medium';
  const errText = 'text-xs text-rose-600';

  return (
    <div className="w-full max-w-[680px] mx-auto px-3 xs:px-4 py-6 xs:py-8 sm:py-12">
      {/* Progress: Step X of 6 + dots + bar */}
      <div className="mb-6 xs:mb-8 space-y-3 xs:space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] xs:text-[11px] uppercase tracking-widest text-neutral-500">
            Step {completed ? TOTAL_STEPS : step} of {TOTAL_STEPS} — {role === 'teacher' ? 'Educator' : role === 'learner' ? 'Learner' : 'Academy'} Registration
          </p>
          <div className="flex gap-1 xs:gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
              <div key={i} className={`h-1.5 w-4 xs:w-6 sm:w-8 rounded-full transition-colors ${(completed || step >= i) ? 'bg-[var(--color-t4c-green)]' : 'bg-[#E2E8F0]'}`} />
            ))}
          </div>
        </div>
        <div className="h-1 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--color-t4c-green)] transition-all duration-300" style={{ width: `${(completed ? TOTAL_STEPS : step) / TOTAL_STEPS * 100}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {completed ? (
          <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-[var(--color-t4c-green)]" />
            </div>
            <div>
              <h1 className="text-[26px] sm:text-[28px] font-medium tracking-tight text-[var(--color-t4c-black)]" style={{ fontFamily: 'Playfair Display, serif' }}>Registration Received</h1>
              <p className="font-sans text-sm text-neutral-600 mt-2 max-w-md mx-auto">
                {role === 'teacher'
                  ? 'Your credentials, qualifications and background consent are logged. Verification status: pending clearance. You will be routed to your teaching workspace.'
                  : 'Your personal details, academic records, agreements and payment setup are logged. You will be routed to your learning dashboard.'}
              </p>
            </div>
            <Button onClick={() => { window.location.href = '/dashboard'; }}>Go to {role === 'teacher' ? 'Workspace' : 'Dashboard'} <ArrowRight size={16} className="ml-2" /></Button>
          </motion.div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
            {/* STEP 1 — Role */}
            {step === 1 && (
              <div className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight text-[var(--color-t4c-black)] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>How are you joining the academy today?</h1>
                  <p className="font-sans text-xs xs:text-sm text-neutral-600 mt-2">One tap instantly advances — full registration differs by role.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                  {[
                    { id: 'learner', title: 'Learner', desc: 'Personal details • Guardian consent • Academic records • Agreements • Payment', icon: <GraduationCap size={28} /> },
                    { id: 'teacher', title: 'Teacher', desc: 'Identity verification • Qualifications • Background checks • History • Payroll', icon: <Users size={28} /> },
                  ].map(card => (
                    <Card key={card.id} onClick={() => { form.setValue('role', card.id as never, { shouldValidate: true }); setTimeout(next, 180); }}
                      className={`cursor-pointer p-5 sm:p-6 flex flex-col gap-4 hover:border-[var(--color-t4c-green)] transition-colors ${role === card.id ? 'border-[var(--color-t4c-green)] ring-1 ring-[var(--color-t4c-green)]' : ''}`}>
                      <div className={`w-10 h-10 rounded-[6px] flex items-center justify-center border ${role === card.id ? 'bg-[var(--color-t4c-green)] text-white border-[var(--color-t4c-green)]' : 'bg-[var(--color-canvas-soft)] border-[#E2E8F0] text-[var(--color-t4c-black)]'}`}>{card.icon}</div>
                      <div>
                        <p className="font-semibold text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>{card.title}</p>
                        <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">{card.desc}</p>
                      </div>
                    </Card>
                  ))}
                </div>
                {form.formState.errors.role && <p className={errText}>{form.formState.errors.role.message as string}</p>}
              </div>
            )}

            {/* STEP 2 — Department */}
            {step === 2 && (
              <div className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Which department are you interested in?</h1>
                  <p className="text-xs xs:text-sm text-neutral-600 mt-2">Select one — you can change later in settings.</p>
                </div>
                <div className="space-y-2">
                  {DEPARTMENTS.map(d => (
                    <button key={d} onClick={() => form.setValue('department', d, { shouldValidate: true })}
                      className={`w-full text-left px-4 py-4 rounded-[12px] border text-sm font-medium flex items-center justify-between ${dept === d ? 'bg-[var(--color-t4c-black)] text-white border-[var(--color-t4c-black)]' : 'bg-white border-[#E2E8F0] hover:border-[var(--color-t4c-green)]'}`}>
                      <span>{d}</span>
                      {dept === d && <CheckCircle2 size={16} className="text-[var(--color-t4c-yellow)]" />}
                    </button>
                  ))}
                </div>
                {form.formState.errors.department && <p className={errText}>{form.formState.errors.department.message as string}</p>}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={back} className="gap-2"><ArrowLeft size={16} /> Back</Button>
                  <Button onClick={next} className="ml-auto gap-2">Continue <ArrowRight size={16} /></Button>
                </div>
              </div>
            )}

            {/* STEP 3 — Account */}
            {step === 3 && (
              <div className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Create your account</h1>
                  <p className="text-xs xs:text-sm text-neutral-600 mt-2">Use your institutional email — or continue with Google.</p>
                </div>
                <button type="button" onClick={handleGoogle} disabled={submitting} className="w-full flex items-center justify-center gap-2 h-10 rounded-[6px] border border-[#E2E8F0] bg-white hover:bg-neutral-50 text-sm font-medium transition-colors disabled:opacity-50">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-4 h-4" /> Continue with Google
                </button>
                <div className="flex items-center gap-3"><div className="h-px flex-1 bg-[#E2E8F0]" /><span className="text-[11px] text-neutral-400 uppercase tracking-widest">or</span><div className="h-px flex-1 bg-[#E2E8F0]" /></div>
                {googleUser && (
                  <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 rounded-[6px] px-3 py-2">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Signed in as {googleUser.email} — continue below.
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={label}>Full name</label>
                    <Input disabled={!!googleUser} placeholder="Sarah Student" {...form.register('name')} />
                    {form.formState.errors.name && <p className={errText}>{form.formState.errors.name.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className={label}>Email</label>
                    <Input disabled={!!googleUser} placeholder="sarah@university.ac.za" {...form.register('email')} />
                    {form.formState.errors.email && <p className={errText}>{form.formState.errors.email.message as string}</p>}
                  </div>
                  {!googleUser && (
                    <div className="space-y-2">
                      <label className={label}>Password</label>
                      <Input type="password" placeholder="••••••••" {...form.register('password')} />
                      {form.formState.errors.password && <p className={errText}>{form.formState.errors.password.message as string}</p>}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={back} className="gap-2"><ArrowLeft size={16} /> Back</Button>
                  <Button onClick={next} className="ml-auto gap-2">Continue <ArrowRight size={16} /></Button>
                </div>
              </div>
            )}

            {/* STEP 4 — Learner: Personal Details / Teacher: Identity Verification */}
            {step === 4 && (
              <div className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {role === 'teacher' ? 'Identity verification' : 'Personal details'}
                  </h1>
                  <p className="text-xs xs:text-sm text-neutral-600 mt-2">
                    {role === 'teacher' ? 'Government-issued photo ID and proof of address — POPIA protected.' : 'Date of birth, home address and guardian consent for minors.'}
                  </p>
                </div>

                {role === 'learner' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={label}>Full name</label>
                        <Input placeholder="Sarah Student" {...form.register('name')} />
                      </div>
                      <div className="space-y-2">
                        <label className={label}>Date of birth</label>
                        <Input type="date" {...form.register('dob')} />
                        {form.formState.errors.dob && <p className={errText}>{form.formState.errors.dob.message as string}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={label}>Home address</label>
                      <Input placeholder="12 Main Road, Cape Town, 8001" {...form.register('homeAddress')} />
                      {form.formState.errors.homeAddress && <p className={errText}>{form.formState.errors.homeAddress.message as string}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className={label}>Contact email</label>
                      <Input placeholder="sarah@university.ac.za" {...form.register('email')} />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input type="checkbox" {...form.register('isMinor')} className="w-4 h-4 accent-[var(--color-t4c-green)]" /> I am under 18 — guardian consent required
                    </label>
                    {isMinor && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[var(--color-canvas-soft)] border border-[#E2E8F0] rounded-[12px]">
                        <div className="space-y-2">
                          <label className={label}>Parent / legal guardian name</label>
                          <Input placeholder="Mrs. N. Khumalo" {...form.register('guardianName')} />
                          {form.formState.errors.guardianName && <p className={errText}>{form.formState.errors.guardianName.message as string}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className={label}>Guardian contact</label>
                          <Input placeholder="+27 82 000 0000" {...form.register('guardianContact')} />
                          {form.formState.errors.guardianContact && <p className={errText}>{form.formState.errors.guardianContact.message as string}</p>}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2 sm:col-span-1">
                        <label className={label}>ID type</label>
                        <select {...form.register('idType')} className="w-full h-10 rounded-[6px] border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[var(--color-t4c-green)] focus:outline-none">
                          <option value="national_id">National ID</option>
                          <option value="passport">Passport</option>
                          <option value="drivers_license">Driver's License</option>
                        </select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className={label}>ID number</label>
                        <Input placeholder="8801235111088" {...form.register('idNumber')} />
                        {form.formState.errors.idNumber && <p className={errText}>{form.formState.errors.idNumber.message as string}</p>}
                        <p className="text-[11px] text-neutral-400 flex items-center gap-1"><ShieldCheck size={12} /> Stored masked (****+last 3) under POPIA</p>
                      </div>
                    </div>
                    <FileUpload
                      label="Government-issued photo ID"
                      required
                      hint="Passport / national ID / driver's license photo page. Encrypted at rest, POPIA protected."
                      {...makeUploadHandler('teacherIdDoc', true)}
                    />
                    <div className="p-3 bg-[var(--color-canvas-soft)] border border-[#E2E8F0] rounded-[12px]">
                      <FileUpload
                        label="Proof of address (utility bill / lease, ≤ 3 months)"
                        hint="Optional but speeds up verification."
                        {...makeUploadHandler('addressDoc')}
                      />
                    </div>
                    <label className="flex items-start gap-2 text-xs font-medium cursor-pointer">
                      <input type="checkbox" {...form.register('addressVerified')} className="w-4 h-4 mt-0.5 accent-[var(--color-t4c-green)]" />
                      <span>I confirm proof of address (utility bill / lease, ≤ 3 months old) is provided</span>
                    </label>
                    {form.formState.errors.addressVerified && <p className={errText}>{form.formState.errors.addressVerified.message as string}</p>}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={back} className="gap-2"><ArrowLeft size={16} /> Back</Button>
                  <Button onClick={next} className="ml-auto gap-2">Continue <ArrowRight size={16} /></Button>
                </div>
              </div>
            )}

            {/* STEP 5 — Learner: Academic + Legal / Teacher: Qualifications + Background */}
            {step === 5 && (
              <div className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {role === 'teacher' ? 'Qualifications & background checks' : 'Academic records & legal agreements'}
                  </h1>
                  <p className="text-xs xs:text-sm text-neutral-600 mt-2">
                    {role === 'teacher' ? 'Degrees, teaching certificates and child-safety clearance.' : 'Past report cards, transcripts or placement results — then sign the agreements.'}
                  </p>
                </div>

                {role === 'learner' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={label}>Previous school</label>
                        <Input placeholder="Western Cape High" {...form.register('previousSchool')} />
                        {form.formState.errors.previousSchool && <p className={errText}>{form.formState.errors.previousSchool.message as string}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className={label}>Last grade completed</label>
                        <select {...form.register('lastGrade')} className="w-full h-10 rounded-[6px] border border-[#E2E8F0] bg-white px-3 text-sm focus:border-[var(--color-t4c-green)] focus:outline-none">
                          <option value="">Select grade…</option>
                          {['Grade 10', 'Grade 11', 'Grade 12 / Matric', 'Post-matric'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        {form.formState.errors.lastGrade && <p className={errText}>{form.formState.errors.lastGrade.message as string}</p>}
                      </div>
                    </div>
                    <FileUpload
                      label="Report cards / transcripts / placement results"
                      required
                      multiple
                      hint="PDF or photo scans. Admin reviews these before final placement."
                      {...makeUploadHandler('learnerTranscripts', true)}
                    />
                    <div className="space-y-3">
                      <label className="flex items-start gap-2 text-xs font-medium cursor-pointer">
                        <input type="checkbox" {...form.register('agreeConduct')} className="w-4 h-4 mt-0.5 accent-[var(--color-t4c-green)]" />
                        <span>I accept the <span className="font-bold text-[var(--color-t4c-green)]">Code of Conduct</span></span>
                      </label>
                      {form.formState.errors.agreeConduct && <p className={errText}>{form.formState.errors.agreeConduct.message as string}</p>}
                      <label className="flex items-start gap-2 text-xs font-medium cursor-pointer">
                        <input type="checkbox" {...form.register('agreePrivacy')} className="w-4 h-4 mt-0.5 accent-[var(--color-t4c-green)]" />
                        <span>I accept the <span className="font-bold text-[var(--color-t4c-green)]">Privacy Policy</span> (POPIA Act 4 of 2013)</span>
                      </label>
                      {form.formState.errors.agreePrivacy && <p className={errText}>{form.formState.errors.agreePrivacy.message as string}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={label}>Highest university degree</label>
                        <Input placeholder="MSc Computer Science" {...form.register('highestDegree')} />
                        {form.formState.errors.highestDegree && <p className={errText}>{form.formState.errors.highestDegree.message as string}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className={label}>Field of study</label>
                        <Input placeholder="Distributed Systems" {...form.register('degreeField')} />
                        {form.formState.errors.degreeField && <p className={errText}>{form.formState.errors.degreeField.message as string}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={label}>Teaching certificate / professional license</label>
                      <Input placeholder="SACE Registration No. / PGCE" {...form.register('teachingCertificate')} />
                      {form.formState.errors.teachingCertificate && <p className={errText}>{form.formState.errors.teachingCertificate.message as string}</p>}
                    </div>
                    <FileUpload
                      label="Degree / certificate scans"
                      required
                      multiple
                      hint="University degrees, teaching certificates, professional licenses."
                      {...makeUploadHandler('teacherDegreeDocs', true)}
                    />
                    <label className="flex items-start gap-2 text-xs font-medium cursor-pointer">
                      <input type="checkbox" {...form.register('backgroundCheckConsent')} className="w-4 h-4 mt-0.5 accent-[var(--color-t4c-green)]" />
                      <span>I consent to a <span className="font-bold text-[var(--color-t4c-green)]">criminal record / police check</span> for child safety clearance</span>
                    </label>
                    {form.formState.errors.backgroundCheckConsent && <p className={errText}>{form.formState.errors.backgroundCheckConsent.message as string}</p>}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={back} className="gap-2"><ArrowLeft size={16} /> Back</Button>
                  <Button onClick={next} className="ml-auto gap-2">Continue <ArrowRight size={16} /></Button>
                </div>
              </div>
            )}

            {/* STEP 6 — Learner: Payment / Teacher: Professional + Payroll */}
            {step === 6 && (
              <div className="space-y-4 xs:space-y-6">
                <div>
                  <h1 className="text-[22px] xs:text-[26px] sm:text-[32px] font-medium tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {role === 'teacher' ? 'Professional history & financial setup' : 'Payment details'}
                  </h1>
                  <p className="text-xs xs:text-sm text-neutral-600 mt-2">
                    {role === 'teacher' ? 'Resume, verified references, tax number and banking for payroll.' : 'Tuition records or scholarship documentation — handled by Stripe.'}
                  </p>
                </div>

                {role === 'learner' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'tuition', title: 'Tuition', desc: 'Pay fees', icon: <CreditCard size={18} /> },
                        { id: 'scholarship', title: 'Scholarship', desc: 'Apply / document', icon: <Award size={18} /> },
                      ].map(pm => (
                        <button key={pm.id} type="button" onClick={() => form.setValue('paymentMethod', pm.id)}
                          className={`p-4 rounded-[12px] border text-left flex flex-col gap-2 transition-colors ${form.watch('paymentMethod') === pm.id ? 'border-[var(--color-t4c-green)] ring-1 ring-[var(--color-t4c-green)] bg-white' : 'border-[#E2E8F0] bg-white hover:border-neutral-300'}`}>
                          <span className="text-[var(--color-t4c-green)]">{pm.icon}</span>
                          <span className="text-sm font-semibold">{pm.title}</span>
                          <span className="text-xs text-neutral-500">{pm.desc}</span>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className={label}>Payer name (parent / guardian / sponsor / self)</label>
                      <Input placeholder="Mrs. N. Khumalo" {...form.register('payerName')} />
                      {form.formState.errors.payerName && <p className={errText}>{form.formState.errors.payerName.message as string}</p>}
                    </div>
                    {form.watch('paymentMethod') === 'tuition' ? (
                      <Card className="bg-[var(--color-canvas-soft)] border-dashed">
                        <p className="text-sm font-medium">Stripe Payment Gateway</p>
                        <p className="text-xs text-neutral-600 mt-1">Run Payments with Stripe extension syncs to customers/{'{uid}'}/subscriptions.</p>
                        <div className="mt-3 h-10 rounded-[6px] border bg-white flex items-center px-3 text-xs text-neutral-400">Card number • MM/YY • CVC (Stripe Elements placeholder)</div>
                      </Card>
                    ) : (
                      <FileUpload
                        label="Scholarship documentation"
                        required
                        multiple
                        hint="Bursary letters, award letters or sponsorship proof."
                        {...makeUploadHandler('scholarshipDoc', true)}
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={label}>Years of experience</label>
                        <Input type="number" min="0" placeholder="8" {...form.register('yearsExperience')} />
                        {form.formState.errors.yearsExperience && <p className={errText}>{form.formState.errors.yearsExperience.message as string}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className={label}>Verified reference contact</label>
                        <Input placeholder="Prof. Dean — dean@university.ac.za" {...form.register('referenceContact')} />
                        {form.formState.errors.referenceContact && <p className={errText}>{form.formState.errors.referenceContact.message as string}</p>}
                      </div>
                    </div>
                    <FileUpload
                      label="Detailed resume"
                      required
                      hint="CV / resume including verified employment history."
                      {...makeUploadHandler('teacherResume', true)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={`${label} flex items-center gap-1.5`}><Landmark size={13} /> Tax identification number</label>
                        <Input placeholder="1234567890" {...form.register('taxId')} />
                        {form.formState.errors.taxId && <p className={errText}>{form.formState.errors.taxId.message as string}</p>}
                        <p className="text-[11px] text-neutral-400">Stored masked (****+last 3)</p>
                      </div>
                      <div className="space-y-2">
                        <label className={`${label} flex items-center gap-1.5`}><CreditCard size={13} /> Banking details (payroll)</label>
                        <Input placeholder="Bank • Account • Branch code" {...form.register('bankDetails')} />
                        {form.formState.errors.bankDetails && <p className={errText}>{form.formState.errors.bankDetails.message as string}</p>}
                        <p className="text-[11px] text-neutral-400">Flag stored only — raw details go to encrypted payroll, not Firestore</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded px-3 py-2">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={back} className="gap-2" disabled={submitting}><ArrowLeft size={16} /> Back</Button>
                  <Button onClick={form.handleSubmit(onSubmit)} className="ml-auto gap-2" disabled={submitting}>{submitting ? 'Submitting…' : 'Complete registration'} <CheckCircle2 size={16} /></Button>
                </div>
                <p className="text-[11px] text-neutral-500 text-center">POPIA Act 4 of 2013 compliant. Sensitive fields are masked; documents upload to private Firebase Storage. Data lands in the <span className="font-mono font-bold">{role === 'teacher' ? 'teachers' : 'students'}</span> ledger.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
