import { dbStorage } from './dbStorage';
import { initDatabase } from './db';
import { log } from './vite';

/**
 * This script syncs all data from file storage to the PostgreSQL database
 */
async function main() {
  try {
    log('Starting database synchronization process', 'db-sync');
    
    // Initialize database connection first
    const dbInitialized = await initDatabase();
    if (!dbInitialized) {
      log('Failed to initialize database connection, aborting data sync', 'db-sync');
      process.exit(1);
    }
    
    log('Database connection initialized successfully', 'db-sync');
    
    // Run the data migration
    log('Beginning data migration from file storage to database...', 'db-sync');
    const result = await dbStorage.initializeWithSampleData();
    
    if (result) {
      log('Data synchronization completed successfully', 'db-sync');
      process.exit(0);
    } else {
      log('Data synchronization failed', 'db-sync');
      process.exit(1);
    }
  } catch (error) {
    console.error('Synchronization process failed:', error);
    log(`Synchronization error: ${error.message}`, 'db-sync');
    process.exit(1);
  }
}

// Run the script
main();