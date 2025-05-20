import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function checkTables() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Check if the lists table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lists'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.log('The lists table does not exist');
      return;
    }
    
    console.log('The lists table exists. Checking columns...');
    
    // Get column information for the lists table
    const columns = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'lists';
    `;
    
    console.log('Columns in lists table:');
    console.table(columns);
    
    // Get table constraints
    const constraints = await sql`
      SELECT conname, conkey, confkey, confrelid, conrelid, contype
      FROM pg_constraint
      WHERE conrelid = 'lists'::regclass;
    `;
    
    console.log('\nTable constraints:');
    console.table(constraints);
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();
