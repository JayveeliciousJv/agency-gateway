import { useState } from 'react';
import { useAppStore, type ServiceItem } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Link as LinkIcon, ChevronRight, Archive, ArchiveRestore } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type StatusFilter = 'active' | 'inactive' | 'all';

const PurposesSettingsPage = () => {
  const purposes = useAppStore((s) => s.purposes);
  const archivedPurposes = useAppStore((s) => s.archivedPurposes);
  const addPurpose = useAppStore((s) => s.addPurpose);
  const updatePurpose = useAppStore((s) => s.updatePurpose);
  const deletePurpose = useAppStore((s) => s.deletePurpose);
  const archivePurpose = useAppStore((s) => s.archivePurpose);
  const restorePurpose = useAppStore((s) => s.restorePurpose);

  const services = useAppStore((s) => s.services);
  const addService = useAppStore((s) => s.addService);
  const updateService = useAppStore((s) => s.updateService);
  const deleteService = useAppStore((s) => s.deleteService);
  const setServiceActive = useAppStore((s) => s.setServiceActive);

  const surveyParameters = useAppStore((s) => s.surveyParameters);
  const archivedSurveyParameters = useAppStore((s) => s.archivedSurveyParameters);
  const addSurveyParameter = useAppStore((s) => s.addSurveyParameter);
  const updateSurveyParameter = useAppStore((s) => s.updateSurveyParameter);
  const deleteSurveyParameter = useAppStore((s) => s.deleteSurveyParameter);
  const archiveSurveyParameter = useAppStore((s) => s.archiveSurveyParameter);
  const restoreSurveyParameter = useAppStore((s) => s.restoreSurveyParameter);

  const visitors = useAppStore((s) => s.visitors);
  const surveys = useAppStore((s) => s.surveys);

  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);

  const [newPurpose, setNewPurpose] = useState('');
  const [editingPurpose, setEditingPurpose] = useState<{ old: string; val: string } | null>(null);
  const [newParam, setNewParam] = useState('');
  const [editingParam, setEditingParam] = useState<{ old: string; val: string } | null>(null);

  const [purposeFilter, setPurposeFilter] = useState<StatusFilter>('active');
  const [serviceFilter, setServiceFilter] = useState<StatusFilter>('active');
  const [paramFilter, setParamFilter] = useState<StatusFilter>('active');

  // Service dialog state
  const [svcDialogOpen, setSvcDialogOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState<ServiceItem | null>(null);
  const [parentSvc, setParentSvc] = useState<ServiceItem | null>(null);
  const [svcName, setSvcName] = useState('');
  const [svcType, setSvcType] = useState<'none' | 'link' | 'sub'>('none');
  const [svcUrl, setSvcUrl] = useState('');

  const audit = (action: string, details: string) =>
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action, details });

  // ---- Reference detection (used in historical records) ----
  const isPurposeReferenced = (p: string) => visitors.some((v) => v.purpose === p);
  const isServiceReferenced = (name: string) =>
    visitors.some((v) => v.service === name) || surveys.some((s) => s.service === name);
  const isParamReferenced = (_p: string) => surveys.length > 0; // params are columns in every survey

  // ---- Purpose handlers ----
  const handleAddPurpose = () => {
    const t = newPurpose.trim();
    if (!t) return;
    if (purposes.includes(t) || archivedPurposes.includes(t)) { toast.error('Purpose already exists.'); return; }
    addPurpose(t); audit('Purpose Added', `Added purpose: ${t}`); setNewPurpose(''); toast.success('Purpose added.');
  };
  const handleUpdatePurpose = () => {
    if (!editingPurpose) return;
    const t = editingPurpose.val.trim();
    if (!t || (t !== editingPurpose.old && (purposes.includes(t) || archivedPurposes.includes(t)))) {
      toast.error('Invalid or duplicate purpose.'); return;
    }
    updatePurpose(editingPurpose.old, t); audit('Purpose Updated', `Renamed "${editingPurpose.old}" to "${t}"`); setEditingPurpose(null); toast.success('Purpose updated.');
  };
  const handleArchivePurpose = (p: string) => {
    archivePurpose(p); audit('Purpose Archived', `Marked inactive: ${p}`); toast.success('Purpose archived.');
  };
  const handleRestorePurpose = (p: string) => {
    restorePurpose(p); audit('Purpose Restored', `Reactivated: ${p}`); toast.success('Purpose reactivated.');
  };
  const handleHardDeletePurpose = (p: string) => {
    deletePurpose(p); audit('Purpose Permanently Deleted', `Deleted: ${p}`); toast.success('Purpose deleted.');
  };

  // ---- Survey param handlers ----
  const handleAddParam = () => {
    const t = newParam.trim();
    if (!t) return;
    if (surveyParameters.includes(t) || archivedSurveyParameters.includes(t)) { toast.error('Parameter already exists.'); return; }
    addSurveyParameter(t); audit('Survey Parameter Added', `Added: ${t}`); setNewParam(''); toast.success('Parameter added.');
  };
  const handleUpdateParam = () => {
    if (!editingParam) return;
    const t = editingParam.val.trim();
    if (!t || (t !== editingParam.old && (surveyParameters.includes(t) || archivedSurveyParameters.includes(t)))) {
      toast.error('Invalid or duplicate.'); return;
    }
    updateSurveyParameter(editingParam.old, t); audit('Survey Parameter Updated', `Renamed "${editingParam.old}" to "${t}"`); setEditingParam(null); toast.success('Parameter updated.');
  };
  const handleArchiveParam = (p: string) => {
    archiveSurveyParameter(p); audit('Survey Parameter Archived', `Marked inactive: ${p}`); toast.success('Parameter archived.');
  };
  const handleRestoreParam = (p: string) => {
    restoreSurveyParameter(p); audit('Survey Parameter Restored', `Reactivated: ${p}`); toast.success('Parameter reactivated.');
  };
  const handleHardDeleteParam = (p: string) => {
    deleteSurveyParameter(p); audit('Survey Parameter Permanently Deleted', `Deleted: ${p}`); toast.success('Parameter deleted.');
  };

  // ---- Service handlers ----
  const openAddServiceDialog = (parent: ServiceItem | null = null) => {
    setEditingSvc(null); setParentSvc(parent);
    setSvcName(''); setSvcType('none'); setSvcUrl('');
    setSvcDialogOpen(true);
  };
  const openEditServiceDialog = (svc: ServiceItem, parent: ServiceItem | null = null) => {
    setEditingSvc(svc); setParentSvc(parent);
    setSvcName(svc.name);
    setSvcType(svc.subServices ? 'sub' : svc.url ? 'link' : 'none');
    setSvcUrl(svc.url || '');
    setSvcDialogOpen(true);
  };
  const handleSaveService = () => {
    const name = svcName.trim();
    if (!name) { toast.error('Service name required.'); return; }
    const effectiveType = parentSvc && svcType === 'sub' ? 'none' : svcType;
    const url = effectiveType === 'link' ? svcUrl.trim() : undefined;
    if (effectiveType === 'link' && !url) { toast.error('URL is required when link is enabled.'); return; }

    if (parentSvc) {
      const subs = parentSvc.subServices || [];
      const exists = subs.some((s) => s.name === name && (!editingSvc || editingSvc.name !== name));
      if (exists) { toast.error('Sub-service already exists.'); return; }
      const newSubs = editingSvc
        ? subs.map((s) => s.name === editingSvc.name ? { ...s, name, url } : s)
        : [...subs, { name, url, isActive: true }];
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
      audit('Service Updated', `${editingSvc.name} → ${name}`);
    } else {
      if (services.some((s) => s.name === name)) { toast.error('Service already exists.'); return; }
      const newSvc: ServiceItem = { name, url, isActive: true };
      if (effectiveType === 'sub') { newSvc.url = undefined; newSvc.subServices = []; }
      addService(newSvc);
      audit('Service Added', `${name}${url ? ` (${url})` : ''}`);
    }
    toast.success('Saved.');
    setSvcDialogOpen(false);
  };
  const handleArchiveService = (svc: ServiceItem, parent?: ServiceItem) => {
    setServiceActive(svc.name, false, parent?.name);
    audit('Service Archived', `Marked inactive: ${svc.name}${parent ? ` (under ${parent.name})` : ''}`);
    toast.success('Service archived.');
  };
  const handleRestoreService = (svc: ServiceItem, parent?: ServiceItem) => {
    setServiceActive(svc.name, true, parent?.name);
    audit('Service Restored', `Reactivated: ${svc.name}${parent ? ` (under ${parent.name})` : ''}`);
    toast.success('Service reactivated.');
  };
  const handleHardDeleteService = (svc: ServiceItem) => {
    deleteService(svc.name);
    audit('Service Permanently Deleted', `Deleted: ${svc.name}`);
    toast.success('Service deleted.');
  };
  const handleHardDeleteSubService = (parent: ServiceItem, sub: ServiceItem) => {
    const newSubs = (parent.subServices || []).filter((s) => s.name !== sub.name);
    updateService(parent.name, { ...parent, subServices: newSubs });
    audit('Sub-Service Permanently Deleted', `${sub.name} (under ${parent.name})`);
    toast.success('Sub-service deleted.');
  };

  // ---- Status filter chip ----
  const FilterBar = ({ value, onChange }: { value: StatusFilter; onChange: (v: StatusFilter) => void }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs text-muted-foreground">Show:</span>
      {(['active', 'inactive', 'all'] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize ${
            value === opt
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          {opt} {opt === 'active' ? 'only' : opt === 'inactive' ? 'only' : ''}
        </button>
      ))}
    </div>
  );

  // ---- Generic list renderer for purposes / params ----
  const renderStringList = (
    activeItems: string[],
    archivedItems: string[],
    filter: StatusFilter,
    setFilter: (v: StatusFilter) => void,
    editing: { old: string; val: string } | null,
    setEditing: (v: { old: string; val: string } | null) => void,
    onUpdate: () => void,
    onArchive: (item: string) => void,
    onRestore: (item: string) => void,
    onHardDelete: (item: string) => void,
    isReferenced: (item: string) => boolean,
    newVal: string,
    setNewVal: (v: string) => void,
    onAdd: () => void,
    placeholder: string,
    label: string,
  ) => {
    const list: { name: string; active: boolean }[] = [
      ...(filter !== 'inactive' ? activeItems.map((n) => ({ name: n, active: true })) : []),
      ...(filter !== 'active' ? archivedItems.map((n) => ({ name: n, active: false })) : []),
    ];

    return (
      <Card className="p-6">
        <FilterBar value={filter} onChange={setFilter} />
        <div className="space-y-3">
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">No records to display.</p>
          )}
          {list.map((item) => (
            <div
              key={`${item.name}-${item.active}`}
              className={`flex items-center gap-2 p-2 rounded-lg border ${
                item.active ? 'border-border bg-muted/30' : 'border-dashed border-border bg-muted/10 opacity-75'
              }`}
            >
              {editing?.old === item.name && item.active ? (
                <>
                  <Input value={editing.val} onChange={(e) => setEditing({ ...editing, val: e.target.value })} className="flex-1" onKeyDown={(e) => e.key === 'Enter' && onUpdate()} />
                  <Button size="sm" onClick={onUpdate}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{item.name}</span>
                  <Badge variant={item.active ? 'default' : 'secondary'} className="text-[10px]">
                    {item.active ? 'Active' : 'Inactive'}
                  </Badge>
                  {item.active ? (
                    <>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing({ old: item.name, val: item.name })} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700" title="Archive">
                            <Archive className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Archive {label}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "<strong>{item.name}</strong>" will be marked <strong>Inactive</strong> and hidden from new entry forms.
                              Existing historical records, reports, and analytics will continue to reference it normally.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onArchive(item.name)}>Archive</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onRestore(item.name)}>
                        <ArchiveRestore className="w-3.5 h-3.5 mr-1" /> Reactivate
                      </Button>
                      {!isReferenced(item.name) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" title="Permanently delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Permanently delete {label}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "<strong>{item.name}</strong>" is not referenced in any historical record. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onHardDelete(item.name)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  )}
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
  };

  // ---- Service tree filter ----
  const visibleServices = services.filter((s) => {
    if (serviceFilter === 'active') return s.isActive !== false;
    if (serviceFilter === 'inactive') return s.isActive === false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visitor Transaction Types</h1>
        <p className="text-sm text-muted-foreground">
          Manage purposes of visit, services, and survey rating parameters. Archive (soft-delete) keeps historical records intact.
        </p>
      </div>

      <Tabs defaultValue="purposes" className="w-full">
        <TabsList>
          <TabsTrigger value="purposes">Purposes of Visit</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="survey">Survey Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="purposes" className="mt-4">
          {renderStringList(
            purposes, archivedPurposes, purposeFilter, setPurposeFilter,
            editingPurpose, setEditingPurpose, handleUpdatePurpose,
            handleArchivePurpose, handleRestorePurpose, handleHardDeletePurpose,
            isPurposeReferenced,
            newPurpose, setNewPurpose, handleAddPurpose,
            'New purpose...', 'purpose',
          )}
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Services may include an optional related link or nested sub-services. Archived services are hidden from new entries but remain in historical reports.
            </p>
            <FilterBar value={serviceFilter} onChange={setServiceFilter} />
            <div className="space-y-3">
              {visibleServices.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">No services to display.</p>
              )}
              {visibleServices.map((svc) => {
                const active = svc.isActive !== false;
                return (
                  <div key={svc.name} className={`rounded-lg border ${active ? 'border-border bg-muted/30' : 'border-dashed border-border bg-muted/10 opacity-75'}`}>
                    <div className="flex items-center gap-2 p-2 flex-wrap">
                      <span className="flex-1 text-sm font-medium flex items-center gap-1.5 min-w-[120px]">
                        {svc.name}
                        {svc.url && <LinkIcon className="w-3.5 h-3.5 text-primary" aria-label="Has link" />}
                      </span>
                      <Badge variant={active ? 'default' : 'secondary'} className="text-[10px]">
                        {active ? 'Active' : 'Inactive'}
                      </Badge>
                      {active && svc.subServices && (
                        <Button size="sm" variant="outline" className="h-8" onClick={() => openAddServiceDialog(svc)}>
                          <Plus className="w-3 h-3 mr-1" /> Sub
                        </Button>
                      )}
                      {active && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditServiceDialog(svc)} title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {active ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:text-amber-700" title="Archive">
                              <Archive className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Archive service?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "<strong>{svc.name}</strong>" will be hidden from new visitor forms. Historical logs, surveys, reports, and dashboard analytics will continue to reference it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleArchiveService(svc)}>Archive</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleRestoreService(svc)}>
                            <ArchiveRestore className="w-3.5 h-3.5 mr-1" /> Reactivate
                          </Button>
                          {!isServiceReferenced(svc.name) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" title="Permanently delete">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Permanently delete service?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "<strong>{svc.name}</strong>" is not referenced in any historical record. This cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleHardDeleteService(svc)}
                                  >Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </>
                      )}
                    </div>
                    {svc.subServices && svc.subServices.length > 0 && (
                      <div className="pl-6 pr-2 pb-2 space-y-1.5">
                        {svc.subServices.map((sub) => {
                          const subActive = sub.isActive !== false;
                          return (
                            <div key={sub.name} className={`flex items-center gap-2 p-1.5 rounded border ${subActive ? 'border-border/60 bg-background' : 'border-dashed border-border bg-muted/10 opacity-75'}`}>
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                              <span className="flex-1 text-xs flex items-center gap-1.5">
                                {sub.name}
                                {sub.url && <LinkIcon className="w-3 h-3 text-primary" />}
                              </span>
                              <Badge variant={subActive ? 'default' : 'secondary'} className="text-[10px]">
                                {subActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {subActive && (
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditServiceDialog(sub, svc)} title="Edit">
                                  <Pencil className="w-3 h-3" />
                                </Button>
                              )}
                              {subActive ? (
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600 hover:text-amber-700"
                                  onClick={() => handleArchiveService(sub, svc)} title="Archive">
                                  <Archive className="w-3 h-3" />
                                </Button>
                              ) : (
                                <>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-primary"
                                    onClick={() => handleRestoreService(sub, svc)} title="Reactivate">
                                    <ArchiveRestore className="w-3 h-3" />
                                  </Button>
                                  {!isServiceReferenced(sub.name) && (
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() => handleHardDeleteSubService(svc, sub)} title="Permanently delete">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
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
                  <Label>Service Type</Label>
                  <RadioGroup value={svcType} onValueChange={(v) => setSvcType(v as 'none' | 'link' | 'sub')} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2"><RadioGroupItem value="none" id="t-none" /><Label htmlFor="t-none" className="font-normal">Standalone (no link, no sub-services)</Label></div>
                    <div className="flex items-center gap-2"><RadioGroupItem value="link" id="t-link" /><Label htmlFor="t-link" className="font-normal">Has a related link (auto-opens after submission)</Label></div>
                    {!parentSvc && (
                      <div className="flex items-center gap-2"><RadioGroupItem value="sub" id="t-sub" /><Label htmlFor="t-sub" className="font-normal">Has sub-services (shows nested dropdown)</Label></div>
                    )}
                  </RadioGroup>
                </div>
                {svcType === 'link' && (
                  <div className="space-y-2">
                    <Label htmlFor="svcUrl">Service URL *</Label>
                    <Input id="svcUrl" value={svcUrl} onChange={(e) => setSvcUrl(e.target.value)} placeholder="https://..." type="url" />
                  </div>
                )}
                {svcType === 'sub' && !parentSvc && (
                  <p className="text-xs text-muted-foreground">After saving, use the <strong>+ Sub</strong> button on this service to add its sub-services.</p>
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
          <p className="text-sm text-muted-foreground mb-3">These parameters appear as rating criteria in the satisfaction survey form. Archived parameters are hidden from new surveys but remain in historical reports.</p>
          {renderStringList(
            surveyParameters, archivedSurveyParameters, paramFilter, setParamFilter,
            editingParam, setEditingParam, handleUpdateParam,
            handleArchiveParam, handleRestoreParam, handleHardDeleteParam,
            isParamReferenced,
            newParam, setNewParam, handleAddParam,
            'New survey parameter...', 'parameter',
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurposesSettingsPage;
