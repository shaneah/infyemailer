import crypto from 'crypto';
import { promisify } from 'util';
const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  const hashedPassword1 = await hashPassword('client123');
  console.log('Hashed client1 password:', hashedPassword1);
  
  const hashedPassword2 = await hashPassword('validator123');
  console.log('Hashed email_validator password:', hashedPassword2);
}

main().catch(console.error);
