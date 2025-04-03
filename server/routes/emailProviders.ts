import { Request, Response } from 'express';
import { z } from 'zod';
import { EmailProviderFactory } from '../services/emailProviders';
import { emailService } from '../services/EmailService';
import { providerSettingsService } from '../services/ProviderSettingsService';

export async function registerEmailProviderRoutes(app: any) {
  // Initialize the provider settings service
  await providerSettingsService.initialize();
  
  // Get available email providers
  app.get('/api/email-providers/available', (req: Request, res: Response) => {
    try {
      const providers = EmailProviderFactory.getAvailableProviders();
      res.json(providers);
    } catch (error) {
      console.error('Error getting available providers:', error);
      res.status(500).json({ error: 'Failed to get available providers' });
    }
  });
  
  // Get registered email providers
  app.get('/api/email-providers', async (req: Request, res: Response) => {
    try {
      const providers = await providerSettingsService.getAllProviderSettings();
      res.json(providers);
    } catch (error) {
      console.error('Error getting providers:', error);
      res.status(500).json({ error: 'Failed to get providers' });
    }
  });
  
  // Get a specific email provider
  app.get('/api/email-providers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const provider = await providerSettingsService.getProviderSettings(id);
      
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      res.json(provider);
    } catch (error) {
      console.error('Error getting provider:', error);
      res.status(500).json({ error: 'Failed to get provider' });
    }
  });
  
  // Create a new email provider
  app.post('/api/email-providers', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const schema = z.object({
        name: z.string().min(1),
        provider: z.enum(['sendgrid', 'mailgun', 'amazonses']),
        config: z.record(z.any()),
        isDefault: z.boolean().optional().default(false)
      });
      
      const validatedData = schema.parse(req.body);
      
      // Save the provider settings
      const provider = await providerSettingsService.saveProviderSettings(validatedData);
      
      res.status(201).json(provider);
    } catch (error) {
      console.error('Error creating provider:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create provider' });
    }
  });
  
  // Update an email provider
  app.patch('/api/email-providers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Validate the request body
      const schema = z.object({
        name: z.string().min(1).optional(),
        provider: z.enum(['sendgrid', 'mailgun', 'amazonses']).optional(),
        config: z.record(z.any()).optional(),
        isDefault: z.boolean().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Update the provider settings
      const provider = await providerSettingsService.updateProviderSettings(id, validatedData);
      
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      res.json(provider);
    } catch (error) {
      console.error('Error updating provider:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update provider' });
    }
  });
  
  // Delete an email provider
  app.delete('/api/email-providers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Delete the provider settings
      const success = await providerSettingsService.deleteProviderSettings(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting provider:', error);
      res.status(500).json({ error: 'Failed to delete provider' });
    }
  });
  
  // Verify domain with a provider
  app.post('/api/email-providers/:id/verify-domain', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Get the provider settings
      const settings = await providerSettingsService.getProviderSettings(id);
      
      if (!settings) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      // Validate the request body
      const schema = z.object({
        domain: z.string().min(1),
        dkimSelector: z.string().optional(),
        dkimValue: z.string().optional(),
        spfValue: z.string().optional(),
        dmarcValue: z.string().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Verify the domain
      const provider = emailService.getProvider(settings.name);
      const result = await provider.verifyDomainAuthentication(validatedData);
      
      res.json(result);
    } catch (error) {
      console.error('Error verifying domain:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to verify domain' });
    }
  });
  
  // Test sending an email with a provider
  app.post('/api/email-providers/:id/test-email', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Get the provider settings
      const settings = await providerSettingsService.getProviderSettings(id);
      
      if (!settings) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      // Validate the request body
      const schema = z.object({
        from: z.string().email(),
        to: z.string().email(),
        subject: z.string().min(1),
        text: z.string().optional(),
        html: z.string().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Send the test email
      const success = await emailService.sendEmail(validatedData, settings.name);
      
      if (!success) {
        return res.status(500).json({ error: 'Failed to send test email' });
      }
      
      res.json({ success: true, message: 'Test email sent successfully' });
    } catch (error) {
      console.error('Error sending test email:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });
  
  // Get features supported by a provider
  app.get('/api/email-providers/:id/features', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Get the provider settings
      const settings = await providerSettingsService.getProviderSettings(id);
      
      if (!settings) {
        return res.status(404).json({ error: 'Provider not found' });
      }
      
      // Get the features
      const provider = emailService.getProvider(settings.name);
      const features = provider.getSupportedFeatures();
      
      res.json(features);
    } catch (error) {
      console.error('Error getting provider features:', error);
      res.status(500).json({ error: 'Failed to get provider features' });
    }
  });
  
  // Get authentication requirements for a provider type
  app.get('/api/email-providers/requirements/:type', (req: Request, res: Response) => {
    try {
      const type = req.params.type as any;
      
      // Validate the provider type
      if (!['sendgrid', 'mailgun', 'amazonses'].includes(type)) {
        return res.status(400).json({ error: 'Invalid provider type' });
      }
      
      // Create a temporary provider to get the requirements
      const dummyConfig: Record<string, string> = {};
      
      if (type === 'sendgrid') {
        dummyConfig.apiKey = 'dummy';
      } else if (type === 'mailgun') {
        dummyConfig.apiKey = 'dummy';
        dummyConfig.domain = 'dummy.com';
      } else if (type === 'amazonses') {
        dummyConfig.accessKey = 'dummy';
        dummyConfig.secretKey = 'dummy';
      }
      
      const provider = EmailProviderFactory.createProvider(type, dummyConfig);
      const requirements = provider.getAuthenticationRequirements();
      
      res.json(requirements);
    } catch (error) {
      console.error('Error getting provider requirements:', error);
      res.status(500).json({ error: 'Failed to get provider requirements' });
    }
  });
}