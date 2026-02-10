import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const AgencySettingsPage = () => {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);

  const [form, setForm] = useState({ ...profile });

  const handleSave = () => {
    setProfile(form);
    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'Agency Profile Updated',
      details: 'Updated agency profile settings.',
    });
    toast.success('Agency profile updated successfully.');
  };

  const fields: { key: keyof typeof form; label: string; textarea?: boolean }[] = [
    { key: 'systemTitle', label: 'System Title' },
    { key: 'agencyName', label: 'Agency / LGU Name' },
    { key: 'officeName', label: 'Office / Department Name' },
    { key: 'address', label: 'Office Address' },
    { key: 'contactNumber', label: 'Contact Number' },
    { key: 'email', label: 'Email Address' },
    { key: 'headOfOffice', label: 'Head of Office / OIC' },
    { key: 'headPosition', label: 'Position Title' },
    { key: 'reportSignatory', label: 'Report Signatory Name' },
    { key: 'reportSignatoryPosition', label: 'Report Signatory Position' },
    { key: 'footerText', label: 'Footer Text / Slogan', textarea: true },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agency Profile Settings</h1>
        <p className="text-sm text-muted-foreground">Configure agency information used across reports and UI</p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={String(f.key)} className={`space-y-2 ${f.textarea ? 'md:col-span-2' : ''}`}>
              <Label>{f.label}</Label>
              {f.textarea ? (
                <Textarea
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : (
                <Input
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </Card>
    </div>
  );
};

export default AgencySettingsPage;
