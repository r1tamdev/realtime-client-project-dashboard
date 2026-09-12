import { useEffect } from 'react';
import { useSocketStore } from '../stores/socketStore';

export function useSocketEvent<T>(eventName: string, handler: (payload: T) => void) {
  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
}