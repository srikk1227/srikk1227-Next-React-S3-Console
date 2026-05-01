import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { protectApiRoute } from '@/lib/auth';

async function deleteFolder(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region, prefix = '', folderName } = await request.json();
    if (!accessKeyId || !secretAccessKey || !bucketName || !folderName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const s3Client = new S3Client({
      region: region || 'us-east-1',
      credentials: { accessKeyId, secretAccessKey },
    });
    const folderPrefix = (prefix || '') + folderName.replace(/\/+$/, '') + '/';
    // List all objects under folderPrefix
    const listed = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName, Prefix: folderPrefix }));
    if (!listed.Contents || listed.Contents.length === 0) {
      return NextResponse.json({ success: false, error: 'No objects found in folder' }, { status: 404 });
    }
    // Delete all objects
    for (const obj of listed.Contents) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: obj.Key,
      }));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete folder error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete folder' }, { status: 500 });
  }
}

export const POST = protectApiRoute(deleteFolder); 