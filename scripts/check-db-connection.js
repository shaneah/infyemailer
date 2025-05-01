// Script to check database connection and verify table structure
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Set up WebSockets for Neon serverless
neonConfig.webSocketConstructor = ws;

// Create a PostgreSQL connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDatabaseConnection() {
  try {
    console.log('Checking PostgreSQL connection...');
    
    // Check basic connectivity
    const connectionResult = await pool.query('SELECT NOW() as time');
    console.log(`Database connection successful at ${connectionResult.rows[0].time}`);
    
    // Check if tables exist
    const tablesQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log(`\nFound ${tablesQuery.rows.length} tables in database:`);
    tablesQuery.rows.forEach((row, i) => {
      console.log(`${i+1}. ${row.table_name}`);
    });
    
    // Check clients table
    if (tablesQuery.rows.some(row => row.table_name === 'clients')) {
      const clientsCount = await pool.query('SELECT COUNT(*) as count FROM clients');
      console.log(`\nClients table exists with ${clientsCount.rows[0].count} records`);
      
      // Show client records
      if (clientsCount.rows[0].count > 0) {
        const clients = await pool.query('SELECT id, name, email FROM clients LIMIT 5');
        console.log('\nSample client records:');
        clients.rows.forEach((client, i) => {
          console.log(`${i+1}. ${client.name} (${client.email}) - ID: ${client.id}`);
        });
      }
    } else {
      console.warn('\nWARNING: clients table not found!');
    }
    
    console.log('\nDatabase check completed successfully');
  } catch (error) {
    console.error('Database connection error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await pool.end();
  }
}

// Execute the database check
checkDatabaseConnection();