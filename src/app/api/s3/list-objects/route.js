import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { protectApiRoute } from '@/lib/auth';

async function listObjects(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region, prefix = '', page = 1, limit = 100 } = await request.json();

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Listing S3 objects server-side:', {
      region,
      bucketName,
      prefix,
      page,
      limit,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey
    });

    // Create S3 client
    const s3Client = new S3Client({
      region: region || 'us-east-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Calculate pagination
    const maxKeys = limit;
    let continuationToken = undefined;
    
    // Skip to the requested page
    for (let i = 1; i < page; i++) {
      const skipCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        Delimiter: '/',
        MaxKeys: maxKeys,
        ContinuationToken: continuationToken,
      });
      
      const skipResponse = await s3Client.send(skipCommand);
      continuationToken = skipResponse.NextContinuationToken;
      
      if (!continuationToken) {
        // No more pages available
        return NextResponse.json({
          success: true,
          folders: [],
          files: [],
          totalFiles: 0,
          hasMore: false,
          currentPage: page
        });
      }
    }

    // Get the actual page data
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: '/',
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    // Extract folders (CommonPrefixes)
    const folders = (response.CommonPrefixes || []).map(prefix => ({
      name: prefix.Prefix.replace(response.Prefix, '').replace('/', ''),
      key: prefix.Prefix,
      lastModified: new Date().toISOString().split('T')[0], // S3 doesn't provide folder dates
      type: 'folder'
    }));

    // Extract files (Contents)
    const files = (response.Contents || [])
      .filter(item => item.Key !== prefix) // Exclude the prefix itself
      .map(item => ({
        name: item.Key.split('/').pop(),
        key: item.Key,
        size: formatFileSize(item.Size),
        lastModified: item.LastModified.toISOString().split('T')[0],
        type: 'file'
      }));

    return NextResponse.json({
      success: true,
      folders,
      files,
      totalFiles: files.length, // This would need a separate count query for accurate total
      hasMore: !!response.NextContinuationToken,
      currentPage: page
    });

  } catch (error) {
    console.error('Error listing S3 objects:', {
      name: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });

    let errorMessage = 'Failed to list objects';
    
    if (error.name === 'AccessDenied') {
      errorMessage = 'Access denied. Please check your AWS credentials and permissions.';
    } else if (error.name === 'NoSuchBucket') {
      errorMessage = 'Bucket not found. Please check the bucket name.';
    } else if (error.name === 'InvalidAccessKeyId') {
      errorMessage = 'Invalid Access Key ID. Please check your credentials.';
    } else if (error.name === 'SignatureDoesNotMatch') {
      errorMessage = 'Invalid Secret Access Key. Please check your credentials.';
    } else if (error.name === 'NetworkingError') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.name === 'Forbidden') {
      errorMessage = 'Forbidden. You may not have permission to access this bucket.';
    } else if (error.name === 'NotFound') {
      errorMessage = 'Bucket or object not found. Please check the bucket name and region.';
    } else if (error.name === 'ServiceUnavailable') {
      errorMessage = 'S3 service is temporarily unavailable. Please try again later.';
    } else {
      errorMessage = error.message || 'An unexpected error occurred.';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: {
          name: error.name,
          code: error.$metadata?.httpStatusCode,
          requestId: error.$metadata?.requestId
        },
        folders: [],
        files: []
      },
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

export const POST = protectApiRoute(listObjects); 