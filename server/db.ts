import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@shared/schema';
import { log } from './vite';
import ws from 'ws';

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Flag to track if database is available
export let isDatabaseAvailable = false;

// Create Drizzle instance
export let db: any;
export let pool: any;

// Actual database connection logic - wrapped in a function to avoid top-level errors
function setupDatabaseConnection() {
  try {
    // For PostgreSQL
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      log('DATABASE_URL environment variable is not set', 'db');
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    log('Connecting to PostgreSQL database using Neon serverless driver', 'db');
    
    // Create Neon PostgreSQL connection
    pool = new Pool({ 
      connectionString: databaseUrl
    });
    
    // Initialize Drizzle with schema
    db = drizzle(pool, { schema });
    log('PostgreSQL storage initialized with Neon driver', 'db');
    
    // Test connection (async but we'll wait for it)
    return new Promise<boolean>((resolve) => {
      // Add a timeout to the connection test
      const timeout = setTimeout(() => {
        log('Database connection test timed out after 5 seconds', 'db');
        isDatabaseAvailable = false;
        resolve(false);
      }, 5000);
      
      pool.query('SELECT 1').then(() => {
        clearTimeout(timeout);
        log('PostgreSQL database connected successfully via Neon', 'db');
        isDatabaseAvailable = true;
        resolve(true);
      }).catch((err: Error) => {
        clearTimeout(timeout);
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