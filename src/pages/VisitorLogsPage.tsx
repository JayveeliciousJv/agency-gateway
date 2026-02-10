import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search } from 'lucide-react';

const VisitorLogsPage = () => {
  const visitors = useAppStore((s) => s.visitors);
  const [search, setSearch] = useState('');

  const filtered = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.service.toLowerCase().includes(search.toLowerCase())
  );

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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 30).map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell>{v.service}</TableCell>
                <TableCell>{v.purpose}</TableCell>
                <TableCell className="text-sm">{v.contactNumber}</TableCell>
                <TableCell>{v.date}</TableCell>
                <TableCell>{v.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default VisitorLogsPage;
