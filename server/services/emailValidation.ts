import dns from 'dns';
import { promisify } from 'util';
import { 
  bulkValidateEmails, 
  validateAndCleanEmail, 
  EmailValidationResult,
  isDisposableEmail
} from "../../shared/validation";
import { getStorage } from "../storageManager";
import { eq } from "drizzle-orm";
import { contacts } from "../../shared/schema";

// Make DNS lookups async
const resolveMx = promisify(dns.resolveMx);

export interface EmailValidationServiceResult {
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  totalProcessed: number;
  validEmails: string[];
  invalidEmails: {email: string, reason: string}[];
  duplicateEmails: string[];
}

export interface EmailHealthResult {
  isValid: boolean;
  hasMxRecords: boolean;
  isDisposable: boolean;
  isDuplicate: boolean;
  hasSyntaxErrors: boolean;
  suggestedFix?: string;
  details: string;
}

/**
 * Service for email validation with additional database checks
 */
export class EmailValidationService {
  /**
   * Checks if a domain has valid MX records
   */
  static async checkDomainMxRecords(domain: string): Promise<boolean> {
    try {
      const records = await resolveMx(domain);
      return records && records.length > 0;
    } catch (error) {
      console.log(`MX record check failed for domain ${domain}:`, error);
      return false;
    }
  }
  
  /**
   * Checks for common typos in email domains and suggests corrections
   */
  static checkForTypos(email: string): { hasTypos: boolean, suggestion?: string } {
    const commonTypos: { [key: string]: string } = {
      'gmial.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'gmail.cm': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'ymail.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'hotmail.co': 'hotmail.com',
      'outloo.com': 'outlook.com',
      'outlok.com': 'outlook.com'
    };

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return { hasTypos: false };
    
    // Check for exact match in common typos
    if (domain in commonTypos) {
      const correctedEmail = email.replace(domain, commonTypos[domain]);
      return { hasTypos: true, suggestion: correctedEmail };
    }
    
    // Check for close matches using Levenshtein distance (simplified)
    // This could be enhanced with a full Levenshtein implementation
    for (const [typo, correction] of Object.entries(commonTypos)) {
      if (domain.length > 3 && 
         (typo.includes(domain) || domain.includes(typo)) && 
          Math.abs(domain.length - typo.length) <= 2) {
        const correctedEmail = email.replace(domain, correction);
        return { hasTypos: true, suggestion: correctedEmail };
      }
    }
    
    return { hasTypos: false };
  }

  /**
   * Validates a single email
   */
  static async validateSingleEmail(email: string): Promise<EmailValidationResult> {
    // Basic validation and cleaning
    const validationResult = validateAndCleanEmail(email);
    if (!validationResult.isValid) {
      return validationResult;
    }

    const normalizedEmail = validationResult.normalizedEmail!;
    const domain = normalizedEmail.split('@')[1];
    
    // Check for typos and suggest corrections
    const typoCheck = this.checkForTypos(normalizedEmail);
    if (typoCheck.hasTypos && typoCheck.suggestion) {
      return {
        isValid: false,
        normalizedEmail,
        error: `Possible typo in domain. Did you mean ${typoCheck.suggestion}?`
      };
    }
    
    // Check if domain has MX records (optional, can be removed if performance is a concern)
    try {
      const hasMxRecords = await this.checkDomainMxRecords(domain);
      if (!hasMxRecords) {
        return {
          isValid: false,
          normalizedEmail,
          error: `Domain ${domain} does not have valid MX records, emails cannot be delivered to this address`
        };
      }
    } catch (error) {
      // If MX check fails, we still consider the email valid
      console.error(`MX check failed for ${domain}:`, error);
    }

    // Check if the email already exists in the database
    try {
      const storage = getStorage();
      const existingContact = await storage.getContactByEmail(normalizedEmail);
      if (existingContact) {
        return { 
          isValid: false, 
          normalizedEmail,
          error: "Email already exists in the database" 
        };
      }
    } catch (error) {
      console.error("Database check failed:", error);
      // We still consider the email valid even if the DB check fails
    }

    return validationResult;
  }

  /**
   * Validates a batch of emails with duplicate checking
   */
  static async validateEmailBatch(emails: string[]): Promise<EmailValidationServiceResult> {
    // Initial validation without database checks
    const initialValidation = bulkValidateEmails(emails);
    
    // Check for duplicates within the batch itself
    const emailCounts = new Map<string, number>();
    const duplicateEmails: string[] = [];
    
    initialValidation.validEmails.forEach(email => {
      const count = emailCounts.get(email) || 0;
      emailCounts.set(email, count + 1);
      if (count === 1) { // This is the second occurrence
        duplicateEmails.push(email);
      }
    });
    
    // Filter out duplicates from validEmails
    const uniqueValidEmails = initialValidation.validEmails.filter(
      email => !duplicateEmails.includes(email) || 
              emailCounts.get(email) === 1 // Keep only the first occurrence
    );
    
    // Check for existing emails in the database
    const existingEmails: string[] = [];
    const storage = getStorage();
    
    // We'll batch this in groups of 50 to avoid overloading the database
    const batchSize = 50;
    for (let i = 0; i < uniqueValidEmails.length; i += batchSize) {
      const batch = uniqueValidEmails.slice(i, i + batchSize);
      
      // Check each email in the batch against the database
      const existingBatch = await Promise.all(
        batch.map(async (email) => {
          try {
            const contact = await storage.getContactByEmail(email);
            return contact ? email : null;
          } catch (error) {
            console.error(`Database check failed for ${email}:`, error);
            return null;
          }
        })
      );
      
      // Add existing emails to our list
      existingBatch.forEach(email => {
        if (email) existingEmails.push(email);
      });
    }
    
    // Add existing emails to our duplicates list
    existingEmails.forEach(email => {
      if (!duplicateEmails.includes(email)) {
        duplicateEmails.push(email);
      }
    });
    
    // Final valid emails are those not in duplicates list
    const finalValidEmails = uniqueValidEmails.filter(
      email => !existingEmails.includes(email)
    );
    
    return {
      validCount: finalValidEmails.length,
      invalidCount: initialValidation.invalidEmails.length,
      duplicateCount: duplicateEmails.length,
      totalProcessed: emails.length,
      validEmails: finalValidEmails,
      invalidEmails: initialValidation.invalidEmails,
      duplicateEmails
    };
  }
  
  /**
   * Performs a comprehensive health check on the provided email
   */
  static async checkEmailHealth(email: string): Promise<EmailHealthResult> {
    const result = validateAndCleanEmail(email);
    
    if (!result.isValid) {
      return {
        isValid: false,
        hasMxRecords: false,
        isDisposable: false,
        isDuplicate: false,
        hasSyntaxErrors: true,
        details: result.error || 'Invalid email format'
      };
    }
    
    const normalizedEmail = result.normalizedEmail!;
    const domain = normalizedEmail.split('@')[1];
    
    // Check for disposable email
    const disposable = isDisposableEmail(normalizedEmail);
    
    // Check for duplicate in database
    const storage = getStorage();
    let isDuplicate = false;
    try {
      const existing = await storage.getContactByEmail(normalizedEmail);
      isDuplicate = !!existing;
    } catch (error) {
      console.error(`Database check failed for ${email}:`, error);
    }
    
    // Check for MX records
    let hasMxRecords = false;
    try {
      hasMxRecords = await this.checkDomainMxRecords(domain);
    } catch (error) {
      console.error(`MX check failed for ${domain}:`, error);
    }
    
    // Check for typos
    const typoCheck = this.checkForTypos(normalizedEmail);
    
    // Build the result
    const details = [];
    if (!hasMxRecords) details.push(`Domain ${domain} doesn't have valid MX records`);
    if (disposable) details.push(`${domain} is a disposable email domain`);
    if (isDuplicate) details.push(`Email already exists in the database`);
    if (typoCheck.hasTypos) details.push(`Possible typo in domain - suggested: ${typoCheck.suggestion}`);
    
    return {
      isValid: hasMxRecords && !disposable && !isDuplicate && !typoCheck.hasTypos,
      hasMxRecords,
      isDisposable: disposable,
      isDuplicate,
      hasSyntaxErrors: false,
      suggestedFix: typoCheck.suggestion,
      details: details.join('. ') || 'Email appears to be valid and deliverable'
    };
  }
  
  /**
   * Performs a bulk email analysis for CSV import or list cleaning
   */
  static async analyzeBulkEmails(emails: string[]): Promise<{
    summary: {
      total: number;
      valid: number;
      invalid: number;
      duplicates: number;
      disposable: number;
      syntax: number;
      mxIssues: number;
    };
    validEmails: string[];
    invalidEmails: {email: string, reason: string}[];
    suggestedFixes: {original: string, suggestion: string}[];
  }> {
    const result = await this.validateEmailBatch(emails);
    
    // Additional analysis
    const invalidWithReason = result.invalidEmails;
    const suggestedFixes: {original: string, suggestion: string}[] = [];
    const disposableCount = invalidWithReason.filter(item => 
      item.reason.toLowerCase().includes('disposable')).length;
    const syntaxCount = invalidWithReason.filter(item => 
      item.reason.toLowerCase().includes('format') || 
      item.reason.toLowerCase().includes('syntax')).length;
    
    // Check for possible typos in invalid emails
    emails.forEach(email => {
      const typoCheck = this.checkForTypos(email);
      if (typoCheck.hasTypos && typoCheck.suggestion) {
        suggestedFixes.push({
          original: email,
          suggestion: typoCheck.suggestion
        });
      }
    });
    
    return {
      summary: {
        total: result.totalProcessed,
        valid: result.validCount,
        invalid: result.invalidCount,
        duplicates: result.duplicateCount,
        disposable: disposableCount,
        syntax: syntaxCount,
        mxIssues: 0  // We would need to check MX records for each domain which is expensive
      },
      validEmails: result.validEmails,
      invalidEmails: result.invalidEmails,
      suggestedFixes
    };
  }
}