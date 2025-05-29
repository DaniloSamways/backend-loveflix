import { Image } from "@prisma/client";
import { S3Service } from "../services/s3.service";
import { prisma } from "../utils/prisma";
import { MessageError } from "../errors/message.error";

export class ImageRepository {
  constructor(
    private s3Service: S3Service = new S3Service(),
    private bucketFolder = "drafts"
  ) {}

  async uploadImage(
    file: Buffer,
    draftId: string,
    metadata?: { contentType?: string }
  ): Promise<Image> {
    const key = `${this.bucketFolder}/${draftId}/${Date.now()}.webp`;

    // Upload para S3
    const url = await this.s3Service.uploadFile(key, file, {
      draftId,
      contentType: metadata?.contentType || "image/webp",
    });

    // Salva metadados no banco
    return prisma.image.create({
      data: {
        url,
        key,
        draftId,
        contentType: metadata?.contentType,
      },
    });
  }

  async deleteImage(imageId: string): Promise<void> {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) throw new MessageError("Image not found");

    // Remove do S3
    await this.s3Service.deleteFile(image.key);

    // Remove do banco
    await prisma.image.delete({
      where: { id: imageId },
    });
  }

  async listDraftImages(draftId: string): Promise<Image[]> {
    return prisma.image.findMany({
      where: { draftId },
    });
  }

  async cleanupDraftImages(draftId: string): Promise<void> {
    const images = await this.listDraftImages(draftId);
    const s3Keys = images.map((img) => img.key);

    // Remove todas as imagens do S3
    await Promise.all(s3Keys.map((key) => this.s3Service.deleteFile(key)));

    // Remove registros do banco
    await prisma.image.deleteMany({
      where: { draftId },
    });
  }

  async generatePresignedUrl(
    key: string,
    contentType: string
  ): Promise<string> {
    return this.s3Service.generatePresignedUrl(key, contentType);
  }

  async listDraftFiles(draftId: string) {
    return await this.s3Service.listDraftFiles(draftId);
  }
}
