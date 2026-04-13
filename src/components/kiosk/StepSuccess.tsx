import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';

interface StepSuccessProps {
  onDone: () => void;
}

const AUTO_RESET_SECONDS = 5;

const StepSuccess = ({ onDone }: StepSuccessProps) => {
  const profile = useAppStore((s) => s.profile);
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDone]);

  const now = new Date();
  const timestamp = now.toLocaleString('en-PH', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div className="text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        You are successfully logged!
      </h1>
      <p className="text-sm text-muted-foreground mb-1">
        Your visit has been recorded.
      </p>
      <p className="text-xs text-muted-foreground font-mono mb-4">
        {timestamp}
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        {profile.officeName} — {profile.footerText}
      </p>

      <Button onClick={onDone} size="lg" className="mb-3">
        Return to Home
      </Button>
      <p className="text-xs text-muted-foreground">
        Auto-redirect in {countdown}s
      </p>
    </div>
  );
};

export default StepSuccess;
