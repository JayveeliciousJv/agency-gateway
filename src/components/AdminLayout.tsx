import { Outlet, Navigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import AdminSidebar from '@/components/AdminSidebar';

const AdminLayout = () => {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
