import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { emailHeatMaps, interactionDataPoints, insertInteractionDataPointSchema, insertEmailHeatMapSchema } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get all heat maps for a specific email
router.get('/emails/:emailId/heat-maps', async (req, res) => {
  try {
    const emailId = parseInt(req.params.emailId);
    
    if (isNaN(emailId)) {
      return res.status(400).json({ error: 'Invalid email ID' });
    }
    
    const heatMaps = await db.query.emailHeatMaps.findMany({
      where: eq(emailHeatMaps.emailId, emailId),
    });
    
    res.json(heatMaps);
  } catch (error) {
    console.error('Error fetching heat maps:', error);
    res.status(500).json({ error: 'Failed to fetch heat maps' });
  }
});

// Get a specific heat map
router.get('/heat-maps/:id', async (req, res) => {
  try {
    const heatMapId = parseInt(req.params.id);
    
    if (isNaN(heatMapId)) {
      return res.status(400).json({ error: 'Invalid heat map ID' });
    }
    
    const heatMap = await db.query.emailHeatMaps.findFirst({
      where: eq(emailHeatMaps.id, heatMapId),
    });
    
    if (!heatMap) {
      return res.status(404).json({ error: 'Heat map not found' });
    }
    
    res.json(heatMap);
  } catch (error) {
    console.error('Error fetching heat map:', error);
    res.status(500).json({ error: 'Failed to fetch heat map' });
  }
});

// Record a new interaction data point
router.post('/interactions', async (req, res) => {
  try {
    const schema = insertInteractionDataPointSchema;
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid interaction data', 
        details: validationResult.error.format() 
      });
    }
    
    const interactionData = validationResult.data;
    
    // Create the interaction data point
    const [newInteraction] = await db
      .insert(interactionDataPoints)
      .values(interactionData)
      .returning();
      
    // Update or create a heat map for this email
    const existingHeatMap = await db.query.emailHeatMaps.findFirst({
      where: and(
        eq(emailHeatMaps.emailId, interactionData.emailId),
        eq(emailHeatMaps.campaignId, interactionData.campaignId)
      ),
    });
    
    if (existingHeatMap) {
      // Update existing heat map
      const heatMapData = existingHeatMap.heatMapData as any || {};
      
      // Create a key based on the interaction type and coordinates (rounded to nearest 5%)
      const xPercent = Math.round(interactionData.xCoordinate / 5) * 5;
      const yPercent = Math.round(interactionData.yCoordinate / 5) * 5;
      const key = `${interactionData.interactionType}_${xPercent}_${yPercent}`;
      
      // Increment or set the count for this coordinate
      if (heatMapData[key]) {
        heatMapData[key]++;
      } else {
        heatMapData[key] = 1;
      }
      
      // Update the heat map
      await db
        .update(emailHeatMaps)
        .set({
          heatMapData: heatMapData,
          interactionCount: existingHeatMap.interactionCount + 1,
          updatedAt: new Date()
        })
        .where(eq(emailHeatMaps.id, existingHeatMap.id));
    } else {
      // Create a new heat map
      const heatMapData: Record<string, number> = {};
      
      // Create initial data
      const xPercent = Math.round(interactionData.xCoordinate / 5) * 5;
      const yPercent = Math.round(interactionData.yCoordinate / 5) * 5;
      const key = `${interactionData.interactionType}_${xPercent}_${yPercent}`;
      heatMapData[key] = 1;
      
      await db
        .insert(emailHeatMaps)
        .values({
          emailId: interactionData.emailId,
          campaignId: interactionData.campaignId,
          heatMapData: heatMapData,
          interactionCount: 1
        });
    }
    
    res.status(201).json(newInteraction);
  } catch (error) {
    console.error('Error recording interaction:', error);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

// Get all interaction data points for an email
router.get('/emails/:emailId/interactions', async (req, res) => {
  try {
    const emailId = parseInt(req.params.emailId);
    
    if (isNaN(emailId)) {
      return res.status(400).json({ error: 'Invalid email ID' });
    }
    
    const interactions = await db.query.interactionDataPoints.findMany({
      where: eq(interactionDataPoints.emailId, emailId),
      orderBy: (interactionDataPoints, { desc }) => [desc(interactionDataPoints.timestamp)]
    });
    
    res.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

// Generate a heat map visualization data for a specific email
router.get('/emails/:emailId/heat-map-visualization', async (req, res) => {
  try {
    const emailId = parseInt(req.params.emailId);
    
    if (isNaN(emailId)) {
      return res.status(400).json({ error: 'Invalid email ID' });
    }
    
    // Get all heat maps for this email
    const heatMaps = await db.query.emailHeatMaps.findMany({
      where: eq(emailHeatMaps.emailId, emailId),
    });
    
    if (heatMaps.length === 0) {
      return res.json({ 
        dataPoints: [],
        maxIntensity: 0,
        totalInteractions: 0
      });
    }
    
    // Combine all heat map data
    const combinedData: Record<string, number> = {};
    let totalInteractions = 0;
    
    heatMaps.forEach(heatMap => {
      const heatMapData = heatMap.heatMapData as Record<string, number> || {};
      
      Object.entries(heatMapData).forEach(([key, count]) => {
        if (combinedData[key]) {
          combinedData[key] += count;
        } else {
          combinedData[key] = count;
        }
      });
      
      totalInteractions += heatMap.interactionCount;
    });
    
    // Convert to visualization format
    const dataPoints = Object.entries(combinedData).map(([key, count]) => {
      const [type, xStr, yStr] = key.split('_');
      return {
        x: parseInt(xStr),
        y: parseInt(yStr),
        value: count,
        type
      };
    });
    
    // Calculate the maximum intensity
    const maxIntensity = Math.max(...dataPoints.map(point => point.value));
    
    res.json({
      dataPoints,
      maxIntensity,
      totalInteractions
    });
  } catch (error) {
    console.error('Error generating heat map visualization:', error);
    res.status(500).json({ error: 'Failed to generate heat map visualization' });
  }
});

export default router;