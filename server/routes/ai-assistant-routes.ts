import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateSchema } from '../helpers/validation';
import { OpenAIService } from '../services/ai/openai-service';

const router = Router();
const openaiService = new OpenAIService();

// Schema for chat request validation
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.string().optional().default('general'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    })
  ).optional().default([])
});

type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Register AI Assistant routes
 * 
 * @param app Express application
 */
export function registerAIAssistantRoutes(app: any) {
  // Check AI Assistant status
  router.get('/status', (req: Request, res: Response) => {
    res.json({
      status: 'active',
      implementation: process.env.OPENAI_API_KEY ? 'OpenAI with fallback' : 'Mock only',
      mockProvided: true,
      openaiConfigured: !!process.env.OPENAI_API_KEY
    });
  });

  // Chat endpoint
  router.post('/chat', async (req: Request, res: Response) => {
    try {
      const validation = validateSchema<ChatRequest>(chatRequestSchema, req.body);
      
      if ('error' in validation) {
        return res.status(400).json({ error: validation.error });
      }

      const { message, context, history } = validation;
      
      // Get default system prompt based on context
      const systemPrompt = getSystemPromptForContext(context);
      
      // Format history for OpenAI
      const formattedHistory = history.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add current message to history
      const messages = [
        ...formattedHistory,
        { role: 'user' as const, content: message }
      ];
      
      // Get response from OpenAI service
      const response = await openaiService.getChatCompletion(messages, systemPrompt);
      
      // Return response
      res.json({
        response,
        context,
        history: [
          ...history,
          { role: 'user', content: message },
          { role: 'assistant', content: response }
        ]
      });
    } catch (error) {
      console.error('Error in AI assistant chat endpoint:', error);
      res.status(500).json({ 
        error: 'Failed to get assistant response',
        response: 'I apologize, but I encountered an error processing your request. Please try again later.'
      });
    }
  });

  // Email template generation endpoint
  router.post('/generate-template', async (req: Request, res: Response) => {
    try {
      const { subject, purpose, audience, tone, length, includeCallToAction, specialInstructions } = req.body;
      
      if (!subject || !purpose || !audience) {
        return res.status(400).json({ 
          error: 'Required fields missing. Please provide subject, purpose, and audience.' 
        });
      }
      
      const template = await openaiService.generateEmailTemplate({
        subject,
        purpose,
        audience,
        tone: tone || 'professional',
        length: length || 'medium',
        includeCallToAction: includeCallToAction !== false,
        specialInstructions
      });
      
      res.json({ template });
    } catch (error) {
      console.error('Error generating email template:', error);
      res.status(500).json({ 
        error: 'Failed to generate email template',
        template: 'An error occurred while generating your template. Please try again later.'
      });
    }
  });

  // Subject line analysis endpoint
  router.post('/analyze-subject', async (req: Request, res: Response) => {
    try {
      const { subjectLine } = req.body;
      
      if (!subjectLine) {
        return res.status(400).json({ error: 'Subject line is required' });
      }
      
      const analysis = await openaiService.analyzeSubjectLine(subjectLine);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing subject line:', error);
      res.status(500).json({ 
        error: 'Failed to analyze subject line',
        score: 0,
        feedback: 'An error occurred while analyzing your subject line. Please try again later.',
        suggestions: [],
        strength: '',
        weakness: ''
      });
    }
  });

  // Email marketing best practices endpoint
  router.get('/best-practices', async (req: Request, res: Response) => {
    try {
      const topic = req.query.topic as string | undefined;
      const bestPractices = await openaiService.getEmailMarketingBestPractices(topic);
      res.json({ bestPractices });
    } catch (error) {
      console.error('Error getting best practices:', error);
      res.status(500).json({ 
        error: 'Failed to get best practices',
        bestPractices: []
      });
    }
  });

  // Email improvement suggestions endpoint
  router.post('/improve-email', async (req: Request, res: Response) => {
    try {
      const { emailContent } = req.body;
      
      if (!emailContent) {
        return res.status(400).json({ error: 'Email content is required' });
      }
      
      const improvements = await openaiService.suggestEmailImprovements(emailContent);
      res.json(improvements);
    } catch (error) {
      console.error('Error suggesting email improvements:', error);
      res.status(500).json({ 
        error: 'Failed to suggest improvements',
        improvements: [],
        revisedContent: ''
      });
    }
  });

  // Register all routes with /api/assistant prefix
  app.use('/api/assistant', router);
}

/**
 * Get system prompt based on context
 * 
 * @param context Context for the conversation
 * @returns System prompt for the given context
 */
function getSystemPromptForContext(context: string): string {
  const prompts: Record<string, string> = {
    general: `You are an AI Assistant for an email marketing platform. You provide helpful, accurate, and concise information about email marketing.
      Your role is to assist users with best practices, campaign strategies, content creation, and technical aspects of email marketing.
      When possible, include specific metrics, examples, or actionable advice.`,
    
    templates: `You are an expert email marketer that helps create effective email templates.
      Your specialty is creating engaging, conversion-oriented content that follows best practices for email marketing.
      When asked about templates, provide specific structure and examples of effective email copy.`,
    
    analytics: `You are an email marketing analytics expert. You specialize in helping users understand and improve their email campaign performance.
      When discussing analytics, mention key metrics like open rates, click rates, conversion rates, and what they mean.
      Provide insights on how to interpret data and actionable strategies to improve metrics.`,
    
    deliverability: `You are an email deliverability specialist. You help users understand and solve issues related to email deliverability.
      Provide specific advice on avoiding spam filters, improving sender reputation, and ensuring emails reach the inbox.
      When appropriate, explain technical concepts like SPF, DKIM, and DMARC in simple terms.`,
    
    segmentation: `You are an expert in email list segmentation and audience targeting.
      Provide strategies for effectively segmenting email lists and creating targeted campaigns for different audience segments.
      Emphasize personalization and relevance as keys to engagement.`,
    
    compliance: `You are a specialist in email marketing compliance and regulations.
      Your expertise covers GDPR, CAN-SPAM, CCPA and other relevant regulations that impact email marketing.
      Provide clear, accurate information about compliance requirements, but clarify that you're not providing legal advice.`
  };
  
  return prompts[context] || prompts.general;
}