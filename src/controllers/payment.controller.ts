import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";
import { createPaymentSchema } from "../schemas/payment.schema";

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async createPixPayment(req: Request, res: Response) {
    const input = createPaymentSchema.parse(req.body);
    const result = await this.paymentService.createPixPayment(input);
    res.status(201).json(result);
  }

  async getPaymentStatus(req: Request, res: Response) {
    const { paymentId } = req.params;
    const status = await this.paymentService.verifyPayment(paymentId);
    res.json({ status });
  }
}
