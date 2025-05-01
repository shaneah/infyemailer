// Script to test database connection
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Set up WebSockets for Neon serverless
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDb() {
  try {
    console.log('Testing PostgreSQL connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    
    try {
      const clientsResult = await pool.query('SELECT COUNT(*) FROM clients');
      console.log(`Database has ${clientsResult.rows[0].count} clients`);
    } catch (err) {
      console.log('Could not get clients count:', err.message);
    }
    
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

checkDb();