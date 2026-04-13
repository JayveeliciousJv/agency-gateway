import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import KioskProgress from '@/components/kiosk/KioskProgress';
import StepWelcome from '@/components/kiosk/StepWelcome';
import StepForm, { type VisitorFormData } from '@/components/kiosk/StepForm';
import StepCamera from '@/components/kiosk/StepCamera';
import StepReview from '@/components/kiosk/StepReview';
import StepSuccess from '@/components/kiosk/StepSuccess';

const STEPS = ['Welcome', 'Details', 'Photo', 'Confirm', 'Done'];

const KioskRegisterPage = () => {
  const addVisitor = useAppStore((s) => s.addVisitor);
  const currentUser = useAppStore((s) => s.currentUser);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<VisitorFormData>({
    name: '',
    contactNumber: '',
    email: '',
    sex: '',
    sectorClassification: '',
    sectorOtherSpecify: '',
    purpose: 'Transaction',
    service: '',
    letterSubject: '',
    letterFrom: '',
    letterProject: '',
    letterProjectOther: '',
  });

  const [photo, setPhoto] = useState('');

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
    // Simulate brief loading
    setTimeout(() => {
      const now = new Date();
      const isIncomingLetter = form.purpose === 'Incoming Letter';
      const visitor = {
        id: `v${Date.now()}`,
        name: form.name,
        sex: form.sex as 'Male' | 'Female' | 'Prefer not to say',
        sectorClassification: form.sectorClassification === 'Others'
          ? `Others - ${form.sectorOtherSpecify.trim()}`
          : form.sectorClassification,
        purpose: form.purpose,
        service: isIncomingLetter ? 'Incoming Letter' : form.service,
        ...(isIncomingLetter && {
          letterSubject: form.letterSubject.trim(),
          letterFrom: form.letterFrom.trim(),
          letterProject: form.letterProject === 'Other'
            ? `Other - ${form.letterProjectOther.trim()}`
            : form.letterProject,
          letterStatus: 'Received' as const,
          letterReceivedBy: currentUser?.fullName || '',
        }),
        contactNumber: form.contactNumber,
        email: form.email,
        photo: photo || undefined,
        consentTimestamp: now.toISOString(),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
      };
      addVisitor(visitor);
      setIsSubmitting(false);
      setStep(5);
    }, 1200);
  }, [form, photo, currentUser, addVisitor]);

  const goHome = useCallback(() => navigate('/'), [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {step < 5 && (
          <KioskProgress currentStep={step} totalSteps={4} labels={STEPS.slice(0, 4)} />
        )}

        {step === 1 && <StepWelcome onNext={() => setStep(2)} onBack={goHome} />}
        {step === 2 && <StepForm form={form} setForm={setForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <StepCamera photo={photo} onCapture={setPhoto} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <StepReview form={form} photo={photo} onSubmit={handleSubmit} onBack={() => setStep(3)} isSubmitting={isSubmitting} />}
        {step === 5 && <StepSuccess onDone={goHome} />}

        {step < 5 && (
          <p className="text-[10px] text-muted-foreground text-center mt-4">
            This system complies with the Data Privacy Act of 2012 (RA 10173).
          </p>
        )}
      </div>
    </div>
  );
};

export default KioskRegisterPage;
