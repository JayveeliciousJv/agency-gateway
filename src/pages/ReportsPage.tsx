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
import { Progress } from '@/components/ui/progress';
import {
  FileDown, FileSpreadsheet, RotateCcw, CalendarIcon, Filter, X, ChevronDown,
  Users, ClipboardList, Star, TrendingUp, FileBarChart, Inbox, Mail, UserCheck, ExternalLink,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadialBarChart, RadialBar,
} from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CHART_COLORS = [
  'hsl(220, 60%, 33%)', 'hsl(200, 80%, 40%)', 'hsl(142, 71%, 38%)',
  'hsl(38, 92%, 50%)', 'hsl(270, 60%, 50%)', 'hsl(0, 72%, 51%)',
  'hsl(180, 60%, 38%)', 'hsl(330, 60%, 50%)', 'hsl(30, 80%, 48%)',
  'hsl(160, 60%, 38%)', 'hsl(300, 50%, 50%)',
];

const GENDER_COLORS = ['hsl(210, 80%, 50%)', 'hsl(340, 80%, 55%)', 'hsl(220, 20%, 60%)'];

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

  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(endOfMonth(new Date()));
  const [filterService, setFilterService] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [filterSex, setFilterSex] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    datePreset: 'this_month' as DatePreset,
    dateFrom: startOfMonth(new Date()) as Date | undefined,
    dateTo: endOfMonth(new Date()) as Date | undefined,
    service: 'all', sector: 'all', sex: 'all',
  });

  const applyDatePreset = useCallback((preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    switch (preset) {
      case 'today': setDateFrom(startOfDay(now)); setDateTo(endOfDay(now)); break;
      case 'this_week': setDateFrom(startOfWeek(now, { weekStartsOn: 1 })); setDateTo(endOfWeek(now, { weekStartsOn: 1 })); break;
      case 'this_month': setDateFrom(startOfMonth(now)); setDateTo(endOfMonth(now)); break;
      case 'last_month': setDateFrom(startOfMonth(subMonths(now, 1))); setDateTo(endOfMonth(subMonths(now, 1))); break;
      case 'all': setDateFrom(undefined); setDateTo(undefined); break;
      case 'custom': break;
    }
  }, []);

  const applyFilters = () => {
    setAppliedFilters({ datePreset, dateFrom, dateTo, service: filterService, sector: filterSector, sex: filterSex });
  };

  const resetFilters = () => {
    const now = new Date();
    setDatePreset('this_month');
    setDateFrom(startOfMonth(now));
    setDateTo(endOfMonth(now));
    setFilterService('all');
    setFilterSector('all');
    setFilterSex('all');
    setAdvancedOpen(false);
    setAppliedFilters({ datePreset: 'this_month', dateFrom: startOfMonth(now), dateTo: endOfMonth(now), service: 'all', sector: 'all', sex: 'all' });
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

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (appliedFilters.datePreset !== 'all') {
      const labels: Record<string, string> = { today: 'Today', this_week: 'This Week', this_month: 'This Month', last_month: 'Last Month', custom: 'Custom Range' };
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

  const [letterFilterFrom, setLetterFilterFrom] = useState('all');
  const [letterFilterProject, setLetterFilterProject] = useState('all');
  const [letterFilterStatus, setLetterFilterStatus] = useState('all');
  const [letterFilterProcessor, setLetterFilterProcessor] = useState('all');
  const LETTER_PROJECTS = ['DigiGov', 'ILCDB', 'PNPKI', 'Cybersecurity', 'FreeWifi4All', 'Other'];
  const LETTER_STATUSES = ['Received', 'Processed', 'Pending', 'Forwarded', 'Archived'];

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

  const filteredLetters = useMemo(() => {
    return visitors.filter((v) => {
      if (v.purpose !== 'Incoming Letter') return false;
      const d = new Date(v.date);
      if (appliedFilters.dateFrom && d < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && d > appliedFilters.dateTo) return false;
      if (letterFilterFrom !== 'all' && v.letterFrom !== letterFilterFrom) return false;
      if (letterFilterProject !== 'all' && v.letterProject !== letterFilterProject) return false;
      if (letterFilterStatus !== 'all' && v.letterStatus !== letterFilterStatus) return false;
      if (letterFilterProcessor !== 'all' && v.letterReceivedBy !== letterFilterProcessor) return false;
      return true;
    });
  }, [visitors, appliedFilters, letterFilterFrom, letterFilterProject, letterFilterStatus, letterFilterProcessor]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const d = new Date(s.date);
      if (appliedFilters.dateFrom && d < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && d > appliedFilters.dateTo) return false;
      if (appliedFilters.service !== 'all' && s.service !== appliedFilters.service) return false;
      return true;
    });
  }, [surveys, appliedFilters]);

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
    const overallAvg = totalSurveys ? (filteredSurveys.reduce((a, s) => a + s.overallSatisfaction, 0) / totalSurveys).toFixed(2) : 'N/A';
    const overallSatisfied = totalSurveys ? Math.round((filteredSurveys.filter((s) => s.overallSatisfaction >= 4).length / totalSurveys) * 100) : 0;

    const sectorCounts: Record<string, number> = {};
    filteredVisitors.forEach((v) => { sectorCounts[v.sectorClassification] = (sectorCounts[v.sectorClassification] || 0) + 1; });
    const sectorData = Object.entries(sectorCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    const satDist = [1, 2, 3, 4, 5].map((r) => ({ name: `${r} ★`, count: filteredSurveys.filter((s) => s.overallSatisfaction === r).length }));

    return { serviceRows, totalVisitors, totalSurveys, overallAvg, overallSatisfied, sectorData, satDist };
  }, [filteredVisitors, filteredSurveys]);

  // Demographics for a given dataset (sex and sector only)
  const buildDemographics = (data: typeof filteredVisitors) => {
    const total = data.length;
    const male = data.filter(v => v.sex === 'Male').length;
    const female = data.filter(v => v.sex === 'Female').length;
    const pnts = data.filter(v => v.sex === 'Prefer not to say').length;

    const sector: Record<string, number> = {};
    data.forEach((v) => {
      if (v.sectorClassification) sector[v.sectorClassification] = (sector[v.sectorClassification] || 0) + 1;
    });

    return {
      total, male, female, pnts,
      sexData: [
        { name: 'Male', value: male },
        { name: 'Female', value: female },
        { name: 'Prefer not to say', value: pnts },
      ].filter(d => d.value > 0),
      sectorData: Object.entries(sector).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    };
  };

  const visitorDemographics = useMemo(() => buildDemographics(filteredVisitors), [filteredVisitors]);

  const pct = (count: number, total: number) => total ? Math.round((count / total) * 100) : 0;

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
  const exportPDF = async (type: 'visitors' | 'surveys' | 'summary' | 'letters') => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const {
      drawHeader, drawTable, drawTableWithPhotos, drawSummaryMetrics, drawDemographics,
      drawBarChart, drawPieChart, drawFooter, addSectionPage, addVisualizationPage,
      calculateExtendedDemographics, drawExtendedDemographicsPage,
    } = await import('@/lib/pdf-report');

    const doc = new jsPDF({ orientation: type === 'surveys' || type === 'letters' || type === 'visitors' ? 'landscape' : 'portrait' });
    const titleMap: Record<string, string> = {
      visitors: 'Visitor Logs Report', surveys: 'Survey Results Report',
      summary: 'Summary Analytics Report', letters: 'Incoming Letters Report',
    };

    let curY = drawHeader({ doc, profile, title: titleMap[type], filterLabel: filterLabel() });

    if (type === 'visitors') {
      const hasPhotos = filteredVisitors.some(v => v.photo);
      if (hasPhotos) {
        curY = drawTableWithPhotos({
          doc, startY: curY,
          head: [['#', 'Photo', 'Name', 'Sex', 'Sector', 'Service', 'Purpose', 'Contact', 'Date']],
          body: filteredVisitors.map((v, i) => [i + 1, '', v.name, v.sex, v.sectorClassification, v.service, v.purpose, v.contactNumber, v.date]),
          photoColumnIndex: 1,
          photos: filteredVisitors.map(v => v.photo),
        });
      } else {
        curY = drawTable({
          doc, startY: curY,
          head: [['#', 'Name', 'Sex', 'Sector', 'Service', 'Purpose', 'Contact', 'Date']],
          body: filteredVisitors.map((v, i) => [i + 1, v.name, v.sex, v.sectorClassification, v.service, v.purpose, v.contactNumber, v.date]),
        });
      }
    } else if (type === 'letters') {
      const hasPhotos = filteredLetters.some(v => v.photo);
      if (hasPhotos) {
        curY = drawTableWithPhotos({
          doc, startY: curY,
          head: [['#', 'Photo', 'Date', 'From', 'Subject', 'Project', 'Status', 'Received By', 'Visitor']],
          body: filteredLetters.map((v, i) => [
            i + 1, '', v.date, v.letterFrom || '', v.letterSubject || '',
            v.letterProject === 'Other' ? `Other: ${v.letterProjectOther}` : (v.letterProject || ''),
            v.letterStatus || '', v.letterReceivedBy || '—', v.name,
          ]),
          photoColumnIndex: 1,
          photos: filteredLetters.map(v => v.photo),
        });
      } else {
        curY = drawTable({
          doc, startY: curY,
          head: [['#', 'Date', 'From', 'Subject', 'Project', 'Status', 'Received/Processed By', 'Scan Link', 'Visitor']],
          body: filteredLetters.map((v, i) => [
            i + 1, v.date, v.letterFrom || '', v.letterSubject || '',
            v.letterProject === 'Other' ? `Other: ${v.letterProjectOther}` : (v.letterProject || ''),
            v.letterStatus || '', v.letterReceivedBy || '—', v.letterScanLink || '—', v.name,
          ]),
        });
      }
    } else if (type === 'surveys') {
      curY = drawTable({
        doc, startY: curY,
        head: [['#', 'Service', 'Responsive', 'Reliable', 'Access', 'Comms', 'Cost', 'Integrity', 'Assurance', 'Outcome', 'Overall', 'Date']],
        body: filteredSurveys.map((s, i) => [
          i + 1, s.service, s.responsiveness, s.reliability, s.accessFacilities,
          s.communication, s.costs, s.integrity, s.assurance, s.outcome, s.overallSatisfaction, s.date,
        ]),
      });
    } else {
      curY = drawTable({
        doc, startY: curY,
        head: [['Service', 'Visitors', 'Surveys', 'Avg Satisfaction', '% Satisfied (>=4 Star)']],
        body: summaryData.serviceRows.map((r) => [r.name, r.visitors, r.surveys, r.avgSatisfaction, r.satisfiedPct]),
      });
      curY = drawSummaryMetrics(doc, curY + 6, [
        { label: 'Total Visitors', value: String(summaryData.totalVisitors) },
        { label: 'Total Surveys', value: String(summaryData.totalSurveys) },
        { label: 'Avg Satisfaction', value: `${summaryData.overallAvg}/5` },
        { label: '% Satisfied (>=4 Star)', value: `${summaryData.overallSatisfied}%` },
      ]);
    }

    // Demographics source data
    let dataForDemographics: typeof filteredVisitors = [];
    if (type === 'visitors' || type === 'summary') dataForDemographics = filteredVisitors;
    else if (type === 'letters') dataForDemographics = filteredLetters as typeof filteredVisitors;
    else if (type === 'surveys') {
      dataForDemographics = filteredSurveys.map(s => visitors.find(v => v.id === s.visitorId)).filter(Boolean) as typeof filteredVisitors;
    }

    const extDemographics = calculateExtendedDemographics(dataForDemographics);

    // Extended Demographics Page
    let demoY = addSectionPage(doc, 'Comprehensive Demographics Report');
    drawExtendedDemographicsPage(doc, demoY, extDemographics);

    // Visualizations Page
    let vizY = addVisualizationPage(doc, profile);

    // Bar chart
    if (type === 'summary' || type === 'surveys') {
      const barData = summaryData.serviceRows.filter(r => r.avgSatisfaction !== 'N/A')
        .map(r => ({ label: r.name, value: parseFloat(String(r.avgSatisfaction)) }));
      if (barData.length > 0) vizY = drawBarChart(doc, vizY, 'Service Satisfaction (Average Rating)', barData);
    } else if (type === 'visitors') {
      const serviceCounts: Record<string, number> = {};
      filteredVisitors.forEach(v => { serviceCounts[v.service] = (serviceCounts[v.service] || 0) + 1; });
      const barData = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({ label, value }));
      if (barData.length > 0) vizY = drawBarChart(doc, vizY, 'Visitors by Service', barData);
    } else if (type === 'letters') {
      const statusCounts: Record<string, number> = {};
      filteredLetters.forEach(v => { statusCounts[v.letterStatus || 'Unknown'] = (statusCounts[v.letterStatus || 'Unknown'] || 0) + 1; });
      const barData = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));
      if (barData.length > 0) vizY = drawBarChart(doc, vizY, 'Letters by Status', barData);
    }

    // Gender pie chart
    const PIE_COLORS: [number, number, number][] = [[59, 130, 246], [234, 100, 120], [156, 163, 175]];
    vizY = drawPieChart(doc, vizY + 6, 'Gender Distribution', [
      { label: 'Male', value: extDemographics.sex.male, color: PIE_COLORS[0] },
      { label: 'Female', value: extDemographics.sex.female, color: PIE_COLORS[1] },
      { label: 'Prefer Not to Say', value: extDemographics.sex.preferNotToSay, color: PIE_COLORS[2] },
    ]);

    drawFooter(doc, profile);
    doc.save(`${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF downloaded');
    addAuditLog({ userId: currentUser?.id || '', userName: currentUser?.fullName || '', action: 'Export PDF', details: `Exported ${type} report as PDF` });
  };

  // ── Export Excel ──
  const exportExcel = async (type: 'visitors' | 'surveys' | 'summary' | 'letters') => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    let dataForSummary: any[] = [];
    if (type === 'visitors' || type === 'summary') dataForSummary = filteredVisitors;
    else if (type === 'letters') dataForSummary = filteredLetters;
    else if (type === 'surveys') {
      dataForSummary = filteredSurveys.map(s => visitors.find(v => v.id === s.visitorId)).filter(Boolean);
    }

    const totalCount = dataForSummary.length;
    const maleCount = dataForSummary.filter(v => v?.sex === 'Male').length;
    const femaleCount = dataForSummary.filter(v => v?.sex === 'Female').length;
    const preferNotToSayCount = dataForSummary.filter(v => v?.sex === 'Prefer not to say').length;

    // Sector
    const sectors: Record<string, number> = {};
    dataForSummary.forEach(v => { if (v?.sectorClassification) sectors[v.sectorClassification] = (sectors[v.sectorClassification] || 0) + 1; });

    const addDemographicsSheet = () => {
      const demoData: any[] = [
        { Metric: 'Total Overall Number of Visitors/Respondents', Count: totalCount, Percentage: '100%' },
        { Metric: '', Count: '', Percentage: '' },
        { Metric: '--- SEX ---', Count: '', Percentage: '' },
        { Metric: 'Total Number of Male', Count: maleCount, Percentage: `${pct(maleCount, totalCount)}%` },
        { Metric: 'Total Number of Female', Count: femaleCount, Percentage: `${pct(femaleCount, totalCount)}%` },
        { Metric: 'Total Number of Prefer Not to Say', Count: preferNotToSayCount, Percentage: `${pct(preferNotToSayCount, totalCount)}%` },
        { Metric: '', Count: '', Percentage: '' },
        { Metric: '--- SECTOR CLASSIFICATION ---', Count: '', Percentage: '' },
        ...Object.entries(sectors).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ Metric: k, Count: v, Percentage: `${pct(v, totalCount)}%` })),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(demoData), 'Demographics Summary');
    };

    if (type === 'visitors' || type === 'summary') {
      const visitorRows = filteredVisitors.map((v, i) => ({
        '#': i + 1, Name: v.name, Sex: v.sex, Sector: v.sectorClassification,
        Service: v.service, Purpose: v.purpose, Contact: v.contactNumber, Email: v.email,
        'Has Photo': v.photo ? 'Yes' : 'No', Date: v.date, Time: v.time,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(visitorRows), 'Visitors');
    }

    if (type === 'letters') {
      const letterRows = filteredLetters.map((v, i) => ({
        '#': i + 1, Date: v.date, From: v.letterFrom || '', Subject: v.letterSubject || '',
        Project: v.letterProject === 'Other' ? `Other: ${v.letterProjectOther}` : (v.letterProject || ''),
        Status: v.letterStatus || '', 'Received/Processed By': v.letterReceivedBy || '—',
        'Scan Link': v.letterScanLink || '—', Visitor: v.name, Contact: v.contactNumber,
        'Has Photo': v.photo ? 'Yes' : 'No',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(letterRows), 'Incoming Letters');
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

    addDemographicsSheet();
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

  // ── Demographics Panel (Sex + Sector only) ──
  const DemographicsPanel = ({ data }: { data: ReturnType<typeof buildDemographics> }) => {
    return (
      <div className="space-y-6 mt-6">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Demographic Analysis</h2>
          <Badge variant="secondary">{data.total} total</Badge>
        </div>

        {/* Sex + Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 border-l-4 border-l-primary">
            <p className="text-xs text-muted-foreground font-medium">Total</p>
            <p className="text-2xl font-bold text-primary mt-1">{data.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Visitors / Respondents</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs text-muted-foreground font-medium">Male</p>
            <p className="text-2xl font-bold mt-1">{data.male}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{pct(data.male, data.total)}% of total</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-pink-500">
            <p className="text-xs text-muted-foreground font-medium">Female</p>
            <p className="text-2xl font-bold mt-1">{data.female}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{pct(data.female, data.total)}% of total</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-muted-foreground">
            <p className="text-xs text-muted-foreground font-medium">Prefer Not to Say</p>
            <p className="text-2xl font-bold mt-1">{data.pnts}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{pct(data.pnts, data.total)}% of total</p>
          </Card>
        </div>

        {/* Charts: Sex + Sector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sex Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" /> Sex Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.sexData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.sexData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name">
                      {data.sexData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} (${pct(value, data.total)}%)`, '']} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No sex data" />}
              <div className="mt-2 space-y-1.5">
                {data.sexData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: GENDER_COLORS[i] }} />
                    <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                    <span className="text-xs font-semibold">{item.value}</span>
                    <span className="text-xs text-muted-foreground w-8 text-right">{pct(item.value, data.total)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sector Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Sector Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.sectorData.length > 0 ? (
                <div className="space-y-2 mt-1">
                  {data.sectorData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground flex-1 truncate">{item.name}</span>
                      <Progress value={pct(item.value, data.total)} className="w-20 h-1.5" />
                      <span className="text-xs font-semibold w-6 text-right">{item.value}</span>
                      <span className="text-xs text-muted-foreground w-8 text-right">{pct(item.value, data.total)}%</span>
                    </div>
                  ))}
                </div>
              ) : <EmptyState message="No sector data" />}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

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
                    <Button size="sm" variant={datePreset === 'custom' ? 'default' : 'outline'} className="h-8 text-xs rounded-full">
                      {datePreset === 'custom' && dateFrom && dateTo ? `${format(dateFrom, 'MMM d')} – ${format(dateTo, 'MMM d')}` : 'Custom Range'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 flex" align="start">
                    <div className="border-r p-2">
                      <p className="text-xs font-medium text-muted-foreground px-2 mb-1">From</p>
                      <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setDatePreset('custom'); }} className={cn("p-2 pointer-events-auto")} />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-muted-foreground px-2 mb-1">To</p>
                      <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setDatePreset('custom'); }} className={cn("p-2 pointer-events-auto")} />
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
            <div className="p-2 rounded-lg bg-info/10"><Users className="w-4 h-4 text-info" /></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Surveys</p>
              <p className="text-2xl font-bold mt-1">{summaryData.totalSurveys}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10"><ClipboardList className="w-4 h-4 text-primary" /></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-warning">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Avg Satisfaction</p>
              <p className="text-2xl font-bold mt-1">{summaryData.overallAvg}<span className="text-sm font-normal text-muted-foreground">/5</span></p>
            </div>
            <div className="p-2 rounded-lg bg-warning/10"><Star className="w-4 h-4 text-warning" /></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">% Satisfied (≥4★)</p>
              <p className="text-2xl font-bold mt-1">{summaryData.overallSatisfied}<span className="text-sm font-normal text-muted-foreground">%</span></p>
            </div>
            <div className="p-2 rounded-lg bg-success/10"><TrendingUp className="w-4 h-4 text-success" /></div>
          </div>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-11">
          <TabsTrigger value="summary" className="text-xs sm:text-sm">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" /> Summary
          </TabsTrigger>
          <TabsTrigger value="visitors" className="text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" /> Visitors ({filteredVisitors.length})
          </TabsTrigger>
          <TabsTrigger value="surveys" className="text-xs sm:text-sm">
            <ClipboardList className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" /> Surveys ({filteredSurveys.length})
          </TabsTrigger>
          <TabsTrigger value="letters" className="text-xs sm:text-sm">
            <Mail className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" /> Letters ({filteredLetters.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Summary Tab ── */}
        <TabsContent value="summary" className="space-y-6">
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

          <DemographicsPanel data={visitorDemographics} />
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

          <DemographicsPanel data={visitorDemographics} />
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

          <DemographicsPanel
            data={buildDemographics(filteredSurveys.map(s => visitors.find(v => v.id === s.visitorId)).filter(Boolean) as typeof filteredVisitors)}
          />
        </TabsContent>

        {/* ── Incoming Letters Tab ── */}
        <TabsContent value="letters">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">Incoming Letters</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportPDF('letters')} className="gap-1.5 h-8 text-xs">
                  <FileDown className="w-3.5 h-3.5" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportExcel('letters')} className="gap-1.5 h-8 text-xs">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Letter-specific filters */}
              <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/30 border">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From (Agency/LGU)</Label>
                  <Select value={letterFilterFrom} onValueChange={setLetterFilterFrom}>
                    <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {[...new Set(visitors.filter(v => v.purpose === 'Incoming Letter' && v.letterFrom).map(v => v.letterFrom!))].map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Project</Label>
                  <Select value={letterFilterProject} onValueChange={setLetterFilterProject}>
                    <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {LETTER_PROJECTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={letterFilterStatus} onValueChange={setLetterFilterStatus}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {LETTER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Received/Processed By</Label>
                  <Select value={letterFilterProcessor} onValueChange={setLetterFilterProcessor}>
                    <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Processors</SelectItem>
                      {[...new Set(visitors.filter(v => v.purpose === 'Incoming Letter' && v.letterReceivedBy).map(v => v.letterReceivedBy!))].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredLetters.length > 0 ? (
                <div className="overflow-auto max-h-[480px]">
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
                        <TableHead>Scan Link</TableHead>
                        <TableHead>Visitor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLetters.slice(0, 50).map((v, i) => (
                        <TableRow key={v.id}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell>{v.date}</TableCell>
                          <TableCell className="font-medium">{v.letterFrom}</TableCell>
                          <TableCell>{v.letterSubject}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {v.letterProject === 'Other' ? v.letterProjectOther : v.letterProject}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn("text-xs", {
                                'bg-success/10 text-success': v.letterStatus === 'Processed',
                                'bg-warning/10 text-warning': v.letterStatus === 'Pending',
                                'bg-info/10 text-info': v.letterStatus === 'Received',
                                'bg-primary/10 text-primary': v.letterStatus === 'Forwarded',
                                'bg-muted text-muted-foreground': v.letterStatus === 'Archived',
                              })}
                            >
                              {v.letterStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium">{v.letterReceivedBy || '—'}</TableCell>
                          <TableCell>
                            {v.letterScanLink ? (
                              <a href={v.letterScanLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" /> View Scan
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No link</span>
                            )}
                          </TableCell>
                          <TableCell>{v.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredLetters.length > 50 && (
                    <p className="text-xs text-muted-foreground mt-3 text-center py-2">
                      Showing 50 of {filteredLetters.length} records
                    </p>
                  )}
                </div>
              ) : <EmptyState message="No incoming letter records found" />}
            </CardContent>
          </Card>

          {/* Letter Visualizations */}
          {filteredLetters.length > 0 && (() => {
            const statusCounts: Record<string, number> = {};
            const projectCounts: Record<string, number> = {};
            const processorCounts: Record<string, number> = {};
            const monthlyData: Record<string, number> = {};
            const scanLinkCount = filteredLetters.filter(v => v.letterScanLink).length;
            const noScanLinkCount = filteredLetters.length - scanLinkCount;

            filteredLetters.forEach(v => {
              statusCounts[v.letterStatus || 'Unknown'] = (statusCounts[v.letterStatus || 'Unknown'] || 0) + 1;
              const proj = v.letterProject === 'Other' ? 'Other' : (v.letterProject || 'Unassigned');
              projectCounts[proj] = (projectCounts[proj] || 0) + 1;
              if (v.letterReceivedBy) processorCounts[v.letterReceivedBy] = (processorCounts[v.letterReceivedBy] || 0) + 1;
              const monthKey = v.date ? format(new Date(v.date), 'MMM yyyy') : 'Unknown';
              monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
            });

            const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
            const projectData = Object.entries(projectCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
            const processorData = Object.entries(processorCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
            const timelineData = Object.entries(monthlyData).map(([name, count]) => ({ name, count }));
            const scanData = [{ name: 'With Scan', value: scanLinkCount }, { name: 'Without Scan', value: noScanLinkCount }].filter(d => d.value > 0);

            const STATUS_COLORS: Record<string, string> = {
              'Received': 'hsl(200, 80%, 50%)',
              'Processed': 'hsl(142, 71%, 38%)',
              'Pending': 'hsl(38, 92%, 50%)',
              'Forwarded': 'hsl(220, 60%, 50%)',
              'Archived': 'hsl(220, 15%, 55%)',
              'Unknown': 'hsl(220, 15%, 70%)',
            };

            return (
              <div className="space-y-6 mt-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Letter Analytics</h2>
                  <Badge variant="secondary">{filteredLetters.length} letters</Badge>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="p-4 border-l-4 border-l-primary">
                    <p className="text-xs text-muted-foreground font-medium">Total Letters</p>
                    <p className="text-2xl font-bold text-primary mt-1">{filteredLetters.length}</p>
                  </Card>
                  <Card className="p-4 border-l-4 border-l-success">
                    <p className="text-xs text-muted-foreground font-medium">Processed</p>
                    <p className="text-2xl font-bold mt-1">{statusCounts['Processed'] || 0}</p>
                    <p className="text-xs text-muted-foreground">{pct(statusCounts['Processed'] || 0, filteredLetters.length)}%</p>
                  </Card>
                  <Card className="p-4 border-l-4 border-l-warning">
                    <p className="text-xs text-muted-foreground font-medium">Pending</p>
                    <p className="text-2xl font-bold mt-1">{statusCounts['Pending'] || 0}</p>
                    <p className="text-xs text-muted-foreground">{pct(statusCounts['Pending'] || 0, filteredLetters.length)}%</p>
                  </Card>
                  <Card className="p-4 border-l-4 border-l-info">
                    <p className="text-xs text-muted-foreground font-medium">With Scan Link</p>
                    <p className="text-2xl font-bold mt-1">{scanLinkCount}</p>
                    <p className="text-xs text-muted-foreground">{pct(scanLinkCount, filteredLetters.length)}%</p>
                  </Card>
                </div>

                {/* Charts Row 1: Status Pie + Project Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                            {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || CHART_COLORS[0]} />)}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value} (${pct(value, filteredLetters.length)}%)`, '']} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">Letters by Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={projectData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {projectData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 2: Timeline Area + Scan Link Donut */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {timelineData.length > 1 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Letters Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                          <AreaChart data={timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke="hsl(220, 60%, 33%)" fill="hsl(220, 60%, 33%)" fillOpacity={0.2} strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">Scan Link Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={scanData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="name">
                            <Cell fill="hsl(142, 71%, 38%)" />
                            <Cell fill="hsl(220, 15%, 75%)" />
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value} (${pct(value, filteredLetters.length)}%)`, '']} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Processor workload */}
                  {processorData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Top Processors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mt-1">
                          {processorData.slice(0, 8).map((item, i) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="text-xs text-muted-foreground flex-1 truncate">{item.name}</span>
                              <Progress value={pct(item.value, filteredLetters.length)} className="w-24 h-1.5" />
                              <span className="text-xs font-semibold w-6 text-right">{item.value}</span>
                              <span className="text-xs text-muted-foreground w-8 text-right">{pct(item.value, filteredLetters.length)}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
