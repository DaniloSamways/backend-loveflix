import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env";

export const s3 = new S3Client({
  region: env.AWS_REGION,
  ...(env.ENVIRONMENT === "development"
    ? {
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
        },
        endpoint: env.AWS_ENDPOINT,
        forcePathStyle: true,
      }
    : undefined),
});

export interface FileMetadata {
  draftId?: string;
  contentType?: string;
}
