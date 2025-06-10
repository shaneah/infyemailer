import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema';
import { log } from './vite';
import path from 'path';
import fs from 'fs';

// DEBUG: Log the DATABASE_URL at startup
console.log('[DEBUG] DATABASE_URL:', process.env.DATABASE_URL);

// Set up WebSockets for Neon serverless with better error handling
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = true;

// Connection variables - for ease of testing/fallback
export let isDatabaseAvailable = false;
export let db: any;
export let pool: any;

// Direct connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_NBeRw7ISqDu6@ep-young-meadow-a43t54yt-pooler.us-east-1.aws.neon.tech/infyemailer?sslmode=require';

/**
 * Sets up the database connection with Neon serverless driver
 */
async function setupDatabaseConnection(): Promise<boolean> {
  try {
    log('[DEBUG] Attempting to connect to PostgreSQL database using Neon serverless driver', 'db');
    log('[DEBUG] Using connection string:', DATABASE_URL, 'db');
    
    // Create Neon PostgreSQL connection with better error handling
    pool = new Pool({ 
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // For compatibility with many PostgreSQL providers
      },
      // Add connection timeout for better error handling
      connectionTimeoutMillis: 10000,
      // Increase max clients for better concurrency
      max: 20,
      // Add WebSocket specific options
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000
    });
    
    // Extract only table schemas from the schema object, excluding relation definitions
    const tableSchemas: any = {};
    for (const key in schema) {
      const item = schema[key as keyof typeof schema];
      // Check if the item is a table schema (has name property)
      if (typeof item === 'object' && item !== null && 'name' in item) {
        tableSchemas[key] = item;
        // Log which tables we're using from the schema
        log(`Loaded table schema: ${key}`, 'db');
      }
    }
    
    // Initialize Drizzle with only table schemas, bypassing the relation definitions
    db = drizzle(pool, { schema: tableSchemas });
    log('PostgreSQL storage initialized with Neon driver', 'db');
    
    // Test connection with a timeout
    log('[DEBUG] Testing database connection with SELECT 1', 'db');
    const connectionPromise = new Promise<boolean>((resolve) => {
      pool.query('SELECT 1').then(() => {
        log('[DEBUG] Database connection successful', 'db');
        resolve(true);
      }).catch((err: Error) => {
        log(`[DEBUG] Database connection failed: ${err.message}`, 'db');
        console.error('[DEBUG] Full error:', err);
        resolve(false);
      });
    });

    // Add a timeout to the connection test
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        log('[DEBUG] Database connection test timed out after 5 seconds', 'db');
        resolve(false);
      }, 5000);
    });

    // Wait for either the connection or timeout
    const result = await Promise.race([connectionPromise, timeoutPromise]);
    
    if (result) {
      // Verify the connection is working by checking tables
      try {
        log('[DEBUG] Verifying tables in public schema', 'db');
        const tablesQuery = await pool.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        
        if (tablesQuery.rows.length > 0) {
          log(`[DEBUG] Database verification: Found ${tablesQuery.rows.length} tables in schema`, 'db');
          return true;
        } else {
          log('[DEBUG] No tables found in database schema', 'db');
          return false;
        }
      } catch (err: any) {
        log(`[DEBUG] Database verification failed: ${err.message}`, 'db');
        console.error('[DEBUG] Full error:', err);
        return false;
      }
    }
    
    return false;
  } catch (error: any) {
    log(`[DEBUG] Failed to connect to PostgreSQL database: ${error.message}`, 'db');
    console.error('[DEBUG] Full error:', error);
    return false;
  }
}

/**
 * Initialize the database connection
 */
export async function initDatabase(): Promise<boolean> {
  try {
    // Set up database connection
    const connectionResult = await setupDatabaseConnection();
    
    // Make multiple connection attempts if the first one fails
    // This helps with temporary connection issues during startup
    if (!connectionResult) {
      log('First database connection attempt failed, retrying in 2 seconds...', 'db');
      
      // Wait 2 seconds before trying again
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Second attempt
      const secondAttempt = await setupDatabaseConnection();
      
      if (!secondAttempt) {
        log('Second database connection attempt failed, retrying in 3 seconds...', 'db');
        
        // Wait 3 seconds before final try
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Final attempt
        const finalAttempt = await setupDatabaseConnection();
        isDatabaseAvailable = finalAttempt;
      } else {
        isDatabaseAvailable = true;
      }
    } else {
      isDatabaseAvailable = true;
    }
    
    if (!isDatabaseAvailable) {
      log('All database connection attempts failed', 'db');
      return false;
            }
    
      // Database is connected, set up prepared statements for common operations
      log('Setting up prepared database queries for common operations', 'db');
      
      // Run a simple database operation to ensure the connection is properly established
      try {
        const testResult = await pool.query('SELECT 1 as connection_test');
        if (testResult && testResult.rows && testResult.rows[0]?.connection_test === 1) {
          log('Database connection fully verified and ready', 'db');
        return true;
      }
      return false;
    } catch (err: any) {
      log(`Warning: Database connection test failed: ${err.message}`, 'db');
      return false;
    }
  } catch (error: any) {
    log(`Database initialization error: ${error.message}`, 'db');
    isDatabaseAvailable = false;
    return false;
  }
}

/**
 * Run database migrations from the migrations directory
 */
export async function runMigrations(): Promise<boolean> {
  try {
    if (!isDatabaseAvailable) {
      log('Cannot run migrations - database connection not available', 'db');
      return false;
    }
    
    const migrationsFolder = path.join(process.cwd(), 'migrations');
    
    // Check if migrations folder exists
    if (!fs.existsSync(migrationsFolder)) {
      log('Migrations folder not found', 'db');
      return false;
    }
    
    log(`Running migrations from ${migrationsFolder}`, 'db');
    
    // Get list of SQL migration files
    const migrationFiles = fs.readdirSync(migrationsFolder)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (migrationFiles.length === 0) {
      log('No migration files found', 'db');
      return false;
    }
    
    log(`Found ${migrationFiles.length} migration files`, 'db');
    
    // Run each migration in sequence
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsFolder, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      log(`Running migration: ${file}`, 'db');
      await pool.query(sql);
      log(`Completed migration: ${file}`, 'db');
    }
    
    log('All migrations completed successfully', 'db');
    return true;
  } catch (error: any) {
    log(`Migration error: ${error.message}`, 'db');
    return false;
  }
}