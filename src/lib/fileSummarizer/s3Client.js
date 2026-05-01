import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * Creates an S3 client with the provided credentials
 * @param {Object} credentials - AWS credentials and configuration
 * @returns {S3Client} - Configured S3 client
 */
export function createS3Client(credentials) {
  return new S3Client({
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  });
}

/**
 * Retrieves file content from S3
 * @param {S3Client} s3Client - The S3 client
 * @param {string} bucketName - The S3 bucket name
 * @param {string} key - The file key
 * @returns {Promise<string>} - The file content
 */
export async function getFileContent(s3Client, bucketName, key) {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const s3Response = await s3Client.send(getObjectCommand);
  
  if (!s3Response.Body) {
    throw new Error('File content is empty');
  }

  return await s3Response.Body.transformToString();
} 