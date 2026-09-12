import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Sidebar() {
  const role = useAuthStore((state) => state.user?.role);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-md text-sm ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`;

  return (
    <aside className="w-56 border-r border-gray-200 h-screen p-4">
      <h2 className="font-bold text-lg mb-6">Velozity</h2>
      <nav className="space-y-1">
        {role === 'ADMIN' && <NavLink to="/" className={linkClass}>Admin Dashboard</NavLink>}
        {role === 'PM' && <NavLink to="/" className={linkClass}>PM Dashboard</NavLink>}
        {role === 'DEVELOPER' && <NavLink to="/" className={linkClass}>My Tasks</NavLink>}
      </nav>
    </aside>
  );
}