import { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, X, Plus, Pencil, Trash2, Image } from 'lucide-react';

const AgencySettingsPage = () => {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);
  const purposes = useAppStore((s) => s.purposes);
  const addPurpose = useAppStore((s) => s.addPurpose);
  const updatePurpose = useAppStore((s) => s.updatePurpose);
  const deletePurpose = useAppStore((s) => s.deletePurpose);

  const [form, setForm] = useState({ ...profile });
  const [newPurpose, setNewPurpose] = useState('');
  const [editingPurpose, setEditingPurpose] = useState<{ old: string; val: string } | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const secondaryLogoRef = useRef<HTMLInputElement>(null);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'logoPath' | 'secondaryLogoPath') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, [key]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAddPurpose = () => {
    const trimmed = newPurpose.trim();
    if (!trimmed) return;
    if (purposes.includes(trimmed)) {
      toast.error('Purpose already exists.');
      return;
    }
    addPurpose(trimmed);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Purpose Added', details: `Added purpose: ${trimmed}` });
    setNewPurpose('');
    toast.success('Purpose added.');
  };

  const handleUpdatePurpose = () => {
    if (!editingPurpose) return;
    const trimmed = editingPurpose.val.trim();
    if (!trimmed || (trimmed !== editingPurpose.old && purposes.includes(trimmed))) {
      toast.error('Invalid or duplicate purpose.');
      return;
    }
    updatePurpose(editingPurpose.old, trimmed);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Purpose Updated', details: `Renamed "${editingPurpose.old}" to "${trimmed}"` });
    setEditingPurpose(null);
    toast.success('Purpose updated.');
  };

  const handleDeletePurpose = (p: string) => {
    deletePurpose(p);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Purpose Deleted', details: `Deleted purpose: ${p}` });
    toast.success('Purpose deleted.');
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

      {/* Logo Upload Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Agency Logos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Logo */}
          <div className="space-y-3">
            <Label>Official Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                {form.logoPath ? (
                  <img src={form.logoPath} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Image className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'logoPath')} />
                <Button type="button" variant="outline" size="sm" onClick={() => logoRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
                {form.logoPath && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, logoPath: '' })}>
                    <X className="w-4 h-4 mr-2" /> Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">Max 2MB. PNG or JPG.</p>
              </div>
            </div>
          </div>

          {/* Secondary Logo */}
          <div className="space-y-3">
            <Label>Secondary Logo (Optional)</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                {form.secondaryLogoPath ? (
                  <img src={form.secondaryLogoPath} alt="Secondary Logo" className="w-full h-full object-contain" />
                ) : (
                  <Image className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <input ref={secondaryLogoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, 'secondaryLogoPath')} />
                <Button type="button" variant="outline" size="sm" onClick={() => secondaryLogoRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
                {form.secondaryLogoPath && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, secondaryLogoPath: '' })}>
                    <X className="w-4 h-4 mr-2" /> Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">Max 2MB. PNG or JPG.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Fields */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Agency Information</h2>
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

      {/* Purposes Management */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Predefined Purposes of Visit</h2>
        <div className="space-y-3">
          {purposes.map((p) => (
            <div key={p} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
              {editingPurpose?.old === p ? (
                <>
                  <Input
                    value={editingPurpose.val}
                    onChange={(e) => setEditingPurpose({ ...editingPurpose, val: e.target.value })}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdatePurpose()}
                  />
                  <Button size="sm" onClick={handleUpdatePurpose}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingPurpose(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{p}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingPurpose({ old: p, val: p })}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeletePurpose(p)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Input
              placeholder="New purpose..."
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPurpose()}
              className="flex-1"
            />
            <Button onClick={handleAddPurpose} disabled={!newPurpose.trim()}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AgencySettingsPage;
