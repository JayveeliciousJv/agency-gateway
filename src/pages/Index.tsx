import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ClipboardList, UserCheck, Star } from 'lucide-react';
import defaultLogo from '@/assets/default-logo.png';

const Index = () => {
  const profile = useAppStore((s) => s.profile);
  const navigate = useNavigate();

  const logoSrc = profile.logoPath || defaultLogo;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6 overflow-hidden">
          <img src={logoSrc} alt="Agency Logo" className="w-full h-full object-contain" />
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide font-medium text-center break-words">
          {profile.agencyName}
        </p>
        <h1 className="text-2xl font-bold text-foreground mt-1 mb-1">
          {profile.systemTitle}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">{profile.officeName}</p>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => navigate('/kiosk')}
          >
            <ClipboardList className="w-5 h-5" />
            Visitor Logbook
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate('/survey')}
          >
            <Star className="w-5 h-5" />
            Satisfaction Survey
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate('/login')}
          >
            <UserCheck className="w-5 h-5" />
            Admin Login
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-8">
          {profile.footerText}
        </p>
      </div>
    </div>
  );
};

export default Index;
