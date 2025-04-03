// Email validation patterns and utilities
import { z } from "zod";

// Basic regex pattern that catches most invalid emails
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// More comprehensive regex pattern for strict validation
export const strictEmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Common disposable email domains to filter out
export const disposableEmailDomains = [
  "10minutemail.com", "temp-mail.org", "guerrillamail.com", "mailinator.com", 
  "tempmail.com", "fakeinbox.com", "getnada.com", "sharklasers.com", 
  "trashmail.com", "yopmail.com", "tempmail.net", "dispostable.com",
  "maildrop.cc", "mailnesia.com", "mohmal.com", "tempail.com"
];

// Zod schema for email validation
export const emailSchema = z.string()
  .email("Invalid email format")
  .refine(email => {
    const domain = email.split('@')[1];
    return !disposableEmailDomains.includes(domain);
  }, { message: "Disposable email addresses are not allowed" });

// Email validation and cleaning functions
export interface EmailValidationResult {
  isValid: boolean;
  normalizedEmail?: string;
  error?: string;
}

/**
 * Normalizes an email address by trimming whitespace and converting to lowercase
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Checks if an email is from a disposable domain
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return disposableEmailDomains.includes(domain);
}

/**
 * Performs basic validation of an email address
 */
export function isValidEmail(email: string): boolean {
  return emailRegex.test(normalizeEmail(email));
}

/**
 * Performs strict validation of an email address
 */
export function isStrictValidEmail(email: string): boolean {
  return strictEmailRegex.test(normalizeEmail(email));
}

/**
 * Validates and cleans an email address
 */
export function validateAndCleanEmail(rawEmail: string): EmailValidationResult {
  if (!rawEmail || rawEmail.trim() === '') {
    return { isValid: false, error: "Email cannot be empty" };
  }

  const normalizedEmail = normalizeEmail(rawEmail);
  
  if (!isValidEmail(normalizedEmail)) {
    return { isValid: false, error: "Invalid email format" };
  }
  
  if (isDisposableEmail(normalizedEmail)) {
    return { isValid: false, error: "Disposable email addresses are not allowed" };
  }

  return { isValid: true, normalizedEmail };
}

/**
 * Bulk validates and cleans a list of email addresses
 * Returns an array of valid, normalized emails and a count of invalid emails
 */
export function bulkValidateEmails(emails: string[]): { 
  validEmails: string[]; 
  invalidEmails: {email: string, reason: string}[];
  validCount: number;
  invalidCount: number;
} {
  const validEmails: string[] = [];
  const invalidEmails: {email: string, reason: string}[] = [];

  emails.forEach(email => {
    const result = validateAndCleanEmail(email);
    if (result.isValid && result.normalizedEmail) {
      validEmails.push(result.normalizedEmail);
    } else {
      invalidEmails.push({
        email: email.trim(),
        reason: result.error || "Unknown validation error"
      });
    }
  });

  return {
    validEmails,
    invalidEmails,
    validCount: validEmails.length,
    invalidCount: invalidEmails.length
  };
}