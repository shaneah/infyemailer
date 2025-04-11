import { db } from '../db';
import { EmailProviderFactory, EmailProviderType } from './emailProviders';
import { emailService } from './EmailService';
import { sql } from 'drizzle-orm';

export interface ProviderSettings {
  id: number;
  name: string;
  provider: EmailProviderType;
  config: Record<string, any>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing email provider settings
 */
export class ProviderSettingsService {
  /**
   * Initialize the provider settings service and load saved providers
   */
  async initialize(): Promise<void> {
    // Create provider settings table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS provider_settings (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        config JSONB NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Load saved providers
    await this.loadSavedProviders();
  }
  
  /**
   * Load saved providers from the database
   */
  private async loadSavedProviders(): Promise<void> {
    try {
      const providers: ProviderSettings[] = await db.execute(sql`
        SELECT * FROM provider_settings
      `);
      
      // Register each provider
      for (const settings of providers) {
        try {
          const provider = EmailProviderFactory.createProvider(
            settings.provider as EmailProviderType, 
            settings.config
          );
          
          emailService.registerProvider(settings.name, provider);
          
          if (settings.isDefault) {
            emailService.setDefaultProvider(settings.name);
          }
        } catch (error) {
          console.error(`Failed to load provider ${settings.name}:`, error);
        }
      }
      
      // If no providers were loaded, register a default one (if API key is available)
      if (emailService.getAllProviders().length === 0) {
        const sendgridApiKey = process.env.SENDGRID_API_KEY;
        if (sendgridApiKey) {
          try {
            emailService.registerProviderWithFactory(
              'SendGrid',
              'sendgrid',
              { apiKey: sendgridApiKey }
            );
            
            // Save this provider
            await this.saveProviderSettings({
              name: 'SendGrid',
              provider: 'sendgrid',
              config: { apiKey: sendgridApiKey },
              isDefault: true
            });
          } catch (error) {
            console.error('Failed to initialize default SendGrid provider:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load provider settings:', error);
    }
  }
  
  /**
   * Get all provider settings
   */
  async getAllProviderSettings(): Promise<ProviderSettings[]> {
    const settings: ProviderSettings[] = await db.execute(sql`
      SELECT * FROM provider_settings
    `);
    
    // Remove sensitive data (API keys, etc.)
    return settings.map(setting => ({
      ...setting,
      config: this.sanitizeConfig(setting.config, setting.provider as EmailProviderType)
    }));
  }
  
  /**
   * Get a provider setting by ID
   */
  async getProviderSettings(id: number): Promise<ProviderSettings | null> {
    const [settings] = await db.execute<ProviderSettings>(sql`
      SELECT * FROM provider_settings WHERE id = ${id}
    `);
    
    if (!settings) return null;
    
    // Remove sensitive data (API keys, etc.)
    return {
      ...settings,
      config: this.sanitizeConfig(settings.config, settings.provider as EmailProviderType)
    };
  }
  
  /**
   * Save or update provider settings
   */
  async saveProviderSettings(settings: Omit<ProviderSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProviderSettings> {
    // Check if this is the default provider
    if (settings.isDefault) {
      // Unset the default flag for all other providers
      await db.execute(sql`
        UPDATE provider_settings SET is_default = FALSE
      `);
    }
    
    // Insert the new provider
    const [result] = await db.execute<ProviderSettings>(sql`
      INSERT INTO provider_settings (name, provider, config, is_default)
      VALUES (${settings.name}, ${settings.provider}, ${JSON.stringify(settings.config)}, ${settings.isDefault})
      RETURNING *
    `);
    
    // Register the provider
    const provider = EmailProviderFactory.createProvider(
      settings.provider,
      settings.config
    );
    
    emailService.registerProvider(settings.name, provider);
    
    if (settings.isDefault) {
      emailService.setDefaultProvider(settings.name);
    }
    
    return {
      ...result,
      config: this.sanitizeConfig(result.config, result.provider as EmailProviderType)
    };
  }
  
  /**
   * Update provider settings
   */
  async updateProviderSettings(
    id: number, 
    settings: Partial<Omit<ProviderSettings, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ProviderSettings | null> {
    // Get the current settings
    const [currentSettings] = await db.execute<ProviderSettings>(sql`
      SELECT * FROM provider_settings WHERE id = ${id}
    `);
    
    if (!currentSettings) return null;
    
    // Check if this is being set as the default provider
    if (settings.isDefault) {
      // Unset the default flag for all other providers
      await db.execute(sql`
        UPDATE provider_settings SET is_default = FALSE
      `);
    }
    
    // Update the settings
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (settings.name !== undefined) {
      updateFields.push('name');
      updateValues.push(settings.name);
    }
    
    if (settings.provider !== undefined) {
      updateFields.push('provider');
      updateValues.push(settings.provider);
    }
    
    if (settings.config !== undefined) {
      updateFields.push('config');
      updateValues.push(JSON.stringify({
        ...currentSettings.config,
        ...settings.config
      }));
    }
    
    if (settings.isDefault !== undefined) {
      updateFields.push('is_default');
      updateValues.push(settings.isDefault);
    }
    
    updateFields.push('updated_at');
    updateValues.push(new Date());
    
    // Create an SQL query with placeholders
    const parts = [];
    const params = [];
    
    if (settings.name !== undefined) {
      parts.push('name = $1');
      params.push(settings.name);
    }
    
    if (settings.provider !== undefined) {
      parts.push(`provider = $${params.length + 1}`);
      params.push(settings.provider);
    }
    
    if (settings.config !== undefined) {
      const updatedConfig = {
        ...currentSettings.config,
        ...settings.config
      };
      parts.push(`config = $${params.length + 1}`);
      params.push(JSON.stringify(updatedConfig));
    }
    
    if (settings.isDefault !== undefined) {
      parts.push(`is_default = $${params.length + 1}`);
      params.push(settings.isDefault);
    }
    
    // Always update timestamp
    parts.push('updated_at = NOW()');
    
    // Add WHERE clause and id parameter
    const wherePosition = params.length + 1;
    params.push(id);
    
    const query = `
      UPDATE provider_settings 
      SET ${parts.join(', ')} 
      WHERE id = $${wherePosition} 
      RETURNING *
    `;
    
    const [result] = await db.execute<ProviderSettings>(sql`${query}`, params);
    
    if (!result) return null;
    
    // Update the registered provider
    try {
      const updatedConfig = {
        ...currentSettings.config,
        ...(settings.config || {})
      };
      
      const provider = EmailProviderFactory.createProvider(
        (settings.provider || currentSettings.provider) as EmailProviderType,
        updatedConfig
      );
      
      const providerName = settings.name || currentSettings.name;
      
      // Remove the old provider if the name changed
      if (settings.name && settings.name !== currentSettings.name) {
        // If this was the default provider, we need to update that
        const wasDefault = currentSettings.isDefault;
        
        // Register with the new name
        emailService.registerProvider(providerName, provider);
        
        if (wasDefault) {
          emailService.setDefaultProvider(providerName);
        }
      } else {
        // Just update the existing provider
        emailService.registerProvider(providerName, provider);
        
        if (settings.isDefault) {
          emailService.setDefaultProvider(providerName);
        }
      }
    } catch (error) {
      console.error(`Failed to update provider ${result.name}:`, error);
    }
    
    return {
      ...result,
      config: this.sanitizeConfig(result.config, result.provider as EmailProviderType)
    };
  }
  
  /**
   * Delete provider settings
   */
  async deleteProviderSettings(id: number): Promise<boolean> {
    // Get the current settings
    const [currentSettings] = await db.execute<ProviderSettings>(sql`
      SELECT * FROM provider_settings WHERE id = ${id}
    `);
    
    if (!currentSettings) return false;
    
    // Delete the settings
    await db.execute(sql`
      DELETE FROM provider_settings WHERE id = ${id}
    `);
    
    // If this was the default provider, set another one as default
    if (currentSettings.isDefault) {
      const [newDefault] = await db.execute<ProviderSettings>(sql`
        SELECT * FROM provider_settings LIMIT 1
      `);
      
      if (newDefault) {
        await db.execute(sql`
          UPDATE provider_settings
          SET is_default = TRUE
          WHERE id = ${newDefault.id}
        `);
        
        try {
          emailService.setDefaultProvider(newDefault.name);
        } catch (error) {
          console.error(`Failed to set default provider ${newDefault.name}:`, error);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Sanitize the configuration for public display
   * Remove sensitive data like API keys, tokens, etc.
   */
  private sanitizeConfig(
    config: Record<string, any>, 
    provider: EmailProviderType
  ): Record<string, any> {
    const sanitized = { ...config };
    
    switch (provider) {
      case 'sendgrid':
        if (sanitized.apiKey) {
          sanitized.apiKey = this.maskString(sanitized.apiKey);
        }
        break;
        
      case 'mailgun':
        if (sanitized.apiKey) {
          sanitized.apiKey = this.maskString(sanitized.apiKey);
        }
        break;
        
      case 'amazonses':
        if (sanitized.accessKey) {
          sanitized.accessKey = this.maskString(sanitized.accessKey);
        }
        if (sanitized.secretKey) {
          sanitized.secretKey = this.maskString(sanitized.secretKey);
        }
        break;
    }
    
    return sanitized;
  }
  
  /**
   * Mask a string for display (show first 3 and last 3 characters)
   */
  private maskString(str: string): string {
    if (!str || str.length <= 8) {
      return '******';
    }
    
    const firstChars = str.substring(0, 3);
    const lastChars = str.substring(str.length - 3);
    
    return `${firstChars}...${lastChars}`;
  }
}

// Create a singleton instance
export const providerSettingsService = new ProviderSettingsService();