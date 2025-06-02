import { Server, Socket } from "socket.io";

let io: Server;

export const initSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://192.168.0.12:3000",
        "https://amorflix.com.br",
        "https://www.amorflix.com.br",
        "https://d1u5wlui9v9axz.cloudfront.net",
        "http://ec2-3-209-76-1.compute-1.amazonaws.com",
        "https://ec2-3-209-76-1.compute-1.amazonaws.com",
      ],
    },
    allowEIO3: true, // Permite compatibilidade com Engine.IO v3
    transports: ["websocket", "polling"], // Habilita explicitamente ambos os transportes
    pingInterval: 25000,
    pingTimeout: 20000,
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
