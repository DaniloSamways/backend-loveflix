import { z } from "zod";

export const createCustomizationDraftSchema = z.object({
  email: z.string().email(),
  content: z.record(z.unknown()), // Para o campo Json
  paymentId: z.string(),
});

export const updateContentDraftSchema = z.object({
  content: z.record(z.unknown()),
});

export const getByPaymentIdSchema = z.object({
  paymentId: z.string(),
});

export type CreateCustomizationDraftInput = z.infer<
  typeof createCustomizationDraftSchema
>;
export type UpdateContentDraftInput = z.infer<typeof updateContentDraftSchema>;
export type GetByPaymentIdInput = z.infer<typeof getByPaymentIdSchema>;
