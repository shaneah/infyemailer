import OpenAI from 'openai';

// Get the API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
});

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
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured.');
  }

  try {
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
  } catch (error) {
    console.error('Error calling OpenAI for assistant response:', error);
    throw new Error('Failed to get response from AI assistant: ' + (error as Error).message);
  }
}