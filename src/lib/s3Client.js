import { S3Client } from "@aws-sdk/client-s3";

export function createS3Client(config) {
  return new S3Client({
    region: config.region || "us-east-1", // Default to us-east-1 if not specified
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}
