import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';

const SurveyResultsPage = () => {
  const surveys = useAppStore((s) => s.surveys);

  const avgByField = (field: keyof typeof surveys[0]) => {
    if (!surveys.length) return 0;
    return (surveys.reduce((a, s) => a + (s[field] as number), 0) / surveys.length).toFixed(2);
  };

  const metrics = [
    'responsiveness', 'reliability', 'accessFacilities', 'communication',
    'costs', 'integrity', 'assurance', 'outcome', 'overallSatisfaction',
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Survey Results</h1>
        <p className="text-sm text-muted-foreground">QMS Client Satisfaction Analytics — {surveys.length} responses</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.slice(0, 5).map((m) => (
          <Card key={m} className="p-4 text-center stat-card-shadow">
            <p className="text-xs text-muted-foreground capitalize">{m.replace(/([A-Z])/g, ' $1')}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-lg font-bold">{avgByField(m)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              {metrics.map((m) => (
                <TableHead key={m} className="text-center text-xs capitalize">
                  {m.replace(/([A-Z])/g, ' $1').slice(0, 8)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.slice(0, 20).map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm">{s.date}</TableCell>
                <TableCell className="text-sm">{s.service}</TableCell>
                {metrics.map((m) => (
                  <TableCell key={m} className="text-center text-sm">{s[m]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SurveyResultsPage;
