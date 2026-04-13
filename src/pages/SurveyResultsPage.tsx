import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const SurveyResultsPage = () => {
  const surveys = useAppStore((s) => s.surveys);
  const deleteSurvey = useAppStore((s) => s.deleteSurvey);
  const currentUser = useAppStore((s) => s.currentUser);
  const addAuditLog = useAppStore((s) => s.addAuditLog);

  const avgByField = (field: keyof typeof surveys[0]) => {
    if (!surveys.length) return 0;
    return (surveys.reduce((a, s) => a + (s[field] as number), 0) / surveys.length).toFixed(2);
  };

  const metrics = [
    'responsiveness', 'reliability', 'accessFacilities', 'communication',
    'costs', 'integrity', 'assurance', 'outcome', 'overallSatisfaction',
  ] as const;

  const handleDelete = (id: string, service: string, date: string) => {
    deleteSurvey(id);
    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'Delete Survey Record (Right to Erasure)',
      details: `Deleted survey response (ID: ${id}, Service: ${service}, Date: ${date}) per RA 10173 Right to be Forgotten`,
    });
    toast.success('Survey record deleted per Data Privacy Act (RA 10173)');
  };

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
              <TableHead className="w-10"></TableHead>
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
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Right to Erasure (RA 10173)</AlertDialogTitle>
                        <AlertDialogDescription>
                          Under the Data Privacy Act of 2012, data subjects have the right to request deletion of their personal data. This will permanently delete this survey response for <strong>{s.service}</strong> on {s.date}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(s.id, s.service, s.date)}
                        >
                          Delete Record
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default SurveyResultsPage;
