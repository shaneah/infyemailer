import { MailService } from '@sendgrid/mail';
import { 
  IEmailProvider, 
  SendEmailParams, 
  VerifyDomainParams, 
  DomainVerificationResult,
  AuthenticationRequirement,
  SupportedFeatures
} from './IEmailProvider';

/**
 * SendGrid Email Provider Implementation
 */
export class SendGridProvider implements IEmailProvider {
  private apiKey: string;
  private mailService: MailService;
  private fromEmail: string;
  private fromName: string;
  
  constructor(config: { 
    apiKey: string;
    fromEmail?: string;
    fromName?: string;
  }) {
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail || 'notifications@infymailer.com';
    this.fromName = config.fromName || 'InfyMailer';
    
    this.mailService = new MailService();
    this.mailService.setApiKey(this.apiKey);
  }
  
  getName(): string {
    return 'SendGrid';
  }
  
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      const msg = {
        to: params.to,
        from: params.from || {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: params.subject,
        text: params.text || '',
        html: params.html || '',
      };

      const response = await this.mailService.send(msg);
      console.log(`[SendGrid] Email sent to ${params.to}`, response);
      
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }
  
  async verifyDomainAuthentication(params: VerifyDomainParams): Promise<DomainVerificationResult> {
    try {
      // This is a simplified version. In production, you would call SendGrid API to verify these records.
      // For now, we'll simulate the verification by checking if the records exist.
      const dkimVerified = !!params.dkimValue;
      const spfVerified = !!params.spfValue;
      const dmarcVerified = !!params.dmarcValue;
      
      return {
        domain: params.domain,
        dkimVerified,
        spfVerified,
        dmarcVerified,
        dkimDetails: params.dkimValue ? {
          selector: params.dkimSelector || 'sendgrid',
          value: params.dkimValue
        } : undefined,
        spfDetails: params.spfValue ? {
          value: params.spfValue
        } : undefined,
        dmarcDetails: params.dmarcValue ? {
          value: params.dmarcValue
        } : undefined,
        errors: !dmarcVerified ? ['DMARC record is missing or not configured correctly.'] : undefined
      };
    } catch (error) {
      console.error('SendGrid domain verification error:', error);
      return {
        domain: params.domain,
        dkimVerified: false,
        spfVerified: false,
        dmarcVerified: false,
        errors: ['An error occurred while verifying domain records.']
      };
    }
  }
  
  getAuthenticationRequirements(): AuthenticationRequirement[] {
    return [
      {
        name: 'API Key',
        description: 'SendGrid API key with full access or restricted to Mail Send permissions',
        required: true
      },
      {
        name: 'From Email',
        description: 'The email address that will be used as the sender',
        required: true
      },
      {
        name: 'From Name',
        description: 'The name that will appear as the sender',
        required: true
      }
    ];
  }
  
  getSupportedFeatures(): SupportedFeatures {
    return {
      transactionalEmail: true,
      bulkEmail: true,
      templates: true,
      webhooks: true,
      trackOpens: true,
      trackClicks: true,
      customDomains: true,
      dkimSupport: true,
      spfSupport: true,
      dmarcSupport: true,
      apiKey: true,
      oauth: false
    };
  }
}