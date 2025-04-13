import fs from 'fs/promises';
import { Email } from '@shared/schema';

/**
 * Service for managing email data persistence.
 * This provides file-based storage for emails
 * when using memory storage mode.
 */
export class EmailPersistenceService {
  /**
   * Save emails to file for persistence
   */
  static async saveEmailsToFile(emails: Map<number, Email>): Promise<void> {
    try {
      // Convert map to array
      const emailsArray = Array.from(emails.values());
      
      // Convert array to JSON
      const jsonData = JSON.stringify(emailsArray, null, 2);
      
      // Save to file
      await fs.writeFile('emails-data.json', jsonData);
      
      console.log(`Saved ${emailsArray.length} emails to file.`);
    } catch (error) {
      console.error('Error saving emails to file:', error);
    }
  }
  
  /**
   * Load emails from file if available
   */
  static async loadEmailsFromFile(): Promise<Map<number, Email>> {
    const emailMap = new Map<number, Email>();
    
    try {
      // Check if file exists
      const fileData = await fs.readFile('emails-data.json', 'utf-8');
      
      // Parse JSON data from file
      const emailsArray = JSON.parse(fileData) as Email[];
      
      // Convert array to map
      emailsArray.forEach(email => {
        // Ensure dates are properly converted back to Date objects
        const emailWithDates: Email = {
          ...email,
          createdAt: email.createdAt ? new Date(email.createdAt) : null,
          sentAt: email.sentAt ? new Date(email.sentAt) : null
        };
        
        emailMap.set(email.id, emailWithDates);
      });
      
      console.log(`Loaded ${emailMap.size} emails from file.`);
    } catch (error) {
      // It's okay if file doesn't exist yet
      console.log('No emails data file found or error loading file. Starting with empty emails.');
    }
    
    return emailMap;
  }
  
  /**
   * Get the highest ID from a map to determine next ID for new items
   */
  static getNextId(map: Map<number, any>): number {
    let maxId = 0;
    
    for (const id of map.keys()) {
      if (id > maxId) {
        maxId = id;
      }
    }
    
    return maxId + 1;
  }
}