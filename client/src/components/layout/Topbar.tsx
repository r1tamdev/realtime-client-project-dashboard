import { useAuthStore } from '../../stores/authStore';
import { useSocketStore } from '../../stores/socketStore';
import { logoutRequest } from '../../api/auth.api';
import NotificationBell from '../notifications/NotificationBell';
import Button from '../common/Button';

export default function Topbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const disconnectSocket = useSocketStore((state) => state.disconnect);

  async function handleLogout() {
    await logoutRequest();
    disconnectSocket();
    logout();
  }

  return (
    <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200">
      <span className="text-sm text-gray-600">{user?.name} · {user?.role}</span>
      <div className="flex items-center gap-4">
        <NotificationBell />
        <Button variant="secondary" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  );
}