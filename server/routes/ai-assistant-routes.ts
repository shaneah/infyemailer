import { Request, Response } from "express";
import { openAIService } from "../services/ai/openai-service";
import { validateSchema } from "../helpers/validation";
import { z } from "zod";

// Schema for chat message validation
const chatMessageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  systemPrompt: z.string().optional(),
});

// Schema for email template generation request
const emailTemplateRequestSchema = z.object({
  subject: z.string(),
  purpose: z.string(),
  audience: z.string(),
  tone: z.string(),
  length: z.enum(["short", "medium", "long"]),
  includeCallToAction: z.boolean(),
  specialInstructions: z.string().optional(),
});

// Schema for subject line analysis request
const subjectLineRequestSchema = z.object({
  subjectLine: z.string(),
});

// Schema for email marketing best practices request
const bestPracticesRequestSchema = z.object({
  topic: z.string().optional(),
});

// Schema for email improvements request
const emailImprovementsRequestSchema = z.object({
  emailContent: z.string(),
});

// Schema for email marketing question request
const emailMarketingQuestionSchema = z.object({
  question: z.string(),
  context: z.string().optional(),
});

// Schema for audience persona generation request
const audiencePersonaRequestSchema = z.object({
  industry: z.string(),
  demographics: z.string().optional(),
  interests: z.string().optional(),
});

// Schema for campaign results analysis request
const campaignAnalysisRequestSchema = z.object({
  name: z.string(),
  sentCount: z.number(),
  openRate: z.number(),
  clickRate: z.number(),
  bounceRate: z.number(),
  unsubscribeRate: z.number(),
  conversionRate: z.number().optional(),
  industry: z.string().optional(),
});

// Schema for A/B test variations request
const abTestVariationsRequestSchema = z.object({
  component: z.enum(["subject", "headline", "cta", "body", "design"]),
  originalContent: z.string(),
  variationCount: z.number().min(1).max(5).default(3),
  goal: z.string().optional(),
});

/**
 * Register AI Assistant API routes
 * @param app Express application
 */
export function registerAIAssistantRoutes(app: any) {
  // Chat completion endpoint
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const validatedData = validateSchema(chatMessageSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }

      const response = await openAIService.getChatCompletion(
        validatedData.messages,
        validatedData.systemPrompt
      );

      res.json({ response });
    } catch (error: any) {
      console.error("Error in AI chat completion:", error);
      res.status(500).json({ 
        error: "Failed to get AI response",
        details: error.message
      });
    }
  });

  // Email template generation endpoint
  app.post("/api/ai/email-template", async (req: Request, res: Response) => {
    try {
      const validatedData = validateSchema(emailTemplateRequestSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }

      const template = await openAIService.generateEmailTemplate(validatedData);
      res.json({ template });
    } catch (error: any) {
      console.error("Error generating email template:", error);
      res.status(500).json({ 
        error: "Failed to generate email template",
        details: error.message
      });
    }
  });

  // Subject line analysis endpoint
  app.post("/api/ai/analyze-subject", async (req: Request, res: Response) => {
    try {
      const validatedData = validateSchema(subjectLineRequestSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }

      const analysis = await openAIService.analyzeSubjectLine(
        validatedData.subjectLine
      );
      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing subject line:", error);
      res.status(500).json({ 
        error: "Failed to analyze subject line",
        details: error.message
      });
    }
  });

  // Email marketing best practices endpoint
  app.post("/api/ai/best-practices", async (req: Request, res: Response) => {
    try {
      const validatedData = validateSchema(bestPracticesRequestSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }

      const bestPractices = await openAIService.getEmailMarketingBestPractices(
        validatedData.topic
      );
      res.json({ bestPractices });
    } catch (error: any) {
      console.error("Error getting best practices:", error);
      res.status(500).json({ 
        error: "Failed to get email marketing best practices",
        details: error.message
      });
    }
  });

  // Email improvements endpoint
  app.post("/api/ai/improve-email", async (req: Request, res: Response) => {
    try {
      const validatedData = validateSchema(emailImprovementsRequestSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }

      const improvements = await openAIService.suggestEmailImprovements(
        validatedData.emailContent
      );
      res.json(improvements);
    } catch (error: any) {
      console.error("Error getting email improvements:", error);
      res.status(500).json({ 
        error: "Failed to get email improvement suggestions",
        details: error.message
      });
    }
  });

  // Email marketing question endpoint
  app.post("/api/ai/answer-question", async (req: Request, res: Response) => {
    try {
      const validatedData = validateSchema(emailMarketingQuestionSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }

      const answer = await openAIService.answerEmailMarketingQuestion(
        validatedData.question,
        validatedData.context
      );
      res.json({ answer });
    } catch (error: any) {
      console.error("Error answering email marketing question:", error);
      res.status(500).json({ 
        error: "Failed to answer email marketing question",
        details: error.message
      });
    }
  });

  // Audience persona generation endpoint
  app.post("/api/ai/audience-persona", async (req: Request, res: Response) => {
    try {
      const validatedData = validateSchema(audiencePersonaRequestSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }

      const persona = await openAIService.generateAudiencePersona(
        validatedData.industry,
        validatedData.demographics,
        validatedData.interests
      );
      res.json(persona);
    } catch (error: any) {
      console.error("Error generating audience persona:", error);
      res.status(500).json({ 
        error: "Failed to generate audience persona",
        details: error.message
      });
    }
  });

  // Campaign results analysis endpoint
  app.post("/api/ai/analyze-campaign", async (req: Request, res: Response) => {
    try {
      const validatedData = validateSchema(campaignAnalysisRequestSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }

      const analysis = await openAIService.analyzeCampaignResults(validatedData);
      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing campaign results:", error);
      res.status(500).json({ 
        error: "Failed to analyze campaign results",
        details: error.message
      });
    }
  });

  // A/B test variations endpoint
  app.post("/api/ai/ab-test-variations", async (req: Request, res: Response) => {
    try {
      const validatedData = validateSchema(abTestVariationsRequestSchema, req.body);
      if ('error' in validatedData) {
        return res.status(400).json({ error: validatedData.error });
      }

      const variations = await openAIService.generateABTestVariations(
        validatedData.component,
        validatedData.originalContent,
        validatedData.variationCount,
        validatedData.goal
      );
      res.json({ variations });
    } catch (error: any) {
      console.error("Error generating A/B test variations:", error);
      res.status(500).json({ 
        error: "Failed to generate A/B test variations",
        details: error.message
      });
    }
  });

  console.log("AI Assistant API routes registered");
}