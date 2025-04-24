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
export async function updateStorageReferences(): Promise<void> {
  try {
    // Use the imported storage object directly and modify its properties
    const storageModule = await import('./storage.js');
    
    if (isDatabaseAvailable) {
      // We can't reassign the exported const, but we can copy all properties
      // from dbStorage to the existing storage object
      Object.assign(storageModule.storage, dbStorage);
      log('Storage references updated to use database storage', 'storage');
      
      // Verify database connection by performing a simple operation
      try {
        // Try to access clients to verify DB is working properly
        const clients = await dbStorage.getClients();
        log(`Database connection confirmed - found ${clients.length} clients`, 'storage');
      } catch (dbError) {
        log(`Warning: Database verification test failed: ${dbError.message}`, 'storage');
        // Continue anyway as we'll try to use the database
      }
    } else {
      Object.assign(storageModule.storage, memStorage);
      log('Storage references updated to use memory storage', 'storage');
      
      // Initialize memory storage with default data if needed
      try {
        await memStorage.initializeWithSampleData();
        log('Memory storage initialized with sample data', 'storage');
      } catch (sampleError) {
        log(`Warning: Failed to initialize memory storage with sample data: ${sampleError.message}`, 'storage');
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    log(`Error updating storage references: ${error.message}`, 'storage');
    return Promise.reject(error);
  }
}