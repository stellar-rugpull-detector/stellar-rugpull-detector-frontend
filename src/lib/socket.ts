'use client';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000', {
      autoConnect: true,
    });
    socket.on('connect', () => {
      socket!.emit('subscribe:alerts');
      socket!.emit('subscribe:risk-updates');
    });
  }
  return socket;
}
