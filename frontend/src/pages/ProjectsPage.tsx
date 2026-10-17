import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';
import { Project } from '../types';

const roomTone = (type?: string) => {
  switch (type) {
    case 'KITCHEN':
      return 'from-[#3D4A3A] to-[#6B7A5C]';
    case 'LIVING_ROOM':
      return 'from-[#4A3D32] to-[#8B7355]';
    case 'BATHROOM':
      return 'from-[#3A4548] to-[#6A7A7E]';
    case 'OFFICE':
      return 'from-[#2C3A42] to-[#5A6E78]';
    case 'FULL_HOME':
      return 'from-[#3A322C] to-[#6E5A48]';
    default:
      return 'from-[#2C4A3E] to-[#5A7A6A]';
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In progress';
    case 'DESIGNING':
      return 'Designing';
    case 'QUOTATION':
      return 'Quotation';
    default:
      return 'Active';
  }
};

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiService.getProjects().then(setProjects);
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client?.name && p.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-space-rise">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Studio</p>
          <h1 className="font-display text-4xl text-ink tracking-tight">Projects</h1>
          <p className="text-sm text-ink-muted mt-2 max-w-md">
            Rooms in progress — open any space to continue the layout.
          </p>
        </div>
        <Link to="/projects/new" className="btn-primary flex items-center gap-2 text-sm self-start">
          <Plus className="w-4 h-4" />
          <span>New project</span>
        </Link>
      </header>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by room or client…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-studio pl-9"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((project, i) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}/design`}
            className="group block animate-space-rise"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className={`relative h-40 bg-gradient-to-br ${roomTone(project.type)} overflow-hidden`}>
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.25),transparent_55%)]" />
              <div className="absolute inset-5 border border-white/15" />
              <span className="absolute bottom-3 left-4 text-[10px] font-bold uppercase tracking-[0.14em] text-white/85">
                {statusLabel(project.status)}
              </span>
            </div>
            <div className="pt-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl text-ink group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5 capitalize">
                  {project.client?.name || 'Rohan Mehta'} · {project.type.toLowerCase().replace('_', ' ')}
                </p>
                <p className="text-[11px] text-ink-muted/80 mt-1">{project.updatedAt}</p>
              </div>
              <span className="mt-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-ink-muted py-8">No projects match that search.</p>
      )}
    </div>
  );
};
