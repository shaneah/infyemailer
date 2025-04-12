import { IEmailProvider } from './IEmailProvider';
import { SendGridProvider } from './SendGridProvider';
import { MailgunProvider } from './MailgunProvider';
import { AmazonSESProvider } from './AmazonSESProvider';
import { SendCleanProvider } from './SendCleanProvider';
import { SMTPProvider } from './SMTPProvider';

export type EmailProviderType = 'sendgrid' | 'mailgun' | 'amazonses' | 'sendclean' | 'smtp';

/**
 * Factory for creating email provider instances
 */
export class EmailProviderFactory {
  /**
   * Create an email provider instance based on the provider type
   */
  static createProvider(providerType: EmailProviderType, config: Record<string, any>): IEmailProvider {
    switch (providerType) {
      case 'sendgrid':
        if (!config.apiKey) {
          throw new Error('SendGrid API key is required');
        }
        return new SendGridProvider({
          apiKey: config.apiKey,
          fromEmail: config.fromEmail,
          fromName: config.fromName
        });
        
      case 'mailgun':
        if (!config.apiKey || !config.domain) {
          throw new Error('Mailgun API key and domain are required');
        }
        return new MailgunProvider(config.apiKey, config.domain);
        
      case 'amazonses':
        if (!config.accessKey || !config.secretKey) {
          throw new Error('AWS access key and secret key are required');
        }
        return new AmazonSESProvider(
          config.accessKey, 
          config.secretKey, 
          config.region || 'us-east-1'
        );
        
      case 'sendclean':
        if (!config.apiKey) {
          throw new Error('SendClean API key is required');
        }
        return new SendCleanProvider(config.apiKey);
        
      case 'smtp':
        if (!config.host || !config.port || !config.username || !config.password) {
          throw new Error('SMTP host, port, username, and password are required');
        }
                // For SMTP, automatically set secure to true if port is 465
        const port = parseInt(config.port, 10);
        const secure = port === 465 ? true : config.secure === true || config.secure === 'true';
        
        return new SMTPProvider({
          host: config.host,
          port,
          secure,
          username: config.username,
          password: config.password,
          fromEmail: config.fromEmail,
          fromName: config.fromName
        });
        
      default:
        throw new Error(`Unsupported email provider: ${providerType}`);
    }
  }
  
  /**
   * Get a list of all available provider types
   */
  static getAvailableProviders(): { id: EmailProviderType, name: string }[] {
    return [
      { id: 'sendgrid', name: 'SendGrid' },
      { id: 'mailgun', name: 'Mailgun' },
      { id: 'amazonses', name: 'Amazon SES' },
      { id: 'sendclean', name: 'SendClean' },
      { id: 'smtp', name: 'SMTP Server' }
    ];
  }
}