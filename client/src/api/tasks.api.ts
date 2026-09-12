import axiosClient from './axiosClient';
import type { Task, TaskFilters, TaskStatus } from '../types/task.types';

export async function fetchTasks(filters: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.projectId) params.set('projectId', filters.projectId);
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.dueDateFrom) params.set('dueDateFrom', filters.dueDateFrom);
  if (filters.dueDateTo) params.set('dueDateTo', filters.dueDateTo);

  const response = await axiosClient.get(`/tasks?${params.toString()}`);
  return response.data;
}

export async function fetchTaskById(id: string): Promise<Task> {
  const response = await axiosClient.get(`/tasks/${id}`);
  return response.data;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const response = await axiosClient.patch(`/tasks/${id}/status`, { status });
  return response.data;
}

export async function createTask(
  projectId: string,
  data: {
    title: string;
    description: string;
    assigneeId: string;
    priority: string;
    dueDate: string;
  }
): Promise<Task> {
  const response = await axiosClient.post(`/projects/${projectId}/tasks`, data);
  return response.data;
}