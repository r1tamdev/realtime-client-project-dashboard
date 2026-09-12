export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
  assignee?: { id: string; name: string };
}

export interface TaskFilters {
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDateFrom?: string;
  dueDateTo?: string;
}