import { sql } from './server/db.js';
import crypto from 'crypto';

async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
}

async function main() {
  try {
    console.log('Creating client users with proper hashed passwords...');

    // Create "client1" user with full permissions
    const client1Password = await hashPassword('client123');
    await sql`
      INSERT INTO client_users (client_id, username, password, status, permissions, metadata)
      VALUES (
        1,
        'client1',
        ${client1Password},
        'active',
        ${JSON.stringify({
          campaigns: true,
          contacts: true, 
          templates: true,
          reporting: true,
          domains: true,
          abTesting: true,
          emailValidation: true
        })},
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
    console.log('Created client1 user with full permissions');

    // Create "email_validator" user with limited permissions
    const validatorPassword = await hashPassword('validator123');
    await sql`
      INSERT INTO client_users (client_id, username, password, status, permissions, metadata)
      VALUES (
        1,
        'email_validator',
        ${validatorPassword},
        'active',
        ${JSON.stringify({
          campaigns: false,
          contacts: false, 
          templates: false,
          reporting: false,
          domains: false,
          abTesting: false,
          emailValidation: true
        })},
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
    console.log('Created email_validator user with limited permissions');

    console.log('Client users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating client users:', error);
    process.exit(1);
  }
}

main();