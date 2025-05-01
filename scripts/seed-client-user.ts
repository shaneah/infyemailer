import { initDatabase } from '../server/db';
import { getStorage } from '../server/storageManager';
import { hashPassword } from '../server/auth';

async function createClientUser() {
  console.log('Seeding client user data...');
  
  try {
    // Initialize the database connection
    await initDatabase();
    
    // Get the storage instance
    const storage = getStorage();
    
    // Check if client user already exists
    const existingUser = await storage.getClientUserByUsername('client1');
    if (existingUser) {
      console.log('Client user "client1" already exists. Skipping creation.');
      return;
    }
    
    // Hash password - in a real app this would be securely handled
    // For demo purposes, we're using a plain text password
    const hashedPassword = 'clientdemo'; // In production we'd hash this with await hashPassword('clientdemo')
    
    // Create a sample client user
    const clientUser = await storage.createClientUser({
      clientId: 1,
      username: 'client1',
      password: hashedPassword,
      status: 'active',
      metadata: {
        permissions: {
          emailValidation: true,
          campaigns: true,
          contacts: true,
          templates: true,
          reporting: true,
          domains: true,
          abTesting: true
        }
      }
    });
    
    console.log('Successfully created client user:', {
      id: clientUser.id,
      username: clientUser.username,
      clientId: clientUser.clientId
    });
    
    // Ensure the storage mechanism is updated properly
    console.log('Checking that client user was created...');
    const checkUser = await storage.getClientUserByUsername('client1');
    if (checkUser) {
      console.log('Confirmed client user exists in storage');
    } else {
      console.log('WARNING: Client user was not found after creation');
    }
    
    // For debugging, list all client users
    console.log('Listing all client users:');
    const allClientUsers = await storage.getClientUsers();
    console.log(allClientUsers);
    
  } catch (error) {
    console.error('Error creating client user:', error);
  }
}

// Execute the seeding function
createClientUser().then(() => {
  console.log('Client user seeding completed.');
}).catch(error => {
  console.error('Client user seeding failed:', error);
});