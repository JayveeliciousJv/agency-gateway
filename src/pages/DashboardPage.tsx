import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users, ClipboardList, Star, TrendingUp, Clock, AlertTriangle, ArrowUpDown, RotateCcw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

const CHART_COLORS = [
  'hsl(200, 80%, 40%)', 'hsl(220, 60%, 22%)', 'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(270, 60%, 50%)',
  'hsl(180, 60%, 40%)', 'hsl(330, 60%, 50%)',
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DashboardPage = () => {
  const visitors = useAppStore((s) => s.visitors);
  const surveys = useAppStore((s) => s.surveys);
  const services = useAppStore((s) => s.services);
  const profile = useAppStore((s) => s.profile);
  const currentUser = useAppStore((s) => s.currentUser);

  // ── Filters ──
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [filterService, setFilterService] = useState('all');
  const [filterMonth, setFilterMonth] = useState(String(currentMonth));
  const [filterYear, setFilterYear] = useState(String(currentYear));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Drill-down state
  const [drillService, setDrillService] = useState<string | null>(null);

  const resetFilters = () => {
    setFilterService('all');
    setFilterMonth(String(currentMonth));
    setFilterYear(String(currentYear));
    setDateFrom('');
    setDateTo('');
    setDrillService(null);
  };

  // ── Filtered data ──
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const d = new Date(v.date);
      if (filterYear !== 'all' && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth !== 'all' && d.getMonth() !== Number(filterMonth)) return false;
      if (filterService !== 'all' && v.service !== filterService) return false;
      if (dateFrom && v.date < dateFrom) return false;
      if (dateTo && v.date > dateTo) return false;
      if (drillService && v.service !== drillService) return false;
      return true;
    });
  }, [visitors, filterService, filterMonth, filterYear, dateFrom, dateTo, drillService]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const d = new Date(s.date);
      if (filterYear !== 'all' && d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth !== 'all' && d.getMonth() !== Number(filterMonth)) return false;
      if (filterService !== 'all' && s.service !== filterService) return false;
      if (dateFrom && s.date < dateFrom) return false;
      if (dateTo && s.date > dateTo) return false;
      if (drillService && s.service !== drillService) return false;
      return true;
    });
  }, [surveys, filterService, filterMonth, filterYear, dateFrom, dateTo, drillService]);

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

  // Most availed service
  const serviceCountsMap: Record<string, number> = {};
  filteredVisitors.forEach((v) => { serviceCountsMap[v.service] = (serviceCountsMap[v.service] || 0) + 1; });
  const mostAvailed = Object.entries(serviceCountsMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Peak hours
  const hourCounts: Record<number, number> = {};
  filteredVisitors.forEach((v) => {
    const h = parseInt(v.time.split(':')[0]);
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  });
  const peakHour = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const peakHourLabel = peakHour ? `${peakHour[0].padStart(2, '0')}:00` : 'N/A';

  // Lowest rated service
  const surveyByService: Record<string, number[]> = {};
  filteredSurveys.forEach((s) => {
    if (!surveyByService[s.service]) surveyByService[s.service] = [];
    surveyByService[s.service].push(s.overallSatisfaction);
  });
  const avgByService = Object.entries(surveyByService).map(([name, ratings]) => ({
    name, avg: ratings.reduce((a, b) => a + b, 0) / ratings.length,
  }));
  const lowestRated = avgByService.sort((a, b) => a.avg - b.avg)[0];

  const stats = [
    { label: "Today's Visitors", value: todayVisitors, icon: Users, color: 'text-info' },
    { label: 'Filtered Visitors', value: totalFiltered, icon: ClipboardList, color: 'text-primary' },
    { label: 'Most Availed', value: mostAvailed.length > 18 ? mostAvailed.slice(0, 18) + '…' : mostAvailed, icon: TrendingUp, color: 'text-success', small: true },
    { label: 'Peak Hours', value: peakHourLabel, icon: Clock, color: 'text-warning' },
    { label: 'Avg. Satisfaction', value: `${avgSatisfaction}/5`, icon: Star, color: 'text-warning' },
    { label: '% Satisfied (≥4★)', value: `${satisfiedPct}%`, icon: TrendingUp, color: 'text-success' },
    { label: 'Lowest Rated', value: lowestRated ? `${lowestRated.name.slice(0, 14)}… (${lowestRated.avg.toFixed(1)})` : 'N/A', icon: AlertTriangle, color: 'text-destructive', small: true },
  ];

  // ── Chart Data ──

  // Service bar chart
  const serviceData = Object.entries(serviceCountsMap)
    .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, fullName: name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Daily visits (last 14 days)
  const dailyVisits: { date: string; fullDate: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    dailyVisits.push({
      date: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
      fullDate: ds,
      count: filteredVisitors.filter((v) => v.date === ds).length,
    });
  }

  // Satisfaction distribution
  const satDist = [1, 2, 3, 4, 5].map((r) => ({
    name: `${r} Star`,
    count: filteredSurveys.filter((s) => s.overallSatisfaction === r).length,
  }));

  // Satisfaction trend (daily avg over last 14 days)
  const satTrend: { date: string; avg: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const daySurveys = filteredSurveys.filter((s) => s.date === ds);
    const avg = daySurveys.length ? daySurveys.reduce((a, s) => a + s.overallSatisfaction, 0) / daySurveys.length : 0;
    satTrend.push({ date: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }), avg: Number(avg.toFixed(2)) });
  }

  // Avg satisfaction per service
  const satByServiceData = avgByService
    .sort((a, b) => b.avg - a.avg)
    .map((s) => ({ name: s.name.length > 18 ? s.name.slice(0, 18) + '…' : s.name, fullName: s.name, avg: Number(s.avg.toFixed(2)) }));

  // Peak hours heatmap data
  const heatmapData: { hour: string; count: number }[] = [];
  for (let h = 7; h <= 18; h++) {
    heatmapData.push({ hour: `${String(h).padStart(2, '0')}:00`, count: hourCounts[h] || 0 });
  }

  // ── Table sorting ──
  const [sortField, setSortField] = useState<'date' | 'name' | 'service'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedVisitors = useMemo(() => {
    const sorted = [...filteredVisitors];
    sorted.sort((a, b) => {
      const va = a[sortField]; const vb = b[sortField];
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return sorted.slice(0, 30);
  }, [filteredVisitors, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const handleBarClick = (data: any) => {
    if (data?.fullName || data?.activePayload?.[0]?.payload?.fullName) {
      const name = data.fullName || data.activePayload[0].payload.fullName;
      setDrillService(drillService === name ? null : name);
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const years = Array.from(new Set(visitors.map((v) => new Date(v.date).getFullYear()))).sort((a, b) => b - a);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{profile.officeName} — Overview</p>
      </div>

      {/* ── Global Filter Panel ── */}
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
          {drillService && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-md text-sm">
              <span className="font-medium text-accent">Drill: {drillService}</span>
              <button onClick={() => setDrillService(null)} className="text-xs underline text-muted-foreground">clear</button>
            </div>
          )}
        </div>
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 stat-card-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                <p className={`font-bold mt-0.5 ${s.small ? 'text-sm' : 'text-xl'}`}>{s.value}</p>
              </div>
              <div className={`p-2 rounded-lg bg-muted shrink-0 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Bar */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-1">Services Availed</h3>
          <p className="text-xs text-muted-foreground mb-3">Click a bar to drill down</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={serviceData} layout="vertical" margin={{ left: 0 }}
              onClick={(e) => e?.activePayload && handleBarClick(e)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 88%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                <div className="bg-card border border-border rounded-lg p-2 shadow text-sm">
                  <p className="font-medium">{payload[0].payload.fullName}</p>
                  <p className="text-muted-foreground">{payload[0].value} visitors</p>
                </div>
              ) : null} />
              <Bar dataKey="count" fill="hsl(200, 80%, 40%)" radius={[0, 4, 4, 0]} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Visits Line */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Visitor Trend (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyVisits}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 88%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                <div className="bg-card border border-border rounded-lg p-2 shadow text-sm">
                  <p className="font-medium">{payload[0].payload.fullDate}</p>
                  <p className="text-muted-foreground">{payload[0].value} visitors</p>
                </div>
              ) : null} />
              <Line type="monotone" dataKey="count" stroke="hsl(220, 60%, 22%)" strokeWidth={2} dot={{ fill: 'hsl(220, 60%, 22%)', r: 3 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Satisfaction Distribution Pie */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Satisfaction Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={satDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="count">
                {satDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Satisfaction Trend Area */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Satisfaction Trend (QMS)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={satTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 88%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                <div className="bg-card border border-border rounded-lg p-2 shadow text-sm">
                  <p className="font-medium">{payload[0].payload.date}</p>
                  <p className="text-muted-foreground">Avg: {payload[0].value}/5</p>
                </div>
              ) : null} />
              <Area type="monotone" dataKey="avg" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Avg Satisfaction per Service */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-1">Avg Satisfaction per Service</h3>
          <p className="text-xs text-muted-foreground mb-3">Click a bar to drill down</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={satByServiceData} layout="vertical" margin={{ left: 0 }}
              onClick={(e) => e?.activePayload && handleBarClick(e)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 88%)" />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                <div className="bg-card border border-border rounded-lg p-2 shadow text-sm">
                  <p className="font-medium">{payload[0].payload.fullName}</p>
                  <p className="text-muted-foreground">Avg: {payload[0].value}/5</p>
                </div>
              ) : null} />
              <Bar dataKey="avg" radius={[0, 4, 4, 0]} cursor="pointer">
                {satByServiceData.map((entry, i) => (
                  <Cell key={i} fill={entry.avg >= 4 ? 'hsl(142, 71%, 45%)' : entry.avg >= 3 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 51%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Peak Hours */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Peak Visit Hours</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 88%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                <div className="bg-card border border-border rounded-lg p-2 shadow text-sm">
                  <p className="font-medium">{payload[0].payload.hour}</p>
                  <p className="text-muted-foreground">{payload[0].value} visitors</p>
                </div>
              ) : null} />
              <Bar dataKey="count" fill="hsl(200, 80%, 40%)" radius={[4, 4, 0, 0]}>
                {heatmapData.map((entry, i) => (
                  <Cell key={i} fill={entry.count > 5 ? 'hsl(0, 72%, 51%)' : entry.count > 2 ? 'hsl(38, 92%, 50%)' : 'hsl(200, 80%, 40%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Recent Visitors Table ── */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Visitors ({filteredVisitors.length} records)</h3>
        <div className="overflow-auto max-h-96">
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
                <TableRow key={v.id} className="cursor-pointer" onClick={() => setDrillService(v.service)}>
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
      </Card>
    </div>
  );
};

export default DashboardPage;
