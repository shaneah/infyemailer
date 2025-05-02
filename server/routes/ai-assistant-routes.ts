import { Router, Express } from 'express';
import { z } from 'zod';
import { validateSchema } from '../helpers/validation';
import { OpenAIService } from '../services/ai/openai-service';

const router = Router();
const openAIService = new OpenAIService();

// Export this function for use in server/routes.ts
export function registerAIAssistantRoutes(app: Express) {
  console.log('Registering AI Assistant routes');
  app.use('/api/ai', router);
}

// Message schema for validation
const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  systemPrompt: z.string().optional(),
});

// Schema for email template parameters
const templateParamsSchema = z.object({
  subject: z.string(),
  purpose: z.string(),
  audience: z.string(),
  tone: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  includeCallToAction: z.boolean().optional(),
  specialInstructions: z.string().optional(),
});

// Schema for subject line analysis
const subjectLineSchema = z.object({
  subjectLine: z.string(),
});

// Schema for email improvements
const emailImprovementsSchema = z.object({
  emailContent: z.string(),
});

// Schema for best practices
const bestPracticesSchema = z.object({
  topic: z.string().optional(),
});

// POST /api/ai/chat - Chat endpoint
router.post('/chat', async (req, res) => {
  const validatedData = validateSchema(messageSchema, req.body);
  
  if ('error' in validatedData) {
    return res.status(400).json({ error: validatedData.error });
  }

  try {
    const { messages, systemPrompt } = validatedData;
    const response = await openAIService.getChatCompletion(
      messages,
      systemPrompt || "You are a helpful email marketing assistant. You specialize in helping users improve their email campaigns, enhance deliverability, optimize open rates, and create effective email content. Provide concise, actionable advice."
    );

    res.json({
      message: response,
      history: [...messages, { role: 'assistant', content: response }],
    });
  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// POST /api/ai/best-practices - Get email marketing best practices
router.post('/best-practices', async (req, res) => {
  const validatedData = validateSchema(bestPracticesSchema, req.body);
  
  if ('error' in validatedData) {
    return res.status(400).json({ error: validatedData.error });
  }

  try {
    const { topic } = validatedData;
    const bestPractices = await openAIService.getEmailMarketingBestPractices(topic);
    
    res.json({
      bestPractices
    });
  } catch (error) {
    console.error('Error in best practices endpoint:', error);
    res.status(500).json({ error: 'Failed to retrieve best practices' });
  }
});

// POST /api/ai/analyze-subject - Analyze email subject line
router.post('/analyze-subject', async (req, res) => {
  const validatedData = validateSchema(subjectLineSchema, req.body);
  
  if ('error' in validatedData) {
    return res.status(400).json({ error: validatedData.error });
  }

  try {
    const { subjectLine } = validatedData;
    const analysis = await openAIService.analyzeSubjectLine(subjectLine);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error in subject line analysis endpoint:', error);
    res.status(500).json({ error: 'Failed to analyze subject line' });
  }
});

// POST /api/ai/improve-email - Suggest email improvements
router.post('/improve-email', async (req, res) => {
  const validatedData = validateSchema(emailImprovementsSchema, req.body);
  
  if ('error' in validatedData) {
    return res.status(400).json({ error: validatedData.error });
  }

  try {
    const { emailContent } = validatedData;
    const improvements = await openAIService.suggestEmailImprovements(emailContent);
    
    res.json(improvements);
  } catch (error) {
    console.error('Error in email improvements endpoint:', error);
    res.status(500).json({ error: 'Failed to suggest email improvements' });
  }
});

// POST /api/ai/generate-template - Generate email template
router.post('/generate-template', async (req, res) => {
  const validatedData = validateSchema(templateParamsSchema, req.body);
  
  if ('error' in validatedData) {
    return res.status(400).json({ error: validatedData.error });
  }

  try {
    const templateContent = await openAIService.generateEmailTemplate(validatedData);
    
    res.json({
      content: templateContent
    });
  } catch (error) {
    console.error('Error in template generation endpoint:', error);
    res.status(500).json({ error: 'Failed to generate email template' });
  }
});

export default router;