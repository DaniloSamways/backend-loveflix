import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { PaymentService } from "../services/payment.service";
import { getIO } from "../utils/socket";
import { asyncHandler } from "../middlewares/asyncHandler";
import { PaymentRepository } from "../repositories/payment.repository";
import { DraftRepository } from "../repositories/draft.repository";
import { DraftService } from "../services/draft.service";
import { EmailService } from "../services/email.service";
import { env } from "../config/env";
import { MessageError } from "../errors/message.error";
import crypto from "crypto";
import { ImageService } from "../services/image.service";

export const paymentRoutes = Router();

const repository = new PaymentRepository();
const service = new PaymentService(repository);
const controller = new PaymentController(service);

const draftRepository = new DraftRepository();
const emailService = new EmailService(env.RESEND_API_KEY);
const imageService = new ImageService();
const draftService = new DraftService(
  draftRepository,
  service,
  imageService,
  emailService
);

paymentRoutes.post(
  "/pix",
  asyncHandler(controller.createPixPayment.bind(controller))
);

paymentRoutes.get(
  "/:paymentId/status",
  asyncHandler(controller.getPaymentStatus.bind(controller))
);

paymentRoutes.get(
  "/coupon/:code",
  asyncHandler(controller.findCouponByCode.bind(controller))
);

// Webhook Mercado Pago
paymentRoutes.post("/webhook", async (req, res) => {
  const { data } = req.body;
  const io = getIO();

  if (
    (!req.body.action || req.body.action !== "payment.updated") &&
    (!data.action || data.action !== "payment.updated")
  ) {
    res.status(200).end();
    return;
  }

  // Verificar assinatura do webhook
  const signature = req.headers["x-signature"];
  const requestId = req.headers["x-request-id"];
  const dataID = req.query?.["data.id"] as string;

  if (
    !signature ||
    typeof signature !== "string" ||
    !requestId ||
    typeof requestId !== "string" ||
    !dataID
  ) {
    throw new MessageError("Unauthorized");
  }

  const [ts, hash] = signature.split(",");

  const signatureTemplateParsed = `id:${dataID};request-id:${requestId};ts:${ts.replace("ts=", "")};`;

  const cyphedSignature = crypto
    .createHmac("sha256", env.MARCADOPAGO_SECRET_KEY)
    .update(signatureTemplateParsed)
    .digest("hex");

  if (cyphedSignature !== hash.replace("v1=", "")) {
    throw new MessageError("Unauthorized");
  }

  const transaction = await service.getMPOrderByTransactionId(data.id);

  if (!transaction) {
    throw new MessageError("Pagamento não encontrado");
  }

  const status = transaction.status;

  // Atualiza status no banco
  await service.updatePaymentStatus(
    data.id,
    status === "approved" ? "PAID" : "PENDING"
  );

  if (status === "approved") {
    const draft = await draftService.createDraftByPayment(data.id);

    // Notifica via WebSocket
    io.to(`payment_${data.id}`).emit("payment_update", draft);

    // Notifica via email
    await emailService.sendPaymentConfirmation(draft.email, draft.id);
  } else {
    // Notifica via WebSocket
    io.to(`payment_${data.id}`).emit("payment_update", status);
  }

  res.status(200).end();
});
