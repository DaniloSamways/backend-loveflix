import { prisma } from "../utils/prisma";

import {
  CreateCustomizationDraftInput,
  UpdateContentDraftInput,
} from "../schemas/draft.schema";
import { DraftStatus, Prisma } from "@prisma/client";

export class DraftRepository {
  async createDraft(data: CreateCustomizationDraftInput) {
    return prisma.customizationDraft.create({
      data: {
        email: data.email,
        content: data.content as Prisma.JsonObject,
        status: "DRAFT",
        paymentId: data.paymentId,
        couponId: data.couponId,
      },
    });
  }

  async findByPaymentId(paymentId: string) {
    return prisma.customizationDraft.findFirst({
      where: { paymentId },
    });
  }

  async findById(id: string) {
    return prisma.customizationDraft.findUnique({
      where: { id },
    });
  }

  async publishDraft(id: string) {
    return prisma.customizationDraft.update({
      where: { id },
      data: {
        status: "PUBLISHED",
      },
    });
  }

  async updateStatusByPaymentId(paymentId: string, status: DraftStatus) {
    return prisma.customizationDraft.updateMany({
      where: { paymentId },
      data: { status },
    });
  }

  async deleteExpiredDrafts() {
    return prisma.customizationDraft.deleteMany({
      where: {
        status: { in: ["EXPIRED"] },
      },
    });
  }

  async updateDraftContent(id: string, data: UpdateContentDraftInput) {
    return prisma.customizationDraft.update({
      where: { id },
      data: {
        content: data.content as Prisma.JsonObject,
      },
    });
  }
}
