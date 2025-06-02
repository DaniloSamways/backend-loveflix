import express from "express";
import cors from "cors";
import { paymentRoutes } from "./routes/payment.routes";
import { draftRoutes } from "./routes/draft.routes";
import { imageRouter } from "./routes/image.routes";
import { errorHandler } from "./middlewares/errorHandler";
import helmet from "helmet";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";

export const createApp = () => {
  const app = express();

  app.set("trust proxy", true);

  // Configuração CORS
  const allowedOrigins = [
    "http://localhost:3000",
    "http://192.168.0.12:3000",
    "https://amorflix.com.br",
    "https://www.amorflix.com.br",
    "https://d1u5wlui9v9axz.cloudfront.net",
    "http://ec2-3-209-76-1.compute-1.amazonaws.com",
    "https://ec2-3-209-76-1.compute-1.amazonaws.com",
  ];

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Configuração do Helmet (proteção básica)
  app.use(helmet());

  // Configuração contra DDoS/brute force
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later",
  });

  // Aplica a todos as rotas
  app.use(limiter);

  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/api/payments", paymentRoutes);
  app.use("/api/drafts", draftRoutes);
  app.use("/api/images", imageRouter);

  app.use(errorHandler);

  return app;
};
