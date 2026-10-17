import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Users, 
  Box, 
  UserCheck, 
  FileText, 
  Package, 
  PackageCheck, 
  BarChart3, 
  LogOut,
  type LucideIcon
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

const studioNav: NavItem[] = [
  { name: 'Your spaces', path: '/dashboard', icon: Compass },
  { name: 'Projects', path: '/projects', icon: Box },
];

const deskNav: NavItem[] = [
  { name: 'Clients', path: '/clients', icon: UserCheck },
  { name: 'Leads', path: '/leads', icon: Users },
  { name: 'Quotations', path: '/quotations', icon: FileText },
  { name: 'Orders', path: '/orders', icon: PackageCheck },
  { name: 'Materials', path: '/inventory', icon: Package },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/projects' && (location.pathname.startsWith('/projects') || location.pathname.includes('/design'))) ||
    (path !== '/dashboard' && path !== '/projects' && location.pathname.startsWith(path));

  const renderLink = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        key={item.name}
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-colors duration-150 ${
          active
            ? 'bg-primary text-[#F7F6F2]'
            : 'text-[#A8A498] hover:text-[#F7F6F2] hover:bg-sidebar-hover'
        }`}
      >
        <Icon className={`w-4 h-4 ${active ? 'text-[#F7F6F2]' : 'text-[#7A756C]'}`} />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="w-[200px] min-h-screen bg-sidebar flex flex-col fixed left-0 top-0 bottom-0 z-30 select-none border-r border-sidebar-border">
      <div className="px-4 pt-7 pb-6">
        <Link to="/dashboard" className="block group">
          <p className="font-display text-[1.65rem] leading-none text-[#F7F6F2] tracking-tight group-hover:text-brass-soft transition-colors">
            SmartSpace
          </p>
          <p className="mt-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-[#7A756C]">
            Interior studio
          </p>
        </Link>
      </div>

      <nav className="flex-1 px-2 space-y-6 overflow-y-auto pb-4">
        <div>
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5C574E]">
            Studio
          </p>
          <div className="space-y-0.5">
            {studioNav.map(renderLink)}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5C574E]">
            Desk
          </p>
          <div className="space-y-0.5">
            {deskNav.map(renderLink)}
          </div>
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#F7F6F2] truncate">{user?.name || 'Designer'}</p>
            <p className="text-[10px] text-[#7A756C] truncate capitalize">
              {user?.role?.toLowerCase().replace('_', ' ') || 'Admin'}
            </p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-[#7A756C] hover:text-brass-soft transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
