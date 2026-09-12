import { useEffect, useState, useCallback } from 'react';
import type { Task, TaskStatus } from '../../types/task.types';
import { fetchTasks, updateTaskStatus } from '../../api/tasks.api';
import { useTaskFilters } from '../../hooks/useTaskFilters';
import { useSocketEvent } from '../../hooks/useSocketEvent';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBanner from '../common/ErrorBanner';

interface TaskListProps {
  projectId?: string;
}

export default function TaskList({ projectId }: TaskListProps) {
  const { filters } = useTaskFilters();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTasks({ ...filters, projectId });
      setTasks(data);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.priority, filters.dueDateFrom, filters.dueDateTo, projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useSocketEvent<{ taskIds: string[] }>('task:overdue', ({ taskIds }) => {
    setTasks((prev) =>
      prev.map((task) =>
        taskIds.includes(task.id) ? { ...task, isOverdue: true } : task
      )
    );
  });

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch {
      setError('Failed to update task status');
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <TaskFilters />
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm">No tasks match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
