import { Server, Socket } from "socket.io";

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

  io.on("connection", (socket: Socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on("join_payment_room", (paymentId: string) => {
      socket.join(`payment_${paymentId}`);
      console.log(`Cliente ${socket.id} entrou na sala payment_${paymentId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
