import { DraftStatus } from "@prisma/client";
import { DraftRepository } from "../repositories/draft.repository";
import {
  CreateCustomizationDraftInput,
  UpdateContentDraftInput,
} from "../schemas/draft.schema";
import { EmailService } from "./email.service";
import { MessageError } from "../errors/message.error";
import { PaymentService } from "./payment.service";

export class DraftService {
  constructor(
    private draftRepository: DraftRepository,
    private paymentService: PaymentService,
    private emailService: EmailService
  ) {}

  async createDraft(input: CreateCustomizationDraftInput) {
    return this.draftRepository.createDraft(input);
  }

  async createDraftByPayment(paymentId: string) {
    const payment = await this.paymentService.getPaymentById(paymentId);
    if (!payment || payment.status !== "PAID") {
      throw new MessageError("Pagamento não encontrado");
    }
    const draft = await this.draftRepository.createDraft({
      content: {},
      paymentId: payment.id,
      email: payment.email,
    });

    return draft;
  }

  async getDraft(id: string) {
    return this.draftRepository.findById(id);
  }

  async publishDraft(id: string) {
    const draft = await this.draftRepository.findById(id);

    if (draft?.status !== DraftStatus.DRAFT) {
      throw new MessageError("Apenas rascunhos podem ser publicados");
    }

    return this.draftRepository.publishDraft(id);
  }

  async getByPaymentId(paymentId: string) {
    return this.draftRepository.findByPaymentId(paymentId);
  }

  async cleanExpiredDrafts() {
    return this.draftRepository.deleteExpiredDrafts();
  }

  async updateDraftContent(id: string, input: UpdateContentDraftInput) {
    const draft = await this.draftRepository.findById(id);

    if (draft?.status !== DraftStatus.DRAFT) {
      throw new MessageError("Apenas rascunhos podem ser atualizados");
    }

    return this.draftRepository.updateDraftContent(id, input);
  }
}
