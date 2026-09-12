import { useEffect, useState } from 'react';
import { useSocketStore } from '../../stores/socketStore';
import { fetchTasks } from '../../api/tasks.api';
import { fetchProjects } from '../../api/projects.api';
import ActivityFeed from '../../components/activity/ActivityFeed';
import TaskList from '../../components/tasks/TaskList';

export default function AdminDashboardPage() {
  const onlineCount = useSocketStore((state) => state.onlineCount);
  const [stats, setStats] = useState({ totalProjects: 0, totalTasks: 0, overdueCount: 0 });

  useEffect(() => {
    async function loadStats() {
      const [projects, tasks] = await Promise.all([fetchProjects(), fetchTasks({})]);
      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
        overdueCount: tasks.filter((t) => t.isOverdue).length,
      });
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Total Tasks" value={stats.totalTasks} />
        <StatCard label="Overdue" value={stats.overdueCount} />
        <StatCard label="Online Now" value={onlineCount} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="font-medium mb-3">All Tasks</h2>
          <TaskList />
        </div>
        <div>
          <h2 className="font-medium mb-3">Global Activity</h2>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}