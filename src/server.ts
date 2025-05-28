import http from "http";
import { createApp } from "./app";
import { initSocket } from "./utils/socket";
import { env } from "./config/env";

const app = createApp();
const server = http.createServer(app);

// Inicializa WebSocket
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
