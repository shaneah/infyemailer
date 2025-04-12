import nodemailer from 'nodemailer';
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
 * SMTP Email Provider Implementation
 */
export class SMTPProvider implements IEmailProvider {
  private host: string;
  private port: number;
  private secure: boolean;
  private username: string;
  private password: string;
  private fromEmail: string;
  private fromName: string;
  private transporter: nodemailer.Transporter;

  constructor(config: { 
    host: string; 
    port: number; 
    secure: boolean; 
    username: string; 
    password: string;
    fromEmail?: string;
    fromName?: string;
  }) {
    this.host = config.host;
    this.port = config.port;
    this.secure = config.secure;
    this.username = config.username;
    this.password = config.password;
    this.fromEmail = config.fromEmail || '';
    this.fromName = config.fromName || '';

    // Initialize SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: {
        user: this.username,
        pass: this.password
      }
    });
  }

  getName(): string {
    return 'SMTP';
  }

  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      const mailOptions = {
        from: params.from || this.getFormattedFromAddress(),
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent via SMTP: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending email via SMTP:', error);
      return false;
    }
  }

  async verifyDomainAuthentication(params: VerifyDomainParams): Promise<DomainVerificationResult> {
    // SMTP doesn't have built-in domain verification, but we can check connection
    try {
      await this.transporter.verify();
      
      return {
        domain: params.domain,
        dkimVerified: false,
        spfVerified: false,
        dmarcVerified: false,
        errors: [`For proper email deliverability, manually set up SPF, DKIM, and DMARC records for ${params.domain} at your DNS provider.`]
      };
    } catch (error) {
      console.error('Error verifying SMTP connection:', error);
      return {
        domain: params.domain,
        dkimVerified: false,
        spfVerified: false,
        dmarcVerified: false,
        errors: [`Failed to verify SMTP connection: ${(error as Error).message}`]
      };
    }
  }

  getAuthenticationRequirements(): AuthenticationRequirement[] {
    return [
      {
        name: 'host',
        description: 'SMTP server hostname (e.g., smtp.gmail.com)',
        required: true
      },
      {
        name: 'port',
        description: 'SMTP server port (e.g., 587 for TLS, 465 for SSL)',
        required: true
      },
      {
        name: 'username',
        description: 'SMTP username (usually your email address)',
        required: true
      },
      {
        name: 'password',
        description: 'SMTP password or app password',
        required: true
      },
      {
        name: 'secure',
        description: 'Use secure connection (true for port 465, false for port 587)',
        required: false
      },
      {
        name: 'fromEmail',
        description: 'Default sender email address',
        required: false
      },
      {
        name: 'fromName',
        description: 'Default sender name',
        required: false
      }
    ];
  }

  getSupportedFeatures(): SupportedFeatures {
    return {
      transactionalEmail: true,
      bulkEmail: true,
      templates: false,
      webhooks: false,
      trackOpens: false,
      trackClicks: false,
      customDomains: true,
      dkimSupport: true,
      spfSupport: true,
      dmarcSupport: true,
      apiKey: false,
      oauth: false
    };
  }

  async checkConfiguration(): Promise<ConfigurationCheckResult> {
    try {
      await this.transporter.verify();
      
      return {
        success: true,
        apiConnected: true,
        senderIdentitiesVerified: true,
        details: {
          host: this.host,
          port: this.port,
          secure: this.secure,
          authentication: 'Successfully authenticated'
        }
      };
    } catch (error) {
      return {
        success: false,
        apiConnected: false,
        errors: [(error as Error).message],
        details: {
          host: this.host,
          port: this.port,
          secure: this.secure,
          error: (error as Error).message
        }
      };
    }
  }
  
  private getFormattedFromAddress(): string {
    if (this.fromName && this.fromEmail) {
      return `"${this.fromName}" <${this.fromEmail}>`;
    } else if (this.fromEmail) {
      return this.fromEmail;
    } else {
      return this.username; // fallback to SMTP username
    }
  }
}