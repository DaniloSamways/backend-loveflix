import { configDotenv } from "dotenv";
import { z } from "zod";

configDotenv();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  MERCADOPAGO_ACCESS_TOKEN: z.string(),
  MARCADOPAGO_SECRET_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  PORT: z.string().default("3001"),
});

export const env = envSchema.parse(process.env);
