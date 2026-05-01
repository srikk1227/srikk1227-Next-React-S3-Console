import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { protectApiRoute } from '@/lib/auth';

async function listAllFolders(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region } = await request.json();
    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const s3Client = new S3Client({
      region: region || 'us-east-1',
      credentials: { accessKeyId, secretAccessKey },
    });
    const folders = new Set();
    
    // Function to recursively list folders
    async function listFoldersRecursively(prefix = '') {
      let continuationToken = undefined;
      let iteration = 0;
      
      do {
        iteration++;
        
        const response = await s3Client.send(new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
          Delimiter: '/',
          ContinuationToken: continuationToken,
        }));
        
        // Add current prefix as a folder if it's not empty
        if (prefix && !folders.has(prefix)) {
          folders.add(prefix);
        }
        
        // Add all common prefixes (subdirectories)
        if (response.CommonPrefixes) {
          for (const commonPrefix of response.CommonPrefixes) {
            folders.add(commonPrefix.Prefix);
            // Recursively list subdirectories
            await listFoldersRecursively(commonPrefix.Prefix);
          }
        }
        
        // Add all parent folders of each object
        if (response.Contents) {
          for (const obj of response.Contents) {
            const parts = obj.Key.split('/');
            for (let i = 1; i < parts.length; i++) {
              const folder = parts.slice(0, i).join('/') + '/';
              folders.add(folder);
            }
          }
        }
        
        continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
      } while (continuationToken);
    }
    
    // Start recursive listing from root
    await listFoldersRecursively();
    
    const sortedFolders = Array.from(folders).sort();
    return NextResponse.json({ success: true, folders: sortedFolders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to list folders' }, { status: 500 });
  }
}

export const POST = protectApiRoute(listAllFolders); 