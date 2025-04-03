import axios from 'axios';
import { 
  IEmailProvider, 
  SendEmailParams, 
  VerifyDomainParams, 
  DomainVerificationResult, 
  AuthenticationRequirement,
  SupportedFeatures
} from './IEmailProvider';

/**
 * SendClean Email Provider Implementation
 */
export class SendCleanProvider implements IEmailProvider {
  private apiKey: string;
  private apiUrl: string = 'https://api.sendclean.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return 'SendClean';
  }

  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/email/send`,
        {
          to: params.to,
          from: params.from,
          subject: params.subject,
          text: params.text,
          html: params.html,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('SendClean email sending error:', error);
      return false;
    }
  }

  async verifyDomainAuthentication(params: VerifyDomainParams): Promise<DomainVerificationResult> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/domains/${params.domain}/verification`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Parse the response based on SendClean's API structure
      const data = response.data;
      
      return {
        domain: params.domain,
        dkimVerified: data?.dkim?.verified || false,
        spfVerified: data?.spf?.verified || false,
        dmarcVerified: data?.dmarc?.verified || false,
        dkimDetails: data?.dkim?.selector ? {
          selector: data.dkim.selector,
          value: data.dkim.value || ''
        } : undefined,
        spfDetails: data?.spf?.value ? {
          value: data.spf.value
        } : undefined,
        dmarcDetails: data?.dmarc?.value ? {
          value: data.dmarc.value
        } : undefined,
        errors: data?.errors || []
      };
    } catch (error) {
      console.error('SendClean domain verification error:', error);
      
      // Return a default result structure with verification failed
      return {
        domain: params.domain,
        dkimVerified: false,
        spfVerified: false,
        dmarcVerified: false,
        errors: ['Could not connect to SendClean API']
      };
    }
  }

  getAuthenticationRequirements(): AuthenticationRequirement[] {
    return [
      {
        name: 'apiKey',
        description: 'SendClean API Key',
        required: true,
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