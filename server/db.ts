import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { log } from './vite';

// For Postgres
const databaseUrl = process.env.DATABASE_URL!;
log('Connecting to Postgres database', 'db');

// Connect to PostgreSQL
const sql = postgres(databaseUrl, { max: 10 });

// Create a Drizzle instance
export const db = drizzle(sql);

// Run migrations if needed (development)
export async function runMigrations() {
  try {
    // Only use this in development mode
    if (process.env.NODE_ENV !== 'production') {
      log('Running migrations...', 'db');
      await migrate(db, { migrationsFolder: 'drizzle' });
      log('Migrations completed successfully', 'db');
    }
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// Initialize database and apply migrations
export async function initializeDatabase() {
  try {
    log('Initializing database connection', 'db');
    await runMigrations();
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}