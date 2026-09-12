import { useTaskFilters } from '../../hooks/useTaskFilters';

export default function TaskFilters() {
  const { filters, updateFilter } = useTaskFilters();

  return (
    <div className="flex gap-3 mb-4">
      <select
        value={filters.status || ''}
        onChange={(e) => updateFilter('status', e.target.value || undefined)}
        className="border rounded-md px-3 py-2 text-sm"
      >
        <option value="">All statuses</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="DONE">Done</option>
      </select>

      <select
        value={filters.priority || ''}
        onChange={(e) => updateFilter('priority', e.target.value || undefined)}
        className="border rounded-md px-3 py-2 text-sm"
      >
        <option value="">All priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>

      <input
        type="date"
        value={filters.dueDateFrom || ''}
        onChange={(e) => updateFilter('dueDateFrom', e.target.value || undefined)}
        className="border rounded-md px-3 py-2 text-sm"
      />

      <input
        type="date"
        value={filters.dueDateTo || ''}
        onChange={(e) => updateFilter('dueDateTo', e.target.value || undefined)}
        className="border rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}