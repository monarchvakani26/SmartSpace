import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Clock } from 'lucide-react';
import { apiService } from '../services/api';
import { Project, TaskItem } from '../types';

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

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<{
    recentProjects: Project[];
    tasks: TaskItem[];
  }>({
    recentProjects: [],
    tasks: [],
  });

  useEffect(() => {
    apiService.getDashboard().then((res) => {
      setData({
        recentProjects: res.recentProjects || [],
        tasks: res.tasks || [],
      });
    });
  }, []);

  return (
    <div className="space-y-10 animate-space-rise">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-3">
            SmartSpace
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-ink leading-[1.05] tracking-tight">
            Your spaces
          </h1>
          <p className="mt-3 text-sm text-ink-muted leading-relaxed max-w-md">
            Continue a room, or open a new layout. Design first — paperwork stays on the desk.
          </p>
        </div>
        <Link to="/projects/new" className="btn-primary self-start flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span>New space</span>
        </Link>
      </header>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl text-ink">Continue designing</h2>
          <Link to="/projects" className="text-xs font-semibold text-primary hover:text-brass flex items-center gap-1">
            All projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data.recentProjects.length === 0 ? (
          <div className="panel-quiet p-10 text-center animate-space-fade">
            <p className="font-display text-2xl text-ink mb-2">No spaces yet</p>
            <p className="text-sm text-ink-muted mb-5">Start with room dimensions and drop into the studio.</p>
            <Link to="/projects/new" className="btn-primary inline-flex gap-2 text-sm">
              <Plus className="w-4 h-4" /> Create first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.recentProjects.map((project, i) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}/design`}
                className="group block animate-space-rise"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className={`relative h-44 overflow-hidden bg-gradient-to-br ${roomTone(project.type)} transition-transform duration-500 group-hover:scale-[1.015]`}
                >
                  <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_18px,rgba(255,255,255,0.08)_18px,rgba(255,255,255,0.08)_19px)]" />
                  <div className="absolute inset-6 border border-white/20" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                      {statusLabel(project.status)}
                    </span>
                    <span className="text-[10px] font-medium text-white/70">{project.updatedAt}</span>
                  </div>
                </div>
                <div className="pt-3">
                  <h3 className="font-display text-xl text-ink group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {project.client?.name || 'Rohan Mehta'} · Open studio
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {data.tasks.length > 0 && (
        <section className="max-w-xl animate-space-fade" style={{ animationDelay: '120ms' }}>
          <h2 className="font-display text-2xl text-ink mb-3">Today on the desk</h2>
          <ul className="space-y-2">
            {data.tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start gap-3 py-2.5 border-b border-surface-border/70"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brass shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{task.title}</p>
                  <p className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {task.dueDate}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
