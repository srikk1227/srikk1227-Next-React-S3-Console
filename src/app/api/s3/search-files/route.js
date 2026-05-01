import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { protectApiRoute } from '@/lib/auth';

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function searchFiles(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region, query, prefix = '' } = await request.json();

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName || !query) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate query length
    if (query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    console.log('Searching S3 files:', {
      region,
      bucketName,
      prefix,
      query,
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

    // Search for files with the query in their name
    const searchResults = [];
    let continuationToken = undefined;
    const maxResults = 50; // Limit search results for performance
    const searchQuery = query.toLowerCase().trim();

    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000, // Get more objects per request for better search coverage
      });

      const response = await s3Client.send(command);

      if (response.Contents) {
        for (const item of response.Contents) {
          // Skip the prefix itself and folders
          if (item.Key === prefix || item.Key.endsWith('/')) continue;

          const fileName = item.Key.split('/').pop().toLowerCase();
          const fullPath = item.Key.toLowerCase();

          // Check if file name or path contains the search query
          if (fileName.includes(searchQuery) || fullPath.includes(searchQuery)) {
            searchResults.push({
              name: item.Key.split('/').pop(),
              key: item.Key,
              size: formatFileSize(item.Size),
              lastModified: item.LastModified.toISOString().split('T')[0],
              type: 'file'
            });

            // Limit results for performance
            if (searchResults.length >= maxResults) {
              break;
            }
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken && searchResults.length < maxResults);

    console.log('Search results:', {
      query: searchQuery,
      resultsFound: searchResults.length,
      maxResults,
      hasMore: continuationToken && searchResults.length >= maxResults
    });

    return NextResponse.json({
      success: true,
      files: searchResults,
      totalResults: searchResults.length,
      query: searchQuery,
      hasMore: continuationToken && searchResults.length >= maxResults
    });

  } catch (error) {
    console.error('Error searching S3 files:', {
      name: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });

    let errorMessage = 'Failed to search files';
    
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
        files: []
      },
      { status: 500 }
    );
  }
}

export const POST = protectApiRoute(searchFiles); 