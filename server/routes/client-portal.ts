import express from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = express.Router();

// Client authentication middleware
const checkClientAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Check if the user is authenticated via Passport
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Ensure the user has a client role
    const user = req.user as any;
    
    if (user && user.role === 'client') {
      // We're authenticated as a client, proceed
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied. Client role required.' });
  }
  
  return res.status(401).json({ message: 'Authentication required' });
};

// Apply client auth middleware to all routes
router.use(checkClientAuth);

// Get client profile information
router.get('/profile', async (req, res) => {
  try {
    const user = req.user as any;
    
    // If we have a clientId, fetch the associated client data
    if (user.clientId) {
      const client = await storage.getClient(user.clientId);
      
      if (client) {
        return res.json({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          client: {
            id: client.id,
            name: client.name,
            company: client.company,
            industry: client.industry,
            status: client.status,
            emailCredits: client.emailCredits
          }
        });
      }
    }
    
    // If we don't have a clientId or can't find the client, just return user data
    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Get campaigns for the client
router.get('/campaigns', async (req, res) => {
  try {
    const user = req.user as any;
    
    if (!user.clientId) {
      return res.status(400).json({ message: 'Client ID not found for user' });
    }
    
    // Fetch campaigns filtered by clientId
    const campaigns = await storage.getCampaigns();
    const clientCampaigns = campaigns.filter(campaign => campaign.clientId === user.clientId);
    
    return res.json(clientCampaigns);
  } catch (error) {
    console.error('Error fetching client campaigns:', error);
    return res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
});

// Get templates for the client
router.get('/templates', async (req, res) => {
  try {
    const user = req.user as any;
    
    if (!user.clientId) {
      return res.status(400).json({ message: 'Client ID not found for user' });
    }
    
    // Fetch templates filtered by clientId or where isGlobal is true
    const templates = await storage.getTemplates();
    const availableTemplates = templates.filter(template => 
      template.clientId === user.clientId || template.isGlobal === true
    );
    
    return res.json(availableTemplates);
  } catch (error) {
    console.error('Error fetching client templates:', error);
    return res.status(500).json({ message: 'Failed to fetch templates' });
  }
});

// Get contacts for the client
router.get('/contacts', async (req, res) => {
  try {
    const user = req.user as any;
    
    if (!user.clientId) {
      return res.status(400).json({ message: 'Client ID not found for user' });
    }
    
    // Fetch contacts filtered by clientId
    const contacts = await storage.getContacts();
    const clientContacts = contacts.filter(contact => contact.clientId === user.clientId);
    
    return res.json(clientContacts);
  } catch (error) {
    console.error('Error fetching client contacts:', error);
    return res.status(500).json({ message: 'Failed to fetch contacts' });
  }
});

// Get lists for the client
router.get('/lists', async (req, res) => {
  try {
    const user = req.user as any;
    
    if (!user.clientId) {
      return res.status(400).json({ message: 'Client ID not found for user' });
    }
    
    // Fetch lists filtered by clientId
    const lists = await storage.getLists();
    const clientLists = lists.filter(list => list.clientId === user.clientId);
    
    return res.json(clientLists);
  } catch (error) {
    console.error('Error fetching client lists:', error);
    return res.status(500).json({ message: 'Failed to fetch lists' });
  }
});

// Get analytics for client campaigns
router.get('/analytics', async (req, res) => {
  try {
    const user = req.user as any;
    
    if (!user.clientId) {
      return res.status(400).json({ message: 'Client ID not found for user' });
    }
    
    // Get campaigns for this client
    const campaigns = await storage.getCampaigns();
    const clientCampaigns = campaigns.filter(campaign => campaign.clientId === user.clientId);
    
    // Create summary statistics
    const stats = {
      totalCampaigns: clientCampaigns.length,
      sentCampaigns: clientCampaigns.filter(c => c.status === 'sent').length,
      scheduledCampaigns: clientCampaigns.filter(c => c.status === 'scheduled').length,
      activeCampaigns: clientCampaigns.filter(c => c.status === 'active').length,
      totalEmails: clientCampaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0),
      averageOpenRate: 0,
      averageClickRate: 0
    };
    
    // Calculate averages if we have campaigns
    if (clientCampaigns.length > 0) {
      stats.averageOpenRate = clientCampaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / clientCampaigns.length;
      stats.averageClickRate = clientCampaigns.reduce((sum, c) => sum + (c.clickRate || 0), 0) / clientCampaigns.length;
    }
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching client analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

export default router;