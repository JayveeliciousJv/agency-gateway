import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import defaultLogo from '@/assets/default-logo.png';

// Survey criteria are now loaded dynamically from the store.
// The key for each criterion is derived from its label (lowercased, spaces removed).

/**
 * RatingStars — interactive 5-star rating component.
 *
 * Behaviour:
 *  • Hover fills stars 1..N temporarily (preview only).
 *  • Click commits the rating permanently.
 *  • After a click, hover still previews but reverts on mouse-leave.
 *  • Smooth CSS transitions on color & scale.
 */
const RatingStars = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  // hoverValue tracks the star the cursor is over (0 = not hovering)
  const [hoverValue, setHoverValue] = useState(0);

  // Show hover preview when active, otherwise the committed value
  const displayValue = hoverValue || value;

  return (
    <div
      className="flex gap-1.5 select-none"
      // Reset hover preview when the cursor leaves the entire row
      onMouseLeave={() => setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;

        return (
          <button
            key={star}
            type="button"
            // Preview: fill stars 1..star on hover
            onMouseEnter={() => setHoverValue(star)}
            // Commit: permanently save rating on click
            onClick={() => onChange(star)}
            className="p-0.5 cursor-pointer transition-transform duration-200 ease-out hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              className={`w-7 h-7 transition-colors duration-200 ease-out ${
                isFilled
                  ? 'fill-warning text-warning'
                  : 'fill-transparent text-border'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

const KioskSurveyPage = () => {
  const profile = useAppStore((s) => s.profile);
  const addSurvey = useAppStore((s) => s.addSurvey);
  const surveyParameters = useAppStore((s) => s.surveyParameters);
  const navigate = useNavigate();
  const location = useLocation();
  const { visitorId = '', service = '' } = (location.state as any) || {};
  const services = useAppStore((s) => s.services);
  const [selectedService, setSelectedService] = useState(service);

  const criteria = surveyParameters.map((label) => ({
    key: label.toLowerCase().replace(/[^a-z0-9]/g, ''),
    label,
  }));

  const [ratings, setRatings] = useState<Record<string, number>>({});

  // Initialize ratings when criteria change
  const ratingKeys = criteria.map((c) => c.key).join(',');
  useState(() => {
    const initial: Record<string, number> = {};
    criteria.forEach((c) => { initial[c.key] = 0; });
    setRatings(initial);
  });
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 overflow-hidden">
            <img src={profile.logoPath || defaultLogo} alt="Agency Logo" className="w-full h-full object-contain" />
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
                  value={ratings[c.key] || 0}
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
