import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAppStore, findService } from '@/lib/store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type OrganizationType = 'LGU' | 'NGA' | 'SUC' | 'Other' | '';

export interface VisitorFormData {
  name: string;
  contactNumber: string;
  email: string;
  sex: 'Male' | 'Female' | 'Prefer not to say' | '';
  sectorClassification: string;
  sectorOtherSpecify: string;
  organizationType: OrganizationType;
  organizationOtherSpecify: string;
  purpose: string;
  service: string;
  serviceOtherSpecify: string;
  subService: string;
  letterSubject: string;
  letterFrom: string;
  letterProject: string;
  letterProjectOther: string;
}

const PROJECT_OPTIONS = ['DigiGov', 'ILCDB', 'PNPKI', 'Cybersecurity', 'FreeWifi4All', 'Other'];

const ORGANIZATION_OPTIONS: Array<'LGU' | 'NGA' | 'SUC' | 'Other'> = ['LGU', 'NGA', 'SUC', 'Other'];

const SECTOR_OPTIONS = [
  'Student', 'Employed/Working', 'Women', 'Person with Disability (PWD)',
  'Senior Citizen', 'Youth', 'Government Employee', 'Private Sector',
  'Indigenous Peoples (IP)', 'Solo Parent', 'Others',
];

interface StepFormProps {
  form: VisitorFormData;
  setForm: (form: VisitorFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepForm = ({ form, setForm, onNext, onBack }: StepFormProps) => {
  const services = useAppStore((s) => s.services);
  const purposes = useAppStore((s) => s.purposes);

  const isIncomingLetter = form.purpose === 'Incoming Letter';
  const isOtherService = form.service === 'Other';
  const parentService = form.service && !isOtherService ? findService(services, form.service) : undefined;
  const hasSubServices = !!parentService?.subServices?.length;

  const isValid = form.name && form.sex && form.sectorClassification &&
    (form.sectorClassification !== 'Others' || form.sectorOtherSpecify.trim()) &&
    !!form.organizationType &&
    (form.organizationType !== 'Other' || form.organizationOtherSpecify.trim()) &&
    (isIncomingLetter
      ? (form.letterSubject.trim() && form.letterFrom.trim() && form.letterProject && (form.letterProject !== 'Other' || form.letterProjectOther.trim()))
      : (!!form.service && (isOtherService ? !!form.serviceOtherSpecify.trim() : (!hasSubServices || !!form.subService))));

  return (
    <div className="animate-fade-in">
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-5">Visitor Details</h2>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Dela Cruz" required />
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <Label>Sex *</Label>
            <RadioGroup value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v as typeof form.sex })} className="flex gap-4 flex-wrap">
              {(['Male', 'Female', 'Prefer not to say'] as const).map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`sex-${opt}`} />
                  <Label htmlFor={`sex-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <Label htmlFor="sector">Sector Classification *</Label>
            <Select value={form.sectorClassification} onValueChange={(v) => setForm({ ...form, sectorClassification: v, sectorOtherSpecify: v !== 'Others' ? '' : form.sectorOtherSpecify })}>
              <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
              <SelectContent>
                {SECTOR_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
            {form.sectorClassification === 'Others' && (
              <Input placeholder="Please specify..." value={form.sectorOtherSpecify} onChange={(e) => setForm({ ...form, sectorOtherSpecify: e.target.value })} className="mt-2" />
            )}
          </div>

          {/* Organization Type */}
          <div className="space-y-2">
            <Label htmlFor="orgType">Organization Type *</Label>
            <Select
              value={form.organizationType}
              onValueChange={(v) => setForm({ ...form, organizationType: v as OrganizationType, organizationOtherSpecify: v !== 'Other' ? '' : form.organizationOtherSpecify })}
            >
              <SelectTrigger id="orgType"><SelectValue placeholder="Select organization type" /></SelectTrigger>
              <SelectContent>
                {ORGANIZATION_OPTIONS.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
              </SelectContent>
            </Select>
            {form.organizationType === 'Other' && (
              <Input placeholder="Please specify..." value={form.organizationOtherSpecify} onChange={(e) => setForm({ ...form, organizationOtherSpecify: e.target.value })} className="mt-2" />
            )}
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input id="contact" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} placeholder="09XX XXX XXXX" />
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Visit *</Label>
            <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v, service: '', subService: '', letterSubject: '', letterFrom: '', letterProject: '', letterProjectOther: '' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {purposes.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Incoming Letter or Service */}
          {isIncomingLetter ? (
            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="w-4 h-4" /> Incoming Letter Details
              </div>
              <div className="space-y-2">
                <Label htmlFor="letterSubject">Content / Subject *</Label>
                <Textarea id="letterSubject" value={form.letterSubject} onChange={(e) => setForm({ ...form, letterSubject: e.target.value })} placeholder="Brief description..." className="min-h-[60px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="letterFrom">From (Agency / LGU / Person) *</Label>
                <Input id="letterFrom" value={form.letterFrom} onChange={(e) => setForm({ ...form, letterFrom: e.target.value })} placeholder="e.g. DICT Regional Office" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="letterProject">Project Concerned *</Label>
                <Select value={form.letterProject} onValueChange={(v) => setForm({ ...form, letterProject: v, letterProjectOther: v !== 'Other' ? '' : form.letterProjectOther })}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_OPTIONS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
                {form.letterProject === 'Other' && (
                  <Input placeholder="Specify project..." value={form.letterProjectOther} onChange={(e) => setForm({ ...form, letterProjectOther: e.target.value })} className="mt-2" />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="service" className="flex items-center gap-1.5">
                  Service Availed *
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground cursor-help text-xs">ⓘ</span>
                      </TooltipTrigger>
                      <TooltipContent>Services with 🔗 will redirect you after submission.</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v, subService: '' })}>
                  <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        <span className="flex items-center gap-1.5">
                          {s.name}
                          {(s.url || s.subServices?.length) && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasSubServices && (
                <div className="space-y-2 pl-3 border-l-2 border-primary/30">
                  <Label htmlFor="subService">Select Specific Assistance *</Label>
                  <Select value={form.subService} onValueChange={(v) => setForm({ ...form, subService: v })}>
                    <SelectTrigger><SelectValue placeholder="Select sub-service" /></SelectTrigger>
                    <SelectContent>
                      {parentService!.subServices!.map((s) => (
                        <SelectItem key={s.name} value={s.name}>
                          <span className="flex items-center gap-1.5">
                            {s.name}
                            {s.url && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button type="button" className="flex-1" disabled={!isValid} onClick={onNext}>
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepForm;
