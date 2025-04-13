#!/usr/bin/env node

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// Get current file's directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  // Get the database connection string from environment variables
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable not set');
    process.exit(1);
  }
  
  // Create a connection pool
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // For compatibility with many hosted PostgreSQL providers
    }
  });
  
  try {
    // Check connection
    console.log('Connecting to PostgreSQL database...');
    await pool.query('SELECT 1');
    console.log('Connection successful!');
    
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get list of already applied migrations
    const appliedMigrationsResult = await pool.query('SELECT name FROM migrations');
    const appliedMigrations = appliedMigrationsResult.rows.map(row => row.name);
    
    console.log('Already applied migrations:', appliedMigrations.length ? appliedMigrations.join(', ') : 'None');
    
    // Get list of migration files
    const migrationsDir = __dirname;
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations are applied in order
    
    console.log('Available migration files:', migrationFiles.join(', '));
    
    // Apply migrations that haven't been applied yet
    for (const migrationFile of migrationFiles) {
      if (appliedMigrations.includes(migrationFile)) {
        console.log(`Migration ${migrationFile} already applied, skipping...`);
        continue;
      }
      
      console.log(`Applying migration ${migrationFile}...`);
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      
      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        // Run the migration
        await client.query(migrationSql);
        
        // Record the migration
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [migrationFile]);
        
        // Commit the transaction
        await client.query('COMMIT');
        console.log(`Migration ${migrationFile} successfully applied`);
      } catch (error) {
        // Roll back the transaction if there was an error
        await client.query('ROLLBACK');
        console.error(`Error applying migration ${migrationFile}:`, error.message);
        throw error;
      } finally {
        client.release();
      }
    }
    
    console.log('All migrations applied successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the migrations
runMigrations().catch(error => {
  console.error('Error running migrations:', error);
  process.exit(1);
});