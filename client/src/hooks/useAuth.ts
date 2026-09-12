import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';

export function useAuthInit() {
  const [isLoading, setIsLoading] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const connectSocket = useSocketStore((state) => state.connect);

  useEffect(() => {
    async function tryRestoreSession() {
      try {
        const response = await axiosClient.post('/auth/refresh');
        const accessToken = response.data.accessToken;
        setAccessToken(accessToken);

        const meResponse = await axiosClient.get('/auth/me');
        setAuth(meResponse.data, accessToken);
        connectSocket(accessToken);
      } catch {
        // No valid refresh cookie — user simply isn't logged in
      } finally {
        setIsLoading(false);
      }
    }

    tryRestoreSession();
  }, [setAuth, setAccessToken, connectSocket]);

  return { isLoading };
}
