import { Request, Response } from "express";
import { getStorage } from "../storageManager";
import { z } from "zod";

const storage = getStorage();

// Client schema validation
const clientSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  company: z.string().min(1, { message: 'Company is required.' }),
  industry: z.string().optional(),
  emailCredits: z.number().nonnegative().optional(),
  status: z.string().optional(),
});

export function registerClientRoutes(app: any) {
  // Get all clients
  app.get('/api/clients', async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ 
        error: 'Failed to fetch clients', 
        details: error.message 
      });
    }
  });

  // Get a single client by ID
  app.get('/api/clients/:id', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id, 10);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      res.json(client);
    } catch (error: any) {
      console.error('Error fetching client:', error);
      res.status(500).json({ 
        error: 'Failed to fetch client', 
        details: error.message 
      });
    }
  });

  // Create a new client
  app.post('/api/clients', async (req: Request, res: Response) => {
    try {
      console.log('Received client creation request:', req.body);
      
      // Convert emailCredits to number if it exists
      if (req.body.emailCredits) {
        req.body.emailCredits = Number(req.body.emailCredits);
      }
      
      // Add metadata if not present
      if (!req.body.metadata) {
        req.body.metadata = {};
      }
      
      // Create client (without validation for now to simplify)
      const client = await storage.createClient(req.body);
      console.log('Client created successfully:', client);
      
      res.status(201).json(client);
    } catch (error: any) {
      console.error('Error creating client:', error);
      res.status(500).json({ 
        error: 'Failed to create client', 
        details: error.message 
      });
    }
  });

  // Update a client
  app.patch('/api/clients/:id', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id, 10);
      console.log('Received client update request:', req.body);
      
      // Check if client exists
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Convert emailCredits to number if it exists
      if (req.body.emailCredits) {
        req.body.emailCredits = Number(req.body.emailCredits);
      }
      
      // Ensure metadata is preserved
      if (!req.body.metadata && existingClient.metadata) {
        req.body.metadata = existingClient.metadata;
      }
      
      // Update client
      const updatedClient = await storage.updateClient(clientId, req.body);
      console.log('Client updated successfully:', updatedClient);
      
      res.json(updatedClient);
    } catch (error: any) {
      console.error('Error updating client:', error);
      res.status(500).json({ 
        error: 'Failed to update client', 
        details: error.message 
      });
    }
  });

  // Delete a client
  app.delete('/api/clients/:id', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.id, 10);
      
      // Check if client exists
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Delete client
      await storage.deleteClient(clientId);
      
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      res.status(500).json({ 
        error: 'Failed to delete client', 
        details: error.message 
      });
    }
  });

  // Get client users
  app.get('/api/clients/:clientId/users', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      
      // Check if client exists
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Get client users
      const users = await storage.getClientUsersByClientId(clientId);
      
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching client users:', error);
      res.status(500).json({ 
        error: 'Failed to fetch client users', 
        details: error.message 
      });
    }
  });

  // Create client user
  app.post('/api/client-users', async (req: Request, res: Response) => {
    try {
      console.log('Received client user data:', req.body);
      const userData = req.body;
      
      // Validate client ID
      const clientId = parseInt(userData.clientId, 10);
      if (isNaN(clientId)) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
      
      // Check if client exists
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Extract permissions from request body or provide defaults
      const permissions = userData.permissions || {
        emailValidation: true,
        campaigns: true,
        contacts: true,
        templates: true,
        reporting: true,
        domains: true,
        abTesting: true
      };
      
      // Prepare the user data
      const clientUserData = {
        ...userData,
        clientId: clientId,
        // Store permissions in metadata
        metadata: {
          ...userData.metadata,
          permissions: permissions
        }
      };
      
      console.log('Creating client user with processed data:', clientUserData);
      
      // Create client user
      const user = await storage.createClientUser(clientUserData);
      console.log('Client user created:', user);
      
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creating client user:', error);
      res.status(500).json({ 
        error: 'Failed to create client user', 
        details: error.message 
      });
    }
  });

  // Update client user
  app.patch('/api/client-users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const userData = req.body;
      
      // Check if user exists
      const existingUser = await storage.getClientUser(userId);
      if (!existingUser) {
        return res.status(404).json({ error: 'Client user not found' });
      }
      
      // Update client user
      const updatedUser = await storage.updateClientUser(userId, userData);
      
      res.json(updatedUser);
    } catch (error: any) {
      console.error('Error updating client user:', error);
      res.status(500).json({ 
        error: 'Failed to update client user', 
        details: error.message 
      });
    }
  });

  // Delete client user
  app.delete('/api/client-users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      
      // Check if user exists
      const existingUser = await storage.getClientUser(userId);
      if (!existingUser) {
        return res.status(404).json({ error: 'Client user not found' });
      }
      
      // Delete client user
      await storage.deleteClientUser(userId);
      
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting client user:', error);
      res.status(500).json({ 
        error: 'Failed to delete client user', 
        details: error.message 
      });
    }
  });

  // Credit management - Add credits
  app.post('/api/clients/:clientId/email-credits/add', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      const { amount, reason } = req.body;
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount. Must be a positive number.' });
      }
      
      // Check if client exists
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Add credits
      const result = await storage.updateClientEmailCredits(clientId, amount);
      
      res.json(result);
    } catch (error: any) {
      console.error('Error adding credits:', error);
      res.status(500).json({ 
        error: 'Failed to add credits', 
        details: error.message 
      });
    }
  });

  // Credit management - Deduct credits
  app.post('/api/clients/:clientId/email-credits/deduct', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      const { amount, reason } = req.body;
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount. Must be a positive number.' });
      }
      
      // Check if client exists
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Deduct credits
      const result = await storage.updateClientEmailCredits(clientId, amount);
      
      res.json(result);
    } catch (error: any) {
      console.error('Error deducting credits:', error);
      res.status(500).json({ 
        error: 'Failed to deduct credits', 
        details: error.message 
      });
    }
  });

  // Credit management - Set credits to specific amount
  app.post('/api/clients/:clientId/email-credits/set', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      const { amount, reason } = req.body;
      
      if (isNaN(amount) || amount < 0) {
        return res.status(400).json({ error: 'Invalid amount. Must be a non-negative number.' });
      }
      
      // Check if client exists
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Set credits
      const result = await storage.updateClientEmailCredits(clientId, amount);
      
      res.json(result);
    } catch (error: any) {
      console.error('Error setting credits:', error);
      res.status(500).json({ 
        error: 'Failed to set credits', 
        details: error.message 
      });
    }
  });

  // Get credit history
  app.get('/api/clients/:clientId/email-credits/history', async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId, 10);
      
      // Check if client exists
      const existingClient = await storage.getClient(clientId);
      if (!existingClient) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Get credit history
      const options: { limit?: number, start_date?: string, end_date?: string, type?: "" | "add" | "deduct" | "set" } = {
        limit: parseInt(req.query.limit as string) || 50,
      };
      
      // Add optional date filters if provided
      if (req.query.start_date) {
        options.start_date = req.query.start_date as string;
      }
      
      if (req.query.end_date) {
        options.end_date = req.query.end_date as string;
      }
      
      // Add type filter if provided
      if (req.query.type && ["add", "deduct", "set", ""].includes(req.query.type as string)) {
        options.type = req.query.type as "" | "add" | "deduct" | "set";
      }
      
      const history = await storage.getClientEmailCreditsHistory(clientId, options);
      
      res.json(history);
    } catch (error: any) {
      console.error('Error fetching credit history:', error);
      res.status(500).json({ 
        error: 'Failed to fetch credit history', 
        details: error.message 
      });
    }
  });
}