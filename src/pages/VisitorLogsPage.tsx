import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Search, Users, Mail, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const LETTER_STATUSES = ['Received', 'Processed', 'Pending', 'Forwarded', 'Archived'] as const;

const VisitorLogsPage = () => {
  const visitors = useAppStore((s) => s.visitors);
  const updateVisitor = useAppStore((s) => s.updateVisitor);
  const currentUser = useAppStore((s) => s.currentUser);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visitor Logs</h1>
          <p className="text-sm text-muted-foreground">{visitors.length} total records</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
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
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regularVisitors.slice(0, 50).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.sex}</TableCell>
                    <TableCell>{v.sectorClassification}</TableCell>
                    <TableCell>{v.service}</TableCell>
                    <TableCell>{v.purpose}</TableCell>
                    <TableCell className="text-sm">{v.contactNumber}</TableCell>
                    <TableCell>{v.date}</TableCell>
                    <TableCell>{v.time}</TableCell>
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
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received/Processed By</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Contact</TableHead>
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
                    <TableCell>{v.name}</TableCell>
                    <TableCell className="text-sm">{v.contactNumber}</TableCell>
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
    </div>
  );
};

export default VisitorLogsPage;
