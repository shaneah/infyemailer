import { EmailProviderFactory, EmailProviderType } from './emailProviders';
import { emailService } from './EmailService';
import * as fs from 'fs';

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
 * Service for managing email provider settings.
 * This implementation uses in-memory storage with file system persistence for resiliency.
 */
export class ProviderSettingsService {
  private settings: Map<number, ProviderSettings> = new Map();
  private nextId = 1;
  private settingsFilePath = './email-provider-settings.json';

  /**
   * Initialize the provider settings service and load saved providers
   */
  async initialize(): Promise<void> {
    // Try to load settings from file
    await this.loadSettingsFromFile();
    
    // Initialize providers from environment variables if no settings were loaded
    if (this.settings.size === 0) {
      await this.initializeDefaultProviders();
    } else {
      console.log(`Loaded ${this.settings.size} providers from persistent storage`);
      
      // Register all loaded providers with the email service
      for (const [_, setting] of this.settings.entries()) {
        try {
          const provider = EmailProviderFactory.createProvider(
            setting.provider,
            setting.config
          );
          
          emailService.registerProvider(setting.name, provider);
          
          if (setting.isDefault) {
            emailService.setDefaultProvider(setting.name);
          }
        } catch (error) {
          console.error(`Failed to register provider ${setting.name}:`, error);
        }
      }
    }
  }
  
  /**
   * Load settings from file if available
   */
  private async loadSettingsFromFile(): Promise<void> {
    try {
      if (fs.existsSync(this.settingsFilePath)) {
        const data = fs.readFileSync(this.settingsFilePath, 'utf8');
        const savedSettings = JSON.parse(data);
        
        if (Array.isArray(savedSettings)) {
          // Clear existing settings
          this.settings.clear();
          
          // Load saved settings
          for (const setting of savedSettings) {
            this.settings.set(setting.id, {
              ...setting,
              createdAt: new Date(setting.createdAt),
              updatedAt: new Date(setting.updatedAt)
            });
            
            // Update nextId to be greater than any existing id
            if (setting.id >= this.nextId) {
              this.nextId = setting.id + 1;
            }
          }
          
          console.log(`Loaded ${savedSettings.length} email providers from file`);
        }
      }
    } catch (error) {
      console.error('Failed to load provider settings from file:', error);
    }
  }
  
  /**
   * Save settings to file for persistence
   */
  private async saveSettingsToFile(): Promise<void> {
    try {
      const settingsArray = Array.from(this.settings.values());
      fs.writeFileSync(
        this.settingsFilePath, 
        JSON.stringify(settingsArray, null, 2), 
        'utf8'
      );
      console.log(`Saved ${settingsArray.length} email providers to file`);
    } catch (error) {
      console.error('Failed to save provider settings to file:', error);
    }
  }
  
  /**
   * Initialize default providers from environment variables
   */
  private async initializeDefaultProviders(): Promise<void> {
    // If no providers were loaded, register default ones based on available API keys
    if (this.settings.size === 0) {
      // Try SendGrid
      const sendgridApiKey = process.env.SENDGRID_API_KEY;
      if (sendgridApiKey) {
        try {
          const provider = EmailProviderFactory.createProvider(
            'sendgrid',
            { apiKey: sendgridApiKey }
          );
          
          emailService.registerProvider('SendGrid', provider);
          emailService.setDefaultProvider('SendGrid');
          
          // Save this provider
          await this.saveProviderSettings({
            name: 'SendGrid',
            provider: 'sendgrid',
            config: { apiKey: sendgridApiKey },
            isDefault: true
          });
          
          console.log('Initialized default SendGrid provider');
        } catch (error) {
          console.error('Failed to initialize default SendGrid provider:', error);
        }
      }
      
      // If SMTP settings are available
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (smtpHost && smtpPort && smtpUser && smtpPass) {
        try {
          const config = {
            host: smtpHost,
            port: parseInt(smtpPort, 10),
            auth: {
              user: smtpUser,
              pass: smtpPass
            },
            secure: true
          };
          
          const provider = EmailProviderFactory.createProvider('smtp', config);
          
          emailService.registerProvider('SMTP', provider);
          
          // Only set as default if no other default was set
          if (!this.hasDefaultProvider()) {
            emailService.setDefaultProvider('SMTP');
          }
          
          // Save this provider
          await this.saveProviderSettings({
            name: 'SMTP',
            provider: 'smtp',
            config,
            isDefault: !this.hasDefaultProvider()
          });
          
          console.log('Initialized SMTP provider');
        } catch (error) {
          console.error('Failed to initialize SMTP provider:', error);
        }
      }
    }
  }
  
  /**
   * Check if there's a default provider already set
   */
  private hasDefaultProvider(): boolean {
    for (const setting of this.settings.values()) {
      if (setting.isDefault) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Get all provider settings
   */
  async getAllProviderSettings(): Promise<ProviderSettings[]> {
    const settings = Array.from(this.settings.values());
    
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
    const settings = this.settings.get(id);
    
    if (!settings) return null;
    
    // Remove sensitive data (API keys, etc.)
    return {
      ...settings,
      config: this.sanitizeConfig(settings.config, settings.provider as EmailProviderType)
    };
  }
  
  /**
   * Save new provider settings
   */
  async saveProviderSettings(settings: Omit<ProviderSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProviderSettings> {
    // Check if this is the default provider
    if (settings.isDefault) {
      // Unset the default flag for all other providers
      for (const [id, providerSetting] of this.settings.entries()) {
        if (providerSetting.isDefault) {
          this.settings.set(id, {
            ...providerSetting,
            isDefault: false,
            updatedAt: new Date()
          });
        }
      }
    }
    
    // Insert the new provider
    const id = this.nextId++;
    const now = new Date();
    
    const result: ProviderSettings = {
      id,
      ...settings,
      createdAt: now,
      updatedAt: now
    };
    
    this.settings.set(id, result);
    
    // Save changes to file
    await this.saveSettingsToFile();
    
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
    const currentSettings = this.settings.get(id);
    
    if (!currentSettings) return null;
    
    // Check if this is being set as the default provider
    if (settings.isDefault) {
      // Unset the default flag for all other providers
      for (const [settingId, providerSetting] of this.settings.entries()) {
        if (settingId !== id && providerSetting.isDefault) {
          this.settings.set(settingId, {
            ...providerSetting,
            isDefault: false,
            updatedAt: new Date()
          });
        }
      }
    }
    
    // Update the settings
    const updatedSettings = {
      ...currentSettings,
      name: settings.name !== undefined ? settings.name : currentSettings.name,
      provider: settings.provider !== undefined ? settings.provider : currentSettings.provider,
      config: settings.config !== undefined ? { ...currentSettings.config, ...settings.config } : currentSettings.config,
      isDefault: settings.isDefault !== undefined ? settings.isDefault : currentSettings.isDefault,
      updatedAt: new Date()
    };
    
    this.settings.set(id, updatedSettings);
    
    // Save changes to file
    await this.saveSettingsToFile();
    
    // Update the registered provider
    try {
      const provider = EmailProviderFactory.createProvider(
        updatedSettings.provider,
        updatedSettings.config
      );
      
      const providerName = updatedSettings.name;
      
      // Remove the old provider if the name changed
      if (settings.name && settings.name !== currentSettings.name) {
        emailService.removeProvider(currentSettings.name);
        
        // Register with the new name
        emailService.registerProvider(providerName, provider);
        
        if (updatedSettings.isDefault) {
          emailService.setDefaultProvider(providerName);
        }
      } else {
        // Just update the existing provider
        emailService.registerProvider(providerName, provider);
        
        if (updatedSettings.isDefault) {
          emailService.setDefaultProvider(providerName);
        }
      }
    } catch (error) {
      console.error(`Failed to update provider ${updatedSettings.name}:`, error);
    }
    
    return {
      ...updatedSettings,
      config: this.sanitizeConfig(updatedSettings.config, updatedSettings.provider)
    };
  }
  
  /**
   * Delete provider settings
   */
  async deleteProviderSettings(id: number): Promise<boolean> {
    // Get the current settings
    const currentSettings = this.settings.get(id);
    
    if (!currentSettings) return false;
    
    // Delete the settings
    this.settings.delete(id);
    
    // If this was the default provider, set another one as default
    if (currentSettings.isDefault) {
      const providers = Array.from(this.settings.values());
      
      if (providers.length > 0) {
        const newDefault = providers[0];
        newDefault.isDefault = true;
        newDefault.updatedAt = new Date();
        
        this.settings.set(newDefault.id, newDefault);
        
        try {
          emailService.setDefaultProvider(newDefault.name);
        } catch (error) {
          console.error(`Failed to set default provider ${newDefault.name}:`, error);
        }
      }
    }
    
    // Save changes to file
    await this.saveSettingsToFile();
    
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
        
      case 'smtp':
        if (sanitized.auth?.pass) {
          sanitized.auth.pass = this.maskString(sanitized.auth.pass);
        }
        break;
    }
    
    return sanitized;
  }
  
  /**
   * Mask a string for display (show only first 4 and last 2 characters)
   */
  private maskString(str: string): string {
    if (!str || str.length < 8) return '******';
    
    const firstPart = str.substring(0, 4);
    const lastPart = str.substring(str.length - 2);
    
    return `${firstPart}${'*'.repeat(Math.max(0, str.length - 6))}${lastPart}`;
  }
}

// Create a singleton instance
export const providerSettingsService = new ProviderSettingsService();