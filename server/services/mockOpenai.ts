/**
 * This file provides mock implementations of OpenAI services
 * for testing purposes when the API key is not available.
 */

/**
 * Generates mock email subject lines
 */
export async function mockGenerateSubjectLines(
  emailContent: string,
  emailType: string,
  targetAudience: string,
  keywords: string = '',
  count: number = 5
): Promise<string[]> {
  // Create some sample subject lines based on the inputs
  const subjectLines = [
    `[${emailType.toUpperCase()}] Special offer for ${targetAudience.split(' ')[0]}`,
    `Don't miss our ${emailType} - perfect for ${targetAudience.split(' ')[0]}`,
    `${keywords ? keywords.split(' ')[0] : 'Exclusive'} ${emailType} just for you`,
    `The ${emailType} you've been waiting for`,
    `${emailType.charAt(0).toUpperCase() + emailType.slice(1)} that will change everything`,
    `${keywords ? keywords.split(' ')[0] : 'New'} opportunities with our ${emailType}`,
    `${targetAudience.split(' ')[0]}, check out this ${emailType}!`
  ];
  
  // Return the requested number of subject lines
  return subjectLines.slice(0, count);
}

/**
 * Generates mock color palettes
 */
export async function mockGenerateColorPalette(
  brandDescription: string,
  industry: string,
  mood: string = 'professional',
  paletteSize: number = 5
): Promise<{
  name: string,
  colors: Array<{ name: string, hex: string, rgb: string }>,
  description: string
}> {
  // Default professional palette
  const professionalPalette = {
    name: "Classic Professional",
    description: `A sophisticated and trustworthy palette suited for ${industry} businesses, conveying a ${mood} feel.`,
    colors: [
      { name: "Primary Blue", hex: "#0055A4", rgb: "rgb(0, 85, 164)" },
      { name: "Accent Teal", hex: "#00A5B5", rgb: "rgb(0, 165, 181)" },
      { name: "Neutral Gray", hex: "#6C757D", rgb: "rgb(108, 117, 125)" },
      { name: "Light Gray", hex: "#E9ECEF", rgb: "rgb(233, 236, 239)" },
      { name: "Dark Charcoal", hex: "#343A40", rgb: "rgb(52, 58, 64)" }
    ]
  };

  // Creative/modern palette
  const creativePalette = {
    name: "Vibrant Creative",
    description: `A bold and modern palette for ${industry} businesses looking to make a statement, with energy that conveys a ${mood} feel.`,
    colors: [
      { name: "Vibrant Purple", hex: "#6200EA", rgb: "rgb(98, 0, 234)" },
      { name: "Electric Pink", hex: "#FF4081", rgb: "rgb(255, 64, 129)" },
      { name: "Bright Teal", hex: "#00BCD4", rgb: "rgb(0, 188, 212)" },
      { name: "Light Lavender", hex: "#F3E5F5", rgb: "rgb(243, 229, 245)" },
      { name: "Deep Indigo", hex: "#3F51B5", rgb: "rgb(63, 81, 181)" }
    ]
  };

  // Natural/organic palette
  const naturalPalette = {
    name: "Earthy Organic",
    description: `A warm, natural palette ideal for ${industry} businesses with an organic feel, perfectly capturing a ${mood} atmosphere.`,
    colors: [
      { name: "Forest Green", hex: "#388E3C", rgb: "rgb(56, 142, 60)" },
      { name: "Terracotta", hex: "#D87C55", rgb: "rgb(216, 124, 85)" },
      { name: "Sand", hex: "#E6D2B5", rgb: "rgb(230, 210, 181)" },
      { name: "Deep Brown", hex: "#6D4C41", rgb: "rgb(109, 76, 65)" },
      { name: "Sage", hex: "#8BC19D", rgb: "rgb(139, 193, 157)" }
    ]
  };

  // Luxury palette
  const luxuryPalette = {
    name: "Premium Luxury",
    description: `An elegant and luxurious palette for ${industry} businesses targeting premium markets, with a refined ${mood} character.`,
    colors: [
      { name: "Royal Navy", hex: "#0A2342", rgb: "rgb(10, 35, 66)" },
      { name: "Gold", hex: "#D5AB55", rgb: "rgb(213, 171, 85)" },
      { name: "Cream", hex: "#F2F1E9", rgb: "rgb(242, 241, 233)" },
      { name: "Burgundy", hex: "#7B2D26", rgb: "rgb(123, 45, 38)" },
      { name: "Silver Gray", hex: "#C0C0C0", rgb: "rgb(192, 192, 192)" }
    ]
  };

  // Tech palette
  const techPalette = {
    name: "Digital Tech",
    description: `A modern, sleek palette for ${industry} businesses in the tech space, with a cutting-edge ${mood} vibe.`,
    colors: [
      { name: "Tech Blue", hex: "#2962FF", rgb: "rgb(41, 98, 255)" },
      { name: "Electric Green", hex: "#00E676", rgb: "rgb(0, 230, 118)" },
      { name: "Dark Slate", hex: "#263238", rgb: "rgb(38, 50, 56)" },
      { name: "Light Silver", hex: "#F5F5F5", rgb: "rgb(245, 245, 245)" },
      { name: "Accent Orange", hex: "#FF6D00", rgb: "rgb(255, 109, 0)" }
    ]
  };

  // Select a palette based on industry and mood
  let selectedPalette;
  const industryLower = industry.toLowerCase();
  const moodLower = mood.toLowerCase();

  if (moodLower.includes('luxury') || moodLower.includes('premium') || moodLower.includes('elegant')) {
    selectedPalette = luxuryPalette;
  } else if (moodLower.includes('creative') || moodLower.includes('vibrant') || moodLower.includes('bold') || moodLower.includes('modern')) {
    selectedPalette = creativePalette;
  } else if (moodLower.includes('natural') || moodLower.includes('organic') || moodLower.includes('earthy') || moodLower.includes('warm')) {
    selectedPalette = naturalPalette;
  } else if (moodLower.includes('tech') || industryLower.includes('tech') || industryLower.includes('software') || industryLower.includes('digital')) {
    selectedPalette = techPalette;
  } else {
    // Default to professional for most cases
    selectedPalette = professionalPalette;
  }

  // Adjust the size of the palette if necessary
  if (paletteSize < selectedPalette.colors.length) {
    selectedPalette.colors = selectedPalette.colors.slice(0, paletteSize);
  }

  return selectedPalette;
}

/**
 * Generates a mock email template
 */
export async function mockGenerateEmailTemplate(
  templateType: string,
  industry: string,
  purpose: string,
  targetAudience: string,
  brandTone: string = 'professional',
  keyPoints: string = ''
): Promise<{ name: string, subject: string, content: string, description: string }> {
  // Extract key points if provided
  const keyPointsList = keyPoints 
    ? keyPoints.split(',').map(point => `<li style="margin-bottom: 10px;">${point.trim()}</li>`).join('')
    : '<li style="margin-bottom: 10px;">Key product features and benefits</li><li style="margin-bottom: 10px;">Limited time offer</li><li style="margin-bottom: 10px;">Call to action</li>';
  
  const templateName = `${industry} ${templateType.charAt(0).toUpperCase() + templateType.slice(1)}`;
  const subject = `${purpose.split(' ').slice(0, 3).join(' ')}...`;
  const description = `A ${brandTone} ${templateType} template for ${industry} businesses targeting ${targetAudience}.`;
  
  // Generate HTML content based on template type
  const content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-spacing: 0; border-collapse: collapse;">
        <!-- Header Section -->
        <tr>
            <td style="padding: 40px 30px; background-color: #138a3f; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${industry.toUpperCase()} ${templateType.toUpperCase()}</h1>
            </td>
        </tr>
        
        <!-- Main Content Section -->
        <tr>
            <td style="padding: 30px 30px 20px 30px;">
                <h2 style="margin-top: 0; margin-bottom: 20px; color: #138a3f; font-size: 22px;">${purpose}</h2>
                <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.6; font-size: 16px;">Hello [Customer Name],</p>
                <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.6; font-size: 16px;">We're excited to share with you our latest updates designed specifically for ${targetAudience}.</p>
                
                <!-- Hero Image Placeholder -->
                <div style="background-color: #f2f2f2; text-align: center; padding: 40px 0; margin-bottom: 20px;">
                    <p style="margin: 0; color: #666666;">[Hero Image: ${templateType} visual]</p>
                </div>
                
                <!-- Key Points Section -->
                <h3 style="color: #138a3f; margin-top: 30px; margin-bottom: 20px; font-size: 18px;">Key Highlights:</h3>
                <ul style="padding-left: 20px; margin-bottom: 25px; line-height: 1.6;">
                    ${keyPointsList}
                </ul>
                
                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
                    <tr>
                        <td style="border-radius: 4px; background-color: #138a3f; text-align: center;">
                            <a href="#" target="_blank" style="background-color: #138a3f; border: solid 1px #138a3f; border-radius: 4px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: bold; padding: 12px 30px; text-decoration: none;">Learn More</a>
                        </td>
                    </tr>
                </table>
                
                <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.6; font-size: 16px;">If you have any questions, please don't hesitate to reach out to our team.</p>
                <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.6; font-size: 16px;">Best regards,</p>
                <p style="margin-top: 0; margin-bottom: 20px; line-height: 1.6; font-size: 16px; font-weight: bold;">The [Company Name] Team</p>
            </td>
        </tr>
        
        <!-- Footer Section -->
        <tr>
            <td style="padding: 30px 30px; background-color: #f8f8f8; text-align: center; color: #777777; font-size: 14px;">
                <p style="margin: 0 0 10px 0;">© 2025 [Company Name]. All rights reserved.</p>
                <p style="margin: 0 0 10px 0;">[Company Address]</p>
                <p style="margin: 0 0 10px 0;">
                    <a href="#" style="color: #138a3f; text-decoration: underline;">Privacy Policy</a> | 
                    <a href="#" style="color: #138a3f; text-decoration: underline;">Terms of Service</a> | 
                    <a href="#" style="color: #138a3f; text-decoration: underline;">Unsubscribe</a>
                </p>
                <div style="margin-top: 20px;">
                    <a href="#" style="margin: 0 5px; text-decoration: none;">
                        <img src="https://via.placeholder.com/30/138a3f/FFFFFF?text=FB" alt="Facebook" width="30" height="30" style="border-radius: 3px;">
                    </a>
                    <a href="#" style="margin: 0 5px; text-decoration: none;">
                        <img src="https://via.placeholder.com/30/138a3f/FFFFFF?text=TW" alt="Twitter" width="30" height="30" style="border-radius: 3px;">
                    </a>
                    <a href="#" style="margin: 0 5px; text-decoration: none;">
                        <img src="https://via.placeholder.com/30/138a3f/FFFFFF?text=IG" alt="Instagram" width="30" height="30" style="border-radius: 3px;">
                    </a>
                    <a href="#" style="margin: 0 5px; text-decoration: none;">
                        <img src="https://via.placeholder.com/30/138a3f/FFFFFF?text=LI" alt="LinkedIn" width="30" height="30" style="border-radius: 3px;">
                    </a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;

  return {
    name: templateName,
    subject,
    content,
    description
  };
}