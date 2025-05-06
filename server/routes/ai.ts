import express from 'express';
import { z } from 'zod';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define validation schemas
const subjectLineRequestSchema = z.object({
  campaignDescription: z.string().min(1, "Campaign description is required"),
  clientId: z.number().optional()
});

const contentOptimizationRequestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  goal: z.enum(["engagement", "clickthrough", "conversion", "clarity", "brevity"]),
  clientId: z.number().optional()
});

// Middleware to check if AI features are enabled
const checkAIFeatureEnabled = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({
      success: false,
      message: "AI features are currently unavailable. Please contact support."
    });
  }
  next();
};

// Middleware to validate client session
const validateClientSession = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  
  // For client portal requests, check session
  if (req.body.clientId && req.session && req.session.clientUser) {
    // Ensure the client ID matches the session user's clientId
    if (req.session.clientUser.clientId === req.body.clientId) {
      return next();
    }
  }
  
  return res.status(401).json({
    success: false,
    message: "Unauthorized access"
  });
};

// Route to generate email subject lines
router.post('/generate-subject-lines', checkAIFeatureEnabled, validateClientSession, async (req, res) => {
  try {
    const validatedData = subjectLineRequestSchema.parse(req.body);
    const { campaignDescription } = validatedData;
    
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert email marketing copywriter specialized in creating attention-grabbing subject lines that drive high open rates. Generate 6 unique, compelling subject lines based on the campaign description provided. The subject lines should be concise (30-60 characters), engaging, and tailored to the target audience. Avoid clickbait or spammy phrases that might trigger spam filters. Format your response as a JSON array of strings."
        },
        {
          role: "user",
          content: `Create subject lines for this email campaign: ${campaignDescription}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    
    // Parse the JSON response
    let subjects: string[] = [];
    if (content) {
      try {
        const parsedContent = JSON.parse(content);
        subjects = Array.isArray(parsedContent.subjectLines) 
          ? parsedContent.subjectLines 
          : (parsedContent.subjects || parsedContent.subject_lines || []);
        
        // Ensure we have at least some subject lines
        if (subjects.length === 0 && typeof parsedContent === 'object') {
          // Try to extract any array from the response
          for (const key in parsedContent) {
            if (Array.isArray(parsedContent[key]) && parsedContent[key].length > 0) {
              subjects = parsedContent[key];
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error parsing OpenAI response:", error);
        // If JSON parsing fails, try to extract lines directly
        subjects = content
          .split("\n")
          .filter(line => line.trim().length > 0 && !line.includes("```"))
          .map(line => line.replace(/^[0-9]+[\.\)-]\s*/, '').trim())
          .slice(0, 6);
      }
    }
    
    return res.json({
      success: true,
      subjects: subjects.slice(0, 6) // Ensure we return max 6 subject lines
    });

  } catch (error) {
    console.error("Subject line generation error:", error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate subject lines"
    });
  }
});

// Route to optimize email content
router.post('/optimize-content', checkAIFeatureEnabled, validateClientSession, async (req, res) => {
  try {
    const validatedData = contentOptimizationRequestSchema.parse(req.body);
    const { content, goal } = validatedData;
    
    // Define goal-specific prompts
    const goalPrompts: { [key: string]: string } = {
      engagement: "Optimize this email to increase reader engagement. Make it more conversational, personal, and emotionally resonant. Focus on creating a connection with the reader.",
      clickthrough: "Optimize this email to improve click-through rates. Strengthen calls-to-action, create a sense of urgency, and emphasize the value proposition. Make the content flow toward clicking links.",
      conversion: "Optimize this email to drive conversions. Focus on persuasive language, addressing objections, building trust, and creating a clear path to conversion.",
      clarity: "Optimize this email for maximum clarity and readability. Simplify complex ideas, improve structure, use plain language, and ensure the message is unmistakable.",
      brevity: "Optimize this email to be more concise while preserving the key message. Remove redundancies, tighten sentences, and prioritize the most important information."
    };
    
    const prompt = goalPrompts[goal] || goalPrompts.engagement;
    
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert email marketing copywriter specializing in content optimization. ${prompt} Maintain the original message's intent but make it more effective. Provide both the optimized content and 3-4 specific improvement suggestions explaining what you changed and why. Format your response as a JSON object with 'optimizedContent' (string) and 'suggestions' (array of strings).`
        },
        {
          role: "user",
          content: `Optimize this email content:\n\n${content}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content_response = response.choices[0].message.content;
    
    // Parse the JSON response
    let optimizedContent = '';
    let suggestions: string[] = [];
    
    if (content_response) {
      try {
        const parsedContent = JSON.parse(content_response);
        optimizedContent = parsedContent.optimizedContent || '';
        suggestions = Array.isArray(parsedContent.suggestions) 
          ? parsedContent.suggestions 
          : [];
      } catch (error) {
        console.error("Error parsing OpenAI response:", error);
        // Handle the error - extract the content directly if possible
        optimizedContent = content_response.replace(/```json\n|\n```/g, '');
        suggestions = ["Improved overall effectiveness", "Enhanced readability", "Strengthened call to action"];
      }
    }
    
    return res.json({
      success: true,
      optimizedContent,
      suggestions
    });

  } catch (error) {
    console.error("Content optimization error:", error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to optimize content"
    });
  }
});

export default router;