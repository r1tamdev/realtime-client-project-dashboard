import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocketStore } from '../../stores/socketStore';
import { fetchProjectById } from '../../api/projects.api';
import type { Project } from '../../types/project.types';
import ActivityFeed from '../../components/activity/ActivityFeed';
import TaskList from '../../components/tasks/TaskList';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    if (!id) return;
    fetchProjectById(id).then(setProject);
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('project:join', id);
    return () => {
      socket.emit('project:leave', id);
    };
  }, [socket, id]);

  if (!project) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-xl font-bold mb-4">{project.name}</h1>
        <TaskList />
      </div>
      <div>
        <h2 className="font-medium mb-3">Activity</h2>
        <ActivityFeed projectId={id} />
      </div>
    </div>
  );
}