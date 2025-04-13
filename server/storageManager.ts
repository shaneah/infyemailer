import { IStorage } from './storage';
import { MemStorage } from './storage';
import { DbStorage } from './dbStorage';
import { isDatabaseAvailable } from './db';
import { log } from './vite';

// Create instances of both storage types
const memStorage = new MemStorage();
const dbStorage = new DbStorage();

// Export the appropriate storage instance based on database availability
export function getStorage(): IStorage {
  if (isDatabaseAvailable) {
    log('Using PostgreSQL database storage', 'storage');
    return dbStorage;
  } else {
    log('Using in-memory storage (database unavailable)', 'storage');
    return memStorage;
  }
}

// Initialize a default storage instance
export const storageInstance = getStorage();