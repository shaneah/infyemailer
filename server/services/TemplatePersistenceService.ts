import * as fs from 'fs';
import { Template } from '@shared/schema';

// Define the file path
const templatesFilePath = 'email-templates-data.json';

/**
 * Service for managing email templates persistence.
 * This provides file-based storage for templates
 * when using memory storage mode.
 */
export class TemplatePersistenceService {
  /**
   * Save templates to file for persistence
   */
  static async saveTemplatesToFile(templates: Map<number, Template>): Promise<void> {
    try {
      const templatesArray = Array.from(templates.values());
      fs.writeFileSync(
        templatesFilePath, 
        JSON.stringify(templatesArray, null, 2), 
        'utf8'
      );
      console.log(`Saved ${templatesArray.length} templates to file`);
    } catch (error) {
      console.error('Failed to save templates to file:', error);
    }
  }

  /**
   * Load templates from file if available
   */
  static async loadTemplatesFromFile(): Promise<Map<number, Template>> {
    const templates = new Map<number, Template>();
    
    try {
      if (fs.existsSync(templatesFilePath)) {
        const data = fs.readFileSync(templatesFilePath, 'utf8');
        const savedTemplates = JSON.parse(data);
        
        if (Array.isArray(savedTemplates)) {
          for (const template of savedTemplates) {
            templates.set(template.id, {
              ...template,
              createdAt: new Date(template.createdAt),
              updatedAt: template.updatedAt ? new Date(template.updatedAt) : null
            });
          }
          
          console.log(`Loaded ${savedTemplates.length} templates from file`);
        }
      }
    } catch (error) {
      console.error('Failed to load templates from file:', error);
    }
    
    return templates;
  }

  /**
   * Get the highest ID from a map to determine next ID for new items
   */
  static getNextId(map: Map<number, any>): number {
    if (map.size === 0) return 1;
    return Math.max(...Array.from(map.keys())) + 1;
  }
}