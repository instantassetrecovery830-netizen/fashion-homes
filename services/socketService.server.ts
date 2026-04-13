
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("join", (userId: string) => {
            socket.join(userId);
            console.log(`User ${userId} joined their private room`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};

export const emitNotification = (userId: string, notification: any) => {
    if (io) {
        // Emit to specific user room if userId is provided, otherwise to all
        if (userId && userId !== 'all') {
            io.to(userId).emit("notification", notification);
        } else {
            io.emit("notification", notification);
        }
    }
};

export const emitMessage = (receiverId: string, message: any) => {
    if (io) {
        io.to(receiverId).emit("message", message);
    }
};

export const emitOrderCreated = (order: any, vendorIds: string[]) => {
    if (io) {
        // Notify admin
        io.emit("order_created", order); 
        // Notify specific vendors
        vendorIds.forEach(vendorId => {
            io.to(vendorId).emit("order_created", order);
        });
    }
};

export const emitOrderUpdated = (order: any, buyerId?: string) => {
    if (io) {
        // Notify admin and the specific buyer
        io.emit("order_updated", order);
        if (buyerId) {
            io.to(buyerId).emit("order_updated", order);
        }
    }
};
