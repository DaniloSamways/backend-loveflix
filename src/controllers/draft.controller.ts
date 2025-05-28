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
    res.json(draft);
  }

  async publishDraft(req: Request, res: Response) {
    const { id } = req.params;
    const draft = await this.draftService.publishDraft(id);
    res.json(draft);
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
    res.json(updatedDraft);
  }
}
