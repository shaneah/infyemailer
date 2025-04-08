/**
 * Email Validation Service
 * Provides functionality to validate email addresses individually and in bulk
 */

interface ValidationResult {
  valid: boolean;
  disposable?: boolean;
  typo?: boolean;
  suggestion?: string;
  score?: number;
  reason?: string;
}

interface BulkValidationResult {
  valid: number;
  invalid: number;
  disposable: number;
  typos: number;
  results: {
    [email: string]: ValidationResult;
  };
}

interface BulkAnalysisResult {
  totalEmails: number;
  validEmails: number;
  validRate: number;
  disposableEmails: number;
  disposableRate: number;
  typoEmails: number;
  typoRate: number;
  domainBreakdown: {
    [domain: string]: number;
  };
  qualityScore: number;
  issueBreakdown: {
    [issue: string]: number;
  };
}

interface HealthCheckResult {
  valid: boolean;
  mxRecords: boolean;
  smtp: boolean;
  format: boolean;
  disposable: boolean;
  score: number;
  suggestions?: string[];
}

// Common email domains for typo checking
const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com'
];

// List of known disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'dispostable.com',
  'yopmail.com',
  'sharklasers.com',
  '10minutemail.com',
  'trashmail.com',
  'throwawaymail.com',
  'emailondeck.com',
  'maildrop.cc',
  'getnada.com',
  'mailnesia.com'
];

class EmailValidationService {
  /**
   * Validates a single email address
   * @param email The email address to validate
   * @returns Validation result object
   */
  static async validateSingleEmail(email: string): Promise<ValidationResult> {
    // Perform basic format validation
    const isFormatValid = this.validateEmailFormat(email);
    if (!isFormatValid) {
      return {
        valid: false,
        score: 0,
        reason: 'Invalid email format'
      };
    }

    // Check if disposable
    const isDisposable = this.isDisposableEmail(email);
    
    // Check for typos and get suggestions
    const typoCheck = this.checkForTypos(email);
    
    // Calculate overall score
    let score = 100;
    if (isDisposable) score -= 30;
    if (typoCheck.typo) score -= 10;
    
    return {
      valid: true,
      disposable: isDisposable,
      typo: typoCheck.typo,
      suggestion: typoCheck.suggestion,
      score: score,
      reason: score < 70 ? 'Low quality score' : undefined
    };
  }

  /**
   * Validates a batch of email addresses
   * @param emails Array of email addresses to validate
   * @returns Bulk validation results
   */
  static async validateEmailBatch(emails: string[]): Promise<BulkValidationResult> {
    const results: { [email: string]: ValidationResult } = {};
    let validCount = 0;
    let invalidCount = 0;
    let disposableCount = 0;
    let typoCount = 0;

    // Process each email
    for (const email of emails) {
      const result = await this.validateSingleEmail(email);
      results[email] = result;
      
      if (result.valid) {
        validCount++;
      } else {
        invalidCount++;
      }
      
      if (result.disposable) {
        disposableCount++;
      }
      
      if (result.typo) {
        typoCount++;
      }
    }

    return {
      valid: validCount,
      invalid: invalidCount,
      disposable: disposableCount,
      typos: typoCount,
      results
    };
  }

  /**
   * Performs a comprehensive health check on an email address
   * @param email The email address to check
   * @returns Health check result
   */
  static async checkEmailHealth(email: string): Promise<HealthCheckResult> {
    // Basic format validation
    const isFormatValid = this.validateEmailFormat(email);
    if (!isFormatValid) {
      return {
        valid: false,
        mxRecords: false,
        smtp: false,
        format: false,
        disposable: false,
        score: 0,
        suggestions: ['Fix the email format']
      };
    }

    // Check if disposable
    const isDisposable = this.isDisposableEmail(email);
    
    // In a real implementation, we would check MX records and SMTP here
    // For demo purposes, we'll simulate these checks
    const hasMxRecords = Math.random() > 0.1; // 90% chance of having MX records
    const hasSmtp = Math.random() > 0.15; // 85% chance of having SMTP
    
    // Generate suggestions
    const suggestions: string[] = [];
    if (isDisposable) {
      suggestions.push('Email is from a disposable domain, consider requesting a primary email');
    }
    
    if (!hasMxRecords) {
      suggestions.push('Domain does not have valid MX records');
    }
    
    if (!hasSmtp) {
      suggestions.push('SMTP server not responding, mailbox may not exist');
    }
    
    // Calculate score
    let score = 0;
    if (isFormatValid) score += 20;
    if (hasMxRecords) score += 30;
    if (hasSmtp) score += 30;
    if (!isDisposable) score += 20;
    
    return {
      valid: score >= 70,
      mxRecords: hasMxRecords,
      smtp: hasSmtp,
      format: isFormatValid,
      disposable: isDisposable,
      score,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Analyzes a batch of emails and provides statistics
   * @param emails Array of email addresses to analyze
   * @returns Analysis results with statistics
   */
  static async analyzeBulkEmails(emails: string[]): Promise<BulkAnalysisResult> {
    const totalEmails = emails.length;
    let validCount = 0;
    let disposableCount = 0;
    let typoCount = 0;
    const domainBreakdown: { [domain: string]: number } = {};
    const issueBreakdown: { [issue: string]: number } = {
      'Invalid format': 0,
      'Disposable email': 0,
      'Possible typo': 0
    };

    // Process each email
    for (const email of emails) {
      // Check format
      const isFormatValid = this.validateEmailFormat(email);
      if (!isFormatValid) {
        issueBreakdown['Invalid format']++;
        continue;
      }
      
      validCount++;
      
      // Get domain and update breakdown
      const domain = email.split('@')[1].toLowerCase();
      domainBreakdown[domain] = (domainBreakdown[domain] || 0) + 1;
      
      // Check if disposable
      const isDisposable = this.isDisposableEmail(email);
      if (isDisposable) {
        disposableCount++;
        issueBreakdown['Disposable email']++;
      }
      
      // Check for typos
      const typoCheck = this.checkForTypos(email);
      if (typoCheck.typo) {
        typoCount++;
        issueBreakdown['Possible typo']++;
      }
    }

    // Calculate rates
    const validRate = totalEmails > 0 ? Math.round((validCount / totalEmails) * 100) : 0;
    const disposableRate = totalEmails > 0 ? Math.round((disposableCount / totalEmails) * 100) : 0;
    const typoRate = totalEmails > 0 ? Math.round((typoCount / totalEmails) * 100) : 0;
    
    // Calculate quality score
    const qualityScore = Math.max(0, Math.min(100, 
      Math.round(100 - (disposableRate) - (typoRate / 2) - ((totalEmails - validCount) / totalEmails * 100))
    ));

    return {
      totalEmails,
      validEmails: validCount,
      validRate,
      disposableEmails: disposableCount,
      disposableRate,
      typoEmails: typoCount,
      typoRate,
      domainBreakdown,
      qualityScore,
      issueBreakdown
    };
  }

  /**
   * Checks an email for possible typos in the domain
   * @param email The email address to check
   * @returns Object with typo status and suggested correction
   */
  static checkForTypos(email: string): { typo: boolean; suggestion?: string } {
    // Basic validation check first
    if (!this.validateEmailFormat(email)) {
      return { typo: false };
    }
    
    const [username, domain] = email.split('@');
    const lowerDomain = domain.toLowerCase();
    
    // No need to check for typos if it's already a known domain
    if (COMMON_EMAIL_DOMAINS.includes(lowerDomain)) {
      return { typo: false };
    }
    
    // Check for common typos in popular domains
    for (const commonDomain of COMMON_EMAIL_DOMAINS) {
      // Check for single character differences (typos)
      if (this.levenshteinDistance(lowerDomain, commonDomain) <= 2) {
        return {
          typo: true,
          suggestion: `${username}@${commonDomain}`
        };
      }
      
      // Check for missing dots (gmailcom instead of gmail.com)
      if (lowerDomain.replace(/\./g, '') === commonDomain.replace(/\./g, '')) {
        return {
          typo: true,
          suggestion: `${username}@${commonDomain}`
        };
      }
      
      // Check for common extensions typos (.con instead of .com)
      if (lowerDomain.replace(/\.(con|coim|cmo|om|ne|nett)$/, '.com') === commonDomain ||
          lowerDomain.replace(/\.(ogr|rg)$/, '.org') === commonDomain) {
        return {
          typo: true,
          suggestion: `${username}@${commonDomain}`
        };
      }
    }
    
    return { typo: false };
  }

  /**
   * Validates the format of an email address
   * @param email The email address to validate
   * @returns Boolean indicating if the format is valid
   */
  private static validateEmailFormat(email: string): boolean {
    // Basic email regex pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Checks if an email is from a known disposable domain
   * @param email The email address to check
   * @returns Boolean indicating if the email is disposable
   */
  private static isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1].toLowerCase();
    return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
  }

  /**
   * Calculates the Levenshtein distance between two strings
   * Used for typo detection
   */
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    return matrix[b.length][a.length];
  }
}

export default EmailValidationService;