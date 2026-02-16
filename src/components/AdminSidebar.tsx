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
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/visitors', icon: ClipboardList, label: 'Visitor Logs' },
  { to: '/admin/surveys', icon: BarChart3, label: 'Survey Results' },
  { to: '/admin/users', icon: Users, label: 'Users', role: 'super_admin' as const },
  { to: '/admin/audit', icon: History, label: 'Audit Logs', role: 'super_admin' as const },
  { to: '/admin/purposes', icon: ListChecks, label: 'Purposes & Services' },
  { to: '/admin/privacy', icon: FileText, label: 'Privacy Prompts', role: 'super_admin' as const },
  { to: '/admin/settings', icon: Settings, label: 'Agency Settings', role: 'super_admin' as const },
];

const AdminSidebar = () => {
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
    <aside className="w-64 min-h-screen gov-header-gradient flex flex-col">
      {/* Brand */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {profile.systemTitle}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{profile.officeName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {currentUser?.fullName}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {currentUser?.role?.replace('_', ' ')}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
