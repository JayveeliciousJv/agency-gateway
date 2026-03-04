import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  FileDown, FileSpreadsheet, RotateCcw, CalendarIcon, Filter, X, ChevronDown,
  Users, ClipboardList, Star, TrendingUp, FileBarChart, Inbox,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CHART_COLORS = [
  'hsl(200, 80%, 40%)', 'hsl(220, 60%, 22%)', 'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(270, 60%, 50%)',
  'hsl(180, 60%, 40%)', 'hsl(330, 60%, 50%)', 'hsl(30, 80%, 50%)',
  'hsl(160, 60%, 40%)', 'hsl(300, 50%, 50%)',
];

const SECTOR_OPTIONS = [
  'Student', 'Employed/Working', 'Women', 'Person with Disability (PWD)',
  'Senior Citizen', 'Youth', 'Government Employee', 'Private Sector',
  'Indigenous Peoples (IP)', 'Solo Parent', 'Others',
];

type DatePreset = 'today' | 'this_week' | 'this_month' | 'last_month' | 'custom' | 'all';

const ReportsPage = () => {
  const visitors = useAppStore((s) => s.visitors);
  const surveys = useAppStore((s) => s.surveys);
  const services = useAppStore((s) => s.services);
  const profile = useAppStore((s) => s.profile);
  const addAuditLog = useAppStore((s) => s.addAuditLog);
  const currentUser = useAppStore((s) => s.currentUser);

  // Filter state
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(endOfMonth(new Date()));
  const [filterService, setFilterService] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [filterSex, setFilterSex] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Applied filters (only apply on button click)
  const [appliedFilters, setAppliedFilters] = useState({
    datePreset: 'this_month' as DatePreset,
    dateFrom: startOfMonth(new Date()) as Date | undefined,
    dateTo: endOfMonth(new Date()) as Date | undefined,
    service: 'all',
    sector: 'all',
    sex: 'all',
  });

  const applyDatePreset = useCallback((preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    switch (preset) {
      case 'today':
        setDateFrom(startOfDay(now));
        setDateTo(endOfDay(now));
        break;
      case 'this_week':
        setDateFrom(startOfWeek(now, { weekStartsOn: 1 }));
        setDateTo(endOfWeek(now, { weekStartsOn: 1 }));
        break;
      case 'this_month':
        setDateFrom(startOfMonth(now));
        setDateTo(endOfMonth(now));
        break;
      case 'last_month':
        setDateFrom(startOfMonth(subMonths(now, 1)));
        setDateTo(endOfMonth(subMonths(now, 1)));
        break;
      case 'all':
        setDateFrom(undefined);
        setDateTo(undefined);
        break;
      case 'custom':
        break;
    }
  }, []);

  const applyFilters = () => {
    setAppliedFilters({
      datePreset, dateFrom, dateTo,
      service: filterService, sector: filterSector, sex: filterSex,
    });
  };

  const resetFilters = () => {
    setDatePreset('this_month');
    setDateFrom(startOfMonth(new Date()));
    setDateTo(endOfMonth(new Date()));
    setFilterService('all');
    setFilterSector('all');
    setFilterSex('all');
    setAdvancedOpen(false);
    const now = new Date();
    setAppliedFilters({
      datePreset: 'this_month',
      dateFrom: startOfMonth(now),
      dateTo: endOfMonth(now),
      service: 'all', sector: 'all', sex: 'all',
    });
  };

  const removeFilter = (key: string) => {
    const updated = { ...appliedFilters };
    if (key === 'service') { updated.service = 'all'; setFilterService('all'); }
    if (key === 'sector') { updated.sector = 'all'; setFilterSector('all'); }
    if (key === 'sex') { updated.sex = 'all'; setFilterSex('all'); }
    if (key === 'date') {
      updated.datePreset = 'all'; updated.dateFrom = undefined; updated.dateTo = undefined;
      setDatePreset('all'); setDateFrom(undefined); setDateTo(undefined);
    }
    setAppliedFilters(updated);
  };

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (appliedFilters.datePreset !== 'all') {
      const labels: Record<string, string> = {
        today: 'Today', this_week: 'This Week', this_month: 'This Month',
        last_month: 'Last Month', custom: 'Custom Range',
      };
      const dateLabel = appliedFilters.datePreset === 'custom' && appliedFilters.dateFrom && appliedFilters.dateTo
        ? `${format(appliedFilters.dateFrom, 'MMM d')} – ${format(appliedFilters.dateTo, 'MMM d, yyyy')}`
        : labels[appliedFilters.datePreset] || '';
      chips.push({ key: 'date', label: dateLabel });
    }
    if (appliedFilters.service !== 'all') chips.push({ key: 'service', label: appliedFilters.service });
    if (appliedFilters.sector !== 'all') chips.push({ key: 'sector', label: appliedFilters.sector });
    if (appliedFilters.sex !== 'all') chips.push({ key: 'sex', label: appliedFilters.sex });
    return chips;
  }, [appliedFilters]);

  // Filtered data based on applied filters
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const d = new Date(v.date);
      if (appliedFilters.dateFrom && d < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && d > appliedFilters.dateTo) return false;
      if (appliedFilters.service !== 'all' && v.service !== appliedFilters.service) return false;
      if (appliedFilters.sector !== 'all' && v.sectorClassification !== appliedFilters.sector) return false;
      if (appliedFilters.sex !== 'all' && v.sex !== appliedFilters.sex) return false;
      return true;
    });
  }, [visitors, appliedFilters]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const d = new Date(s.date);
      if (appliedFilters.dateFrom && d < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && d > appliedFilters.dateTo) return false;
      if (appliedFilters.service !== 'all' && s.service !== appliedFilters.service) return false;
      return true;
    });
  }, [surveys, appliedFilters]);

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

    // Sector distribution
    const sectorCounts: Record<string, number> = {};
    filteredVisitors.forEach((v) => { sectorCounts[v.sectorClassification] = (sectorCounts[v.sectorClassification] || 0) + 1; });
    const sectorData = Object.entries(sectorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Satisfaction distribution
    const satDist = [1, 2, 3, 4, 5].map((r) => ({
      name: `${r} Star`,
      count: filteredSurveys.filter((s) => s.overallSatisfaction === r).length,
    }));

    return { serviceRows, totalVisitors, totalSurveys, overallAvg, overallSatisfied, sectorData, satDist };
  }, [filteredVisitors, filteredSurveys]);

  const filterLabel = () => {
    const parts: string[] = [];
    if (appliedFilters.dateFrom) parts.push(`from ${format(appliedFilters.dateFrom, 'yyyy-MM-dd')}`);
    if (appliedFilters.dateTo) parts.push(`to ${format(appliedFilters.dateTo, 'yyyy-MM-dd')}`);
    if (appliedFilters.service !== 'all') parts.push(appliedFilters.service);
    if (appliedFilters.sector !== 'all') parts.push(appliedFilters.sector);
    if (appliedFilters.sex !== 'all') parts.push(appliedFilters.sex);
    return parts.length ? parts.join(', ') : 'All Data';
  };

  // ── Export PDF ──
  const exportPDF = async (type: 'visitors' | 'surveys' | 'summary') => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: type === 'surveys' ? 'landscape' : 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();

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
        head: [['#', 'Name', 'Sex', 'Sector', 'Service', 'Purpose', 'Contact', 'Date', 'Time']],
        body: filteredVisitors.map((v, i) => [i + 1, v.name, v.sex, v.sectorClassification, v.service, v.purpose, v.contactNumber, v.date, v.time]),
        styles: { fontSize: 7 },
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
        '#': i + 1, Name: v.name, Sex: v.sex, Sector: v.sectorClassification, Service: v.service, Purpose: v.purpose,
        Contact: v.contactNumber, Email: v.email, Date: v.date, Time: v.time,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(visitorRows), 'Visitors');
    }

    if (type === 'surveys' || type === 'summary') {
      const surveyRows = filteredSurveys.map((s, i) => ({
        '#': i + 1, Service: s.service, Responsiveness: s.responsiveness, Reliability: s.reliability,
        'Access & Facilities': s.accessFacilities, Communication: s.communication, Costs: s.costs,
        Integrity: s.integrity, Assurance: s.assurance, Outcome: s.outcome,
        'Overall Satisfaction': s.overallSatisfaction, Comment: s.comment, Date: s.date,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(surveyRows), 'Surveys');
    }

    if (type === 'summary') {
      const summaryRows = summaryData.serviceRows.map((r) => ({
        Service: r.name, Visitors: r.visitors, Surveys: r.surveys,
        'Avg Satisfaction': r.avgSatisfaction, '% Satisfied (≥4★)': r.satisfiedPct,
      }));
      summaryRows.push({ Service: 'TOTAL', Visitors: summaryData.totalVisitors, Surveys: summaryData.totalSurveys, 'Avg Satisfaction': summaryData.overallAvg, '% Satisfied (≥4★)': `${summaryData.overallSatisfied}%` });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Summary');
    }

    XLSX.writeFile(wb, `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file downloaded');
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Export Excel', details: `Exported ${type} report as Excel` });
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Inbox className="w-12 h-12 mb-3 opacity-40" />
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs mt-1">Try adjusting your filters or date range</p>
    </div>
  );

  const presetButtons: { key: DatePreset; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileBarChart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground">Generate, filter, and download visitor & survey reports</p>
          </div>
        </div>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div className="sticky top-0 z-20 -mx-1 px-1 pb-4">
        <Card className="border shadow-sm">
          <div className="p-4 space-y-3">
            {/* Date Range Row */}
            <div className="flex flex-wrap items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {presetButtons.map((p) => (
                  <Button
                    key={p.key}
                    size="sm"
                    variant={datePreset === p.key ? 'default' : 'outline'}
                    className="h-8 text-xs rounded-full"
                    onClick={() => applyDatePreset(p.key)}
                  >
                    {p.label}
                  </Button>
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant={datePreset === 'custom' ? 'default' : 'outline'}
                      className="h-8 text-xs rounded-full"
                    >
                      {datePreset === 'custom' && dateFrom && dateTo
                        ? `${format(dateFrom, 'MMM d')} – ${format(dateTo, 'MMM d')}`
                        : 'Custom Range'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 flex" align="start">
                    <div className="border-r p-2">
                      <p className="text-xs font-medium text-muted-foreground px-2 mb-1">From</p>
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={(d) => { setDateFrom(d); setDatePreset('custom'); }}
                        className={cn("p-2 pointer-events-auto")}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-muted-foreground px-2 mb-1">To</p>
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={(d) => { setDateTo(d); setDatePreset('custom'); }}
                        className={cn("p-2 pointer-events-auto")}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={resetFilters}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                </Button>
                <Button size="sm" className="h-8 text-xs" onClick={applyFilters}>
                  <Filter className="w-3.5 h-3.5 mr-1" /> Apply Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", advancedOpen && "rotate-180")} />
                  Advanced Filters
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="flex flex-wrap gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Service</Label>
                    <Select value={filterService} onValueChange={setFilterService}>
                      <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sector</Label>
                    <Select value={filterSector} onValueChange={setFilterSector}>
                      <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sectors</SelectItem>
                        {SECTOR_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sex</Label>
                    <Select value={filterSex} onValueChange={setFilterSex}>
                      <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3 border-t pt-3">
              <span className="text-xs text-muted-foreground self-center mr-1">Active:</span>
              {activeChips.map((chip) => (
                <Badge key={chip.key} variant="secondary" className="gap-1 text-xs pl-2.5 pr-1.5 py-0.5 rounded-full">
                  {chip.label}
                  <button onClick={() => removeFilter(chip.key)} className="ml-0.5 hover:text-destructive transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-l-4 border-l-info">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Visitors</p>
              <p className="text-2xl font-bold mt-1">{summaryData.totalVisitors}</p>
            </div>
            <div className="p-2 rounded-lg bg-info/10">
              <Users className="w-4 h-4 text-info" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Surveys</p>
              <p className="text-2xl font-bold mt-1">{summaryData.totalSurveys}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-warning">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Avg Satisfaction</p>
              <p className="text-2xl font-bold mt-1">{summaryData.overallAvg}<span className="text-sm font-normal text-muted-foreground">/5</span></p>
            </div>
            <div className="p-2 rounded-lg bg-warning/10">
              <Star className="w-4 h-4 text-warning" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">% Satisfied (≥4★)</p>
              <p className="text-2xl font-bold mt-1">{summaryData.overallSatisfied}<span className="text-sm font-normal text-muted-foreground">%</span></p>
            </div>
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-11">
          <TabsTrigger value="summary" className="text-xs sm:text-sm">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="visitors" className="text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Visitors ({filteredVisitors.length})
          </TabsTrigger>
          <TabsTrigger value="surveys" className="text-xs sm:text-sm">
            <ClipboardList className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Surveys ({filteredSurveys.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Summary Tab ── */}
        <TabsContent value="summary" className="space-y-6">
          {/* Export Buttons */}
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => exportPDF('summary')} className="gap-1.5">
              <FileDown className="w-4 h-4" /> Export PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportExcel('summary')} className="gap-1.5">
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </Button>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Sector Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryData.sectorData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={summaryData.sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={2} dataKey="count" nameKey="name">
                        {summaryData.sectorData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState message="No sector data available" />}
              </CardContent>
            </Card>

            {/* Satisfaction Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Satisfaction Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryData.satDist.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={summaryData.satDist}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {summaryData.satDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState message="No survey data available" />}
              </CardContent>
            </Card>
          </div>

          {/* Service Summary Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Service Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryData.serviceRows.length > 0 ? (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead className="text-right">Visitors</TableHead>
                        <TableHead className="text-right">Surveys</TableHead>
                        <TableHead className="text-right">Avg Satisfaction</TableHead>
                        <TableHead className="text-right">% Satisfied (≥4★)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData.serviceRows.map((r) => (
                        <TableRow key={r.name}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell className="text-right">{r.visitors}</TableCell>
                          <TableCell className="text-right">{r.surveys}</TableCell>
                          <TableCell className="text-right">{r.avgSatisfaction}</TableCell>
                          <TableCell className="text-right">{r.satisfiedPct}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/30">
                        <TableCell>TOTAL</TableCell>
                        <TableCell className="text-right">{summaryData.totalVisitors}</TableCell>
                        <TableCell className="text-right">{summaryData.totalSurveys}</TableCell>
                        <TableCell className="text-right">{summaryData.overallAvg}</TableCell>
                        <TableCell className="text-right">{summaryData.overallSatisfied}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : <EmptyState message="No data available for the selected filters" />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Visitor Logs Tab ── */}
        <TabsContent value="visitors">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Visitor Logs</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportPDF('visitors')} className="gap-1.5 h-8 text-xs">
                  <FileDown className="w-3.5 h-3.5" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportExcel('visitors')} className="gap-1.5 h-8 text-xs">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredVisitors.length > 0 ? (
                <div className="overflow-auto max-h-[480px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
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
                      {filteredVisitors.slice(0, 50).map((v, i) => (
                        <TableRow key={v.id}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
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
                  {filteredVisitors.length > 50 && (
                    <p className="text-xs text-muted-foreground mt-3 text-center py-2">
                      Showing 50 of {filteredVisitors.length} records — download for full data
                    </p>
                  )}
                </div>
              ) : <EmptyState message="No visitor records found" />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Survey Results Tab ── */}
        <TabsContent value="surveys">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Survey Results</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportPDF('surveys')} className="gap-1.5 h-8 text-xs">
                  <FileDown className="w-3.5 h-3.5" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportExcel('surveys')} className="gap-1.5 h-8 text-xs">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSurveys.length > 0 ? (
                <div className="overflow-auto max-h-[480px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
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
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
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
                    <p className="text-xs text-muted-foreground mt-3 text-center py-2">
                      Showing 50 of {filteredSurveys.length} records — download for full data
                    </p>
                  )}
                </div>
              ) : <EmptyState message="No survey records found" />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
