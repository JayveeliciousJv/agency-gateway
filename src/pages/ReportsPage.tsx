import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ReportsPage = () => {
  const visitors = useAppStore((s) => s.visitors);
  const surveys = useAppStore((s) => s.surveys);
  const services = useAppStore((s) => s.services);
  const profile = useAppStore((s) => s.profile);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [filterService, setFilterService] = useState('all');
  const [filterMonth, setFilterMonth] = useState(String(currentMonth));
  const [filterYear, setFilterYear] = useState(String(currentYear));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const resetFilters = () => {
    setFilterService('all');
    setFilterMonth(String(currentMonth));
    setFilterYear(String(currentYear));
    setDateFrom('');
    setDateTo('');
  };

  const years = Array.from(new Set(visitors.map((v) => new Date(v.date).getFullYear()))).sort((a, b) => b - a);

  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const d = new Date(v.date);
      if (filterYear !== 'all' && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth !== 'all' && d.getMonth() !== Number(filterMonth)) return false;
      if (filterService !== 'all' && v.service !== filterService) return false;
      if (dateFrom && v.date < dateFrom) return false;
      if (dateTo && v.date > dateTo) return false;
      return true;
    });
  }, [visitors, filterService, filterMonth, filterYear, dateFrom, dateTo]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const d = new Date(s.date);
      if (filterYear !== 'all' && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth !== 'all' && d.getMonth() !== Number(filterMonth)) return false;
      if (filterService !== 'all' && s.service !== filterService) return false;
      if (dateFrom && s.date < dateFrom) return false;
      if (dateTo && s.date > dateTo) return false;
      return true;
    });
  }, [surveys, filterService, filterMonth, filterYear, dateFrom, dateTo]);

  // Summary data
  const summaryData = useMemo(() => {
    const serviceCountsMap: Record<string, number> = {};
    filteredVisitors.forEach((v) => { serviceCountsMap[v.service] = (serviceCountsMap[v.service] || 0) + 1; });

    const surveyByService: Record<string, number[]> = {};
    filteredSurveys.forEach((s) => {
      if (!surveyByService[s.service]) surveyByService[s.service] = [];
      surveyByService[s.service].push(s.overallSatisfaction);
    });

    const serviceRows = Object.keys({ ...serviceCountsMap, ...surveyByService }).map((name) => {
      const count = serviceCountsMap[name] || 0;
      const ratings = surveyByService[name] || [];
      const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : 'N/A';
      const satisfied = ratings.length ? Math.round((ratings.filter((r) => r >= 4).length / ratings.length) * 100) : 0;
      return { name, visitors: count, surveys: ratings.length, avgSatisfaction: avg, satisfiedPct: `${satisfied}%` };
    });

    const totalVisitors = filteredVisitors.length;
    const totalSurveys = filteredSurveys.length;
    const overallAvg = totalSurveys
      ? (filteredSurveys.reduce((a, s) => a + s.overallSatisfaction, 0) / totalSurveys).toFixed(2)
      : 'N/A';
    const overallSatisfied = totalSurveys
      ? Math.round((filteredSurveys.filter((s) => s.overallSatisfaction >= 4).length / totalSurveys) * 100)
      : 0;

    return { serviceRows, totalVisitors, totalSurveys, overallAvg, overallSatisfied };
  }, [filteredVisitors, filteredSurveys]);

  const filterLabel = () => {
    const parts: string[] = [];
    if (filterMonth !== 'all') parts.push(MONTHS[Number(filterMonth)]);
    if (filterYear !== 'all') parts.push(filterYear);
    if (filterService !== 'all') parts.push(filterService);
    if (dateFrom) parts.push(`from ${dateFrom}`);
    if (dateTo) parts.push(`to ${dateTo}`);
    return parts.length ? parts.join(', ') : 'All Data';
  };

  // ── Export PDF ──
  const exportPDF = async (type: 'visitors' | 'surveys' | 'summary') => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: type === 'surveys' ? 'landscape' : 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(14);
    doc.text(profile.officeName, pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(profile.agencyName, pageWidth / 2, 21, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Report: ${type === 'visitors' ? 'Visitor Logs' : type === 'surveys' ? 'Survey Results' : 'Summary Analytics'}`, pageWidth / 2, 27, { align: 'center' });
    doc.text(`Filter: ${filterLabel()}`, pageWidth / 2, 32, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString('en-PH')}`, pageWidth / 2, 37, { align: 'center' });

    if (type === 'visitors') {
      autoTable(doc, {
        startY: 42,
        head: [['#', 'Name', 'Service', 'Purpose', 'Contact', 'Date', 'Time']],
        body: filteredVisitors.map((v, i) => [i + 1, v.name, v.service, v.purpose, v.contactNumber, v.date, v.time]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 58, 95] },
      });
    } else if (type === 'surveys') {
      autoTable(doc, {
        startY: 42,
        head: [['#', 'Service', 'Responsive', 'Reliable', 'Access', 'Comms', 'Cost', 'Integrity', 'Assurance', 'Outcome', 'Overall', 'Date']],
        body: filteredSurveys.map((s, i) => [
          i + 1, s.service, s.responsiveness, s.reliability, s.accessFacilities,
          s.communication, s.costs, s.integrity, s.assurance, s.outcome, s.overallSatisfaction, s.date,
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [30, 58, 95] },
      });
    } else {
      // Summary
      autoTable(doc, {
        startY: 42,
        head: [['Service', 'Visitors', 'Surveys', 'Avg Satisfaction', '% Satisfied (≥4★)']],
        body: summaryData.serviceRows.map((r) => [r.name, r.visitors, r.surveys, r.avgSatisfaction, r.satisfiedPct]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 58, 95] },
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 80;
      doc.setFontSize(9);
      doc.text(`Total Visitors: ${summaryData.totalVisitors}`, 14, finalY + 10);
      doc.text(`Total Surveys: ${summaryData.totalSurveys}`, 14, finalY + 16);
      doc.text(`Overall Avg Satisfaction: ${summaryData.overallAvg}/5`, 14, finalY + 22);
      doc.text(`Overall % Satisfied (≥4★): ${summaryData.overallSatisfied}%`, 14, finalY + 28);
    }

    // Footer with signatory
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, h - 8, { align: 'center' });
      if (i === pageCount && profile.reportSignatory) {
        doc.setFontSize(9);
        doc.text(profile.reportSignatory, pageWidth - 14, h - 28, { align: 'right' });
        doc.text(profile.reportSignatoryPosition, pageWidth - 14, h - 23, { align: 'right' });
      }
    }

    doc.save(`${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF downloaded');
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Export PDF', details: `Exported ${type} report as PDF` });
  };

  // ── Export Excel ──
  const exportExcel = async (type: 'visitors' | 'surveys' | 'summary') => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    if (type === 'visitors' || type === 'summary') {
      const visitorRows = filteredVisitors.map((v, i) => ({
        '#': i + 1, Name: v.name, Service: v.service, Purpose: v.purpose,
        Contact: v.contactNumber, Email: v.email, Date: v.date, Time: v.time,
      }));
      const ws = XLSX.utils.json_to_sheet(visitorRows);
      XLSX.utils.book_append_sheet(wb, ws, 'Visitors');
    }

    if (type === 'surveys' || type === 'summary') {
      const surveyRows = filteredSurveys.map((s, i) => ({
        '#': i + 1, Service: s.service, Responsiveness: s.responsiveness, Reliability: s.reliability,
        'Access & Facilities': s.accessFacilities, Communication: s.communication, Costs: s.costs,
        Integrity: s.integrity, Assurance: s.assurance, Outcome: s.outcome,
        'Overall Satisfaction': s.overallSatisfaction, Comment: s.comment, Date: s.date,
      }));
      const ws2 = XLSX.utils.json_to_sheet(surveyRows);
      XLSX.utils.book_append_sheet(wb, ws2, 'Surveys');
    }

    if (type === 'summary') {
      const summaryRows = summaryData.serviceRows.map((r) => ({
        Service: r.name, Visitors: r.visitors, Surveys: r.surveys,
        'Avg Satisfaction': r.avgSatisfaction, '% Satisfied (≥4★)': r.satisfiedPct,
      }));
      summaryRows.push({ Service: 'TOTAL', Visitors: summaryData.totalVisitors, Surveys: summaryData.totalSurveys, 'Avg Satisfaction': summaryData.overallAvg, '% Satisfied (≥4★)': `${summaryData.overallSatisfied}%` });
      const ws3 = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, ws3, 'Summary');
    }

    XLSX.writeFile(wb, `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded');
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Export Excel', details: `Exported ${type} report as Excel` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and download visitor & survey reports</p>
      </div>

      {/* Filter Panel */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Service</Label>
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="w-48 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Month</Label>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Year</Label>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 h-9" />
          </div>
          <Button variant="outline" size="sm" onClick={resetFilters} className="h-9">
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="visitors">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visitors">Visitor Logs ({filteredVisitors.length})</TabsTrigger>
          <TabsTrigger value="surveys">Survey Results ({filteredSurveys.length})</TabsTrigger>
          <TabsTrigger value="summary">Summary Analytics</TabsTrigger>
        </TabsList>

        {/* Visitor Logs Tab */}
        <TabsContent value="visitors">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Visitor Logs Preview</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportPDF('visitors')}>
                  <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportExcel('visitors')}>
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Excel
                </Button>
              </div>
            </div>
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisitors.slice(0, 50).map((v, i) => (
                    <TableRow key={v.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell>{v.service}</TableCell>
                      <TableCell>{v.purpose}</TableCell>
                      <TableCell>{v.contactNumber}</TableCell>
                      <TableCell>{v.date}</TableCell>
                      <TableCell>{v.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredVisitors.length > 50 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">Showing 50 of {filteredVisitors.length} — download for full data</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Survey Results Tab */}
        <TabsContent value="surveys">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Survey Results Preview</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportPDF('surveys')}>
                  <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportExcel('surveys')}>
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Excel
                </Button>
              </div>
            </div>
            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Responsive</TableHead>
                    <TableHead>Reliable</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Comms</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Integrity</TableHead>
                    <TableHead>Assurance</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSurveys.slice(0, 50).map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">{s.service}</TableCell>
                      <TableCell>{s.responsiveness}</TableCell>
                      <TableCell>{s.reliability}</TableCell>
                      <TableCell>{s.accessFacilities}</TableCell>
                      <TableCell>{s.communication}</TableCell>
                      <TableCell>{s.costs}</TableCell>
                      <TableCell>{s.integrity}</TableCell>
                      <TableCell>{s.assurance}</TableCell>
                      <TableCell>{s.outcome}</TableCell>
                      <TableCell className="font-bold">{s.overallSatisfaction}</TableCell>
                      <TableCell>{s.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredSurveys.length > 50 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">Showing 50 of {filteredSurveys.length} — download for full data</p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Summary Analytics</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportPDF('summary')}>
                  <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportExcel('summary')}>
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Excel
                </Button>
              </div>
            </div>

            {/* KPI summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground">Total Visitors</p>
                <p className="text-xl font-bold">{summaryData.totalVisitors}</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground">Total Surveys</p>
                <p className="text-xl font-bold">{summaryData.totalSurveys}</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
                <p className="text-xl font-bold">{summaryData.overallAvg}/5</p>
              </Card>
              <Card className="p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground">% Satisfied (≥4★)</p>
                <p className="text-xl font-bold">{summaryData.overallSatisfied}%</p>
              </Card>
            </div>

            <div className="overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Surveys</TableHead>
                    <TableHead>Avg Satisfaction</TableHead>
                    <TableHead>% Satisfied (≥4★)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summaryData.serviceRows.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.visitors}</TableCell>
                      <TableCell>{r.surveys}</TableCell>
                      <TableCell>{r.avgSatisfaction}</TableCell>
                      <TableCell>{r.satisfiedPct}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
