import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics';



export const POST = protectApiRoute(async (request) => {
  const body = await request.json();
  
  // Check if this is a tracking request or analytics request
  if (body.action) {
    // For tracking requests, pass the already parsed body
    return handleTrackUserActivity(body);
  } else {
    // For analytics requests, pass the already parsed body
    return handleGetUserActivityAnalytics(body);
  }
});

async function handleGetUserActivityAnalytics(body) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region } = body;

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Getting user activity analytics:', {
      region,
      bucketName,
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

    // Get user activity analytics
    const analytics = analyticsService.getUserActivityAnalytics();

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error getting user activity analytics:', {
      name: error.name,
      message: error.message
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get user activity analytics'
      },
      { status: 500 }
    );
  }
}

async function handleTrackUserActivity(body) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region, action, details = {} } = body;

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Tracking user activity:', {
      region,
      bucketName,
      action,
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

    // Track the activity
    const activity = analyticsService.trackUserActivity(action, details);

    return NextResponse.json({
      success: true,
      activity
    });

  } catch (error) {
    console.error('Error tracking user activity:', {
      name: error.name,
      message: error.message
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to track user activity'
      },
      { status: 500 }
    );
  }
} 