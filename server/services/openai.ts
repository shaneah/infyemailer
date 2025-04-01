import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      model: 'gpt-3.5-turbo',
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
    throw error;
  }
}