// frontend/src/socket.js
import { io } from 'socket.io-client';

const SOCKET_BASE = process.env.REACT_APP_API_BASE || 'https://whatsapp-i2eo.onrender.com';

const socket = io(SOCKET_BASE, {
  path: '/socket.io',
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: true
});

// Helpful listeners for debugging
socket.on('connect', () => console.log('Socket connected', socket.id));
socket.on('disconnect', (reason) => console.log('Socket disconnected', reason));
socket.on('connect_error', (err) => console.error('Socket connect_error', err));

export default socket;
