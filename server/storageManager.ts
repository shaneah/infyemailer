import { IStorage } from './storage';
import { MemStorage } from './storage';
import { isDatabaseAvailable } from './db';
import { log } from './vite';

// Create memory storage instance
const memStorage = new MemStorage();

// For database storage, dynamically import to avoid circular dependencies
let dbStorage: IStorage | null = null;

// Export the appropriate storage instance based on database availability
export function getStorage(): IStorage {
  if (isDatabaseAvailable) {
    if (!dbStorage) {
      try {
        // Try to use database storage
        const { dbStorage: storage } = require('./dbStorage');
        if (storage && typeof storage.getClients === 'function') {
          dbStorage = storage;
          log('Using PostgreSQL database storage', 'storage');
        } else {
          log('Database storage not properly initialized, falling back to memory storage', 'storage');
          return memStorage;
        }
      } catch (error) {
        log(`Error loading database storage: ${error.message}`, 'storage');
        return memStorage;
      }
    }
    return dbStorage;
  } else {
    log('Using in-memory storage (database unavailable)', 'storage');
    return memStorage;
  }
}

// Initialize the storage instance
export const storageInstance = getStorage();