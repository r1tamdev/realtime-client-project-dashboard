import axiosClient from './axiosClient';
import type { LoginResponse } from '../types/auth.types';

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const response = await axiosClient.post('/auth/login', { email, password });
  return response.data;
}

export async function logoutRequest(): Promise<void> {
  await axiosClient.post('/auth/logout');
}