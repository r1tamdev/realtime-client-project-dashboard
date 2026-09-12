import TaskList from '../../components/tasks/TaskList';

export default function DeveloperDashboardPage() {
  return (
    <div>
      <h2 className="font-medium mb-3">My Tasks</h2>
      <TaskList />
    </div>
  );
}