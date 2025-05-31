import { Server } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://your-production-domain.com",
        "http://192.168.0.*:3000",
      ],
    },
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
