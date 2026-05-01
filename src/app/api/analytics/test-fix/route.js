import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';

async function testBodyReading(request) {
  try {
    // Read the body once
    const body = await request.json();
    
    console.log('Test body reading - received:', {
      hasAction: !!body.action,
      hasDownload: !!body.download,
      keys: Object.keys(body)
    });

    return NextResponse.json({
      success: true,
      message: 'Body reading test successful',
      receivedData: {
        hasAction: !!body.action,
        hasDownload: !!body.download,
        keys: Object.keys(body)
      }
    });

  } catch (error) {
    console.error('Error in body reading test:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to read request body'
      },
      { status: 500 }
    );
  }
}

export const POST = protectApiRoute(testBodyReading); 