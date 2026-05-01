import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics';



export const POST = protectApiRoute(async (request) => {
  const body = await request.json();
  
  // Check if this is a download request
  if (body.download) {
    return handleDownloadReport(body);
  } else {
    return handleGenerateReport(body);
  }
});

async function handleGenerateReport(body) {
  try {
    const { 
      accessKeyId, 
      secretAccessKey, 
      bucketName, 
      region, 
      options = {},
      format = 'json'
    } = body;

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Generating analytics report:', {
      region,
      bucketName,
      format,
      options,
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

    // Generate custom report
    const report = await analyticsService.generateCustomReport(options);

    // Export in requested format
    const exportedData = await analyticsService.exportAnalyticsData(format);

    return NextResponse.json({
      success: true,
      report,
      exportedData,
      format
    });

  } catch (error) {
    console.error('Error generating analytics report:', {
      name: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });

    let errorMessage = 'Failed to generate analytics report';
    
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

async function handleDownloadReport(body) {
  try {
    const { 
      accessKeyId, 
      secretAccessKey, 
      bucketName, 
      region, 
      format = 'json',
      options = {}
    } = body;

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Downloading analytics report:', {
      region,
      bucketName,
      format,
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

    // Export data in requested format
    const exportedData = await analyticsService.exportAnalyticsData(format);

    // Set appropriate headers for download
    const headers = {
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
      'Content-Disposition': `attachment; filename="next-react-s3-console-analytics-${new Date().toISOString().split('T')[0]}.${format}"`,
    };

    return new NextResponse(exportedData, { headers });

  } catch (error) {
    console.error('Error downloading analytics report:', {
      name: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });

    let errorMessage = 'Failed to download analytics report';
    
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