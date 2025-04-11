import { MailService } from '@sendgrid/mail';
import { IEmailProvider } from './emailProviders/IEmailProvider';

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export class SendGridService implements IEmailProvider {
  private mailService: MailService;
  private fromEmail: string;
  private fromName: string;

  constructor(config: SendGridConfig) {
    this.mailService = new MailService();
    this.mailService.setApiKey(config.apiKey);
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
  }

  async sendEmail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
    attachments?: Array<{
      content: string;
      filename: string;
      type: string;
      disposition: 'attachment' | 'inline';
      contentId?: string;
    }>;
  }): Promise<{ success: boolean; messageId?: string; error?: any }> {
    try {
      const msg = {
        to: options.to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: options.subject,
        text: options.text || '',
        html: options.html || '',
        ...(options.replyTo && { replyTo: options.replyTo }),
        ...(options.attachments && { attachments: options.attachments }),
      };

      const response = await this.mailService.send(msg);
      const [firstResponse] = Array.isArray(response) ? response : [response];
      
      return {
        success: true,
        messageId: firstResponse?.headers['x-message-id'],
      };
    } catch (error) {
      console.error('SendGrid Error:', error);
      return {
        success: false,
        error: error,
      };
    }
  }

  async sendBulkEmails(options: {
    to: Array<{ email: string; name?: string; substitutions?: Record<string, string> }>;
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
    attachments?: Array<{
      content: string;
      filename: string;
      type: string;
      disposition: 'attachment' | 'inline';
      contentId?: string;
    }>;
  }): Promise<{ success: boolean; messageId?: string; error?: any }> {
    try {
      // For SendGrid, we can use its personalization feature
      const personalizations = options.to.map(recipient => ({
        to: [{ email: recipient.email, name: recipient.name || '' }],
        substitutions: recipient.substitutions || {},
      }));

      const msg = {
        personalizations,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: options.subject,
        text: options.text || '',
        html: options.html || '',
        ...(options.replyTo && { replyTo: options.replyTo }),
        ...(options.attachments && { attachments: options.attachments }),
      };

      const response = await this.mailService.send(msg as any);
      
      return {
        success: true,
        messageId: 'bulk-send',
      };
    } catch (error) {
      console.error('SendGrid Bulk Email Error:', error);
      return {
        success: false,
        error: error,
      };
    }
  }

  async verifyConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      // Send a test email to verify configuration
      const testResult = await this.sendEmail({
        to: this.fromEmail, // Send to self for testing
        subject: 'SendGrid Configuration Test',
        text: 'If you receive this email, your SendGrid configuration is working correctly.',
        html: '<p>If you receive this email, your SendGrid configuration is working correctly.</p>',
      });

      if (testResult.success) {
        return {
          success: true,
          message: 'SendGrid configuration verified successfully.',
        };
      } else {
        return {
          success: false,
          message: `SendGrid configuration verification failed: ${testResult.error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `SendGrid configuration verification failed: ${error}`,
      };
    }
  }

  getProviderName(): string {
    return 'SendGrid';
  }

  getRequiredConfigFields(): Array<{ name: string; type: string; description: string }> {
    return [
      {
        name: 'apiKey',
        type: 'string',
        description: 'API Key from SendGrid',
      },
      {
        name: 'fromEmail',
        type: 'string',
        description: 'Email address to send from (must be verified in SendGrid)',
      },
      {
        name: 'fromName',
        type: 'string',
        description: 'Name to display as the sender',
      },
    ];
  }
}

// Factory function to create a SendGrid service instance
export function createSendGridService(config: SendGridConfig): SendGridService {
  return new SendGridService(config);
}