import { NextRequest, NextResponse } from 'next/server';
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { protectApiRoute } from '@/lib/auth';

async function moveFile(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region, oldKey, newKey } = await request.json();
    if (!accessKeyId || !secretAccessKey || !bucketName || !oldKey || !newKey) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (oldKey === newKey) {
      return NextResponse.json({ success: false, error: 'Source and destination are the same' }, { status: 400 });
    }
    const s3Client = new S3Client({
      region: region || 'us-east-1',
      credentials: { accessKeyId, secretAccessKey },
    });
    // Copy to new key
    await s3Client.send(new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldKey}`,
      Key: newKey,
    }));
    // Delete old key
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldKey,
    }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Move file error:', error);
    return NextResponse.json({ success: false, error: 'Failed to move file' }, { status: 500 });
  }
}

export const POST = protectApiRoute(moveFile); 