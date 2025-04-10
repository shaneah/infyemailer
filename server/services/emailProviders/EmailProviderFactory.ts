import { IEmailProvider } from './IEmailProvider';
import { SendGridProvider } from './SendGridProvider';
import { MailgunProvider } from './MailgunProvider';
import { AmazonSESProvider } from './AmazonSESProvider';
import { SendCleanProvider } from './SendCleanProvider';
import { SendPulseProvider } from './SendPulseProvider';

export type EmailProviderType = 'sendgrid' | 'mailgun' | 'amazonses' | 'sendclean' | 'sendpulse';

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
        return new SendGridProvider(config.apiKey);
        
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
        
      case 'sendpulse':
        if (!config.userId || !config.secret) {
          throw new Error('SendPulse user ID and secret are required');
        }
        return new SendPulseProvider(config.userId, config.secret);
        
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
      { id: 'sendpulse', name: 'SendPulse' }
    ];
  }
}