import * as fs from 'fs';
import { List, ContactList } from '@shared/schema';

// Define the file paths
const listsFilePath = 'contact-lists-data.json';
const contactListsFilePath = 'contact-list-relations-data.json';

/**
 * Service for managing contact lists persistence.
 * This provides file-based storage for lists and list-contact relations
 * when using memory storage mode.
 */
export class ListPersistenceService {
  /**
   * Save lists to file for persistence
   */
  static async saveListsToFile(lists: Map<number, List>): Promise<void> {
    try {
      const listsArray = Array.from(lists.values());
      fs.writeFileSync(
        listsFilePath, 
        JSON.stringify(listsArray, null, 2), 
        'utf8'
      );
      console.log(`Saved ${listsArray.length} lists to file`);
    } catch (error) {
      console.error('Failed to save lists to file:', error);
    }
  }

  /**
   * Load lists from file if available
   */
  static async loadListsFromFile(): Promise<Map<number, List>> {
    const lists = new Map<number, List>();
    
    try {
      if (fs.existsSync(listsFilePath)) {
        const data = fs.readFileSync(listsFilePath, 'utf8');
        const savedLists = JSON.parse(data);
        
        if (Array.isArray(savedLists)) {
          for (const list of savedLists) {
            lists.set(list.id, {
              ...list,
              createdAt: new Date(list.createdAt),
              updatedAt: list.updatedAt ? new Date(list.updatedAt) : null
            });
          }
          
          console.log(`Loaded ${savedLists.length} lists from file`);
        }
      }
    } catch (error) {
      console.error('Failed to load lists from file:', error);
    }
    
    return lists;
  }

  /**
   * Save contact-list relationships to file for persistence
   */
  static async saveContactListsToFile(contactLists: Map<number, ContactList>): Promise<void> {
    try {
      const contactListsArray = Array.from(contactLists.values());
      fs.writeFileSync(
        contactListsFilePath, 
        JSON.stringify(contactListsArray, null, 2), 
        'utf8'
      );
      console.log(`Saved ${contactListsArray.length} contact-list relationships to file`);
    } catch (error) {
      console.error('Failed to save contact-list relationships to file:', error);
    }
  }

  /**
   * Load contact-list relationships from file if available
   */
  static async loadContactListsFromFile(): Promise<Map<number, ContactList>> {
    const contactLists = new Map<number, ContactList>();
    
    try {
      if (fs.existsSync(contactListsFilePath)) {
        const data = fs.readFileSync(contactListsFilePath, 'utf8');
        const savedContactLists = JSON.parse(data);
        
        if (Array.isArray(savedContactLists)) {
          for (const contactList of savedContactLists) {
            contactLists.set(contactList.id, {
              ...contactList,
              createdAt: new Date(contactList.createdAt)
            });
          }
          
          console.log(`Loaded ${savedContactLists.length} contact-list relationships from file`);
        }
      }
    } catch (error) {
      console.error('Failed to load contact-list relationships from file:', error);
    }
    
    return contactLists;
  }

  /**
   * Get the highest ID from a map to determine next ID for new items
   */
  static getNextId(map: Map<number, any>): number {
    if (map.size === 0) return 1;
    return Math.max(...Array.from(map.keys())) + 1;
  }
}