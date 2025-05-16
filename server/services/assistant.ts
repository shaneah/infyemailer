import OpenAI from 'openai';
import { getMockAssistantResponse } from './mockAssistant';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = 'gpt-4o';

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
  }
}

export interface AssistantRequest {
  message: string;
  context?: string;
  history?: Array<{ role: 'user' | 'assistant', content: string }>;
}

export interface AssistantResponse {
  response: string;
  source?: 'openai' | 'mock';
}

/**
 * Get a response from the AI assistant
 */
export async function getAssistantResponse(request: AssistantRequest): Promise<AssistantResponse> {
  const { message, context = 'general', history = [] } = request;

  // Try to use OpenAI if available
  if (openai) {
    try {
      // Build system prompt based on context
      let systemPrompt = 'You are a helpful AI assistant.';
      
      if (context === 'email_marketing') {
        systemPrompt = `You are an AI email marketing assistant specialized in helping users create effective email campaigns.
Your expertise includes:
- Subject line optimization
- Email content creation and improvement
- Campaign strategy
- A/B testing recommendations
- Best practices for deliverability
- Audience segmentation strategies
- Email marketing metrics and analytics
- Compliance with email regulations (like CAN-SPAM, GDPR)

If asked about specifics about the platform the user is using, explain you can only provide general marketing advice, not platform-specific technical support.

Keep responses concise, actionable, and focused on email marketing best practices. Always provide specific examples and practical tips.`;
      }

      // Prepare messages for the API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: messages as any, // Type assertion to satisfy TypeScript
        max_tokens: 1000,
        temperature: 0.7
      });

      const aiResponse = response.choices[0]?.message?.content || 
        "I'm sorry, I couldn't generate a response. Please try again.";

      return {
        response: aiResponse,
        source: 'openai'
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      // Fall back to mock response on error
      return {
        response: getMockAssistantResponse(message, context),
        source: 'mock'
      };
    }
  }

  // Fall back to mock response if OpenAI is not available
  console.warn('OpenAI API not available, using mock assistant responses');
  return {
    response: getMockAssistantResponse(message, context),
    source: 'mock'
  };
}