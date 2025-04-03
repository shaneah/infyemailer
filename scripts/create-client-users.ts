import { sql } from '../server/db';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

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
  try {
    log('Creating client users with proper hashed passwords...');

    // First, delete existing client users
    await sql`DELETE FROM client_users`;
    log('Deleted existing client users', 'script');

    // Create "client1" user with full permissions
    const client1Password = await hashPassword('client123');
    await sql`
      INSERT INTO client_users (client_id, username, password, status, metadata)
      VALUES (
        1,
        'client1',
        ${client1Password},
        'active',
        ${JSON.stringify({
          permissions: {
            campaigns: true,
            contacts: true, 
            templates: true,
            reporting: true,
            domains: true,
            abTesting: true,
            emailValidation: true
          }
        })}
      )
    `;
    log('Created client1 user with full permissions', 'script');

    // Create "email_validator" user with limited permissions
    const validatorPassword = await hashPassword('validator123');
    await sql`
      INSERT INTO client_users (client_id, username, password, status, metadata)
      VALUES (
        1,
        'email_validator',
        ${validatorPassword},
        'active',
        ${JSON.stringify({
          permissions: {
            campaigns: false,
            contacts: false, 
            templates: false,
            reporting: false,
            domains: false,
            abTesting: false,
            emailValidation: true
          }
        })}
      )
    `;
    log('Created email_validator user with limited permissions', 'script');

    log('Client users created successfully!', 'script');
    process.exit(0);
  } catch (error) {
    console.error('Error creating client users:', error);
    process.exit(1);
  }
}

// Run the script
main();