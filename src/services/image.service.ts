import { ImageRepository } from "../repositories/image.repository";
import sharp from "sharp";

export class ImageService {
  constructor(private imageRepository: ImageRepository) {}

  async uploadImage(file: Buffer): Promise<{ path: string; id: string }> {
    if (!file) {
      throw new Error("No file provided");
    }

    const optmizedFile = await sharp(file)
      .resize(800)
      .webp({ quality: 80 })
      .toBuffer();

    const image = await this.imageRepository.uploadImage(optmizedFile);
    return image;
  }

  async deleteImage(imageId: string): Promise<void> {
    if (!imageId) {
      throw new Error("No image ID provided");
    }

    await this.imageRepository.deleteImage(imageId);
  }
}
