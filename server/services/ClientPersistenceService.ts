import * as fs from 'fs';
import { Client } from '@shared/schema';

// Define the file path
const clientsFilePath = 'clients-data.json';

/**
 * Service for managing client data persistence.
 * This provides file-based storage for clients
 * when using memory storage mode.
 */
export class ClientPersistenceService {
  /**
   * Save clients to file for persistence
   */
  static async saveClientsToFile(clients: Map<number, Client>): Promise<void> {
    try {
      const clientsArray = Array.from(clients.values());
      fs.writeFileSync(
        clientsFilePath, 
        JSON.stringify(clientsArray, null, 2), 
        'utf8'
      );
      console.log(`Saved ${clientsArray.length} clients to file`);
    } catch (error) {
      console.error('Failed to save clients to file:', error);
    }
  }

  /**
   * Load clients from file if available
   */
  static async loadClientsFromFile(): Promise<Map<number, Client>> {
    const clients = new Map<number, Client>();
    
    try {
      if (fs.existsSync(clientsFilePath)) {
        const data = fs.readFileSync(clientsFilePath, 'utf8');
        const savedClients = JSON.parse(data);
        
        if (Array.isArray(savedClients)) {
          for (const client of savedClients) {
            clients.set(client.id, {
              ...client,
              createdAt: client.createdAt ? new Date(client.createdAt) : null,
              lastCampaignAt: client.lastCampaignAt ? new Date(client.lastCampaignAt) : null,
              lastCreditUpdateAt: client.lastCreditUpdateAt ? new Date(client.lastCreditUpdateAt) : null
            });
          }
          
          console.log(`Loaded ${savedClients.length} clients from file`);
        }
      }
    } catch (error) {
      console.error('Failed to load clients from file:', error);
    }
    
    return clients;
  }

  /**
   * Get the highest ID from a map to determine next ID for new items
   */
  static getNextId(map: Map<number, any>): number {
    if (map.size === 0) return 1;
    return Math.max(...Array.from(map.keys())) + 1;
  }
}