import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocketStore } from '../../stores/socketStore';
import { fetchProjectById } from '../../api/projects.api';
import type { Project } from '../../types/project.types';
import ActivityFeed from '../../components/activity/ActivityFeed';
import TaskList from '../../components/tasks/TaskList';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchProjectById(id)
      .then((data) => {
        if (!cancelled) setProject(data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load project');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('project:join', id);
    return () => {
      socket.emit('project:leave', id);
    };
  }, [socket, id]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!project) return <ErrorBanner message="Project not found" />;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-xl font-bold mb-4">{project.name}</h1>
        <TaskList projectId={id} />
      </div>
      <div>
        <h2 className="font-medium mb-3">Activity</h2>
        <ActivityFeed projectId={id} />
      </div>
    </div>
  );
}
