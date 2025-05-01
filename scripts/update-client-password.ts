import { initDatabase, db } from '../server/db';
import { sql, eq } from 'drizzle-orm';
import { clientUsers } from '../shared/schema';
import { getStorage } from '../server/storageManager';
import { hashPassword } from '../server/auth';

async function updateClientPassword() {
  console.log('Updating client user password...');
  
  try {
    // Initialize the database connection
    await initDatabase();
    
    // Get the storage instance
    const storage = getStorage();
    
    console.log('Looking up client user with username client1...');
    const user = await storage.getClientUserByUsername('client1');
    
    if (!user) {
      console.log('Client user "client1" not found.');
      return;
    }
    
    console.log('Found client user:', { 
      id: user.id, 
      username: user.username, 
      clientId: user.clientId
    });
    
    // Update the password directly in the database
    // This is for demonstration purposes only - in a real app, you'd use more secure methods
    console.log('Updating password...');
    
    // In a real application we would hash the password, but for demo we'll use plain text
    // For simplicity in this demo/testing scenario
    const updatedUser = await db.update(clientUsers)
      .set({ 
        password: 'clientdemo' // In production: await hashPassword('clientdemo')
      })
      .where(eq(clientUsers.username, 'client1'))
      .returning();
    
    console.log('Password updated for client user. Result:', updatedUser);
    
    // For debugging, also directly execute SQL
    console.log('Executing direct SQL update as fallback...');
    const directResult = await db.execute(
      sql`UPDATE client_users SET password = 'clientdemo' WHERE username = 'client1' RETURNING id, username, client_id`
    );
    console.log('Direct SQL update result:', directResult);
    
  } catch (error) {
    console.error('Error updating client password:', error);
  }
}

// Execute the update function
updateClientPassword().then(() => {
  console.log('Client password update completed.');
}).catch(error => {
  console.error('Client password update failed:', error);
});