import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

const createPersonaSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  clientId: z.number().nullable().optional(),
  isDefault: z.boolean().nullable().optional(),
  traits: z.any().optional(),
  status: z.string().default("draft")
});

const updatePersonaSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  clientId: z.number().nullable().optional(),
  isDefault: z.boolean().nullable().optional(),
  traits: z.any().optional(),
  status: z.string().optional(),
  imageUrl: z.string().nullable().optional()
});

const createDemographicsSchema = z.object({
  personaId: z.number(),
  ageRange: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  income: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  maritalStatus: z.string().nullable().optional()
});

const updateDemographicsSchema = z.object({
  ageRange: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  income: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  maritalStatus: z.string().nullable().optional()
});

const createBehaviorsSchema = z.object({
  personaId: z.number(),
  purchaseFrequency: z.string().nullable().optional(),
  browserUsage: z.string().nullable().optional(),
  devicePreference: z.string().nullable().optional(),
  emailOpenRate: z.number().nullable().optional(),
  clickThroughRate: z.number().nullable().optional(),
  socialMediaUsage: z.any(),
  interests: z.any()
});

const updateBehaviorsSchema = z.object({
  purchaseFrequency: z.string().nullable().optional(),
  browserUsage: z.string().nullable().optional(),
  devicePreference: z.string().nullable().optional(),
  emailOpenRate: z.number().nullable().optional(),
  clickThroughRate: z.number().nullable().optional(),
  socialMediaUsage: z.any().optional(),
  interests: z.any().optional()
});

const createInsightSchema = z.object({
  personaId: z.number(),
  title: z.string(),
  description: z.string(),
  insightType: z.string(),
  score: z.number().nullable().optional()
});

const updateInsightSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  insightType: z.string().optional(),
  score: z.number().nullable().optional()
});

const createSegmentSchema = z.object({
  personaId: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  rules: z.any(),
  clientId: z.number().nullable().optional()
});

const updateSegmentSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  rules: z.any().optional(),
  clientId: z.number().nullable().optional(),
  status: z.string().optional()
});

export function registerAudiencePersonaRoutes(app: Express) {
  // Get all audience personas
  app.get("/api/audience-personas", async (req: Request, res: Response) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const personas = await storage.getAudiencePersonas(clientId);
      res.json(personas);
    } catch (error) {
      console.error("Error fetching audience personas:", error);
      res.status(500).json({ error: "Failed to fetch audience personas" });
    }
  });

  // Get a specific audience persona by ID
  app.get("/api/audience-personas/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const persona = await storage.getAudiencePersona(id);
      
      if (!persona) {
        return res.status(404).json({ error: "Audience persona not found" });
      }
      
      res.json(persona);
    } catch (error) {
      console.error(`Error fetching audience persona with ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch audience persona" });
    }
  });

  // Create a new audience persona
  app.post("/api/audience-personas", async (req: Request, res: Response) => {
    try {
      const validatedData = createPersonaSchema.parse(req.body);
      const newPersona = await storage.createAudiencePersona(validatedData);
      res.status(201).json(newPersona);
    } catch (error) {
      console.error("Error creating audience persona:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create audience persona" });
    }
  });

  // Update an audience persona
  app.patch("/api/audience-personas/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updatePersonaSchema.parse(req.body);
      
      const updatedPersona = await storage.updateAudiencePersona(id, validatedData);
      
      if (!updatedPersona) {
        return res.status(404).json({ error: "Audience persona not found" });
      }
      
      res.json(updatedPersona);
    } catch (error) {
      console.error(`Error updating audience persona with ID ${req.params.id}:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update audience persona" });
    }
  });

  // Delete an audience persona
  app.delete("/api/audience-personas/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAudiencePersona(id);
      
      if (!success) {
        return res.status(404).json({ error: "Audience persona not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting audience persona with ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete audience persona" });
    }
  });

  // Get demographics for a persona
  app.get("/api/audience-personas/:id/demographics", async (req: Request, res: Response) => {
    try {
      const personaId = parseInt(req.params.id);
      const demographics = await storage.getPersonaDemographics(personaId);
      
      if (!demographics) {
        return res.status(404).json({ error: "Demographics not found for this persona" });
      }
      
      res.json(demographics);
    } catch (error) {
      console.error(`Error fetching demographics for persona ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch demographics" });
    }
  });

  // Create or update demographics for a persona
  app.post("/api/audience-personas/:id/demographics", async (req: Request, res: Response) => {
    try {
      const personaId = parseInt(req.params.id);
      const validatedData = createDemographicsSchema.parse({
        ...req.body,
        personaId
      });
      
      const existingDemographics = await storage.getPersonaDemographics(personaId);
      let demographics;
      
      if (existingDemographics) {
        demographics = await storage.updatePersonaDemographics(personaId, validatedData);
      } else {
        demographics = await storage.createPersonaDemographics(validatedData);
      }
      
      res.status(201).json(demographics);
    } catch (error) {
      console.error(`Error creating/updating demographics for persona ID ${req.params.id}:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create/update demographics" });
    }
  });

  // Get behaviors for a persona
  app.get("/api/audience-personas/:id/behaviors", async (req: Request, res: Response) => {
    try {
      const personaId = parseInt(req.params.id);
      const behaviors = await storage.getPersonaBehaviors(personaId);
      
      if (!behaviors) {
        return res.status(404).json({ error: "Behaviors not found for this persona" });
      }
      
      res.json(behaviors);
    } catch (error) {
      console.error(`Error fetching behaviors for persona ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch behaviors" });
    }
  });

  // Create or update behaviors for a persona
  app.post("/api/audience-personas/:id/behaviors", async (req: Request, res: Response) => {
    try {
      const personaId = parseInt(req.params.id);
      const validatedData = createBehaviorsSchema.parse({
        ...req.body,
        personaId
      });
      
      const existingBehaviors = await storage.getPersonaBehaviors(personaId);
      let behaviors;
      
      if (existingBehaviors) {
        behaviors = await storage.updatePersonaBehaviors(personaId, validatedData);
      } else {
        behaviors = await storage.createPersonaBehaviors(validatedData);
      }
      
      res.status(201).json(behaviors);
    } catch (error) {
      console.error(`Error creating/updating behaviors for persona ID ${req.params.id}:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create/update behaviors" });
    }
  });

  // Get insights for a persona
  app.get("/api/audience-personas/:id/insights", async (req: Request, res: Response) => {
    try {
      const personaId = parseInt(req.params.id);
      const insights = await storage.getPersonaInsights(personaId);
      res.json(insights);
    } catch (error) {
      console.error(`Error fetching insights for persona ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // Create a new insight for a persona
  app.post("/api/audience-personas/:id/insights", async (req: Request, res: Response) => {
    try {
      const personaId = parseInt(req.params.id);
      const validatedData = createInsightSchema.parse({
        ...req.body,
        personaId
      });
      
      const insight = await storage.createPersonaInsight(validatedData);
      res.status(201).json(insight);
    } catch (error) {
      console.error(`Error creating insight for persona ID ${req.params.id}:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create insight" });
    }
  });

  // Update an insight
  app.patch("/api/audience-personas/insights/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateInsightSchema.parse(req.body);
      
      const updatedInsight = await storage.updatePersonaInsight(id, validatedData);
      
      if (!updatedInsight) {
        return res.status(404).json({ error: "Insight not found" });
      }
      
      res.json(updatedInsight);
    } catch (error) {
      console.error(`Error updating insight with ID ${req.params.id}:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update insight" });
    }
  });

  // Delete an insight
  app.delete("/api/audience-personas/insights/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePersonaInsight(id);
      
      if (!success) {
        return res.status(404).json({ error: "Insight not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting insight with ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete insight" });
    }
  });

  // Get segments for a persona
  app.get("/api/audience-personas/:id/segments", async (req: Request, res: Response) => {
    try {
      const personaId = parseInt(req.params.id);
      const segments = await storage.getPersonaSegments(personaId);
      res.json(segments);
    } catch (error) {
      console.error(`Error fetching segments for persona ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch segments" });
    }
  });

  // Create a new segment for a persona
  app.post("/api/audience-personas/:id/segments", async (req: Request, res: Response) => {
    try {
      const personaId = parseInt(req.params.id);
      
      // Make sure rules is not undefined
      const rules = req.body.rules || {};
      
      const validatedData = createSegmentSchema.parse({
        ...req.body,
        personaId,
        rules
      });
      
      const segment = await storage.createAudienceSegment(validatedData);
      res.status(201).json(segment);
    } catch (error) {
      console.error(`Error creating segment for persona ID ${req.params.id}:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create segment" });
    }
  });

  // Update a segment
  app.patch("/api/audience-personas/segments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateSegmentSchema.parse(req.body);
      
      const updatedSegment = await storage.updateAudienceSegment(id, validatedData);
      
      if (!updatedSegment) {
        return res.status(404).json({ error: "Segment not found" });
      }
      
      res.json(updatedSegment);
    } catch (error) {
      console.error(`Error updating segment with ID ${req.params.id}:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update segment" });
    }
  });

  // Delete a segment
  app.delete("/api/audience-personas/segments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAudienceSegment(id);
      
      if (!success) {
        return res.status(404).json({ error: "Segment not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting segment with ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete segment" });
    }
  });
}