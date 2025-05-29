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

  async findCouponByCode(req: Request, res: Response) {
    const { code } = req.params;
    const coupon = await this.paymentService.findCouponByCode(code);
    if (!coupon || coupon.usagesRemaining <= 0) {
      res.status(404).json({ message: "Cupom não encontrado" });
      return;
    }
    res.json({
      discount: coupon.discount,
    });
  }
}
