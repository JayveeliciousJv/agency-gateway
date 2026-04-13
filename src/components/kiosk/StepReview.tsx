import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import type { VisitorFormData } from './StepForm';

const renderPrivacyText = (text: string, replacements: Record<string, string>) => {
  let processed = text;
  Object.entries(replacements).forEach(([key, val]) => {
    processed = processed.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
  });
  const parts = processed.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
};

interface StepReviewProps {
  form: VisitorFormData;
  photo: string;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const StepReview = ({ form, photo, onSubmit, onBack, isSubmitting }: StepReviewProps) => {
  const profile = useAppStore((s) => s.profile);
  const [agreed, setAgreed] = useState(false);

  const paragraphs = profile.visitorPrivacyPrompt.split('\n\n').filter(Boolean);

  const summaryItems = [
    { label: 'Name', value: form.name },
    { label: 'Sex', value: form.sex },
    { label: 'Sector', value: form.sectorClassification === 'Others' ? `Others - ${form.sectorOtherSpecify}` : form.sectorClassification },
    { label: 'Contact', value: form.contactNumber || 'Not provided' },
    { label: 'Purpose', value: form.purpose },
    { label: 'Service', value: form.purpose === 'Incoming Letter' ? 'Incoming Letter' : form.service },
  ];

  return (
    <div className="animate-fade-in">
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">Review & Confirm</h2>
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 mb-4">
          <div className="flex gap-4">
            {photo && (
              <div className="w-20 h-24 rounded-lg overflow-hidden border border-border shrink-0">
                <img src={photo} alt="Your photo" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 space-y-1.5">
              {summaryItems.map(({ label, value }) => (
                <div key={label} className="flex text-sm">
                  <span className="text-muted-foreground w-20 shrink-0">{label}:</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Data Privacy Notice — RA 10173
          </p>
          <div className="bg-muted rounded-lg p-3 text-xs text-foreground space-y-2 max-h-40 overflow-y-auto">
            {paragraphs.map((p, i) => (
              <p key={i}>{renderPrivacyText(p, { officeName: profile.officeName, email: profile.email })}</p>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3 mb-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            📸 <strong>Photo Capture Notice:</strong> Your photo has been captured for logging and security purposes only.
          </p>
        </div>

        {/* Consent checkbox */}
        <div className="flex items-start space-x-3 mb-6">
          <Checkbox id="consent" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
          <label htmlFor="consent" className="text-sm cursor-pointer leading-relaxed">
            {profile.visitorConsentLabel}
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button type="button" className="flex-1" disabled={!agreed || isSubmitting} onClick={onSubmit}>
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Submitting...</>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepReview;
