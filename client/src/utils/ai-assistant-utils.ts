/**
 * Message type for the AI assistant
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

/**
 * Helper function to add a message to the chat history
 * 
 * @param messages Current messages array
 * @param message New message to add
 * @returns Updated messages array
 */
export function addMessageToHistory(messages: Message[], message: Message): Message[] {
  // Add timestamp if not provided
  const messageWithTimestamp = {
    ...message,
    timestamp: message.timestamp || Date.now()
  };
  
  return [...messages, messageWithTimestamp];
}

/**
 * Format a timestamp into a readable time string
 * 
 * @param timestamp Timestamp in milliseconds
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Format a date into a readable date string
 * 
 * @param timestamp Timestamp in milliseconds
 * @returns Formatted date string (e.g., "Today", "Yesterday", or "Jan 1, 2023")
 */
export function formatMessageDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if the date is today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if the date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Otherwise, return the formatted date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Group messages by date
 * 
 * @param messages Array of messages
 * @returns Object with dates as keys and arrays of messages as values
 */
export function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  return messages.reduce((acc: Record<string, Message[]>, message) => {
    const timestamp = message.timestamp || Date.now();
    const dateString = formatMessageDate(timestamp);
    
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    
    acc[dateString].push(message);
    return acc;
  }, {});
}

/**
 * Get initial greeting message for the assistant
 * 
 * @returns Greeting message object
 */
export function getInitialGreeting(): Message {
  return {
    role: 'assistant',
    content: 'Hello! I\'m your AI email marketing assistant. How can I help you today?',
    timestamp: Date.now()
  };
}

/**
 * Get suggestions based on context
 * 
 * @param context Current conversation context
 * @returns Array of suggestion strings
 */
export function getSuggestionsByContext(context: string): string[] {
  const suggestions: Record<string, string[]> = {
    general: [
      'How can I improve my email open rates?',
      'What are the best days to send marketing emails?',
      'Help me craft an engaging subject line'
    ],
    templates: [
      'Create a product launch email template',
      'Help me write a welcome email for new subscribers',
      'What should I include in a re-engagement email?'
    ],
    analytics: [
      'What metrics should I track for email campaigns?',
      'What\'s a good click-through rate for my industry?',
      'How can I improve my email conversion rate?'
    ],
    deliverability: [
      'Why are my emails going to spam?',
      'How can I improve my sender reputation?',
      'What are DKIM and SPF records?'
    ],
    segmentation: [
      'How should I segment my email list?',
      'What are the best ways to personalize emails?',
      'How often should I email different segments?'
    ],
    compliance: [
      'What are the GDPR requirements for email marketing?',
      'Do I need double opt-in for my email list?',
      'What should I include in my email footer?'
    ]
  };
  
  return suggestions[context] || suggestions.general;
}

/**
 * Filter out sensitive or identifying information from a message
 * 
 * @param message Original message
 * @returns Sanitized message
 */
export function sanitizeMessage(message: string): string {
  // Mask email addresses
  message = message.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, '[EMAIL]');
  
  // Mask phone numbers (various formats)
  message = message.replace(/(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g, '[PHONE]');
  
  // Mask credit card numbers
  message = message.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[CARD]');
  
  // Mask API keys (generic pattern for API keys)
  message = message.replace(/[a-zA-Z0-9_-]{20,}/g, '[API_KEY]');
  
  return message;
}

/**
 * Check if AI service is likely available based on response status
 * 
 * @param status Status object from the AI service
 * @returns Boolean indicating if the service likely has valid credentials
 */
export function isAIServiceConfigured(status: { 
  openaiConfigured: boolean, 
  mockProvided: boolean 
}): boolean {
  return status.openaiConfigured === true;
}

/**
 * Parse markdown content from the AI response
 * 
 * @param content Markdown content
 * @returns HTML content (safe to use with dangerouslySetInnerHTML)
 */
export function parseMessageContent(content: string): string {
  // This is a very basic implementation - in a real app, use a markdown parser like marked
  
  // Replace code blocks
  content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Replace inline code
  content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Replace bold text
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Replace italic text
  content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Replace links
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Replace line breaks
  content = content.replace(/\n/g, '<br>');
  
  return content;
}