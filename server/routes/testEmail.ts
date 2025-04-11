import { Request, Response } from 'express';
import { z } from 'zod';
import { emailService } from '../services/EmailService';

export async function registerTestEmailRoutes(app: any) {
  // Send a test email directly using SendGrid
  app.post('/api/test-email/sendgrid', async (req: Request, res: Response) => {
    try {
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
      
      // Send the test email using SendGrid
      console.log('[Test Email] Sending email to:', validatedData.to);
      const result = await emailService.sendEmail({
        from: validatedData.from || 'notifications@infymailer.com',
        to: validatedData.to,
        subject: validatedData.subject,
        text: validatedData.text || '',
        html: validatedData.html || validatedData.text || ''
      }, 'SendGrid');
      
      if (!result) {
        console.error('[Test Email] Email sending failed');
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