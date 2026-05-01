import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics';

async function testAnalytics(request) {
  try {
    const { accessKeyId, secretAccessKey, bucketName, region } = await request.json();

    // Validate inputs
    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Testing analytics functionality:', {
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

    // Test storage analytics
    const storageResult = await analyticsService.getStorageAnalytics();
    
    // Test activity tracking
    const activityResult = analyticsService.trackUserActivity('test_action', {
      test: true,
      timestamp: new Date().toISOString()
    });

    // Test activity analytics
    const activityAnalytics = analyticsService.getUserActivityAnalytics();

    // Test optimizations
    const optimizations = storageResult.success 
      ? analyticsService.getStorageOptimizations(storageResult.analytics)
      : [];

    return NextResponse.json({
      success: true,
      tests: {
        storage: storageResult.success,
        activityTracking: !!activityResult,
        activityAnalytics: !!activityAnalytics,
        optimizations: optimizations.length
      },
      storageAnalytics: storageResult.success ? storageResult.analytics : null,
      activityAnalytics: activityAnalytics,
      optimizations: optimizations
    });

  } catch (error) {
    console.error('Error testing analytics:', {
      name: error.name,
      message: error.message,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to test analytics',
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

export const POST = protectApiRoute(testAnalytics); 