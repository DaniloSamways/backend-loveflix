import sharp from "sharp";
import { ImageRepository } from "../repositories/image.repository";
import { CustomizationDraft, DraftStatus, Image } from "@prisma/client";
import { MessageError } from "../errors/message.error";
import { Content } from "../types/content";
import { ImageLimitError } from "../errors/imagelimit.error";

export class ImageService {
  constructor(
    private imageRepository: ImageRepository = new ImageRepository()
  ) {}

  async uploadImage(file: Buffer, draft: CustomizationDraft): Promise<Image> {
    if (!file) throw new MessageError("Imagem não fornecida");
    if (!draft) throw new MessageError("Rascunho não encontrado");

    const imagesCount = await this.countDraftImages(draft.id);

    if (imagesCount >= 20) {
      throw new ImageLimitError("Número máximo de 20 imagens atingido.");
    }

    // Otimiza a imagem
    const optimizedFile = await sharp(file)
      .resize(800, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    return this.imageRepository.uploadImage(optimizedFile, draft.id, {
      contentType: "image/webp",
    });
  }

  async deleteImage(imageId: string): Promise<void> {
    if (!imageId) throw new MessageError("No image ID provided");
    await this.imageRepository.deleteImage(imageId);
  }

  async getDraftImages(draftId: string): Promise<Image[]> {
    return this.imageRepository.listDraftImages(draftId);
  }

  async cleanupDraftImages(draftId: string): Promise<void> {
    await this.imageRepository.cleanupDraftImages(draftId);
  }

  async generateUploadUrl(
    draftId: string,
    contentType: string
  ): Promise<string> {
    const key = `drafts/${draftId}/${Date.now()}.webp`;
    return this.imageRepository.generatePresignedUrl(key, contentType);
  }

  async verifyUnusedDraftImages(draft: CustomizationDraft) {
    const content = draft?.content as unknown as Content;

    if (!draft || draft.status !== DraftStatus.DRAFT) {
      throw new MessageError("Rascunho não encontrado");
    }

    const contentImages =
      (content.sections?.map((s) => s.photos || []).flat() || [])?.map(
        (p) => p.image_src
      ) || [];

    const thumbnailImage = content?.thumbnail;

    const draftImages = await this.imageRepository.listDraftImages(draft.id);

    const unusedImages = draftImages.filter(
      (image) =>
        !contentImages.includes(image.url) && image.url !== thumbnailImage
    );

    // Exclui imagens não utilizadas
    if (unusedImages.length > 0) {
      await Promise.all(
        unusedImages.map((image) => this.imageRepository.deleteImage(image.id))
      );
    }
  }

  async countDraftImages(draftId: string): Promise<number> {
    if (!draftId) throw new MessageError("Rascunho não encontrado");
    const images = await this.imageRepository.listDraftImages(draftId);
    return images.length;
  }
}
