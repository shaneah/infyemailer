import { Request, Response } from 'express';
import * as fs from 'fs';
import { z } from 'zod';

// Define the settings file path
const settingsFilePath = './email-default-settings.json';

// Default settings schema
const defaultSettingsSchema = z.object({
  fromEmail: z.string().default(''),
  fromName: z.string().default(''),
  replyTo: z.string().default(''),
  signature: z.string().default('')
});

// Define the type from the schema
type DefaultEmailSettings = z.infer<typeof defaultSettingsSchema>;

// Initial default settings
export let defaultEmailSettings: DefaultEmailSettings = {
  fromEmail: '',
  fromName: '',
  replyTo: '',
  signature: ''
};

// Load settings from file
function loadSettingsFromFile() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const data = fs.readFileSync(settingsFilePath, 'utf8');
      const savedSettings = JSON.parse(data);
      
      // Validate the loaded settings against our schema
      const parsedSettings = defaultSettingsSchema.parse(savedSettings);
      defaultEmailSettings = parsedSettings;
      
      console.log('Loaded default email settings from file:', defaultEmailSettings);
    }
  } catch (error) {
    console.error('Failed to load default email settings from file:', error);
  }
}

// Save settings to file
function saveSettingsToFile() {
  try {
    fs.writeFileSync(
      settingsFilePath,
      JSON.stringify(defaultEmailSettings, null, 2),
      'utf8'
    );
    console.log('Saved default email settings to file');
  } catch (error) {
    console.error('Failed to save default email settings to file:', error);
  }
}

// Initialize by loading settings
loadSettingsFromFile();

export function registerEmailSettingsRoutes(app: any) {
  // Get default email settings
  app.get('/api/email-settings/default', (req: Request, res: Response) => {
    try {
      res.json(defaultEmailSettings);
    } catch (error) {
      console.error('Error getting default email settings:', error);
      res.status(500).json({ error: 'Failed to get default email settings' });
    }
  });
  
  // Save default email settings
  app.post('/api/email-settings/default', (req: Request, res: Response) => {
    try {
      const { fromEmail, fromName, replyTo, signature } = req.body;
      
      // Update the default settings
      defaultEmailSettings = {
        fromEmail: fromEmail || '',
        fromName: fromName || '',
        replyTo: replyTo || '',
        signature: signature || ''
      };
      
      // Save to file for persistence
      saveSettingsToFile();
      
      console.log('Saved default email settings:', defaultEmailSettings);
      
      res.status(200).json({
        success: true,
        message: 'Default email settings saved successfully',
        settings: defaultEmailSettings
      });
    } catch (error) {
      console.error('Error saving default email settings:', error);
      res.status(500).json({ error: 'Failed to save default email settings' });
    }
  });
}