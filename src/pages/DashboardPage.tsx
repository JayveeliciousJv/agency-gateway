import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Users, ClipboardList, Star, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const CHART_COLORS = [
  'hsl(200, 80%, 40%)',
  'hsl(220, 60%, 22%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
  'hsl(270, 60%, 50%)',
];

const DashboardPage = () => {
  const visitors = useAppStore((s) => s.visitors);
  const surveys = useAppStore((s) => s.surveys);
  const profile = useAppStore((s) => s.profile);

  const today = new Date().toISOString().split('T')[0];
  const todayVisitors = visitors.filter((v) => v.date === today).length;
  const thisMonth = visitors.filter((v) => v.date.slice(0, 7) === today.slice(0, 7)).length;

  const avgSatisfaction = surveys.length
    ? (surveys.reduce((a, s) => a + s.overallSatisfaction, 0) / surveys.length).toFixed(1)
    : '0';

  const satisfiedPct = surveys.length
    ? Math.round((surveys.filter((s) => s.overallSatisfaction >= 4).length / surveys.length) * 100)
    : 0;

  // Service distribution
  const serviceCounts: Record<string, number> = {};
  visitors.forEach((v) => {
    serviceCounts[v.service] = (serviceCounts[v.service] || 0) + 1;
  });
  const serviceData = Object.entries(serviceCounts)
    .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Satisfaction distribution
  const satDist = [1, 2, 3, 4, 5].map((r) => ({
    name: `${r} Star`,
    count: surveys.filter((s) => s.overallSatisfaction === r).length,
  }));

  // Daily visits (last 7 days)
  const dailyVisits: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    dailyVisits.push({
      date: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
      count: visitors.filter((v) => v.date === ds).length,
    });
  }

  const stats = [
    { label: 'Today\'s Visitors', value: todayVisitors, icon: Users, color: 'text-info' },
    { label: 'This Month', value: thisMonth, icon: ClipboardList, color: 'text-primary' },
    { label: 'Avg. Satisfaction', value: `${avgSatisfaction}/5`, icon: Star, color: 'text-warning' },
    { label: '% Satisfied (≥4★)', value: `${satisfiedPct}%`, icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{profile.officeName} — Overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 stat-card-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg bg-muted ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Bar Chart */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Most Availed Services</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={serviceData} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 88%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(200, 80%, 40%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Visits Line Chart */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Visits (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyVisits}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 25%, 88%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(220, 60%, 22%)" strokeWidth={2} dot={{ fill: 'hsl(220, 60%, 22%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Satisfaction Pie */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Satisfaction Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={satDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="count">
                {satDist.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Visitors */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Recent Visitors</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {visitors.slice(0, 8).map((v) => (
              <div key={v.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                <div>
                  <p className="font-medium">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.service}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{v.date}</p>
                  <p>{v.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
