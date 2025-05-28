import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

export const createPaymentSchema = z.object({
  email: z.string().email(),
  amount: z.number().optional(),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  transactionId: z.string().optional(),
  pixCode: z.string().optional(),
  qrCode: z.string().optional(),
  couponId: z.string().optional(),
  coupon: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  email: z.string().email(),
  amount: z.number().optional(),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  transactionId: z.string().optional(),
  pixCode: z.string().optional(),
  qrCode: z.string().optional(),
  couponId: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
