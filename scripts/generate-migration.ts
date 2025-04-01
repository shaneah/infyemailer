import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Connect to the database
const sql = postgres(databaseUrl, { max: 1 });
const db = drizzle(sql);

// Migration configuration
const migrationsFolder = path.join(__dirname, '../drizzle');

// Run the migration
async function main() {
  try {
    console.log('Generating migration...');
    await migrate(db, { migrationsFolder });
    console.log('Migration generated successfully');
  } catch (error) {
    console.error('Migration generation failed:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();