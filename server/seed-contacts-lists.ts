import { pool, initDatabase } from './db';
import { log } from './vite';

/**
 * Sample contacts data
 */
const sampleContacts = [
  {
    name: 'Michael Johnson',
    email: 'michael@example.com',
    status: 'active',
    metadata: {
      phone: '555-123-4567',
      company: 'ABC Corp',
      tags: ['newsletter', 'product-updates'],
      lastOpened: '2023-04-10T09:30:00Z',
      lastClicked: '2023-04-10T09:32:45Z',
      totalOpens: 8,
      totalClicks: 3
    }
  },
  {
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    status: 'active',
    metadata: {
      phone: '555-234-5678',
      company: 'XYZ Inc',
      tags: ['newsletter', 'promotions'],
      lastOpened: '2023-04-12T14:20:00Z',
      lastClicked: '2023-04-12T14:22:30Z',
      totalOpens: 12,
      totalClicks: 5
    }
  },
  {
    name: 'David Brown',
    email: 'david@example.com',
    status: 'active',
    metadata: {
      phone: '555-345-6789',
      company: 'Acme Ltd',
      tags: ['product-updates'],
      lastOpened: '2023-04-15T11:10:00Z',
      lastClicked: null,
      totalOpens: 4,
      totalClicks: 0
    }
  },
  {
    name: 'Emily Davis',
    email: 'emily@example.com',
    status: 'unsubscribed',
    metadata: {
      phone: '555-456-7890',
      company: 'Global Solutions',
      tags: ['newsletter'],
      lastOpened: '2023-03-20T16:45:00Z',
      lastClicked: '2023-03-20T16:47:15Z',
      totalOpens: 6,
      totalClicks: 2,
      unsubscribedDate: '2023-04-05T10:30:00Z',
      unsubscribeReason: 'Too many emails'
    }
  },
  {
    name: 'James Wilson',
    email: 'james@example.com',
    status: 'bounced',
    metadata: {
      phone: '555-567-8901',
      company: 'Tech Innovations',
      tags: ['newsletter', 'product-updates', 'promotions'],
      lastOpened: null,
      lastClicked: null,
      totalOpens: 0,
      totalClicks: 0,
      bounceDate: '2023-04-08T08:15:00Z',
      bounceReason: 'Invalid email address'
    }
  }
];

/**
 * Sample lists data
 */
const sampleLists = [
  {
    name: 'Newsletter Subscribers',
    description: 'People who have subscribed to our regular newsletter',
    contacts: ['michael@example.com', 'sarah@example.com', 'david@example.com']
  },
  {
    name: 'Product Updates',
    description: 'Customers interested in product updates and new features',
    contacts: ['michael@example.com', 'david@example.com', 'james@example.com']
  },
  {
    name: 'Special Promotions',
    description: 'Contacts who want to receive promotional offers and discounts',
    contacts: ['sarah@example.com', 'james@example.com']
  },
  {
    name: 'Inactive Contacts',
    description: 'Contacts who have unsubscribed or bounced',
    contacts: ['emily@example.com', 'james@example.com']
  }
];

/**
 * Seed contacts to the database
 */
async function seedContacts() {
  try {
    log('Seeding contacts...', 'db-seed');
    let count = 0;
    
    for (const contact of sampleContacts) {
      try {
        // Check if contact already exists
        const result = await pool.query('SELECT * FROM contacts WHERE email = $1', [contact.email]);
        
        if (result.rowCount === 0) {
          // Create new contact
          await pool.query(
            'INSERT INTO contacts (name, email, status, metadata) VALUES ($1, $2, $3, $4)',
            [
              contact.name,
              contact.email,
              contact.status,
              JSON.stringify(contact.metadata)
            ]
          );
          count++;
          log(`Created contact: ${contact.name} (${contact.email})`, 'db-seed');
        } else {
          log(`Contact already exists: ${contact.name} (${contact.email})`, 'db-seed');
        }
      } catch (err) {
        console.error(`Error creating contact ${contact.name}:`, err);
        log(`Error creating contact ${contact.name}: ${err.message}`, 'db-seed');
      }
    }
    
    log(`Completed seeding ${count} contacts`, 'db-seed');
  } catch (error) {
    console.error('Error seeding contacts:', error);
    log(`Error seeding contacts: ${error.message}`, 'db-seed');
  }
}

/**
 * Seed lists to the database
 */
async function seedLists() {
  try {
    log('Seeding lists...', 'db-seed');
    let count = 0;
    
    for (const list of sampleLists) {
      try {
        // Check if list already exists
        const result = await pool.query('SELECT * FROM lists WHERE name = $1', [list.name]);
        
        let listId: number;
        
        if (result.rowCount === 0) {
          // Create new list
          const newList = await pool.query(
            'INSERT INTO lists (name, description) VALUES ($1, $2) RETURNING id',
            [
              list.name,
              list.description
            ]
          );
          listId = newList.rows[0].id;
          count++;
          log(`Created list: ${list.name}`, 'db-seed');
        } else {
          listId = result.rows[0].id;
          log(`List already exists: ${list.name}`, 'db-seed');
        }
        
        // Add contacts to the list
        let relationCount = 0;
        for (const contactEmail of list.contacts) {
          try {
            // Get contact ID
            const contactResult = await pool.query('SELECT id FROM contacts WHERE email = $1', [contactEmail]);
            
            if (contactResult.rowCount > 0) {
              const contactId = contactResult.rows[0].id;
              
              // Check if relation already exists
              const relationResult = await pool.query(
                'SELECT * FROM contact_lists WHERE contact_id = $1 AND list_id = $2',
                [contactId, listId]
              );
              
              if (relationResult.rowCount === 0) {
                // Create relation
                await pool.query(
                  'INSERT INTO contact_lists (contact_id, list_id) VALUES ($1, $2)',
                  [contactId, listId]
                );
                relationCount++;
                log(`Added contact ${contactEmail} to list ${list.name}`, 'db-seed');
              } else {
                log(`Contact ${contactEmail} already in list ${list.name}`, 'db-seed');
              }
            } else {
              log(`Contact ${contactEmail} not found, skipping relation`, 'db-seed');
            }
          } catch (err) {
            console.error(`Error adding contact ${contactEmail} to list ${list.name}:`, err);
            log(`Error adding contact ${contactEmail} to list ${list.name}: ${err.message}`, 'db-seed');
          }
        }
        
        log(`Added ${relationCount} contacts to list ${list.name}`, 'db-seed');
      } catch (err) {
        console.error(`Error creating list ${list.name}:`, err);
        log(`Error creating list ${list.name}: ${err.message}`, 'db-seed');
      }
    }
    
    log(`Completed seeding ${count} lists`, 'db-seed');
  } catch (error) {
    console.error('Error seeding lists:', error);
    log(`Error seeding lists: ${error.message}`, 'db-seed');
  }
}

/**
 * Main function to run the seed process
 */
async function main() {
  try {
    log('Starting database seed process', 'db-seed');
    
    // Initialize database connection
    const dbInitialized = await initDatabase();
    if (!dbInitialized) {
      log('Failed to initialize database connection, aborting seed process', 'db-seed');
      process.exit(1);
    }
    
    log('Database connection initialized successfully', 'db-seed');
    
    // Run seed tasks
    await seedContacts();
    await seedLists();
    
    log('Database seed process completed successfully', 'db-seed');
    process.exit(0);
  } catch (error) {
    console.error('Seed process failed:', error);
    process.exit(1);
  }
}

// Run the script
main();