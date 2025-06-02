import { configDotenv } from "dotenv";
import { z } from "zod";

configDotenv();

const envSchema = z.object({
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string(),
  MERCADOPAGO_ACCESS_TOKEN: z.string(),
  MARCADOPAGO_SECRET_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  PORT: z.string().default("3001"),

  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_ENDPOINT: z.string().optional(),
  AWS_FORCE_PATH_STYLE: z.string().optional(),

  ENVIRONMENT: z.string().default("development"),
});

export const env = envSchema.parse(process.env);
