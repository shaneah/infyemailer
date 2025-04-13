import * as fs from 'fs';
import { Contact } from '@shared/schema';

// Define the file path
const contactsFilePath = 'contacts-data.json';

/**
 * Service for managing contact data persistence.
 * This provides file-based storage for contacts
 * when using memory storage mode.
 */
export class ContactPersistenceService {
  /**
   * Save contacts to file for persistence
   */
  static async saveContactsToFile(contacts: Map<number, Contact>): Promise<void> {
    try {
      const contactsArray = Array.from(contacts.values());
      fs.writeFileSync(
        contactsFilePath, 
        JSON.stringify(contactsArray, null, 2), 
        'utf8'
      );
      console.log(`Saved ${contactsArray.length} contacts to file`);
    } catch (error) {
      console.error('Failed to save contacts to file:', error);
    }
  }

  /**
   * Load contacts from file if available
   */
  static async loadContactsFromFile(): Promise<Map<number, Contact>> {
    const contacts = new Map<number, Contact>();
    
    try {
      if (fs.existsSync(contactsFilePath)) {
        const data = fs.readFileSync(contactsFilePath, 'utf8');
        const savedContacts = JSON.parse(data);
        
        if (Array.isArray(savedContacts)) {
          for (const contact of savedContacts) {
            contacts.set(contact.id, {
              ...contact,
              createdAt: contact.createdAt ? new Date(contact.createdAt) : null,
              lastActivityAt: contact.lastActivityAt ? new Date(contact.lastActivityAt) : null
            });
          }
          
          console.log(`Loaded ${savedContacts.length} contacts from file`);
        }
      }
    } catch (error) {
      console.error('Failed to load contacts from file:', error);
    }
    
    return contacts;
  }

  /**
   * Get the highest ID from a map to determine next ID for new items
   */
  static getNextId(map: Map<number, any>): number {
    if (map.size === 0) return 1;
    return Math.max(...Array.from(map.keys())) + 1;
  }
}