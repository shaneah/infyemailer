import { db, pool, initDatabase } from './db';
import { eq, sql } from 'drizzle-orm';
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
 * Helper function to log and handle errors
 */
function logError(context: string, error: any) {
  console.error(`Error ${context}:`, error);
  log(`Error ${context}: ${error.message}`, 'db-sync');
}

/**
 * Sync clients from file to database
 */
async function syncClients() {
  try {
    log('Synchronizing clients...', 'db-sync');
    const clients = await loadDataFromFile(clientsFilePath);
    let count = 0;
    
    for (const client of clients) {
      try {
        // Map only fields that exist in the actual database schema
        const clientData = {
          name: client.name,
          email: client.email,
          company: client.company,
          status: client.status || 'active',
          industry: client.industry,
          total_spend: client.totalSpend || 0,
          created_at: client.createdAt ? new Date(client.createdAt) : new Date(),
          last_campaign_at: client.lastCampaignAt ? new Date(client.lastCampaignAt) : null,
          // Metadata can store additional fields that don't have specific columns
          metadata: {
            emailCredits: client.emailCredits || 0,
            emailCreditsPurchased: client.emailCreditsPurchased || 0,
            emailCreditsUsed: client.emailCreditsUsed || 0,
            lastCreditUpdateAt: client.lastCreditUpdateAt,
            ...client.metadata
          }
        };
        
        // Use raw SQL query with pool for direct database access
        const result = await pool.query('SELECT * FROM clients WHERE email = $1', [client.email]);
        
        if (result.rowCount === 0) {
          // Create new client using raw SQL
          await pool.query(
            'INSERT INTO clients (name, email, company, status, industry, total_spend, created_at, last_campaign_at, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [
              clientData.name,
              clientData.email,
              clientData.company,
              clientData.status,
              clientData.industry,
              clientData.total_spend,
              clientData.created_at,
              clientData.last_campaign_at,
              JSON.stringify(clientData.metadata)
            ]
          );
          count++;
          log(`Created client: ${client.name}`, 'db-sync');
        } else {
          log(`Client already exists: ${client.name}`, 'db-sync');
        }
      } catch (err) {
        logError(`migrating client ${client.name || client.email}`, err);
      }
    }
    
    log(`Completed syncing ${count} clients`, 'db-sync');
  } catch (error) {
    logError('syncing clients', error);
  }
}

/**
 * Sync campaigns from file to database
 */
async function syncCampaigns() {
  try {
    log('Synchronizing campaigns...', 'db-sync');
    const campaigns = await loadDataFromFile(campaignsFilePath);
    let count = 0;
    
    for (const campaign of campaigns) {
      try {
        // Map only fields that exist in the actual database schema
        const campaignData = {
          name: campaign.name,
          subject: campaign.subject || `${campaign.name} Campaign`,
          sender_name: campaign.fromName || 'InfyMailer',
          reply_to_email: campaign.replyTo || 'mailer@ingmailer.com',
          content: campaign.content || '',
          preview_text: campaign.previewText || '',
          status: campaign.status || 'draft',
          created_at: campaign.createdAt ? new Date(campaign.createdAt) : new Date(),
          scheduled_at: campaign.scheduledAt ? new Date(campaign.scheduledAt) : null,
          sent_at: campaign.sentAt ? new Date(campaign.sentAt) : null,
          is_ab_test: campaign.isABTest || false,
          winning_variant_id: campaign.winningVariantId || null,
          client_id: campaign.clientId || null,
          metadata: {
            type: campaign.type || 'regular',
            description: campaign.description,
            fromEmail: campaign.fromEmail,
            ...campaign.metadata
          }
        };
        
        // Use raw SQL query with pool for direct database access
        const result = await pool.query('SELECT * FROM campaigns WHERE name = $1', [campaign.name]);
        
        if (result.rowCount === 0) {
          // Create new campaign using raw SQL
          await pool.query(
            'INSERT INTO campaigns (name, subject, sender_name, reply_to_email, content, preview_text, status, created_at, scheduled_at, sent_at, is_ab_test, winning_variant_id, client_id, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
            [
              campaignData.name,
              campaignData.subject,
              campaignData.sender_name,
              campaignData.reply_to_email,
              campaignData.content,
              campaignData.preview_text,
              campaignData.status,
              campaignData.created_at,
              campaignData.scheduled_at,
              campaignData.sent_at,
              campaignData.is_ab_test,
              campaignData.winning_variant_id,
              campaignData.client_id,
              JSON.stringify(campaignData.metadata)
            ]
          );
          count++;
          log(`Created campaign: ${campaign.name}`, 'db-sync');
        } else {
          log(`Campaign already exists: ${campaign.name}`, 'db-sync');
        }
      } catch (err) {
        logError(`migrating campaign ${campaign.name}`, err);
      }
    }
    
    log(`Completed syncing ${count} campaigns`, 'db-sync');
  } catch (error) {
    logError('syncing campaigns', error);
  }
}

/**
 * Sync templates from file to database
 */
async function syncTemplates() {
  try {
    log('Synchronizing templates...', 'db-sync');
    const templates = await loadDataFromFile(templatesFilePath);
    let count = 0;
    
    for (const template of templates) {
      try {
        // Map only fields that exist in the actual database schema
        const templateData = {
          name: template.name,
          description: template.description || '',
          content: template.content || '',
          category: template.category || 'general',
          created_at: template.createdAt ? new Date(template.createdAt) : new Date(),
          updated_at: new Date(),
          metadata: {
            ...template.metadata
          }
        };
        
        // Use raw SQL query with pool for direct database access
        const result = await pool.query('SELECT * FROM templates WHERE name = $1', [template.name]);
        
        if (result.rowCount === 0) {
          // Create new template using raw SQL
          await pool.query(
            'INSERT INTO templates (name, description, content, category, created_at, updated_at, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [
              templateData.name,
              templateData.description,
              templateData.content,
              templateData.category,
              templateData.created_at,
              templateData.updated_at,
              JSON.stringify(templateData.metadata)
            ]
          );
          count++;
          log(`Created template: ${template.name}`, 'db-sync');
        } else {
          log(`Template already exists: ${template.name}`, 'db-sync');
        }
      } catch (err) {
        logError(`migrating template ${template.name}`, err);
      }
    }
    
    log(`Completed syncing ${count} templates`, 'db-sync');
  } catch (error) {
    logError('syncing templates', error);
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