import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSubjectLines, generateEmailTemplate } from "./services/openai";
import { 
  insertContactSchema, 
  insertListSchema, 
  insertCampaignSchema, 
  insertEmailSchema, 
  insertTemplateSchema, 
  insertAnalyticsSchema,
  insertCampaignVariantSchema,
  insertVariantAnalyticsSchema,
  insertDomainSchema,
  insertCampaignDomainSchema,
  insertClientSchema,
  insertUserSchema,
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
    const validatedData = validate(clientUserLoginSchema, req.body);
    if ('error' in validatedData) {
      return res.status(400).json({ error: validatedData.error });
    }

    try {
      const { username, password } = validatedData;
      const clientUser = await storage.verifyClientLogin(username, password);
      
      if (!clientUser) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Get the associated client for this user
      const client = await storage.getClient(clientUser.clientId);
      
      if (!client) {
        return res.status(500).json({ error: 'Client account not found' });
      }
      
      // Don't send password back to the client
      const { password: _, ...clientUserWithoutPassword } = clientUser;
      
      res.json({ 
        ...clientUserWithoutPassword,
        clientName: client.name,
        clientCompany: client.company,
        lastLogin: new Date().toISOString() 
      });
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
      
      // In a real app, you would hash the password here
      const clientUser = await storage.createClientUser(validatedData);
      
      // Don't send password back to client
      const { password, ...clientUserWithoutPassword } = clientUser;
      
      res.status(201).json(clientUserWithoutPassword);
    } catch (error) {
      console.error('Error creating client user:', error);
      res.status(500).json({ error: 'Failed to create client user' });
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
    try {
      const { templateType, industry, purpose, targetAudience, brandTone, keyPoints } = req.body;
      
      if (!templateType || !industry || !purpose || !targetAudience) {
        return res.status(400).json({ 
          error: 'Missing required parameters. Please provide templateType, industry, purpose, and targetAudience.' 
        });
      }
      
      const generatedTemplate = await generateEmailTemplate(
        templateType,
        industry,
        purpose,
        targetAudience,
        brandTone || 'professional',
        keyPoints || ''
      );
      
      // If storage is requested, save the template
      if (req.body.saveTemplate === true) {
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
      res.status(201).json({ 
        template: generatedTemplate,
        message: 'Template successfully generated' 
      });
    } catch (error) {
      console.error('Error generating email template:', error);
      res.status(500).json({ 
        error: 'Failed to generate email template. Please ensure your OpenAI API key is valid.'
      });
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

  return httpServer;
}
