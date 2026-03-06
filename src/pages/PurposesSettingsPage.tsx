import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PurposesSettingsPage = () => {
  const purposes = useAppStore((s) => s.purposes);
  const addPurpose = useAppStore((s) => s.addPurpose);
  const updatePurpose = useAppStore((s) => s.updatePurpose);
  const deletePurpose = useAppStore((s) => s.deletePurpose);

  const services = useAppStore((s) => s.services);
  const addService = useAppStore((s) => s.addService);
  const updateService = useAppStore((s) => s.updateService);
  const deleteService = useAppStore((s) => s.deleteService);

  const surveyParameters = useAppStore((s) => s.surveyParameters);
  const addSurveyParameter = useAppStore((s) => s.addSurveyParameter);
  const updateSurveyParameter = useAppStore((s) => s.updateSurveyParameter);
  const deleteSurveyParameter = useAppStore((s) => s.deleteSurveyParameter);

  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);

  const [newPurpose, setNewPurpose] = useState('');
  const [editingPurpose, setEditingPurpose] = useState<{ old: string; val: string } | null>(null);
  const [newService, setNewService] = useState('');
  const [editingService, setEditingService] = useState<{ old: string; val: string } | null>(null);
  const [newParam, setNewParam] = useState('');
  const [editingParam, setEditingParam] = useState<{ old: string; val: string } | null>(null);

  const handleAddPurpose = () => {
    const trimmed = newPurpose.trim();
    if (!trimmed) return;
    if (purposes.includes(trimmed)) { toast.error('Purpose already exists.'); return; }
    addPurpose(trimmed);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Purpose Added', details: `Added purpose: ${trimmed}` });
    setNewPurpose('');
    toast.success('Purpose added.');
  };

  const handleUpdatePurpose = () => {
    if (!editingPurpose) return;
    const trimmed = editingPurpose.val.trim();
    if (!trimmed || (trimmed !== editingPurpose.old && purposes.includes(trimmed))) { toast.error('Invalid or duplicate purpose.'); return; }
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

  const handleAddService = () => {
    const trimmed = newService.trim();
    if (!trimmed) return;
    if (services.includes(trimmed)) { toast.error('Service already exists.'); return; }
    addService(trimmed);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Service Added', details: `Added service: ${trimmed}` });
    setNewService('');
    toast.success('Service added.');
  };

  const handleUpdateService = () => {
    if (!editingService) return;
    const trimmed = editingService.val.trim();
    if (!trimmed || (trimmed !== editingService.old && services.includes(trimmed))) { toast.error('Invalid or duplicate service.'); return; }
    updateService(editingService.old, trimmed);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Service Updated', details: `Renamed "${editingService.old}" to "${trimmed}"` });
    setEditingService(null);
    toast.success('Service updated.');
  };

  const handleDeleteService = (s: string) => {
    deleteService(s);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Service Deleted', details: `Deleted service: ${s}` });
    toast.success('Service deleted.');
  };

  const handleAddParam = () => {
    const trimmed = newParam.trim();
    if (!trimmed) return;
    if (surveyParameters.includes(trimmed)) { toast.error('Parameter already exists.'); return; }
    addSurveyParameter(trimmed);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Survey Parameter Added', details: `Added parameter: ${trimmed}` });
    setNewParam('');
    toast.success('Survey parameter added.');
  };

  const handleUpdateParam = () => {
    if (!editingParam) return;
    const trimmed = editingParam.val.trim();
    if (!trimmed || (trimmed !== editingParam.old && surveyParameters.includes(trimmed))) { toast.error('Invalid or duplicate parameter.'); return; }
    updateSurveyParameter(editingParam.old, trimmed);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Survey Parameter Updated', details: `Renamed "${editingParam.old}" to "${trimmed}"` });
    setEditingParam(null);
    toast.success('Survey parameter updated.');
  };

  const handleDeleteParam = (p: string) => {
    deleteSurveyParameter(p);
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Survey Parameter Deleted', details: `Deleted parameter: ${p}` });
    toast.success('Survey parameter deleted.');
  };

  const renderList = (
    items: string[],
    editing: { old: string; val: string } | null,
    setEditing: (v: { old: string; val: string } | null) => void,
    onUpdate: () => void,
    onDelete: (item: string) => void,
    newVal: string,
    setNewVal: (v: string) => void,
    onAdd: () => void,
    placeholder: string,
  ) => (
    <Card className="p-6">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
            {editing?.old === item ? (
              <>
                <Input value={editing.val} onChange={(e) => setEditing({ ...editing, val: e.target.value })} className="flex-1" onKeyDown={(e) => e.key === 'Enter' && onUpdate()} />
                <Button size="sm" onClick={onUpdate}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{item}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing({ old: item, val: item })}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(item)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </>
            )}
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Input placeholder={placeholder} value={newVal} onChange={(e) => setNewVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onAdd()} className="flex-1" />
          <Button onClick={onAdd} disabled={!newVal.trim()}><Plus className="w-4 h-4 mr-2" /> Add</Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visitor Transaction Types</h1>
        <p className="text-sm text-muted-foreground">Manage purposes of visit, services, and survey rating parameters used across the system</p>
      </div>

      <Tabs defaultValue="purposes" className="w-full">
        <TabsList>
          <TabsTrigger value="purposes">Purposes of Visit</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="survey">Survey Parameters</TabsTrigger>
        </TabsList>
        <TabsContent value="purposes" className="mt-4">
          {renderList(purposes, editingPurpose, setEditingPurpose, handleUpdatePurpose, handleDeletePurpose, newPurpose, setNewPurpose, handleAddPurpose, 'New purpose...')}
        </TabsContent>
        <TabsContent value="services" className="mt-4">
          {renderList(services, editingService, setEditingService, handleUpdateService, handleDeleteService, newService, setNewService, handleAddService, 'New service...')}
        </TabsContent>
        <TabsContent value="survey" className="mt-4">
          <p className="text-sm text-muted-foreground mb-3">These parameters appear as rating criteria in the satisfaction survey form.</p>
          {renderList(surveyParameters, editingParam, setEditingParam, handleUpdateParam, handleDeleteParam, newParam, setNewParam, handleAddParam, 'New survey parameter...')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurposesSettingsPage;
