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

    // Initialize SMTP transporter with more flexible options
    this.transporter = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.secure, // true for 465, false for other ports
      auth: {
        user: this.username,
        pass: this.password
      },
      // Add better timeout handling
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,   // 10 seconds
      socketTimeout: 15000,     // 15 seconds
      // Ignore TLS problems for testing
      tls: {
        rejectUnauthorized: false // allows self-signed certificates
      },
      debug: true // Enable debugging
    });
  }

  getName(): string {
    return 'SMTP';
  }

  async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      // Log connection information for debugging
      console.log(`Attempting to send email via SMTP:
        Host: ${this.host}
        Port: ${this.port}
        Secure: ${this.secure}
        Username: ${this.username}
        From Email: ${params.from || this.getFormattedFromAddress()}
        To: ${params.to}
      `);
      
      const mailOptions = {
        from: params.from || this.getFormattedFromAddress(),
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html
      };

      // Test the SMTP connection before attempting to send
      try {
        const verifyResult = await this.transporter.verify();
        console.log('SMTP connection verified:', verifyResult);
      } catch (verifyError) {
        console.error('Failed to verify SMTP connection before sending:', verifyError);
        // Continue with send attempt anyway
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent via SMTP: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending email via SMTP:', error);
      throw new Error(`Failed to send email via SMTP: ${(error as Error).message}`);
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
      // Log connection information for debugging
      console.log(`Checking SMTP configuration:
        Host: ${this.host}
        Port: ${this.port}
        Secure: ${this.secure}
        Username: ${this.username}
        From Email: ${this.fromEmail || '(not set)'}
      `);
      
      // Try to verify the connection with a 15-second timeout
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000);
      });
      
      // Race the verification against the timeout
      await Promise.race([verifyPromise, timeoutPromise]);
      
      return {
        success: true,
        apiConnected: true,
        senderIdentitiesVerified: true,
        details: {
          host: this.host,
          port: this.port,
          secure: this.secure,
          username: this.username,
          authentication: 'Successfully authenticated',
          notes: [
            'Connection successful',
            `Using ${this.secure ? 'secure' : 'insecure'} connection`,
            'For proper email deliverability, ensure your SMTP server supports STARTTLS'
          ]
        }
      };
    } catch (error) {
      console.error('SMTP configuration check failed:', error);
      
      // Provide helpful troubleshooting tips based on error code
      const errorMessage = (error as Error).message;
      const errorCode = (error as any).code || '';
      const troubleshootingTips = [];
      
      if (errorCode === 'ECONNREFUSED') {
        troubleshootingTips.push(
          'Connection refused. Check that the host and port are correct.',
          'Ensure that your SMTP server allows connections from external IP addresses.',
          'Check if a firewall is blocking outbound connections on this port.'
        );
      } else if (errorCode === 'ETIMEDOUT') {
        troubleshootingTips.push(
          'Connection timed out. The server did not respond in time.',
          'Try using a different port (587 for TLS, 465 for SSL).',
          'Check if your SMTP server is operational and accessible.'
        );
      } else if (errorCode === 'EAUTH') {
        troubleshootingTips.push(
          'Authentication failed. Check your username and password.',
          'Some providers require an app-specific password instead of your account password.',
          'Ensure that SMTP access is enabled for your email account.'
        );
      } else {
        troubleshootingTips.push(
          'Check that the host and port are correct.',
          'For Gmail and many providers, you may need to enable "Less secure apps" or create an app password.',
          'Try changing the secure setting based on your port (true for 465, false for 587).'
        );
      }
      
      return {
        success: false,
        apiConnected: false,
        errors: [errorMessage],
        troubleshootingTips,
        details: {
          host: this.host,
          port: this.port,
          secure: this.secure,
          username: this.username,
          errorCode,
          error: errorMessage
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