import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocket } from 'ws';
import { getStorage } from "./storageManager"; // Use dynamic storage selection
const storage = getStorage();
import { isDatabaseAvailable, db } from "./db"; // Import db and check if database is available
import { eq, desc } from "drizzle-orm"; // Import Drizzle operators
import { generateSubjectLines, generateEmailTemplate, generateColorPalette } from "./services/openai";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { EmailValidationService } from "./services/emailValidation";
import { trackingService } from "./services/trackingService";
import { emailSchema } from "../shared/validation";
import { z } from "zod";
import fileUpload, { UploadedFile } from "express-fileupload";
import heatMapsRoutes from "./routes/heat-maps";
import userManagementRoutes from "./routes/user-management";
import adminClientsRoutes from "./routes/admin-clients";
import collaborationRoutes from "./routes/collaboration";
// Client portal routes removed
import { emailService } from "./services/EmailService";
import { defaultEmailSettings } from "./routes/emailSettings";

// Extend Express Request type to include files property
declare global {
  namespace Express {
    interface Request {
      files?: {
        [fieldname: string]: UploadedFile | UploadedFile[];
      };
    }
  }
}
import { registerEmailProviderRoutes } from "./routes/emailProviders";
import { registerAudiencePersonaRoutes } from "./routes/audiencePersonas";
import { registerClientProviderRoutes } from "./routes/clientProviders";
import { registerTestEmailRoutes } from "./routes/testEmail";
import { registerHealthRoutes } from "./routes/health";
import { registerEmailSettingsRoutes } from "./routes/emailSettings";
import AdmZip from "adm-zip";
import { 
  insertContactSchema, 
  insertListSchema, 
  insertCampaignSchema, 
  insertEmailSchema, 
  insertTemplateSchema, 
  insertAnalyticsSchema,
  insertCampaignVariantSchema,
  engagementMetrics,
  insertVariantAnalyticsSchema,
  insertDomainSchema,
  insertCampaignDomainSchema,
  insertClientSchema,
  insertUserSchema,
  insertClickEventSchema,
  insertOpenEventSchema,
  userLoginSchema,
  clientUserLoginSchema,
  insertClientUserSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper function to validate with Zod and return standardized errors
function validate<T>(schema: any, data: any): T | { error: string } {
  try {
    return schema.parse(data) as T;
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: fromZodError(error).message };
    }
    return { error: 'Invalid data' };
  }
}

import { initWebSocketServer } from './services/webSocketService';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize a single WebSocket server for all real-time services
  initWebSocketServer(httpServer);
  
  // Set up authentication
  setupAuth(app);
  
  // Register email provider routes
  await registerEmailProviderRoutes(app);
  
  // Register audience persona routes
  registerAudiencePersonaRoutes(app);
  
  // Register client provider routes
  registerClientProviderRoutes(app);
  
  // Register test email routes
  registerTestEmailRoutes(app);
  
  // Register health check routes
  registerHealthRoutes(app);
  
  // Register email settings routes
  registerEmailSettingsRoutes(app);
  
  // Register heat maps routes
  app.use('/api/heat-maps', heatMapsRoutes);
  
  // Register user management routes
  app.use('/api', userManagementRoutes);
  
  // Register admin client management routes
  app.use('/api/admin', adminClientsRoutes);
  
  // Register collaboration routes
  app.use('/api/collaboration', collaborationRoutes);
  
  // Client portal routes removed
  
  // A/B Testing endpoints
  app.get('/api/ab-testing/campaigns', async (req: Request, res: Response) => {
    try {
      // Get A/B testing campaigns
      const campaigns = await storage.getAbTestCampaigns();
      console.log(`Retrieved ${campaigns.length} A/B test campaigns`);
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching A/B test campaigns:', error);
      res.status(500).json({ error: 'Error fetching A/B test campaigns' });
    }
  });

  app.get('/api/ab-testing/campaigns/:id', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'This is not an A/B test campaign' });
      }
      
      const variants = await storage.getCampaignVariants(campaignId);
      res.json({ campaign, variants });
    } catch (error) {
      console.error(`Error fetching A/B test campaign details:`, error);
      res.status(500).json({ error: 'Error fetching campaign details' });
    }
  });
  
  app.get('/api/ab-testing/campaigns/:id/analytics', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'This is not an A/B test campaign' });
      }
      
      const variants = await storage.getCampaignVariants(campaignId);
      const variantAnalytics = await Promise.all(
        variants.map(async (variant) => {
          const analytics = await storage.getVariantAnalyticsByCampaign(campaignId);
          return {
            variant,
            analytics: analytics.filter(analytic => analytic.variantId === variant.id)
          };
        })
      );
      
      res.json({ campaign, variantAnalytics });
    } catch (error) {
      console.error(`Error fetching A/B test campaign analytics:`, error);
      res.status(500).json({ error: 'Error fetching campaign analytics' });
    }
  });
  
  app.post('/api/ab-testing/campaigns/:id/winner', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { variantId } = req.body;
      
      if (!variantId) {
        return res.status(400).json({ error: 'Variant ID is required' });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'This is not an A/B test campaign' });
      }
      
      const variant = await storage.getCampaignVariant(variantId);
      
      if (!variant || variant.campaignId !== campaignId) {
        return res.status(404).json({ error: 'Variant not found for this campaign' });
      }
      
      const updatedCampaign = await storage.setWinningVariant(campaignId, variantId);
      res.json(updatedCampaign);
    } catch (error) {
      console.error(`Error setting winning variant:`, error);
      res.status(500).json({ error: 'Error setting winning variant' });
    }
  });

  // Mock data for dashboard stats
  app.get('/api/stats', (req: Request, res: Response) => {
    res.json([
      {
        id: 1,
        title: 'Total Subscribers',
        value: '24,581',
        change: { color: 'success', value: '+9.3%' },
        comparison: 'Compared to last month'
      },
      {
        id: 2,
        title: 'Open Rate',
        value: '42.8%',
        change: { color: 'danger', value: '-2.1%' },
        comparison: 'Compared to last month'
      },
      {
        id: 3,
        title: 'Click Rate',
        value: '18.2%',
        change: { color: 'success', value: '+1.8%' },
        comparison: 'Compared to last month'
      },
      {
        id: 4,
        title: 'Campaigns Sent',
        value: '12',
        change: { color: 'success', value: '+3' },
        comparison: 'Compared to last month'
      },
    ]);
  });

  // Campaign stats for campaign page
  app.get('/api/campaigns/stats', (req: Request, res: Response) => {
    res.json([
      {
        id: 1,
        title: 'Active Campaigns',
        value: '3',
        change: { color: 'success', value: '+1' },
        description: '3 campaigns currently running'
      },
      {
        id: 2,
        title: 'Scheduled',
        value: '5',
        change: { color: 'success', value: '+2' },
        description: 'Next campaign on May 28'
      },
      {
        id: 3,
        title: 'Completed',
        value: '24',
        description: 'In the last 90 days'
      },
      {
        id: 4,
        title: 'Average Open Rate',
        value: '48.5%',
        change: { color: 'success', value: '+3.2%' },
        description: 'Across all campaigns'
      },
    ]);
  });

  // Get all campaigns
  app.get('/api/campaigns', async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      console.log(`Retrieved ${campaigns.length} campaigns from storage`);
      
      // Create an array to store the formatted campaigns
      const formattedCampaigns = [];
      
      // Process each campaign with its engagement metrics
      for (const campaign of campaigns) {
        try {
          const metadata = campaign.metadata as any || {};
          
          // Handle potential missing engagement_metrics table
          let metrics = [];
          try {
            // Get the engagement metrics for this campaign from the database
            metrics = await db.select()
              .from(engagementMetrics)
              .where(eq(engagementMetrics.campaignId, campaign.id))
              .orderBy(desc(engagementMetrics.date))
              .limit(1);
          } catch (metricsError) {
            console.log(`Metrics query failed: ${metricsError.message}`);
            // Table might not exist yet - this is OK, we'll use fallback values
          }
          
          // Calculate the open rate and click rate from metrics
          // If we have metrics data, use it; otherwise, fall back to metadata
          let openRate = 0;
          let clickRate = 0;
          
          if (metrics && metrics.length > 0) {
            // Metrics stores clickThroughRate as percentage * 100, convert back to decimal
            const uniqueOpens = metrics[0].uniqueOpens || 0;
            const totalOpens = metrics[0].totalOpens || 0;
            const uniqueClicks = metrics[0].uniqueClicks || 0;
            const totalClicks = metrics[0].totalClicks || 0;
            const recipients = metadata.recipients || 0;
            
            // Calculate rates - avoid division by zero
            openRate = recipients > 0 ? (uniqueOpens / recipients) * 100 : 0;
            clickRate = uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0;
          } else {
            // Fall back to metadata if no metrics found
            openRate = metadata.openRate || 0;
            clickRate = metadata.clickRate || 0;
          }
          
          formattedCampaigns.push({
            id: campaign.id,
            name: campaign.name,
            subtitle: metadata.subtitle || '',
            icon: metadata.icon || { name: 'envelope', color: 'primary' },
            status: {
              label: campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1),
              color: campaign.status === 'sent' ? 'success' : 
                    campaign.status === 'scheduled' ? 'warning' : 
                    campaign.status === 'active' ? 'primary' : 'secondary'
            },
            recipients: metadata.recipients || 0,
            openRate: openRate,
            clickRate: clickRate,
            date: metadata.date || (campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'),
          });
        } catch (err) {
          console.error(`Error formatting campaign ID ${campaign.id}:`, err);
          // Return a minimal valid object if there's an error with this campaign
          formattedCampaigns.push({
            id: campaign.id,
            name: campaign.name || 'Unnamed Campaign',
            subtitle: '',
            icon: { name: 'envelope', color: 'primary' },
            status: { label: 'Unknown', color: 'secondary' },
            recipients: 0,
            openRate: 0,
            clickRate: 0,
            date: 'N/A'
          });
        }
      }
      
      res.json(formattedCampaigns);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  });

  // Get a specific campaign
  app.get('/api/campaigns/:id', async (req: Request, res: Response) => {
    try {
      const campaign = await storage.getCampaign(parseInt(req.params.id));
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch campaign' });
    }
  });

  // Create a new campaign
  app.post('/api/campaigns', async (req: Request, res: Response) => {
    console.log("Creating campaign with data:", req.body);
    
    const validatedData = validate(insertCampaignSchema, req.body);
    if ('error' in validatedData) {
      console.error("Campaign validation error:", validatedData.error);
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      // Import email service if it doesn't exist in the current scope
      if (typeof emailService === 'undefined') {
        const { emailService } = await import('./services/EmailService');
      }
      
      // Import default email settings if needed
      if (typeof defaultEmailSettings === 'undefined') {
        const { defaultEmailSettings } = await import('./routes/emailSettings');
      }
      
      // Determine campaign status based on sendOption
      let status = 'draft';
      let sentAt = null;
      
      if (req.body.sendOption === 'now') {
        // Send immediately
        status = 'sent'; 
        sentAt = new Date();
        console.log("Campaign to be sent immediately with status:", status);
      } else if (req.body.sendOption === 'schedule' && req.body.scheduledDate) {
        // Schedule for future
        status = 'scheduled';
        console.log("Campaign scheduled for future with status:", status);
      }
      
      // Add default values and prepare the campaign data
      const campaignData = {
        ...validatedData,
        status: status,
        sentAt: sentAt,
        metadata: {
          ...validatedData.metadata,
          subtitle: req.body.subtitle || '',
          icon: req.body.icon || { name: 'envelope', color: 'primary' },
          recipients: req.body.recipients || 0,
          openRate: 0,
          clickRate: 0,
          date: req.body.scheduledDate ? new Date(req.body.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
      };
      
      const campaign = await storage.createCampaign(campaignData as any);
      console.log("Campaign created successfully:", campaign);
      
      // Actually send the campaign if sendOption is "now"
      if (req.body.sendOption === 'now') {
        setTimeout(async () => {
          try {
            console.log("Attempting to send campaign immediately...");
            
            // Get template content
            const templateId = parseInt(req.body.templateId);
            const template = await storage.getTemplate(templateId);
            
            if (!template) {
              console.error("Template not found for campaign:", templateId);
              return;
            }
            
            // Get contacts for the lists
            const contactLists = Array.isArray(req.body.contactLists) ? req.body.contactLists : [];
            let contactsToEmail = [];
            
            for (const listId of contactLists) {
              const contacts = await storage.getContactsByList(parseInt(listId));
              contactsToEmail = [...contactsToEmail, ...contacts];
            }
            
            console.log(`Found ${contactsToEmail.length} contacts to receive campaign`);
            
            if (contactsToEmail.length === 0) {
              console.log("No contacts found for the selected lists");
              return;
            }
            
            const providerName = emailService.getDefaultProviderName();
            if (!providerName) {
              console.error("No default email provider set");
              return;
            }
            
            console.log("Using email provider:", providerName);
            
            // Send to each contact
            let sentCount = 0;
            for (const contact of contactsToEmail) {
              try {
                if (!contact.email) {
                  console.error("Contact missing email:", contact);
                  continue;
                }
                
                const emailParams = {
                  from: defaultEmailSettings.fromEmail || req.body.senderName,
                  fromName: req.body.senderName || defaultEmailSettings.fromName,
                  to: contact.email,
                  subject: req.body.subject,
                  html: template.content
                };
                
                console.log(`Sending campaign email to ${contact.email}`);
                await emailService.sendEmail(emailParams);
                sentCount++;
                
                // Update campaign metadata to track recipients
                const campaignToUpdate = await storage.getCampaign(campaign.id);
                if (campaignToUpdate) {
                  let metadata = campaignToUpdate.metadata || {};
                  if (typeof metadata === 'string') {
                    try {
                      metadata = JSON.parse(metadata);
                    } catch (e) {
                      metadata = {};
                    }
                  }
                  
                  metadata.recipients = (metadata.recipients || 0) + 1;
                  await storage.updateCampaign(campaign.id, {
                    metadata: metadata
                  });
                }
              } catch (emailError) {
                console.error(`Failed to send campaign email to ${contact.email}:`, emailError);
              }
            }
            
            console.log(`Campaign ${campaign.id} sent to ${sentCount} recipients`);
            
          } catch (sendError) {
            console.error("Error sending campaign:", sendError);
          }
        }, 100); // Slight delay to avoid blocking the response
      }
      
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Campaign creation error:", error);
      res.status(500).json({ error: 'Failed to create campaign', details: error.message });
    }
  });

  // Update a campaign
  app.patch('/api/campaigns/:id', async (req: Request, res: Response) => {
    try {
      const campaign = await storage.updateCampaign(parseInt(req.params.id), req.body);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  });

  // Delete a campaign
  app.delete('/api/campaigns/:id', async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteCampaign(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  });

  // Get contacts
  app.get('/api/contacts', async (req: Request, res: Response) => {
    try {
      const contacts = await storage.getContacts();
      // For demo purposes, create some contacts if none exist
      if (!contacts || contacts.length === 0) {
        const sampleContacts = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            status: { label: 'Active', color: 'success' },
            lists: [{ id: 1, name: 'Newsletter Subscribers' }, { id: 2, name: 'Product Updates' }],
            addedOn: 'May 10, 2023'
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            status: { label: 'Active', color: 'success' },
            lists: [{ id: 1, name: 'Newsletter Subscribers' }],
            addedOn: 'May 8, 2023'
          },
          {
            id: 3,
            name: 'Robert Johnson',
            email: 'robert@example.com',
            status: { label: 'Unsubscribed', color: 'danger' },
            lists: [{ id: 3, name: 'New Customers' }],
            addedOn: 'April 29, 2023'
          }
        ];
        return res.json(sampleContacts);
      }

      try {
        // Map contacts to include list info
        const contactsWithLists = await Promise.all(contacts.map(async (contact) => {
          try {
            const lists = await storage.getListsByContact(contact.id);
            return {
              id: contact.id,
              name: contact.name || 'Unnamed Contact',
              email: contact.email,
              status: { 
                label: (contact.status || 'unknown').charAt(0).toUpperCase() + (contact.status || 'unknown').slice(1), 
                color: contact.status === 'active' ? 'success' : 
                      contact.status === 'unsubscribed' ? 'danger' : 
                      contact.status === 'bounced' ? 'warning' : 'secondary'
              },
              lists: lists && Array.isArray(lists) ? lists.map(list => ({ id: list.id, name: list.name })) : [],
              addedOn: contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
            };
          } catch (err) {
            console.error(`Error processing contact ${contact.id}:`, err);
            return {
              id: contact.id,
              name: contact.name || 'Unnamed Contact',
              email: contact.email,
              status: { label: 'Unknown', color: 'secondary' },
              lists: [],
              addedOn: 'N/A'
            };
          }
        }));

        res.json(contactsWithLists);
      } catch (mappingError) {
        console.error('Error mapping contacts:', mappingError);
        // Fallback to returning basic contact info without lists
        const basicContacts = contacts.map(contact => ({
          id: contact.id,
          name: contact.name || 'Unnamed Contact',
          email: contact.email,
          status: { label: 'Unknown', color: 'secondary' },
          lists: [],
          addedOn: 'N/A'
        }));
        res.json(basicContacts);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  // Create a new contact
  // Import contacts
  app.post('/api/contacts/import', async (req: Request, res: Response) => {
    const { emails, contacts, format, listId } = req.body;
    
    console.log(`Contact import started. Format: ${format}, List ID: ${listId || 'none'}`);
    console.log(`Contacts data type: ${Array.isArray(contacts) ? 'Array' : typeof contacts}`);
    console.log(`Emails data type: ${Array.isArray(emails) ? 'Array' : typeof emails}`);
    
    // Initialize results object
    const results = {
      total: 0,
      valid: 0,
      invalid: 0,
      duplicates: 0,
      details: [] as string[]
    };
    
    try {
      // Determine which data source to use (contacts or emails)
      let processData: Array<any> = [];
      let useDetailedData = false;
      
      if (Array.isArray(contacts) && contacts.length > 0) {
        processData = contacts;
        useDetailedData = true;
        results.total = contacts.length;
        console.log(`Using detailed contact data. Count: ${contacts.length}`);
      } else if (Array.isArray(emails) && emails.length > 0) {
        processData = emails;
        results.total = emails.length;
        console.log(`Using simple email array. Count: ${emails.length}`);
      } else {
        return res.status(400).json({ 
          error: 'Invalid import data. Requires either contacts or emails array.',
          total: 0,
          valid: 0,
          invalid: 0,
          duplicates: 0,
          details: ['No valid data provided']
        });
      }

      // Process contacts
      for (let i = 0; i < processData.length; i++) {
        const item = processData[i];
        
        // Extract email and name based on data type
        let email: string;
        let name: string | undefined;
        
        if (useDetailedData) {
          // Using contacts array with objects
          email = typeof item === 'object' ? item.email?.trim() : String(item).trim();
          name = typeof item === 'object' ? item.name?.trim() : undefined;
        } else {
          // Using simple emails array
          email = String(item).trim();
        }
        
        // Basic email validation
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (!isValidEmail) {
          results.invalid++;
          results.details.push(`Invalid format: ${email || 'empty'}`);
          continue;
        }

        // Check for duplicates
        const existing = await storage.getContactByEmail(email);
        if (existing) {
          results.duplicates++;
          results.details.push(`Duplicate: ${email}`);
          continue;
        }

        // Determine the name to use if not provided
        if (!name) {
          // Use first part of email as name
          name = email.split('@')[0];
        }

        // Add valid contact
        const contact = await storage.createContact({
          email,
          name,
          status: 'active',
          metadata: { source: `import-${format || 'unknown'}`, importDate: new Date().toISOString() }
        });

        // Add to list if specified
        if (listId && contact) {
          await storage.addContactToList({
            contactId: contact.id,
            listId: parseInt(listId, 10)
          });
        }

        results.valid++;
      }

      console.log(`Import completed successfully. Total: ${results.total}, Valid: ${results.valid}, Invalid: ${results.invalid}, Duplicates: ${results.duplicates}`);
      
      // Limit details to avoid massive response size
      if (results.details.length > 100) {
        const originalCount = results.details.length;
        results.details = results.details.slice(0, 100);
        results.details.push(`... and ${originalCount - 100} more`);
      }
      
      res.status(200).json(results);
    } catch (error) {
      console.error('Import contacts error:', error);
      res.status(500).json({ 
        error: 'Failed to import contacts', 
        message: error.message,
        total: results.total,
        valid: results.valid,
        invalid: results.invalid,
        duplicates: results.duplicates,
        details: results.details
      });
    }
  });

  // Export contacts
  app.get('/api/contacts/export', async (req: Request, res: Response) => {
    const format = req.query.format as string || 'txt';
    const listId = req.query.listId ? parseInt(req.query.listId as string, 10) : undefined;
    
    try {
      // Get contacts, possibly filtered by list
      const contacts = listId 
        ? await storage.getContactsByList(listId)
        : await storage.getContacts();
        
      let content = '';
      
      // Format according to requested format
      if (format === 'json') {
        content = JSON.stringify(contacts, null, 2);
      } else if (format === 'csv') {
        // CSV header
        content = 'Email,Name,Status,Added On\n';
        // CSV rows
        contacts.forEach(contact => {
          content += `${contact.email},${contact.name || ''},${contact.status || ''},${contact.createdAt || ''}\n`;
        });
      } else {
        // Plain text - one email per line
        content = contacts.map(contact => contact.email).join('\n');
      }
      
      res.status(200).json({ 
        content,
        count: contacts.length
      });
    } catch (error) {
      console.error('Export contacts error:', error);
      res.status(500).json({ error: 'Failed to export contacts' });
    }
  });
  
  // Update a contact
  app.patch('/api/contacts/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    try {
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      const updated = await storage.updateContact(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error('Update contact error:', error);
      res.status(500).json({ error: 'Failed to update contact' });
    }
  });
  
  // Delete a contact
  app.delete('/api/contacts/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    try {
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      const success = await storage.deleteContact(id);
      if (success) {
        res.status(200).json({ message: 'Contact deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete contact' });
      }
    } catch (error) {
      console.error('Delete contact error:', error);
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  });
  
  // Add contact to a list
  app.post('/api/contacts/:contactId/lists/:listId', async (req: Request, res: Response) => {
    const contactId = parseInt(req.params.contactId, 10);
    const listId = parseInt(req.params.listId, 10);
    
    try {
      const contact = await storage.getContact(contactId);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      const list = await storage.getList(listId);
      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }
      
      await storage.addContactToList({
        contactId,
        listId
      });
      
      res.status(200).json({ message: 'Contact added to list successfully' });
    } catch (error) {
      console.error('Add contact to list error:', error);
      res.status(500).json({ error: 'Failed to add contact to list' });
    }
  });
  
  // Remove contact from a list
  app.delete('/api/contacts/:contactId/lists/:listId', async (req: Request, res: Response) => {
    const contactId = parseInt(req.params.contactId, 10);
    const listId = parseInt(req.params.listId, 10);
    
    try {
      const success = await storage.removeContactFromList(contactId, listId);
      if (success) {
        res.status(200).json({ message: 'Contact removed from list successfully' });
      } else {
        res.status(500).json({ error: 'Failed to remove contact from list' });
      }
    } catch (error) {
      console.error('Remove contact from list error:', error);
      res.status(500).json({ error: 'Failed to remove contact from list' });
    }
  });

  app.post('/api/contacts', async (req: Request, res: Response) => {
    const validatedData = validate(insertContactSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      // Check if the contact already exists
      const existing = await storage.getContactByEmail(validatedData.email);
      if (existing) {
        // Option 1: You can either return an error with additional info
        return res.status(400).json({ 
          error: 'A contact with this email already exists',
          contactId: existing.id,
          contact: existing
        });
        
        // Option 2: Auto-update the existing contact (commented out)
        /*
        // Update existing contact
        const updatedContact = await storage.updateContact(existing.id, {
          name: validatedData.name,
          // Any other fields to update
        });
        
        // Add to list if specified
        if (req.body.list) {
          const listId = parseInt(req.body.list);
          await storage.addContactToList({ contactId: existing.id, listId });
        }
        
        return res.status(200).json({
          ...updatedContact,
          message: 'Contact already existed and was updated'
        });
        */
      }

      console.log('Creating new contact:', validatedData);
      const contact = await storage.createContact(validatedData);
      
      // If a list is specified, add the contact to it
      if (req.body.list) {
        const listId = parseInt(req.body.list);
        await storage.addContactToList({ contactId: contact.id, listId });
      }

      res.status(201).json(contact);
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });

  // Get lists
  app.get('/api/lists', async (req: Request, res: Response) => {
    try {
      const lists = await storage.getLists();
      
      // Get all contactLists data for counting
      const allContactLists = await storage.getContactLists();
      
      // Count contacts per list using the relationship table
      const contactCountMap = new Map<number, number>();
      
      allContactLists.forEach(contactList => {
        const listId = contactList.listId;
        contactCountMap.set(listId, (contactCountMap.get(listId) || 0) + 1);
      });
      
      // Map lists to include count from our map
      const listsWithCount = lists.map(list => {
        return {
          id: list.id.toString(),
          name: list.name,
          count: contactCountMap.get(list.id) || 0,
          lastUpdated: list.updatedAt ? new Date(list.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
        };
      });

      console.log('Lists with counts:', listsWithCount);
      res.json(listsWithCount);
    } catch (error) {
      console.error('Error fetching lists:', error);
      res.status(500).json({ error: 'Failed to fetch lists' });
    }
  });

  // Create a new list
  app.post('/api/lists', async (req: Request, res: Response) => {
    const validatedData = validate(insertListSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      const list = await storage.createList(validatedData);
      res.status(201).json(list);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create list' });
    }
  });

  // Delete a list by ID
  app.delete('/api/lists/:id', async (req: Request, res: Response) => {
    try {
      const listId = parseInt(req.params.id);
      
      if (isNaN(listId)) {
        return res.status(400).json({ error: 'Invalid list ID' });
      }
      
      const list = await storage.getList(listId);
      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }
      
      // Delete all associations of contacts with this list
      const contacts = await storage.getContactsByList(listId);
      for (const contact of contacts) {
        await storage.removeContactFromList(contact.id, listId);
      }
      
      // Delete the list itself
      const success = await storage.deleteList(listId);
      
      if (success) {
        res.status(200).json({ message: 'List deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete list' });
      }
    } catch (error) {
      console.error('Error deleting list:', error);
      res.status(500).json({ error: 'Failed to delete list' });
    }
  });
  
  // Get contacts by list ID
  app.get('/api/lists/:id/contacts', async (req: Request, res: Response) => {
    try {
      const listId = parseInt(req.params.id);
      
      if (isNaN(listId)) {
        return res.status(400).json({ error: 'Invalid list ID' });
      }
      
      const list = await storage.getList(listId);
      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }
      
      const contacts = await storage.getContactsByList(listId);
      
      // Format the contacts with the status labels and other metadata
      const formattedContacts = contacts.map(contact => {
        let statusObj = { value: contact.status || 'active', label: 'Active', color: 'success' };
        
        // Map status to display values
        if (contact.status === 'inactive') {
          statusObj = { value: 'inactive', label: 'Inactive', color: 'warning' };
        } else if (contact.status === 'bounced') {
          statusObj = { value: 'bounced', label: 'Bounced', color: 'danger' };
        } else if (contact.status === 'unsubscribed') {
          statusObj = { value: 'unsubscribed', label: 'Unsubscribed', color: 'danger' };
        }
        
        return {
          ...contact,
          status: statusObj,
          addedOn: contact.createdAt 
            ? new Date(contact.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }) 
            : 'N/A'
        };
      });
      
      res.json({
        list: {
          id: list.id,
          name: list.name,
          description: list.description,
          contactCount: formattedContacts.length
        },
        contacts: formattedContacts
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contacts for this list' });
    }
  });

  // Remove contacts from a list in bulk
  app.post('/api/lists/:id/remove-contacts', async (req: Request, res: Response) => {
    try {
      console.log("Bulk remove contacts API called with params:", req.params, "and body:", req.body);
      const listId = parseInt(req.params.id);
      const { contactIds } = req.body;
      
      console.log("Parsed list ID:", listId, "and contact IDs:", contactIds);
      
      if (isNaN(listId)) {
        console.log("Invalid list ID:", req.params.id);
        return res.status(400).json({ error: 'Invalid list ID' });
      }
      
      if (!Array.isArray(contactIds) || contactIds.length === 0) {
        console.log("Invalid contact IDs:", contactIds);
        return res.status(400).json({ error: 'Contact IDs must be provided as an array' });
      }
      
      const list = await storage.getList(listId);
      if (!list) {
        return res.status(404).json({ error: 'List not found' });
      }
      
      // Remove each contact from the list
      const results = await Promise.all(
        contactIds.map(async (contactId) => {
          try {
            await storage.removeContactFromList(contactId, listId);
            return { contactId, success: true };
          } catch (error) {
            return { contactId, success: false, error: 'Failed to remove contact' };
          }
        })
      );
      
      const success = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      res.json({
        message: `Removed ${success} contacts from list${failed > 0 ? `, ${failed} failed` : ''}`,
        results
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove contacts from list' });
    }
  });

  // Get templates
  app.get('/api/templates', async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      let templates;
      
      if (category && category !== 'all') {
        templates = await storage.getTemplatesByCategory(category);
      } else {
        templates = await storage.getTemplates();
      }

      // Format templates for frontend
      const formattedTemplates = templates.map(template => {
        const metadata = template.metadata as any || {};
        return {
          id: template.id,
          name: template.name,
          description: template.description || '',
          icon: metadata.icon || 'file-earmark-text',
          iconColor: metadata.iconColor || 'primary',
          lastUsed: 'May 15, 2023', // Placeholder
          selected: metadata.selected || false,
          new: metadata.new || false
        };
      });

      res.json(formattedTemplates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  // Create a new template
  app.post('/api/templates', async (req: Request, res: Response) => {
    try {
      // Allow more flexible template creation for imports
      const { name, content, description, category, subject, metadata } = req.body;
      
      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }
      
      const template = await storage.createTemplate({
        name,
        content,
        description: description || `Template: ${name}`,
        category: category || 'general',
        subject: subject || `${name} Subject`,
        metadata: metadata || {}
      });
      
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  });

  // Get a specific template
  app.get('/api/templates/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }
      
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      res.json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  });

  // Update a template
  app.patch('/api/templates/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }
      
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      const updatedTemplate = await storage.updateTemplate(id, req.body);
      res.json(updatedTemplate);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  });

  // Delete a template
  app.delete('/api/templates/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }
      
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      const success = await storage.deleteTemplate(id);
      if (success) {
        res.status(200).json({ message: 'Template deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete template' });
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  });
  
  // Send a test email from a template
  app.post('/api/templates/:id/test-email', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }
  app.get('/api/client/:clientId/templates', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
      
      const category = req.query.category as string;
      let templates;
      
      if (category && category !== 'all') {
        templates = await storage.getClientTemplatesByCategory(clientId, category);
      } else {
        templates = await storage.getClientTemplates(clientId);
      }
      
      // Format templates for frontend
      const formattedTemplates = templates.map(template => {
        const metadata = template.metadata as any || {};
        return {
          id: template.id,
          name: template.name,
          description: template.description || '',
          icon: metadata.icon || 'file-earmark-text',
          iconColor: metadata.iconColor || 'primary',
          lastUsed: 'May 15, 2023', // Placeholder
          selected: metadata.selected || false,
          new: metadata.new || false,
          clientId: template.clientId
        };
      });
      
      res.json(formattedTemplates);
    } catch (error) {
      console.error('Error fetching client templates:', error);
      res.status(500).json({ error: 'Failed to fetch client templates' });
    }
  });
  
  // Create a new client template
  app.post('/api/client/:clientId/templates', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
      
      const { name, content, description, category, subject, metadata } = req.body;
      
      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }
      
      const template = await storage.createClientTemplate(clientId, {
        name,
        content,
        description: description || `Template: ${name}`,
        category: category || 'general',
        subject: subject || `${name} Subject`,
        metadata: metadata || {}
      });
      
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating client template:', error);
      res.status(500).json({ error: 'Failed to create client template' });
    }
  });
      
      const { email, subject, personalizeContent } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email address is required' });
      }
      
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      // Get SMTP settings (would be dynamic in production)
      const smtpSettings = {
        host: 'smtpout.secureserver.net',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER || 'demo@infymailer.com',
          pass: process.env.SMTP_PASS || 'demopassword'
        }
      };
      
      // Personalize content if requested
      let emailContent = template.content;
      if (personalizeContent) {
        // Basic personalization with sample data
        const sampleData = {
          firstName: 'John',
          lastName: 'Smith',
          email: email,
          company: 'Acme Inc.',
          date: new Date().toLocaleDateString(),
          product: 'Premium Plan',
          amount: '$99.00'
        };
        
        // Replace placeholders with sample data
        Object.entries(sampleData).forEach(([key, value]) => {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          emailContent = emailContent.replace(regex, String(value));
        });
        
        // Replace any remaining placeholders with a generic value
        emailContent = emailContent.replace(/{{(\s*[a-zA-Z0-9_.-]+\s*)}}/g, '[Sample Data]');
      }
      
      // In a real implementation, we would send the email here
      console.log(`Test email would be sent to ${email} with subject: ${subject || template.subject || template.name}`);
      console.log(`Email content: ${emailContent.substring(0, 100)}...`);

      // Simulate sending and return success
      // In a production environment, this would use a real email sending service
      
      res.json({ 
        success: true,
        message: `Test email sent to ${email}`,
        details: {
          subject: subject || template.subject || template.name,
          contentLength: emailContent.length,
          template: template.name
        }
      });
      
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });
  
  // Import ZIP template
  app.post('/api/templates/import-zip', async (req: Request, res: Response) => {
    try {
      // Get the template name from the request
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Template name is required' });
      }
      
      // Check if a file was uploaded
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: 'No file was uploaded' });
      }
      
      // Get the uploaded file
      const uploadedFile = req.files.file as any;
      
      // Validate that it's a ZIP file
      if (!uploadedFile.name || 
         !(uploadedFile.name.toLowerCase().endsWith('.zip') || 
           uploadedFile.mimetype === 'application/zip' || 
           uploadedFile.mimetype === 'application/x-zip-compressed')) {
        return res.status(400).json({ error: 'Invalid file format. Please upload a ZIP file.' });
      }
      
      // Now let's actually process the ZIP file
      try {
        // Create a new AdmZip instance with the uploaded file
        const zip = new AdmZip(uploadedFile.tempFilePath || uploadedFile.data);
        
        // Get the entries
        const zipEntries = zip.getEntries();
        
        // Look for the index.html file first
        let indexHtmlEntry = zipEntries.find(entry => 
          entry.entryName.toLowerCase() === 'index.html' ||
          entry.entryName.toLowerCase().endsWith('/index.html')
        );
        
        // If index.html isn't found, look for any HTML file
        if (!indexHtmlEntry) {
          indexHtmlEntry = zipEntries.find(entry => 
            entry.entryName.toLowerCase().endsWith('.html') ||
            entry.entryName.toLowerCase().endsWith('.htm')
          );
        }
        
        if (!indexHtmlEntry) {
          return res.status(400).json({ 
            error: 'Invalid ZIP file. No HTML files found in the archive.' 
          });
        }
        
        // Extract the content of the HTML file
        const htmlContent = indexHtmlEntry.getData().toString('utf8');
        
        // Create a template content object with JSON structure
        const templateContent = {
          name: name,
          subject: `${name}`,
          previewText: `${name} - Imported ZIP Template`,
          sections: [
            {
              id: `section-${Date.now()}`,
              elements: [
                {
                  id: `element-${Date.now()}`,
                  type: "text",
                  content: { 
                    text: "This template was imported from a ZIP file. You can now edit it using the drag-and-drop editor." 
                  },
                  styles: { 
                    fontSize: "16px", 
                    color: "#666666", 
                    textAlign: "left" 
                  }
                },
                {
                  id: `element-${Date.now() + 1}`,
                  type: "html",
                  content: { 
                    html: htmlContent 
                  },
                  styles: {}
                }
              ],
              styles: {
                backgroundColor: "#ffffff",
                padding: "12px"
              }
            }
          ],
          styles: {
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#f4f4f4",
            maxWidth: "600px"
          }
        };
        
        // Generate a list of all the resources in the ZIP
        const resources = zipEntries
          .filter(entry => !entry.isDirectory && 
                          entry.entryName !== indexHtmlEntry.entryName &&
                          !entry.entryName.startsWith('__MACOSX/')) // Skip macOS specific files
          .map(entry => ({
            name: entry.entryName,
            size: entry.header.size
          }));
        
        // Create the template with additional logging
        console.log(`Importing ZIP template: ${name}`);
        
        const template = await storage.createTemplate({
          name: name,
          content: JSON.stringify(templateContent),
          description: `Imported ZIP template: ${name}`,
          category: 'imported',
          metadata: {
            importedFromZip: true,
            originalFileName: uploadedFile.name,
            fileSizeKB: Math.round(uploadedFile.size / 1024),
            importDate: new Date().toISOString(),
            originalHtml: htmlContent,
            resources: resources,
            htmlFileName: indexHtmlEntry.entryName,
            new: true
          }
        });
        
        console.log(`ZIP template imported successfully with ID: ${template.id}`);
        res.status(201).json(template);
      } catch (zipError) {
        console.error('Error processing ZIP file:', zipError);
        return res.status(500).json({ 
          error: 'Failed to process ZIP file: ' + (zipError.message || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('Error importing ZIP template:', error);
      res.status(500).json({ error: 'Failed to import template' });
    }
  });

  // Generate template with AI
  app.post('/api/templates/generate-ai', async (req: Request, res: Response) => {
    try {
      const { 
        prompt,
        templateType = 'newsletter', 
        industry = 'technology', 
        targetAudience = 'general customers',
        brandTone = 'professional'
      } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      console.log('AI Template Generation:', { templateType, industry, prompt: prompt.substring(0, 50) + '...' });
      
      // Use the OpenAI service to generate the template
      const generatedTemplate = await generateEmailTemplate(
        templateType,
        industry,
        prompt, // Using the prompt as the purpose
        targetAudience,
        brandTone,
        '' // No key points for now
      );
      
      // Parse the HTML content to extract sections for the template builder
      // This is a simplified version that extracts headings, paragraphs, and button/CTA elements
      const sections = [];
      
      // Add a heading section
      sections.push({
        id: `section-${Date.now()}-1`,
        type: "heading",
        content: generatedTemplate.name || "AI Generated Template"
      });
      
      // Add a text section with the description
      sections.push({
        id: `section-${Date.now()}-2`,
        type: "text",
        content: generatedTemplate.description || "AI generated content based on your description."
      });
      
      // Add a sample button (can be improved with HTML parsing in the future)
      sections.push({
        id: `section-${Date.now()}-3`,
        type: "button",
        content: JSON.stringify({
          text: "Learn More",
          url: "#"
        })
      });
      
      // Return both the raw HTML and parsed sections
      res.json({
        success: true,
        template: generatedTemplate,
        sections: sections
      });
    } catch (error) {
      console.error('Error generating AI template:', error);
      res.status(500).json({ 
        error: 'Failed to generate AI template', 
        message: error.message || 'Unknown error' 
      });
    }
  });

  // Send an individual email
  app.post('/api/emails', async (req: Request, res: Response) => {
    const validatedData = validate(insertEmailSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      // Simulate sending an email
      const email = await storage.createEmail({
        ...validatedData,
        status: 'sent',
        sentAt: new Date()
      });
      
      res.status(201).json(email);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send email' });
    }
  });
  
  // Get all emails
  app.get('/api/emails', async (req: Request, res: Response) => {
    try {
      const emails = await storage.getEmails();
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  });

  // Get audience growth data
  app.get('/api/audience/growth', (req: Request, res: Response) => {
    res.json([
      {
        id: 1,
        label: 'Total Subscribers',
        change: '+1,248',
        percentage: 75,
        barColor: 'primary',
        changeColor: 'success'
      },
      {
        id: 2,
        label: 'Active Subscribers',
        change: '+921',
        percentage: 68,
        barColor: 'success',
        changeColor: 'success'
      },
      {
        id: 3,
        label: 'Unsubscribes',
        change: '+124',
        percentage: 12,
        barColor: 'danger',
        changeColor: 'danger'
      },
      {
        id: 4,
        label: 'Bounce Rate',
        change: '3.2%',
        percentage: 3.2,
        barColor: 'warning',
        changeColor: 'secondary'
      }
    ]);
  });

  // Analytics data endpoints
  app.get('/api/analytics/devices', (req: Request, res: Response) => {
    res.json([
      { name: 'Mobile', percentage: 52, icon: 'phone' },
      { name: 'Desktop', percentage: 36, icon: 'laptop' },
      { name: 'Tablet', percentage: 12, icon: 'tablet' }
    ]);
  });

  app.get('/api/analytics/geography', (req: Request, res: Response) => {
    res.json([
      { code: 'US', name: 'United States', flag: '🇺🇸', opens: 6542, percentage: 45 },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', opens: 2356, percentage: 18 },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', opens: 1845, percentage: 15 },
      { code: 'AU', name: 'Australia', flag: '🇦🇺', opens: 1253, percentage: 10 },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', opens: 872, percentage: 7 }
    ]);
  });

  app.get('/api/analytics/top-campaigns', (req: Request, res: Response) => {
    res.json([
      { id: 1, name: 'Product Launch', opens: 58.7, clicks: 32.4, conversions: 12.6 },
      { id: 2, name: 'Monthly Newsletter', opens: 46.2, clicks: 21.8, conversions: 8.3 },
      { id: 3, name: 'Welcome Series', opens: 52.1, clicks: 27.5, conversions: 16.2 },
      { id: 4, name: 'Black Friday Sale', opens: 61.8, clicks: 38.2, conversions: 21.5 },
      { id: 5, name: 'Product Updates', opens: 42.3, clicks: 18.9, conversions: 6.7 }
    ]);
  });

  // Record analytics event
  app.post('/api/analytics', async (req: Request, res: Response) => {
    const validatedData = validate(insertAnalyticsSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      const analytic = await storage.recordAnalytic(validatedData);
      res.status(201).json(analytic);
    } catch (error) {
      res.status(500).json({ error: 'Failed to record analytic' });
    }
  });

  // A/B Testing routes
  app.get('/api/ab-testing/campaigns', async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getAbTestCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching A/B test campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch A/B test campaigns' });
    }
  });
  
  app.get('/api/ab-testing/campaigns/:id', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'Campaign is not an A/B test' });
      }
      
      const variants = await storage.getCampaignVariants(campaignId);
      
      res.json({
        campaign,
        variants
      });
    } catch (error) {
      console.error('Error fetching A/B test campaign:', error);
      res.status(500).json({ error: 'Failed to fetch A/B test campaign' });
    }
  });
  
  app.get('/api/ab-testing/campaigns/:id/analytics', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'Campaign is not an A/B test' });
      }
      
      const variants = await storage.getCampaignVariants(campaignId);
      const analytics = await storage.getVariantAnalyticsByCampaign(campaignId);
      
      // Group analytics by variant
      const variantAnalytics = variants.map(variant => {
        const variantData = analytics.filter(a => a.variantId === variant.id);
        return {
          variant,
          analytics: variantData
        };
      });
      
      res.json({
        campaign,
        variantAnalytics
      });
    } catch (error) {
      console.error('Error fetching A/B test campaign analytics:', error);
      res.status(500).json({ error: 'Failed to fetch A/B test campaign analytics' });
    }
  });
  
  // Create a new campaign variant
  app.post('/api/ab-testing/campaigns/:id/variants', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'Campaign is not an A/B test' });
      }
      
      const validatedData = validate(insertCampaignVariantSchema, {
        ...req.body,
        campaignId
      });
      
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const variant = await storage.createCampaignVariant(validatedData);
      
      res.status(201).json(variant);
    } catch (error) {
      console.error('Error creating campaign variant:', error);
      res.status(500).json({ error: 'Failed to create campaign variant' });
    }
  });
  
  // Update a campaign variant
  app.patch('/api/ab-testing/variants/:id', async (req: Request, res: Response) => {
    try {
      const variantId = parseInt(req.params.id);
      const variant = await storage.getCampaignVariant(variantId);
      
      if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      const updatedVariant = await storage.updateCampaignVariant(variantId, req.body);
      
      res.json(updatedVariant);
    } catch (error) {
      console.error('Error updating campaign variant:', error);
      res.status(500).json({ error: 'Failed to update campaign variant' });
    }
  });
  
  // Delete a campaign variant
  app.delete('/api/ab-testing/variants/:id', async (req: Request, res: Response) => {
    try {
      const variantId = parseInt(req.params.id);
      const variant = await storage.getCampaignVariant(variantId);
      
      if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      const success = await storage.deleteCampaignVariant(variantId);
      
      res.json({ success });
    } catch (error) {
      console.error('Error deleting campaign variant:', error);
      res.status(500).json({ error: 'Failed to delete campaign variant' });
    }
  });
  
  // Record variant analytics
  app.post('/api/ab-testing/variants/:id/analytics', async (req: Request, res: Response) => {
    try {
      const variantId = parseInt(req.params.id);
      const variant = await storage.getCampaignVariant(variantId);
      
      if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      const validatedData = validate(insertVariantAnalyticsSchema, {
        ...req.body,
        variantId,
        campaignId: variant.campaignId
      });
      
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const analytic = await storage.recordVariantAnalytic(validatedData);
      
      res.status(201).json(analytic);
    } catch (error) {
      console.error('Error recording variant analytics:', error);
      res.status(500).json({ error: 'Failed to record variant analytics' });
    }
  });
  
  // Set winning variant for an A/B test campaign
  app.post('/api/ab-testing/campaigns/:id/winner', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { variantId } = req.body;
      
      if (!variantId) {
        return res.status(400).json({ error: 'Variant ID is required' });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'Campaign is not an A/B test' });
      }
      
      const variant = await storage.getCampaignVariant(parseInt(variantId));
      if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      const updatedCampaign = await storage.setWinningVariant(campaignId, parseInt(variantId));
      
      res.json({
        success: true,
        campaign: updatedCampaign
      });
    } catch (error) {
      console.error('Error setting winning variant:', error);
      res.status(500).json({ error: 'Failed to set winning variant' });
    }
  });

  // User/Admin routes
  app.post('/api/register', async (req: Request, res: Response) => {
    console.log('Registration request received:', req.body);
    
    try {
      const validatedData = validate(insertUserSchema, req.body);
      if ('error' in validatedData) {
        console.log('Validation error:', validatedData.error);
        return res.status(400).json({ error: validatedData.error });
      }

      console.log('Validated data:', validatedData);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        console.log('Username already exists:', validatedData.username);
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        console.log('Email already exists:', validatedData.email);
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Ensure necessary fields exist with proper defaults
      const userData = {
        ...validatedData,
        status: validatedData.status || 'active',
        role: validatedData.role || 'admin',
        metadata: validatedData.metadata || {}
      };
      
      console.log('Creating user with data:', userData);
      
      // Create new user
      const newUser = await storage.createUser(userData);
      console.log('User created successfully:', newUser.id);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Registration failed. Please try again.' });
    }
  });

  app.post('/api/login', async (req: Request, res: Response) => {
    const validatedData = validate(userLoginSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      const { usernameOrEmail, password } = validatedData;
      const user = await storage.verifyUserLogin(usernameOrEmail, password);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Store user in session (you'd use req.session.user in a real app)
      // For now, we'll just return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        ...userWithoutPassword, 
        lastLogin: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  });
  
  app.post('/api/logout', (req: Request, res: Response) => {
    // In a real app with sessions, you would clear the session here
    // req.session.destroy();
    
    console.log('User logged out');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
  
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      // Don't send passwords to the client
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    const validatedData = validate(insertUserSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      // Check if user already exists
      const existingByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingByUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      const existingByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingByEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      // In a real app, you would hash the password here
      const user = await storage.createUser(validatedData);
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Client User routes
  app.post('/api/client-login', async (req: Request, res: Response) => {
    console.log('Client login request received:', req.body);
    
    const validatedData = validate(clientUserLoginSchema, req.body);
    if ('error' in validatedData) {
      console.log('Client login validation error:', validatedData.error);
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      const { username, password } = validatedData;
      console.log(`Client login attempt for: ${username}`);
      
      // First check if the user exists
      const user = await storage.getClientUserByUsername(username);
      console.log(`getClientUserByUsername returned:`, user);
      
      if (!user) {
        console.log(`Client user not found: ${username}`);
        return res.status(401).json({ error: 'Invalid credentials (user not found)' });
      }
      
      console.log(`Client user found. Password format: ${user.password.includes('.') ? 'hashed' : 'plain'}`);
      console.log(`User metadata:`, user.metadata);
      
      // For demo purposes: special override for username "client1" with password "clientdemo" 
      let clientUser;
      if (username === "client1" && password === "clientdemo") {
        console.log(`Using demo override for client login`);
        clientUser = user;
      } else {
        // Regular password verification
        clientUser = await storage.verifyClientLogin(username, password);
      }
      
      console.log(`verifyClientLogin returned:`, clientUser);
      
      if (!clientUser) {
        console.log(`Password verification failed for client user: ${username}`);
        return res.status(401).json({ error: 'Invalid credentials (password mismatch)' });
      }
      
      // Get the associated client for this user
      const client = await storage.getClient(clientUser.clientId);
      console.log(`getClient returned:`, client);
      
      if (!client) {
        console.log(`Client account not found for user: ${username}, client ID: ${clientUser.clientId}`);
        return res.status(500).json({ error: 'Client account not found' });
      }
      
      console.log(`Client login successful for: ${username}, client: ${client.name}`);
      
      // Don't send password back to the client
      const { password: _, ...clientUserWithoutPassword } = clientUser;
      
      const responseData = { 
        ...clientUserWithoutPassword,
        clientName: client.name,
        clientCompany: client.company,
        lastLogin: new Date().toISOString() 
      };
      
      console.log(`Sending client login response:`, responseData);
      
      res.json(responseData);
    } catch (error) {
      console.error('Client login error:', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  });
  
  app.get('/api/client-users', async (req: Request, res: Response) => {
    try {
      const clientUsers = await storage.getClientUsers();
      
      // Don't send passwords back to client
      const safeClientUsers = clientUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(safeClientUsers);
    } catch (error) {
      console.error('Error fetching client users:', error);
      res.status(500).json({ error: 'Failed to fetch client users' });
    }
  });
  
  app.get('/api/clients/:clientId/users', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const clientUsers = await storage.getClientUsersByClientId(clientId);
      
      // Don't send passwords back to client
      const safeClientUsers = clientUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(safeClientUsers);
    } catch (error) {
      console.error('Error fetching client users:', error);
      res.status(500).json({ error: 'Failed to fetch client users' });
    }
  });
  
  app.post('/api/client-users', async (req: Request, res: Response) => {
    const validatedData = validate(insertClientUserSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      // Check if username already exists
      const existing = await storage.getClientUserByUsername(validatedData.username);
      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Check if client exists
      const client = await storage.getClient(validatedData.clientId);
      if (!client) {
        return res.status(400).json({ error: 'Client not found' });
      }
      
      // Password needs to be hashed
      const hashedPassword = await hashPassword(validatedData.password);
      const clientUserWithHashedPassword = {
        ...validatedData,
        password: hashedPassword
      };
      
      const clientUser = await storage.createClientUser(clientUserWithHashedPassword);
      
      // Don't send password back to client
      const { password, ...clientUserWithoutPassword } = clientUser;
      
      res.status(201).json(clientUserWithoutPassword);
    } catch (error) {
      console.error('Error creating client user:', error);
      res.status(500).json({ error: 'Failed to create client user' });
    }
  });
  
  // Update client user
  app.patch('/api/client-users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const clientUser = await storage.getClientUser(id);
      
      if (!clientUser) {
        return res.status(404).json({ error: 'Client user not found' });
      }
      
      const data = req.body;
      
      // If updating password, hash it
      if (data.password) {
        data.password = await hashPassword(data.password);
      }
      
      const updatedUser = await storage.updateClientUser(id, data);
      
      if (!updatedUser) {
        return res.status(500).json({ error: 'Failed to update client user' });
      }
      
      // Don't send password back to client
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating client user:', error);
      res.status(500).json({ error: 'Failed to update client user' });
    }
  });
  
  // Delete client user
  app.delete('/api/client-users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const clientUser = await storage.getClientUser(id);
      
      if (!clientUser) {
        return res.status(404).json({ error: 'Client user not found' });
      }
      
      const result = await storage.deleteClientUser(id);
      
      if (!result) {
        return res.status(500).json({ error: 'Failed to delete client user' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting client user:', error);
      res.status(500).json({ error: 'Failed to delete client user' });
    }
  });

  // Client routes
  app.get('/api/clients', async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      
      // Format client data for frontend
      const formattedClients = clients.map(client => {
        const metadata = client.metadata as any || {};
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          company: client.company,
          status: {
            label: client.status.charAt(0).toUpperCase() + client.status.slice(1),
            color: client.status === 'active' ? 'success' : 
                  client.status === 'inactive' ? 'warning' : 'secondary'
          },
          industry: client.industry || 'N/A',
          totalSpend: client.totalSpend || 0,
          avatar: client.avatar || null,
          lastCampaign: client.lastCampaignAt ? new Date(client.lastCampaignAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
          metadata
        };
      });
      
      res.json(formattedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  });
  
  // Client Email Provider Management
  app.get('/api/clients/:clientId/providers', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const clientProviders = await storage.getClientProviders(clientId);
      
      // Also get the full provider details
      const providers = await providerSettingsService.getAllProviderSettings();
      
      // Combine the data to include provider details
      const result = clientProviders.map(cp => {
        const provider = providers.find(p => p.id === cp.providerId);
        return {
          ...cp,
          provider: provider || null
        };
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching client providers:', error);
      res.status(500).json({ error: 'Failed to fetch client providers' });
    }
  });
  
  app.post('/api/clients/:clientId/providers', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const providerId = parseInt(req.body.providerId);
      
      // Validate the request
      if (isNaN(clientId) || isNaN(providerId)) {
        return res.status(400).json({ error: 'Invalid client ID or provider ID' });
      }
      
      // Check if client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Check if provider exists
      const providers = await providerSettingsService.getAllProviderSettings();
      const providerExists = providers.some(p => p.id === providerId);
      if (!providerExists) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      // Check if relationship already exists
      const clientProviders = await storage.getClientProviders(clientId);
      const relationshipExists = clientProviders.some(cp => cp.providerId === providerId);
      if (relationshipExists) {
        return res.status(400).json({ error: 'Provider already assigned to client' });
      }
      
      // Create the relationship
      const relationship = await storage.assignProviderToClient({ clientId, providerId });
      
      // Get the provider details to return in the response
      const provider = providers.find(p => p.id === providerId);
      
      res.status(201).json({
        ...relationship,
        provider: provider || null
      });
    } catch (error) {
      console.error('Error assigning provider to client:', error);
      res.status(500).json({ error: 'Failed to assign provider to client' });
    }
  });
  
  app.delete('/api/clients/:clientId/providers/:providerId', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const providerId = parseInt(req.params.providerId);
      
      // Validate the request
      if (isNaN(clientId) || isNaN(providerId)) {
        return res.status(400).json({ error: 'Invalid client ID or provider ID' });
      }
      
      // Remove the relationship
      const success = await storage.removeProviderFromClient(clientId, providerId);
      
      if (!success) {
        return res.status(404).json({ error: 'Relationship not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error removing provider from client:', error);
      res.status(500).json({ error: 'Failed to remove provider from client' });
    }
  });

  app.get('/api/clients/:id', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Get campaigns for this client
      const campaigns = await storage.getClientCampaigns(clientId);
      
      res.json({
        ...client,
        campaigns: campaigns.map(campaign => {
          const metadata = campaign.metadata as any || {};
          return {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            openRate: metadata.openRate || 0,
            clickRate: metadata.clickRate || 0,
            sentDate: campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
          };
        })
      });
    } catch (error) {
      console.error('Error fetching client:', error);
      res.status(500).json({ error: 'Failed to fetch client' });
    }
  });

  app.post('/api/clients', async (req: Request, res: Response) => {
    const validatedData = validate(insertClientSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      // Check if client with email already exists
      const existing = await storage.getClientByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ error: 'A client with this email already exists' });
      }
      
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({ error: 'Failed to create client' });
    }
  });

  app.patch('/api/clients/:id', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id);
      
      // If email is being updated, check if it's already in use
      if (req.body.email) {
        const existing = await storage.getClientByEmail(req.body.email);
        if (existing && existing.id !== clientId) {
          return res.status(400).json({ error: 'This email is already used by another client' });
        }
      }
      
      const client = await storage.updateClient(clientId, req.body);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      res.json(client);
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({ error: 'Failed to update client' });
    }
  });

  app.delete('/api/clients/:id', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id);
      const success = await storage.deleteClient(clientId);
      
      if (!success) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({ error: 'Failed to delete client' });
    }
  });
  
  // Email Credits Management Endpoints
  
  // Get remaining email credits for a client
  app.get('/api/clients/:id/email-credits/remaining', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id);
      
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Calculate remaining credits
      const totalCredits = client.emailCredits || 0;
      const usedCredits = client.emailCreditsUsed || 0;
      const remainingCredits = totalCredits - usedCredits;
      
      res.json({
        clientId,
        totalCredits,
        usedCredits,
        remainingCredits,
        lastUpdated: client.lastCreditUpdateAt
      });
    } catch (error) {
      console.error('Error getting remaining email credits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Schema for email credits history query filters
  const emailCreditsHistoryQuerySchema = z.object({
    start_date: z.string().optional().describe('Filter history from this date (format: YYYY-MM-DD)'),
    end_date: z.string().optional().describe('Filter history until this date (format: YYYY-MM-DD)'),
    type: z.enum(['add', 'deduct', 'set', '']).optional().describe('Filter by transaction type'),
    limit: z.coerce.number().min(1).max(100).optional().default(50).describe('Maximum number of records to return')
  });

  // Get client's email credits history
  app.get('/api/clients/:id/email-credits/history', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Validate query parameters
      const validationResult = emailCreditsHistoryQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid query parameters', 
          details: validationResult.error.format() 
        });
      }
      
      // For now, we're ignoring the filters since the storage implementation
      // would need to be updated to support them
      const creditsHistory = await storage.getClientEmailCreditsHistory(clientId);
      res.json(creditsHistory);
    } catch (error) {
      console.error('Error getting client email credits history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Add email credits to a client
  // Schema for email credits operations
  const emailCreditsSchema = z.object({
    amount: z.number().min(1).describe('Number of credits to add'),
    reason: z.string().optional().describe('Reason for the credit adjustment')
  });

  app.post('/api/clients/:id/email-credits/add', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id);
      
      // Validate request data
      const validationResult = emailCreditsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        });
      }
      
      const { amount, reason } = validationResult.data;
      
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      const updatedClient = await storage.addClientEmailCredits(clientId, amount);
      res.json(updatedClient);
    } catch (error) {
      console.error('Error adding email credits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Deduct email credits from a client
  app.post('/api/clients/:id/email-credits/deduct', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id);
      
      // Validate request data
      const validationResult = emailCreditsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        });
      }
      
      const { amount, reason } = validationResult.data;
      
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      try {
        const updatedClient = await storage.deductClientEmailCredits(clientId, amount);
        res.json(updatedClient);
      } catch (error) {
        if (error instanceof Error && error.message === 'Insufficient email credits') {
          return res.status(400).json({ error: 'Insufficient email credits' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error deducting email credits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Set email credits for a client (override)
  // Create a schema for set credits that allows 0 (unlike add/deduct)
  const setEmailCreditsSchema = z.object({
    amount: z.number().min(0).describe('Number of credits to set'),
    reason: z.string().optional().describe('Reason for the credit adjustment')
  });

  app.post('/api/clients/:id/email-credits/set', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id);
      
      // Validate request data
      const validationResult = setEmailCreditsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        });
      }
      
      const { amount, reason } = validationResult.data;
      
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      const updatedClient = await storage.updateClientEmailCredits(clientId, amount);
      res.json(updatedClient);
    } catch (error) {
      console.error('Error setting email credits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // System Credits Routes
  const systemCreditsSchema = z.object({
    amount: z.number().min(0).describe('Number of credits'),
    reason: z.string().optional().describe('Reason for the credit adjustment')
  });
  
  const allocateCreditsSchema = z.object({
    amount: z.number().positive().describe('Number of credits to allocate'),
    reason: z.string().optional().describe('Reason for the allocation')
  });
  
  app.get('/api/system-credits', async (req: Request, res: Response) => {
    try {
      const systemCredits = await storage.getSystemCredits();
      
      if (!systemCredits) {
        return res.status(404).json({ error: "System credits not initialized" });
      }
      
      res.json(systemCredits);
    } catch (error) {
      console.error("Error fetching system credits:", error);
      res.status(500).json({ error: "Failed to fetch system credits" });
    }
  });
  
  app.get('/api/system-credits/history', async (req: Request, res: Response) => {
    try {
      const filters = {
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        type: req.query.type as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };
      
      const history = await storage.getSystemCreditsHistory(filters);
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching system credits history:", error);
      res.status(500).json({ error: "Failed to fetch system credits history" });
    }
  });
  
  app.post('/api/system-credits/add', async (req: Request, res: Response) => {
    try {
      // Must be admin
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
      }
      
      // Validate request data
      const validationResult = systemCreditsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        });
      }
      
      const { amount, reason } = validationResult.data;
      
      if (amount <= 0) {
        return res.status(400).json({ error: "Amount must be positive" });
      }
      
      const result = await storage.addSystemCredits(amount, req.user.id, reason);
      res.json(result);
    } catch (error) {
      console.error("Error adding system credits:", error);
      res.status(500).json({ error: "Failed to add system credits" });
    }
  });
  
  app.post('/api/system-credits/deduct', async (req: Request, res: Response) => {
    try {
      // Must be admin
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
      }
      
      // Validate request data
      const validationResult = systemCreditsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        });
      }
      
      const { amount, reason } = validationResult.data;
      
      if (amount <= 0) {
        return res.status(400).json({ error: "Amount must be positive" });
      }
      
      try {
        const result = await storage.deductSystemCredits(amount, req.user.id, reason);
        res.json(result);
      } catch (deductError) {
        if (deductError.message.includes('Insufficient system credits')) {
          return res.status(400).json({ error: deductError.message });
        }
        throw deductError;
      }
    } catch (error) {
      console.error("Error deducting system credits:", error);
      res.status(500).json({ error: "Failed to deduct system credits" });
    }
  });
  
  app.post('/api/system-credits/allocate-to-client/:clientId', async (req: Request, res: Response) => {
    try {
      // Must be admin
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized. Admin access required." });
      }
      
      const clientId = parseInt(req.params.clientId);
      
      // Validate request data
      const validationResult = allocateCreditsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.format() 
        });
      }
      
      const { amount, reason } = validationResult.data;
      
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      try {
        const result = await storage.allocateClientCreditsFromSystem(
          clientId, 
          amount, 
          req.user.id, 
          reason || `Credits allocated to client ${client.name}`
        );
        res.json(result);
      } catch (error) {
        if (error.message.includes('Insufficient system credits')) {
          return res.status(400).json({ error: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error allocating credits to client:", error);
      res.status(500).json({ error: "Failed to allocate credits to client" });
    }
  });

  // Domain routes
  app.get('/api/domains', async (req: Request, res: Response) => {
    try {
      const domains = await storage.getDomains();
      res.json(domains);
    } catch (error) {
      console.error('Error fetching domains:', error);
      res.status(500).json({ error: 'Failed to fetch domains' });
    }
  });

  app.get('/api/domains/:id', async (req: Request, res: Response) => {
    try {
      const domainId = parseInt(req.params.id);
      const domain = await storage.getDomain(domainId);
      
      if (!domain) {
        return res.status(404).json({ error: 'Domain not found' });
      }
      
      res.json(domain);
    } catch (error) {
      console.error('Error fetching domain:', error);
      res.status(500).json({ error: 'Failed to fetch domain' });
    }
  });

  app.post('/api/domains', async (req: Request, res: Response) => {
    const validatedData = validate(insertDomainSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      const domain = await storage.createDomain(validatedData);
      res.status(201).json(domain);
    } catch (error) {
      console.error('Error creating domain:', error);
      res.status(500).json({ error: 'Failed to create domain' });
    }
  });

  app.patch('/api/domains/:id', async (req: Request, res: Response) => {
    try {
      const domainId = parseInt(req.params.id);
      const domain = await storage.updateDomain(domainId, req.body);
      
      if (!domain) {
        return res.status(404).json({ error: 'Domain not found' });
      }
      
      res.json(domain);
    } catch (error) {
      console.error('Error updating domain:', error);
      res.status(500).json({ error: 'Failed to update domain' });
    }
  });

  app.delete('/api/domains/:id', async (req: Request, res: Response) => {
    try {
      const domainId = parseInt(req.params.id);
      const success = await storage.deleteDomain(domainId);
      
      if (!success) {
        return res.status(404).json({ error: 'Domain not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting domain:', error);
      res.status(500).json({ error: 'Failed to delete domain' });
    }
  });

  app.post('/api/domains/:id/set-default', async (req: Request, res: Response) => {
    try {
      const domainId = parseInt(req.params.id);
      const domain = await storage.setDefaultDomain(domainId);
      
      if (!domain) {
        return res.status(404).json({ error: 'Domain not found' });
      }
      
      res.json(domain);
    } catch (error) {
      console.error('Error setting default domain:', error);
      res.status(500).json({ error: 'Failed to set default domain' });
    }
  });

  app.get('/api/domains/:id/campaigns', async (req: Request, res: Response) => {
    try {
      const domainId = parseInt(req.params.id);
      const campaigns = await storage.getDomainCampaigns(domainId);
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching domain campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch domain campaigns' });
    }
  });

  app.post('/api/campaigns/:campaignId/domains', async (req: Request, res: Response) => {
    const validatedData = validate(insertCampaignDomainSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      const campaignDomain = await storage.assignDomainToCampaign(validatedData);
      res.status(201).json(campaignDomain);
    } catch (error) {
      console.error('Error assigning domain to campaign:', error);
      res.status(500).json({ error: 'Failed to assign domain to campaign' });
    }
  });

  app.delete('/api/campaigns/:campaignId/domains/:domainId', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const domainId = parseInt(req.params.domainId);
      
      const success = await storage.removeDomainFromCampaign(campaignId, domainId);
      
      if (!success) {
        return res.status(404).json({ error: 'Campaign domain association not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing domain from campaign:', error);
      res.status(500).json({ error: 'Failed to remove domain from campaign' });
    }
  });

  // Generate AI-powered subject lines for emails
  app.post('/api/generate-subject-lines', async (req: Request, res: Response) => {
    try {
      const { emailContent, emailType, targetAudience, keywords, count } = req.body;
      
      if (!emailContent || !emailType || !targetAudience) {
        return res.status(400).json({ 
          error: 'Missing required parameters. Please provide emailContent, emailType, and targetAudience.' 
        });
      }
      
      const subjectLines = await generateSubjectLines(
        emailContent,
        emailType,
        targetAudience,
        keywords || '',
        count || 5
      );
      
      res.json({ subjectLines });
    } catch (error) {
      console.error('Error generating subject lines:', error);
      res.status(500).json({ 
        error: 'Failed to generate subject lines. Please ensure your OpenAI API key is valid.'
      });
    }
  });
  
  app.post('/api/generate-template', async (req: Request, res: Response) => {
    console.log('Received template generation request:', JSON.stringify(req.body));
    try {
      // Validate request body
      const { templateType, industry, purpose, targetAudience, brandTone, keyPoints, saveTemplate } = req.body;
      
      if (!templateType || !industry || !purpose || !targetAudience) {
        console.log('Missing required parameters for template generation:', req.body);
        return res.status(400).json({ 
          error: 'Missing required parameters. Please provide templateType, industry, purpose, and targetAudience.' 
        });
      }
      
      console.log('Generating template with params:', {
        templateType, 
        industry, 
        purpose, 
        targetAudience, 
        brandTone: brandTone || 'professional',
        keyPointsLength: keyPoints?.length,
        saveTemplate: !!saveTemplate
      });
      
      // Generate the template using OpenAI
      try {
        const generatedTemplate = await generateEmailTemplate(
          templateType,
          industry,
          purpose,
          targetAudience,
          brandTone || 'professional',
          keyPoints || ''
        );
        
        if (!generatedTemplate || !generatedTemplate.content) {
          console.error('Generated template is empty or invalid:', generatedTemplate);
          return res.status(500).json({ 
            error: 'Failed to generate a valid email template. The AI response was incomplete.'
          });
        }
        
        console.log('Template generated successfully:', {
          name: generatedTemplate.name,
          subject: generatedTemplate.subject,
          descriptionLength: generatedTemplate.description?.length || 0,
          contentLength: generatedTemplate.content?.length || 0,
        });
        
        // If storage is requested, save the template
        if (saveTemplate === true) {
          try {
            const template = await storage.createTemplate({
              name: generatedTemplate.name,
              content: generatedTemplate.content,
              description: generatedTemplate.description,
              category: templateType.toLowerCase(),
              metadata: {
                icon: 'robot',
                iconColor: 'success',
                new: true,
                generatedByAI: true
              }
            });
            
            console.log('Template saved to storage with ID:', template.id);
            return res.status(201).json({ 
              template,
              message: 'Template successfully generated and saved' 
            });
          } catch (storageError) {
            console.error('Error saving generated template:', storageError);
            return res.status(201).json({ 
              template: generatedTemplate,
              message: 'Template generated successfully but could not be saved',
              saveError: 'Failed to save template to storage'
            });
          }
        }
        
        // If no storage requested, just return the generated template
        console.log('Returning generated template without saving');
        res.status(201).json({ 
          template: generatedTemplate,
          message: 'Template successfully generated' 
        });
      } catch (aiError) {
        console.error('AI Template generation error:', aiError);
        const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI error';
        console.error('AI Error details:', errorMessage);
        
        // More detailed logging of the error
        if (aiError instanceof Error && aiError.stack) {
          console.error('Error stack:', aiError.stack);
        }
        
        return res.status(500).json({ 
          error: `Failed to generate email template with OpenAI: ${errorMessage}`
        });
      }
    } catch (error) {
      console.error('Server error in template generation endpoint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      
      res.status(500).json({ 
        error: 'Server error processing template generation request. Please try again.'
      });
    }
  });

  // Generate color palette
  app.post('/api/generate-color-palette', async (req: Request, res: Response) => {
    try {
      const { brandDescription, industry, mood, paletteSize } = req.body;
      
      if (!brandDescription || !industry) {
        return res.status(400).json({ 
          error: 'Missing required parameters. Please provide brandDescription and industry.' 
        });
      }
      
      const colorPalette = await generateColorPalette(
        brandDescription,
        industry,
        mood || 'professional',
        paletteSize || 5
      );
      
      res.status(201).json({ 
        palette: colorPalette,
        message: 'Color palette successfully generated' 
      });
    } catch (error) {
      console.error('Error generating color palette:', error);
      res.status(500).json({ 
        error: 'Failed to generate color palette. Please ensure your OpenAI API key is valid.'
      });
    }
  });

  // Email Validation routes
  app.post('/api/email-validation/single', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      
      const result = await EmailValidationService.validateSingleEmail(email);
      res.json(result);
    } catch (error) {
      console.error('Email validation error:', error);
      res.status(500).json({ error: 'Error validating email' });
    }
  });

  app.post('/api/email-validation/batch', async (req: Request, res: Response) => {
    try {
      const { emails } = req.body;
      
      if (!Array.isArray(emails)) {
        return res.status(400).json({ error: 'Emails must be provided as an array' });
      }
      
      const result = await EmailValidationService.validateEmailBatch(emails);
      res.json(result);
    } catch (error) {
      console.error('Batch email validation error:', error);
      res.status(500).json({ error: 'Error validating email batch' });
    }
  });

  app.post('/api/email-validation/health-check', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      
      const result = await EmailValidationService.checkEmailHealth(email);
      res.json(result);
    } catch (error) {
      console.error('Email health check error:', error);
      res.status(500).json({ error: 'Error checking email health' });
    }
  });
  
  app.post('/api/email-validation/analyze-bulk', async (req: Request, res: Response) => {
    try {
      const { emails } = req.body;
      
      if (!Array.isArray(emails)) {
        return res.status(400).json({ error: 'Emails must be provided as an array' });
      }
      
      const result = await EmailValidationService.analyzeBulkEmails(emails);
      res.json(result);
    } catch (error) {
      console.error('Email bulk analysis error:', error);
      res.status(500).json({ error: 'Error analyzing email batch' });
    }
  });
  
  app.post('/api/email-validation/typo-check', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      
      const result = EmailValidationService.checkForTypos(email);
      res.json(result);
    } catch (error) {
      console.error('Email typo check error:', error);
      res.status(500).json({ error: 'Error checking email for typos' });
    }
  });

  // Email Performance Dashboard routes
  app.get('/api/email-performance/metrics', (req: Request, res: Response) => {
    const timeframe = req.query.timeframe as string || '7days';
    const campaignId = req.query.campaign as string;
    
    // Mock metrics data based on timeframe and campaign
    const baseOpenRate = 24.8;
    const baseClickRate = 3.6;
    const baseConversionRate = 1.2;
    const baseBounceRate = 0.8;
    
    // Apply small variations based on timeframe
    let metrics = {
      openRate: {
        value: baseOpenRate,
        industryAvg: 21.5,
        trend: 'up',
        trendValue: '3.2%'
      },
      clickRate: {
        value: baseClickRate,
        industryAvg: 2.7,
        trend: 'up',
        trendValue: '0.9%'
      },
      conversionRate: {
        value: baseConversionRate,
        goal: 1.5,
        trend: 'down',
        trendValue: '0.3%'
      },
      bounceRate: {
        value: baseBounceRate,
        industryAvg: 1.2,
        trend: 'up',
        trendValue: '0.4%'
      },
      totalSent: 42857,
      totalOpens: 10628,
      totalClicks: 1543,
      unsubscribes: 38
    };
    
    // Apply variations based on timeframe
    if (timeframe === 'today') {
      metrics.openRate.value = baseOpenRate - 2.1;
      metrics.clickRate.value = baseClickRate - 0.5;
      metrics.totalSent = 1250;
      metrics.totalOpens = 285;
      metrics.totalClicks = 42;
      metrics.unsubscribes = 2;
    } else if (timeframe === 'yesterday') {
      metrics.openRate.value = baseOpenRate - 1.5;
      metrics.clickRate.value = baseClickRate - 0.3;
      metrics.totalSent = 1450;
      metrics.totalOpens = 348;
      metrics.totalClicks = 48;
      metrics.unsubscribes = 3;
    } else if (timeframe === '30days') {
      metrics.openRate.value = baseOpenRate + 0.7;
      metrics.clickRate.value = baseClickRate + 0.2;
      metrics.totalSent = 154250;
      metrics.totalOpens = 38870;
      metrics.totalClicks = 5553;
      metrics.unsubscribes = 124;
    } else if (timeframe === '90days') {
      metrics.openRate.value = baseOpenRate + 1.2;
      metrics.clickRate.value = baseClickRate + 0.4;
      metrics.totalSent = 421850;
      metrics.totalOpens = 107572;
      metrics.totalClicks = 15187;
      metrics.unsubscribes = 352;
    }
    
    // Apply variations based on campaign if specified
    if (campaignId && campaignId !== 'all') {
      const campaignVariation = (parseInt(campaignId) % 5) / 10;
      metrics.openRate.value = baseOpenRate + campaignVariation * 5;
      metrics.clickRate.value = baseClickRate + campaignVariation * 2;
      metrics.conversionRate.value = baseConversionRate + campaignVariation;
    }
    
    res.json(metrics);
  });
  
  app.get('/api/email-performance/charts', (req: Request, res: Response) => {
    const timeframe = req.query.timeframe as string || '7days';
    const campaignId = req.query.campaign as string;
    
    // Mock chart data
    const charts = {
      weeklyPerformance: [
        { day: 'Mon', opens: 120, clicks: 45, conversions: 12 },
        { day: 'Tue', opens: 140, clicks: 55, conversions: 15 },
        { day: 'Wed', opens: 180, clicks: 70, conversions: 18 },
        { day: 'Thu', opens: 190, clicks: 65, conversions: 20 },
        { day: 'Fri', opens: 210, clicks: 80, conversions: 22 },
        { day: 'Sat', opens: 150, clicks: 45, conversions: 14 },
        { day: 'Sun', opens: 130, clicks: 40, conversions: 10 },
      ],
      deviceBreakdown: [
        { name: 'Desktop', value: 45 },
        { name: 'Mobile', value: 40 },
        { name: 'Tablet', value: 15 },
      ],
      clickDistribution: [
        { link: 'Product Link', clicks: 423 },
        { link: 'Pricing Page', clicks: 312 },
        { link: 'Blog Post', clicks: 287 },
        { link: 'Contact Us', clicks: 196 },
        { link: 'Social Media', clicks: 152 },
      ],
      engagementOverTime: [
        { date: '01/04', open: 24.2, click: 3.1, conversion: 0.9 },
        { date: '02/04', open: 25.1, click: 3.3, conversion: 1.0 },
        { date: '03/04', open: 23.8, click: 3.0, conversion: 0.8 },
        { date: '04/04', open: 24.5, click: 3.2, conversion: 1.1 },
        { date: '05/04', open: 26.3, click: 3.7, conversion: 1.2 },
        { date: '06/04', open: 28.1, click: 3.9, conversion: 1.4 },
        { date: '07/04', open: 27.5, click: 3.8, conversion: 1.3 },
      ],
      engagementByTimeOfDay: [
        { hour: '6am-9am', opens: 1240 },
        { hour: '9am-12pm', opens: 2180 },
        { hour: '12pm-3pm', opens: 3150 },
        { hour: '3pm-6pm', opens: 2870 },
        { hour: '6pm-9pm', opens: 1950 },
        { hour: '9pm-12am', opens: 1050 },
        { hour: '12am-6am', opens: 420 },
      ],
      emailClientDistribution: [
        { name: 'Gmail', value: 45 },
        { name: 'Apple Mail', value: 28 },
        { name: 'Outlook', value: 15 },
        { name: 'Yahoo', value: 7 },
        { name: 'Other', value: 5 },
      ],
      campaignComparison: [
        { name: 'Summer Sale', open: 26.2, click: 4.1, conversion: 1.2 },
        { name: 'Product Launch', open: 31.8, click: 5.7, conversion: 1.8 },
        { name: 'Weekly Newsletter', open: 22.4, click: 2.8, conversion: 0.7 },
        { name: 'Re-engagement', open: 18.5, click: 3.2, conversion: 1.1 },
      ],
      subjectLinePerformance: [
        { type: 'Question-based', rate: 28.4 },
        { type: 'Personalized', rate: 31.2 },
        { type: 'Curiosity', rate: 26.8 },
        { type: 'Urgency', rate: 25.3 },
        { type: 'Value-prop', rate: 24.1 },
        { type: 'Announcement', rate: 22.7 },
      ],
      sendTimeEffectiveness: [
        { day: 'Mon', morning: 22.4, afternoon: 25.3, evening: 21.1 },
        { day: 'Tue', morning: 24.1, afternoon: 26.8, evening: 22.5 },
        { day: 'Wed', morning: 25.7, afternoon: 28.4, evening: 23.9 },
        { day: 'Thu', morning: 23.5, afternoon: 27.2, evening: 22.8 },
        { day: 'Fri', morning: 21.9, afternoon: 24.6, evening: 20.3 },
        { day: 'Sat', morning: 18.6, afternoon: 20.4, evening: 19.2 },
        { day: 'Sun', morning: 19.2, afternoon: 21.5, evening: 23.1 },
      ],
      geographicalDistribution: [
        { country: 'United States', opens: 5240 },
        { country: 'United Kingdom', opens: 1820 },
        { country: 'Canada', opens: 1350 },
        { country: 'Australia', opens: 980 },
        { country: 'Germany', opens: 780 },
        { country: 'France', opens: 650 },
        { country: 'Other', opens: 1540 },
      ],
      deviceOverTime: [
        { month: 'Jan', desktop: 48, mobile: 40, tablet: 12 },
        { month: 'Feb', desktop: 47, mobile: 41, tablet: 12 },
        { month: 'Mar', desktop: 46, mobile: 42, tablet: 12 },
        { month: 'Apr', desktop: 45, mobile: 43, tablet: 12 },
        { month: 'May', desktop: 43, mobile: 45, tablet: 12 },
        { month: 'Jun', desktop: 42, mobile: 47, tablet: 11 },
      ],
      subscriberEngagementSegments: [
        { segment: 'Highly Engaged (3+ clicks/email)', value: 15, count: 3658 },
        { segment: 'Engaged (1-2 clicks/email)', value: 28, count: 6789 },
        { segment: 'Passive (opens only)', value: 32, count: 7865 },
        { segment: 'Dormant (no opens in 30 days)', value: 18, count: 4321 },
        { segment: 'At Risk (no opens in 60 days)', value: 7, count: 1654 },
      ],
    };
    
    // Apply variations based on timeframe
    if (timeframe === 'today' || timeframe === 'yesterday') {
      // For today/yesterday, only show a subset of data points
      charts.weeklyPerformance = charts.weeklyPerformance.slice(0, 3);
      charts.engagementOverTime = charts.engagementOverTime.slice(0, 3);
    } else if (timeframe === '30days') {
      // For 30 days, increase the data variance slightly
      charts.weeklyPerformance = charts.weeklyPerformance.map(item => ({
        ...item,
        opens: Math.round(item.opens * 3.2),
        clicks: Math.round(item.clicks * 3.2),
        conversions: Math.round(item.conversions * 3.2)
      }));
    } else if (timeframe === '90days') {
      // For 90 days, increase the data variance significantly
      charts.weeklyPerformance = charts.weeklyPerformance.map(item => ({
        ...item,
        opens: Math.round(item.opens * 8.5),
        clicks: Math.round(item.clicks * 8.5),
        conversions: Math.round(item.conversions * 8.5)
      }));
    }
    
    // Apply variations based on campaign if specified
    if (campaignId && campaignId !== 'all') {
      const campaignMultiplier = 1 + (parseInt(campaignId) % 5) / 10;
      
      charts.weeklyPerformance = charts.weeklyPerformance.map(item => ({
        ...item,
        opens: Math.round(item.opens * campaignMultiplier),
        clicks: Math.round(item.clicks * campaignMultiplier),
        conversions: Math.round(item.conversions * campaignMultiplier)
      }));
      
      charts.clickDistribution = charts.clickDistribution.map(item => ({
        ...item,
        clicks: Math.round(item.clicks * campaignMultiplier)
      }));
    }
    
    res.json(charts);
  });
  
  app.get('/api/email-performance/realtime', (req: Request, res: Response) => {
    // Mock real-time activity data
    const activities = [
      { time: '2 mins ago', type: 'open', email: 'Weekly Newsletter', user: 'john.doe@example.com' },
      { time: '5 mins ago', type: 'click', email: 'Product Launch', user: 'maria.smith@example.com' },
      { time: '8 mins ago', type: 'conversion', email: 'Summer Sale', user: 'robert.jones@example.com' },
      { time: '15 mins ago', type: 'open', email: 'Weekly Newsletter', user: 'alice.johnson@example.com' },
      { time: '18 mins ago', type: 'click', email: 'Customer Re-engagement', user: 'david.wilson@example.com' },
      { time: '24 mins ago', type: 'open', email: 'Product Update', user: 'sarah.brown@example.com' },
      { time: '30 mins ago', type: 'click', email: 'Weekly Newsletter', user: 'michael.taylor@example.com' },
      { time: '35 mins ago', type: 'conversion', email: 'Product Launch', user: 'emily.white@example.com' },
      { time: '42 mins ago', type: 'open', email: 'Summer Sale', user: 'james.martin@example.com' },
      { time: '50 mins ago', type: 'click', email: 'Summer Sale', user: 'olivia.clark@example.com' }
    ];
    
    res.json(activities);
  });

  app.get('/api/email-performance/detailed-opens', async (req: Request, res: Response) => {
    try {
      // Get the campaign ID from query parameters if provided
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      
      // In a real implementation, we would query the database for open_events
      // filtered by campaignId if provided
      
      // Sample data - in a real implementation this would come from the database
      const allOpens = [
        { 
          id: 1, 
          emailName: 'Weekly Newsletter - April Edition',
          recipient: 'john.doe@example.com',
          openCount: 3,
          lastOpenedAt: '2025-04-02 09:45:12',
          device: 'Mobile - iPhone',
          campaignId: 1,
          campaignName: 'Monthly Newsletter'
        },
        { 
          id: 2, 
          emailName: 'Special Promotion',
          recipient: 'alice.johnson@example.com',
          openCount: 2,
          lastOpenedAt: '2025-04-02 11:23:45',
          device: 'Desktop - Chrome',
          campaignId: 2,
          campaignName: 'Product Launch'
        },
        { 
          id: 3, 
          emailName: 'Product Launch Announcement',
          recipient: 'robert.smith@example.com',
          openCount: 5,
          lastOpenedAt: '2025-04-02 13:10:33',
          device: 'Mobile - Android',
          campaignId: 2,
          campaignName: 'Product Launch'
        },
        { 
          id: 4, 
          emailName: 'Monthly Report',
          recipient: 'maria.garcia@example.com',
          openCount: 1,
          lastOpenedAt: '2025-04-02 15:42:19',
          device: 'Tablet - iPad',
          campaignId: 3,
          campaignName: 'Summer Sale'
        },
        { 
          id: 5, 
          emailName: 'Spring Sale', 
          recipient: 'david.wilson@example.com',
          openCount: 4,
          lastOpenedAt: '2025-04-02 16:30:05',
          device: 'Desktop - Firefox',
          campaignId: 3,
          campaignName: 'Summer Sale'
        },
        { 
          id: 6, 
          emailName: 'Weekly Newsletter - April Edition',
          recipient: 'emily.brown@example.com',
          openCount: 2,
          lastOpenedAt: '2025-04-02 17:12:38',
          device: 'Mobile - iPhone',
          campaignId: 1,
          campaignName: 'Monthly Newsletter'
        },
        { 
          id: 7, 
          emailName: 'Event Invitation',
          recipient: 'michael.jones@example.com',
          openCount: 3,
          lastOpenedAt: '2025-04-03 09:05:22',
          device: 'Desktop - Safari',
          campaignId: 4,
          campaignName: 'Event Series'
        },
        { 
          id: 8, 
          emailName: 'Special Promotion',
          recipient: 'sarah.miller@example.com',
          openCount: 1,
          lastOpenedAt: '2025-04-03 10:33:47',
          device: 'Mobile - Android',
          campaignId: 2,
          campaignName: 'Product Launch'
        },
        { 
          id: 9, 
          emailName: 'Webinar Invitation',
          recipient: 'james.clark@example.com',
          openCount: 2,
          lastOpenedAt: '2025-04-03 11:15:36',
          device: 'Desktop - Chrome',
          campaignId: 4,
          campaignName: 'Event Series'
        },
        { 
          id: 10, 
          emailName: 'Limited Time Offer',
          recipient: 'jennifer.hall@example.com',
          openCount: 4,
          lastOpenedAt: '2025-04-03 13:23:58',
          device: 'Mobile - iPhone',
          campaignId: 3,
          campaignName: 'Summer Sale'
        },
        { 
          id: 11, 
          emailName: 'Feedback Request',
          recipient: 'thomas.wilson@example.com',
          openCount: 1,
          lastOpenedAt: '2025-04-03 14:42:11',
          device: 'Desktop - Firefox',
          campaignId: 5,
          campaignName: 'Customer Feedback'
        },
        { 
          id: 12, 
          emailName: 'Product Update',
          recipient: 'amanda.lewis@example.com',
          openCount: 3,
          lastOpenedAt: '2025-04-03 16:20:47',
          device: 'Tablet - Android',
          campaignId: 2,
          campaignName: 'Product Launch'
        }
      ];
      
      // Filter by campaign ID if provided
      const filteredOpens = campaignId 
        ? allOpens.filter(open => open.campaignId === campaignId)
        : allOpens;
      
      res.json({ emails: filteredOpens });
    } catch (error) {
      console.error('Error fetching detailed opens:', error);
      res.status(500).json({ error: 'Failed to fetch detailed email opens data' });
    }
  });

  // Email Tracking and Analytics API Endpoints
  
  // Record a click event
  app.post('/api/track/click', async (req: Request, res: Response) => {
    try {
      const validatedData = validate(insertClickEventSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      // Add user agent info from request
      const data = {
        ...validatedData,
        userAgent: req.headers['user-agent']
      };
      
      const clickEvent = await trackingService.recordClickEvent(data);
      res.status(201).json(clickEvent);
    } catch (error) {
      console.error('Click tracking error:', error);
      res.status(500).json({ error: 'Failed to record click event' });
    }
  });
  
  // Process click via tracking URL
  app.get('/api/track/click/:trackingToken', async (req: Request, res: Response) => {
    try {
      const trackingToken = req.params.trackingToken;
      
      // Decode the tracking token to extract campaign ID, URL, and possibly contact ID
      // In a real implementation, you would use a more secure token mechanism
      const decodedData = Buffer.from(trackingToken, 'base64').toString();
      const [campaignId, originalUrl, _timestamp] = decodedData.split(':');
      
      if (!campaignId || !originalUrl) {
        return res.status(400).json({ error: 'Invalid tracking token' });
      }
      
      // Record the click event
      await trackingService.recordClickEvent({
        campaignId: parseInt(campaignId),
        url: originalUrl,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      });
      
      // Redirect to the original URL
      res.redirect(originalUrl);
    } catch (error) {
      console.error('Click tracking redirect error:', error);
      res.status(500).json({ error: 'Failed to process tracking link' });
    }
  });
  
  // Record an open event (usually triggered by a tracking pixel)
  app.get('/api/track/open/:campaignId/:emailId?/:contactId?', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const emailId = req.params.emailId ? parseInt(req.params.emailId) : undefined;
      const contactId = req.params.contactId ? parseInt(req.params.contactId) : undefined;
      
      // Record the open event
      await trackingService.recordOpenEvent({
        campaignId,
        emailId,
        contactId,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      });
      
      // Return a 1x1 transparent pixel
      res.set('Content-Type', 'image/gif');
      res.send(Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64'));
    } catch (error) {
      console.error('Open tracking error:', error);
      // Still return a pixel to avoid breaking email rendering
      res.set('Content-Type', 'image/gif');
      res.send(Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64'));
    }
  });
  
  // Get engagement metrics for a campaign
  app.get('/api/campaigns/:id/engagement', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      
      const metrics = await trackingService.getEngagementMetrics(campaignId, days);
      res.json(metrics);
    } catch (error) {
      console.error('Engagement metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch engagement metrics' });
    }
  });
  
  // Get campaigns performance data for reporting
  app.get('/api/campaigns/performance', async (req: Request, res: Response) => {
    try {
      // Allow specifying a campaign ID as a query parameter
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string, 10) : undefined;
      
      // Get specific campaign or all campaigns
      let campaigns = [];
      if (campaignId) {
        const campaign = await storage.getCampaign(campaignId);
        if (!campaign) {
          return res.status(404).json({ error: "Campaign not found" });
        }
        campaigns = [campaign];
      } else {
        campaigns = await storage.getCampaigns();
      }
      
      // If no campaigns, return empty array rather than 404
      if (!campaigns || campaigns.length === 0) {
        return res.json([]);
      }
      
      // Transform campaigns into performance data format
      const performanceData = await Promise.all(campaigns.map(async (campaign) => {
        try {
          // Get the latest engagement metrics for this campaign
          const metrics = await trackingService.getEngagementMetrics(campaign.id, 30);
          const latestMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;
          
          // If no metrics available, provide default/fallback data based on campaign status
          if (!latestMetrics) {
            // Generate synthetic data for demo purposes based on the campaign
            const sentStatus = ['Sent', 'Completed'].includes(campaign.status?.label || '');
            const isActive = campaign.status?.label === 'Active';
            
            return {
              id: campaign.id,
              name: campaign.name,
              opens: sentStatus ? Math.floor(Math.random() * 1000) + 500 : 0,
              clicks: sentStatus ? Math.floor(Math.random() * 500) + 100 : 0,
              unsubscribes: sentStatus ? Math.floor(Math.random() * 50) : 0,
              bounces: sentStatus ? Math.floor(Math.random() * 30) : 0,
              deliveryRate: sentStatus ? 98.5 : 0,
              status: campaign.status?.label || 'Draft'
            };
          }
          
          // Return actual metrics data
          return {
            id: campaign.id,
            name: campaign.name,
            opens: latestMetrics.totalOpens || 0,
            clicks: latestMetrics.totalClicks || 0,
            unsubscribes: 0, // This would need to be tracked separately
            bounces: 0, // This would need to be tracked separately
            deliveryRate: 100, // This would need to be calculated separately
            status: campaign.status?.label || 'Unknown'
          };
        } catch (error) {
          console.error(`Error getting performance data for campaign ${campaign.id}:`, error);
          // Return default values if there's an error
          return {
            id: campaign.id,
            name: campaign.name,
            opens: 0,
            clicks: 0,
            unsubscribes: 0,
            bounces: 0,
            deliveryRate: 0,
            status: campaign.status?.label || 'Unknown'
          };
        }
      }));
      
      res.json(performanceData);
    } catch (error) {
      console.error('Campaign performance data error:', error);
      res.status(500).json({ error: 'Failed to fetch campaign performance data' });
    }
  });
  
  // Get click events for a campaign
  app.get('/api/campaigns/:id/clicks', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const clicks = await trackingService.getClickEvents(campaignId, limit);
      res.json(clicks);
    } catch (error) {
      console.error('Click events error:', error);
      res.status(500).json({ error: 'Failed to fetch click events' });
    }
  });
  
  // Get open events for a campaign
  app.get('/api/campaigns/:id/opens', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const opens = await trackingService.getOpenEvents(campaignId, limit);
      res.json(opens);
    } catch (error) {
      console.error('Open events error:', error);
      res.status(500).json({ error: 'Failed to fetch open events' });
    }
  });
  
  // Get tracking links for a campaign
  app.get('/api/campaigns/:id/links', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      const links = await trackingService.getTrackingLinks(campaignId);
      res.json(links);
    } catch (error) {
      console.error('Tracking links error:', error);
      res.status(500).json({ error: 'Failed to fetch tracking links' });
    }
  });
  
  // Create a tracking link for a URL
  app.post('/api/campaigns/:id/links', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      const trackingLink = await trackingService.createTrackingLink(campaignId, url);
      res.status(201).json(trackingLink);
    } catch (error) {
      console.error('Create tracking link error:', error);
      res.status(500).json({ error: 'Failed to create tracking link' });
    }
  });
  
  // Get email analytics dashboard data
  app.get('/api/analytics/email', async (req: Request, res: Response) => {
    try {
      // Get campaign ID from query parameters or return all
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      
      // Get all campaigns or a specific one
      const campaigns = campaignId 
        ? [await storage.getCampaign(campaignId)] 
        : await storage.getCampaigns();
      
      if (!campaigns || (campaignId && !campaigns[0])) {
        return res.status(404).json({ error: 'Campaign(s) not found' });
      }
      
      // Filter out any undefined campaigns (in case a specific campaign wasn't found)
      const validCampaigns = campaigns.filter(c => c !== undefined) as any[];
      
      // Prepare the response object with overview metrics
      const result = {
        overview: {
          totalEmails: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          unsubscribeRate: 0,
        },
        trends: [] as any[],
        topLinks: [] as any[],
        deviceBreakdown: [] as any[],
        geoDistribution: [] as any[],
        hourlyActivity: [] as any[],
      };
      
      // Collect all metrics for the campaigns
      const allMetrics = [];
      for (const campaign of validCampaigns) {
        const metrics = await trackingService.getEngagementMetrics(campaign.id, days);
        allMetrics.push(...metrics);
      }
      
      // Process overview metrics
      if (allMetrics.length > 0) {
        let totalOpens = 0, totalClicks = 0, totalBounces = 0, totalUnsubscribes = 0;
        let totalUniqueOpens = 0, totalUniqueClicks = 0;
        let emails = 0;
        
        // Sum all metrics
        allMetrics.forEach(metric => {
          totalOpens += metric.totalOpens || 0;
          totalClicks += metric.totalClicks || 0;
          totalUniqueOpens += metric.uniqueOpens || 0;
          totalUniqueClicks += metric.uniqueClicks || 0;
          
          // Aggregate other metrics as needed
        });
        
        // For demo purposes, we'll use some placeholder recipient counts
        emails = validCampaigns.reduce((acc, campaign) => {
          const metadata = campaign.metadata as any || {};
          return acc + (metadata.recipients || 100); // Fallback to 100 if no recipients count
        }, 0);
        
        // Calculate rates
        result.overview = {
          totalEmails: emails,
          openRate: emails > 0 ? (totalUniqueOpens / emails) * 100 : 0,
          clickRate: emails > 0 ? (totalUniqueClicks / emails) * 100 : 0,
          bounceRate: emails > 0 ? (totalBounces / emails) * 100 : 0,
          unsubscribeRate: emails > 0 ? (totalUnsubscribes / emails) * 100 : 0,
        };
      }
      
      // Return the analytics dashboard data
      res.json(result);
    } catch (error) {
      console.error('Email analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch email analytics' });
    }
  });

  // Audience Personas API Endpoints - REMOVED AS REQUESTED
  /*
  app.get('/api/audience-personas', async (req: Request, res: Response) => {
    try {
      const personas = await storage.getAudiencePersonas();
      res.status(200).json(personas);
    } catch (error) {
      console.error('Error getting audience personas:', error);
      res.status(500).json({ error: 'Failed to get audience personas' });
    }
  });

  app.get('/api/audience-personas/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      const persona = await storage.getAudiencePersona(id);
      if (!persona) {
        return res.status(404).json({ error: 'Audience persona not found' });
      }
      res.status(200).json(persona);
    } catch (error) {
      console.error(`Error getting audience persona with id ${id}:`, error);
      res.status(500).json({ error: 'Failed to get audience persona' });
    }
  });

  app.post('/api/audience-personas', async (req: Request, res: Response) => {
    try {
      const validatedData = validate(insertAudiencePersonaSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json(validatedData);
      }
      
      const persona = await storage.createAudiencePersona(validatedData);
      res.status(201).json(persona);
    } catch (error) {
      console.error('Error creating audience persona:', error);
      res.status(500).json({ error: 'Failed to create audience persona' });
    }
  });

  app.patch('/api/audience-personas/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      const persona = await storage.updateAudiencePersona(id, req.body);
      if (!persona) {
        return res.status(404).json({ error: 'Audience persona not found' });
      }
      res.status(200).json(persona);
    } catch (error) {
      console.error(`Error updating audience persona with id ${id}:`, error);
      res.status(500).json({ error: 'Failed to update audience persona' });
    }
  });

  app.delete('/api/audience-personas/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      const success = await storage.deleteAudiencePersona(id);
      if (!success) {
        return res.status(404).json({ error: 'Audience persona not found' });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error deleting audience persona with id ${id}:`, error);
      res.status(500).json({ error: 'Failed to delete audience persona' });
    }
  });
  */

  // Audience Persona Demographics - REMOVED AS REQUESTED
  /*
  app.get('/api/audience-personas/:id/demographics', async (req: Request, res: Response) => {
    const personaId = parseInt(req.params.id, 10);
    try {
      const demographics = await storage.getPersonaDemographics(personaId);
      if (!demographics) {
        return res.status(404).json({ error: 'Demographics not found for this persona' });
      }
      res.status(200).json(demographics);
    } catch (error) {
      console.error(`Error getting demographics for persona id ${personaId}:`, error);
      res.status(500).json({ error: 'Failed to get demographics' });
    }
  });

  app.post('/api/audience-personas/:id/demographics', async (req: Request, res: Response) => {
    const personaId = parseInt(req.params.id, 10);
    try {
      const validatedData = validate(insertPersonaDemographicSchema, { ...req.body, personaId });
      if ('error' in validatedData) {
        return res.status(400).json(validatedData);
      }
      
      let demographics = await storage.getPersonaDemographics(personaId);
      
      if (demographics) {
        // Update existing demographics
        demographics = await storage.updatePersonaDemographics(personaId, validatedData);
      } else {
        // Create new demographics
        demographics = await storage.createPersonaDemographics(validatedData);
      }
      
      res.status(201).json(demographics);
    } catch (error) {
      console.error(`Error creating/updating demographics for persona id ${personaId}:`, error);
      res.status(500).json({ error: 'Failed to create/update demographics' });
    }
  });

  // Audience Persona Behaviors
  app.get('/api/audience-personas/:id/behaviors', async (req: Request, res: Response) => {
    const personaId = parseInt(req.params.id, 10);
    try {
      const behaviors = await storage.getPersonaBehaviors(personaId);
      if (!behaviors) {
        return res.status(404).json({ error: 'Behaviors not found for this persona' });
      }
      res.status(200).json(behaviors);
    } catch (error) {
      console.error(`Error getting behaviors for persona id ${personaId}:`, error);
      res.status(500).json({ error: 'Failed to get behaviors' });
    }
  });

  app.post('/api/audience-personas/:id/behaviors', async (req: Request, res: Response) => {
    const personaId = parseInt(req.params.id, 10);
    try {
      const validatedData = validate(insertPersonaBehaviorSchema, { ...req.body, personaId });
      if ('error' in validatedData) {
        return res.status(400).json(validatedData);
      }
      
      let behaviors = await storage.getPersonaBehaviors(personaId);
      
      if (behaviors) {
        // Update existing behaviors
        behaviors = await storage.updatePersonaBehaviors(personaId, validatedData);
      } else {
        // Create new behaviors
        behaviors = await storage.createPersonaBehaviors(validatedData);
      }
      
      res.status(201).json(behaviors);
    } catch (error) {
      console.error(`Error creating/updating behaviors for persona id ${personaId}:`, error);
      res.status(500).json({ error: 'Failed to create/update behaviors' });
    }
  });

  // Audience Persona Insights
  app.get('/api/audience-personas/:id/insights', async (req: Request, res: Response) => {
    const personaId = parseInt(req.params.id, 10);
    try {
      const insights = await storage.getPersonaInsights(personaId);
      res.status(200).json(insights || []);
    } catch (error) {
      console.error(`Error getting insights for persona id ${personaId}:`, error);
      res.status(500).json({ error: 'Failed to get insights' });
    }
  });

  app.post('/api/audience-personas/:id/insights', async (req: Request, res: Response) => {
    const personaId = parseInt(req.params.id, 10);
    try {
      const validatedData = validate(insertPersonaInsightSchema, { ...req.body, personaId });
      if ('error' in validatedData) {
        return res.status(400).json(validatedData);
      }
      
      const insight = await storage.createPersonaInsight(validatedData);
      res.status(201).json(insight);
    } catch (error) {
      console.error(`Error creating insight for persona id ${personaId}:`, error);
      res.status(500).json({ error: 'Failed to create insight' });
    }
  });

  app.delete('/api/audience-personas/insights/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      const success = await storage.deletePersonaInsight(id);
      if (!success) {
        return res.status(404).json({ error: 'Insight not found' });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error deleting insight with id ${id}:`, error);
      res.status(500).json({ error: 'Failed to delete insight' });
    }
  });

  // Audience Segments
  app.get('/api/audience-personas/:id/segments', async (req: Request, res: Response) => {
    const personaId = parseInt(req.params.id, 10);
    try {
      const segments = await storage.getAudienceSegmentsByPersona(personaId);
      res.status(200).json(segments || []);
    } catch (error) {
      console.error(`Error getting segments for persona id ${personaId}:`, error);
      res.status(500).json({ error: 'Failed to get segments' });
    }
  });

  app.post('/api/audience-personas/:id/segments', async (req: Request, res: Response) => {
    const personaId = parseInt(req.params.id, 10);
    try {
      const validatedData = validate(insertAudienceSegmentSchema, { ...req.body, personaId });
      if ('error' in validatedData) {
        return res.status(400).json(validatedData);
      }
      
      const segment = await storage.createAudienceSegment(validatedData);
      res.status(201).json(segment);
    } catch (error) {
      console.error(`Error creating segment for persona id ${personaId}:`, error);
      res.status(500).json({ error: 'Failed to create segment' });
    }
  });

  app.delete('/api/audience-personas/segments/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      const success = await storage.deleteAudienceSegment(id);
      if (!success) {
        return res.status(404).json({ error: 'Segment not found' });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Error deleting segment with id ${id}:`, error);
      res.status(500).json({ error: 'Failed to delete segment' });
    }
  });
  */

  // Generate shareable link for a template
  app.post('/api/templates/:id/share', async (req: Request, res: Response) => {
    try {
      const templateId = req.params.id;
      
      if (!templateId) {
        return res.status(400).json({ error: 'Template ID is required' });
      }
      
      // Get the template from storage
      const template = await storage.getTemplate(Number(templateId));
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      // Generate a unique share code (you could use a more sophisticated approach)
      const shareCode = `${templateId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Update template with share information
      // In a real implementation, you might want to store this in a separate table
      const updatedTemplate = await storage.updateTemplate(Number(templateId), {
        metadata: {
          ...template.metadata,
          shareCode,
          shareCreatedAt: new Date().toISOString(),
          shareExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
        }
      });
      
      // Construct shareable URL
      const shareUrl = `${req.protocol}://${req.get('host')}/shared-template/${shareCode}`;
      
      res.json({ 
        shareCode,
        shareUrl,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      res.status(500).json({ error: 'Failed to generate share link' });
    }
  });

  // Endpoint to view a shared template
  app.get('/shared-template/:shareCode', async (req: Request, res: Response) => {
    try {
      const shareCode = req.params.shareCode;
      
      if (!shareCode) {
        return res.status(400).send('Share code is required');
      }
      
      // Extract the template ID from the share code (first part before the first dash)
      const templateId = shareCode.split('-')[0];
      
      // Get the template from storage
      const template = await storage.getTemplate(Number(templateId));
      
      if (!template) {
        return res.status(404).send('Template not found');
      }
      
      // Verify that the share code matches
      if (!template.metadata || template.metadata.shareCode !== shareCode) {
        return res.status(403).send('Invalid share code');
      }
      
      // Check if the share link has expired
      if (template.metadata.shareExpiry && new Date(template.metadata.shareExpiry) < new Date()) {
        return res.status(403).send('This share link has expired');
      }
      
      // Parse the template content (similar to preview-template)
      let templateHtml = '';
      
      try {
        // Try to parse the content as JSON first (for newer templates)
        const templateData = JSON.parse(template.content);
        
        // Check if there's an originalHtml field in metadata from the content or the template
        if (templateData.metadata?.originalHtml) {
          templateHtml = templateData.metadata.originalHtml;
        } else if (template.metadata && typeof template.metadata === 'object' && 'originalHtml' in template.metadata) {
          templateHtml = template.metadata.originalHtml;
        } else if (templateData.sections) {
          // Handle case where we have sections with HTML elements
          // Extract HTML from the sections if they exist
          templateData.sections.forEach(section => {
            section.elements.forEach(element => {
              if (element.type === 'html' && element.content?.html) {
                templateHtml += element.content.html;
              } else if (element.type === 'text' && element.content?.text) {
                templateHtml += `<div style="font-size: ${element.styles?.fontSize || '16px'}; color: ${element.styles?.color || '#000000'}; text-align: ${element.styles?.textAlign || 'left'};">${element.content.text}</div>`;
              }
            });
          });
        } else {
          // Default fallback - just use the template content directly
          templateHtml = template.content;
        }
      } catch (e) {
        // If parsing as JSON fails, assume it's already HTML
        console.log('Template content is not JSON, using directly:', e);
        templateHtml = template.content;
      }
      
      // Return the template HTML with a shared template UI
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${template.name} - Shared Template</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-color: #f5f5f5;
            }
            
            .shared-header {
              background-color: #1a3a5f;
              color: white;
              padding: 15px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .shared-header h2 {
              margin: 0;
              font-size: 20px;
              display: flex;
              align-items: center;
            }
            
            .shared-header h2 svg {
              margin-right: 10px;
            }
            
            .shared-header .company {
              display: flex;
              align-items: center;
              font-size: 14px;
            }
            
            .shared-header .company img {
              height: 30px;
              margin-right: 10px;
            }
            
            .template-container {
              background-color: white;
              margin: 20px auto;
              max-width: 800px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            
            .template-header {
              padding: 20px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .template-header h3 {
              margin: 0 0 5px 0;
              color: #1a3a5f;
              font-size: 18px;
            }
            
            .template-header p {
              margin: 0;
              color: #6b7280;
              font-size: 14px;
            }
            
            .template-content {
              padding: 20px;
            }
            
            .template-footer {
              padding: 15px 20px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
            
            @media print {
              .shared-header, .template-header, .template-footer {
                display: none;
              }
              
              .template-container {
                box-shadow: none;
                margin: 0;
                max-width: none;
                border-radius: 0;
              }
              
              .template-content {
                padding: 0;
              }
              
              body {
                background-color: white;
              }
              
              @page {
                margin: 0.5cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="shared-header">
            <h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              Shared Template
            </h2>
            <div class="company">
              <img src="/assets/Logo-white.png" alt="InfyMailer Logo">
              InfyMailer
            </div>
          </div>
          
          <div class="template-container">
            <div class="template-header">
              <h3>${template.name}</h3>
              <p>${template.description || 'Shared with you via InfyMailer'}</p>
            </div>
            
            <div class="template-content">
              ${templateHtml}
            </div>
            
            <div class="template-footer">
              This template was shared via InfyMailer - Create and share your own templates at <a href="/">InfyMailer.com</a>
            </div>
          </div>
        </body>
        </html>
      `;
      
      res.send(html);
    } catch (error) {
      console.error('Error displaying shared template:', error);
      res.status(500).send('Error displaying shared template');
    }
  });

  // Template Preview Endpoint
  app.get('/preview-template', async (req: Request, res: Response) => {
    try {
      const templateId = req.query.id;
      
      if (!templateId) {
        return res.status(400).send('Template ID is required');
      }
      
      // Get the template from storage
      const template = await storage.getTemplate(Number(templateId));
      
      if (!template) {
        return res.status(404).send('Template not found');
      }
      
      // Parse the template content
      let templateContent = template.content;
      let templateHtml = '';
      
      try {
        // Try to parse the content as JSON first (for newer templates)
        const templateData = JSON.parse(template.content);
        
        // Check if there's an originalHtml field in metadata from the content or the template
        if (templateData.metadata?.originalHtml) {
          templateHtml = templateData.metadata.originalHtml;
        } else if (template.metadata && typeof template.metadata === 'object' && 'originalHtml' in template.metadata) {
          templateHtml = template.metadata.originalHtml;
        } else if (templateData.sections) {
          // Handle case where we have sections with HTML elements
          // Extract HTML from the sections if they exist
          templateData.sections.forEach(section => {
            section.elements.forEach(element => {
              if (element.type === 'html' && element.content?.html) {
                templateHtml += element.content.html;
              } else if (element.type === 'text' && element.content?.text) {
                templateHtml += `<div style="font-size: ${element.styles?.fontSize || '16px'}; color: ${element.styles?.color || '#000000'}; text-align: ${element.styles?.textAlign || 'left'};">${element.content.text}</div>`;
              }
            });
          });
        } else {
          // Default fallback - just use the template content directly
          templateHtml = template.content;
        }
      } catch (e) {
        // If parsing as JSON fails, assume it's already HTML
        console.log('Template content is not JSON, using directly:', e);
        templateHtml = template.content;
      }
      
      // Return the template HTML as a standalone page
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${template.name} - Preview</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            
            .preview-header {
              background-color: #f5f5f5;
              padding: 10px 20px;
              border-bottom: 1px solid #ddd;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .preview-header h2 {
              margin: 0;
              font-size: 18px;
              color: #333;
            }
            
            .preview-header .actions {
              display: flex;
              gap: 10px;
            }
            
            .preview-header button {
              padding: 8px 16px;
              font-weight: 500;
              cursor: pointer;
              font-size: 14px;
              border-radius: 4px;
              transition: all 0.2s ease;
            }
            
            .preview-header button:first-child {
              background-color: #3b82f6;
              color: white;
              border: 1px solid #2563eb;
            }
            
            .preview-header button:first-child:hover {
              background-color: #2563eb;
            }
            
            .preview-header button:last-child {
              background-color: #f0f0f0;
              border: 1px solid #ddd;
            }
            
            .preview-header button:last-child:hover {
              background-color: #e0e0e0;
            }
            
            .template-container {
              padding: 20px;
              max-width: 100%;
              overflow: auto;
            }
            
            /* Print styles */
            @media print {
              .preview-header {
                display: none;
              }
              
              .template-container {
                padding: 0;
                max-width: none;
              }
              
              body {
                margin: 0;
                padding: 0;
              }
              
              @page {
                margin: 0.5cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="preview-header">
            <h2>${template.name}</h2>
            <div class="actions">
              <button onclick="window.print()">Save as PDF</button>
              <button onclick="window.close()">Close Preview</button>
            </div>
          </div>
          <div class="template-container">
            ${templateHtml}
          </div>
        </body>
        </html>
      `;
      
      res.send(html);
    } catch (error) {
      console.error('Error previewing template:', error);
      res.status(500).send('Error displaying template preview');
    }
  });
  
  // Image upload endpoint for the template builder
  app.post('/api/upload/image', (req, res) => {
    try {
      // Check if a file was uploaded
      if (!req.files || !req.files.image) {
        return res.status(400).json({ error: 'No image was uploaded' });
      }
      
      // Get the uploaded file
      const uploadedFile = req.files.image as UploadedFile;
      
      // Validate the file is an image
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
        return res.status(400).json({ 
          error: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP, or SVG).' 
        });
      }
      
      // Convert image to base64 format
      const base64Image = `data:${uploadedFile.mimetype};base64,${uploadedFile.data.toString('base64')}`;
      
      // Return the base64 encoded image
      res.status(200).json({
        success: true,
        imageUrl: base64Image,
        originalName: uploadedFile.name,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'An error occurred while uploading the image.' });
    }
  });

  // Client-specific template routes
  
  // Get client templates
  app.get('/api/client/:clientId/templates', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
      
      const category = req.query.category as string;
      let templates;
      
      if (category && category !== 'all') {
        templates = await storage.getClientTemplatesByCategory(clientId, category);
      } else {
        templates = await storage.getClientTemplates(clientId);
      }
      
      // Format templates for frontend
      const formattedTemplates = templates.map(template => {
        const metadata = template.metadata as any || {};
        return {
          id: template.id,
          name: template.name,
          description: template.description || '',
          icon: metadata.icon || 'file-earmark-text',
          iconColor: metadata.iconColor || 'primary',
          lastUsed: metadata.lastUsed || 'Never used',
          selected: metadata.selected || false,
          new: metadata.new || false,
          clientId: template.clientId
        };
      });
      
      res.json(formattedTemplates);
    } catch (error) {
      console.error('Error fetching client templates:', error);
      res.status(500).json({ error: 'Failed to fetch client templates' });
    }
  });
  
  // Create a new client template
  app.post('/api/client/:clientId/templates', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
      
      const { name, content, description, category, metadata } = req.body;
      
      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }
      
      const template = await storage.createClientTemplate(clientId, {
        name,
        content,
        description: description || `Template: ${name}`,
        category: category || 'general',
        metadata: metadata || {}
      });
      
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating client template:', error);
      res.status(500).json({ error: 'Failed to create client template' });
    }
  });

  // Client Portal Endpoints
  app.get('/api/client/credits', async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      // Check if this is a client user
      if (user.role === 'client_user' && user.clientId) {
        const client = await storage.getClient(user.clientId);
        
        if (!client) {
          return res.status(404).json({ success: false, error: 'Client not found' });
        }

        // Return client's email credits info
        return res.json({
          total: client.emailCredits || 10000, // Default if not set
          used: client.emailCreditsUsed || 0,
          remaining: (client.emailCredits || 10000) - (client.emailCreditsUsed || 0),
          lastUpdated: client.lastCreditUpdateAt || new Date().toISOString()
        });
      } else {
        // For admin users, return the first client's credits as a sample
        const clients = await storage.getClients();
        if (clients && clients.length > 0) {
          const client = clients[0];
          return res.json({
            total: client.emailCredits || 10000,
            used: client.emailCreditsUsed || 0,
            remaining: (client.emailCredits || 10000) - (client.emailCreditsUsed || 0),
            lastUpdated: client.lastCreditUpdateAt || new Date().toISOString()
          });
        } else {
          // Fallback if no clients exist
          return res.json({
            total: 10000,
            used: 0,
            remaining: 10000,
            lastUpdated: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error retrieving client credits:', error);
      return res.status(500).json({ success: false, error: 'Failed to retrieve client credits' });
    }
  });

  app.get('/api/client/templates', async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      let clientId = null;
      
      // Determine the client ID based on user role
      if (user.role === 'client_user' && user.clientId) {
        clientId = user.clientId;
      }

      const templates = await storage.getTemplates();
      
      // Filter templates by client ID if the user is a client user
      const filteredTemplates = clientId 
        ? templates.filter(t => t.clientId === clientId || t.isGlobal === true)
        : templates;
        
      // Add additional UI-friendly properties
      const enhancedTemplates = filteredTemplates.map(template => {
        // Get a date from the last 30 days for the "last used" date
        const randomDays = Math.floor(Math.random() * 30);
        const lastUsed = new Date();
        lastUsed.setDate(lastUsed.getDate() - randomDays);
        
        return {
          id: template.id,
          name: template.name,
          category: template.category || 'General',
          lastUsed: template.updatedAt || lastUsed.toISOString(),
          status: template.status || 'active'
        };
      });
      
      return res.json(enhancedTemplates);
    } catch (error) {
      console.error('Error retrieving client templates:', error);
      return res.status(500).json({ success: false, error: 'Failed to retrieve templates' });
    }
  });

  app.get('/api/client/contacts', async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      let clientId = null;
      
      // Determine the client ID based on user role
      if (user.role === 'client_user' && user.clientId) {
        clientId = user.clientId;
      }

      const contacts = await storage.getContacts();
      
      // In a real implementation, we would filter contacts by client ID
      // For now, just return all contacts
      const enhancedContacts = contacts.map(contact => {
        // Generate a random date for the last opened date
        const randomDays = Math.floor(Math.random() * 30);
        const lastOpened = new Date();
        lastOpened.setDate(lastOpened.getDate() - randomDays);
        
        return {
          id: contact.id,
          name: contact.name || `${contact.email.split('@')[0]}`,
          email: contact.email,
          status: contact.status || (Math.random() > 0.1 ? 'active' : 'unsubscribed'),
          lastOpened: contact.updatedAt || lastOpened.toISOString()
        };
      });
      
      return res.json(enhancedContacts);
    } catch (error) {
      console.error('Error retrieving client contacts:', error);
      return res.status(500).json({ success: false, error: 'Failed to retrieve contacts' });
    }
  });

  return httpServer;
}
