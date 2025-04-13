import * as fs from 'fs';
import { Campaign } from '@shared/schema';

// Define the file path
const campaignsFilePath = 'campaigns-data.json';

/**
 * Service for managing campaign data persistence.
 * This provides file-based storage for campaigns
 * when using memory storage mode.
 */
export class CampaignPersistenceService {
  /**
   * Save campaigns to file for persistence
   */
  static async saveCampaignsToFile(campaigns: Map<number, Campaign>): Promise<void> {
    try {
      const campaignsArray = Array.from(campaigns.values());
      fs.writeFileSync(
        campaignsFilePath, 
        JSON.stringify(campaignsArray, null, 2), 
        'utf8'
      );
      console.log(`Saved ${campaignsArray.length} campaigns to file`);
    } catch (error) {
      console.error('Failed to save campaigns to file:', error);
    }
  }

  /**
   * Load campaigns from file if available
   */
  static async loadCampaignsFromFile(): Promise<Map<number, Campaign>> {
    const campaigns = new Map<number, Campaign>();
    
    try {
      if (fs.existsSync(campaignsFilePath)) {
        const data = fs.readFileSync(campaignsFilePath, 'utf8');
        const savedCampaigns = JSON.parse(data);
        
        if (Array.isArray(savedCampaigns)) {
          for (const campaign of savedCampaigns) {
            campaigns.set(campaign.id, {
              ...campaign,
              createdAt: campaign.createdAt ? new Date(campaign.createdAt) : null,
              updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt) : null,
              scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt) : null,
              sentAt: campaign.sentAt ? new Date(campaign.sentAt) : null
            });
          }
          
          console.log(`Loaded ${savedCampaigns.length} campaigns from file`);
        }
      }
    } catch (error) {
      console.error('Failed to load campaigns from file:', error);
    }
    
    return campaigns;
  }

  /**
   * Get the highest ID from a map to determine next ID for new items
   */
  static getNextId(map: Map<number, any>): number {
    if (map.size === 0) return 1;
    return Math.max(...Array.from(map.keys())) + 1;
  }
}