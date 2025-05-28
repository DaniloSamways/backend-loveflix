import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { createPaymentSchema } from "../schemas/payment.schema";
import { PaymentService } from "../services/payment.service";
import { getIO } from "../utils/socket";
import { validate } from "../middlewares/validate";
import { prisma } from "../utils/prisma";
import { asyncHandler } from "../middlewares/asyncHandler";
import { PaymentRepository } from "../repositories/payment.repository";
import { DraftRepository } from "../repositories/draft.repository";
import { DraftService } from "../services/draft.service";
import { EmailService } from "../services/email.service";
import { env } from "../config/env";

export const paymentRoutes = Router();

const repository = new PaymentRepository();
const service = new PaymentService(repository);
const controller = new PaymentController(service);

const draftRepository = new DraftRepository();
const emailService = new EmailService(env.RESEND_API_KEY);
const draftService = new DraftService(draftRepository, service, emailService);

paymentRoutes.post(
  "/pix",
  asyncHandler(controller.createPixPayment.bind(controller))
);
paymentRoutes.get(
  "/:paymentId/status",
  asyncHandler(controller.getPaymentStatus.bind(controller))
);

// Webhook Mercado Pago
paymentRoutes.post("/webhook", async (req, res) => {
  const { id, status } = req.body;
  const io = getIO();

  console.log(req.body);

  // Atualiza status no banco
  await service.updatePaymentStatus(
    id,
    status === "approved" ? "PAID" : "PENDING"
  );

  if (status === "approved") {
    const draft = await draftService.createDraftByPayment(id);

    // Notifica via WebSocket
    io.to(`payment_${id}`).emit("payment_update", draft);

    // Notifica via email
    await emailService.sendPaymentConfirmation(draft.email, draft.id);
  } else {
    // Notifica via WebSocket
    io.to(`payment_${id}`).emit("payment_update", status);
  }

  res.status(200).end();
});
