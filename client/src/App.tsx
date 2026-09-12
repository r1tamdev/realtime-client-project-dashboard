import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthInit } from './hooks/useAuth';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './routes/ProtectRoute';
import RoleRoute from './routes/RoleRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import PMDashboardPage from './pages/pm/PMDashboardPage';
import DeveloperDashboardPage from './pages/developer/DeveloperDashboardPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import LoadingSpinner from './components/common/LoadingSpinner';

function RoleDashboardRedirect() {
  const role = useAuthStore((state) => state.user?.role);

  if (role === 'ADMIN') return <AdminDashboardPage />;
  if (role === 'PM') return <PMDashboardPage />;
  return <DeveloperDashboardPage />;
}

export default function App() {
  const { isLoading } = useAuthInit();

  if (isLoading) return <LoadingSpinner />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<RoleDashboardRedirect />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />

            <Route element={<RoleRoute allow={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}