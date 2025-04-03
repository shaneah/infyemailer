import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { log } from './vite';

// For Postgres
const databaseUrl = process.env.DATABASE_URL!;
log('Connecting to Postgres database', 'db');

// Connect to PostgreSQL
export const sql = postgres(databaseUrl, { max: 10 });

// Create a Drizzle instance
export const db = drizzle(sql);

// Run migrations if needed (development)
export async function runMigrations() {
  try {
    // Only use this in development mode
    if (process.env.NODE_ENV !== 'production') {
      const fs = await import('fs');
      const path = await import('path');
      
      // Check if the drizzle folder exists
      const migrationFolder = 'drizzle';
      const journalPath = path.join(migrationFolder, '_journal.json');
      
      // Skip migrations if the journal doesn't exist to avoid errors
      if (!fs.existsSync(journalPath)) {
        log('No migration journal found, skipping migrations', 'db');
        return;
      }

      log('Running migrations...', 'db');
      await migrate(db, { migrationsFolder: migrationFolder });
      log('Migrations completed successfully', 'db');
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    // Continue execution even if migrations fail
  }
}

// Initialize database and apply migrations
export async function initializeDatabase() {
  try {
    log('Initializing database connection', 'db');
    await runMigrations();
    
    // Import dbStorage only after initialization to avoid circular dependencies
    const { dbStorage } = await import('./dbStorage');
    
    // Initialize with sample data (including admin user)
    await dbStorage.initializeWithSampleData();
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}