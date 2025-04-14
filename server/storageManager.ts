import { IStorage } from './storage';
import { MemStorage } from './storage';
import { isDatabaseAvailable } from './db';
import { log } from './vite';
import { DbStorage } from './dbStorage';

// Create memory storage instance
const memStorage = new MemStorage();

// Create database storage instance
const dbStorage = new DbStorage();

/**
 * Returns the appropriate storage instance based on database availability
 */
export function getStorage(): IStorage {
  if (isDatabaseAvailable) {
    log('Using PostgreSQL database storage', 'storage');
    return dbStorage;
  } else {
    log('Using in-memory storage (database unavailable)', 'storage');
    return memStorage;
  }
}

/**
 * Helper function to switch storage at runtime
 * This allows modules that have already imported storage to get the updated instance
 */
export function updateStorageReferences(): void {
  // Use the imported storage object directly and modify its properties
  import('./storage.js').then(storageModule => {
    if (isDatabaseAvailable) {
      // We can't reassign the exported const, but we can copy all properties
      // from dbStorage to the existing storage object
      Object.assign(storageModule.storage, dbStorage);
      log('Storage references updated to use database storage', 'storage');
    } else {
      Object.assign(storageModule.storage, memStorage);
      log('Storage references updated to use memory storage', 'storage');
    }
  }).catch(error => {
    log(`Error updating storage references: ${error.message}`, 'storage');
  });
}