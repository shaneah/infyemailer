import { 
  IEmailProvider, 
  SendEmailParams, 
  VerifyDomainParams, 
  DomainVerificationResult,
  AuthenticationRequirement,
  SupportedFeatures
} from './IEmailProvider';
import axios from 'axios';

/**
 * SendPulse Email Provider Implementation
 */
export class SendPulseProvider implements IEmailProvider {
  private userId: string;
  private secret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  constructor(userId: string, secret: string) {
    this.userId = userId;
    this.secret = secret;
  }
  
  getName(): string {
    return 'SendPulse';
  }
  
  /**
   * Authenticate with the SendPulse API and get an access token
   */
  private async authenticate(): Promise<string> {
    // Check if we already have a valid token
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && this.tokenExpiry > now) {
      return this.accessToken;
    }
    
    try {
      const response = await axios.post('https://api.sendpulse.com/oauth/access_token', {
        grant_type: 'client_credentials',
        client_id: this.userId,
        client_secret: this.secret
      });
      
      const accessToken = response.data.access_token;
      this.accessToken = accessToken;
      this.tokenExpiry = now + response.data.expires_in;
      
      return accessToken;
    } catch (error) {
      console.error('SendPulse authentication error:', error);
      throw new Error('Failed to authenticate with SendPulse API');
    }
  }
  
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      const token = await this.authenticate();
      
      const email = {
        html: params.html || '',
        text: params.text || '',
        subject: params.subject,
        from: {
          name: params.from.includes('<') ? params.from.split('<')[0].trim() : '',
          email: params.from.includes('<') ? params.from.match(/<(.+)>/)?.[1] || params.from : params.from
        },
        to: [
          {
            name: params.to.includes('<') ? params.to.split('<')[0].trim() : '',
            email: params.to.includes('<') ? params.to.match(/<(.+)>/)?.[1] || params.to : params.to
          }
        ]
      };
      
      const response = await axios.post('https://api.sendpulse.com/smtp/emails', email, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('SendPulse email error:', error);
      return false;
    }
  }
  
  async verifyDomainAuthentication(params: VerifyDomainParams): Promise<DomainVerificationResult> {
    // SendPulse domain verification implementation
    try {
      const token = await this.authenticate();
      
      // For demonstration, we'll return a simulated response
      // In a real implementation, you would call the SendPulse API to verify domain settings
      return {
        domain: params.domain,
        dkimVerified: true,
        spfVerified: true,
        dmarcVerified: false,
        dkimDetails: {
          selector: params.dkimSelector || 'sendpulse',
          value: params.dkimValue || 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDPNZK...'
        },
        spfDetails: {
          value: params.spfValue || 'v=spf1 include:sendpulse.com ~all'
        },
        dmarcDetails: {
          value: params.dmarcValue || 'v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@example.com'
        },
        errors: ['DMARC record is missing or not configured correctly.']
      };
    } catch (error) {
      console.error('SendPulse domain verification error:', error);
      return {
        domain: params.domain,
        dkimVerified: false,
        spfVerified: false,
        dmarcVerified: false,
        errors: ['Failed to verify domain with SendPulse']
      };
    }
  }
  
  getAuthenticationRequirements(): AuthenticationRequirement[] {
    return [
      {
        name: 'User ID',
        description: 'SendPulse API user ID',
        required: true
      },
      {
        name: 'Secret',
        description: 'SendPulse API secret key',
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