import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import AdminSidebar from '@/components/AdminSidebar';

const SIDEBAR_KEY = 'admin-sidebar-collapsed';

const AdminLayout = () => {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, String(collapsed)); } catch {}
  }, [collapsed]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="flex-1 p-6 overflow-auto transition-all duration-300 ease-in-out">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
