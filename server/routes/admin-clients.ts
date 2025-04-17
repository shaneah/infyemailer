import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { hashPassword } from '../auth';

const router = express.Router();

// Admin authentication middleware
const checkAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // For now, we'll allow all authenticated users to access admin routes
  // In a production environment, we would check for admin role here
  if (req.isAuthenticated && req.isAuthenticated()) {
    // We're authenticated, proceed
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};

// Apply admin auth middleware to all routes
router.use(checkAdminAuth);

// Get all clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await storage.getClients();
    return res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ message: 'Failed to fetch clients' });
  }
});

// Get a specific client
router.get('/clients/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const client = await storage.getClient(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    return res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return res.status(500).json({ message: 'Failed to fetch client' });
  }
});

// Create a new client
const ClientCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  company: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  status: z.string().default('active'),
  emailCredits: z.number().int().default(0),
});

router.post('/clients', async (req, res) => {
  try {
    const validation = ClientCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validation.error.format() 
      });
    }

    const newClient = validation.data;
    const result = await storage.createClient(newClient);
    
    // Create a default user for the client
    const username = newClient.email.split('@')[0].toLowerCase();
    const password = await hashPassword('tempPassword123'); // This should be generated or sent via email in production
    
    await storage.createClientUser({
      clientId: result.id,
      username,
      password,
      status: 'active',
      permissions: {
        canViewDashboard: true,
        canManageCampaigns: true,
        canViewReports: true,
      }
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({ message: 'Failed to create client' });
  }
});

// Update a client
router.patch('/clients/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // Ensure the client exists
    const existingClient = await storage.getClient(clientId);
    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const UpdateClientSchema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      company: z.string().min(1).optional(),
      industry: z.string().optional(),
      status: z.string().optional(),
      emailCredits: z.number().int().optional(),
    });

    const validation = UpdateClientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validation.error.format() 
      });
    }

    const updates = validation.data;
    const updatedClient = await storage.updateClient(clientId, updates);

    return res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return res.status(500).json({ message: 'Failed to update client' });
  }
});

// Delete a client
router.delete('/clients/:id', async (req, res) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    // Ensure the client exists
    const existingClient = await storage.getClient(clientId);
    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete associated client users first
    const clientUsers = await storage.getClientUsersByClientId(clientId);
    for (const user of clientUsers) {
      await storage.deleteClientUser(user.id);
    }

    // Then delete the client
    const result = await storage.deleteClient(clientId);

    return res.json({ success: result });
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ message: 'Failed to delete client' });
  }
});

// Get client users for a specific client
router.get('/client-users', async (req, res) => {
  try {
    const clientId = parseInt(req.query.clientId as string, 10);
    if (isNaN(clientId)) {
      return res.status(400).json({ message: 'Invalid client ID' });
    }

    const clientUsers = await storage.getClientUsersByClientId(clientId);
    return res.json(clientUsers);
  } catch (error) {
    console.error('Error fetching client users:', error);
    return res.status(500).json({ message: 'Failed to fetch client users' });
  }
});

// Create a new client user
const ClientUserCreateSchema = z.object({
  clientId: z.number().int().positive(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  status: z.string().default('active'),
  permissions: z.any().optional(),
});

router.post('/client-users', async (req, res) => {
  try {
    const validation = ClientUserCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validation.error.format() 
      });
    }

    const userData = validation.data;
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password);
    userData.password = hashedPassword;

    const result = await storage.createClientUser(userData);
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating client user:', error);
    return res.status(500).json({ message: 'Failed to create client user' });
  }
});

// Update a client user
router.patch('/client-users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Ensure the user exists
    const existingUser = await storage.getClientUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const UpdateClientUserSchema = z.object({
      username: z.string().min(3).optional(),
      password: z.string().min(8).optional(),
      status: z.string().optional(),
      permissions: z.any().optional(),
    });

    const validation = UpdateClientUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validation.error.format() 
      });
    }

    const updates = validation.data;
    
    // Hash password if it's being updated
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updatedUser = await storage.updateClientUser(userId, updates);
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating client user:', error);
    return res.status(500).json({ message: 'Failed to update client user' });
  }
});

// Delete a client user
router.delete('/client-users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Ensure the user exists
    const existingUser = await storage.getClientUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await storage.deleteClientUser(userId);
    return res.json({ success: result });
  } catch (error) {
    console.error('Error deleting client user:', error);
    return res.status(500).json({ message: 'Failed to delete client user' });
  }
});

export default router;