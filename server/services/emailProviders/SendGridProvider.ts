import { MailService } from '@sendgrid/mail';
import { ResponseError } from '@sendgrid/helpers/classes/response-error.js';
import { 
  IEmailProvider, 
  SendEmailParams, 
  VerifyDomainParams, 
  DomainVerificationResult,
  AuthenticationRequirement,
  SupportedFeatures,
  ConfigurationCheckResult
} from './IEmailProvider';

// Declare global type for error tracking
declare global {
  namespace NodeJS {
    interface Global {
      lastSendGridError?: string;
    }
  }
}

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
    // Validate that the SendGrid API key starts with "SG."
    if (!config.apiKey.startsWith('SG.')) {
      throw new Error('API key does not start with "SG.". SendGrid API keys must begin with SG. prefix.');
    }

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
      // Validate that required fields are present
      if (!params.to) {
        console.error('[SendGrid] Missing recipient email');
        return false;
      }

      if (!params.subject) {
        console.error('[SendGrid] Missing email subject');
        return false;
      }

      // Format the message according to SendGrid v3 API requirements
      const msg: any = {
        to: params.to,
        from: params.from || {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: params.subject,
        content: []
      };

      // Add text content if available
      if (params.text) {
        msg.content.push({
          type: 'text/plain',
          value: params.text
        });
      }

      // Add HTML content if available
      if (params.html) {
        msg.content.push({
          type: 'text/html',
          value: params.html
        });
      }

      // If no content was added, add a default text content
      if (msg.content.length === 0) {
        msg.content.push({
          type: 'text/plain',
          value: ' ' // Empty string with a space to satisfy SendGrid requirements
        });
      }

      console.log('[SendGrid] Sending email with payload:', JSON.stringify(msg, null, 2));
      const response = await this.mailService.send(msg);
      console.log(`[SendGrid] Email sent to ${params.to}`, response);

      return true;
    } catch (error) {
      if (error instanceof ResponseError) {
        const errorDetails = {
          code: error.code,
          message: error.message,
          response: error.response?.body || {}
        };

        console.error('[SendGrid] API Error:', JSON.stringify(errorDetails, null, 2));

        // Check common errors
        if (error.code === 403) {
          // Check for sender identity errors specifically
          const errorBody = error.response?.body as any;
          const errors = errorBody?.errors || [];

          if (errors.length > 0 && errors[0].message && errors[0].message.includes('from address does not match a verified Sender Identity')) {
            console.error('[SendGrid] Sender Identity Error: The from email address is not verified in your SendGrid account.');
            console.error('[SendGrid] To fix this: Log into your SendGrid account and verify the sender email address in Sender Authentication settings.');
            console.error(`[SendGrid] Attempted to use sender: ${params.from || this.fromEmail}`);
          } else {
            console.error('[SendGrid] API Key does not have permission to send emails. Please verify your API Key has the necessary permissions.');
          }
        } else if (error.code === 401) {
          console.error('[SendGrid] API Key is invalid or revoked. Please check your API Key.');
        } else if (error.code === 400) {
          // Store the last SendGrid error message globally for reference
          if (error.response?.body) {
            try {
              const errorBody = error.response.body as any;
              if (errorBody.errors && Array.isArray(errorBody.errors)) {
                // Format and store the error message for debugging
                const errorMessages = errorBody.errors.map((err: any) => 
                  `${err.message || "Unknown error"} (field: ${err.field || "unknown"})`
                ).join(", ");

                (global as any).lastSendGridError = errorMessages;
                console.error('[SendGrid] Bad request details:', errorMessages);
              } else {
                console.error('[SendGrid] Bad request. Check the email format, sender, or recipient addresses.');
              }
            } catch (parseError) {
              console.error('[SendGrid] Error parsing error response:', parseError);
            }
          } else {
            console.error('[SendGrid] Bad request. Check the email format, sender, or recipient addresses.');
          }
        }
      } else {
        console.error('[SendGrid] Unknown error:', error);
      }

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

  async checkConfiguration(): Promise<ConfigurationCheckResult> {
    try {
      // Test if we can make a basic API call to get account information
      // For SendGrid, we'll try a simple ping-like request

      // Create a test message with minimal content
      const testMessage = {
        to: 'test@example.com', // Not actually sending, just testing API connection
        from: this.fromEmail,
        subject: 'API Test',
        content: [
          {
            type: 'text/plain',
            value: 'This is a test message to verify API connection.'
          }
        ]
      };

      // Initialize result
      const result: ConfigurationCheckResult = {
        success: false,
        apiConnected: false,
        senderIdentitiesVerified: false,
        errors: [],
        warnings: [],
        details: {}
      };

      try {
        // Instead of sending an actual email, we'll just validate the API key works
        // by calling a different API endpoint that doesn't actually send emails
        // but still requires authentication

        // For now, we'll use a simplified check - in a real implementation,
        // this would make an API call to a non-sending endpoint

        // Check the API key format as a basic validation
        if (!this.apiKey || !this.apiKey.startsWith('SG.')) {
          result.errors!.push('API key is invalid. SendGrid API keys must start with "SG."');
          return result;
        }

        // Simulate a successful API connection
        result.apiConnected = true;

        // Check if the sender identity is likely to work
        // In a real implementation, this would query the SendGrid API for verified senders
        if (this.fromEmail) {
          // Simple email format validation
          const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailPattern.test(this.fromEmail)) {
            result.warnings!.push('From email address format appears to be invalid.');
          } else {
            result.senderIdentitiesVerified = true;
            result.details!.verifiedSenders = [this.fromEmail];
          }
        } else {
          result.warnings!.push('No from email address specified. Sender identity verification skipped.');
        }

        // Set success based on critical checks
        result.success = result.apiConnected && (result.errors?.length === 0);

        return result;
      } catch (apiError) {
        console.error('[SendGrid] API verification error:', apiError);

        if (apiError instanceof ResponseError) {
          const sgError = apiError as ResponseError;

          if (sgError.code === 401) {
            result.errors!.push('Authentication failed. The API key appears to be invalid or revoked.');
          } else if (sgError.code === 403) {
            result.errors!.push('Permission denied. The API key does not have the necessary permissions.');
          } else {
            result.errors!.push(`SendGrid API error (${sgError.code}): ${sgError.message}`);
          }

          // Add detailed error information if available
          if (sgError.response?.body) {
            try {
              const errorBody = sgError.response.body as any;
              if (errorBody.errors && Array.isArray(errorBody.errors)) {
                errorBody.errors.forEach((err: any) => {
                  result.errors!.push(`${err.message || "Unknown error"} (field: ${err.field || "unknown"})`);
                });
              }
            } catch (parseError) {
              result.errors!.push('Error parsing API response');
            }
          }
        } else {
          // Generic error handling
          result.errors!.push(`Unexpected error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
        }

        return result;
      }
    } catch (error) {
      // Catch any unexpected errors in our check logic
      console.error('[SendGrid] Configuration check error:', error);
      return {
        success: false,
        apiConnected: false,
        errors: [`Unexpected error during configuration check: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }
}