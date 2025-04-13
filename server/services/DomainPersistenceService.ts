import * as fs from 'fs';
import { Domain } from '@shared/schema';

// Define the file path
const domainsFilePath = 'domains-data.json';

/**
 * Service for managing domain data persistence.
 * This provides file-based storage for domains
 * when using memory storage mode.
 */
export class DomainPersistenceService {
  /**
   * Save domains to file for persistence
   */
  static async saveDomainsToFile(domains: Map<number, Domain>): Promise<void> {
    try {
      const domainsArray = Array.from(domains.values());
      fs.writeFileSync(
        domainsFilePath, 
        JSON.stringify(domainsArray, null, 2), 
        'utf8'
      );
      console.log(`Saved ${domainsArray.length} domains to file`);
    } catch (error) {
      console.error('Failed to save domains to file:', error);
    }
  }

  /**
   * Load domains from file if available
   */
  static async loadDomainsFromFile(): Promise<Map<number, Domain>> {
    const domains = new Map<number, Domain>();
    
    try {
      if (fs.existsSync(domainsFilePath)) {
        const data = fs.readFileSync(domainsFilePath, 'utf8');
        const savedDomains = JSON.parse(data);
        
        if (Array.isArray(savedDomains)) {
          for (const domain of savedDomains) {
            domains.set(domain.id, {
              ...domain,
              createdAt: domain.createdAt ? new Date(domain.createdAt) : null,
              lastUsedAt: domain.lastUsedAt ? new Date(domain.lastUsedAt) : null
            });
          }
          
          console.log(`Loaded ${savedDomains.length} domains from file`);
        }
      }
    } catch (error) {
      console.error('Failed to load domains from file:', error);
    }
    
    return domains;
  }

  /**
   * Get the highest ID from a map to determine next ID for new items
   */
  static getNextId(map: Map<number, any>): number {
    if (map.size === 0) return 1;
    return Math.max(...Array.from(map.keys())) + 1;
  }
}