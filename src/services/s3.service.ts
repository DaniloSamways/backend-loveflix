import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { FileMetadata, s3 } from "../libs/s3";
import { env } from "../config/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
  constructor(
    private s3Client: S3Client = s3,
    private bucketName: string = env.AWS_BUCKET_NAME
  ) {}

  async uploadFile(key: string, buffer: Buffer, metadata: FileMetadata) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      Metadata: metadata as Record<string, string>,
      ContentType: metadata.contentType,
    });

    await this.s3Client.send(command);

    const url = `${env.AWS_ENDPOINT}/${key}`;

    return url;
  }

  async generatePresignedUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async listDraftFiles(draftId: string) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: `drafts/${draftId}/`,
    });

    const { Contents } = await this.s3Client.send(command);
    return Contents?.map((item) => item.Key!) || [];
  }
}
