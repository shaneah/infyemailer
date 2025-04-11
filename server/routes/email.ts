import { Request, Response } from 'express';
import { z } from 'zod';
import { emailService } from '../services/EmailService';
import { providerSettingsService } from '../services/ProviderSettingsService';
import { dbStorage as storage } from '../dbStorage';
import { campaigns, lists, contacts } from '@shared/schema';

// Email validation schema
const sendEmailSchema = z.object({
  from: z.string().email(),
  to: z.string().email(),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  providerName: z.string().optional()
});

type EmailMetadata = {
  provider?: string;
  requestedAt?: string;
  sentAt?: string;
  error?: string;
  resent?: boolean;
  resentAt?: string;
  [key: string]: any;
};

// Direct send email endpoint
export function registerEmailRoutes(app: any) {
  // Send an email using the configured provider
  app.post('/api/email/send', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validationResult = sendEmailSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        });
      }
      
      const emailData = validationResult.data;
      
      // Record the email in the database first
      const emailRecord = await storage.createEmail({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        content: emailData.html || emailData.text || '',
        status: 'sending',
        metadata: {
          provider: emailData.providerName || 'default',
          requestedAt: new Date().toISOString()
        }
      });
      
      // Send the email
      const success = await emailService.sendEmail({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html
      }, emailData.providerName);
      
      // Update the email record with the result
      const metadata = emailRecord.metadata as EmailMetadata || {};
      await storage.updateEmail(emailRecord.id, {
        status: success ? 'sent' : 'failed',
        sentAt: success ? new Date() : undefined,
        metadata: {
          ...metadata,
          sentAt: success ? new Date().toISOString() : undefined,
          error: success ? undefined : 'Failed to send email'
        }
      });
      
      if (success) {
        return res.status(200).json({ 
          success: true, 
          message: 'Email sent successfully',
          emailId: emailRecord.id
        });
      } else {
        return res.status(500).json({ 
          error: 'Failed to send email', 
          emailId: emailRecord.id
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  });
  
  // Get all sent emails
  app.get('/api/email/history', async (req: Request, res: Response) => {
    try {
      const emails = await storage.getEmails();
      
      // Map emails to a more useful format
      const emailHistory = emails.map(email => {
        const metadata = email.metadata as EmailMetadata || {};
        return {
          id: email.id,
          subject: email.subject,
          from: email.from,
          to: email.to,
          status: email.status,
          sentAt: email.sentAt,
          provider: metadata.provider || 'unknown'
        };
      });
      
      return res.status(200).json(emailHistory);
    } catch (error) {
      console.error('Error getting email history:', error);
      return res.status(500).json({ error: 'Failed to get email history' });
    }
  });
  
  // Get a specific email
  app.get('/api/email/:id', async (req: Request, res: Response) => {
    try {
      const emailId = parseInt(req.params.id, 10);
      const email = await storage.getEmail(emailId);
      
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      return res.status(200).json(email);
    } catch (error) {
      console.error('Error getting email:', error);
      return res.status(500).json({ error: 'Failed to get email' });
    }
  });
  
  // Resend a failed email
  app.post('/api/email/:id/resend', async (req: Request, res: Response) => {
    try {
      const emailId = parseInt(req.params.id, 10);
      const email = await storage.getEmail(emailId);
      
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      if (email.status === 'sent') {
        return res.status(400).json({ error: 'Email already sent' });
      }
      
      const metadata = email.metadata as EmailMetadata || {};
      
      // Send the email
      const success = await emailService.sendEmail({
        from: email.from,
        to: email.to,
        subject: email.subject,
        text: email.content,
        html: email.content.startsWith('<') ? email.content : undefined
      }, metadata.provider);
      
      // Update the email record with the result
      await storage.updateEmail(email.id, {
        status: success ? 'sent' : 'failed',
        sentAt: success ? new Date() : undefined,
        metadata: {
          ...metadata,
          resent: true,
          resentAt: new Date().toISOString(),
          sentAt: success ? new Date().toISOString() : undefined,
          error: success ? undefined : 'Failed to resend email'
        }
      });
      
      if (success) {
        return res.status(200).json({ 
          success: true, 
          message: 'Email resent successfully'
        });
      } else {
        return res.status(500).json({ error: 'Failed to resend email' });
      }
    } catch (error) {
      console.error('Error resending email:', error);
      return res.status(500).json({ error: 'Failed to resend email' });
    }
  });
  
  // Test API with SendPulse 
  app.post('/api/email/test-sendpulse', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const schema = z.object({
        userId: z.string().min(1),
        secret: z.string().min(1),
        from: z.string().email(),
        to: z.string().email(),
        subject: z.string().min(1),
        text: z.string().optional(),
        html: z.string().optional()
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        });
      }
      
      const { userId, secret, ...emailData } = validationResult.data;
      
      // Register a temporary SendPulse provider
      const tempProviderName = `SendPulse-Test-${Date.now()}`;
      
      const provider = emailService.registerProviderWithFactory(
        tempProviderName,
        'sendpulse',
        { userId, secret }
      );
      
      // Send the test email
      const success = await emailService.sendEmail(emailData, tempProviderName);
      
      if (success) {
        return res.status(200).json({ 
          success: true, 
          message: 'Test email sent successfully using SendPulse'
        });
      } else {
        return res.status(500).json({ error: 'Failed to send test email with SendPulse' });
      }
    } catch (error) {
      console.error('Error testing SendPulse:', error);
      return res.status(500).json({ 
        error: 'Failed to send test email with SendPulse',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Send a campaign to all recipients in specified lists
  app.post('/api/email/send-campaign', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const schema = z.object({
        campaignId: z.number().int().positive(),
        listIds: z.array(z.number().int().positive()).optional(),
        providerName: z.string().optional(),
        testMode: z.boolean().optional().default(false),
        testEmails: z.array(z.string().email()).optional()
      });
      
      const validationResult = schema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: validationResult.error.errors 
        });
      }
      
      const { campaignId, listIds, providerName, testMode, testEmails } = validationResult.data;
      
      // Fetch the campaign
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      // If in test mode, send to test emails only
      if (testMode) {
        if (!testEmails || testEmails.length === 0) {
          return res.status(400).json({ error: 'Test emails are required in test mode' });
        }
        
        const results = [];
        for (const testEmail of testEmails) {
          // Record the email in the database
          const emailRecord = await storage.createEmail({
            from: campaign.senderName ? `${campaign.senderName} <${campaign.replyToEmail}>` : campaign.replyToEmail,
            to: testEmail,
            subject: campaign.subject,
            content: campaign.content || '',
            status: 'sending',
            metadata: {
              provider: providerName || 'default',
              requestedAt: new Date().toISOString(),
              campaignId: campaign.id,
              isTest: true
            }
          });
          
          // Send the email
          const success = await emailService.sendEmail({
            from: campaign.senderName ? `${campaign.senderName} <${campaign.replyToEmail}>` : campaign.replyToEmail,
            to: testEmail,
            subject: campaign.subject,
            html: campaign.content || ''
          }, providerName);
          
          // Update the email record with the result
          const metadata = emailRecord.metadata as EmailMetadata || {};
          await storage.updateEmail(emailRecord.id, {
            status: success ? 'sent' : 'failed',
            sentAt: success ? new Date() : undefined,
            metadata: {
              ...metadata,
              sentAt: success ? new Date().toISOString() : undefined,
              error: success ? undefined : 'Failed to send test email'
            }
          });
          
          results.push({
            email: testEmail,
            success
          });
        }
        
        return res.status(200).json({
          success: results.every(r => r.success),
          message: 'Test campaign emails processed',
          results
        });
      } else {
        // For a real campaign, get all contacts from the lists
        let contactsToSend: any[] = [];
        
        if (listIds && listIds.length > 0) {
          // Get contacts from specified lists
          for (const listId of listIds) {
            const listContacts = await storage.getContactsByList(listId);
            contactsToSend = [...contactsToSend, ...listContacts];
          }
        } else {
          // If no lists specified, get all contacts
          contactsToSend = await storage.getContacts();
        }
        
        // Remove duplicates (if a contact is in multiple lists)
        const uniqueContacts = contactsToSend.filter((contact, index, self) =>
          index === self.findIndex((c) => c.id === contact.id)
        );
        
        if (uniqueContacts.length === 0) {
          return res.status(400).json({ error: 'No recipients found for the campaign' });
        }
        
        // Update campaign status
        await storage.updateCampaign(campaignId, {
          status: 'sending',
          metadata: {
            ...(campaign.metadata || {}),
            sendStarted: new Date().toISOString(),
            totalRecipients: uniqueContacts.length
          }
        });
        
        // Track success/failure counts
        let successCount = 0;
        let failureCount = 0;
        
        // Send to each contact
        for (const contact of uniqueContacts) {
          try {
            // Record the email in the database
            const emailRecord = await storage.createEmail({
              from: campaign.senderName ? `${campaign.senderName} <${campaign.replyToEmail}>` : campaign.replyToEmail,
              to: contact.email,
              subject: campaign.subject,
              content: campaign.content || '',
              status: 'sending',
              metadata: {
                provider: providerName || 'default',
                requestedAt: new Date().toISOString(),
                campaignId: campaign.id,
                contactId: contact.id
              }
            });
            
            // Send the email
            const success = await emailService.sendEmail({
              from: campaign.senderName ? `${campaign.senderName} <${campaign.replyToEmail}>` : campaign.replyToEmail,
              to: contact.email,
              subject: campaign.subject,
              html: campaign.content || ''
            }, providerName);
            
            // Update the email record with the result
            const metadata = emailRecord.metadata as EmailMetadata || {};
            await storage.updateEmail(emailRecord.id, {
              status: success ? 'sent' : 'failed',
              sentAt: success ? new Date() : undefined,
              metadata: {
                ...metadata,
                sentAt: success ? new Date().toISOString() : undefined,
                error: success ? undefined : 'Failed to send email'
              }
            });
            
            if (success) {
              successCount++;
            } else {
              failureCount++;
            }
          } catch (error) {
            console.error(`Error sending to ${contact.email}:`, error);
            failureCount++;
          }
        }
        
        // Update campaign status and sent date
        await storage.updateCampaign(campaignId, {
          status: 'sent',
          sentAt: new Date(),
          metadata: {
            ...(campaign.metadata || {}),
            sendCompleted: new Date().toISOString(),
            totalSent: successCount,
            totalFailed: failureCount
          }
        });
        
        // Create analytics entry
        await storage.recordAnalytic({
          campaignId,
          opens: 0,
          clicks: 0,
          bounces: 0,
          unsubscribes: 0,
          metadata: {
            recipients: uniqueContacts.length,
            successCount,
            failureCount
          }
        });
        
        return res.status(200).json({
          success: true,
          message: 'Campaign sent',
          stats: {
            totalRecipients: uniqueContacts.length,
            successful: successCount,
            failed: failureCount
          }
        });
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      return res.status(500).json({
        error: 'Failed to send campaign',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}