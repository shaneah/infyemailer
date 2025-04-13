import { IStorage } from './storage';
import { MemStorage } from './storage';
import { isDatabaseAvailable } from './db';
import { log } from './vite';

// Create memory storage instance
const memStorage = new MemStorage();

// For database storage, dynamically import to avoid circular dependencies
let dbStorage: IStorage | null = null;
let lastStorageCheck = 0;
const STORAGE_CHECK_INTERVAL = 60000; // 1 minute

/**
 * Returns the appropriate storage instance based on database availability
 * Includes caching and periodic re-checks to handle database reconnection
 */
export function getStorage(): IStorage {
  const now = Date.now();
  
  // Should we try to reconnect to the database?
  if (!dbStorage && lastStorageCheck > 0 && (now - lastStorageCheck) > STORAGE_CHECK_INTERVAL) {
    log('Attempting to reconnect to database storage after timeout', 'storage');
    // Reset the check time
    lastStorageCheck = now;
  }
  
  if (isDatabaseAvailable) {
    if (!dbStorage) {
      try {
        // Try to use database storage
        const { dbStorage: storage } = require('./dbStorage');
        if (storage && typeof storage.getClients === 'function') {
          dbStorage = storage;
          log('Successfully connected to PostgreSQL database storage', 'storage');
        } else {
          log('Database storage not properly initialized, falling back to memory storage', 'storage');
          lastStorageCheck = now;
          return memStorage;
        }
      } catch (error: any) {
        log(`Error loading database storage: ${error?.message || 'Unknown error'}`, 'storage');
        console.error('Detailed database storage error:', error);
        lastStorageCheck = now;
        return memStorage;
      }
    }
    return dbStorage;
  } else {
    if (lastStorageCheck === 0) {
      log('Using in-memory storage (database unavailable)', 'storage');
      lastStorageCheck = now;
    }
    return memStorage;
  }
}

// Initialize the storage instance with proper type safety
export const storageInstance: IStorage = getStorage();