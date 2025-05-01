import { Router } from 'express';
import OpenAI from 'openai';
import { log } from '../helpers/logger';

const router = Router();

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a type for the chat messages
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Create a mock implementation as a fallback
function mockAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('subject line') || lowerMessage.includes('subject lines')) {
    return "Great subject lines are crucial for email open rates! Here are some tips:\n\n• Keep it under 50 characters\n• Create a sense of urgency or curiosity\n• Personalize when possible\n• A/B test different approaches\n• Avoid spam trigger words like 'free', 'buy now', etc.\n• Consider using emojis strategically\n\nWould you like me to suggest some example subject lines for your campaign?";
  } 
  
  if (lowerMessage.includes('open rate') || lowerMessage.includes('click rate') || lowerMessage.includes('click-through')) {
    return "Improving email metrics is all about optimization! Here are some strategies:\n\n• Segment your audience for targeted content\n• Test different sending times\n• Clean your email list regularly\n• Use a recognizable sender name\n• Make sure your emails are mobile-friendly\n• Use compelling CTAs (calls to action)\n• Include relevant, valuable content\n\nIs there a specific metric you're trying to improve?";
  }
  
  if (lowerMessage.includes('segment') || lowerMessage.includes('segmentation')) {
    return "Email list segmentation is a powerful strategy! You can segment your audience by:\n\n• Demographics (age, location, etc.)\n• Past purchase behavior\n• Email engagement history\n• Website activity\n• Customer lifecycle stage\n• Survey responses\n• Content preferences\n\nOur platform makes it easy to create these segments and target your messaging appropriately. Would you like to know how to set up a specific segment?";
  }
  
  if (lowerMessage.includes('template') || lowerMessage.includes('design')) {
    return "Effective email design principles include:\n\n• Simple, clean layouts\n• Responsive design for mobile devices\n• Clear hierarchy with one primary CTA\n• Balanced text-to-image ratio\n• Brand consistency\n• Accessible design (alt text, contrast, etc.)\n• Footer with unsubscribe option and physical address\n\nOur template builder makes it easy to implement these best practices. Would you like help with a specific design element?";
  }

  if (lowerMessage.includes('analytics') || lowerMessage.includes('reporting') || lowerMessage.includes('performance')) {
    return "Email analytics help you understand campaign performance and make data-driven decisions. Key metrics to track include:\n\n• Open rate: Percentage of recipients who opened your email\n• Click-through rate (CTR): Percentage who clicked a link\n• Conversion rate: Percentage who completed a desired action\n• Bounce rate: Percentage of emails that weren't delivered\n• Unsubscribe rate: Percentage who opted out\n\nOur analytics dashboard visualizes these metrics with detailed breakdowns. Would you like tips on how to interpret a specific metric?";
  }
  
  if (lowerMessage.includes('ab test') || lowerMessage.includes('a/b test')) {
    return "A/B testing is essential for optimizing your emails! Here's how to run effective tests:\n\n• Test only one element at a time (subject line, CTA, images, etc.)\n• Use a significant sample size\n• Define clear success metrics\n• Test both similar and radically different versions\n• Run tests for enough time to gather meaningful data\n\nOur platform automates the test setup, delivery, and winner selection. Would you like help setting up an A/B test for your next campaign?";
  }
  
  // Default response if no specific topics are matched
  return "I'm here to help with all aspects of email marketing. You can ask me about:\n\n• Creating effective campaigns\n• Writing compelling subject lines\n• Designing email templates\n• Improving open and click rates\n• Segmenting your audience\n• Analyzing campaign performance\n• A/B testing strategies\n• Compliance best practices\n\nWhat specific area would you like assistance with today?";
}

// AI Assistant chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    log(`AI Assistant request: ${message}`, 'ai-assistant');
    
    // Create messages array for OpenAI
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an email marketing assistant integrated into an email marketing platform.
Your purpose is to provide helpful, concise advice on email marketing best practices, 
campaign optimization, and related topics. Answer questions briefly but comprehensively, 
focusing on actionable advice. When appropriate, mention features of our platform 
that might help solve the user's problem. Keep responses under 300 words.
Provide specific examples when possible. Be conversational but professional.`
      }
    ];
    
    // Add conversation history
    for (const item of history) {
      if (item.role === 'user' || item.role === 'assistant') {
        messages.push({
          role: item.role,
          content: item.content
        });
      }
    }
    
    // Add the current message
    messages.push({
      role: 'user',
      content: message
    });
    
    let aiResponse;
    
    // Try to use OpenAI, fall back to mock if error
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any[],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      aiResponse = response.choices[0].message.content;
      log(`AI Assistant used OpenAI for response`, 'ai-assistant');
    } catch (error) {
      // Fallback to mock implementation
      log(`OpenAI API error: ${error.message}. Using mock implementation.`, 'ai-assistant');
      aiResponse = mockAIResponse(message);
    }
    
    return res.json({
      response: aiResponse
    });
  } catch (error) {
    log(`Error in AI Assistant: ${error.message}`, 'ai-assistant');
    return res.status(500).json({
      error: 'An error occurred while processing your request'
    });
  }
});

export default router;