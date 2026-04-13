
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        // In development, the socket server is on the same host/port
        socket = io();
    }
    return socket;
};

export const joinUserRoom = (userId: string) => {
    const s = getSocket();
    s.emit("join", userId);
};
