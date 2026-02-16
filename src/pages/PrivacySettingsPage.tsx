import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Info } from 'lucide-react';

const PrivacySettingsPage = () => {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);

  const [visitorPrompt, setVisitorPrompt] = useState(profile.visitorPrivacyPrompt);
  const [surveyPrompt, setSurveyPrompt] = useState(profile.surveyPrivacyPrompt);
  const [visitorConsentLabel, setVisitorConsentLabel] = useState(profile.visitorConsentLabel);
  const [surveyConsentLabel, setSurveyConsentLabel] = useState(profile.surveyConsentLabel);

  const handleSave = () => {
    setProfile({
      visitorPrivacyPrompt: visitorPrompt,
      surveyPrivacyPrompt: surveyPrompt,
      visitorConsentLabel,
      surveyConsentLabel,
    });
    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'Privacy Prompts Updated',
      details: 'Updated data privacy consent prompts for visitor and survey.',
    });
    toast.success('Privacy prompts updated successfully.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Privacy Prompts</h1>
        <p className="text-sm text-muted-foreground">Customize the data privacy consent text shown to visitors and survey respondents</p>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-info/10 border border-info/20">
        <Info className="w-4 h-4 text-info mt-0.5 shrink-0" />
        <p className="text-sm text-foreground">
          Use <code className="px-1 py-0.5 bg-muted rounded text-xs">{'{officeName}'}</code> and <code className="px-1 py-0.5 bg-muted rounded text-xs">{'{email}'}</code> as placeholders — they will be replaced with your agency profile values. Use <code className="px-1 py-0.5 bg-muted rounded text-xs">**bold**</code> for emphasis.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-2 mb-4">
          <Label className="text-base font-semibold">Visitor Logbook — Data Privacy Consent</Label>
          <p className="text-xs text-muted-foreground">Shown before visitor registration (RA 10173 compliance)</p>
        </div>
        <Textarea
          value={visitorPrompt}
          onChange={(e) => setVisitorPrompt(e.target.value)}
          rows={12}
          className="font-mono text-sm"
        />
      </Card>

      <Card className="p-6">
        <div className="space-y-2 mb-4">
          <Label className="text-base font-semibold">Visitor Consent — Checkbox Label</Label>
          <p className="text-xs text-muted-foreground">The text beside the checkbox that visitors must agree to before proceeding</p>
        </div>
        <Textarea
          value={visitorConsentLabel}
          onChange={(e) => setVisitorConsentLabel(e.target.value)}
          rows={3}
          className="font-mono text-sm"
        />
      </Card>

      <Card className="p-6">
        <div className="space-y-2 mb-4">
          <Label className="text-base font-semibold">Satisfaction Survey — Data Privacy Consent</Label>
          <p className="text-xs text-muted-foreground">Shown before survey participation</p>
        </div>
        <Textarea
          value={surveyPrompt}
          onChange={(e) => setSurveyPrompt(e.target.value)}
          rows={10}
          className="font-mono text-sm"
        />
      </Card>

      <Card className="p-6">
        <div className="space-y-2 mb-4">
          <Label className="text-base font-semibold">Survey Consent — Checkbox Label</Label>
          <p className="text-xs text-muted-foreground">The text beside the checkbox that survey respondents must agree to</p>
        </div>
        <Textarea
          value={surveyConsentLabel}
          onChange={(e) => setSurveyConsentLabel(e.target.value)}
          rows={3}
          className="font-mono text-sm"
        />
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Privacy Prompts</Button>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;
