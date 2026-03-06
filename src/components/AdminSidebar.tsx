import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Users,
  History,
  ListChecks,
  FileText,
  FileBarChart,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/visitors', icon: ClipboardList, label: 'Visitor Logs' },
  { to: '/admin/surveys', icon: BarChart3, label: 'Survey Results' },
  { to: '/admin/users', icon: Users, label: 'Users', role: 'super_admin' as const },
  { to: '/admin/audit', icon: History, label: 'Audit Logs', role: 'super_admin' as const },
  { to: '/admin/purposes', icon: ListChecks, label: 'Visitor Transaction Types' },
  { to: '/admin/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/admin/privacy', icon: FileText, label: 'Privacy Prompts', role: 'super_admin' as const },
  { to: '/admin/settings', icon: Settings, label: 'Agency Settings', role: 'super_admin' as const },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const profile = useAppStore((s) => s.profile);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter(
    (item) => !item.role || currentUser?.role === item.role
  );

  return (
    <aside
      className={cn(
        'min-h-screen gov-header-gradient flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {profile.systemTitle}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{profile.officeName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle */}
      <div className="px-3 py-2 flex justify-end">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-1">
        {filteredNav.map((item) => {
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.to} delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser?.fullName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {currentUser?.role?.replace('_', ' ')}
              </p>
            </div>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? 'right' : 'top'} sideOffset={8}>
              Logout
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
