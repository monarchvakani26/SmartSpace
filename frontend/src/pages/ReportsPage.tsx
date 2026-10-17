import React from 'react';
import { Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const revenueData = [
  { name: '1 May', revenue: 5000 },
  { name: '8 May', revenue: 15000 },
  { name: '15 May', revenue: 12000 },
  { name: '22 May', revenue: 20000 },
  { name: '31 May', revenue: 18000 },
];

const statusData = [
  { name: 'In Progress', value: 12, percentage: '34%', color: '#3D5A80' },
  { name: 'Designing', value: 8, percentage: '23%', color: '#2C4A3E' },
  { name: 'Quotation', value: 7, percentage: '20%', color: '#A67C52' },
  { name: 'Completed', value: 8, percentage: '23%', color: '#5A7A6A' },
];

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-space-rise">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Desk</p>
          <h1 className="font-display text-4xl text-ink tracking-tight">Reports</h1>
          <p className="text-sm text-ink-muted mt-2">Studio revenue and project mix — quiet numbers, no KPI theater.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted border border-surface-border bg-surface-card/70 px-3 py-2">
          <Calendar className="w-4 h-4" />
          <span>01 May – 31 May 2024</span>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-y border-surface-border py-6">
        {[
          { label: 'Revenue', value: '₹12,46,000' },
          { label: 'Orders', value: '18' },
          { label: 'Projects', value: '35' },
          { label: 'Conversion', value: '68%' },
        ].map((m) => (
          <div key={m.label}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">{m.label}</p>
            <p className="font-display text-3xl text-ink mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <h2 className="font-display text-2xl text-ink">Revenue</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2C4A3E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2C4A3E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C8C5BB" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5C574E' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5C574E' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1F1C19', borderRadius: '2px', color: '#F7F6F2', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2C4A3E" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-display text-2xl text-ink">By stage</h2>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} projects`, String(name)]}
                  contentStyle={{ backgroundColor: '#1F1C19', borderRadius: '2px', color: '#F7F6F2', border: 'none', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-xs pt-2 border-t border-surface-border">
            {statusData.map((st) => (
              <div key={st.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5" style={{ backgroundColor: st.color }} />
                <span className="text-ink-muted font-medium flex-1">{st.name}</span>
                <span className="text-ink font-semibold">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
