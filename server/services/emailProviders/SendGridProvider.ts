import { 
  IEmailProvider, 
  SendEmailParams, 
  VerifyDomainParams, 
  DomainVerificationResult,
  AuthenticationRequirement,
  SupportedFeatures
} from './IEmailProvider';
import sgMail from '@sendgrid/mail';

/**
 * SendGrid Email Provider Implementation
 */
export class SendGridProvider implements IEmailProvider {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    sgMail.setApiKey(apiKey);
  }
  
  getName(): string {
    return 'SendGrid';
  }
  
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      console.log(`[SendGrid] Sending email from ${params.from} to ${params.to}`);
      
      const msg = {
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text || '',
        html: params.html || '',
      };
      
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }
  
  async verifyDomainAuthentication(params: VerifyDomainParams): Promise<DomainVerificationResult> {
    // In a real implementation, this would call SendGrid API to verify domain settings
    return {
      domain: params.domain,
      dkimVerified: true,
      spfVerified: true,
      dmarcVerified: false,
      dkimDetails: {
        selector: params.dkimSelector || 'sendgrid',
        value: params.dkimValue || 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDARW...'
      },
      spfDetails: {
        value: params.spfValue || 'v=spf1 include:sendgrid.net ~all'
      },
      dmarcDetails: {
        value: params.dmarcValue || 'v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@infymailer.com'
      },
      errors: ['DMARC record is missing or not configured correctly.']
    };
  }
  
  getAuthenticationRequirements(): AuthenticationRequirement[] {
    return [
      {
        name: 'API Key',
        description: 'SendGrid API key with full access or restricted to Mail Send permissions',
        required: true
      },
      {
        name: 'Sender Authentication',
        description: 'SendGrid requires verification of sender identities',
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