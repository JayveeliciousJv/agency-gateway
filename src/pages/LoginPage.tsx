import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';
import defaultLogo from '@/assets/default-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAppStore((s) => s.login);
  const profile = useAppStore((s) => s.profile);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4"
        onClick={() => navigate('/')}
        aria-label="Back to home"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden">
            <img src={profile.logoPath || defaultLogo} alt="Agency Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide uppercase whitespace-nowrap">
            {profile.agencyName}
          </p>
          <h1 className="text-2xl font-bold mt-1 text-foreground">
            {profile.systemTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{profile.officeName}</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-xl p-8 kiosk-card-shadow border border-border">
          <h2 className="text-lg font-semibold text-card-foreground mb-6">
            Admin Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Demo: admin/admin123 or staff/staff123
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          {profile.footerText}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
