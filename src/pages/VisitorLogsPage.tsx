import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { Search, Users, Mail, ExternalLink, Camera, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const LETTER_STATUSES = ['Received', 'Processed', 'Pending', 'Forwarded', 'Archived'] as const;

const ScanLinkCell = ({ value, onSave }: { value: string; onSave: (link: string) => void }) => {
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(value);

  if (editing) {
    return (
      <Input
        className="h-7 text-xs w-40"
        placeholder="Paste link..."
        value={link}
        onChange={(e) => setLink(e.target.value)}
        onBlur={() => { onSave(link); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { onSave(link); setEditing(false); } }}
        autoFocus
      />
    );
  }

  return value ? (
    <div className="flex items-center gap-1">
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[120px]">
        View <ExternalLink className="inline w-3 h-3" />
      </a>
      <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
    </div>
  ) : (
    <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground hover:text-foreground italic">
      + Add link
    </button>
  );
};

const VisitorLogsPage = () => {
  const visitors = useAppStore((s) => s.visitors);
  const updateVisitor = useAppStore((s) => s.updateVisitor);
  const deleteVisitor = useAppStore((s) => s.deleteVisitor);
  const currentUser = useAppStore((s) => s.currentUser);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const [search, setSearch] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const filtered = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.service.toLowerCase().includes(search.toLowerCase()) ||
      (v.letterSubject?.toLowerCase().includes(search.toLowerCase())) ||
      (v.letterFrom?.toLowerCase().includes(search.toLowerCase())) ||
      (v.letterReceivedBy?.toLowerCase().includes(search.toLowerCase()))
  );

  const regularVisitors = filtered.filter((v) => v.purpose !== 'Incoming Letter');
  const incomingLetters = filtered.filter((v) => v.purpose === 'Incoming Letter');

  const handleStatusChange = (id: string, newStatus: string) => {
    updateVisitor(id, {
      letterStatus: newStatus as typeof LETTER_STATUSES[number],
      letterReceivedBy: currentUser?.fullName || '',
    });
    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'Update Letter Status',
      details: `Updated letter ${id} status to ${newStatus}`,
    });
    toast.success(`Letter status updated to ${newStatus}`);
  };

  const handleScanLinkSave = (id: string, link: string) => {
    updateVisitor(id, { letterScanLink: link });
    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'Update Scan Link',
      details: `Updated scan link for letter ${id}`,
    });
    toast.success('Scan link saved');
  };

  const handleDeleteVisitor = (id: string, name: string) => {
    deleteVisitor(id);
    addAuditLog({
      userId: currentUser?.id || '',
      userName: currentUser?.fullName || '',
      action: 'Delete Visitor Record (Right to Erasure)',
      details: `Deleted visitor record for "${name}" (ID: ${id}) per RA 10173 Right to be Forgotten`,
    });
    toast.success('Record deleted per Data Privacy Act (RA 10173)');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Visitor Logs</h1>
          <p className="text-sm text-muted-foreground">{visitors.length} total records</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 sm:h-9"
          />
        </div>
      </div>

      <Tabs defaultValue="visitors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-10">
          <TabsTrigger value="visitors" className="text-sm gap-1.5">
            <Users className="w-3.5 h-3.5" /> Visitors ({regularVisitors.length})
          </TabsTrigger>
          <TabsTrigger value="letters" className="text-sm gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Incoming Letters ({incomingLetters.length})
          </TabsTrigger>
        </TabsList>

        {/* Regular Visitors Tab */}
        <TabsContent value="visitors">
          <Card className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regularVisitors.slice(0, 50).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      {v.photo ? (
                        <button onClick={() => setPhotoPreview(v.photo!)} className="w-8 h-8 rounded-full overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all">
                          <img src={v.photo} alt={v.name} className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Camera className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.sex}</TableCell>
                    <TableCell>{v.sectorClassification}</TableCell>
                    <TableCell>{v.service}</TableCell>
                    <TableCell>{v.purpose}</TableCell>
                    <TableCell className="text-sm">{v.contactNumber}</TableCell>
                    <TableCell>{v.date}</TableCell>
                    <TableCell>{v.time}</TableCell>
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
                              Under the Data Privacy Act of 2012, data subjects have the right to request deletion of their personal data. This will permanently delete the record for <strong>{v.name}</strong> including any captured photo. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteVisitor(v.id, v.name)}
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
            {regularVisitors.length > 50 && (
              <p className="text-xs text-muted-foreground text-center py-3">
                Showing 50 of {regularVisitors.length} records
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Incoming Letters Tab */}
        <TabsContent value="letters">
          <Card className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received/Processed By</TableHead>
                  <TableHead>Scan Link</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingLetters.slice(0, 50).map((v, i) => (
                  <TableRow key={v.id}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>{v.date}</TableCell>
                    <TableCell className="font-medium">{v.letterFrom}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{v.letterSubject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {v.letterProject === 'Other' ? v.letterProjectOther : v.letterProject}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={v.letterStatus || 'Received'}
                        onValueChange={(val) => handleStatusChange(v.id, val)}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LETTER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-xs font-medium", v.letterReceivedBy ? "text-foreground" : "text-muted-foreground italic")}>
                        {v.letterReceivedBy || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ScanLinkCell
                        value={v.letterScanLink || ''}
                        onSave={(link) => handleScanLinkSave(v.id, link)}
                      />
                    </TableCell>
                    <TableCell>{v.name}</TableCell>
                    <TableCell className="text-sm">{v.contactNumber}</TableCell>
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
                              This will permanently delete the incoming letter record from <strong>{v.letterFrom}</strong> regarding "{v.letterSubject}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteVisitor(v.id, v.name)}
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
            {incomingLetters.length > 50 && (
              <p className="text-xs text-muted-foreground text-center py-3">
                Showing 50 of {incomingLetters.length} records
              </p>
            )}
            {incomingLetters.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Mail className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">No incoming letters found</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Photo Preview Dialog */}
      <Dialog open={!!photoPreview} onOpenChange={() => setPhotoPreview(null)}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Visitor Photo</DialogTitle>
          {photoPreview && (
            <img src={photoPreview} alt="Visitor" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitorLogsPage;
