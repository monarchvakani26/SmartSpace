import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  UserCheck, 
  FileText, 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  Home,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', path: '/leads', icon: Users },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Clients', path: '/clients', icon: UserCheck },
  { name: 'Quotations', path: '/quotations', icon: FileText },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Vendors', path: '/vendors', icon: Truck },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-[220px] min-h-screen bg-sidebar flex flex-col fixed left-0 top-0 bottom-0 z-30 select-none shadow-sidebar border-r border-slate-900/40">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/60">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30">
          <Home className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black tracking-wider text-white uppercase leading-none">
            AI INTERIOR
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-primary-300 uppercase leading-tight">
            PLANNER
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path) || 
            (item.path === '/projects' && location.pathname.includes('/design'));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary/30">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Designer'}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role?.toLowerCase().replace('_', ' ') || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
