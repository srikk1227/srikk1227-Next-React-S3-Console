import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { protectApiRoute } from '@/lib/auth';

async function generateDownloadUrl(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region, key } = await request.json();

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName || !key) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Generating download URL server-side:', {
      region,
      bucketName,
      key,
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

    // Generate presigned URL
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    
    // console.log('Generated download URL successfully');

    return NextResponse.json({
      success: true,
      url
    });

  } catch (error) {
    console.error('Error generating download URL:', {
      name: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });

    let errorMessage = 'Failed to generate download URL';
    
    if (error.name === 'AccessDenied') {
      errorMessage = 'Access denied. Please check your AWS credentials and permissions.';
    } else if (error.name === 'NoSuchBucket') {
      errorMessage = 'Bucket not found. Please check the bucket name.';
    } else if (error.name === 'NoSuchKey') {
      errorMessage = 'File not found. Please check the file path.';
    } else if (error.name === 'InvalidAccessKeyId') {
      errorMessage = 'Invalid Access Key ID. Please check your credentials.';
    } else if (error.name === 'SignatureDoesNotMatch') {
      errorMessage = 'Invalid Secret Access Key. Please check your credentials.';
    } else if (error.name === 'NetworkingError') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.name === 'Forbidden') {
      errorMessage = 'Forbidden. You may not have permission to access this file.';
    } else if (error.name === 'NotFound') {
      errorMessage = 'File not found. Please check the file path.';
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

export const POST = protectApiRoute(generateDownloadUrl); 