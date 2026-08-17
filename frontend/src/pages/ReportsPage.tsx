import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  IndianRupee, 
  ShoppingCart, 
  FolderKanban, 
  Percent, 
  Calendar,
  Download
} from 'lucide-react';
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
  Cell 
} from 'recharts';

const revenueData = [
  { name: '1 May', revenue: 5000 },
  { name: '8 May', revenue: 15000 },
  { name: '15 May', revenue: 12000 },
  { name: '22 May', revenue: 20000 },
  { name: '31 May', revenue: 18000 },
];

const statusData = [
  { name: 'In Progress', value: 12, percentage: '34%', color: '#3B82F6' },
  { name: 'Designing', value: 8, percentage: '23%', color: '#8B5CF6' },
  { name: 'Quotation', value: 7, percentage: '20%', color: '#F59E0B' },
  { name: 'Completed', value: 8, percentage: '23%', color: '#22C55E' },
];

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Financial overview, lead conversion metrics, and project status breakdowns.</p>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>01 May 2024 – 31 May 2024</span>
        </div>
      </div>

      {/* KPI Cards (Reference Screen 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="card">
          <span className="text-xs font-medium text-slate-500">Total Revenue</span>
          <div className="mt-2 text-2xl font-black text-slate-900">₹12,46,000</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12%</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card">
          <span className="text-xs font-medium text-slate-500">Total Orders</span>
          <div className="mt-2 text-2xl font-black text-slate-900">18</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3%</span>
          </div>
        </div>

        {/* Total Projects */}
        <div className="card">
          <span className="text-xs font-medium text-slate-500">Total Projects</span>
          <div className="mt-2 text-2xl font-black text-slate-900">35</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+10%</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="card">
          <span className="text-xs font-medium text-slate-500">Conversion Rate</span>
          <div className="mt-2 text-2xl font-black text-slate-900">68%</div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+5%</span>
          </div>
        </div>
      </div>

      {/* Two Charts Below (Reference Screen 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Overview Line/Area Chart */}
        <div className="lg:col-span-8 card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Revenue Overview</h2>
            <span className="text-xs text-slate-400 font-medium">Weekly trend (₹)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B4FE0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5B4FE0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F1629', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#5B4FE0" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects by Status Donut Chart */}
        <div className="lg:col-span-4 card space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Projects by Status</h2>
            <p className="text-xs text-slate-400">Distribution across active workflow stages</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any, name: any) => [`${val} projects`, String(name)]}
                  contentStyle={{ backgroundColor: '#0F1629', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Legend (Matching Reference Screen 12) */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {statusData.map((st) => (
              <div key={st.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                <span className="text-slate-600 font-medium">{st.name}</span>
                <span className="text-slate-400 font-bold text-[11px]">{st.value} ({st.percentage})</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
