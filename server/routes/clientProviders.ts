import { Request, Response } from "express";
import { getStorage } from "../storageManager";
import { z } from "zod";

export function registerClientProviderRoutes(app: any) {
  // Get all providers assigned to a client
  app.get('/api/clients/:clientId/providers', async (req: Request, res: Response) => {
    try {
      const storage = getStorage();
      const clientId = parseInt(req.params.clientId, 10);
      
      // Validate client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      const providers = await storage.getClientProviders(clientId);
      
      // Fetch full provider details for each assigned provider
      const enrichedProviders = await Promise.all(
        providers.map(async (cp) => {
          // Get the full provider details 
          // For now, we'll just return what we have
          return {
            ...cp,
            providerName: `Provider ${cp.providerId}` // Placeholder - would fetch actual provider name
          };
        })
      );
      
      res.json(enrichedProviders);
    } catch (error: any) {
      console.error('Error getting client providers:', error);
      res.status(500).json({ 
        error: 'Failed to get client providers', 
        details: error.message 
      });
    }
  });
  
  // Assign provider to client
  app.post('/api/clients/:clientId/providers', async (req: Request, res: Response) => {
    try {
      const storage = getStorage();
      const clientId = parseInt(req.params.clientId, 10);
      
      // Validate the request body
      const schema = z.object({
        providerId: z.string().or(z.number()).transform(val => String(val)),
        settings: z.record(z.any()).optional().default({})
      });
      
      const validatedData = schema.parse(req.body);
      
      // Validate client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Assign provider to client
      const result = await storage.assignProviderToClient(
        clientId, 
        validatedData.providerId, 
        validatedData.settings
      );
      
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error assigning provider to client:', error);
      res.status(500).json({ 
        error: 'Failed to assign provider', 
        details: error.message 
      });
    }
  });
  
  // Remove provider from client
  app.delete('/api/clients/:clientId/providers/:providerId', async (req: Request, res: Response) => {
    try {
      const storage = getStorage();
      const clientId = parseInt(req.params.clientId, 10);
      const providerId = req.params.providerId;
      
      // Validate client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Remove provider from client
      const success = await storage.removeProviderFromClient(clientId, providerId);
      
      if (!success) {
        return res.status(404).json({ error: 'Provider assignment not found' });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error removing provider from client:', error);
      res.status(500).json({ 
        error: 'Failed to remove provider', 
        details: error.message 
      });
    }
  });
  
  // Get all available providers that can be assigned to clients
  app.get('/api/client-providers/available', async (req: Request, res: Response) => {
    try {
      // This would typically fetch from a providers table
      // For now, we'll return a hardcoded list of available providers
      const availableProviders = [
        { id: 1, name: 'SendGrid', type: 'sendgrid' },
        { id: 2, name: 'Mailgun', type: 'mailgun' },
        { id: 3, name: 'SendClean', type: 'sendclean' }
      ];
      
      res.json(availableProviders);
    } catch (error: any) {
      console.error('Error getting available providers:', error);
      res.status(500).json({ 
        error: 'Failed to get available providers', 
        details: error.message 
      });
    }
  });

  // Get all lists assigned to a client
  app.get('/api/clients/:clientId/lists', async (req: Request, res: Response) => {
    try {
      const storage = getStorage();
      const clientId = parseInt(req.params.clientId, 10);
      // Validate client exists
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      const lists = await storage.getClientLists(clientId);
      res.json(lists);
    } catch (error: any) {
      console.error('Error getting client lists:', error);
      res.status(500).json({ 
        error: 'Failed to get client lists', 
        details: error.message 
      });
    }
  });
}