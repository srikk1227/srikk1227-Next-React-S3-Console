import { FILE_TYPE_CATEGORIES, SPECIAL_CASES, DEFAULT_PROMPT } from './config.js';

/**
 * Gets the appropriate prompt for a file type
 * @param {string} fileExtension - The file extension
 * @returns {string} - The appropriate prompt
 */
export function getPromptForFileType(fileExtension) {
  // Check for special cases first
  if (SPECIAL_CASES[fileExtension]) {
    const description = SPECIAL_CASES[fileExtension];
    return `Please provide a brief summary of this ${description}. Describe the structure, main elements, and purpose.`;
  }
  
  // Find the category for this file extension
  for (const [category, config] of Object.entries(FILE_TYPE_CATEGORIES)) {
    if (config.extensions.includes(fileExtension)) {
      return `Please provide a brief summary of this ${config.description}. Highlight the ${config.focus}.`;
    }
  }
  
  // Fallback to default prompt
  return DEFAULT_PROMPT;
}

/**
 * Utility function to add new file types easily
 * @param {string} category - The category to add the extension to
 * @param {string} extension - The file extension to add
 * @param {string} customDescription - Optional custom description for special cases
 */
export function addFileType(category, extension, customDescription = null) {
  if (customDescription) {
    SPECIAL_CASES[extension] = customDescription;
  } else if (FILE_TYPE_CATEGORIES[category]) {
    FILE_TYPE_CATEGORIES[category].extensions.push(extension);
  }
} 