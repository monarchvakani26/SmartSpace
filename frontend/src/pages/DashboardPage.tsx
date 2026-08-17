import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FolderKanban, 
  ShoppingCart, 
  IndianRupee, 
  TrendingUp, 
  Plus, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';
import { Project, TaskItem } from '../types';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<{
    kpis: { totalLeads: number; activeProjects: number; totalOrders: number; revenue: number };
    recentProjects: Project[];
    tasks: TaskItem[];
  }>({
    kpis: { totalLeads: 128, activeProjects: 35, totalOrders: 18, revenue: 1245000 },
    recentProjects: [],
    tasks: [],
  });

  useEffect(() => {
    apiService.getDashboard().then((res) => {
      setData({
        kpis: res.kpis || { totalLeads: 128, activeProjects: 35, totalOrders: 18, revenue: 1245000 },
        recentProjects: res.recentProjects || [],
        tasks: res.tasks || [],
      });
    });
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">In Progress</span>;
      case 'DESIGNING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200">Designing</span>;
      case 'QUOTATION':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">Quotation</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Active</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Welcome back, here's your studio overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/projects/new" className="btn-primary flex items-center gap-2 text-xs">
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Total Leads */}
        <div className="card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Leads</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{data.kpis.totalLeads}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% this month</span>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Projects</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{data.kpis.activeProjects}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8% this month</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{data.kpis.totalOrders}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+15% this month</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              ₹{data.kpis.revenue.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+10% this month</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Recent Projects + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Projects Table */}
        <div className="lg:col-span-8 card !p-0 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Projects</h2>
                <p className="text-xs text-slate-400 mt-0.5">Active interior room design workflows</p>
              </div>
              <Link to="/projects" className="text-xs font-semibold text-primary hover:text-primary-700 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="table-header">Project Name</th>
                    <th className="table-header">Client</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Last Updated</th>
                    <th className="table-header text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.recentProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="table-cell font-semibold text-slate-900">
                        {project.name}
                      </td>
                      <td className="table-cell text-slate-600">
                        {project.client?.name || 'Rohan Mehta'}
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="table-cell text-slate-500 text-xs">
                        {project.updatedAt}
                      </td>
                      <td className="table-cell text-right">
                        <Link
                          to={`/projects/${project.id}/design`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Open Studio</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tasks Checklist Card */}
        <div className="lg:col-span-4 card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Tasks</h2>
                <p className="text-xs text-slate-400">Team execution checklist</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                {data.tasks.length} pending
              </span>
            </div>

            <div className="space-y-3">
              {data.tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-100/80 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="mt-0.5 w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/20 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    task.dueDate === 'Today' ? 'bg-rose-50 text-rose-600' : 'bg-slate-200/60 text-slate-600'
                  }`}>
                    {task.dueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Task</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
