import { CONFIG, FILE_TYPE_CATEGORIES, SPECIAL_CASES } from './config.js';

/**
 * Validates the request payload
 * @param {Object} payload - The request payload
 * @returns {Object} - Validation result with success and error properties
 */
export function validateRequest(payload) {
  const { accessKeyId, secretAccessKey, bucketName, region, key } = payload;
  
  if (!accessKeyId || !secretAccessKey || !bucketName || !key) {
    return {
      isValid: false,
      error: 'Missing required fields: accessKeyId, secretAccessKey, bucketName, and key are required'
    };
  }
  
  return { isValid: true };
}

/**
 * Generates the list of supported file extensions from categories
 * @returns {string[]} - Array of supported file extensions
 */
export function getSupportedExtensions() {
  const extensions = [];
  
  // Add extensions from categories
  Object.values(FILE_TYPE_CATEGORIES).forEach(category => {
    extensions.push(...category.extensions);
  });
  
  // Add extensions from special cases
  Object.keys(SPECIAL_CASES).forEach(extension => {
    if (!extensions.includes(extension)) {
      extensions.push(extension);
    }
  });
  
  return extensions.sort();
}

/**
 * Validates file type support
 * @param {string} fileExtension - The file extension
 * @returns {Object} - Validation result with success and error properties
 */
export function validateFileType(fileExtension) {
  const supportedExtensions = getSupportedExtensions();
  
  if (!supportedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type '${fileExtension}' is not supported for summarization. Supported types: ${supportedExtensions.join(', ')}`
    };
  }
  
  return { isValid: true };
}

/**
 * Validates file size
 * @param {number} contentLength - The file content length
 * @returns {Object} - Validation result with success and error properties
 */
export function validateFileSize(contentLength) {
  if (contentLength > CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File is too large for summarization. Maximum size is ${(CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB, but file is ${(contentLength / 1024 / 1024).toFixed(2)}MB.`
    };
  }
  
  return { isValid: true };
} 