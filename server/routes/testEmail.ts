import { Request, Response } from 'express';
import { z } from 'zod';
import { emailService } from '../services/EmailService';
import { getStorage } from '../storageManager';

// Import the default email settings from the emailSettings route
import { defaultEmailSettings } from './emailSettings';

export async function registerTestEmailRoutes(app: any) {
  // Send a test email from a template
  app.post('/api/templates/:id/test-email', async (req: Request, res: Response) => {
    try {
      const storage = getStorage();
      const templateId = parseInt(req.params.id, 10);
      
      // Log the request for debugging
      console.log(`[Template Test Email] Received request for template ID ${templateId}:`, {
        email: req.body.email,
        subject: req.body.subject,
        personalizeContent: req.body.personalizeContent
      });
      
      // Validate the request body
      const schema = z.object({
        email: z.string().email(),
        subject: z.string().min(1),
        personalizeContent: z.boolean().optional().default(false)
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get template from storage
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      console.log(`[Template Test Email] Found template: ${template.name}`);
      
      // Get all providers to ensure we have registered providers
      const allProviders = emailService.getAllProviders();
      if (allProviders.length === 0) {
        return res.status(400).json({ 
          error: 'No email providers configured', 
          message: 'Please set up at least one email provider in the Email Providers section'
        });
      }
      
      // Use default email settings if available
      const fromEmail = defaultEmailSettings.fromEmail || 'notifications@infymailer.com';
      const fromName = defaultEmailSettings.fromName || 'InfyMailer';
      
      console.log(`[Template Test Email] Using from address: ${fromEmail}`);
      
      let htmlContent = template.content || '';
      
      // Personalize content if requested
      if (validatedData.personalizeContent) {
        console.log('[Template Test Email] Personalizing content with test data');
        // Replace any merge tags with test data
        htmlContent = htmlContent
          .replace(/{{first_name}}/gi, 'Test')
          .replace(/{{last_name}}/gi, 'User')
          .replace(/{{email}}/gi, validatedData.email)
          .replace(/{{company}}/gi, 'Test Company')
          .replace(/{{unsubscribe_link}}/gi, '#');
      }
      
      // Get the default provider name for logging
      const defaultProviderName = emailService.getDefaultProviderName();
      const providerToUse = defaultProviderName || allProviders[0].name;
      
      console.log(`[Template Test Email] Using provider: ${providerToUse}`);
      
      // Send the test email
      const result = await emailService.sendEmail({
        from: fromEmail,
        fromName: fromName,
        to: validatedData.email,
        subject: validatedData.subject,
        html: htmlContent
      }, defaultProviderName);
      
      if (!result) {
        console.error('[Template Test Email] Email sending failed');
        return res.status(500).json({ error: 'Failed to send test email' });
      }
      
      console.log('[Template Test Email] Email sent successfully');
      return res.json({ 
        success: true, 
        message: `Test email sent successfully using ${providerToUse}`,
        provider: providerToUse
      });
    } catch (error) {
      console.error('[Template Test Email] Error sending test email:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      return res.status(500).json({ 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Send a test email using the default provider
  app.post('/api/test-email', async (req: Request, res: Response) => {
    try {
      const storage = getStorage();
      // Log the request for debugging
      console.log('[Test Email] Received request:', {
        to: req.body.to,
        subject: req.body.subject,
        from: req.body.from,
        fromName: req.body.fromName
      });
      
      // Validate the request body
      const schema = z.object({
        to: z.string().email(),
        subject: z.string().min(1),
        text: z.string().optional(),
        html: z.string().optional(),
        from: z.string().email().optional(),
        fromName: z.string().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get all providers to ensure we have registered providers
      const allProviders = emailService.getAllProviders();
      if (allProviders.length === 0) {
        return res.status(400).json({ 
          error: 'No email providers configured', 
          message: 'Please set up at least one email provider in the Email Providers section'
        });
      }
      
      // Get the default provider name for logging
      const defaultProviderName = emailService.getDefaultProviderName();
      if (!defaultProviderName) {
        // If no default provider is explicitly set, use the first available provider
        const firstProvider = allProviders[0];
        console.log(`[Test Email] No default provider set, using first available: ${firstProvider.name}`);
        
        // Use the global email settings if available
        const fromEmail = defaultEmailSettings.fromEmail 
          ? defaultEmailSettings.fromEmail
          : (validatedData.from || 'notifications@infymailer.com');
        
        const fromName = defaultEmailSettings.fromName
          ? defaultEmailSettings.fromName
          : (validatedData.fromName || 'InfyMailer');
        
        console.log(`[Test Email] Using from address with first provider: ${fromEmail}`);
        
        // Send the test email using the first available provider
        const result = await emailService.sendEmail({
          from: fromEmail,
          fromName: fromName,
          to: validatedData.to,
          subject: validatedData.subject,
          text: validatedData.text || '',
          html: validatedData.html || validatedData.text || ''
        }, firstProvider.name);
        
        if (!result) {
          console.error('[Test Email] Email sending failed');
          return res.status(500).json({ error: 'Failed to send test email' });
        }
        
        console.log('[Test Email] Email sent successfully');
        return res.json({ 
          success: true, 
          message: `Test email sent successfully using ${firstProvider.name}`,
          provider: firstProvider.name
        });
      }
      
      console.log(`[Test Email] Using default provider: ${defaultProviderName}`);
      console.log('[Test Email] Sending email to:', validatedData.to);
      
      // Use the global email settings if available
      const fromEmail = defaultEmailSettings.fromEmail 
        ? defaultEmailSettings.fromEmail
        : (validatedData.from || 'notifications@infymailer.com');
      
      const fromName = defaultEmailSettings.fromName
        ? defaultEmailSettings.fromName
        : (validatedData.fromName || 'InfyMailer');
      
      console.log(`[Test Email] Using from address: ${fromEmail}`);
      
      // Send the test email using the default provider
      const result = await emailService.sendEmail({
        from: fromEmail,
        fromName: fromName,
        to: validatedData.to,
        subject: validatedData.subject,
        text: validatedData.text || '',
        html: validatedData.html || validatedData.text || ''
      });
      
      if (!result) {
        console.error('[Test Email] Email sending failed');
        return res.status(500).json({ error: 'Failed to send test email' });
      }
      
      console.log('[Test Email] Email sent successfully');
      return res.json({ 
        success: true, 
        message: `Test email sent successfully using ${defaultProviderName}`,
        provider: defaultProviderName
      });
    } catch (error) {
      console.error('[Test Email] Error sending test email:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      return res.status(500).json({ 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Send a test email directly using SendGrid
  app.post('/api/test-email/sendgrid', async (req: Request, res: Response) => {
    try {
      const storage = getStorage();
      // Log the request for debugging
      console.log('[Test Email] Received request:', {
        to: req.body.to,
        subject: req.body.subject,
        from: req.body.from,
        fromName: req.body.fromName
      });
      
      // Check if SendGrid API key is available
      if (!process.env.SENDGRID_API_KEY) {
        console.error('[Test Email] SendGrid API key not found');
        return res.status(400).json({ 
          error: 'SendGrid API key not found', 
          message: 'Please set the SENDGRID_API_KEY environment variable'
        });
      }

      // First, check if the SendGrid provider is registered
      const allProviders = emailService.getAllProviders();
      console.log('[Test Email] Available providers:', allProviders.map(p => p.provider.getName()));
      
      const sendGridProvider = allProviders.find(p => p.provider.getName() === 'SendGrid');
      
      if (!sendGridProvider) {
        console.log('[Test Email] SendGrid provider not found, registering new instance');
        
        try {
          emailService.registerProviderWithFactory(
            'SendGrid',
            'sendgrid',
            { 
              apiKey: process.env.SENDGRID_API_KEY,
              fromEmail: req.body.from || 'notifications@infymailer.com',
              fromName: req.body.fromName || 'InfyMailer'
            }
          );
          console.log('[Test Email] SendGrid provider registered successfully');
        } catch (error) {
          console.error('[Test Email] Failed to register SendGrid provider:', error);
          return res.status(500).json({ 
            error: 'Failed to register SendGrid provider', 
            details: error instanceof Error ? error.message : String(error)
          });
        }
      } else {
        console.log('[Test Email] Using existing SendGrid provider');
      }
      
      // Validate the request body
      const schema = z.object({
        to: z.string().email(),
        subject: z.string().min(1),
        text: z.string().optional(),
        html: z.string().optional(),
        from: z.string().email().optional(),
        fromName: z.string().optional()
      });
      
      const validatedData = schema.parse(req.body);
      console.log('[Test Email] Request data validated successfully');
      
      // Get the SendGrid provider
      const allProvidersAgain = emailService.getAllProviders();
      const sendGridProviderObj = allProvidersAgain.find(p => p.provider.getName() === 'SendGrid');
      
      if (!sendGridProviderObj) {
        return res.status(400).json({ 
          error: 'SendGrid provider not found', 
          message: 'Failed to register SendGrid provider'
        });
      }
      
      // Extract the provider configuration
      const providerInstance = sendGridProviderObj.provider;
      const providerConfig = providerInstance as any;
      
      // Use the provider's configured fromEmail if available
      const fromEmail = providerConfig && providerConfig.fromEmail 
        ? providerConfig.fromEmail 
        : (validatedData.from || 'notifications@infymailer.com');
      
      console.log(`[Test Email] Using from address with SendGrid: ${fromEmail}`);
      
      // Send the test email using SendGrid
      console.log('[Test Email] Sending email to:', validatedData.to);
      const result = await emailService.sendEmail({
        from: fromEmail,
        to: validatedData.to,
        subject: validatedData.subject,
        text: validatedData.text || '',
        html: validatedData.html || validatedData.text || ''
      }, 'SendGrid');
      
      if (!result) {
        console.error('[Test Email] Email sending failed');
        
        // Look for SendGrid errors in the console output to provide more specific guidance
        try {
          const lastError = (global as any).lastSendGridError;
          const isSenderIdentityError = lastError && 
                                      lastError.includes('from address does not match a verified Sender Identity');
          
          if (isSenderIdentityError) {
            return res.status(403).json({ 
              error: 'SendGrid Sender Identity Error', 
              message: 'The sender email address is not verified in your SendGrid account. Please verify the email in SendGrid Sender Authentication settings.',
              details: lastError
            });
          }
        } catch (error) {
          console.error('[Test Email] Error checking sender identity error:', error);
          // Continue with generic error if we can't check the error details
        }
        
        return res.status(500).json({ error: 'Failed to send test email' });
      }
      
      console.log('[Test Email] Email sent successfully');
      return res.json({ success: true, message: 'Test email sent successfully' });
    } catch (error) {
      console.error('[Test Email] Error sending test email:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      return res.status(500).json({ 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}