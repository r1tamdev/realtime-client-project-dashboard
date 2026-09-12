import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './authStore';

interface SocketState {
  socket: Socket | null;
  onlineCount: number;
  connect: (accessToken: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineCount: 0,

  connect: (accessToken: string) => {
    if (get().socket) return;

    useAuthStore.getState().setAccessToken(accessToken);

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: (cb) => {
        cb({ token: useAuthStore.getState().accessToken });
      },
    });

    socket.on('presence:count', (data: { onlineCount: number }) => {
      set({ onlineCount: data.onlineCount });
    });

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, onlineCount: 0 });
  },
}));
