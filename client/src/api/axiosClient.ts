import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 8000,
});

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest?.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingQueue.push(() => resolve(axiosClient(originalRequest)));
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = refreshResponse.data.accessToken;
      useAuthStore.getState().setAccessToken(newAccessToken);

      const socket = useSocketStore.getState().socket;
      if (socket) {
        socket.auth = { token: newAccessToken };
      }

      pendingQueue.forEach((callback) => callback());
      pendingQueue = [];

      return axiosClient(originalRequest);
    } catch (refreshError) {
      useSocketStore.getState().disconnect();
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
