/**
 * Parameters for sending an email
 */
export interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Parameters for domain verification
 */
export interface VerifyDomainParams {
  domain: string;
  dkimSelector?: string;
  dkimValue?: string;
  spfValue?: string;
  dmarcValue?: string;
}

/**
 * Result of domain verification
 */
export interface DomainVerificationResult {
  domain: string;
  dkimVerified: boolean;
  spfVerified: boolean;
  dmarcVerified: boolean;
  dkimDetails?: {
    selector: string;
    value: string;
  };
  spfDetails?: {
    value: string;
  };
  dmarcDetails?: {
    value: string;
  };
  errors?: string[];
}

/**
 * Authentication requirement for an email provider
 */
export interface AuthenticationRequirement {
  name: string;
  description: string;
  required: boolean;
}

/**
 * Features supported by an email provider
 */
export interface SupportedFeatures {
  transactionalEmail: boolean;
  bulkEmail: boolean;
  templates: boolean;
  webhooks: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
  customDomains: boolean;
  dkimSupport: boolean;
  spfSupport: boolean;
  dmarcSupport: boolean;
  apiKey: boolean;
  oauth: boolean;
}

/**
 * Interface for email provider implementations
 */
export interface IEmailProvider {
  /**
   * Get the provider name
   */
  getName(): string;
  
  /**
   * Send an email
   */
  sendEmail(params: SendEmailParams): Promise<boolean>;
  
  /**
   * Verify domain authentication
   */
  verifyDomainAuthentication(params: VerifyDomainParams): Promise<DomainVerificationResult>;
  
  /**
   * Get the provider's authentication requirements
   */
  getAuthenticationRequirements(): AuthenticationRequirement[];
  
  /**
   * Get the features supported by this provider
   */
  getSupportedFeatures(): SupportedFeatures;
}