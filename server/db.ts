import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { log } from './vite';

// Flag to track if database is available
export let isDatabaseAvailable = false;

// Create Drizzle instance
export let db: any;
export let sql: any;

// Actual database connection logic - wrapped in a function to avoid top-level errors
function setupDatabaseConnection() {
  try {
    // For Postgres
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      log('DATABASE_URL environment variable is not set', 'db');
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    log('Connecting to Postgres database', 'db');
    
    // Create PostgreSQL connection
    sql = postgres(databaseUrl, { 
      max: 10,
      timeout: 5,
      debug: false,
      onnotice: () => {} 
    });
    
    // Initialize Drizzle
    db = drizzle(sql);
    log('PostgreSQL storage initialized', 'db');
    
    // Test connection (async but we'll wait for it)
    return new Promise<boolean>((resolve) => {
      sql`SELECT 1`.then(() => {
        log('PostgreSQL database connected successfully', 'db');
        isDatabaseAvailable = true;
        resolve(true);
      }).catch(err => {
        log(`Database connection test failed: ${err.message}`, 'db');
        isDatabaseAvailable = false;
        resolve(false);
      });
    });
  } catch (error: any) {
    log(`Database connection failed: ${error.message}`, 'db');
    console.error('Failed to connect to PostgreSQL database:', error);
    return false;
  }
}

// Set up database connection and test it
export async function initDatabase(): Promise<boolean> {
  try {
    const connected = await setupDatabaseConnection();
    if (!connected) {
      log('Database connection failed, using memory storage', 'db');
      isDatabaseAvailable = false;
      
      // Create a dummy DB client for fallback
      log('Creating dummy db client for fallback', 'db');
      db = {
        select: () => ({ from: () => ({ where: () => [] }) }),
        insert: () => ({ values: () => ({ returning: () => [] }) }),
        update: () => ({ set: () => ({ where: () => [] }) }),
        delete: () => ({ where: () => [] })
      };
      
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error during database setup:', error);
    log('Using memory storage instead due to database setup failure', 'db');
    isDatabaseAvailable = false;
    
    // Create a dummy DB client for fallback
    log('Creating dummy db client for fallback', 'db');
    db = {
      select: () => ({ from: () => ({ where: () => [] }) }),
      insert: () => ({ values: () => ({ returning: () => [] }) }),
      update: () => ({ set: () => ({ where: () => [] }) }),
      delete: () => ({ where: () => [] })
    };
    
    return false;
  }
}