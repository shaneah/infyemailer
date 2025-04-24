import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const GPT_MODEL = "gpt-4o";

/**
 * Initialize the OpenAI client with API key from environment variables
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Assistant for email marketing that provides guidance, best practices,
 * and expertise for crafting effective campaigns
 */
export class OpenAIService {
  private isMocked: boolean;
  private lastError: Error | null = null;
  private errorCount: number = 0;
  private readonly MAX_ERRORS = 3;
  private readonly MOCK_DELAY_MS = 1000;

  constructor() {
    this.isMocked = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "";
    
    if (this.isMocked) {
      console.warn(
        "OpenAI API key not found. Using mock implementation for AI Assistant."
      );
    } else {
      console.log("OpenAI service initialized with API key.");
    }
  }

  /**
   * Get a chat completion from OpenAI
   * 
   * @param messages Array of message objects with role and content
   * @param systemPrompt Optional system prompt to guide the assistant
   * @returns The assistant's response
   */
  async getChatCompletion(
    messages: { role: "user" | "assistant" | "system"; content: string }[],
    systemPrompt?: string
  ): Promise<string> {
    if (this.errorCount >= this.MAX_ERRORS) {
      console.error("Too many OpenAI errors. Using mock implementation.");
      this.isMocked = true;
    }

    try {
      // If mocked or experiencing issues, use mock implementation
      if (this.isMocked) {
        return await this.getMockChatCompletion(messages, systemPrompt);
      }

      // Prepare messages array with system prompt if provided
      const fullMessages = systemPrompt
        ? [
            { role: "system", content: systemPrompt },
            ...messages,
          ]
        : messages;

      // Make the actual OpenAI API call
      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: fullMessages as any,
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Reset error count on successful call
      this.errorCount = 0;
      this.lastError = null;

      return response.choices[0].message.content || 
        "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error: any) {
      this.handleError(error);
      
      // Fall back to mock implementation after error
      return this.getMockChatCompletion(messages, systemPrompt);
    }
  }

  /**
   * Generate an email template draft based on user parameters
   * 
   * @param params Parameters for email generation
   * @returns Generated email template content
   */
  async generateEmailTemplate(params: {
    subject: string;
    purpose: string;
    audience: string;
    tone: string;
    length: "short" | "medium" | "long";
    includeCallToAction: boolean;
    specialInstructions?: string;
  }): Promise<string> {
    try {
      if (this.isMocked) {
        return this.getMockEmailTemplate(params);
      }

      const systemPrompt = `You are an expert email marketer that helps create effective email templates. 
      Focus on creating engaging, conversion-oriented content that follows best practices for email marketing.
      Create an email that maximizes engagement and response rates.`;

      const prompt = `Please create an email template with the following parameters:
      
      Subject: ${params.subject}
      Purpose: ${params.purpose}
      Target Audience: ${params.audience}
      Tone: ${params.tone}
      Length: ${params.length}
      Include Call To Action: ${params.includeCallToAction ? "Yes" : "No"}
      ${params.specialInstructions ? `Special Instructions: ${params.specialInstructions}` : ""}
      
      Return only the email template text, properly formatted with paragraphs and spacing.`;

      const messages = [{ role: "user" as const, content: prompt }];
      
      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || 
        this.getMockEmailTemplate(params);
    } catch (error: any) {
      this.handleError(error);
      return this.getMockEmailTemplate(params);
    }
  }

  /**
   * Analyze an email subject line and provide feedback on effectiveness
   * 
   * @param subjectLine The email subject line to analyze
   * @returns Analysis and recommendations for improvement
   */
  async analyzeSubjectLine(subjectLine: string): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
    strength: string;
    weakness: string;
  }> {
    try {
      if (this.isMocked) {
        return this.getMockSubjectLineAnalysis(subjectLine);
      }

      const systemPrompt = `You are an expert email marketer specialized in analyzing subject lines. 
      Your task is to evaluate the effectiveness of email subject lines and provide constructive feedback 
      to improve open rates. Return your analysis as JSON with the fields: score (1-10), feedback, 
      suggestions (array), strength, weakness.`;

      const prompt = `Please analyze this email subject line: "${subjectLine}"`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      return JSON.parse(content);
    } catch (error: any) {
      this.handleError(error);
      return this.getMockSubjectLineAnalysis(subjectLine);
    }
  }

  /**
   * Provide email marketing best practices and tips
   * 
   * @param topic Optional specific topic to get best practices for
   * @returns List of best practices
   */
  async getEmailMarketingBestPractices(topic?: string): Promise<string[]> {
    try {
      if (this.isMocked) {
        return this.getMockEmailMarketingBestPractices(topic);
      }

      const systemPrompt = `You are an expert email marketer with deep knowledge of best practices.
      Provide concise, actionable tips that can help improve email marketing performance.
      Return your response as a JSON array of strings, with each string being a specific best practice.`;

      const prompt = topic 
        ? `Provide best practices for email marketing focused on: ${topic}` 
        : "Provide general best practices for effective email marketing campaigns";

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : parsed.bestPractices || [];
    } catch (error: any) {
      this.handleError(error);
      return this.getMockEmailMarketingBestPractices(topic);
    }
  }

  /**
   * Suggest improvements for an existing email to increase engagement
   * 
   * @param emailContent The current email content
   * @returns Suggestions for improvement
   */
  async suggestEmailImprovements(emailContent: string): Promise<{
    improvements: string[];
    revisedContent: string;
  }> {
    try {
      if (this.isMocked) {
        return this.getMockEmailImprovements(emailContent);
      }

      const systemPrompt = `You are an expert email marketer specialized in improving email content.
      Analyze the provided email and suggest specific improvements to increase engagement, click-through rates, 
      and conversions. Also provide a revised version of the email with your improvements implemented.
      Return your response as JSON with fields: improvements (array of strings) and revisedContent (string).`;

      const prompt = `Please analyze and improve this email content:\n\n${emailContent}`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      return JSON.parse(content);
    } catch (error: any) {
      this.handleError(error);
      return this.getMockEmailImprovements(emailContent);
    }
  }

  /**
   * Get personalized responses to user questions about email marketing
   * 
   * @param question The user's question
   * @param context Additional context to help answer the question
   * @returns Response to the question
   */
  async answerEmailMarketingQuestion(
    question: string,
    context?: string
  ): Promise<string> {
    try {
      if (this.isMocked) {
        return this.getMockEmailMarketingAnswer(question);
      }

      const systemPrompt = `You are an expert email marketing assistant, with deep knowledge of industry best practices, 
      trends, and technical aspects of email marketing. Provide helpful, accurate, and concise answers to questions about email marketing.
      When possible, include specific metrics, examples, or actionable advice.`;

      const prompt = context 
        ? `Context: ${context}\n\nQuestion: ${question}` 
        : `Question: ${question}`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000
      });

      return response.choices[0].message.content || 
        this.getMockEmailMarketingAnswer(question);
    } catch (error: any) {
      this.handleError(error);
      return this.getMockEmailMarketingAnswer(question);
    }
  }

  /**
   * Generate audience persona to help target campaigns
   * 
   * @param industry Industry of the target audience
   * @param demographics Demographic information of the target audience
   * @param interests Interest areas of the target audience
   * @returns Generated audience persona
   */
  async generateAudiencePersona(
    industry: string,
    demographics?: string,
    interests?: string
  ): Promise<{
    name: string;
    age: string;
    occupation: string;
    goals: string[];
    challenges: string[];
    communicationPreferences: string[];
    interests: string[];
    description: string;
  }> {
    try {
      if (this.isMocked) {
        return this.getMockAudiencePersona(industry, demographics, interests);
      }

      const systemPrompt = `You are an expert in audience analysis and persona development for marketing purposes.
      Create a detailed audience persona for email marketing campaigns based on the provided industry and other parameters.
      Return the persona as JSON with fields: name, age, occupation, goals (array), challenges (array), 
      communicationPreferences (array), interests (array), and description.`;

      const prompt = `Generate a detailed audience persona for email marketing in the ${industry} industry.
      ${demographics ? `Demographics: ${demographics}` : ""}
      ${interests ? `Interests: ${interests}` : ""}`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      return JSON.parse(content);
    } catch (error: any) {
      this.handleError(error);
      return this.getMockAudiencePersona(industry, demographics, interests);
    }
  }

  /**
   * Analyze campaign results and provide insights
   * 
   * @param campaignData Data from the campaign to analyze
   * @returns Analysis and recommendations
   */
  async analyzeCampaignResults(campaignData: {
    name: string;
    sentCount: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
    conversionRate?: number;
    industry?: string;
  }): Promise<{
    performance: string;
    insights: string[];
    recommendations: string[];
    benchmarkComparison?: string;
  }> {
    try {
      if (this.isMocked) {
        return this.getMockCampaignAnalysis(campaignData);
      }

      const systemPrompt = `You are an expert email marketing analyst specializing in campaign performance analysis.
      Analyze the provided campaign metrics and provide insights and recommendations for improvement.
      Include industry benchmark comparisons when possible. Return your analysis as JSON with fields:
      performance (summary), insights (array), recommendations (array), and benchmarkComparison.`;

      const prompt = `Please analyze these campaign results:
      
      Campaign Name: ${campaignData.name}
      Emails Sent: ${campaignData.sentCount}
      Open Rate: ${campaignData.openRate}%
      Click Rate: ${campaignData.clickRate}%
      Bounce Rate: ${campaignData.bounceRate}%
      Unsubscribe Rate: ${campaignData.unsubscribeRate}%
      ${campaignData.conversionRate ? `Conversion Rate: ${campaignData.conversionRate}%` : ''}
      ${campaignData.industry ? `Industry: ${campaignData.industry}` : ''}`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      return JSON.parse(content);
    } catch (error: any) {
      this.handleError(error);
      return this.getMockCampaignAnalysis(campaignData);
    }
  }

  /**
   * Generate A/B test variations for email components
   * 
   * @param component The component to generate variations for (subject, headline, cta, etc.)
   * @param originalContent The original content
   * @param variationCount Number of variations to generate
   * @param goal The goal of the A/B test
   * @returns Generated variations
   */
  async generateABTestVariations(
    component: "subject" | "headline" | "cta" | "body" | "design",
    originalContent: string,
    variationCount: number = 3,
    goal?: string
  ): Promise<string[]> {
    try {
      if (this.isMocked) {
        return this.getMockABTestVariations(component, originalContent, variationCount);
      }

      const systemPrompt = `You are an expert email marketer specialized in A/B testing.
      Generate variations of the provided ${component} for A/B testing, with each variation designed to 
      test a different approach while maintaining the core message. Return your response as a JSON array of strings.`;

      const prompt = `Generate ${variationCount} variations of this email ${component} for A/B testing:
      
      Original ${component}: ${originalContent}
      ${goal ? `Test Goal: ${goal}` : ''}
      
      Each variation should be significantly different and test a unique approach.`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : parsed.variations || [];
    } catch (error: any) {
      this.handleError(error);
      return this.getMockABTestVariations(component, originalContent, variationCount);
    }
  }

  // Error handling logic
  private handleError(error: any) {
    this.lastError = error;
    this.errorCount++;
    console.error(`OpenAI API error (${this.errorCount}/${this.MAX_ERRORS}):`, error);
    
    if (this.errorCount >= this.MAX_ERRORS) {
      console.warn(`Too many OpenAI errors (${this.errorCount}). Switching to mock implementation.`);
      this.isMocked = true;
    }
  }

  // MOCK IMPLEMENTATIONS
  // These provide reasonable fallback responses when OpenAI API is unavailable

  private async getMockChatCompletion(
    messages: { role: string; content: string }[],
    systemPrompt?: string
  ): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content.toLowerCase();
    
    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      return "Hello! I'm your email marketing assistant. How can I help you today?";
    }
    
    if (userMessage.includes("help") || userMessage.includes("assistance")) {
      return "I'm here to help with your email marketing needs. I can help create templates, optimize subject lines, provide best practices, and answer any questions you have about email marketing.";
    }
    
    if (userMessage.includes("email") && userMessage.includes("template")) {
      return "I'd be happy to help you create an email template! Could you tell me more about your target audience, the purpose of the email, and the key message you want to convey?";
    }
    
    if (userMessage.includes("subject line") || userMessage.includes("headline")) {
      return "Subject lines are crucial for email open rates. For better results, keep them under 50 characters, create a sense of urgency, personalize when possible, and avoid spam trigger words. Would you like me to suggest some subject lines for your campaign?";
    }
    
    if (userMessage.includes("open rate") || userMessage.includes("click rate") || userMessage.includes("metrics")) {
      return "Improving email metrics requires a holistic approach. To increase open rates, focus on subject lines and sending time. For better click rates, ensure your content is relevant, your CTAs are clear, and your design is mobile-friendly. Would you like specific suggestions for your campaign?";
    }
    
    if (userMessage.includes("best time") && userMessage.includes("send")) {
      return "The best time to send emails varies by industry and audience. Generally, Tuesday to Thursday mornings (8-10 AM) and afternoons (1-3 PM) perform well. However, I recommend testing different times with your specific audience to find what works best for you.";
    }
    
    if (userMessage.includes("personalization") || userMessage.includes("segment")) {
      return "Personalization significantly improves email performance. Start by segmenting your list based on demographics, behavior, or purchase history. Then customize the content, offers, and sending time for each segment. Even simple personalization like using the recipient's name can increase open rates by 26%.";
    }
    
    // Default response
    return "I'm your email marketing assistant. I can help with creating templates, improving subject lines, analyzing campaign results, and providing best practices. What specific aspect of email marketing would you like help with today?";
  }

  private async getMockEmailTemplate(params: any): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    
    const { subject, purpose, audience, tone, length } = params;
    const lengthMap = {
      short: 150,
      medium: 300,
      long: 500
    };
    
    let template = "";
    
    if (purpose.toLowerCase().includes("welcome")) {
      template = `Subject: ${subject || "Welcome to Our Community!"}\n\nHi [Name],\n\nWe're thrilled to welcome you to our community! Thank you for signing up and joining us on this journey.\n\nHere at [Company Name], we're dedicated to providing you with [value proposition]. Your decision to join us means a lot, and we're committed to exceeding your expectations.\n\nIn the coming days, you'll receive more information about how to make the most of your membership, including exclusive resources and special offers reserved just for our subscribers.\n\nIf you have any questions in the meantime, feel free to reply to this email or contact our support team.\n\n${params.includeCallToAction ? "To get started right away, click the button below to complete your profile:\n\n[COMPLETE YOUR PROFILE]\n\n" : ""}Warm regards,\n\n[Your Name]\n[Company Name]`;
    } 
    else if (purpose.toLowerCase().includes("promotional") || purpose.toLowerCase().includes("offer")) {
      template = `Subject: ${subject || "Special Offer Inside: Limited Time Only!"}\n\nHello [Name],\n\nWe're excited to share some amazing news with you! For a limited time, we're offering [promotional offer details].\n\nAs a valued customer, you get exclusive early access to this special offer before we announce it publicly.\n\nThis is perfect for anyone looking to [benefit of offer]. Many of our customers have already [positive outcome from using the product/service].\n\n${params.includeCallToAction ? "Don't miss out on this limited-time opportunity:\n\n[CLAIM YOUR OFFER NOW]\n\n" : ""}Offer ends [date], so act fast!\n\nBest regards,\n\n[Your Name]\n[Company Name]`;
    }
    else if (purpose.toLowerCase().includes("newsletter")) {
      template = `Subject: ${subject || "Your Monthly Update: Latest Insights & News"}\n\nHi [Name],\n\nWe hope you're having a great month! Here's your roundup of the latest updates and valuable insights:\n\n📈 INDUSTRY UPDATES\n[Brief industry news or trend]\n\n💡 FEATURED ARTICLE\n[Article title]\n[Brief description]\n\n🔍 SPOTLIGHT\n[Customer success story or product highlight]\n\n${params.includeCallToAction ? "Read the full articles on our website:\n\n[READ MORE]\n\n" : ""}We value your feedback! Let us know what topics you'd like to see covered in future newsletters.\n\nUntil next month,\n\n[Your Name]\n[Company Name]`;
    }
    else {
      template = `Subject: ${subject || "Important Update from [Company Name]"}\n\nHello [Name],\n\nWe hope this email finds you well. We wanted to reach out regarding [main purpose].\n\n[Body paragraph 1 - Main information]\n\n[Body paragraph 2 - Additional details]\n\n[Body paragraph 3 - Benefits or impact for the recipient]\n\n${params.includeCallToAction ? "[CALL TO ACTION BUTTON]\n\n" : ""}If you have any questions, please don't hesitate to contact us.\n\nBest regards,\n\n[Your Name]\n[Company Name]`;
    }
    
    return template;
  }

  private async getMockSubjectLineAnalysis(subjectLine: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    
    const length = subjectLine.length;
    let score = 7; // Default score
    let strength = "";
    let weakness = "";
    let suggestions = [];
    
    // Adjust score based on subject line length
    if (length > 70) {
      score -= 2;
      weakness = "Subject line is too long (over 70 characters)";
      suggestions.push("Shorten your subject line to under 50 characters for optimal display on mobile devices");
    } else if (length > 50) {
      score -= 1;
      weakness = "Subject line is slightly long";
      suggestions.push("Consider shortening to under 50 characters for better mobile display");
    } else if (length < 20) {
      score -= 1;
      weakness = "Subject line may be too brief to convey value";
      suggestions.push("Add more specific value proposition while keeping it concise");
    } else {
      strength = "Good subject line length (between 20-50 characters)";
    }
    
    // Check for personalization
    if (!subjectLine.includes("[") && !subjectLine.toLowerCase().includes("you") && !subjectLine.toLowerCase().includes("your")) {
      score -= 1;
      suggestions.push("Add personalization elements like '[Name]' or use 'you/your' to increase engagement");
    } else {
      strength = strength ? `${strength}. Good use of personalization` : "Good use of personalization";
    }
    
    // Check for urgency
    const urgencyTerms = ["limited", "soon", "now", "today", "hurry", "last chance", "deadline", "ends"];
    const hasUrgency = urgencyTerms.some(term => subjectLine.toLowerCase().includes(term));
    if (!hasUrgency) {
      suggestions.push("Consider adding a sense of urgency when appropriate");
    } else {
      strength = strength ? `${strength}. Effective use of urgency` : "Effective use of urgency";
    }
    
    // Check for spam trigger words
    const spamTriggers = ["free", "guarantee", "credit", "cash", "buy", "clearance", "order", "urgent"];
    const foundTriggers = spamTriggers.filter(word => subjectLine.toLowerCase().includes(word));
    if (foundTriggers.length > 0) {
      score -= foundTriggers.length;
      weakness = weakness ? `${weakness}. Contains potential spam trigger words` : "Contains potential spam trigger words";
      suggestions.push(`Avoid spam trigger words like: ${foundTriggers.join(", ")}`);
    }
    
    // Check for questions or curiosity
    if (!subjectLine.includes("?") && !subjectLine.includes("...")) {
      suggestions.push("Consider using a question or ellipsis to create curiosity");
    }
    
    // Default suggestions if none were added
    if (suggestions.length === 0) {
      suggestions = [
        "A/B test against a variation to see which performs better",
        "Consider adding numbers or statistics for increased engagement",
        "Test adding emojis for appropriate campaigns to increase visibility"
      ];
    }
    
    return {
      score: Math.max(1, Math.min(10, score)),
      feedback: `Your subject line "${subjectLine}" scores ${score}/10.`,
      suggestions,
      strength: strength || "Concise and clear messaging",
      weakness: weakness || "Could benefit from more engaging elements"
    };
  }

  private async getMockEmailMarketingBestPractices(topic?: string): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    
    const generalPractices = [
      "Segment your email list to deliver more targeted and relevant content",
      "Personalize emails with recipient name and tailored content when possible",
      "Optimize for mobile devices - over 60% of emails are opened on mobile",
      "Test different send times to find the optimal engagement window for your audience",
      "Keep subject lines under 50 characters to ensure they display fully on most devices",
      "Use a clear and compelling call-to-action (CTA) that stands out",
      "Include alt text for images in case they don't load properly",
      "Maintain a clean list by regularly removing inactive subscribers",
      "Follow email deliverability best practices to avoid spam filters",
      "Include both HTML and plain text versions of your emails"
    ];
    
    if (!topic) {
      return generalPractices;
    }
    
    const topicMap: {[key: string]: string[]} = {
      "subject lines": [
        "Keep subject lines under 50 characters to avoid truncation",
        "Use personalization in subject lines to increase open rates by up to 26%",
        "Create a sense of urgency or exclusivity when appropriate",
        "A/B test different subject lines to identify what resonates with your audience",
        "Avoid all caps and excessive punctuation which trigger spam filters",
        "Include a benefit or value proposition when possible",
        "Use questions to generate curiosity and engagement",
        "Consider using numbers or statistics to increase click-through rates",
        "Maintain brand voice consistency in your subject lines",
        "Avoid spam trigger words like 'free', 'guarantee', or 'cash'"
      ],
      "deliverability": [
        "Use a reputable email service provider (ESP)",
        "Authenticate your emails with SPF, DKIM, and DMARC",
        "Maintain a clean email list by removing bounces and inactive subscribers",
        "Warm up new IP addresses gradually when changing providers",
        "Monitor your sender reputation through available tools",
        "Implement a double opt-in process for new subscribers",
        "Include a clear unsubscribe option in every email",
        "Maintain a consistent sending volume and frequency",
        "Avoid sending from free email domains (Gmail, Yahoo, etc.)",
        "Test emails across different clients before sending to your list"
      ],
      "segmentation": [
        "Segment by demographics like age, location, and gender",
        "Create segments based on past purchase behavior",
        "Group subscribers by engagement level (active vs. inactive)",
        "Use website browsing behavior to create interest-based segments",
        "Develop segments based on position in the customer journey",
        "Create segments based on subscription source or entry point",
        "Use recency, frequency, and monetary (RFM) analysis for segmentation",
        "Segment based on content preferences indicated by past engagement",
        "Create special segments for your most valuable customers",
        "Develop re-engagement campaigns for inactive segments"
      ],
      "content": [
        "Focus on benefits rather than features in your copy",
        "Keep paragraphs short (3-4 lines) for better readability",
        "Use a clear hierarchy with headings and subheadings",
        "Include social proof like testimonials or reviews",
        "Maintain brand voice consistency across all emails",
        "Use storytelling techniques to engage readers emotionally",
        "Include visual elements like images or GIFs when appropriate",
        "Focus on one primary call-to-action per email",
        "Use action-oriented language in your CTAs",
        "Balance text and images for optimal deliverability"
      ],
      "automation": [
        "Implement welcome series emails for new subscribers",
        "Set up abandoned cart recovery emails",
        "Create post-purchase follow-up sequences",
        "Develop re-engagement campaigns for inactive subscribers",
        "Use behavior-triggered emails based on website activity",
        "Implement milestone and anniversary emails",
        "Create product recommendation emails based on purchase history",
        "Develop educational drip campaigns for new customers",
        "Set up replenishment reminders for consumable products",
        "Implement birthday or special occasion automated emails"
      ]
    };
    
    // Find the closest topic
    const lowercaseTopic = topic.toLowerCase();
    for (const [key, practices] of Object.entries(topicMap)) {
      if (lowercaseTopic.includes(key)) {
        return practices;
      }
    }
    
    // If no specific topic match, return general practices
    return generalPractices;
  }

  private async getMockEmailImprovements(emailContent: string): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    
    // Basic analysis
    const words = emailContent.split(/\s+/).length;
    const paragraphs = emailContent.split('\n\n').length;
    const sentences = emailContent.split(/[.!?]+\s/).length;
    const hasCTA = emailContent.includes('[') && emailContent.includes(']') || 
                  emailContent.toLowerCase().includes('click') || 
                  emailContent.toLowerCase().includes('call');
    
    const improvements = [
      "Make the subject line more compelling by adding urgency or personalization",
      "Break up long paragraphs into shorter 2-3 sentence blocks for better readability",
      "Add more white space to improve scanning and readability on mobile devices",
      "Make the call-to-action more prominent and action-oriented"
    ];
    
    // Add specific improvements based on analysis
    if (words > 300) {
      improvements.push("Reduce overall length by cutting unnecessary details - aim for 50-125 words for promotional emails");
    }
    
    if (paragraphs < 3) {
      improvements.push("Add more paragraph breaks to improve readability and scannability");
    }
    
    if (sentences > 15) {
      improvements.push("Simplify complex sentences and use more direct language");
    }
    
    if (!hasCTA) {
      improvements.push("Add a clear and compelling call-to-action button or link");
    }
    
    if (!emailContent.includes('[Name]') && !emailContent.toLowerCase().includes('hi ') && !emailContent.toLowerCase().includes('hello ')) {
      improvements.push("Add personalization elements like addressing the recipient by name");
    }
    
    // Create a revised version with some basic improvements
    let revisedContent = emailContent;
    
    // Add personalization if missing
    if (!emailContent.includes('[Name]') && !emailContent.toLowerCase().startsWith('hi ') && !emailContent.toLowerCase().startsWith('hello ')) {
      revisedContent = "Hello [Name],\n\n" + revisedContent;
    }
    
    // Improve paragraphs
    revisedContent = revisedContent.replace(/(\n{3,})/g, "\n\n");
    
    // Add CTA if missing
    if (!hasCTA) {
      revisedContent += "\n\n[CLICK HERE TO GET STARTED]\n\n";
    }
    
    // Add signature if missing
    if (!revisedContent.toLowerCase().includes('regards') && !revisedContent.toLowerCase().includes('thank')) {
      revisedContent += "\n\nBest regards,\n\n[Your Name]\n[Company Name]";
    }
    
    return {
      improvements,
      revisedContent
    };
  }

  private async getMockEmailMarketingAnswer(question: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("open rate") || lowerQuestion.includes("increase open")) {
      return "To improve email open rates, focus on these key areas:\n\n1. Subject Lines: Keep them under 50 characters, personalize when possible, and create curiosity or urgency\n\n2. Sender Name: Use a recognized brand or personal name to build trust\n\n3. Timing: Test different send times to find when your audience is most responsive\n\n4. List Quality: Regularly clean your list to remove inactive subscribers\n\n5. Segmentation: Send targeted content to specific audience segments\n\nThe average email open rate across industries is around 21.5%, but this varies widely by industry. For example, non-profits average 25.2% while retail averages about 18.4%. If your rates are significantly lower than your industry benchmark, start by A/B testing subject lines, as they typically have the biggest impact on open rates.";
    }
    
    if (lowerQuestion.includes("click rate") || lowerQuestion.includes("click-through") || lowerQuestion.includes("ctr")) {
      return "To improve email click-through rates (CTR), implement these strategies:\n\n1. Clear Call-to-Action (CTA): Use action-oriented language and make your CTA button stand out visually\n\n2. Value Proposition: Clearly communicate the benefit of clicking\n\n3. Email Design: Use a mobile-responsive design with a clean layout\n\n4. Relevance: Ensure content matches subscriber interests through segmentation\n\n5. Personalization: Personalize content beyond just using the subscriber's name\n\nThe average click-through rate across industries is about 2.6%. Top-performing emails often place their primary CTA above the fold, use contrasting colors for buttons, and employ language that creates urgency or communicates clear value. A/B testing different CTA placements, button colors, and copy can help identify what works best for your specific audience.";
    }
    
    if (lowerQuestion.includes("frequency") || lowerQuestion.includes("how often") || lowerQuestion.includes("send emails")) {
      return "The optimal email sending frequency depends on your industry, audience preferences, and content quality. Here are some guidelines:\n\n1. Most businesses find success with 1-2 emails per week\n\n2. E-commerce may send more frequently (2-3 times per week), especially during sales periods\n\n3. B2B and professional services often see better results with lower frequency (1-4 times per month)\n\nThe key is to find the balance between staying top-of-mind and avoiding subscriber fatigue. To determine your optimal frequency:\n\n1. Test different sending schedules and monitor open rates, click rates, and unsubscribes\n\n2. Segment your audience by engagement level, sending more frequently to highly engaged subscribers\n\n3. Consider offering frequency options during signup or in preference centers\n\n4. Focus on providing value with each email rather than just increasing frequency\n\nRemember that consistency is often more important than frequency - a regular schedule sets expectations and builds habits with your audience.";
    }
    
    if (lowerQuestion.includes("best time") || lowerQuestion.includes("when to send")) {
      return "The best time to send emails varies by audience and industry, but research shows some general patterns:\n\n1. Weekdays typically outperform weekends for B2B emails\n\n2. Tuesday, Wednesday, and Thursday generally see higher engagement rates\n\n3. 10 AM - 11 AM tends to be effective for many audiences\n\n4. Some industries see a second peak around 2 PM - 3 PM\n\nHowever, these are just starting points. The best approach is to:\n\n1. Test different send times with your specific audience\n\n2. Analyze your email engagement data to identify patterns\n\n3. Consider your audience's time zones and daily routines\n\n4. Segment your audience and test different send times for different segments\n\nSome email platforms offer send time optimization features that automatically determine the best time to send to each individual subscriber based on their past engagement patterns. This personalized approach often outperforms sending to your entire list at once.";
    }
    
    if (lowerQuestion.includes("list building") || lowerQuestion.includes("grow subscribers") || lowerQuestion.includes("increase subscribers")) {
      return "To effectively grow your email list with engaged subscribers:\n\n1. Optimize sign-up forms: Place them strategically on your website (homepage, blog posts, checkout) and keep them simple (2-3 fields maximum)\n\n2. Offer valuable incentives: Provide lead magnets like guides, templates, discounts, or free trials in exchange for email addresses\n\n3. Use content upgrades: Create bonus content specifically relevant to your blog posts or pages\n\n4. Implement exit-intent popups: Capture visitors about to leave your site\n\n5. Leverage social media: Promote your newsletter and lead magnets to your social following\n\n6. Run contests or giveaways: Ensure they attract your target audience, not just prize hunters\n\n7. Use referral programs: Encourage subscribers to share with friends\n\n8. Collect emails at events: Whether virtual or in-person\n\nMost importantly, always use double opt-in to ensure list quality and maintain transparent expectations about what and how often you'll send. Growing a list of engaged subscribers is more valuable than rapidly building a large but unresponsive list.";
    }
    
    // Default response for other questions
    return "Email marketing remains one of the most effective digital marketing channels, with an average ROI of $36 for every $1 spent according to recent studies. To maximize your results, focus on list quality over quantity, segment your audience for more relevant messaging, and test different elements of your campaigns regularly. The most successful email marketing programs balance promotional content with value-added content that educates, entertains, or solves problems for subscribers. If you have a more specific question about email marketing strategies, metrics, or best practices, feel free to ask!";
  }

  private async getMockAudiencePersona(
    industry: string,
    demographics?: string,
    interests?: string
  ): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    
    // Default personas by industry
    const personasByIndustry: {[key: string]: any} = {
      "technology": {
        name: "Tech-Savvy Taylor",
        age: "25-34",
        occupation: "IT Professional or Developer",
        goals: [
          "Stay updated with the latest technology trends",
          "Find solutions that improve workflow efficiency",
          "Advance career through continuous learning",
          "Connect with like-minded professionals"
        ],
        challenges: [
          "Information overload from too many tech sources",
          "Evaluating which new technologies are worth investing time in",
          "Balancing technical learning with other responsibilities",
          "Finding practical applications for theoretical knowledge"
        ],
        communicationPreferences: [
          "Concise, jargon-friendly emails",
          "Data-backed information",
          "Visual demonstrations and tutorials",
          "Early access to new features and technologies"
        ],
        interests: [
          "Software development",
          "Cloud computing",
          "Artificial intelligence",
          "Cybersecurity",
          "Tech podcasts and webinars"
        ],
        description: "Taylor is a tech-savvy professional who values efficiency and innovation. They're constantly looking to improve their skills and stay ahead of industry trends. Taylor appreciates direct communication with technical details but has limited time, so values content that gets straight to the point and demonstrates clear benefits or applications."
      },
      "retail": {
        name: "Value-Seeking Valerie",
        age: "30-45",
        occupation: "Mid-level professional or small business owner",
        goals: [
          "Find the best quality products at competitive prices",
          "Save time on shopping through convenient options",
          "Discover new products that align with personal style",
          "Feel confident about purchase decisions"
        ],
        challenges: [
          "Limited time for extensive research or shopping",
          "Budget constraints requiring careful spending decisions",
          "Overwhelmed by too many product choices",
          "Concerned about making the wrong purchase"
        ],
        communicationPreferences: [
          "Visual emails showcasing products in use",
          "Mobile-friendly content for on-the-go browsing",
          "Personalized recommendations based on past purchases",
          "Exclusive offers and early access to sales"
        ],
        interests: [
          "Product reviews and comparisons",
          "Style trends and seasonal updates",
          "Money-saving tips and promotions",
          "Lifestyle content related to products",
          "Customer stories and testimonials"
        ],
        description: "Valerie is a practical shopper who researches before buying but doesn't have endless time to compare options. They appreciate brands that understand their preferences and make relevant recommendations. Valerie is loyalty-driven when treated well but price-conscious and will compare options for significant purchases. Email communication that respects their time with clear value propositions works best."
      },
      "finance": {
        name: "Security-Minded Sam",
        age: "35-55",
        occupation: "Mid to senior-level professional or business owner",
        goals: [
          "Build long-term financial security and wealth",
          "Make informed financial decisions",
          "Protect and grow assets efficiently",
          "Plan effectively for future financial needs"
        ],
        challenges: [
          "Navigating complex financial products and services",
          "Finding trustworthy financial advice",
          "Balancing current needs with future planning",
          "Time constraints for financial management"
        ],
        communicationPreferences: [
          "Secure, professional communications",
          "Data-driven insights with visual charts",
          "Educational content that explains complex topics simply",
          "Timely updates on relevant financial matters"
        ],
        interests: [
          "Investment strategies and market trends",
          "Tax optimization and financial planning",
          "Retirement and estate planning",
          "Financial technology and security",
          "Economic news and analysis"
        ],
        description: "Sam is financially literate but values expert guidance on complex matters. They're methodical in decision-making, requiring solid evidence and clear explanations. Sam appreciates financial institutions that prioritize security, transparency, and personalized service. Communication that demonstrates expertise while respecting their intelligence works best, particularly when it provides actionable insights relevant to their financial situation."
      },
      "healthcare": {
        name: "Wellness-Focused Wren",
        age: "30-60",
        occupation: "Varied - often professional, parent, or caregiver",
        goals: [
          "Maintain or improve personal and family health",
          "Find trustworthy health information and services",
          "Efficiently manage healthcare needs and appointments",
          "Balance preventative care with treatment when needed"
        ],
        challenges: [
          "Navigating complex healthcare systems",
          "Finding time for self-care amidst busy schedules",
          "Distinguishing credible health information from misinformation",
          "Managing healthcare costs and insurance"
        ],
        communicationPreferences: [
          "Clear, empathetic health communications",
          "Educational content with actionable health tips",
          "Personalized health recommendations",
          "Appointment reminders and follow-up care instructions"
        ],
        interests: [
          "Preventative healthcare and wellness practices",
          "Nutrition and exercise guidance",
          "Mental health and stress management",
          "Family health and caregiving resources",
          "Medical research and treatment advances"
        ],
        description: "Wren is health-conscious and proactive about wellness for themselves and loved ones. They seek reliable health information from credible sources and value healthcare providers who take time to educate and explain. Wren appreciates clear communication that acknowledges both emotional and practical aspects of healthcare decisions. They respond well to personalized guidance that fits their specific health situation and goals."
      }
    };
    
    // Default fallback persona
    const defaultPersona = {
      name: "Professional Pat",
      age: "30-45",
      occupation: "Mid-level professional",
      goals: [
        "Advance career and professional skills",
        "Find products/services that improve efficiency",
        "Balance work and personal life effectively",
        "Make informed decisions about purchases"
      ],
      challenges: [
        "Limited time for research and evaluation",
        "Information overload from multiple sources",
        "Budget constraints requiring prioritization",
        "Finding trusted sources of information"
      ],
      communicationPreferences: [
        "Concise, value-focused emails",
        "Mobile-friendly content for on-the-go reading",
        "Personalized recommendations based on interests",
        "Professional tone with clear benefits explained"
      ],
      interests: [
        "Professional development",
        "Industry trends and news",
        "Productivity and efficiency tools",
        "Peer insights and case studies",
        "Work-life balance strategies"
      ],
      description: "Pat is a busy professional who values efficiency and quality. They make decisions based on a combination of research and trusted recommendations. Pat appreciates communications that respect their time by getting straight to the point while providing enough information to make informed choices. They're receptive to email marketing that clearly demonstrates value and relevance to their professional or personal needs."
    };
    
    // Find the best matching industry or return default
    const lowercaseIndustry = industry.toLowerCase();
    for (const [key, persona] of Object.entries(personasByIndustry)) {
      if (lowercaseIndustry.includes(key)) {
        return persona;
      }
    }
    
    return defaultPersona;
  }

  private async getMockCampaignAnalysis(campaignData: any): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    
    // Industry benchmarks (simplified)
    const benchmarks: {[key: string]: any} = {
      "retail": { openRate: 18.4, clickRate: 2.1, bounceRate: 0.7, unsubscribeRate: 0.15 },
      "technology": { openRate: 22.6, clickRate: 2.5, bounceRate: 0.8, unsubscribeRate: 0.11 },
      "healthcare": { openRate: 23.4, clickRate: 2.7, bounceRate: 0.6, unsubscribeRate: 0.10 },
      "finance": { openRate: 20.8, clickRate: 2.3, bounceRate: 0.7, unsubscribeRate: 0.12 },
      "education": { openRate: 24.9, clickRate: 2.9, bounceRate: 0.5, unsubscribeRate: 0.08 },
      "nonprofit": { openRate: 25.2, clickRate: 2.8, bounceRate: 0.6, unsubscribeRate: 0.09 }
    };
    
    // Default benchmark if industry not specified
    const defaultBenchmark = { openRate: 21.5, clickRate: 2.6, bounceRate: 0.7, unsubscribeRate: 0.12 };
    
    // Get appropriate benchmark
    let benchmark = defaultBenchmark;
    if (campaignData.industry) {
      const lowercaseIndustry = campaignData.industry.toLowerCase();
      for (const [key, data] of Object.entries(benchmarks)) {
        if (lowercaseIndustry.includes(key)) {
          benchmark = data;
          break;
        }
      }
    }
    
    // Analyze performance
    const openRatePerformance = campaignData.openRate >= benchmark.openRate ? "above" : "below";
    const clickRatePerformance = campaignData.clickRate >= benchmark.clickRate ? "above" : "below";
    const bounceRatePerformance = campaignData.bounceRate <= benchmark.bounceRate ? "better than" : "worse than";
    const unsubscribeRatePerformance = campaignData.unsubscribeRate <= benchmark.unsubscribeRate ? "better than" : "worse than";
    
    // Generate insights
    const insights = [];
    
    if (campaignData.openRate < benchmark.openRate) {
      insights.push("Your open rate is below industry average, suggesting potential issues with subject lines, sender name, or sending time");
    } else {
      insights.push("Your open rate is performing well compared to industry benchmarks, indicating effective subject lines and good list quality");
    }
    
    if (campaignData.clickRate < benchmark.clickRate) {
      insights.push("Your click rate needs improvement, indicating potential issues with content relevance, CTA clarity, or offer strength");
    } else {
      insights.push("Your click rate is strong, showing that your content and calls-to-action are resonating with your audience");
    }
    
    if (campaignData.openRate > benchmark.openRate && campaignData.clickRate < benchmark.clickRate) {
      insights.push("The gap between your strong open rate and lower click rate suggests that while subject lines are compelling, the email content isn't meeting expectations");
    }
    
    if (campaignData.bounceRate > benchmark.bounceRate) {
      insights.push("Your higher-than-average bounce rate indicates list quality issues that should be addressed");
    }
    
    if (campaignData.unsubscribeRate > benchmark.unsubscribeRate * 1.5) {
      insights.push("Your unsubscribe rate is significantly above industry average, suggesting potential issues with content relevance or sending frequency");
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (campaignData.openRate < benchmark.openRate) {
      recommendations.push("Test different subject line approaches including questions, personalization, and urgency");
      recommendations.push("Experiment with different sending times and days of the week");
      recommendations.push("Segment your list to deliver more targeted, relevant content");
    }
    
    if (campaignData.clickRate < benchmark.clickRate) {
      recommendations.push("Improve your call-to-action buttons with more compelling, action-oriented text");
      recommendations.push("Ensure your content delivers on the promise of your subject line");
      recommendations.push("Use a single, clear primary CTA rather than multiple competing options");
    }
    
    if (campaignData.bounceRate > benchmark.bounceRate) {
      recommendations.push("Clean your email list by removing consistently non-engaging subscribers");
      recommendations.push("Implement a double opt-in process for new subscribers");
      recommendations.push("Regularly verify email addresses in your database");
    }
    
    if (campaignData.unsubscribeRate > benchmark.unsubscribeRate) {
      recommendations.push("Review your sending frequency to avoid subscriber fatigue");
      recommendations.push("Improve content relevance through better segmentation");
      recommendations.push("Consider offering a preference center where subscribers can choose content types");
    }
    
    // Ensure we have at least 3 recommendations
    if (recommendations.length < 3) {
      recommendations.push("A/B test different aspects of your emails to continuously improve performance");
      recommendations.push("Analyze engagement patterns to determine optimal sending time for your audience");
      recommendations.push("Enhance personalization beyond just using the subscriber's name");
    }
    
    // Generate overall performance assessment
    let performance;
    const avgPerformance = (
      (campaignData.openRate / benchmark.openRate) + 
      (campaignData.clickRate / benchmark.clickRate) + 
      (benchmark.bounceRate / Math.max(0.1, campaignData.bounceRate)) + 
      (benchmark.unsubscribeRate / Math.max(0.01, campaignData.unsubscribeRate))
    ) / 4;
    
    if (avgPerformance >= 1.2) {
      performance = "Excellent campaign performance that significantly exceeds industry benchmarks";
    } else if (avgPerformance >= 1) {
      performance = "Good campaign performance that meets or slightly exceeds industry benchmarks";
    } else if (avgPerformance >= 0.8) {
      performance = "Average campaign performance with some metrics meeting industry benchmarks and others needing improvement";
    } else {
      performance = "Below average campaign performance with significant room for improvement in multiple areas";
    }
    
    // Generate benchmark comparison
    const benchmarkComparison = `Industry averages for ${campaignData.industry || "email marketing"}: Open Rate: ${benchmark.openRate}% (yours: ${campaignData.openRate}%), Click Rate: ${benchmark.clickRate}% (yours: ${campaignData.clickRate}%), Bounce Rate: ${benchmark.bounceRate}% (yours: ${campaignData.bounceRate}%), Unsubscribe Rate: ${benchmark.unsubscribeRate}% (yours: ${campaignData.unsubscribeRate}%)`;
    
    return {
      performance,
      insights,
      recommendations,
      benchmarkComparison
    };
  }

  private async getMockABTestVariations(
    component: string,
    originalContent: string,
    variationCount: number = 3
  ): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    
    const variations: string[] = [originalContent];
    
    // Generate variations based on component type
    if (component === "subject") {
      // Subject line variations
      const subjectVariations = [
        `[URGENT] ${originalContent}`,
        `${originalContent} - Limited Time Offer`,
        `Just for you: ${originalContent}`,
        `${originalContent}?`,
        `Don't miss out on ${originalContent}`,
        `${originalContent} (Exclusive Offer Inside)`,
        `${Math.floor(Math.random() * 70) + 30}% off: ${originalContent}`,
        `Last chance: ${originalContent}`,
        `[NEW] ${originalContent}`
      ];
      
      // Add random variations up to the requested count
      while (variations.length < variationCount + 1 && subjectVariations.length > 0) {
        const randomIndex = Math.floor(Math.random() * subjectVariations.length);
        variations.push(subjectVariations[randomIndex]);
        subjectVariations.splice(randomIndex, 1);
      }
    } 
    else if (component === "headline") {
      // Headline variations
      const headlineVariations = [
        `${originalContent} - Now Available!`,
        `Introducing: ${originalContent}`,
        `${originalContent}: The Complete Guide`,
        `How ${originalContent} Can Transform Your Business`,
        `${originalContent} - Exclusive Offer Inside`,
        `${originalContent} Made Simple`,
        `The Secret to ${originalContent}`,
        `${originalContent}: What You Need to Know`,
        `${originalContent} - Limited Time Only`
      ];
      
      // Add random variations up to the requested count
      while (variations.length < variationCount + 1 && headlineVariations.length > 0) {
        const randomIndex = Math.floor(Math.random() * headlineVariations.length);
        variations.push(headlineVariations[randomIndex]);
        headlineVariations.splice(randomIndex, 1);
      }
    }
    else if (component === "cta") {
      // CTA variations
      const ctaVariations = [
        `Get Started Now`,
        `Claim Your Offer`,
        `Yes, I Want This!`,
        `Shop Now`,
        `Learn More`,
        `Sign Up Today`,
        `Join Free`,
        `Download Now`,
        `See Plans`,
        `Try For Free`,
        `Reserve My Spot`,
        `Continue To Checkout`
      ];
      
      // Add random variations up to the requested count
      while (variations.length < variationCount + 1 && ctaVariations.length > 0) {
        const randomIndex = Math.floor(Math.random() * ctaVariations.length);
        variations.push(ctaVariations[randomIndex]);
        ctaVariations.splice(randomIndex, 1);
      }
    }
    else {
      // For body or design, provide more general variations
      variations.push(
        `[Alternative version 1 of your ${component}]`,
        `[Alternative version 2 of your ${component}]`,
        `[Alternative version 3 of your ${component}]`
      );
    }
    
    // Remove original and return only the variations
    variations.shift();
    
    return variations.slice(0, variationCount);
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();