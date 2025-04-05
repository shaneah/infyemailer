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
 * SendClean API provider implementation
 */
export class SendCleanProvider implements IEmailProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api.sendclean.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get the provider name
   */
  getName(): string {
    return 'SendClean';
  }

  /**
   * Send an email via SendClean API
   */
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      const { from, to, subject, text, html } = params;
      
      const response = await axios.post(
        `${this.baseUrl}/email/send`,
        {
          from,
          to,
          subject,
          text_content: text,
          html_content: html
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.status === 200 && response.data.success === true;
    } catch (error) {
      console.error('SendClean API error:', error);
      return false;
    }
  }

  /**
   * Verify domain authentication settings
   */
  async verifyDomainAuthentication(params: VerifyDomainParams): Promise<DomainVerificationResult> {
    try {
      const { domain, dkimSelector } = params;
      
      // Construct verification payload
      const verificationPayload = {
        domain,
        dkim_selector: dkimSelector || 'default'
      };
      
      // Make API request to verify domain
      const response = await axios.post(
        `${this.baseUrl}/domains/verify`,
        verificationPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      const responseData = response.data;
      
      // Construct verification result
      const result: DomainVerificationResult = {
        domain,
        dkimVerified: responseData.dkim_verified || false,
        spfVerified: responseData.spf_verified || false,
        dmarcVerified: responseData.dmarc_verified || false
      };
      
      // Add detailed info if available
      if (responseData.dkim_record) {
        result.dkimDetails = {
          selector: dkimSelector || 'default',
          value: responseData.dkim_record
        };
      }
      
      if (responseData.spf_record) {
        result.spfDetails = {
          value: responseData.spf_record
        };
      }
      
      if (responseData.dmarc_record) {
        result.dmarcDetails = {
          value: responseData.dmarc_record
        };
      }
      
      // Add any errors if present
      if (responseData.errors && responseData.errors.length > 0) {
        result.errors = responseData.errors;
      }
      
      return result;
    } catch (error) {
      console.error('SendClean domain verification error:', error);
      
      // Return failed verification with error details
      return {
        domain: params.domain,
        dkimVerified: false,
        spfVerified: false,
        dmarcVerified: false,
        errors: [
          error instanceof Error ? error.message : 'Unknown error during domain verification'
        ]
      };
    }
  }

  /**
   * Get authentication requirements for SendClean
   */
  getAuthenticationRequirements(): AuthenticationRequirement[] {
    return [
      {
        name: 'apiKey',
        description: 'SendClean API Key',
        required: true
      }
    ];
  }

  /**
   * Get features supported by SendClean
   */
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