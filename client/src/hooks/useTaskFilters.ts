import { useSearchParams } from 'react-router-dom';
import type { TaskFilters, TaskStatus, Priority } from '../types/task.types';

export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: TaskFilters = {
    status: (searchParams.get('status') as TaskStatus) || undefined,
    priority: (searchParams.get('priority') as Priority) || undefined,
    dueDateFrom: searchParams.get('dueDateFrom') || undefined,
    dueDateTo: searchParams.get('dueDateTo') || undefined,
  };

  function updateFilter(key: keyof TaskFilters, value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  return { filters, updateFilter };
}