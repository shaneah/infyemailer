import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // Check if the tags column exists in the lists table
    const result = await db.execute(sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'lists';
    `);
    
    console.log('Schema for lists table:');
    console.table(result.rows);
    
    // Check the current data in the lists table
    const data = await db.execute(sql`SELECT * FROM lists LIMIT 5;`);
    console.log('\nSample data from lists table:');
    console.table(data.rows);
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    process.exit(0);
  }
}

checkSchema();
