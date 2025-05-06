import express from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { getStorage } from "../storageManager";

const storage = getStorage();

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = express.Router();

// Validate client authentication middleware
const validateClientAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const clientId = parseInt(req.params.clientId);
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }

  // Check if the client exists
  try {
    const client = await storage.getClient(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Verify client session (should be handled by client auth middleware)
    // This is just an additional check
    if (!req.session?.clientUser?.clientId || req.session.clientUser.clientId !== clientId) {
      return res.status(403).json({ error: 'Not authorized to access this client' });
    }
    
    // We don't need to store client on req object
    next();
  } catch (error) {
    console.error('Error validating client auth:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Schema for subject line generator request
const SubjectLineRequestSchema = z.object({
  emailContent: z.string().min(1),
  industry: z.string(),
  objective: z.string(),
  tone: z.string(),
  clientId: z.number(),
});

// Schema for content optimization request
const ContentOptimizationRequestSchema = z.object({
  content: z.string().min(1),
  clientId: z.number(),
});

// Generate subject lines using OpenAI
router.post('/client/:clientId/ai/subject-lines', validateClientAuth, async (req, res) => {
  try {
    const validationResult = SubjectLineRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: validationResult.error.format() 
      });
    }
    
    const { emailContent, industry, objective, tone, clientId } = validationResult.data;

    try {
      // Call OpenAI API to generate subject lines
      const prompt = `
        Generate 5 high-performing email subject lines based on the following parameters:
        
        Email Content: ${emailContent}
        Industry: ${industry}
        Campaign Objective: ${objective}
        Tone: ${tone}
        
        The subject lines should be optimized for high open rates and engagement.
        Return ONLY the subject lines, one per line, without numbering or additional text.
        Each subject line should be 50 characters or less.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using the latest model
        messages: [
          { role: "system", content: "You are an expert email marketing assistant specializing in creating high-performing subject lines." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      // Process the response to extract subject lines
      const content = response.choices[0].message.content?.trim() || '';
      const subjectLines = content.split('\n').filter(line => line.trim() !== '');

      // Log the AI interaction for analytics
      console.log(`Generated ${subjectLines.length} subject lines for client ${clientId}`);

      // Return the subject lines
      return res.status(200).json({ subjectLines });
    } catch (error: any) {
      console.error('Error generating subject lines:', error);
      
      // Return demo subject lines if OpenAI fails
      const demoSubjectLines = [
        `[${industry.toUpperCase()}] ${emailContent.substring(0, 30)}...`,
        `Don't Miss: Our Latest ${objective.replace(/_/g, ' ')} Update`,
        `${tone === 'professional' ? 'Important:' : 'Exciting!'} New Opportunities`,
        `${emailContent.split(' ').slice(0, 5).join(' ')}...`,
        `${new Date().toLocaleDateString()} ${objective.replace(/_/g, ' ')} - Just for You`
      ];
      
      return res.status(200).json({ 
        subjectLines: demoSubjectLines,
        note: "Using demo subject lines as OpenAI service is unavailable"
      });
    }
  } catch (error) {
    console.error('Error in subject line generation endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Optimize content using OpenAI
router.post('/client/:clientId/ai/optimize-content', validateClientAuth, async (req, res) => {
  try {
    const validationResult = ContentOptimizationRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: validationResult.error.format() 
      });
    }
    
    const { content, clientId } = validationResult.data;

    try {
      // Call OpenAI API to optimize content
      const prompt = `
        Analyze the following email content and provide optimization suggestions:
        
        ${content}
        
        For each suggestion, include:
        1. The type of suggestion (improvement, warning, or critical)
        2. The original text that should be changed
        3. The suggested replacement text
        4. The reason for the suggestion
        5. The category (tone, clarity, engagement, personalization, or deliverability)
        
        Format the response as a JSON array with objects containing these fields:
        {
          "type": "improvement|warning|critical",
          "originalText": "text to replace",
          "suggestion": "suggested replacement",
          "reason": "explanation of why this change matters",
          "category": "tone|clarity|engagement|personalization|deliverability"
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using the latest model
        messages: [
          { role: "system", content: "You are an expert email marketing assistant specializing in content optimization." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Process the response to extract suggestions
      const content = response.choices[0].message.content?.trim() || '{}';
      const suggestions = JSON.parse(content).suggestions || [];

      // Log the AI interaction for analytics
      console.log(`Generated ${suggestions.length} content suggestions for client ${clientId}`);

      // Return the suggestions
      return res.status(200).json({ suggestions });
    } catch (error: any) {
      console.error('Error optimizing content:', error);
      
      // Return demo suggestions if OpenAI fails
      const demoSuggestions = [
        {
          type: "improvement",
          originalText: content.split(" ").slice(0, 3).join(" "),
          suggestion: `${content.split(" ").slice(0, 3).join(" ")} [personalized greeting]`,
          reason: "Adding personalization can increase engagement by 26%",
          category: "personalization"
        },
        {
          type: "warning",
          originalText: "FREE",
          suggestion: "Complimentary",
          reason: "Words like 'FREE' in all caps can trigger spam filters",
          category: "deliverability"
        },
        {
          type: "improvement",
          originalText: content.split(".")[0],
          suggestion: `${content.split(".")[0].replace(/we are/i, "you'll benefit from")}`,
          reason: "Focusing on customer benefits rather than company actions improves engagement",
          category: "engagement"
        },
        {
          type: "critical",
          originalText: "Click here",
          suggestion: "Learn more about our services",
          reason: "Generic call-to-actions like 'Click here' perform poorly and may trigger spam filters",
          category: "engagement"
        },
        {
          type: "improvement",
          originalText: content.split(" ").slice(-4).join(" "),
          suggestion: `${content.split(" ").slice(-4).join(" ")} with a clear next step`,
          reason: "Emails that end with a clear call to action have 371% higher click rates",
          category: "clarity"
        }
      ].filter(s => 
        content.includes(s.originalText) || s.originalText === "FREE" || s.originalText === "Click here"
      );
      
      return res.status(200).json({ 
        suggestions: demoSuggestions,
        note: "Using demo suggestions as OpenAI service is unavailable"
      });
    }
  } catch (error) {
    console.error('Error in content optimization endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;