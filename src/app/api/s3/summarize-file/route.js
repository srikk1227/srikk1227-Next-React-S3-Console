import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import {
  validateRequest,
  validateFileType,
  validateFileSize,
  getPromptForFileType,
  createS3Client,
  getFileContent,
  truncateContent,
  generateSummaryWithGroq,
  handleError,
  CONFIG
} from '@/lib/fileSummarizer';

/**
 * Main handler function for file summarization
 */
async function summarizeFile(request) {
  try {
    // Parse and validate request
    const payload = await request.json();
    const validation = validateRequest(payload);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { accessKeyId, secretAccessKey, bucketName, region, key } = payload;

    // Log request (without sensitive data)
    console.log('Summarizing file server-side:', {
      region,
      bucketName,
      key,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey
    });

    // Get file extension and validate file type
    const fileExtension = key.split('.').pop()?.toLowerCase();
    const fileTypeValidation = validateFileType(fileExtension);
    
    if (!fileTypeValidation.isValid) {
      return NextResponse.json(
        { success: false, error: fileTypeValidation.error },
        { status: 400 }
      );
    }

    // Create S3 client and get file content
    const s3Client = createS3Client({ accessKeyId, secretAccessKey, region });
    const fileContent = await getFileContent(s3Client, bucketName, key);

    // Validate file size
    const sizeValidation = validateFileSize(fileContent.length);
    if (!sizeValidation.isValid) {
      return NextResponse.json(
        { success: false, error: sizeValidation.error },
        { status: 400 }
      );
    }

    // Get appropriate prompt and truncate content
    const prompt = getPromptForFileType(fileExtension);
    const truncatedContent = truncateContent(fileContent);

    // Generate summary
    const summary = await generateSummaryWithGroq(prompt, key, truncatedContent);

    // Return success response
    return NextResponse.json({
      success: true,
      summary,
      fileType: fileExtension,
      fileName: key.split('/').pop(),
      contentLength: fileContent.length,
      wasTruncated: fileContent.length > CONFIG.MAX_CONTENT_LENGTH
    });

  } catch (error) {
    const errorMessage = handleError(error);

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

export const POST = protectApiRoute(summarizeFile); 