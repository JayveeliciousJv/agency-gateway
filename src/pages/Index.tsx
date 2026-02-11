import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Shield, ClipboardList, UserCheck, Star } from 'lucide-react';

const Index = () => {
  const profile = useAppStore((s) => s.profile);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gov-header-gradient mb-6">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>

        <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
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
