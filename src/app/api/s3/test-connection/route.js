import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { protectApiRoute } from '@/lib/auth';

async function testConnection(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region } = await request.json();

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Testing S3 connection server-side:', {
      region,
      bucketName,
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

    // Test connection by listing objects
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1,
    });

    console.log('Sending ListObjectsV2Command...');
    const result = await s3Client.send(command);
    console.log('S3 connection test successful:', result);

    return NextResponse.json({
      success: true,
      message: 'Connection successful',
      bucketInfo: {
        name: bucketName,
        region: region || 'us-east-1',
        objectCount: result.KeyCount || 0
      }
    });

  } catch (error) {
    console.error('S3 connection test failed:', {
      name: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      cfId: error.$metadata?.cfId,
      extendedRequestId: error.$metadata?.extendedRequestId
    });

    let errorMessage = 'Failed to connect to S3';
    
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
        }
      },
      { status: 500 }
    );
  }
}

export const POST = protectApiRoute(testConnection); 