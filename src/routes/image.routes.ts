import { Router } from "express";
import { ImageController } from "../controllers/image.controller";
import { safeUpload, uploadMiddleware } from "../middlewares/upload";
import { asyncHandler } from "../middlewares/asyncHandler";
import { DraftService } from "../services/draft.service";
import { DraftRepository } from "../repositories/draft.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentService } from "../services/payment.service";

const imageRouter = Router();

const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository);

const draftRepository = new DraftRepository();
const draftService = new DraftService(draftRepository, paymentService);
const controller = new ImageController(draftService);

imageRouter.post(
  "/draft/:draftId",
  safeUpload,
  asyncHandler(controller.upload.bind(controller))
);

export { imageRouter };
