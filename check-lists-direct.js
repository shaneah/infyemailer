import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_NBeRw7ISqDu6@ep-young-meadow-a43t54yt-pooler.us-east-1.aws.neon.tech/infyemailer?sslmode=require'
});

async function checkListsTable() {
  const client = await pool.connect();
  try {
    // Check table structure
    const res = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'lists';
    `);
    
    console.log('Lists table structure:');
    console.table(res.rows);
    
    // Check sample data
    const data = await client.query('SELECT * FROM lists LIMIT 5');
    console.log('\nSample data from lists table:');
    console.table(data.rows);
    
  } catch (err) {
    console.error('Error checking lists table:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkListsTable();
