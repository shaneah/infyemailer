import { log } from './vite';
import { isDatabaseAvailable } from './db';

// A helper function to wrap database operations and gracefully handle failures
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage = 'Database operation failed',
  operationName = 'unknown'
): Promise<T> {
  // Short-circuit if database is already known to be unavailable
  if (!isDatabaseAvailable) {
    log(`Skipping database operation ${operationName} - database is not available`, 'db-fallback');
    return fallback;
  }
  
  try {
    return await operation();
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown error';
    const errorCode = error?.code || 'NO_CODE';
    log(`${errorMessage} (${operationName}): ${errorMsg} [Code: ${errorCode}]`, 'db-error');
    
    // Detailed error logging to help diagnose Neon database issues
    if (errorMsg.includes('endpoint is disabled')) {
      log('Neon database endpoint is disabled. Consider enabling it in the Neon dashboard.', 'db-error');
    } else if (errorMsg.includes('connection timeout')) {
      log('Database connection timed out. Check network connectivity and database server status.', 'db-error');
    } else if (errorCode === 'ECONNREFUSED') {
      log('Connection refused. Database server may be down or not accepting connections.', 'db-error');
    }
    
    console.error(errorMessage, error);
    return fallback;
  }
}

// Helper for safely querying database with a fallback
export function withDbFallback<T>(
  queryFn: () => Promise<T>, 
  fallbackResult: T,
  operationName = 'query'
): Promise<T> {
  return safeDbOperation(queryFn, fallbackResult, 'Database query failed', operationName);
}

// Helper to check if a database error is a temporary connection issue
export function isTemporaryDatabaseError(error: any): boolean {
  const errorMsg = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || '';
  
  return (
    errorMsg.includes('connection timeout') ||
    errorMsg.includes('too many clients') ||
    errorMsg.includes('terminating connection due to administrator command') ||
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ECONNRESET' ||
    errorCode === '57P01' // admin shutdown
  );
}