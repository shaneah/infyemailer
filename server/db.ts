import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema';
import { log } from './vite';
import path from 'path';
import fs from 'fs';

// Set up WebSockets for Neon serverless
neonConfig.webSocketConstructor = ws;

// Connection variables - for ease of testing/fallback
export let isDatabaseAvailable = false;
export let db: any;
export let pool: any;

/**
 * Sets up the database connection with Neon serverless driver
 */
function setupDatabaseConnection() {
  try {
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      log('DATABASE_URL not provided in environment', 'db');
      return false;
    }

    log('Connecting to PostgreSQL database using Neon serverless driver', 'db');
    
    // Create Neon PostgreSQL connection
    pool = new Pool({ 
      connectionString: databaseUrl
    });
    
    // Extract only table schemas from the schema object, excluding relation definitions
    const tableSchemas: any = {};
    for (const key in schema) {
      const item = schema[key as keyof typeof schema];
      // Check if the item is a table schema (has name property)
      if (typeof item === 'object' && item !== null && 'name' in item) {
        tableSchemas[key] = item;
      }
    }
    
    // Initialize Drizzle with only table schemas, bypassing the relation definitions
    db = drizzle(pool, { schema: tableSchemas });
    log('PostgreSQL storage initialized with Neon driver', 'db');
    
    // Test connection (async but we'll wait for it)
    return new Promise<boolean>((resolve) => {
      // Add a timeout to the connection test
      const timeout = setTimeout(() => {
        log('Database connection test timed out after 5 seconds', 'db');
        resolve(false);
      }, 5000);
      
      // Test connection with a simple query
      pool.query('SELECT 1').then(() => {
        clearTimeout(timeout);
        log('Database connection successful', 'db');
        resolve(true);
      }).catch((err: Error) => {
        clearTimeout(timeout);
        log(`Database connection failed: ${err.message}`, 'db');
        resolve(false);
      });
    });
  } catch (error: any) {
    log(`Failed to connect to PostgreSQL database: ${error.message}`, 'db');
    return false;
  }
}

/**
 * Initialize the database connection
 */
export async function initDatabase(): Promise<boolean> {
  try {
    // Set up database connection
    isDatabaseAvailable = await setupDatabaseConnection();
    
    if (!isDatabaseAvailable) {
      log('Database connection failed, using memory storage', 'db');
      // Create a dummy db client for fallback
      db = {
        select: () => ({ from: () => ({ where: () => [] }) }),
        insert: () => ({ values: () => ({ returning: () => [] }) }),
        update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
        delete: () => ({ where: () => ({ returning: () => [] }) }),
        query: { 
          // Stub for all table queries
          // For each table in schema, create a query method
          ...Object.keys(schema).reduce((acc, key) => {
            // Only add methods for tables
            if (typeof schema[key as keyof typeof schema] === 'object' && 
                schema[key as keyof typeof schema] !== null &&
                'name' in schema[key as keyof typeof schema]) {
              acc[key] = {
                findMany: async () => [],
                findFirst: async () => undefined
              };
            }
            return acc;
          }, {} as Record<string, any>)
        }
      };
    }
    
    return isDatabaseAvailable;
  } catch (error: any) {
    log(`Database initialization error: ${error.message}`, 'db');
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