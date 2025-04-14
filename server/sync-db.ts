import { db, initDatabase } from './db';
import * as fs from 'fs';
import { log } from './vite';

// Define file paths
const clientsFilePath = 'clients-data.json';
const campaignsFilePath = 'campaigns-data.json';
const templatesFilePath = 'email-templates-data.json';
const contactListsFilePath = 'contact-lists-data.json';
const contactListRelationsFilePath = 'contact-list-relations-data.json';

/**
 * Helper function to load JSON data from a file
 */
async function loadDataFromFile(filePath: string): Promise<any[]> {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Failed to load data from ${filePath}:`, error);
  }
  return [];
}

/**
 * Sync clients from file to database
 */
async function syncClients() {
  try {
    log('Synchronizing clients...', 'db-sync');
    const clients = await loadDataFromFile(clientsFilePath);
    
    for (const client of clients) {
      // Check if client already exists
      const [existingClient] = await db.query.clients.findMany({
        where: (clients, { eq }) => eq(clients.email, client.email)
      });
      
      if (!existingClient) {
        // Create new client
        const { id, ...clientData } = client;
        await db.insert(db.clients).values({
          ...clientData,
          createdAt: client.createdAt ? new Date(client.createdAt) : new Date(),
          lastCampaignAt: client.lastCampaignAt ? new Date(client.lastCampaignAt) : null,
          lastCreditUpdateAt: client.lastCreditUpdateAt ? new Date(client.lastCreditUpdateAt) : null
        });
        log(`Created client: ${client.name}`, 'db-sync');
      } else {
        log(`Client already exists: ${client.name}`, 'db-sync');
      }
    }
    
    log(`Completed syncing ${clients.length} clients`, 'db-sync');
  } catch (error) {
    console.error('Error syncing clients:', error);
  }
}

/**
 * Sync campaigns from file to database
 */
async function syncCampaigns() {
  try {
    log('Synchronizing campaigns...', 'db-sync');
    const campaigns = await loadDataFromFile(campaignsFilePath);
    
    for (const campaign of campaigns) {
      // Check if campaign already exists
      const [existingCampaign] = await db.query.campaigns.findMany({
        where: (campaigns, { eq }) => eq(campaigns.name, campaign.name)
      });
      
      if (!existingCampaign) {
        // Create new campaign
        const { id, ...campaignData } = campaign;
        await db.insert(db.campaigns).values({
          ...campaignData,
          createdAt: campaign.createdAt ? new Date(campaign.createdAt) : new Date(),
          updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt) : new Date(),
          scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt) : null,
          sentAt: campaign.sentAt ? new Date(campaign.sentAt) : null
        });
        log(`Created campaign: ${campaign.name}`, 'db-sync');
      } else {
        log(`Campaign already exists: ${campaign.name}`, 'db-sync');
      }
    }
    
    log(`Completed syncing ${campaigns.length} campaigns`, 'db-sync');
  } catch (error) {
    console.error('Error syncing campaigns:', error);
  }
}

/**
 * Sync templates from file to database
 */
async function syncTemplates() {
  try {
    log('Synchronizing templates...', 'db-sync');
    const templates = await loadDataFromFile(templatesFilePath);
    
    for (const template of templates) {
      // Check if template already exists
      const [existingTemplate] = await db.query.templates.findMany({
        where: (templates, { eq }) => eq(templates.name, template.name)
      });
      
      if (!existingTemplate) {
        // Create new template
        const { id, ...templateData } = template;
        await db.insert(db.templates).values({
          ...templateData,
          createdAt: template.createdAt ? new Date(template.createdAt) : new Date(),
          updatedAt: template.updatedAt ? new Date(template.updatedAt) : new Date()
        });
        log(`Created template: ${template.name}`, 'db-sync');
      } else {
        log(`Template already exists: ${template.name}`, 'db-sync');
      }
    }
    
    log(`Completed syncing ${templates.length} templates`, 'db-sync');
  } catch (error) {
    console.error('Error syncing templates:', error);
  }
}

/**
 * Main function to run the data synchronization
 */
async function main() {
  try {
    log('Starting database synchronization', 'db-sync');
    
    // Initialize database connection
    const dbInitialized = await initDatabase();
    if (!dbInitialized) {
      log('Failed to initialize database connection, aborting data sync', 'db-sync');
      process.exit(1);
    }
    
    log('Database connection initialized successfully', 'db-sync');
    
    // Run synchronization tasks
    await syncClients();
    await syncCampaigns();
    await syncTemplates();
    
    log('Database synchronization completed successfully', 'db-sync');
    process.exit(0);
  } catch (error) {
    console.error('Synchronization process failed:', error);
    process.exit(1);
  }
}

// Run the script
main();