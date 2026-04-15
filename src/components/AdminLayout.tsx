import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import AdminSidebar from '@/components/AdminSidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const SIDEBAR_KEY = 'admin-sidebar-collapsed';

const AdminLayout = () => {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isMobile = useIsMobile();

  // On mobile, sidebar is an overlay; on desktop, it's inline collapsible
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch {}
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Mobile overlay backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          isMobile
            ? 'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out'
            : 'relative',
          isMobile && !mobileOpen && '-translate-x-full',
          isMobile && mobileOpen && 'translate-x-0',
        )}
      >
        <AdminSidebar
          collapsed={isMobile ? false : collapsed}
          onToggle={() => {
            if (isMobile) setMobileOpen(false);
            else setCollapsed((c) => !c);
          }}
          onNavClick={() => isMobile && setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Mobile top bar */}
        {isMobile && (
          <div className="sticky top-0 z-30 flex items-center h-14 px-4 border-b border-border bg-background">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <span className="ml-3 text-sm font-semibold text-foreground truncate">Admin Panel</span>
          </div>
        )}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
