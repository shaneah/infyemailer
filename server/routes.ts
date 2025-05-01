import { createServer, type Server } from "http";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { ZodError } from "zod";
import {
  schema,
  users,
  clientUsers,
  clients,
  campaigns,
  contacts,
  contactLists,
  contactListRelations,
  templates,
  domains,
  emails,
  engagementMetrics,
  campaignVariants,
  variantAnalytics
} from "@shared/schema";
import {
  createInsertSchema
} from "drizzle-zod";
import {
  eq,
  and,
  desc,
  like,
  isNotNull,
  sql
} from "drizzle-orm";
import { storage } from "./storage";
import { db, isDatabaseAvailable, pool } from "./db";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import AdmZip from "adm-zip";
import { setupAuth } from "./auth";
import { registerEmailProviderRoutes } from "./routes/emailProviders";
import { registerEmailSettingsRoutes } from "./routes/emailSettings";
import { registerClientRoutes } from "./routes/clientRoutes";
import { registerClientProviderRoutes } from "./routes/clientProviders";
import userManagementRoutes from "./routes/user-management";
import reportingRoutes from "./routes/reporting-routes";

// Helper function to validate data against schema and return typed result
function validate<T>(schema: any, data: any): { data: T } | { error: string } {
  try {
    const parsed = schema.parse(data);
    return { data: parsed };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: err.errors.map(e => `${e.path}: ${e.message}`).join(", ") };
    }
    return { error: 'Invalid data provided' };
  }
}

// Create insert schemas with Zod
const insertUserSchema = createInsertSchema(users).omit({ id: true });
const insertClientUserSchema = createInsertSchema(clientUsers).omit({ id: true });
const insertClientSchema = createInsertSchema(clients).omit({ id: true });
const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true });
const insertContactSchema = createInsertSchema(contacts).omit({ id: true });
const insertContactListSchema = createInsertSchema(contactLists).omit({ id: true });
const insertTemplateSchema = createInsertSchema(templates).omit({ id: true });
const insertDomainSchema = createInsertSchema(domains).omit({ id: true });
const insertEmailSchema = createInsertSchema(emails).omit({ id: true });
const insertCampaignVariantSchema = createInsertSchema(campaignVariants).omit({ id: true });
const insertVariantAnalyticsSchema = createInsertSchema(variantAnalytics).omit({ id: true });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);
  
  // Register email provider routes
  await registerEmailProviderRoutes(app);
  
  // Register email settings routes
  registerEmailSettingsRoutes(app);
  
  // Register client routes
  registerClientRoutes(app);
  
  // Register client provider routes
  registerClientProviderRoutes(app);
  
  // Register user management routes
  app.use('/api', userManagementRoutes);
  
  // Register reporting routes
  app.use(reportingRoutes);

  // API Routes
  app.get('/api', (req: Request, res: Response) => {
    res.json({ status: 'API is running' });
  });
  
  // Get all campaigns
  app.get('/api/campaigns', async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  });

  // OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-testing",
  });

  // A/B Testing routes
  app.get('/api/ab-testing/campaigns', async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getAbTestCampaigns();
      console.log(`Retrieved ${campaigns.length} A/B test campaigns`);
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching A/B test campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch A/B test campaigns' });
    }
  });
  
  app.get('/api/ab-testing/campaigns/:id', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'Campaign is not an A/B test' });
      }
      
      const variants = await storage.getCampaignVariants(campaignId);
      
      res.json({
        campaign,
        variants
      });
    } catch (error) {
      console.error('Error fetching A/B test campaign:', error);
      res.status(500).json({ error: 'Failed to fetch A/B test campaign' });
    }
  });
  
  app.get('/api/ab-testing/campaigns/:id/analytics', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'Campaign is not an A/B test' });
      }
      
      const variants = await storage.getCampaignVariants(campaignId);
      const analytics = await storage.getVariantAnalyticsByCampaign(campaignId);
      
      // Group analytics by variant
      const variantAnalytics = variants.map(variant => {
        const variantData = analytics.filter(a => a.variantId === variant.id);
        return {
          variant,
          analytics: variantData
        };
      });
      
      res.json({
        campaign,
        variantAnalytics
      });
    } catch (error) {
      console.error('Error fetching A/B test campaign analytics:', error);
      res.status(500).json({ error: 'Failed to fetch A/B test campaign analytics' });
    }
  });
  
  // Create a new campaign variant
  app.post('/api/ab-testing/campaigns/:id/variants', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'Campaign is not an A/B test' });
      }
      
      const validatedData = validate(insertCampaignVariantSchema, {
        ...req.body,
        campaignId
      });
      
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const variant = await storage.createCampaignVariant(validatedData.data);
      res.status(201).json(variant);
    } catch (error) {
      console.error('Error creating variant:', error);
      res.status(500).json({ error: 'Failed to create variant' });
    }
  });
  
  // Update a campaign variant
  app.patch('/api/ab-testing/variants/:id', async (req: Request, res: Response) => {
    try {
      const variantId = parseInt(req.params.id);
      const variant = await storage.getCampaignVariant(variantId);
      
      if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      const updatedVariant = await storage.updateCampaignVariant(variantId, req.body);
      res.json(updatedVariant);
    } catch (error) {
      console.error('Error updating variant:', error);
      res.status(500).json({ error: 'Failed to update variant' });
    }
  });
  
  // Delete a campaign variant
  app.delete('/api/ab-testing/variants/:id', async (req: Request, res: Response) => {
    try {
      const variantId = parseInt(req.params.id);
      const variant = await storage.getCampaignVariant(variantId);
      
      if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      await storage.deleteCampaignVariant(variantId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting variant:', error);
      res.status(500).json({ error: 'Failed to delete variant' });
    }
  });
  
  // Record variant analytics
  app.post('/api/ab-testing/variants/:id/analytics', async (req: Request, res: Response) => {
    try {
      const variantId = parseInt(req.params.id);
      const variant = await storage.getCampaignVariant(variantId);
      
      if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      const validatedData = validate(insertVariantAnalyticsSchema, {
        ...req.body,
        variantId,
        campaignId: variant.campaignId
      });
      
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }
      
      const analytic = await storage.recordVariantAnalytic(validatedData.data);
      res.status(201).json(analytic);
    } catch (error) {
      console.error('Error recording variant analytics:', error);
      res.status(500).json({ error: 'Failed to record analytic' });
    }
  });
  
  // Set winning variant for a campaign
  app.post('/api/ab-testing/campaigns/:id/winner', async (req: Request, res: Response) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { variantId } = req.body;
      
      if (!variantId) {
        return res.status(400).json({ error: 'Variant ID is required' });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      if (!campaign.isAbTest) {
        return res.status(400).json({ error: 'Campaign is not an A/B test' });
      }
      
      const variant = await storage.getCampaignVariant(parseInt(variantId));
      if (!variant) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      
      if (variant.campaignId !== campaignId) {
        return res.status(400).json({ error: 'Variant does not belong to this campaign' });
      }
      
      const updatedCampaign = await storage.setWinningVariant(campaignId, parseInt(variantId));
      if (!updatedCampaign) {
        return res.status(500).json({ error: 'Failed to set winning variant' });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      console.error('Error setting winning variant:', error);
      res.status(500).json({ error: 'Failed to set winning variant' });
    }
  });

  // AI assistant
  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    // Check if OpenAI key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-dummy-key-for-testing") {
      return res.json({
        message: "I'm currently running in demo mode without a valid API key. In a real deployment, I would provide intelligent assistance for your marketing efforts based on your data and preferences.",
        response: "I'm currently in demo mode without an API key. In a full deployment, I would provide intelligent assistance for your marketing campaigns based on your actual data."
      });
    }
    
    try {
      const { query, history } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }
      
      // Construct the messages array
      const messages = [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in email marketing. Help the user create effective campaigns, optimize content, and analyze results. Provide actionable insights and best practices. Keep responses concise and practical.'
        }
      ];
      
      // Add conversation history
      if (history && Array.isArray(history)) {
        history.forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }
      
      // Add the current query
      messages.push({
        role: 'user',
        content: query
      });
      
      // Get a completion from the model
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: messages,
        max_tokens: 800
      });
      
      const response = completion.choices[0].message.content;
      
      res.json({
        message: query,
        response
      });
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      res.status(500).json({
        message: 'Error processing your request',
        response: 'I apologize, but I encountered an error processing your request. Please try again later.'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}