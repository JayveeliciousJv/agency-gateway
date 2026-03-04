import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users, ClipboardList, Star, TrendingUp, Clock, AlertTriangle, ArrowUpDown,
  RotateCcw, CalendarIcon, Filter, X, ChevronDown, LayoutDashboard, Inbox,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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

const DashboardPage = () => {
  const visitors = useAppStore((s) => s.visitors);
  const surveys = useAppStore((s) => s.surveys);
  const services = useAppStore((s) => s.services);
  const profile = useAppStore((s) => s.profile);
  const navigate = useNavigate();

  // Filter state
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date | undefined>(endOfMonth(new Date()));
  const [filterService, setFilterService] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [filterSex, setFilterSex] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [drillService, setDrillService] = useState<string | null>(null);

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
    setDatePreset('this_month'); setDateFrom(startOfMonth(now)); setDateTo(endOfMonth(now));
    setFilterService('all'); setFilterSector('all'); setFilterSex('all');
    setAdvancedOpen(false); setDrillService(null);
    setAppliedFilters({ datePreset: 'this_month', dateFrom: startOfMonth(now), dateTo: endOfMonth(now), service: 'all', sector: 'all', sex: 'all' });
  };

  const removeFilter = (key: string) => {
    const updated = { ...appliedFilters };
    if (key === 'service') { updated.service = 'all'; setFilterService('all'); }
    if (key === 'sector') { updated.sector = 'all'; setFilterSector('all'); }
    if (key === 'sex') { updated.sex = 'all'; setFilterSex('all'); }
    if (key === 'date') { updated.datePreset = 'all'; updated.dateFrom = undefined; updated.dateTo = undefined; setDatePreset('all'); setDateFrom(undefined); setDateTo(undefined); }
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
    if (drillService) chips.push({ key: 'drill', label: `Drill: ${drillService}` });
    return chips;
  }, [appliedFilters, drillService]);

  // Filtered data
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const d = new Date(v.date);
      if (appliedFilters.dateFrom && d < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && d > appliedFilters.dateTo) return false;
      if (appliedFilters.service !== 'all' && v.service !== appliedFilters.service) return false;
      if (appliedFilters.sector !== 'all' && v.sectorClassification !== appliedFilters.sector) return false;
      if (appliedFilters.sex !== 'all' && v.sex !== appliedFilters.sex) return false;
      if (drillService && v.service !== drillService) return false;
      return true;
    });
  }, [visitors, appliedFilters, drillService]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const d = new Date(s.date);
      if (appliedFilters.dateFrom && d < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && d > appliedFilters.dateTo) return false;
      if (appliedFilters.service !== 'all' && s.service !== appliedFilters.service) return false;
      if (drillService && s.service !== drillService) return false;
      return true;
    });
  }, [surveys, appliedFilters, drillService]);

  // ── KPIs ──
  const today = new Date().toISOString().split('T')[0];
  const todayVisitors = visitors.filter((v) => v.date === today).length;
  const totalFiltered = filteredVisitors.length;
  const avgSatisfaction = filteredSurveys.length
    ? (filteredSurveys.reduce((a, s) => a + s.overallSatisfaction, 0) / filteredSurveys.length).toFixed(1)
    : '0';
  const satisfiedPct = filteredSurveys.length
    ? Math.round((filteredSurveys.filter((s) => s.overallSatisfaction >= 4).length / filteredSurveys.length) * 100)
    : 0;

  const serviceCountsMap: Record<string, number> = {};
  filteredVisitors.forEach((v) => { serviceCountsMap[v.service] = (serviceCountsMap[v.service] || 0) + 1; });
  const mostAvailed = Object.entries(serviceCountsMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const hourCounts: Record<number, number> = {};
  filteredVisitors.forEach((v) => { const h = parseInt(v.time.split(':')[0]); hourCounts[h] = (hourCounts[h] || 0) + 1; });
  const peakHour = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const peakHourLabel = peakHour ? `${peakHour[0].padStart(2, '0')}:00` : 'N/A';

  const surveyByService: Record<string, number[]> = {};
  filteredSurveys.forEach((s) => { if (!surveyByService[s.service]) surveyByService[s.service] = []; surveyByService[s.service].push(s.overallSatisfaction); });
  const avgByService = Object.entries(surveyByService).map(([name, ratings]) => ({ name, avg: ratings.reduce((a, b) => a + b, 0) / ratings.length }));
  const lowestRated = [...avgByService].sort((a, b) => a.avg - b.avg)[0];

  // Sector distribution
  const sectorCounts: Record<string, number> = {};
  filteredVisitors.forEach((v) => { sectorCounts[v.sectorClassification] = (sectorCounts[v.sectorClassification] || 0) + 1; });
  const sectorData = Object.entries(sectorCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  // Chart data
  const serviceData = Object.entries(serviceCountsMap).map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, fullName: name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const dailyVisits: { date: string; fullDate: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    dailyVisits.push({ date: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }), fullDate: ds, count: filteredVisitors.filter((v) => v.date === ds).length });
  }

  const satDist = [1, 2, 3, 4, 5].map((r) => ({ name: `${r} Star`, count: filteredSurveys.filter((s) => s.overallSatisfaction === r).length }));

  const satTrend: { date: string; avg: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const daySurveys = filteredSurveys.filter((s) => s.date === ds);
    const avg = daySurveys.length ? daySurveys.reduce((a, s) => a + s.overallSatisfaction, 0) / daySurveys.length : 0;
    satTrend.push({ date: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }), avg: Number(avg.toFixed(2)) });
  }

  const satByServiceData = [...avgByService].sort((a, b) => b.avg - a.avg).map((s) => ({ name: s.name.length > 18 ? s.name.slice(0, 18) + '…' : s.name, fullName: s.name, avg: Number(s.avg.toFixed(2)) }));

  const heatmapData: { hour: string; count: number }[] = [];
  for (let h = 7; h <= 18; h++) { heatmapData.push({ hour: `${String(h).padStart(2, '0')}:00`, count: hourCounts[h] || 0 }); }

  // Table sorting
  const [sortField, setSortField] = useState<'date' | 'name' | 'service'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const sortedVisitors = useMemo(() => {
    const sorted = [...filteredVisitors];
    sorted.sort((a, b) => { const va = a[sortField]; const vb = b[sortField]; return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va); });
    return sorted.slice(0, 30);
  }, [filteredVisitors, sortField, sortDir]);
  const toggleSort = (field: typeof sortField) => { if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDir('desc'); } };

  const handleBarClick = (data: any) => {
    if (data?.fullName || data?.activePayload?.[0]?.payload?.fullName) {
      const name = data.fullName || data.activePayload[0].payload.fullName;
      setDrillService(drillService === name ? null : name);
    }
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="w-10 h-10 mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );

  const kpiCards = [
    { label: "Today's Visitors", value: todayVisitors, icon: Users, colorClass: 'border-l-info', iconBg: 'bg-info/10', iconColor: 'text-info', onClick: () => navigate('/admin/reports') },
    { label: 'Filtered Visitors', value: totalFiltered, icon: ClipboardList, colorClass: 'border-l-primary', iconBg: 'bg-primary/10', iconColor: 'text-primary', onClick: () => navigate('/admin/reports') },
    { label: 'Avg Satisfaction', value: `${avgSatisfaction}/5`, icon: Star, colorClass: 'border-l-warning', iconBg: 'bg-warning/10', iconColor: 'text-warning', onClick: () => navigate('/admin/reports') },
    { label: '% Satisfied (≥4★)', value: `${satisfiedPct}%`, icon: TrendingUp, colorClass: 'border-l-success', iconBg: 'bg-success/10', iconColor: 'text-success', onClick: () => navigate('/admin/reports') },
  ];

  const secondaryKpis = [
    { label: 'Most Availed', value: mostAvailed.length > 22 ? mostAvailed.slice(0, 22) + '…' : mostAvailed, icon: TrendingUp, color: 'text-accent' },
    { label: 'Peak Hours', value: peakHourLabel, icon: Clock, color: 'text-warning' },
    { label: 'Lowest Rated', value: lowestRated ? `${lowestRated.name.slice(0, 16)}… (${lowestRated.avg.toFixed(1)})` : 'N/A', icon: AlertTriangle, color: 'text-destructive' },
  ];

  const presetButtons: { key: DatePreset; label: string }[] = [
    { key: 'today', label: 'Today' }, { key: 'this_week', label: 'This Week' },
    { key: 'this_month', label: 'This Month' }, { key: 'last_month', label: 'Last Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">{profile.officeName} — Overview</p>
          </div>
        </div>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div className="sticky top-0 z-20 -mx-1 px-1 pb-4">
        <Card className="border shadow-sm">
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {presetButtons.map((p) => (
                  <Button key={p.key} size="sm" variant={datePreset === p.key ? 'default' : 'outline'} className="h-8 text-xs rounded-full" onClick={() => applyDatePreset(p.key)}>
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

          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3 border-t pt-3">
              <span className="text-xs text-muted-foreground self-center mr-1">Active:</span>
              {activeChips.map((chip) => (
                <Badge key={chip.key} variant="secondary" className="gap-1 text-xs pl-2.5 pr-1.5 py-0.5 rounded-full">
                  {chip.label}
                  <button onClick={() => { if (chip.key === 'drill') setDrillService(null); else removeFilter(chip.key); }} className="ml-0.5 hover:text-destructive transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Primary KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kpiCards.map((k) => (
          <Card key={k.label} className={cn("p-4 border-l-4 cursor-pointer hover:shadow-md transition-shadow", k.colorClass)} onClick={k.onClick}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                <p className="text-2xl font-bold mt-1">{k.value}</p>
              </div>
              <div className={cn("p-2 rounded-lg", k.iconBg)}>
                <k.icon className={cn("w-4 h-4", k.iconColor)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Secondary KPI Strip ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {secondaryKpis.map((k) => (
          <Card key={k.label} className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-muted">
                <k.icon className={cn("w-3.5 h-3.5", k.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className="text-sm font-semibold truncate">{k.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Services Availed</CardTitle>
            <p className="text-xs text-muted-foreground">Click a bar to drill down</p>
          </CardHeader>
          <CardContent>
            {serviceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={serviceData} layout="vertical" margin={{ left: 0 }} onClick={(e) => e?.activePayload && handleBarClick(e)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                    <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-sm"><p className="font-medium">{payload[0].payload.fullName}</p><p className="text-muted-foreground">{payload[0].value} visitors</p></div>
                  ) : null} />
                  <Bar dataKey="count" fill="hsl(200, 80%, 40%)" radius={[0, 4, 4, 0]} cursor="pointer" />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No service data" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Visitor Trend (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyVisits}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                  <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-sm"><p className="font-medium">{payload[0].payload.fullDate}</p><p className="text-muted-foreground">{payload[0].value} visitors</p></div>
                ) : null} />
                <Line type="monotone" dataKey="count" stroke="hsl(220, 60%, 22%)" strokeWidth={2} dot={{ fill: 'hsl(220, 60%, 22%)', r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sector Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {sectorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={2} dataKey="count" nameKey="name">
                    {sectorData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No sector data" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Satisfaction Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {satDist.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={satDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="count">
                    {satDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No survey data" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Satisfaction Trend (QMS)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={satTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                  <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-sm"><p className="font-medium">{payload[0].payload.date}</p><p className="text-muted-foreground">Avg: {payload[0].value}/5</p></div>
                ) : null} />
                <Area type="monotone" dataKey="avg" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Avg Satisfaction per Service</CardTitle>
            <p className="text-xs text-muted-foreground">Click a bar to drill down</p>
          </CardHeader>
          <CardContent>
            {satByServiceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={satByServiceData} layout="vertical" margin={{ left: 0 }} onClick={(e) => e?.activePayload && handleBarClick(e)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                    <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-sm"><p className="font-medium">{payload[0].payload.fullName}</p><p className="text-muted-foreground">Avg: {payload[0].value}/5</p></div>
                  ) : null} />
                  <Bar dataKey="avg" radius={[0, 4, 4, 0]} cursor="pointer">
                    {satByServiceData.map((entry, i) => <Cell key={i} fill={entry.avg >= 4 ? 'hsl(142, 71%, 45%)' : entry.avg >= 3 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 51%)'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No satisfaction data" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Peak Visit Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                  <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-sm"><p className="font-medium">{payload[0].payload.hour}</p><p className="text-muted-foreground">{payload[0].value} visitors</p></div>
                ) : null} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {heatmapData.map((entry, i) => <Cell key={i} fill={entry.count > 5 ? 'hsl(0, 72%, 51%)' : entry.count > 2 ? 'hsl(38, 92%, 50%)' : 'hsl(200, 80%, 40%)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Visitors Table ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Visitors ({filteredVisitors.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedVisitors.length > 0 ? (
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                      <span className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('service')}>
                      <span className="flex items-center gap-1">Service <ArrowUpDown className="w-3 h-3" /></span>
                    </TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('date')}>
                      <span className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></span>
                    </TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedVisitors.map((v) => (
                    <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDrillService(v.service)}>
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
            </div>
          ) : <EmptyState message="No visitor records found" />}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
