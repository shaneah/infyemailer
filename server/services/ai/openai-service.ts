import OpenAI from 'openai';
import { ChatMessage } from '../../../client/src/utils/ai-assistant-utils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key' // Fallback to mock mode if no API key
});

export class OpenAIService {
  private isMockMode: boolean;

  constructor() {
    // Check if we're in mock mode (no API key)
    this.isMockMode = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key';
    console.log(`OpenAI Service initialized in ${this.isMockMode ? 'mock' : 'live'} mode`);
  }

  /**
   * Get a chat completion from OpenAI or mock if no API key
   */
  async getChatCompletion(
    history: ChatMessage[],
    systemPrompt: string = "You are a helpful assistant."
  ): Promise<string> {
    try {
      if (this.isMockMode) {
        return this.getMockResponse(history[history.length - 1]?.content || "Hello", systemPrompt);
      }

      // Prepare messages for OpenAI
      const messages = [
        { 
          role: "system", 
          content: systemPrompt 
        },
        ...history,
      ];

      // Call OpenAI API
      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        model: "gpt-4o",
        messages: messages as any, // TypeScript fix for role types
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Error getting chat completion:', error);
      
      // Fall back to mock if API error
      return this.getMockResponse(history[history.length - 1]?.content || "Hello", systemPrompt);
    }
  }

  /**
   * Generate email marketing best practices
   */
  async getEmailMarketingBestPractices(topic?: string): Promise<string[]> {
    try {
      if (this.isMockMode) {
        return this.getMockBestPractices(topic);
      }

      const prompt = topic
        ? `Provide a list of 8-10 specific best practices for email marketing related to "${topic}". Each practice should be a concise sentence. Return JSON array of strings.`
        : `Provide a list of 8-10 general best practices for email marketing. Each practice should be a concise sentence. Return JSON array of strings.`;

      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an email marketing expert assistant." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || "{}";
      const parsedContent = JSON.parse(content);
      
      return parsedContent.bestPractices || [];
    } catch (error) {
      console.error('Error getting best practices from OpenAI:', error);
      return this.getMockBestPractices(topic);
    }
  }

  /**
   * Analyze an email subject line
   */
  async analyzeSubjectLine(subjectLine: string): Promise<any> {
    try {
      if (this.isMockMode) {
        return this.getMockSubjectLineAnalysis(subjectLine);
      }

      const prompt = `Analyze this email subject line: "${subjectLine}".
      Provide:
      1. A score from 1-10
      2. Brief feedback (max 2 sentences)
      3. Three alternative suggestions that might perform better
      4. One key strength of this subject line
      5. One weakness or area for improvement

      Return as JSON with keys: score, feedback, suggestions (array), strength, weakness`;

      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an email marketing expert assistant specializing in subject lines and open rates." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || "{}";
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing subject line with OpenAI:', error);
      return this.getMockSubjectLineAnalysis(subjectLine);
    }
  }

  /**
   * Suggest improvements for an email
   */
  async suggestEmailImprovements(emailContent: string): Promise<any> {
    try {
      if (this.isMockMode) {
        return this.getMockEmailImprovements(emailContent);
      }

      const prompt = `Review this email content and suggest improvements:
      
      ${emailContent}
      
      Provide:
      1. A list of 3-5 specific improvements
      2. A revised version of the email content
      
      Return as JSON with keys: improvements (array of strings), revisedContent (string)`;

      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an email marketing expert assistant specializing in email copywriting." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || "{}";
      return JSON.parse(content);
    } catch (error) {
      console.error('Error suggesting email improvements with OpenAI:', error);
      return this.getMockEmailImprovements(emailContent);
    }
  }

  /**
   * Generate an email template
   */
  async generateEmailTemplate(params: {
    subject: string;
    purpose: string;
    audience: string;
    tone?: string;
    length?: 'short' | 'medium' | 'long';
    includeCallToAction?: boolean;
    specialInstructions?: string;
  }): Promise<string> {
    try {
      if (this.isMockMode) {
        return this.getMockEmailTemplate(params);
      }

      const prompt = `Generate an email template with:
      
      - Subject: ${params.subject}
      - Purpose: ${params.purpose}
      - Target audience: ${params.audience}
      ${params.tone ? `- Tone: ${params.tone}` : ''}
      ${params.length ? `- Length: ${params.length}` : ''}
      ${params.includeCallToAction ? '- Include a clear call to action' : ''}
      ${params.specialInstructions ? `- Special instructions: ${params.specialInstructions}` : ''}
      
      Return the email template content as plain text with basic formatting. Include a subject line, greeting, body, call-to-action (if requested), and signature.`;

      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an email marketing expert assistant specializing in email template creation." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error('Error generating email template with OpenAI:', error);
      return this.getMockEmailTemplate(params);
    }
  }

  // MOCK IMPLEMENTATIONS FOR FALLBACK

  /**
   * Get a mock response based on the user's message
   */
  private getMockResponse(message: string, systemPrompt: string): string {
    // Choose response based on message content
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return "Hello! I'm your email marketing assistant. I can help you with email campaigns, templates, and marketing strategies. What would you like to know today?";
    }

    if (message.toLowerCase().includes('subject') && message.toLowerCase().includes('line')) {
      return "Subject lines are crucial for email open rates! Keep them under 50 characters, create urgency or curiosity, and personalize when possible. A/B testing different subject lines can increase your open rates by 10-30%.";
    }

    if (message.toLowerCase().includes('open rate')) {
      return "To improve email open rates: 1) Write compelling subject lines, 2) Send at optimal times (Tuesdays and Thursdays often work well), 3) Segment your audience, 4) Optimize for mobile, 5) Keep your email list clean by removing inactive subscribers, and 6) Use a recognizable sender name.";
    }

    if (message.toLowerCase().includes('template')) {
      return "For effective email templates, focus on: 1) A clean, mobile-responsive design, 2) Concise copy with clear value proposition, 3) A prominent call-to-action button, 4) Limited use of images, 5) Proper spacing and hierarchy, and 6) Alt text for all images.";
    }

    if (message.toLowerCase().includes('segment')) {
      return "Email list segmentation is powerful! You can segment based on demographics (age, location), behavior (past purchases, website activity), engagement level (active vs. inactive), customer journey stage, or preferences. Segmented campaigns can increase revenue by up to 760% compared to one-size-fits-all campaigns.";
    }

    if (message.toLowerCase().includes('call to action') || message.toLowerCase().includes('cta')) {
      return "Effective CTAs should be: 1) Action-oriented with clear verbs, 2) Create a sense of urgency, 3) Stand out visually, 4) Be positioned prominently, and 5) Communicate value. Instead of 'Click here', try 'Get your free guide now' or 'Start saving today'.";
    }

    // Generic response based on system prompt
    if (systemPrompt.includes('email marketing expert')) {
      return "As an email marketing specialist, I recommend focusing on list quality over quantity, segmenting your audience, personalizing content, and testing different approaches. What specific aspect of email marketing are you working on?";
    }

    if (systemPrompt.includes('template design')) {
      return "For email template design, prioritize mobile responsiveness, clear hierarchy, appropriate white space, and a prominent call-to-action. Simple designs often outperform complex ones. What kind of template are you designing?";
    }

    if (systemPrompt.includes('campaign strategy')) {
      return "Successful email campaigns start with clear goals, followed by audience segmentation, compelling content, and thorough testing. Always track key metrics to continuously improve. What type of campaign are you planning?";
    }

    // Default response
    return "I'm your email marketing assistant. I can help with campaign strategy, email templates, subscriber engagement, and analytics. What specific information are you looking for today?";
  }

  /**
   * Get mock best practices
   */
  private getMockBestPractices(topic?: string): string[] {
    if (topic?.toLowerCase().includes('subject')) {
      return [
        "Keep subject lines under 50 characters to ensure they display fully on mobile devices",
        "Use personalization in subject lines to increase open rates by 26%",
        "A/B test subject lines with different approaches (question vs. statement, emotional vs. logical)",
        "Include a sense of urgency or scarcity when appropriate ('Ending soon', 'Limited spots')",
        "Avoid spam trigger words like 'free', 'guarantee', and excessive punctuation",
        "Create curiosity with a knowledge gap that entices recipients to open",
        "Consider using emoji sparingly to make subject lines stand out in crowded inboxes",
        "Front-load important words as mobile devices show fewer characters"
      ];
    }

    if (topic?.toLowerCase().includes('deliverability')) {
      return [
        "Use a dedicated IP address for sending high-volume email campaigns",
        "Implement SPF, DKIM, and DMARC authentication protocols",
        "Regularly clean your email list by removing inactive subscribers",
        "Monitor your sender reputation score with tools like SenderScore",
        "Gradually warm up new IP addresses instead of sending high volumes immediately",
        "Maintain a consistent sending schedule to establish sender patterns",
        "Include a clear unsubscribe option in every email",
        "Set up feedback loops with major ISPs to receive bounce and complaint data"
      ];
    }

    if (topic?.toLowerCase().includes('segmentation')) {
      return [
        "Segment by engagement level to send re-engagement campaigns to inactive subscribers",
        "Use behavioral segmentation based on website visits, purchases, or email clicks",
        "Create segments based on customer lifecycle stage or buyer journey position",
        "Develop geographic segments for location-specific offers or time zone appropriate sending",
        "Segment by past purchase behavior to create targeted product recommendations",
        "Create preference-based segments using data collected through preference centers",
        "Use RFM (Recency, Frequency, Monetary) analysis to identify high-value customer segments",
        "Develop psychographic segments based on interests, values, and lifestyle"
      ];
    }

    // Default best practices
    return [
      "Segment your email list for more targeted and relevant messaging",
      "Use a clear and compelling call-to-action button in every email",
      "Optimize your emails for mobile devices with responsive design",
      "Personalize content beyond just using the recipient's name",
      "Test different send times to find when your audience is most engaged",
      "Maintain a consistent sending schedule to build subscriber expectations",
      "Clean your email list regularly by removing inactive subscribers",
      "Use A/B testing to continuously improve email performance",
      "Include alt text for images as many email clients block images by default",
      "Focus on providing value in every email you send"
    ];
  }

  /**
   * Get mock subject line analysis
   */
  private getMockSubjectLineAnalysis(subjectLine: string): any {
    // Generate a score based on length - optimal is 30-50 chars
    const length = subjectLine.length;
    let score = 7; // Default score
    
    if (length < 20) score = 5; // Too short
    else if (length > 60) score = 6; // Too long
    else if (length >= 30 && length <= 50) score = 8; // Optimal range
    
    // Bump score for some positive patterns
    if (subjectLine.includes('?')) score += 1; // Questions perform well
    if (subjectLine.includes('!')) score = Math.min(score + 1, 10); // Excitement can help
    if (subjectLine.toLowerCase().includes('you') || subjectLine.toLowerCase().includes('your')) score = Math.min(score + 1, 10); // Personalization
    
    // Lower score for some negative patterns
    if (subjectLine.toUpperCase() === subjectLine) score = Math.max(score - 2, 1); // ALL CAPS is bad
    if (subjectLine.includes('free') || subjectLine.includes('buy')) score = Math.max(score - 1, 1); // Promotional language
    if (subjectLine.split(' ').length < 3) score = Math.max(score - 1, 1); // Too few words
    
    return {
      score,
      feedback: `Subject line "${subjectLine}" is ${score >= 8 ? 'strong' : 'decent'}. ${length < 30 ? 'Consider adding more detail.' : length > 50 ? 'Consider shortening for mobile users.' : 'Length is optimal for most inboxes.'}`,
      suggestions: [
        `${subjectLine.length > 5 ? subjectLine.substring(0, subjectLine.length - 5) : subjectLine} - Limited Time Offer`,
        `[New] ${subjectLine}`,
        `Don't miss: ${subjectLine}`
      ],
      strength: score >= 8 ? 'Good length and engaging content' : 'Clear and straightforward messaging',
      weakness: score < 7 ? 'Could be more personalized and create more urgency' : 'Consider A/B testing with more emotional triggers'
    };
  }

  /**
   * Get mock email improvements
   */
  private getMockEmailImprovements(emailContent: string): any {
    const contentLength = emailContent.length;
    
    return {
      improvements: [
        "Add a more compelling subject line that creates curiosity",
        "Break up large blocks of text into smaller paragraphs for better readability",
        "Include a clear and prominent call-to-action button",
        "Add social proof or testimonials to build credibility",
        contentLength > 1000 ? "Shorten the email to improve readability" : "Add more personalization to increase engagement"
      ],
      revisedContent: emailContent // In mock mode, just return the original content
    };
  }

  /**
   * Get mock email template
   */
  private getMockEmailTemplate(params: any): string {
    const ctaText = params.includeCallToAction !== false ? '\n\n[CTA Button: Learn More]' : '';
    let greeting = 'Hello {First_Name},';
    let closing = '\n\nBest regards,\nThe Team';
    
    if (params.tone?.toLowerCase().includes('formal')) {
      greeting = 'Dear {First_Name},';
      closing = '\n\nSincerely,\nThe Team';
    } else if (params.tone?.toLowerCase().includes('casual')) {
      greeting = 'Hey {First_Name}!';
      closing = '\n\nCheers,\nThe Team';
    }
    
    let body = `\n\nWe wanted to reach out to you about ${params.subject}. We understand that as ${params.audience}, you're looking for solutions that address ${params.purpose}.`;
    
    if (params.length === 'short') {
      body += `\n\nWe'd love to hear your thoughts on this!`;
    } else if (params.length === 'long') {
      body += `\n\nOur team has been working hard to create something that we believe will be valuable for you. We've taken into account the specific needs and challenges that ${params.audience} face when it comes to ${params.purpose}.\n\nWe've seen how these challenges can impact your day-to-day operations, and we're committed to helping you overcome them with innovative solutions designed specifically for your needs.\n\nWe'd love to schedule some time to discuss how we can help you address ${params.purpose} more effectively.`;
    } else {
      body += `\n\nOur team has been working hard to create something that we believe will be valuable for you. We've taken into account the specific needs and challenges that ${params.audience} face when it comes to ${params.purpose}.\n\nWe'd love to hear your thoughts on this!`;
    }
    
    let postScript = '\n\nP.S. Feel free to reply to this email if you have any questions.';
    
    if (params.specialInstructions) {
      postScript = `\n\nP.S. ${params.specialInstructions}`;
    }

    return `Subject: ${params.subject}\n\n${greeting}${body}${ctaText}${closing}${postScript}`;
  }
}