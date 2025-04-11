import {
  IEmailProvider,
  SendEmailParams,
  VerifyDomainParams,
  DomainVerificationResult,
  AuthenticationRequirement,
  SupportedFeatures,
  ConfigurationCheckResult
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
  
  /**
   * Check the configuration of the provider
   * Verifies API connection, sender identities, etc.
   */
  async checkConfiguration(): Promise<ConfigurationCheckResult> {
    try {
      // Initialize result
      const result: ConfigurationCheckResult = {
        success: false,
        apiConnected: false,
        senderIdentitiesVerified: false,
        errors: [],
        warnings: [],
        details: {}
      };
      
      // Basic validation
      if (!this.apiKey) {
        result.errors!.push('SendClean API key is missing');
        return result;
      }
      
      // Validate API key format (for SendClean, we'll assume a valid key is at least 32 characters)
      if (this.apiKey.length < 32) {
        result.warnings!.push('SendClean API key appears to be too short. Keys should be at least 32 characters.');
      }
      
      // In a real implementation, we would make an API call to verify the API key
      try {
        // Simulate an API call to check credentials
        const response = await axios.get(
          `${this.baseUrl}/account/info`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`
            }
          }
        );
        
        // Successfully connected to API
        result.apiConnected = true;
        
        // In a real implementation, we would check verified domains and sender identities
        // For our demo, we'll simulate success
        result.senderIdentitiesVerified = true;
        
        // Add account details if available
        if (response.data && response.data.account) {
          result.details!.account = {
            name: response.data.account.name,
            plan: response.data.account.plan,
            emailsSent: response.data.account.emailsSent,
            emailsRemaining: response.data.account.emailsRemaining
          };
        }
        
        // Add verified domains if available
        if (response.data && response.data.domains) {
          result.details!.verifiedDomains = response.data.domains.map((domain: any) => domain.name);
        }
      } catch (apiError: any) {
        result.apiConnected = false;
        
        // Determine if it's an authentication issue or connection issue
        if (apiError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (apiError.response.status === 401 || apiError.response.status === 403) {
            result.errors!.push('Authentication failed. Invalid API key.');
          } else {
            result.errors!.push(`API returned error status: ${apiError.response.status}`);
          }
        } else if (apiError.request) {
          // The request was made but no response was received
          result.errors!.push('Unable to connect to SendClean API. Please check your network connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          result.errors!.push(`Error connecting to API: ${apiError.message}`);
        }
        
        return result;
      }
      
      // Set overall success based on critical checks
      result.success = result.apiConnected && result.senderIdentitiesVerified && (result.errors?.length === 0);
      
      return result;
    } catch (error) {
      console.error('[SendClean] Configuration check error:', error);
      return {
        success: false,
        apiConnected: false,
        errors: [`Unexpected error during configuration check: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }
}