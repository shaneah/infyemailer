import OpenAI from "openai";

// Define message type
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Define template parameters interface
interface TemplateParams {
  subject: string;
  purpose: string;
  audience: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  includeCallToAction?: boolean;
  specialInstructions?: string;
}

// Define subject line analysis interface
interface SubjectLineAnalysis {
  score: number;
  feedback: string;
  suggestions: string[];
  strength: string;
  weakness: string;
}

// Define email improvements interface
interface EmailImprovements {
  improvements: string[];
  revisedContent: string;
}

/**
 * Service for interacting with OpenAI API
 */
export class OpenAIService {
  private openai: OpenAI | null = null;
  
  constructor() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }
  
  /**
   * Get a chat completion from OpenAI
   * 
   * @param messages Array of messages
   * @param systemPrompt Optional system prompt
   * @returns Response string
   */
  async getChatCompletion(messages: Message[], systemPrompt?: string): Promise<string> {
    // Use mock if OpenAI is not configured
    if (!this.openai) {
      return this.getMockChatResponse(messages, systemPrompt);
    }
    
    try {
      // Format messages for OpenAI
      const formattedMessages = systemPrompt
        ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
        : messages;
      
      // Request completion from OpenAI
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error getting chat completion from OpenAI:', error);
      // Fallback to mock response
      return this.getMockChatResponse(messages, systemPrompt);
    }
  }
  
  /**
   * Generate an email template using OpenAI
   * 
   * @param params Template parameters
   * @returns Generated template string
   */
  async generateEmailTemplate(params: TemplateParams): Promise<string> {
    if (!this.openai) {
      return this.getMockTemplate(params);
    }
    
    try {
      const systemPrompt = `You are an expert email copywriter that specializes in creating effective email marketing templates. 
        Your task is to create a persuasive, on-brand, and engaging email template for the given parameters.
        Focus on creating a template that will drive engagement and conversions.
        Make sure the subject line is catchy and inviting without being clickbait.
        Include clear headers, persuasive body copy, and a prominent call to action if requested.
        Format the email in an easy-to-read way with appropriate spacing and structure.`;
      
      const content = `
        Create an email template with the following parameters:
        - Subject: ${params.subject}
        - Purpose: ${params.purpose}
        - Target Audience: ${params.audience}
        - Tone: ${params.tone || 'professional'}
        - Length: ${params.length || 'medium'}
        - Include Call to Action: ${params.includeCallToAction !== false ? 'Yes' : 'No'}
        ${params.specialInstructions ? `- Special Instructions: ${params.specialInstructions}` : ''}
        
        Create a complete, ready-to-use template including subject line, preheader text, greeting, body, and closing.
      `;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });
      
      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating email template with OpenAI:', error);
      return this.getMockTemplate(params);
    }
  }
  
  /**
   * Analyze a subject line using OpenAI
   * 
   * @param subjectLine Subject line to analyze
   * @returns Analysis object
   */
  async analyzeSubjectLine(subjectLine: string): Promise<SubjectLineAnalysis> {
    if (!this.openai) {
      return this.getMockSubjectLineAnalysis(subjectLine);
    }
    
    try {
      const systemPrompt = `You are an email marketing expert specializing in subject line analysis. 
        Analyze the subject line provided and return your assessment in JSON format with the following fields:
        - score (number between 1-10)
        - feedback (string, detailed assessment)
        - suggestions (array of at least 3 improved versions)
        - strength (string, main strength of the subject line)
        - weakness (string, main weakness of the subject line)`;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this email subject line: "${subjectLine}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 1000
      });
      
      const content = response.choices[0].message.content;
      const analysis = content ? JSON.parse(content) : null;
      
      if (!analysis) {
        throw new Error('Failed to parse subject line analysis');
      }
      
      return {
        score: Number(analysis.score) || 0,
        feedback: analysis.feedback || '',
        suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
        strength: analysis.strength || '',
        weakness: analysis.weakness || ''
      };
    } catch (error) {
      console.error('Error analyzing subject line with OpenAI:', error);
      return this.getMockSubjectLineAnalysis(subjectLine);
    }
  }
  
  /**
   * Get email marketing best practices
   * 
   * @param topic Optional topic to focus on
   * @returns Array of best practices
   */
  async getEmailMarketingBestPractices(topic?: string): Promise<string[]> {
    if (!this.openai) {
      return this.getMockEmailMarketingBestPractices(topic);
    }
    
    try {
      const systemPrompt = `You are an email marketing expert. Provide a list of specific, actionable best practices for email marketing.
        If a specific topic is provided, focus your recommendations on that area.
        Each practice should be concise, specific, and actionable.
        Structure your response as a JSON array of strings, with each string being a specific best practice.`;
      
      const userPrompt = topic
        ? `Provide best practices for email marketing, focusing on: ${topic}`
        : 'Provide general best practices for effective email marketing';
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 1000
      });
      
      const content = response.choices[0].message.content;
      const bestPractices = content ? JSON.parse(content) : null;
      
      // Check if we have a valid array in the parsed response
      if (bestPractices && Array.isArray(bestPractices.bestPractices)) {
        return bestPractices.bestPractices;
      } else if (bestPractices && Array.isArray(bestPractices)) {
        return bestPractices;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error getting email marketing best practices from OpenAI:', error);
      return this.getMockEmailMarketingBestPractices(topic);
    }
  }
  
  /**
   * Suggest improvements for an email
   * 
   * @param emailContent The email content to improve
   * @returns Object with improvements and revised content
   */
  async suggestEmailImprovements(emailContent: string): Promise<EmailImprovements> {
    if (!this.openai) {
      return this.getMockEmailImprovements(emailContent);
    }
    
    try {
      const systemPrompt = `You are an email copywriting expert with extensive experience in email marketing optimization.
        Analyze the provided email content and suggest specific improvements to enhance engagement, clarity, and conversion potential.
        Structure your response as a JSON object with:
        - improvements: an array of specific, actionable suggestions
        - revisedContent: a complete revised version of the email incorporating all improvements`;
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Review and improve this email content:\n\n${emailContent}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 1500
      });
      
      const content = response.choices[0].message.content;
      const improvements = content ? JSON.parse(content) : null;
      
      if (!improvements || !Array.isArray(improvements.improvements) || typeof improvements.revisedContent !== 'string') {
        throw new Error('Invalid response format');
      }
      
      return {
        improvements: improvements.improvements,
        revisedContent: improvements.revisedContent
      };
    } catch (error) {
      console.error('Error getting email improvements from OpenAI:', error);
      return this.getMockEmailImprovements(emailContent);
    }
  }
  
  /**
   * Get mock chat response when OpenAI is not available
   * 
   * @param messages Messages array
   * @param systemPrompt Optional system prompt
   * @returns Mock response
   */
  private getMockChatResponse(messages: Message[], systemPrompt?: string): string {
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const userInput = lastUserMessage?.content.toLowerCase() || '';
    
    // Look for keywords in the user message to provide relevant responses
    if (userInput.includes('subject line') || userInput.includes('headline')) {
      return `Here are some tips for creating effective email subject lines:
      
1. Keep it short (30-50 characters)
2. Create a sense of urgency
3. Personalize when possible
4. Ask questions to engage
5. Use numbers where appropriate
6. Test different variations
7. Avoid spam trigger words
8. Be clear rather than clever

Would you like me to suggest some specific subject lines for your campaign?`;
    } else if (userInput.includes('open rate') || userInput.includes('click') || userInput.includes('conversion')) {
      return `To improve your email open rates, consider these strategies:

1. Test different send times and days
2. Segment your audience for more targeted messaging
3. Clean your list regularly to remove inactive subscribers
4. Use a recognizable and consistent sender name
5. Optimize your preheader text
6. Use A/B testing for subject lines
7. Personalize emails beyond just using the recipient's name
8. Provide exclusive value in each email

Would you like to discuss any of these strategies in more detail?`;
    } else if (userInput.includes('template') || userInput.includes('design')) {
      return `When creating email templates, these best practices can help:

1. Use a responsive design that works on all devices
2. Keep the width around 600px for better compatibility
3. Maintain a clear hierarchy with headers and visual cues
4. Use web-safe fonts or include fallbacks
5. Include both text and image-based content
6. Keep your call-to-action buttons prominent and clear
7. Maintain consistent branding elements
8. Test your template across multiple email clients

Would you like tips for a specific type of email template?`;
    } else if (userInput.includes('best time') || userInput.includes('when to send')) {
      return `The best time to send emails depends on your specific audience, but research suggests:

1. Mid-week (Tuesday, Wednesday, Thursday) tends to perform better than weekends
2. 10am-11am is often effective for B2B 
3. 8pm-midnight can work well for B2C
4. Avoid Mondays when people are catching up after the weekend
5. Lunch time (12pm-2pm) can be effective as people check emails during breaks
6. The best approach is to test different times with your specific audience
7. Consider your audience's time zone if they're geographically dispersed

Would you like help setting up a send time test?`;
    } else if (userInput.includes('list') || userInput.includes('segment')) {
      return `Effective email list segmentation can significantly improve your results:

1. Segment by demographic information (age, location, gender)
2. Create segments based on past purchase behavior
3. Group subscribers by engagement level (active vs. inactive)
4. Segment by position in the customer journey
5. Create segments based on content preferences or interests
6. Use recency, frequency, and monetary value (RFM) segmentation
7. Consider segmenting by device type for optimized content

Would you like specific examples for how to implement any of these segmentation strategies?`;
    } else if (userInput.includes('gdpr') || userInput.includes('compliance') || userInput.includes('legal')) {
      return `Here are key email marketing compliance considerations:

1. Always use permission-based marketing (get explicit consent)
2. Include a clear and functional unsubscribe option in every email
3. Include your physical address in the footer
4. Be transparent about how you collect and use data
5. Keep records of consent
6. Honor unsubscribe requests promptly
7. Use clear and non-deceptive subject lines
8. Be aware of differences between regulations (GDPR, CAN-SPAM, CASL, etc.)

Note that I cannot provide legal advice - consult with a legal professional for specific guidance.`;
    } else {
      return `I'm your AI email marketing assistant. I can help with:

- Email copywriting and content suggestions
- Subject line optimization
- Email design best practices
- Audience segmentation strategies
- Campaign performance improvement
- Deliverability tips
- Testing and optimization approaches

What specific aspect of email marketing would you like help with today?`;
    }
  }
  
  /**
   * Get a mock email template
   * 
   * @param params Template parameters
   * @returns Mock template string
   */
  private getMockTemplate(params: TemplateParams): string {
    // Create a template based on the provided parameters
    const ctaText = params.includeCallToAction !== false 
      ? `\n\n[CTA BUTTON: Learn More]` 
      : '';
    
    let length = params.length || 'medium';
    let paragraphCount = length === 'short' ? 2 : (length === 'medium' ? 3 : 4);
    
    let lengthText = '';
    for (let i = 0; i < paragraphCount; i++) {
      lengthText += `\nThis is paragraph ${i+1} tailored for ${params.audience} about ${params.purpose}. We understand your needs and have created this content specifically with you in mind.`;
    }
    
    return `Subject: ${params.subject}

Hello {First_Name},

${lengthText}

We'd love to hear your thoughts!${ctaText}

Best regards,
The Team

P.S. Feel free to reach out if you have any questions!`;
  }
  
  /**
   * Get a mock subject line analysis
   * 
   * @param subjectLine Subject line to analyze
   * @returns Mock analysis
   */
  private getMockSubjectLineAnalysis(subjectLine: string): SubjectLineAnalysis {
    // Calculate a mock score based on the subject line length
    const length = subjectLine.length;
    let score = 7; // Default score
    
    if (length < 20) score = 5; // Too short
    if (length > 60) score = 6; // Too long
    if (subjectLine.includes('!')) score--; // Avoid excessive punctuation
    if (subjectLine.toUpperCase() === subjectLine) score -= 2; // ALL CAPS is bad
    if (length >= 30 && length <= 50) score++; // Ideal length
    if (subjectLine.includes('?')) score++; // Questions can engage
    
    // Ensure score is between 1-10
    score = Math.max(1, Math.min(10, score));
    
    return {
      score,
      feedback: `Your subject line "${subjectLine}" has a length of ${length} characters. The ideal length is between 30-50 characters for optimal display across devices. The subject line should be clear, specific, and create interest without being misleading.`,
      suggestions: [
        `Improved: ${subjectLine} - New Insights`,
        `Try this: Discover ${subjectLine.toLowerCase()}`,
        `Alternative: How to ${subjectLine.toLowerCase()}`
      ],
      strength: length >= 30 && length <= 50 ? 'Good length for most email clients' : 'Clear and direct messaging',
      weakness: length < 30 ? 'May be too short to provide enough information' : (length > 50 ? 'May get cut off in some email clients' : 'Could use more specific or compelling language')
    };
  }
  
  /**
   * Get mock email marketing best practices
   * 
   * @param topic Optional topic to focus on
   * @returns Array of mock best practices
   */
  private getMockEmailMarketingBestPractices(topic?: string): string[] {
    const generalPractices = [
      'Send emails from a recognizable sender name',
      'Craft compelling subject lines (30-50 characters)',
      'Optimize preview text to complement the subject line',
      'Segment your list for more targeted messaging',
      'Use responsive design for all devices',
      'Keep your email width around 600px for better compatibility',
      'Use clear and prominent call-to-action buttons',
      'Test emails across multiple email clients before sending',
      'Include both text and image content for better deliverability',
      'Make unsubscribe options easy to find',
      'Clean your list regularly to remove inactive subscribers',
      'A/B test important campaigns to optimize performance',
      'Track and analyze key metrics for continuous improvement'
    ];
    
    if (!topic) return generalPractices;
    
    // Return topic-specific practices if available
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('subject') || topicLower.includes('headline')) {
      return [
        'Keep subject lines under 50 characters to prevent truncation',
        'Use numbers when relevant (e.g., "5 Ways to Improve...")',
        'Create a sense of urgency without being manipulative',
        'Ask engaging questions in your subject lines',
        'Test subject lines with A/B testing',
        'Avoid spam trigger words like "free", "guarantee", and excessive punctuation',
        'Personalize subject lines when data is available',
        'Be specific rather than vague about your content',
        'Use action-oriented verbs',
        'Create curiosity, but avoid clickbait tactics'
      ];
    } else if (topicLower.includes('deliverability') || topicLower.includes('inbox')) {
      return [
        'Use double opt-in to confirm subscriber interest',
        'Maintain a consistent sending schedule',
        'Keep your bounce rate under 2%',
        'Monitor and maintain a good sender reputation',
        'Implement SPF, DKIM, and DMARC authentication',
        'Avoid using URL shorteners in email content',
        'Keep your HTML code clean and simple',
        'Use a balanced text-to-image ratio',
        'Include a plain text version of your email',
        'Warm up new IP addresses gradually',
        'Send from a dedicated IP if volume justifies it'
      ];
    } else if (topicLower.includes('design') || topicLower.includes('template')) {
      return [
        'Use a responsive design that adapts to all screen sizes',
        'Maintain a clear visual hierarchy',
        'Keep your most important content "above the fold"',
        'Use web-safe fonts or include fallbacks',
        'Ensure sufficient contrast between text and background',
        'Make CTAs stand out with contrasting colors',
        'Keep file sizes small for faster loading',
        'Include alt text for all images',
        'Design for image blocking (many users have images disabled)',
        'Maintain consistent branding across all emails',
        'Use white space effectively to improve readability'
      ];
    }
    
    // Default to general practices if topic doesn't match
    return generalPractices;
  }
  
  /**
   * Get mock email improvement suggestions
   * 
   * @param emailContent Original email content
   * @returns Mock improvements
   */
  private getMockEmailImprovements(emailContent: string): EmailImprovements {
    // Generic improvements that could apply to most emails
    const improvements = [
      'Add a more compelling and specific subject line',
      'Include personalization in the greeting',
      'Shorten paragraphs for better readability',
      'Add subheadings to break up longer content',
      'Make the call-to-action more prominent and clear',
      'Add social proof or testimonials',
      'Include a specific benefit in the opening paragraph',
      'Add a persuasive P.S. at the end of the email'
    ];
    
    // Create a slightly improved version of the content
    const lines = emailContent.split('\n');
    let revisedContent = '';
    
    // Process the content line by line to make basic improvements
    if (lines.length > 0) {
      // Assume first line is subject, make it more compelling
      revisedContent += `${lines[0]} - Special Offer\n\n`;
      
      // Add personalization to greeting if exists
      if (lines.length > 1) {
        if (lines[1].toLowerCase().includes('hello') || lines[1].toLowerCase().includes('hi')) {
          revisedContent += `${lines[1].trim()} {First_Name},\n\n`;
        } else {
          revisedContent += `Hello {First_Name},\n\n`;
          revisedContent += `${lines[1]}\n`;
        }
        
        // Add the rest of the content with some formatting
        for (let i = 2; i < lines.length; i++) {
          if (lines[i].trim() === '') {
            revisedContent += '\n';
          } else if (lines[i].length > 80) {
            // Break up long paragraphs
            revisedContent += `${lines[i].substring(0, 80)}\n${lines[i].substring(80)}\n`;
          } else {
            revisedContent += `${lines[i]}\n`;
          }
        }
      }
    } else {
      revisedContent = emailContent;
    }
    
    // Add a P.S. if not already present
    if (!revisedContent.toLowerCase().includes('p.s.')) {
      revisedContent += '\n\nP.S. Don\'t miss out on this limited-time opportunity!';
    }
    
    return {
      improvements,
      revisedContent
    };
  }
}