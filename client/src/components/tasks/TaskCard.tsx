import type { Task, TaskStatus } from '../../types/task.types';
import TaskStatusBadge from './TaskStatusBadge';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'IN_REVIEW',
  IN_REVIEW: 'DONE',
  DONE: null,
};

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const nextStatus = NEXT_STATUS[task.status];

  return (
    <div className={`border rounded-lg p-4 bg-white ${task.isOverdue ? 'border-red-300' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <TaskStatusBadge status={task.status} />
      </div>

      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{task.priority} priority</span>
        <span className={task.isOverdue ? 'text-red-600 font-medium' : ''}>
          Due {new Date(task.dueDate).toLocaleDateString()}
          {task.isOverdue && ' · Overdue'}
        </span>
      </div>

      {nextStatus && onStatusChange && (
        <button
          onClick={() => onStatusChange(task.id, nextStatus)}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          Move to {nextStatus.replace('_', ' ')}
        </button>
      )}
    </div>
  );
}