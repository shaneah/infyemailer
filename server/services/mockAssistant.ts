/**
 * This file provides mock responses for the AI assistant when OpenAI is unavailable
 */

// A set of pre-defined responses for common email marketing questions
const EMAIL_MARKETING_RESPONSES = {
  subject_lines: [
    "For effective subject lines: keep them under 50 characters, create urgency, avoid spam words, personalize when possible, and A/B test different versions. Some examples: \"Last Day: 25% Off Your Favorites\" or \"[Name], Your Custom Report Is Ready\".",
    "Great subject lines follow these rules: 1) Be specific and clear, 2) Create curiosity or urgency, 3) Keep it under 60 characters, 4) Include personalization when possible. Consider testing subject lines like \"5 strategies that increased our open rates by 37%\" or \"[Name], your exclusive invitation expires tonight\"."
  ],
  
  email_design: [
    "For email design best practices: use responsive templates, keep your design clean with plenty of white space, limit to 1-2 fonts, ensure your CTA buttons stand out in color and size, and place important content above the fold. Mobile optimization is absolutely essential as over 60% of emails are now opened on mobile devices.",
    "Effective email design includes: responsive mobile-first layout, clear hierarchy of information, consistent brand colors, prominent CTA buttons, and balanced text-to-image ratio (60:40 is a good target). Remember that many email clients block images by default, so never put critical information in images without text alternatives."
  ],
  
  segmentation: [
    "Email segmentation increases engagement by delivering relevant content. Segment your audience by: purchase history, engagement level, demographics, website behavior, or signup source. Even basic segmentation can increase open rates by 14% and conversions by 10% compared to non-segmented campaigns.",
    "The most effective segmentation strategies include: dividing subscribers by past purchase behavior, email engagement levels, customer lifecycle stage, geographic location, and interests shown through web browsing. Start with 3-4 segments before creating more complex audience divisions."
  ],
  
  deliverability: [
    "To improve email deliverability: regularly clean your list of inactive subscribers, use double opt-in, maintain a good sender reputation, authenticate your domain with SPF/DKIM/DMARC, and monitor your spam complaints. Consistency in sending frequency also helps ISPs recognize your sending patterns as legitimate.",
    "Deliverability best practices include: proper authentication setup (SPF, DKIM, DMARC), maintaining list hygiene by removing unengaged subscribers after 6-12 months, keeping bounce rates under 2%, having an easy unsubscribe process, and warming up new sending domains gradually."
  ],
  
  testing: [
    "For effective A/B testing: test only one element at a time, use a large enough sample size (at least 1,000 subscribers per variant for statistical significance), and run tests for at least 24 hours. Common elements to test include subject lines, preheader text, CTA button color/text, send time, and content layout.",
    "Successful A/B testing requires: clear hypothesis for each test, testing just one variable at a time, statistically significant sample sizes, consistent testing schedule, and documenting results for future campaigns. The most impactful elements to test are typically subject lines, sender names, and call-to-action buttons."
  ],
  
  metrics: [
    "Key email marketing metrics to track: open rate (15-25% is average across industries), click-through rate (2-5% is typical), conversion rate, bounce rate (keep under 2%), unsubscribe rate (under 0.5% is good), and overall ROI. Track trends over time rather than focusing on individual campaign performance.",
    "The most important metrics for email campaigns are: open rate, click-through rate, conversion rate, list growth rate, and revenue per email. Industry benchmarks vary widely, but aim for open rates above 20%, CTR above 3%, and unsubscribe rates below 0.2%."
  ],
  
  frequency: [
    "Email sending frequency depends on your audience and content quality. For most businesses, 1-2 emails per week is a safe range. Always set expectations during signup about how often subscribers will hear from you, and consider allowing subscribers to select their preferred frequency through a preference center.",
    "Finding the optimal email frequency requires testing. Start with 1 email per week and measure engagement. If open rates and clicks remain stable when increasing to 2 weekly emails, you might try 3. Watch for increases in unsubscribes or declining engagement as signs of sending too frequently."
  ],
  
  content: [
    "Engaging email content: starts with a compelling headline, uses short paragraphs and bullet points, includes personalized elements, tells a story, and always delivers value before asking for action. The ideal content mix is 90% educational/valuable and 10% promotional.",
    "The most effective email content is: personalized to the recipient's interests, concise (200-300 words for promotional emails), visually appealing with a clear hierarchy, conversational in tone, and focused on benefits rather than features. Always include a clear, compelling call-to-action."
  ],
  
  automation: [
    "Essential email automations include: welcome sequence (3-5 emails), abandoned cart recovery, post-purchase follow-up, re-engagement campaign for inactive subscribers, and milestone/birthday emails. These automated flows can generate up to 70% of email revenue while reducing your daily workload.",
    "Start your automation strategy with these key workflows: welcome series (introduce your brand over 3-4 emails), browse/cart abandonment (send 1-3 hours after abandonment), post-purchase sequence (confirmation, shipping, feedback request), and win-back campaign (for subscribers inactive for 3+ months)."
  ]
};

// General fallback responses when we can't match the query to a specific topic
const FALLBACK_RESPONSES = [
  "Email marketing best practices include: building a quality list with proper opt-in, segmenting your audience, creating mobile-responsive designs, personalizing content when possible, testing before sending, and analyzing results to continuously improve.",
  
  "The foundation of successful email marketing is: respecting your subscribers' inbox, delivering relevant content, maintaining consistent sending patterns, using clear calls-to-action, and continuously testing to improve performance.",
  
  "To improve your email marketing results: focus on list quality over quantity, segment your audience for relevance, craft compelling subject lines under 50 characters, design for mobile first, include a single primary call-to-action, and analyze metrics to refine your approach."
];

/**
 * Provides a mock response based on the user's message and context
 */
export function getMockAssistantResponse(message: string, context: string = 'general'): string {
  // If not in email marketing context, provide a general assistant response
  if (context !== 'email_marketing') {
    return "I'm an AI assistant. I can help answer questions, generate content, or discuss various topics. How can I assist you today?";
  }
  
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Try to match the message to relevant topics
  if (lowerMessage.includes('subject line') || lowerMessage.includes('headline')) {
    return getRandomResponse(EMAIL_MARKETING_RESPONSES.subject_lines);
  } 
  else if (lowerMessage.includes('design') || lowerMessage.includes('layout') || lowerMessage.includes('template')) {
    return getRandomResponse(EMAIL_MARKETING_RESPONSES.email_design);
  }
  else if (lowerMessage.includes('segment') || lowerMessage.includes('target') || lowerMessage.includes('audience')) {
    return getRandomResponse(EMAIL_MARKETING_RESPONSES.segmentation);
  }
  else if (lowerMessage.includes('deliver') || lowerMessage.includes('inbox') || lowerMessage.includes('spam')) {
    return getRandomResponse(EMAIL_MARKETING_RESPONSES.deliverability);
  }
  else if (lowerMessage.includes('test') || lowerMessage.includes('ab test') || lowerMessage.includes('a/b')) {
    return getRandomResponse(EMAIL_MARKETING_RESPONSES.testing);
  }
  else if (lowerMessage.includes('metric') || lowerMessage.includes('measure') || lowerMessage.includes('track') || lowerMessage.includes('analytics')) {
    return getRandomResponse(EMAIL_MARKETING_RESPONSES.metrics);
  }
  else if (lowerMessage.includes('frequency') || lowerMessage.includes('often') || lowerMessage.includes('how many')) {
    return getRandomResponse(EMAIL_MARKETING_RESPONSES.frequency);
  }
  else if (lowerMessage.includes('content') || lowerMessage.includes('write') || lowerMessage.includes('copy')) {
    return getRandomResponse(EMAIL_MARKETING_RESPONSES.content);
  }
  else if (lowerMessage.includes('automat') || lowerMessage.includes('workflow') || lowerMessage.includes('trigger')) {
    return getRandomResponse(EMAIL_MARKETING_RESPONSES.automation);
  }
  
  // If no specific topic matches, return a general email marketing response
  return getRandomResponse(FALLBACK_RESPONSES);
}

/**
 * Helper function to get a random response from an array
 */
function getRandomResponse(responses: string[]): string {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}