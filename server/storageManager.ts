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
 * We prefer database storage but fall back to memory storage if necessary
 * This fallback is needed for the application to start properly
 */
export function getStorage(): IStorage {
  // Always force database storage to ensure persistence
  log('Using PostgreSQL database storage', 'storage');
  return dbStorage;
}

/**
 * Helper function to switch storage at runtime
 * This ensures consistent database usage throughout the application
 */
export async function updateStorageReferences(): Promise<void> {
  try {
    // Use the imported storage object directly and modify its properties
    const storageModule = await import('./storage.js');
    
    // Always use database storage for persistence
    // We can't reassign the exported const, but we can copy all properties
    // from dbStorage to the existing storage object
    Object.assign(storageModule.storage, dbStorage);
    log('Storage references updated to use database storage', 'storage');
    
    // Verify database connection by performing a simple operation
    try {
      // Try to access clients to verify DB is working properly
      const clients = await dbStorage.getClients();
      log(`Database connection confirmed - found ${clients ? clients.length : 0} clients`, 'storage');
    } catch (dbError) {
      log(`Warning: Database verification test failed: ${dbError.message}`, 'storage');
      // Warn but continue - allow app to start with potential issues
      log('Continuing with database storage despite verification issues', 'storage');
    }
    
    return Promise.resolve();
  } catch (error: any) {
    log(`Error updating storage references: ${error.message}`, 'storage');
    return Promise.reject(error);
  }
}