import OpenAI from 'openai';
import { generateMockResponse } from './mockAssistant';

// Get the API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Determine whether to use mock implementation
const useMockImplementation = !apiKey || process.env.USE_MOCK_ASSISTANT === 'true';

// Log configuration
console.log(`AI Assistant: Using ${useMockImplementation ? 'MOCK' : 'REAL'} implementation`);

// Initialize the OpenAI client if we have an API key
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Define the interface for message history
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generates a response from the AI assistant based on the provided message and conversation history
 * 
 * @param message - The current user message
 * @param history - The conversation history
 * @returns Promise<string> - The AI assistant's response
 */
export async function getAssistantResponse(
  message: string,
  history: Message[] = []
): Promise<string> {
  // Use mock implementation if API key is not available or mock mode is enabled
  if (useMockImplementation) {
    console.log('Using mock assistant response generation');
    return generateMockResponse(message);
  }
  
  if (!apiKey || !openai) {
    console.warn('OpenAI API key is not configured, falling back to mock implementation');
    return generateMockResponse(message);
  }

  try {
    console.log('Using real OpenAI for assistant response');
    
    // Create conversation messages including a system prompt for context
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are an expert email marketing assistant for an email marketing platform called InfyMailer.
        
Your goal is to help marketers create better email campaigns, improve their metrics, and follow best practices.
        
Email marketing topics you can help with:
- Subject line optimization
- Email body content suggestions
- A/B testing strategies
- Email design best practices
- Audience segmentation tips
- Improving open rates and click-through rates
- Email deliverability improvement
- Campaign scheduling optimization
- Personalization strategies
- Compliance with email regulations (GDPR, CAN-SPAM, etc.)
        
Keep your answers helpful, concise, and actionable. Avoid overly technical jargon when possible.
When appropriate, suggest specific actions the user can take in their email marketing platform.`
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    try {
      // Call the OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      // Extract and return the response
      const response = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response at this time.';
      
      return response;
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      console.log('Falling back to mock implementation due to API error');
      return generateMockResponse(message);
    }
  } catch (error) {
    console.error('Error in assistant service:', error);
    // Fallback to mock implementation in case of any errors
    return generateMockResponse(message);
  }
}