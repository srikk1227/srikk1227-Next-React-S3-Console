/**
 * Handles AWS S3 specific errors
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export function handleS3Error(error) {
  const errorMap = {
    'AccessDenied': 'Access denied. Please check your AWS credentials and permissions.',
    'NoSuchBucket': 'Bucket not found. Please check the bucket name.',
    'NoSuchKey': 'File not found. Please check the file path.',
    'InvalidAccessKeyId': 'Invalid Access Key ID. Please check your credentials.',
    'SignatureDoesNotMatch': 'Invalid Secret Access Key. Please check your credentials.',
    'NetworkingError': 'Network error. Please check your internet connection.',
    'Forbidden': 'Forbidden. You may not have permission to access this file.',
    'NotFound': 'File not found. Please check the file path.',
    'ServiceUnavailable': 'S3 service is temporarily unavailable. Please try again later.'
  };

  return errorMap[error.name] || error.message || 'An unexpected error occurred.';
}

/**
 * Handles different types of errors and returns user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export function handleError(error) {
  console.error('Error summarizing file:', {
    name: error.name,
    message: error.message,
    code: error.$metadata?.httpStatusCode,
    requestId: error.$metadata?.requestId
  });

  let errorMessage = 'Failed to summarize file';
  
  if (error.message?.includes('GROQ_API_KEY')) {
    errorMessage = 'Groq API key not configured. Please set the GROQ_API_KEY environment variable.';
  } else if (error.name && ['AccessDenied', 'NoSuchBucket', 'NoSuchKey', 'InvalidAccessKeyId', 'SignatureDoesNotMatch', 'NetworkingError', 'Forbidden', 'NotFound', 'ServiceUnavailable'].includes(error.name)) {
    errorMessage = handleS3Error(error);
  } else {
    errorMessage = error.message || 'An unexpected error occurred.';
  }

  return errorMessage;
} 