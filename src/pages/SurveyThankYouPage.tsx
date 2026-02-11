import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

const SurveyThankYouPage = () => {
  const profile = useAppStore((s) => s.profile);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 10000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Thank You!</h1>
        <p className="text-muted-foreground mb-8">
          Your feedback has been recorded. Thank you for helping us improve our services.
        </p>

        <Button onClick={() => navigate('/')} size="lg" className="w-full">
          Back to Home
        </Button>

        <p className="text-xs text-muted-foreground mt-6">
          This page will automatically redirect in 10 seconds.
        </p>
        <p className="text-xs text-muted-foreground mt-2">{profile.footerText}</p>
      </div>
    </div>
  );
};

export default SurveyThankYouPage;
