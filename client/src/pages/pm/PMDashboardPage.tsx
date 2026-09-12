import ActivityFeed from '../../components/activity/ActivityFeed';
import TaskList from '../../components/tasks/TaskList';

export default function PMDashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h2 className="font-medium mb-3">Your Projects' Tasks</h2>
        <TaskList />
      </div>
      <div>
        <h2 className="font-medium mb-3">Your Projects' Activity</h2>
        <ActivityFeed />
      </div>
    </div>
  );
}