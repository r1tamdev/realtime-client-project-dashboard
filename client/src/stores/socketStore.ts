import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

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

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: accessToken },
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