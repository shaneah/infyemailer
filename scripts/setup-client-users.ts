import { initDatabase } from '../server/db';
import { clientUsers } from '../shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

const scryptAsync = promisify(scrypt);

// Simple logging function
function log(message: string, prefix = 'script') {
  console.log(`${new Date().toLocaleTimeString()} [${prefix}] ${message}`);
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  // Initialize database connection
  await initDatabase();
  
  // Set up direct database connection for this script
  if (!process.env.DATABASE_URL) {
    log('DATABASE_URL not provided in environment', 'db');
    process.exit(1);
  }
  
  // Set up WebSockets for Neon serverless
  neonConfig.webSocketConstructor = ws;
  
  // Create connection
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const db = drizzle(pool, { schema: { clientUsers } });
  try {
    log('Creating client users with proper hashed passwords...');

    // First, check if client1 user already exists
    const existingUsers = await db.select().from(clientUsers).where(eq(clientUsers.username, 'client1'));
    
    if (existingUsers.length > 0) {
      log('client1 user already exists, skipping creation', 'script');
    } else {
      // Create "client1" user with full permissions
      const client1Password = await hashPassword('clientdemo');
      
      await db.insert(clientUsers).values({
        clientId: 1,
        username: 'client1',
        password: client1Password,
        status: 'active',
        permissions: {
          campaigns: true,
          contacts: true, 
          templates: true,
          reporting: true,
          domains: true,
          abTesting: true,
          emailValidation: true
        },
        metadata: {}
      });
      
      log('Created client1 user with full permissions', 'script');
    }
    
    // Check if email_validator user already exists
    const existingValidators = await db.select().from(clientUsers).where(eq(clientUsers.username, 'email_validator'));
    
    if (existingValidators.length > 0) {
      log('email_validator user already exists, skipping creation', 'script');
    } else {
      // Create "email_validator" user with limited permissions
      const validatorPassword = await hashPassword('validator123');
      
      await db.insert(clientUsers).values({
        clientId: 1,
        username: 'email_validator',
        password: validatorPassword,
        status: 'active',
        permissions: {
          campaigns: false,
          contacts: false, 
          templates: false,
          reporting: false,
          domains: false,
          abTesting: false,
          emailValidation: true
        },
        metadata: {}
      });
      
      log('Created email_validator user with limited permissions', 'script');
    }

    log('Client users setup completed successfully!', 'script');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up client users:', error);
    process.exit(1);
  }
}

// Run the script
main();