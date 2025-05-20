import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function checkListsSchema() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Get column information for the lists table
    const result = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'lists';
    `;
    
    console.log('Columns in lists table:');
    console.table(result);
    
  } catch (error) {
    console.error('Error checking lists schema:', error);
  } finally {
    process.exit(0);
  }
}

checkListsSchema();
