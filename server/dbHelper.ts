import { log } from './vite';

// A helper function to wrap database operations and gracefully handle failures
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage = 'Database operation failed'
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown error';
    log(`${errorMessage}: ${errorMsg}`, 'db-error');
    console.error(errorMessage, error);
    return fallback;
  }
}

// Helper for safely querying database with a fallback
export function withDbFallback<T>(queryFn: () => Promise<T>, fallbackResult: T): Promise<T> {
  return safeDbOperation(queryFn, fallbackResult);
}