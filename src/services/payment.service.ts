import { PaymentStatus } from "@prisma/client";
import { mercadopagoPayment } from "../config/mercadoPago";
import { PaymentRepository } from "../repositories/payment.repository";
import { CreatePaymentInput } from "../schemas/payment.schema";
import { MessageError } from "../errors/message.error";

export class PaymentService {
  constructor(private paymentRepository: PaymentRepository) {}

  async updatePaymentDraftId(paymentId: string, draftId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new MessageError("Pagamento não encontrado");
    }

    const updatedPayment = await this.paymentRepository.updatePaymentDraftId(
      paymentId,
      draftId
    );

    return updatedPayment;
  }

  async getPaymentById(paymentId: string) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new MessageError("Pagamento não encontrado");
    }
    return payment;
  }

  async getPaymentByTransactionId(transactionId: string) {
    const payment =
      await this.paymentRepository.findByTransactionId(transactionId);
    if (!payment) {
      throw new MessageError("Pagamento não encontrado");
    }
    return payment;
  }

  async getMPOrderByTransactionId(transactionId: string) {
    const payment = await mercadopagoPayment.get({ id: Number(transactionId) });

    if (!payment) {
      throw new MessageError("Pagamento não encontrado");
    }
    return payment;
  }

  async createPixPayment(input: CreatePaymentInput) {
    let amount = 15.0;

    let coupon;

    if (input.coupon) {
      // Verifica se o cupom existe e aplica desconto
      coupon = await this.paymentRepository.findCouponByCode(input.coupon);
      if (coupon) {
        amount = 15.0 - coupon.discount;
      } else {
        throw new MessageError("Cupom inválido");
      }
    }

    // 1. Cria pagamento no Mercado Pago
    const payment = await mercadopagoPayment.create({
      body: {
        transaction_amount: amount,
        payment_method_id: "pix",
        payer: {
          email: input.email,
        },
        description: `Personalização LoveFlix - ${input.email}`,
      },
    });

    // 2. Extrai dados do PIX
    const pixData = payment.point_of_interaction?.transaction_data;

    if (!pixData || !payment.id) {
      throw new MessageError("Falha ao gerar PIX");
    }

    // 3. Cria payment no banco
    await this.paymentRepository.createPayment({
      transactionId: payment.id?.toString(),
      amount: payment.transaction_amount,
      couponId: coupon?.id,
      pixCode: pixData.qr_code,
      qrCode: pixData.qr_code_base64,
      status: "PENDING",
      email: input.email,
    });

    return {
      paymentId: payment.id,
      qrCode: pixData.qr_code_base64,
      pixCode: pixData.qr_code,
      amount: payment.transaction_amount,
      // expiresAt: new Date(pixData.),
    };
  }

  async getTransactionStatus(transactionId: string) {
    try {
      const payment = await this.getMPOrderByTransactionId(transactionId);
      return payment.status;
    } catch (error) {
      throw new MessageError("Falha ao obter status do pagamento");
    }
  }

  async updatePaymentStatus(transactionId: string, status: PaymentStatus) {
    try {
      const payment = await this.getMPOrderByTransactionId(transactionId);

      if (!payment) {
        throw new MessageError("Pagamento não encontrado");
      }

      if (payment.status === status) {
        throw new MessageError("O status do pagamento já está atualizado");
      }

      await this.paymentRepository.updatePaymentStatus(transactionId, status);
    } catch (error) {
      throw new MessageError("Falha ao atualizar o status do pagamento");
    }
  }

  async verifyPayment(paymentId: string) {
    const payment = await mercadopagoPayment.get({ id: Number(paymentId) });
    return payment.status;
  }
}
