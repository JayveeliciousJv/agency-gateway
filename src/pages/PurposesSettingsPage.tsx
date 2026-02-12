import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const PurposesSettingsPage = () => {
  const purposes = useAppStore((s) => s.purposes);
  const addPurpose = useAppStore((s) => s.addPurpose);
  const updatePurpose = useAppStore((s) => s.updatePurpose);
  const deletePurpose = useAppStore((s) => s.deletePurpose);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);

  const [newPurpose, setNewPurpose] = useState('');
  const [editingPurpose, setEditingPurpose] = useState<{ old: string; val: string } | null>(null);

  const handleAdd = () => {
    const trimmed = newPurpose.trim();
    if (!trimmed) return;
    if (purposes.includes(trimmed)) { toast.error('Purpose already exists.'); return; }
    addPurpose(trimmed);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Purpose Added', details: `Added purpose: ${trimmed}` });
    setNewPurpose('');
    toast.success('Purpose added.');
  };

  const handleUpdate = () => {
    if (!editingPurpose) return;
    const trimmed = editingPurpose.val.trim();
    if (!trimmed || (trimmed !== editingPurpose.old && purposes.includes(trimmed))) { toast.error('Invalid or duplicate purpose.'); return; }
    updatePurpose(editingPurpose.old, trimmed);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Purpose Updated', details: `Renamed "${editingPurpose.old}" to "${trimmed}"` });
    setEditingPurpose(null);
    toast.success('Purpose updated.');
  };

  const handleDelete = (p: string) => {
    deletePurpose(p);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Purpose Deleted', details: `Deleted purpose: ${p}` });
    toast.success('Purpose deleted.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Predefined Purposes of Visit</h1>
        <p className="text-sm text-muted-foreground">Manage the purposes available in the visitor registration form</p>
      </div>

      <Card className="p-6">
        <div className="space-y-3">
          {purposes.map((p) => (
            <div key={p} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
              {editingPurpose?.old === p ? (
                <>
                  <Input value={editingPurpose.val} onChange={(e) => setEditingPurpose({ ...editingPurpose, val: e.target.value })} className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleUpdate()} />
                  <Button size="sm" onClick={handleUpdate}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingPurpose(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{p}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingPurpose({ old: p, val: p })}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(p)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input placeholder="New purpose..." value={newPurpose} onChange={(e) => setNewPurpose(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} className="flex-1" />
            <Button onClick={handleAdd} disabled={!newPurpose.trim()}><Plus className="w-4 h-4 mr-2" /> Add</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PurposesSettingsPage;
