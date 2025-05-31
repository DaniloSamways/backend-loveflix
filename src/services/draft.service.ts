import { DraftStatus } from "@prisma/client";
import { DraftRepository } from "../repositories/draft.repository";
import {
  CreateCustomizationDraftInput,
  UpdateContentDraftInput,
} from "../schemas/draft.schema";
import { EmailService } from "./email.service";
import { MessageError } from "../errors/message.error";
import { PaymentService } from "./payment.service";
import { env } from "../config/env";
import { ImageService } from "./image.service";

export class DraftService {
  constructor(
    private draftRepository: DraftRepository = new DraftRepository(),
    private paymentService: PaymentService,
    private imageService: ImageService = new ImageService(),
    private emailService: EmailService = new EmailService(env.RESEND_API_KEY)
  ) {}

  async createDraft(input: CreateCustomizationDraftInput) {
    return this.draftRepository.createDraft(input);
  }

  async createDraftByPayment(paymentId: string) {
    const payment =
      await this.paymentService.getPaymentByTransactionId(paymentId);

    // Verifica se já tem algum rascunho para este pagamento
    const existingDraft = await this.draftRepository.findByPaymentId(
      payment.id
    );

    if (existingDraft) {
      throw new MessageError("Já existe um rascunho para este pagamento");
    }

    if (!payment || payment.status !== "PAID") {
      throw new MessageError("Pagamento não encontrado");
    }
    const draft = await this.draftRepository.createDraft({
      content: {},
      paymentId: payment.id,
      email: payment.email,
      couponId: payment.couponId,
    });

    // Atualiza o Payment com o id do draft
    await this.paymentService.updatePaymentDraftId(payment.id, draft.id);

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

    await this.imageService.verifyUnusedDraftImages(draft);

    return this.draftRepository.publishDraft(id);
  }

  async deleteDraftUnusedImages(id: string) {
    const draft = await this.draftRepository.findById(id);

    if (!draft) {
      throw new MessageError("Rascunho não encontrado");
    }

    if (draft.status !== DraftStatus.DRAFT) {
      throw new MessageError("Apenas rascunhos podem ter imagens deletadas");
    }

    return this.imageService.verifyUnusedDraftImages(draft);
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

    const updatedDraft = await this.draftRepository.updateDraftContent(
      id,
      input
    );

    return updatedDraft;
  }
}
