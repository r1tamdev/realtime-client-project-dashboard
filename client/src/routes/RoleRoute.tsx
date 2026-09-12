import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { Role } from '../types/auth.types';

interface RoleRouteProps {
  allow: Role[];
}

export default function RoleRoute({ allow }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}