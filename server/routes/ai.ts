import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';

// Define validation middleware inline since the helper may not be accessible
const validateRequestBody = <T extends z.ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessages = result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        
        return res.status(400).json({
          error: 'Validation failed',
          details: errorMessages
        });
      }

      // Replace the request body with the validated data
      req.body = result.data;
      return next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error during validation'
      });
    }
  };
};

const router = express.Router();

// Configure OpenAI client
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
}

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Function to generate mock responses when API key is not available
const generateMockResponse = (type: string, params: any) => {
  console.log('Using mock response for AI endpoint:', type);
  
  switch (type) {
    case 'subject-lines':
      return {
        subjectLines: [
          {
            text: "Introducing Our Latest Features - You're Going to Love This!",
            score: 85,
            reasoning: "Uses action-oriented language and creates curiosity"
          },
          {
            text: "Quick Update: Important Changes to Your Account",
            score: 82,
            reasoning: "Creates urgency and feels personally relevant"
          },
          {
            text: "See What's New: Your May Update is Here",
            score: 78,
            reasoning: "Time-specific and promises new information"
          },
          {
            text: "Last Chance: Special Offer Ends Tonight",
            score: 75,
            reasoning: "Creates urgency and mentions a clear deadline"
          },
          {
            text: "We've Got Something Special For You",
            score: 70,
            reasoning: "Creates curiosity and implies a personal benefit"
          }
        ]
      };
    
    case 'content-optimization':
      return {
        score: 75,
        strengths: [
          "Clear call-to-action",
          "Personalized greeting",
          "Good brand consistency",
          "Concise messaging"
        ],
        summary: "The email content is well-structured but could benefit from more engaging language and improved formatting for better readability.",
        suggestions: [
          {
            id: "struct-1",
            category: "structure",
            title: "Add subheadings",
            description: "Break up content with clear subheadings to improve scannability.",
            impact: "medium",
            beforeAfter: "Before: A long paragraph of text.\nAfter: Content broken into sections with clear headings."
          },
          {
            id: "pers-1",
            category: "persuasion",
            title: "Strengthen value proposition",
            description: "Clearly articulate the benefits to the reader in the first paragraph.",
            impact: "high",
            beforeAfter: "Before: Here's our new product.\nAfter: Our new product saves you 2 hours every day."
          },
          {
            id: "clar-1",
            category: "clarity",
            title: "Simplify language",
            description: "Replace technical terms with simpler alternatives.",
            impact: "medium",
            beforeAfter: "Before: Utilize our new functionality.\nAfter: Use our new feature."
          }
        ]
      };
    
    case 'content-improvements':
      return {
        enhancedContent: `# Thank You for Joining Us!

## Welcome to Our Community

We're thrilled to have you as part of our growing family. Your membership gives you access to exclusive benefits and special offers.

### What's Next?

1. **Complete your profile** - Help us personalize your experience
2. **Browse our latest collection** - Discover products tailored to your preferences
3. **Join the conversation** - Connect with like-minded members in our forum

## Special Welcome Offer

As a thank you for joining, enjoy **20% off** your first purchase with code: **WELCOME20**

[Shop Now](#) | [Learn More](#)

Looking forward to being part of your journey!

Warm regards,
The Team`
      };
      
    default:
      return { error: "Unknown mock response type requested" };
  }
};

// Schema for subject line generator request
const SubjectLineRequestSchema = z.object({
  emailContent: z.string().min(1, "Email content is required"),
  tone: z.string().optional(),
  industry: z.string().optional(),
  targetAudience: z.string().optional()
});

// Schema for content optimization request
const ContentOptimizationRequestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  goal: z.string().optional()
});

// Schema for applying content improvements request
const ContentImprovementsRequestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  goal: z.string().optional(),
  suggestions: z.array(z.string()).optional()
});

/**
 * Generate email subject lines based on content and parameters
 */
router.post('/generate-subject-lines', validateRequestBody(SubjectLineRequestSchema), async (req, res) => {
  try {
    const { emailContent, tone, industry, targetAudience } = req.body;

    // Generate the mock response - we'll use this either as a fallback or if there's an error
    const mockResponse = generateMockResponse('subject-lines', { emailContent, tone, industry, targetAudience });
    
    // Check if we should use fallback directly
    const useFallback = !process.env.OPENAI_API_KEY || process.env.USE_AI_FALLBACKS === 'true';
    if (useFallback) {
      console.log('Using fallback for subject lines generation (fallback mode)');
      return res.json(mockResponse);
    }
    
    // Otherwise try to use OpenAI with a fallback safety net
    try {
      const prompt = `
        As an expert email marketer, analyze the following email content and generate 5 high-performing subject lines.
        
        EMAIL CONTENT:
        ${emailContent}
        
        PARAMETERS:
        ${tone ? `Tone: ${tone}` : 'Tone: professional'}
        ${industry ? `Industry: ${industry}` : ''}
        ${targetAudience ? `Target Audience: ${targetAudience}` : ''}
        
        For each subject line, provide:
        1. The subject line text
        2. A score from 1-100 indicating predicted performance
        3. Brief reasoning for why this would be effective
        
        Format your response as a JSON object with an array of "subjectLines" containing objects with "text", "score", and "reasoning" properties.
      `;

      const response = await openai!.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: "You are an expert email marketer specializing in crafting high-converting subject lines." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const result = JSON.parse(content || '{"subjectLines":[]}');

      return res.json(result);
    } catch (openaiError: any) {
      // Check for rate limit errors or other OpenAI errors
      if (openaiError.status === 429 || openaiError.code === 'insufficient_quota') {
        console.log('OpenAI rate limit hit, using fallback for subject lines');
        return res.json(mockResponse);
      }
      
      // For other errors, re-throw to be caught by the outer catch
      throw openaiError;
    }
  } catch (error) {
    console.error('Error generating subject lines:', error);
    // Send back a generic error message but with a 200 status and mock data
    const mockResponse = generateMockResponse('subject-lines', { 
      emailContent: 'Error occurred, using fallback data', 
      tone: 'professional' 
    });
    return res.json(mockResponse);
  }
});

/**
 * Analyze email content and provide optimization suggestions
 */
router.post('/optimize-content', validateRequestBody(ContentOptimizationRequestSchema), async (req, res) => {
  try {
    const { content, goal } = req.body;

    // Check if OpenAI API key is available or if we should use fallback
    const useFallback = !process.env.OPENAI_API_KEY || process.env.USE_AI_FALLBACKS === 'true';
    if (useFallback) {
      console.log('Using fallback for content optimization');
      // Return mock response
      const mockResponse = generateMockResponse('content-optimization', { content, goal });
      return res.json(mockResponse);
    }

    const prompt = `
      As an expert email content optimizer, analyze the following email content and provide detailed optimization suggestions.
      
      EMAIL CONTENT:
      ${content}
      
      OPTIMIZATION GOAL:
      ${goal || 'engagement'}
      
      Analyze the content and provide:
      1. An overall score (0-100) indicating the current quality and effectiveness
      2. A list of specific strengths (3-5 items)
      3. A brief summary of the analysis (1-3 sentences)
      4. A detailed list of suggestions for improvement in these categories:
         - structure: Content structure and organization
         - persuasion: Persuasive elements and calls-to-action
         - clarity: Clarity and readability
         - optimization: Tactical improvements for better performance
      
      For each suggestion, include:
      - A unique ID (e.g., "struct-1", "pers-1")
      - Category (structure, persuasion, clarity, or optimization)
      - Title (short description)
      - Description (detailed explanation)
      - Impact level (high, medium, or low)
      - Before/after examples where appropriate
      
      Format your response as a JSON object with "score", "strengths", "summary", and "suggestions" properties.
    `;

    const response = await openai!.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert email marketer specializing in optimizing content for maximum engagement and conversions." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content_response = response.choices[0].message.content;
    const result = JSON.parse(content_response || '{"score":0, "strengths":[], "summary":"", "suggestions":[]}');

    res.json(result);
  } catch (error) {
    console.error('Error optimizing content:', error);
    res.status(500).json({ error: 'Failed to optimize content' });
  }
});

/**
 * Apply AI-suggested improvements to content
 */
router.post('/apply-content-improvements', validateRequestBody(ContentImprovementsRequestSchema), async (req, res) => {
  try {
    const { content, goal, suggestions } = req.body;

    // Check if OpenAI API key is available or if we should use fallback
    const useFallback = !process.env.OPENAI_API_KEY || process.env.USE_AI_FALLBACKS === 'true';
    if (useFallback) {
      console.log('Using fallback for content improvements');
      // Return mock response
      const mockResponse = generateMockResponse('content-improvements', { content, goal, suggestions });
      return res.json(mockResponse);
    }

    const prompt = `
      As an expert email content optimizer, enhance the following email content by applying specific improvements.
      
      ORIGINAL EMAIL CONTENT:
      ${content}
      
      OPTIMIZATION GOAL:
      ${goal || 'engagement'}
      
      ${suggestions && suggestions.length > 0 
        ? `SUGGESTED IMPROVEMENTS (focus on these specific IDs): ${suggestions.join(', ')}` 
        : 'Apply all appropriate improvements to enhance the content.'}
      
      Create an improved version of the email that:
      1. Maintains the original message and core information
      2. Improves structure with clear sections and headings
      3. Enhances persuasive elements and strengthens calls-to-action
      4. Simplifies complex language for better readability
      5. Adds appropriate personalization elements
      
      Return only the enhanced content in markdown format. Do not include explanations or notes.
    `;

    const response = await openai!.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert email marketer specializing in optimizing content for maximum engagement and conversions." },
        { role: "user", content: prompt }
      ],
    });

    const enhancedContent = response.choices[0].message.content;
    
    res.json({ enhancedContent });
  } catch (error) {
    console.error('Error applying content improvements:', error);
    res.status(500).json({ error: 'Failed to apply content improvements' });
  }
});

export default router;