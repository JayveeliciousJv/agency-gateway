import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield } from 'lucide-react';

const SECTOR_OPTIONS = [
  'Student',
  'Employed/Working',
  'Women',
  'Person with Disability (PWD)',
  'Senior Citizen',
  'Youth',
  'Government Employee',
  'Private Sector',
  'Indigenous Peoples (IP)',
  'Solo Parent',
  'Others',
];

const KioskRegisterPage = () => {
  const profile = useAppStore((s) => s.profile);
  const services = useAppStore((s) => s.services);
  const purposes = useAppStore((s) => s.purposes);
  const addVisitor = useAppStore((s) => s.addVisitor);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    email: '',
    sex: '' as 'Male' | 'Female' | 'Prefer not to say' | '',
    sectorClassification: '',
    sectorOtherSpecify: '',
    purpose: 'Transaction',
    service: '',
  });

  const isValid = form.name && form.sex && form.sectorClassification && form.service &&
    (form.sectorClassification !== 'Others' || form.sectorOtherSpecify.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const now = new Date();
    const visitor = {
      id: `v${Date.now()}`,
      name: form.name,
      sex: form.sex as 'Male' | 'Female' | 'Prefer not to say',
      sectorClassification: form.sectorClassification === 'Others'
        ? `Others - ${form.sectorOtherSpecify.trim()}`
        : form.sectorClassification,
      purpose: form.purpose,
      service: form.service,
      contactNumber: form.contactNumber,
      email: form.email,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    };
    addVisitor(visitor);
    navigate('/kiosk/thankyou');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gov-header-gradient mb-3">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{profile.systemTitle}</h1>
          <p className="text-sm text-muted-foreground">{profile.officeName}</p>
        </div>

        <div className="bg-card rounded-xl p-8 kiosk-card-shadow border border-border">
          <h2 className="text-lg font-semibold text-card-foreground mb-6">Visitor Registration</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Sex *</Label>
              <RadioGroup
                value={form.sex}
                onValueChange={(v) => setForm({ ...form, sex: v as typeof form.sex })}
                className="flex gap-4"
              >
                {(['Male', 'Female', 'Prefer not to say'] as const).map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`sex-${opt}`} />
                    <Label htmlFor={`sex-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Sector Classification *</Label>
              <Select value={form.sectorClassification} onValueChange={(v) => setForm({ ...form, sectorClassification: v, sectorOtherSpecify: v !== 'Others' ? '' : form.sectorOtherSpecify })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTOR_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.sectorClassification === 'Others' && (
                <Input
                  placeholder="Please specify..."
                  value={form.sectorOtherSpecify}
                  onChange={(e) => setForm({ ...form, sectorOtherSpecify: e.target.value })}
                  className="mt-2"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  placeholder="09XX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Visit</Label>
              <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service Availed *</Label>
              <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/kiosk')}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={!isValid}>
                Submit & Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KioskRegisterPage;
