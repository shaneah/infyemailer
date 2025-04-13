import { Request, Response } from 'express';

// Email settings service code would go here in a real implementation
// For now, we'll just use in-memory storage
let defaultEmailSettings = {
  fromEmail: '',
  fromName: '',
  replyTo: '',
  signature: ''
};

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