import express from "express";
import { DraftController } from "../controllers/draft.controller";
import { DraftRepository } from "../repositories/draft.repository";
import { DraftService } from "../services/draft.service";
import { EmailService } from "../services/email.service";
import { asyncHandler } from "../middlewares/asyncHandler";
import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentService } from "../services/payment.service";
import { ImageService } from "../services/image.service";

const draftRoutes = express.Router();

const emailService = new EmailService(process.env.RESEND_API_KEY!);

const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository);

const repository = new DraftRepository();
const imageService = new ImageService();
const service = new DraftService(
  repository,
  paymentService,
  imageService,
  emailService
);
const controller = new DraftController(service);

draftRoutes.get("/:id", asyncHandler(controller.getDraft.bind(controller)));
draftRoutes.patch(
  "/:id",
  asyncHandler(controller.updateDraftContent.bind(controller))
);
draftRoutes.post(
  "/publish/:id",
  asyncHandler(controller.publishDraft.bind(controller))
);
draftRoutes.get(
  "/by-payment/:paymentId",
  asyncHandler(controller.getByPaymentId.bind(controller))
);
draftRoutes.get(
  "/unused-images/:draftId",
  asyncHandler(controller.deleteDraftUnusedImages.bind(controller))
);

export { draftRoutes };
