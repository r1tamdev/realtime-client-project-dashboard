import { useEffect, useState } from 'react';
import type { ActivityEvent } from '../../types/activity.types';
import { fetchActivityFeed } from '../../api/activity.api';
import { useSocketEvent } from '../../hooks/useSocketEvent';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import LoadingSpinner from '../common/LoadingSpinner';

interface ActivityFeedProps {
  projectId?: string;
}

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchActivityFeed({ projectId, limit: 20 });
        setEvents(data);
        if (data.length > 0) {
          setLastSeenAt(data[0].createdAt);
        }
      } catch {
        setError('Failed to load activity');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [projectId]);

  useEffect(() => {
    async function catchUpMissedEvents() {
      if (!lastSeenAt) return;
      try {
        const missed = await fetchActivityFeed({ projectId, since: lastSeenAt });
        if (missed.length > 0) {
          setEvents((prev) => [...missed, ...prev]);
          setLastSeenAt(missed[0].createdAt);
        }
      } catch {
        // Ignore catch-up failures; live socket events still update the feed
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        catchUpMissedEvents();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastSeenAt, projectId]);

  useSocketEvent<ActivityEvent>('activity:new', (event) => {
    if (projectId && event.projectId !== projectId) return;
    setEvents((prev) => [event, ...prev].slice(0, 50));
    setLastSeenAt(event.createdAt);
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="space-y-2">
      {events.length === 0 ? (
        <p className="text-gray-500 text-sm">No activity yet.</p>
      ) : (
        events.map((event) => (
          <div key={event.id} className="text-sm border-b border-gray-100 pb-2">
            <span className="font-medium">{event.changedByName}</span> moved{' '}
            <span className="font-medium">{event.taskTitle}</span> from{' '}
            {event.fromStatus?.replace('_', ' ') || 'start'} →{' '}
            {event.toStatus.replace('_', ' ')}{' '}
            <span className="text-gray-400">· {formatRelativeTime(event.createdAt)}</span>
          </div>
        ))
      )}
    </div>
  );
}
