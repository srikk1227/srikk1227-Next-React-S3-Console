import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { protectApiRoute } from '@/lib/auth';

async function renameFolder(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region, prefix = '', oldName, newName } = await request.json();
    if (!accessKeyId || !secretAccessKey || !bucketName || !oldName || !newName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const s3Client = new S3Client({
      region: region || 'us-east-1',
      credentials: { accessKeyId, secretAccessKey },
    });
    const oldPrefix = (prefix || '') + oldName.replace(/\/+$/, '') + '/';
    const newPrefix = (prefix || '') + newName.replace(/\/+$/, '') + '/';
    // List all objects under oldPrefix
    const listed = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName, Prefix: oldPrefix }));
    if (!listed.Contents || listed.Contents.length === 0) {
      return NextResponse.json({ success: false, error: 'No objects found in folder' }, { status: 404 });
    }
    // Copy each object to new prefix
    for (const obj of listed.Contents) {
      const oldKey = obj.Key;
      const newKey = newPrefix + oldKey.substring(oldPrefix.length);
      await s3Client.send(new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldKey}`,
        Key: newKey,
      }));
    }
    // Delete all old objects
    for (const obj of listed.Contents) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: obj.Key,
      }));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rename folder error:', error);
    return NextResponse.json({ success: false, error: 'Failed to rename folder' }, { status: 500 });
  }
}

export const POST = protectApiRoute(renameFolder); 