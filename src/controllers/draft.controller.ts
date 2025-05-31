import { Request, Response } from "express";
import { DraftService } from "../services/draft.service";
import {
  createCustomizationDraftSchema,
  getByPaymentIdSchema,
  CreateCustomizationDraftInput,
  updateContentDraftSchema,
} from "../schemas/draft.schema";
import { DraftStatus } from "@prisma/client";

export class DraftController {
  constructor(private draftService: DraftService) {}

  async createDraft(req: Request, res: Response) {
    const input = createCustomizationDraftSchema.parse(req.body);
    const draft = await this.draftService.createDraft({
      ...input,
    });
    res.status(201).json(draft);
  }

  async getDraft(req: Request, res: Response) {
    const { id } = req.params;
    const draft = await this.draftService.getDraft(id);
    if (!draft || !draft.id) {
      res.status(404).end();
      return;
    }
    res.json({
      id: draft.id,
      content: draft.content,
      status: draft.status,
    });
  }

  async publishDraft(req: Request, res: Response) {
    const { id } = req.params;
    const draft = await this.draftService.publishDraft(id);

    if (!draft || draft.status !== DraftStatus.PUBLISHED) {
      res.status(404).end();
      return;
    }

    res.json({
      content: draft.content,
      status: draft.status,
    });
  }

  async getByPaymentId(req: Request, res: Response) {
    const { paymentId } = getByPaymentIdSchema.parse(req.params);
    const draft = await this.draftService.getByPaymentId(paymentId);
    res.json(draft);
  }

  async updateDraftContent(req: Request, res: Response) {
    const { id } = req.params;
    const input = updateContentDraftSchema.parse(req.body);
    const updatedDraft = await this.draftService.updateDraftContent(id, input);

    if (!updatedDraft || !updatedDraft.id) {
      res.status(404).end();
      return;
    }

    res.json({
      content: updatedDraft.content,
      status: updatedDraft.status,
    });
  }

  async deleteDraftUnusedImages(req: Request, res: Response) {
    const { draftId } = req.params;
    await this.draftService.deleteDraftUnusedImages(draftId);
    res.status(204).end();
  }
}
