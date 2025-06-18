import { Router } from 'express';
import { DbStorage } from '../dbStorage';

const storage = new DbStorage();
const router = Router();

// Endpoint to create a campaign for a specific client
router.post('/api/client/:clientId/campaigns', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId, 10);
    const campaignData = req.body;

    // Validate client exists
    const client = await storage.getClient(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Create the campaign (replace with your actual logic)
    const newCampaign = {
      clientId,
      ...campaignData,
      createdAt: new Date(),
      scheduledAt: campaignData.scheduledDate && campaignData.scheduledTime 
        ? new Date(`${campaignData.scheduledDate}T${campaignData.scheduledTime}`)
        : null
    };

    // Remove temporary fields that aren't in the database schema
    delete newCampaign.scheduledDate;
    delete newCampaign.scheduledTime;

    // Save the campaign (replace with your actual storage logic)
    const createdCampaign = await storage.createCampaign(newCampaign);
    res.status(201).json(createdCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 