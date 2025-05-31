import { Request, Response } from "express";
import { ImageService } from "../services/image.service";
import { DraftService } from "../services/draft.service";

export class ImageController {
  constructor(
    private readonly draftService: DraftService,
    private imageService: ImageService = new ImageService()
  ) {}

  async upload(req: Request, res: Response) {
    const { draftId } = req.params;
    const file = req.file?.buffer;

    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const draft = await this.draftService.getDraft(draftId);

    if (!draft) {
      res.status(404).json({ error: "Draft not found" });
      return;
    }

    const image = await this.imageService.uploadImage(file, draft);
    res.status(201).json({
      url: image.url,
      id: image.id,
    });
  }

  async listByDraft(req: Request, res: Response) {
    const { draftId } = req.params;
    const images = await this.imageService.getDraftImages(draftId);
    res.json(images);
  }

  async delete(req: Request, res: Response) {
    const { imageId } = req.params;
    await this.imageService.deleteImage(imageId);

    res.status(204).send();
  }
}
