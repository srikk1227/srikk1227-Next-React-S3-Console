import { Groq } from 'groq-sdk';
import { CONFIG } from './config.js';

/**
 * Creates a Groq client
 * @returns {Groq} - Configured Groq client
 */
export function createGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not configured');
  }
  
  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

/**
 * Truncates content if it exceeds the maximum length
 * @param {string} content - The file content
 * @returns {string} - The truncated content
 */
export function truncateContent(content) {
  if (content.length > CONFIG.MAX_CONTENT_LENGTH) {
    return content.substring(0, CONFIG.MAX_CONTENT_LENGTH) + '\n\n[Content truncated due to length]';
  }
  return content;
}

/**
 * Generates a summary using Groq
 * @param {string} prompt - The prompt to send to Groq
 * @param {string} fileName - The name of the file
 * @param {string} content - The file content
 * @returns {Promise<string>} - The generated summary
 */
export async function generateSummaryWithGroq(prompt, fileName, content) {
  const groq = createGroqClient();
  
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that provides concise, informative summaries of file content. Focus on the main points and key information."
      },
      {
        role: "user",
        content: `${prompt}\n\nFile: ${fileName}\n\nContent:\n${content}`
      }
    ],
    model: CONFIG.GROQ_MODEL,
    temperature: CONFIG.GROQ_TEMPERATURE,
    max_tokens: CONFIG.GROQ_MAX_TOKENS,
  });

  return completion.choices[0]?.message?.content || 'Unable to generate summary';
} 