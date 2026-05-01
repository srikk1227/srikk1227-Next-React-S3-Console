import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics';

async function testStorageFunctionality(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region } = await request.json();

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Testing storage functionality:', {
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

    // Test activity tracking (should not throw localStorage error)
    const activityResult = analyticsService.trackUserActivity('test_storage_action', {
      test: true,
      timestamp: new Date().toISOString()
    });

    // Test activity analytics (should not throw localStorage error)
    const activityAnalytics = analyticsService.getUserActivityAnalytics();

    return NextResponse.json({
      success: true,
      tests: {
        activityTracking: !!activityResult,
        activityAnalytics: !!activityAnalytics,
        localStorageAvailable: typeof window !== 'undefined' && !!window.localStorage
      },
      activityResult,
      activityAnalytics
    });

  } catch (error) {
    console.error('Error testing storage functionality:', {
      name: error.name,
      message: error.message
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to test storage functionality',
        details: {
          name: error.name,
          message: error.message
        }
      },
      { status: 500 }
    );
  }
}

export const POST = protectApiRoute(testStorageFunctionality); 