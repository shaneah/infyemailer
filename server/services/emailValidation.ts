import { 
  bulkValidateEmails, 
  validateAndCleanEmail, 
  EmailValidationResult 
} from "../../shared/validation";
import { dbStorage } from "../dbStorage";
import { eq } from "drizzle-orm";
import { contacts } from "../../shared/schema";

export interface EmailValidationServiceResult {
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  totalProcessed: number;
  validEmails: string[];
  invalidEmails: {email: string, reason: string}[];
  duplicateEmails: string[];
}

/**
 * Service for email validation with additional database checks
 */
export class EmailValidationService {
  /**
   * Validates a single email
   */
  static async validateSingleEmail(email: string): Promise<EmailValidationResult> {
    // Basic validation and cleaning
    const validationResult = validateAndCleanEmail(email);
    if (!validationResult.isValid) {
      return validationResult;
    }

    // Check if the email already exists in the database
    const normalizedEmail = validationResult.normalizedEmail!;
    try {
      const existingContact = await dbStorage.getContactByEmail(normalizedEmail);
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
    
    // We'll batch this in groups of 50 to avoid overloading the database
    const batchSize = 50;
    for (let i = 0; i < uniqueValidEmails.length; i += batchSize) {
      const batch = uniqueValidEmails.slice(i, i + batchSize);
      
      // Check each email in the batch against the database
      const existingBatch = await Promise.all(
        batch.map(async (email) => {
          try {
            const contact = await dbStorage.getContactByEmail(email);
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
   * Checks email bounces and engagement metrics
   * This would typically integrate with your email service provider's API
   */
  static async checkEmailHealth(email: string): Promise<{
    isHealthy: boolean;
    bounceRate: number;
    openRate: number;
    clickRate: number;
    lastEngagement: Date | null;
  }> {
    // This is a placeholder. In a real implementation, you would:
    // 1. Call your ESP's API to get bounce and engagement data
    // 2. Process the results and return health metrics
    
    // For now, we'll return dummy data
    return {
      isHealthy: true,
      bounceRate: 0,
      openRate: 0.8,
      clickRate: 0.3,
      lastEngagement: new Date()
    };
  }
}