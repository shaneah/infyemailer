/**
 * Simple logger utility for server-side logging
 */

export function log(message: string, context = 'server') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${context}] ${message}`);
}