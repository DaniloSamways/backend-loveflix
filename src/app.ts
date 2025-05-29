import express from "express";
import cors from "cors";
import { paymentRoutes } from "./routes/payment.routes";
import { draftRoutes } from "./routes/draft.routes";
import { errorHandler } from "./middlewares/errorHandler";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const createApp = () => {
  const app = express();

  // Configuração do Helmet (proteção básica)
  app.use(helmet());

  // Configuração contra DDoS/brute force
  // const limiter = rateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 minutos
  //   max: 100, // Limite de 100 requisições por IP
  //   standardHeaders: true,
  //   legacyHeaders: false,
  //   message: "Too many requests from this IP, please try again later",
  // });

  // Aplica a todos as rotas
  // app.use(limiter);

  app.use(cors());
  app.use(express.json());

  app.use("/api/payments", paymentRoutes);
  app.use("/api/drafts", draftRoutes);

  app.use(errorHandler);
  return app;
};
