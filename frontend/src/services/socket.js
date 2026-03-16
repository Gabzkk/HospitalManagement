import { useEffect } from 'react';
import { io } from 'socket.io-client';

// Use same host/port as standard API, usually localhost:3001
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

socket.on('connect', () => {
  console.log('[WS] Connected to server', socket.id);
});

socket.on('disconnect', () => {
  console.log('[WS] Disconnected from server');
});

/**
 * Custom React hook to listen for real-time WebSocket events.
 * @param {string} channel - The channel name (e.g., 'patients', 'attendance')
 * @param {function} callback - Function to run when a message is received
 */
export function useSocket(channel, callback) {
  useEffect(() => {
    if (!channel || !callback) return;

    socket.on(channel, callback);

    return () => {
      socket.off(channel, callback);
    };
  }, [channel, callback]);
}

export default socket;
