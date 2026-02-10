import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield } from 'lucide-react';

const KioskConsentPage = () => {
  const [agreed, setAgreed] = useState(false);
  const profile = useAppStore((s) => s.profile);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gov-header-gradient mb-3">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
            {profile.agencyName}
          </p>
          <h1 className="text-xl font-bold text-foreground mt-1">
            {profile.systemTitle}
          </h1>
        </div>

        <div className="bg-card rounded-xl p-8 kiosk-card-shadow border border-border">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Data Privacy Consent
          </h2>
          <p className="text-sm text-muted-foreground mb-2 font-medium">
            In compliance with Republic Act No. 10173 (Data Privacy Act of 2012)
          </p>

          <div className="bg-muted rounded-lg p-4 text-sm text-foreground space-y-3 max-h-64 overflow-y-auto mb-6">
            <p>
              By signing this logbook, I voluntarily provide my personal information to <strong>{profile.officeName}</strong> for the purpose of recording office visits and improving public service delivery.
            </p>
            <p><strong>Information Collected:</strong> Name, contact details, purpose of visit, service availed, and satisfaction feedback.</p>
            <p><strong>Purpose:</strong> The data will be used solely for visitor tracking, service performance evaluation, and compliance with Quality Management System (QMS) requirements.</p>
            <p><strong>Retention:</strong> Records will be retained in accordance with the office's records disposition schedule and applicable government regulations.</p>
            <p><strong>Rights:</strong> You have the right to access, correct, and request deletion of your personal data, subject to applicable laws. For concerns, contact our Data Protection Officer at {profile.email}.</p>
            <p><strong>Security:</strong> All data is protected with appropriate organizational, physical, and technical security measures.</p>
            <p>
              I understand and agree to the collection, processing, and storage of my personal information as described above.
            </p>
          </div>

          <div className="flex items-start space-x-3 mb-6">
            <Checkbox
              id="consent"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <label htmlFor="consent" className="text-sm cursor-pointer leading-relaxed">
              I have read, understood, and agree to the collection and processing of my personal data in accordance with RA 10173.
            </label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!agreed}
              onClick={() => navigate('/kiosk/register')}
            >
              Proceed
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          {profile.footerText}
        </p>
      </div>
    </div>
  );
};

export default KioskConsentPage;
