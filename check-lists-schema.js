import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function checkListsSchema() {
  try {
    console.log('Checking lists table schema...');
    
    // Get the table structure
    const result = await db.execute(sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'lists';
    `);
    
    console.log('Lists table schema:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('Error checking lists schema:', error);
  } finally {
    process.exit(0);
  }
}

checkListsSchema();
