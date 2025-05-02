import { apiRequest } from "../lib/queryClient";

// Types for AI Assistant functionality
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  history: ChatMessage[];
}

export interface SubjectLineAnalysis {
  score: number;
  feedback: string;
  suggestions: string[];
  strength: string;
  weakness: string;
}

export interface EmailImprovements {
  improvements: string[];
  revisedContent: string;
}

export interface TemplateParams {
  subject: string;
  purpose: string;
  audience: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  includeCallToAction?: boolean;
  specialInstructions?: string;
}

// Function to send a chat message to the AI assistant
export async function sendChatMessage(
  message: string,
  context: string = 'general',
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    const response = await apiRequest('POST', '/api/ai-assistant/chat', {
      message,
      context,
      history
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get assistant response');
    }
    
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    // Return a fallback response
    return {
      message: "I'm sorry, but I encountered an error processing your request. Please try again later.",
      history: [
        ...history,
        { role: 'user', content: message },
        { role: 'assistant', content: "I'm sorry, but I encountered an error processing your request. Please try again later." }
      ]
    };
  }
}

// Function to get email marketing best practices
export async function getBestPractices(topic?: string): Promise<string[]> {
  try {
    const response = await apiRequest('POST', '/api/ai-assistant/best-practices', {
      topic
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get best practices');
    }
    
    return data.bestPractices || [];
  } catch (error) {
    console.error('Error getting best practices:', error);
    // Return fallback best practices
    return [
      'Segment your email list for more targeted messaging',
      'Use clear and compelling subject lines (30-50 characters)',
      'Optimize for mobile devices with responsive design',
      'Personalize content beyond just using recipient names',
      'Test different send times to find optimal engagement',
      'Include a clear call-to-action button with compelling text',
      'Keep emails concise and focused on a single goal',
      'Use alt text for images as many email clients block images by default'
    ];
  }
}

// Function to analyze a subject line
export async function analyzeSubjectLine(subjectLine: string): Promise<SubjectLineAnalysis> {
  try {
    const response = await apiRequest('POST', '/api/ai-assistant/analyze-subject', {
      subjectLine
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze subject line');
    }
    
    return data;
  } catch (error) {
    console.error('Error analyzing subject line:', error);
    // Return a fallback analysis
    return {
      score: 7,
      feedback: `Subject line "${subjectLine}" is of moderate effectiveness. Best practices suggest keeping subject lines between 30-50 characters.`,
      suggestions: [
        `${subjectLine} - Limited Time`,
        `Don't Miss: ${subjectLine}`,
        `[New] ${subjectLine}`
      ],
      strength: 'Clear and direct messaging',
      weakness: 'Could be more personalized or create more urgency'
    };
  }
}

// Function to get suggestions for improving an email
export async function suggestEmailImprovements(emailContent: string): Promise<EmailImprovements> {
  try {
    const response = await apiRequest('POST', '/api/ai-assistant/suggest-improvements', {
      emailContent
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to suggest improvements');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting email improvement suggestions:', error);
    // Return fallback improvements
    return {
      improvements: [
        'Consider adding a more compelling subject line',
        'Break up large blocks of text into smaller paragraphs',
        'Add a clear call-to-action button',
        'Include social proof or testimonials',
        'Personalize the greeting with recipient name'
      ],
      revisedContent: emailContent
    };
  }
}

// Function to generate an email template
export async function generateEmailTemplate(params: TemplateParams): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/ai-assistant/generate-template', params);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate template');
    }
    
    return data.template || '';
  } catch (error) {
    console.error('Error generating email template:', error);
    // Return a simple fallback template
    const ctaText = params.includeCallToAction !== false ? '\n\n[CTA Button: Learn More]' : '';
    return `Subject: ${params.subject}
    
Hello {First_Name},

We wanted to reach out to you about ${params.subject}. We understand that as ${params.audience}, you're looking for solutions that address ${params.purpose}.

Our team has been working hard to create something that we believe will be valuable for you. We've taken into account the specific needs and challenges that ${params.audience} face when it comes to ${params.purpose}.

We'd love to hear your thoughts on this!${ctaText}

Best regards,
The Team

P.S. Feel free to reply to this email if you have any questions.`;
  }
}

// Helper function to format timestamp for chat messages
export function formatTimestamp(date?: Date): string {
  const messageDate = date || new Date();
  return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Helper function to get suggested messages based on context
export function getSuggestedMessages(context: string = 'general'): string[] {
  switch (context) {
    case 'email_marketing':
      return [
        'How can I improve my email open rates?',
        'What are some effective subject line strategies?',
        'How often should I send marketing emails?',
        'What metrics should I track for my email campaigns?'
      ];
    case 'template_design':
      return [
        'What elements should every email template include?',
        'How can I make my emails mobile-friendly?',
        'What is the ideal width for an email template?',
        'How can I improve my email visual hierarchy?'
      ];
    case 'campaign_strategy':
      return [
        'How should I segment my email list?',
        'What is the best time to send marketing emails?',
        'How can I create an effective welcome series?',
        'How can I reduce unsubscribe rates?'
      ];
    default:
      return [
        'How can I improve my email marketing?',
        'What are some email best practices?',
        'How can I increase engagement in my campaigns?',
        'What makes a good email subject line?'
      ];
  }
}