import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Shield, Star } from 'lucide-react';

const criteria = [
  { key: 'responsiveness', label: 'Responsiveness' },
  { key: 'reliability', label: 'Reliability' },
  { key: 'accessFacilities', label: 'Access & Facilities' },
  { key: 'communication', label: 'Communication' },
  { key: 'costs', label: 'Costs' },
  { key: 'integrity', label: 'Integrity' },
  { key: 'assurance', label: 'Assurance' },
  { key: 'outcome', label: 'Outcome' },
];

const RatingStars = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="p-0.5 transition-transform hover:scale-110"
      >
        <Star
          className={`w-7 h-7 ${star <= value ? 'fill-warning text-warning' : 'text-border'}`}
        />
      </button>
    ))}
  </div>
);

const KioskSurveyPage = () => {
  const profile = useAppStore((s) => s.profile);
  const addSurvey = useAppStore((s) => s.addSurvey);
  const navigate = useNavigate();
  const location = useLocation();
  const { visitorId = '', service = '' } = (location.state as any) || {};
  const services = useAppStore((s) => s.services);
  const [selectedService, setSelectedService] = useState(service);

  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(criteria.map((c) => [c.key, 0]))
  );
  const [overall, setOverall] = useState(0);
  const [comment, setComment] = useState('');

  const allRated = Object.values(ratings).every((v) => v > 0) && overall > 0 && !!selectedService;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRated) return;

    addSurvey({
      id: `s${Date.now()}`,
      visitorId,
      service: selectedService,
      ...ratings as any,
      overallSatisfaction: overall,
      comment,
      date: new Date().toISOString().split('T')[0],
    });
    navigate('/survey/thankyou');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gov-header-gradient mb-3">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Satisfaction Survey</h1>
          <p className="text-sm text-muted-foreground">
            QMS Client Feedback — {selectedService || profile.officeName}
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 kiosk-card-shadow border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service Availed *</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the service you availed" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              Please rate your experience (1 = Poor, 5 = Excellent)
            </p>

            {criteria.map((c) => (
              <div key={c.key} className="flex items-center justify-between">
                <Label className="text-sm font-medium">{c.label}</Label>
                <RatingStars
                  value={ratings[c.key]}
                  onChange={(v) => setRatings({ ...ratings, [c.key]: v })}
                />
              </div>
            ))}

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Overall Satisfaction</Label>
                <RatingStars value={overall} onChange={setOverall} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comments / Suggestions (Optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any feedback to help us improve..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={!allRated}>
              Submit Feedback
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KioskSurveyPage;
