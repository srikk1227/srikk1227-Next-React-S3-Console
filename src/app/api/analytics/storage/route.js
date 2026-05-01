import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics';

async function getStorageAnalytics(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region, prefix = '' } = await request.json();

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Getting storage analytics:', {
      region,
      bucketName,
      prefix,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey
    });

    // Create analytics service
    const analyticsService = new AnalyticsService({
      accessKeyId,
      secretAccessKey,
      bucketName,
      region: region || 'us-east-1'
    });

    // Get storage analytics
    const result = await analyticsService.getStorageAnalytics(prefix);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analytics: result.analytics
    });

  } catch (error) {
    console.error('Error getting storage analytics:', {
      name: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });

    let errorMessage = 'Failed to get storage analytics';
    
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

export const POST = protectApiRoute(getStorageAnalytics); 