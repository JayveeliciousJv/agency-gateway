import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { ClipboardList, Camera, ShieldCheck, ArrowRight } from 'lucide-react';
import defaultLogo from '@/assets/default-logo.png';

interface StepWelcomeProps {
  onNext: () => void;
  onBack: () => void;
}

const StepWelcome = ({ onNext, onBack }: StepWelcomeProps) => {
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden">
        <img src={profile.logoPath || defaultLogo} alt="Agency Logo" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Welcome</h1>
      <p className="text-sm text-muted-foreground mb-1">{profile.systemTitle}</p>
      <p className="text-xs text-muted-foreground mb-6">{profile.officeName}</p>

      <div className="bg-card rounded-xl p-6 border border-border text-left space-y-4 mb-6">
        <h2 className="text-base font-semibold text-card-foreground text-center">How it works</h2>
        <div className="space-y-3">
          {[
            { icon: ClipboardList, title: 'Fill Out Your Details', desc: 'Provide your name and purpose of visit.' },
            { icon: Camera, title: 'Photo Capture', desc: 'A photo will be taken for security and logging purposes.' },
            { icon: ShieldCheck, title: 'Review & Confirm', desc: 'Review your information and provide consent before submitting.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onBack}>Back to Home</Button>
        <Button className="flex-1 gap-2" onClick={onNext}>
          Start <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepWelcome;
