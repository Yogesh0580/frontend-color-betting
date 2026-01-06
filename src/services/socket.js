import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => { });
        socket.on('disconnect', () => { });
        socket.on('connect_error', () => { });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return connectSocket();
    }
    return socket;
};

export const joinGameRoom = (userId) => {
    const sock = getSocket();
    sock.emit('join-game', userId);
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default {
    connectSocket,
    getSocket,
    joinGameRoom,
    disconnectSocket
};
