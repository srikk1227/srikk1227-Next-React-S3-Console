import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { protectApiRoute } from '@/lib/auth';

async function uploadFile(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const awsConfig = JSON.parse(formData.get('awsConfig'));
    const prefix = formData.get('prefix') || '';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate AWS config
    if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey || !awsConfig.bucketName) {
      return NextResponse.json(
        { success: false, error: 'Invalid AWS configuration' },
        { status: 400 }
      );
    }

    // Create S3 client
    const s3Client = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });

    // Prepare file for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = prefix ? `${prefix}${file.name}` : file.name;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: awsConfig.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      key,
      name: file.name,
      size: formatFileSize(file.size),
      lastModified: new Date().toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    let errorMessage = 'Failed to upload file';
    if (error.name === 'AccessDenied') {
      errorMessage = 'Access denied. Please check your AWS credentials and permissions.';
    } else if (error.name === 'NoSuchBucket') {
      errorMessage = 'Bucket not found. Please check the bucket name.';
    } else if (error.name === 'InvalidAccessKeyId') {
      errorMessage = 'Invalid Access Key ID. Please check your credentials.';
    } else if (error.name === 'SignatureDoesNotMatch') {
      errorMessage = 'Invalid Secret Access Key. Please check your credentials.';
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const POST = protectApiRoute(uploadFile); 