import axiosClient from './axiosClient';
import type { ActivityEvent } from '../types/activity.types';

export async function fetchActivityFeed(params: {
  projectId?: string;
  since?: string;
  limit?: number;
}): Promise<ActivityEvent[]> {
  const query = new URLSearchParams();
  if (params.projectId) query.set('projectId', params.projectId);
  if (params.since) query.set('since', params.since);
  if (params.limit) query.set('limit', String(params.limit));

  const response = await axiosClient.get(`/activity?${query.toString()}`);
  return response.data;
}