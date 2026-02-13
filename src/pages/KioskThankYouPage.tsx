import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const KioskThankYouPage = () => {
  const profile = useAppStore((s) => s.profile);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Thank You!
        </h1>
        <p className="text-muted-foreground mb-2">
          Your visit has been logged and your feedback has been recorded.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          {profile.officeName} — {profile.footerText}
        </p>
        <Button onClick={() => navigate('/')} size="lg">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default KioskThankYouPage;
