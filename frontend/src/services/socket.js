import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000');

// Emit user_online as soon as the socket connects.
// This covers every page — not just Chat — so presence is
// tracked from the moment the authenticated app loads.
socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.id) {
        console.log('[Socket] Emitting user_online, userId:', user.id);
        socket.emit('user_online', user.id);
    }
});

socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
});
