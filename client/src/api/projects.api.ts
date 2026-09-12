import axiosClient from './axiosClient';
import type { Project } from '../types/project.types';

export async function fetchProjects(): Promise<Project[]> {
  const response = await axiosClient.get('/projects');
  return response.data;
}

export async function fetchProjectById(id: string): Promise<Project> {
  const response = await axiosClient.get(`/projects/${id}`);
  return response.data;
}

export async function createProject(name: string, clientId: string): Promise<Project> {
  const response = await axiosClient.post('/projects', { name, clientId });
  return response.data;
}