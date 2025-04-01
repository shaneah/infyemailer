import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertListSchema, insertCampaignSchema, insertEmailSchema, insertTemplateSchema, insertAnalyticsSchema } from "@shared/schema";
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

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

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
      // Map campaigns to format expected by frontend
      const formattedCampaigns = campaigns.map(campaign => {
        const metadata = campaign.metadata as any || {};
        return {
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
          openRate: metadata.openRate || 0,
          clickRate: metadata.clickRate || 0,
          date: metadata.date || (campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'),
        };
      });
      res.json(formattedCampaigns);
    } catch (error) {
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
    const validatedData = validate(insertCampaignSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create campaign' });
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
      if (contacts.length === 0) {
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

      // Map contacts to include list info
      const contactsWithLists = await Promise.all(contacts.map(async (contact) => {
        const lists = await storage.getListsByContact(contact.id);
        return {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          status: { 
            label: contact.status.charAt(0).toUpperCase() + contact.status.slice(1), 
            color: contact.status === 'active' ? 'success' : 
                  contact.status === 'unsubscribed' ? 'danger' : 
                  contact.status === 'bounced' ? 'warning' : 'secondary'
          },
          lists: lists.map(list => ({ id: list.id, name: list.name })),
          addedOn: contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
        };
      }));

      res.json(contactsWithLists);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  // Create a new contact
  app.post('/api/contacts', async (req: Request, res: Response) => {
    const validatedData = validate(insertContactSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      // Check if the contact already exists
      const existing = await storage.getContactByEmail(validatedData.email);
      if (existing) {
        return res.status(400).json({ error: 'A contact with this email already exists' });
      }

      const contact = await storage.createContact(validatedData);
      
      // If a list is specified, add the contact to it
      if (req.body.list) {
        const listId = parseInt(req.body.list);
        await storage.addContactToList({ contactId: contact.id, listId });
      }

      res.status(201).json(contact);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });

  // Get lists
  app.get('/api/lists', async (req: Request, res: Response) => {
    try {
      const lists = await storage.getLists();
      
      // Map lists to include count
      const listsWithCount = await Promise.all(lists.map(async (list) => {
        const contacts = await storage.getContactsByList(list.id);
        return {
          id: list.id.toString(),
          name: list.name,
          count: contacts.length,
          lastUpdated: list.updatedAt ? new Date(list.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
        };
      }));

      res.json(listsWithCount);
    } catch (error) {
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

  return httpServer;
}
