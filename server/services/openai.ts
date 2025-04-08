import OpenAI from 'openai';
import { 
  mockGenerateSubjectLines, 
  mockGenerateEmailTemplate, 
  mockGenerateColorPalette 
} from './mockOpenai';

// Get the API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
});

// Log OpenAI setup status
console.log(`OpenAI API key ${apiKey ? 'is set' : 'is NOT set'}`);

// Flag to determine if we should use the real OpenAI API or the mock implementation
const useMockImplementation = !apiKey || process.env.USE_MOCK_OPENAI === 'true';
console.log(`Using ${useMockImplementation ? 'MOCK' : 'REAL'} OpenAI implementation`);

/**
 * Generates email subject lines based on the provided context
 * 
 * @param emailContent - The content of the email
 * @param emailType - The type/purpose of the email (promotional, newsletter, etc.)
 * @param targetAudience - Description of the target audience
 * @param keywords - Optional keywords to include
 * @param count - Number of subject lines to generate (default: 5)
 * @returns Promise<string[]> - An array of generated subject lines
 */
export async function generateSubjectLines(
  emailContent: string,
  emailType: string,
  targetAudience: string,
  keywords: string = '',
  count: number = 5
): Promise<string[]> {
  // Use mock implementation if API key is not available or mock mode is enabled
  if (useMockImplementation) {
    console.log('Using mock subject line generation');
    return mockGenerateSubjectLines(emailContent, emailType, targetAudience, keywords, count);
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    const prompt = `
    Generate ${count} unique and engaging email subject lines for a ${emailType} email.
    
    Email content:
    ${emailContent}
    
    Target audience:
    ${targetAudience}
    
    ${keywords ? `Keywords to consider: ${keywords}` : ''}
    
    Guidelines:
    - Keep subject lines concise (under 50 characters)
    - Make them compelling and attention-grabbing
    - Avoid spam trigger words and excessive punctuation
    - Focus on benefits and value proposition
    - Create a sense of urgency or curiosity when appropriate
    - Personalize to the target audience
    - Make subject lines sound natural, as if written by a human
    
    Please return ONLY the subject lines as a numbered list without any additional explanation.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert email marketer specializing in writing high-converting subject lines.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    });

    // Extract the response and parse it into an array of subject lines
    const responseText = completion.choices[0]?.message?.content || '';
    
    // Split the text by newlines and filter out empty lines
    // Also clean up numbered list formatting (1., 2., etc.)
    const subjectLines = responseText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+[\.\)-]\s*/, '').trim())
      .slice(0, count);

    return subjectLines;
  } catch (error) {
    console.error('Error generating subject lines:', error);
    console.log('Falling back to mock subject line generation');
    return mockGenerateSubjectLines(emailContent, emailType, targetAudience, keywords, count);
  }
}

/**
 * Generates an email template based on the provided parameters
 * 
 * @param templateType - The type of template (newsletter, promotional, announcement, etc.)
 * @param industry - The industry or business category
 * @param purpose - The specific purpose or goal of the email
 * @param targetAudience - Description of the target audience
 * @param brandTone - The tone of voice for the brand (professional, casual, friendly, etc.)
 * @param keyPoints - Main points to include in the template
 * @returns Promise<{ name: string, subject: string, content: string }> - The generated template
 */
export async function generateEmailTemplate(
  templateType: string,
  industry: string,
  purpose: string,
  targetAudience: string,
  brandTone: string = 'professional',
  keyPoints: string = ''
): Promise<{ name: string, subject: string, content: string, description: string }> {
  // Use mock implementation if API key is not available or mock mode is enabled
  if (useMockImplementation) {
    console.log('Using mock email template generation');
    return mockGenerateEmailTemplate(templateType, industry, purpose, targetAudience, brandTone, keyPoints);
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      throw new Error('OpenAI API key is not configured.');
    }

    console.log('Starting real email template generation with OpenAI');
    console.log('Parameters:', { 
      templateType, 
      industry, 
      purpose: purpose.substring(0, 20) + '...', 
      targetAudience: targetAudience.substring(0, 20) + '...', 
      brandTone,
      keyPointsLength: keyPoints?.length || 0
    });

    const prompt = `
    Create a professional ${templateType} email template for a ${industry} business.

    Purpose:
    ${purpose}
    
    Target audience:
    ${targetAudience}
    
    Brand tone:
    ${brandTone}
    
    ${keyPoints ? `Key points to include:
    ${keyPoints}` : ''}
    
    Guidelines:
    - Create a HTML email template with inline CSS for maximum compatibility
    - Include a compelling subject line
    - Create a visually appealing structure with sections
    - Include header area, main content sections, and footer
    - Use responsive design principles
    - Include appropriate CTA buttons where relevant
    - Add placeholder areas for images (using placeholder divs with descriptions)
    - Include proper email footer with unsubscribe option
    - Design should be clean, modern, and professional
    - Template should be ready to use in email marketing platforms
    
    Return your response in JSON format as follows:
    {
      "name": "Name of the template", 
      "subject": "The subject line",
      "description": "A brief 1-2 sentence description of the template",
      "content": "The full HTML content of the email template"
    }
    `;

    try {
      console.log('Sending request to OpenAI API...');
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert email designer specializing in creating high-quality, responsive email templates with HTML and inline CSS.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      });
      
      console.log('Received response from OpenAI API');
      // Extract the response as JSON
      const responseText = completion.choices[0]?.message?.content || '{}';
      console.log('Response content length:', responseText.length);
      
      try {
        const templateData = JSON.parse(responseText);
        console.log('Successfully parsed template data JSON', {
          nameLength: templateData.name?.length || 0,
          subjectLength: templateData.subject?.length || 0,
          descriptionLength: templateData.description?.length || 0,
          contentLength: templateData.content?.length || 0
        });
        
        // Validate that we have the required fields
        if (!templateData.name || !templateData.subject || !templateData.content) {
          console.error('Missing required fields in template data:', Object.keys(templateData));
          throw new Error('Template response missing required fields');
        }
        
        return {
          name: templateData.name,
          subject: templateData.subject,
          content: templateData.content,
          description: templateData.description || `A ${brandTone} ${templateType} template for ${industry} businesses.`
        };
      } catch (parseError) {
        console.error('Error parsing template response:', parseError);
        console.error('Raw response text sample:', responseText.substring(0, 200) + '...');
        throw new Error('Failed to parse AI-generated template. The response was not valid JSON.');
      }
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      throw new Error(`OpenAI API error: ${apiError.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error generating email template:', error);
    console.log('Falling back to mock email template generation');
    return mockGenerateEmailTemplate(templateType, industry, purpose, targetAudience, brandTone, keyPoints);
  }
}

/**
 * Generates color palette based on brand description or image
 * 
 * @param brandDescription - Description of brand identity, values, and audience
 * @param industry - The industry or business category
 * @param mood - Desired mood or emotion for the color palette (energetic, calm, professional, etc.)
 * @param paletteSize - Number of colors to generate (default: 5)
 * @returns Promise<{ name: string, colors: { name: string, hex: string, rgb: string }[] }> - The generated color palette
 */
export async function generateColorPalette(
  brandDescription: string,
  industry: string,
  mood: string = 'professional',
  paletteSize: number = 5
): Promise<{ 
  name: string, 
  colors: Array<{ name: string, hex: string, rgb: string }>,
  description: string
}> {
  // Use mock implementation if API key is not available or mock mode is enabled
  if (useMockImplementation) {
    console.log('Using mock color palette generation');
    return mockGenerateColorPalette(brandDescription, industry, mood, paletteSize);
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    const prompt = `
    Create a harmonious color palette for an email template with ${paletteSize} colors based on the following information:
    
    Brand description:
    ${brandDescription}
    
    Industry:
    ${industry}
    
    Desired mood/emotion:
    ${mood}
    
    Guidelines:
    - Create a cohesive, visually appealing color scheme that works well for email marketing
    - Include a primary/brand color, accent colors, and neutral tones
    - Consider color psychology and industry standards
    - Ensure sufficient contrast for readability
    - Provide colors that work well for backgrounds, text, buttons, and highlights
    - Ensure the palette follows accessibility standards (WCAG)
    - Choose colors that evoke the specified mood
    
    Return your response in JSON format as follows:
    {
      "name": "A creative name for the palette",
      "description": "Brief description of the palette and how it reflects the brand",
      "colors": [
        {
          "name": "Color name (e.g., Primary Blue)",
          "hex": "#RRGGBB format", 
          "rgb": "rgb(R,G,B) format"
        },
        // Additional colors...
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert designer specializing in color theory and creating harmonious color palettes for digital marketing.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      response_format: { type: "json_object" }
    });

    // Extract the response as JSON
    const responseText = completion.choices[0]?.message?.content || '{}';
    
    try {
      const paletteData = JSON.parse(responseText);
      return {
        name: paletteData.name || `${industry} ${mood} palette`,
        colors: paletteData.colors || [],
        description: paletteData.description || `A ${mood} color palette for ${industry} businesses.`
      };
    } catch (parseError) {
      console.error('Error parsing color palette response:', parseError);
      throw new Error('Failed to parse AI-generated color palette.');
    }
  } catch (error) {
    console.error('Error generating color palette:', error);
    console.log('Falling back to mock color palette generation');
    return mockGenerateColorPalette(brandDescription, industry, mood, paletteSize);
  }
}