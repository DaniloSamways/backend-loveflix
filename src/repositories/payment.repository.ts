import { PaymentStatus } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { CreatePaymentInput } from "../schemas/payment.schema";

export class PaymentRepository {
  async decrementCouponRemaining(id: string) {
    return prisma.coupon.update({
      where: { id },
      data: { usagesRemaining: { decrement: 1 } },
    });
  }

  async updatePaymentDraftId(paymentId: string, draftId: string) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { draftId },
    });
  }

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
    });
  }

  async findByTransactionId(id: string) {
    return prisma.payment.findUnique({
      where: { transactionId: id },
    });
  }

  async createPayment(data: CreatePaymentInput) {
    return prisma.payment.create({
      data: {
        amount: data.amount ?? 15.0, // Default amount if not provided
        status: data.status ?? PaymentStatus.PENDING, // Default status if not provided
        transactionId: data.transactionId!,
        pixCode: data.pixCode,
        qrCode: data.qrCode,
        email: data.email,
        couponId: data.couponId || null, // Allow null if no coupon
      },
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    return prisma.payment.updateMany({
      where: { transactionId: id },
      data: { status },
    });
  }

  async findCouponByCode(code: string) {
    return prisma.coupon.findUnique({
      where: { code },
    });
  }

  async findCouponById(id: string) {
    return prisma.coupon.findUnique({
      where: { id },
    });
  }
}
