import { useState } from 'react';
import { useAppStore, type ServiceItem } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Link as LinkIcon, ChevronRight } from 'lucide-react';
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
  const [newParam, setNewParam] = useState('');
  const [editingParam, setEditingParam] = useState<{ old: string; val: string } | null>(null);

  // Service dialog state
  const [svcDialogOpen, setSvcDialogOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState<ServiceItem | null>(null);
  const [parentSvc, setParentSvc] = useState<ServiceItem | null>(null); // when adding sub-service
  const [svcName, setSvcName] = useState('');
  const [svcType, setSvcType] = useState<'none' | 'link' | 'sub'>('none');
  const [svcUrl, setSvcUrl] = useState('');

  const audit = (action: string, details: string) =>
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action, details });

  // ---- Purpose handlers ----
  const handleAddPurpose = () => {
    const t = newPurpose.trim();
    if (!t) return;
    if (purposes.includes(t)) { toast.error('Purpose already exists.'); return; }
    addPurpose(t); audit('Purpose Added', `Added purpose: ${t}`); setNewPurpose(''); toast.success('Purpose added.');
  };
  const handleUpdatePurpose = () => {
    if (!editingPurpose) return;
    const t = editingPurpose.val.trim();
    if (!t || (t !== editingPurpose.old && purposes.includes(t))) { toast.error('Invalid or duplicate purpose.'); return; }
    updatePurpose(editingPurpose.old, t); audit('Purpose Updated', `Renamed "${editingPurpose.old}" to "${t}"`); setEditingPurpose(null); toast.success('Purpose updated.');
  };
  const handleDeletePurpose = (p: string) => { deletePurpose(p); audit('Purpose Deleted', `Deleted purpose: ${p}`); toast.success('Purpose deleted.'); };

  // ---- Survey param handlers ----
  const handleAddParam = () => {
    const t = newParam.trim();
    if (!t) return;
    if (surveyParameters.includes(t)) { toast.error('Parameter already exists.'); return; }
    addSurveyParameter(t); audit('Survey Parameter Added', `Added: ${t}`); setNewParam(''); toast.success('Parameter added.');
  };
  const handleUpdateParam = () => {
    if (!editingParam) return;
    const t = editingParam.val.trim();
    if (!t || (t !== editingParam.old && surveyParameters.includes(t))) { toast.error('Invalid or duplicate.'); return; }
    updateSurveyParameter(editingParam.old, t); audit('Survey Parameter Updated', `Renamed "${editingParam.old}" to "${t}"`); setEditingParam(null); toast.success('Parameter updated.');
  };
  const handleDeleteParam = (p: string) => { deleteSurveyParameter(p); audit('Survey Parameter Deleted', `Deleted: ${p}`); toast.success('Parameter deleted.'); };

  // ---- Service handlers ----
  const openAddServiceDialog = (parent: ServiceItem | null = null) => {
    setEditingSvc(null);
    setParentSvc(parent);
    setSvcName(''); setSvcType('none'); setSvcUrl('');
    setSvcDialogOpen(true);
  };
  const openEditServiceDialog = (svc: ServiceItem, parent: ServiceItem | null = null) => {
    setEditingSvc(svc);
    setParentSvc(parent);
    setSvcName(svc.name);
    setSvcType(svc.subServices ? 'sub' : svc.url ? 'link' : 'none');
    setSvcUrl(svc.url || '');
    setSvcDialogOpen(true);
  };
  const handleSaveService = () => {
    const name = svcName.trim();
    if (!name) { toast.error('Service name required.'); return; }
    // Sub-services themselves can only have a link (not nested further)
    const effectiveType = parentSvc && svcType === 'sub' ? 'none' : svcType;
    const url = effectiveType === 'link' ? svcUrl.trim() : undefined;
    if (effectiveType === 'link' && !url) { toast.error('URL is required when link is enabled.'); return; }

    if (parentSvc) {
      const subs = parentSvc.subServices || [];
      const exists = subs.some((s) => s.name === name && (!editingSvc || editingSvc.name !== name));
      if (exists) { toast.error('Sub-service already exists.'); return; }
      const newSubs = editingSvc
        ? subs.map((s) => s.name === editingSvc.name ? { ...s, name, url } : s)
        : [...subs, { name, url }];
      updateService(parentSvc.name, { ...parentSvc, subServices: newSubs });
      audit(editingSvc ? 'Sub-Service Updated' : 'Sub-Service Added', `${name} (under ${parentSvc.name})${url ? ` → ${url}` : ''}`);
    } else if (editingSvc) {
      const exists = services.some((s) => s.name === name && s.name !== editingSvc.name);
      if (exists) { toast.error('Service already exists.'); return; }
      const next: ServiceItem = { ...editingSvc, name, url };
      if (effectiveType === 'sub') {
        next.url = undefined;
        next.subServices = editingSvc.subServices && editingSvc.subServices.length > 0 ? editingSvc.subServices : [];
      } else {
        delete (next as any).subServices;
      }
      updateService(editingSvc.name, next);
      audit('Service Updated', `${editingSvc.name} → ${name}${url ? ` (${url})` : ''}${effectiveType === 'sub' ? ' [has sub-services]' : ''}`);
    } else {
      if (services.some((s) => s.name === name)) { toast.error('Service already exists.'); return; }
      const newSvc: ServiceItem = { name, url };
      if (effectiveType === 'sub') { newSvc.url = undefined; newSvc.subServices = []; }
      addService(newSvc);
      audit('Service Added', `${name}${url ? ` (${url})` : ''}${effectiveType === 'sub' ? ' [with sub-services]' : ''}`);
    }
    toast.success('Saved.');
    setSvcDialogOpen(false);
  };
  const handleDeleteService = (svc: ServiceItem) => {
    deleteService(svc.name);
    audit('Service Deleted', `Deleted: ${svc.name}`);
    toast.success('Service deleted.');
  };
  const handleDeleteSubService = (parent: ServiceItem, sub: ServiceItem) => {
    const newSubs = (parent.subServices || []).filter((s) => s.name !== sub.name);
    updateService(parent.name, { ...parent, subServices: newSubs });
    audit('Sub-Service Deleted', `${sub.name} (under ${parent.name})`);
    toast.success('Sub-service deleted.');
  };

  // ---- Generic list renderer (purposes / params) ----
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
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Services may include an optional related link (auto-opens after submission) or nested sub-services.
            </p>
            <div className="space-y-3">
              {services.map((svc) => (
                <div key={svc.name} className="rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2 p-2">
                    <span className="flex-1 text-sm font-medium flex items-center gap-1.5">
                      {svc.name}
                      {svc.url && <LinkIcon className="w-3.5 h-3.5 text-primary" aria-label="Has link" />}
                    </span>
                    {svc.subServices && (
                      <Button size="sm" variant="outline" className="h-8" onClick={() => openAddServiceDialog(svc)}>
                        <Plus className="w-3 h-3 mr-1" /> Sub
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditServiceDialog(svc)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteService(svc)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                  {svc.subServices && svc.subServices.length > 0 && (
                    <div className="pl-6 pr-2 pb-2 space-y-1.5">
                      {svc.subServices.map((sub) => (
                        <div key={sub.name} className="flex items-center gap-2 p-1.5 rounded border border-border/60 bg-background">
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          <span className="flex-1 text-xs flex items-center gap-1.5">
                            {sub.name}
                            {sub.url && <LinkIcon className="w-3 h-3 text-primary" />}
                          </span>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditServiceDialog(sub, svc)}><Pencil className="w-3 h-3" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteSubService(svc, sub)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Button onClick={() => openAddServiceDialog(null)} className="w-full"><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
            </div>
          </Card>

          <Dialog open={svcDialogOpen} onOpenChange={setSvcDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSvc ? 'Edit' : 'Add'} {parentSvc ? `Sub-Service (under ${parentSvc.name})` : 'Service'}
                </DialogTitle>
                <DialogDescription>Optionally attach a related link that opens after submission.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="svcName">Service Name *</Label>
                  <Input id="svcName" value={svcName} onChange={(e) => setSvcName(e.target.value)} placeholder="e.g. PSA Appointment Assistance" />
                </div>
                <div className="space-y-2">
                  <Label>Does this service have a related link?</Label>
                  <RadioGroup value={svcHasLink} onValueChange={(v) => setSvcHasLink(v as 'yes' | 'no')} className="flex gap-4">
                    <div className="flex items-center gap-2"><RadioGroupItem value="yes" id="link-yes" /><Label htmlFor="link-yes" className="font-normal">Yes</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="no" id="link-no" /><Label htmlFor="link-no" className="font-normal">No</Label></div>
                  </RadioGroup>
                </div>
                {svcHasLink === 'yes' && (
                  <div className="space-y-2">
                    <Label htmlFor="svcUrl">Service URL *</Label>
                    <Input id="svcUrl" value={svcUrl} onChange={(e) => setSvcUrl(e.target.value)} placeholder="https://..." type="url" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSvcDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveService}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
