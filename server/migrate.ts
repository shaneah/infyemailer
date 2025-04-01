import { db, runMigrations } from './db';
import { dbStorage } from './dbStorage';
import { log } from './vite';

async function main() {
  try {
    log('Starting database migrations', 'migrate');
    
    // Run drizzle migrations
    await runMigrations();
    
    // Initialize with sample data
    await dbStorage.initializeWithSampleData();
    
    log('Database setup complete', 'migrate');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();