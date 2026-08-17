import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Search, ArrowRight, Eye, Layers } from 'lucide-react';
import { apiService } from '../services/api';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiService.getProjects().then(setProjects);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">In Progress</span>;
      case 'DESIGNING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200">Designing</span>;
      case 'QUOTATION':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">Quotation</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">Active</span>;
    }
  };

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.client?.name && p.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-xs text-slate-500 mt-0.5">Interior design workspaces, 2D floor plans, and quotation status.</p>
        </div>
        <Link to="/projects/new" className="btn-primary flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" />
          <span>+ Create Project</span>
        </Link>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Project Name</th>
                <th className="table-header">Client</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Last Updated</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="table-cell font-bold text-slate-900">
                    {project.name}
                  </td>
                  <td className="table-cell text-slate-600">
                    {project.client?.name || 'Rohan Mehta'}
                  </td>
                  <td className="table-cell text-slate-500 text-xs capitalize">
                    {project.type.toLowerCase().replace('_', ' ')}
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
                      <span>Design Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
