import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { protectApiRoute } from '@/lib/auth';

async function createFolder(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region, prefix = '', folderName } = await request.json();
    if (!accessKeyId || !secretAccessKey || !bucketName || !folderName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const s3Client = new S3Client({
      region: region || 'us-east-1',
      credentials: { accessKeyId, secretAccessKey },
    });
    // S3 folder: zero-byte object with trailing slash
    const key = (prefix || '') + folderName.replace(/\/+$/, '') + '/';
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: '',
      ContentType: 'application/x-directory',
    });
    await s3Client.send(command);
    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create folder' }, { status: 500 });
  }
}

export const POST = protectApiRoute(createFolder); 