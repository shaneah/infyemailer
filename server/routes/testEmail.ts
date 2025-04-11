import { Request, Response } from 'express';
import { z } from 'zod';
import { emailService } from '../services/EmailService';

export async function registerTestEmailRoutes(app: any) {
  // Send a test email directly using SendGrid
  app.post('/api/test-email/sendgrid', async (req: Request, res: Response) => {
    try {
      // First, check if the SendGrid provider is registered
      const allProviders = emailService.getAllProviders();
      const sendGridProvider = allProviders.find(p => p.provider.getName() === 'SendGrid');
      
      if (!sendGridProvider) {
        // Try to register a SendGrid provider if the API key is available
        if (!process.env.SENDGRID_API_KEY) {
          return res.status(400).json({ 
            error: 'SendGrid API key not found', 
            message: 'Please set the SENDGRID_API_KEY environment variable'
          });
        }
        
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
        } catch (error) {
          console.error('Failed to register SendGrid provider:', error);
          return res.status(500).json({ 
            error: 'Failed to register SendGrid provider', 
            details: error instanceof Error ? error.message : String(error)
          });
        }
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
      
      // Send the test email using SendGrid
      const result = await emailService.sendEmail({
        from: validatedData.from || 'notifications@infymailer.com',
        to: validatedData.to,
        subject: validatedData.subject,
        text: validatedData.text || '',
        html: validatedData.html || validatedData.text || ''
      }, 'SendGrid');
      
      if (!result) {
        return res.status(500).json({ error: 'Failed to send test email' });
      }
      
      res.json({ success: true, message: 'Test email sent successfully' });
    } catch (error) {
      console.error('Error sending test email:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}