import { Router, Request, Response } from 'express';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { emailHeatMaps, interactionDataPoints, emails } from '@shared/schema';

const router = Router();

/**
 * GET /api/heat-maps/emails/:emailId/heat-map-visualization
 * Get heat map visualization data for a specific email
 */
router.get('/emails/:emailId/heat-map-visualization', async (req: Request, res: Response) => {
  try {
    const emailId = parseInt(req.params.emailId, 10);
    
    // Get heat map data from the database
    const heatMap = await db.query.emailHeatMaps.findFirst({
      where: eq(emailHeatMaps.emailId, emailId),
      with: {
        interactionDataPoints: true
      }
    });

    if (!heatMap) {
      // If no heat map exists yet, return empty data
      return res.json({
        dataPoints: [],
        maxIntensity: 0,
        totalInteractions: 0
      });
    }

    // Convert data points for visualization
    const dataPoints = heatMap.interactionDataPoints.map(point => ({
      x: point.xCoordinate,
      y: point.yCoordinate,
      value: point.intensity || 1, // Default to 1 if intensity is not set
      type: point.interactionType
    }));

    // Calculate maximum intensity for normalization
    const maxIntensity = Math.max(...dataPoints.map(point => point.value), 1);

    res.json({
      dataPoints,
      maxIntensity,
      totalInteractions: dataPoints.length
    });
  } catch (error) {
    console.error('Error fetching heat map visualization data:', error);
    res.status(500).json({ error: 'Failed to fetch heat map data' });
  }
});

/**
 * GET /api/heat-maps/emails/:emailId/interactions
 * Get raw interaction data for a specific email
 */
router.get('/emails/:emailId/interactions', async (req: Request, res: Response) => {
  try {
    const emailId = parseInt(req.params.emailId, 10);
    
    // Get all interaction data points for this email
    const interactions = await db.query.interactionDataPoints.findMany({
      where: eq(interactionDataPoints.emailId, emailId),
      orderBy: [desc(interactionDataPoints.createdAt)]
    });

    res.json(interactions);
  } catch (error) {
    console.error('Error fetching email interaction data:', error);
    res.status(500).json({ error: 'Failed to fetch interaction data' });
  }
});

/**
 * POST /api/heat-maps/interactions
 * Record a new interaction data point
 */
router.post('/interactions', async (req: Request, res: Response) => {
  try {
    const {
      emailId,
      campaignId,
      contactId,
      elementId,
      elementType,
      xCoordinate,
      yCoordinate,
      interactionType,
      interactionDuration,
      metadata
    } = req.body;

    // Validate required fields
    if (!emailId || !campaignId || !xCoordinate || !yCoordinate || !interactionType) {
      return res.status(400).json({ 
        error: 'Missing required fields: emailId, campaignId, xCoordinate, yCoordinate, interactionType are required' 
      });
    }

    // Check if heat map already exists for this email
    let heatMap = await db.query.emailHeatMaps.findFirst({
      where: eq(emailHeatMaps.emailId, emailId),
    });

    // If no heat map exists, create one
    if (!heatMap) {
      const [newHeatMap] = await db.insert(emailHeatMaps)
        .values({
          emailId,
          campaignId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      heatMap = newHeatMap;
    }

    // Calculate intensity based on interaction type and duration
    let intensity = 1;
    if (interactionType === 'click') {
      intensity = 5; // Clicks have higher intensity
    } else if (interactionType === 'hover' && interactionDuration) {
      // Longer hover = higher intensity (up to 3)
      intensity = Math.min(3, Math.max(1, Math.floor(interactionDuration / 1000)));
    }

    // Insert the interaction data point
    const [interactionDataPoint] = await db.insert(interactionDataPoints)
      .values({
        heatMapId: heatMap.id,
        emailId,
        campaignId,
        contactId,
        elementId,
        elementType,
        xCoordinate,
        yCoordinate,
        interactionType,
        interactionDuration,
        intensity,
        metadata,
        createdAt: new Date()
      })
      .returning();

    // Update the heat map's last updated timestamp
    await db.update(emailHeatMaps)
      .set({ updatedAt: new Date() })
      .where(eq(emailHeatMaps.id, heatMap.id));

    res.status(201).json(interactionDataPoint);
  } catch (error) {
    console.error('Error recording interaction data:', error);
    res.status(500).json({ error: 'Failed to record interaction data' });
  }
});

/**
 * GET /api/heat-maps/campaigns/:campaignId
 * Get all heat maps for a campaign
 */
router.get('/campaigns/:campaignId', async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.campaignId, 10);
    
    // Get all heat maps for this campaign
    const heatMaps = await db.query.emailHeatMaps.findMany({
      where: eq(emailHeatMaps.campaignId, campaignId),
      with: {
        email: true
      }
    });

    // Format the response
    const formattedHeatMaps = heatMaps.map(heatMap => ({
      id: heatMap.id,
      emailId: heatMap.emailId,
      campaignId: heatMap.campaignId,
      emailName: heatMap.email?.name || 'Unknown Email',
      emailSubject: heatMap.email?.subject || '',
      createdAt: heatMap.createdAt,
      updatedAt: heatMap.updatedAt
    }));

    res.json(formattedHeatMaps);
  } catch (error) {
    console.error('Error fetching campaign heat maps:', error);
    res.status(500).json({ error: 'Failed to fetch campaign heat maps' });
  }
});

export default router;