import { 
  IEmailProvider, 
  SendEmailParams, 
  VerifyDomainParams, 
  DomainVerificationResult,
  AuthenticationRequirement,
  SupportedFeatures,
  ConfigurationCheckResult
} from './IEmailProvider';

/**
 * Mailgun Email Provider Implementation
 */
export class MailgunProvider implements IEmailProvider {
  private apiKey: string;
  private domain: string;
  
  constructor(apiKey: string, domain: string) {
    this.apiKey = apiKey;
    this.domain = domain;
  }
  
  getName(): string {
    return 'Mailgun';
  }
  
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      // In a real implementation, this would use the mailgun.js package
      // For our demo, we'll simulate the response
      console.log(`[Mailgun] Sending email from ${params.from} to ${params.to} via domain ${this.domain}`);
      
      return true;
    } catch (error) {
      console.error('Mailgun email error:', error);
      return false;
    }
  }
  
  async verifyDomainAuthentication(params: VerifyDomainParams): Promise<DomainVerificationResult> {
    // In a real implementation, this would call Mailgun API to verify domain settings
    return {
      domain: params.domain,
      dkimVerified: true,
      spfVerified: false,
      dmarcVerified: true,
      dkimDetails: {
        selector: params.dkimSelector || 'mx',
        value: params.dkimValue || 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCZ7...'
      },
      spfDetails: {
        value: params.spfValue || 'v=spf1 include:mailgun.org ~all'
      },
      dmarcDetails: {
        value: params.dmarcValue || 'v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@infymailer.com'
      },
      errors: ['SPF record is missing or not configured correctly.']
    };
  }
  
  getAuthenticationRequirements(): AuthenticationRequirement[] {
    return [
      {
        name: 'API Key',
        description: 'Mailgun API key',
        required: true
      },
      {
        name: 'Domain',
        description: 'A verified domain in your Mailgun account',
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
      dmarcSupport: false,
      apiKey: true,
      oauth: false
    };
  }
  
  async checkConfiguration(): Promise<ConfigurationCheckResult> {
    try {
      // Initialize result
      const result: ConfigurationCheckResult = {
        success: false,
        apiConnected: false,
        domainVerified: false,
        senderIdentitiesVerified: false,
        errors: [],
        warnings: [],
        details: {}
      };
      
      // Basic validation
      if (!this.apiKey) {
        result.errors!.push('API key is missing');
        return result;
      }
      
      if (!this.domain) {
        result.errors!.push('Domain is missing');
        return result;
      }
      
      // For a real implementation, this would make an API call to Mailgun
      // For our demo, we'll simulate API connection success
      result.apiConnected = true;
      
      // Check if the domain format is valid
      const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainPattern.test(this.domain)) {
        result.warnings!.push('Domain format appears to be invalid');
      } else {
        result.domainVerified = true;
        result.details!.verifiedDomains = [this.domain];
      }
      
      // In a real implementation, we would check with Mailgun if the domain is verified
      // For now, we'll simulate success
      result.senderIdentitiesVerified = true;
      
      // Set overall success based on critical checks
      result.success = result.apiConnected && result.domainVerified && (result.errors?.length === 0);
      
      return result;
    } catch (error) {
      console.error('[Mailgun] Configuration check error:', error);
      return {
        success: false,
        apiConnected: false,
        errors: [`Unexpected error during configuration check: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }
}