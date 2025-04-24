/**
 * Mock implementation for AI assistant responses when OpenAI API is not available
 */

const commonEmailResponses = [
  "Subject lines should be short (30-50 characters) and personalized to increase open rates.",
  "Segmenting your email list based on user behavior can increase engagement by up to 760%.",
  "The best time to send emails is generally Tuesday through Thursday mornings, but you should test what works best for your audience.",
  "Including a clear call-to-action improves click-through rates significantly.",
  "Mobile-responsive email designs are crucial since over 60% of emails are opened on mobile devices.",
  "Personalized emails deliver 6x higher transaction rates, but fewer than 30% of brands use them.",
  "Plain-text emails often perform better than heavily designed HTML emails in certain contexts, particularly for B2B communication.",
  "A/B testing subject lines can increase open rates by 49% according to recent studies.",
  "Keep your email copy concise - readers typically spend less than 10 seconds scanning an email.",
  "Using a real reply-to address instead of 'noreply@' can improve engagement and deliverability."
];

/**
 * Generates a mock response for the AI assistant
 * 
 * @param message - The user's message
 * @returns string - A response that appears to be from an AI assistant
 */
export function generateMockResponse(message: string): string {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Check for specific keywords to provide somewhat relevant responses
  if (lowerMessage.includes('subject line') || lowerMessage.includes('subject lines')) {
    return "For effective subject lines, keep them under 50 characters, personalize them when possible, and create a sense of urgency or curiosity. Avoid spam trigger words like 'free' or excessive punctuation. A/B testing different subject lines is the best way to determine what works for your specific audience.";
  }
  
  if (lowerMessage.includes('open rate') || lowerMessage.includes('open rates')) {
    return "To improve email open rates, focus on optimizing your subject lines, segment your audience for more targeted content, clean your email list regularly, and send at optimal times based on your audience's behavior. The average open rate across industries is around 20-25%, but this varies significantly by industry.";
  }
  
  if (lowerMessage.includes('click') || lowerMessage.includes('ctr') || lowerMessage.includes('click through')) {
    return "To improve click-through rates, make sure your CTAs are clear and compelling, use button-style CTAs instead of text links when possible, create a sense of urgency, and ensure your email content delivers on the promise of your subject line. The average click-through rate is typically between 2-5%, depending on your industry.";
  }
  
  if (lowerMessage.includes('segment') || lowerMessage.includes('targeting')) {
    return "Email segmentation is crucial for higher engagement. You can segment your audience based on demographics, past purchase behavior, engagement level, or position in the sales funnel. Even basic segmentation can increase open rates by 14% and clicks by 101% compared to non-segmented campaigns.";
  }
  
  if (lowerMessage.includes('template') || lowerMessage.includes('design')) {
    return "Effective email templates should be mobile-responsive, have a clean design with plenty of white space, use a clear hierarchy with your most important message at the top, and include compelling visuals that support your message. Always test your templates across different email clients before sending.";
  }
  
  if (lowerMessage.includes('personalize') || lowerMessage.includes('personalization')) {
    return "Email personalization goes beyond just using a recipient's name. Consider personalizing based on past purchases, browsing behavior, or engagement history. Personalized emails deliver 6x higher transaction rates, but fewer than 30% of brands use advanced personalization strategies.";
  }
  
  if (lowerMessage.includes('deliverability') || lowerMessage.includes('spam')) {
    return "To improve email deliverability, maintain a clean email list, use double opt-in, avoid spam trigger words, authenticate your domain with SPF and DKIM records, maintain a good sender reputation, and monitor your bounce rates. Consistently sending relevant content to engaged subscribers is the best long-term strategy.";
  }
  
  // Default responses for general questions
  if (lowerMessage.includes('best practice') || lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
    const randomIndex = Math.floor(Math.random() * commonEmailResponses.length);
    return commonEmailResponses[randomIndex];
  }
  
  // Fallback for when we can't determine the specific topic
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.length < 10) {
    return "Hello! I'm your email marketing assistant. I can help with subject line ideas, content suggestions, or best practices for improving your email campaigns. What specific aspect of email marketing are you interested in learning more about?";
  }
  
  return "I'd be happy to help with your email marketing questions. Could you provide more specific details about what you're looking to learn or improve? I can assist with subject lines, content creation, segmentation strategies, analytics interpretation, or best practices for higher engagement.";
}