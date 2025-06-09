import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Code, 
  Eye, 
  Sparkles,
  LoaderCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InteractiveTemplatePreviewProps {
  templateContent: string;
  personalizedData?: Record<string, any>;
  isLoading?: boolean;
  onContentChange?: (content: string) => void;
}

// Add these interfaces at the top of the file, after the imports
interface TemplateElement {
  type: 'html' | 'text' | 'image' | 'button';
  content?: {
    html?: string;
    text?: string;
    src?: string;
    alt?: string;
    href?: string;
  };
  styles?: {
    fontSize?: string;
    color?: string;
    textAlign?: string;
  };
}

interface TemplateSection {
  elements?: TemplateElement[];
  content?: string;
}

// Function to parse template content that could be HTML or JSON
const parseTemplateContent = (content: string): string => {
  if (!content) {
    return '';
  }

  // First check if it's HTML content
  const trimmedContent = content.trim();
  if (trimmedContent.startsWith('<!DOCTYPE') || 
      trimmedContent.startsWith('<html') || 
      trimmedContent.startsWith('<div') || 
      trimmedContent.startsWith('<p') || 
      trimmedContent.startsWith('<span')) {
    return content;
  }

  try {
    // Try to parse as JSON
    const templateData = JSON.parse(content);

    // Case 1: Direct HTML in metadata
    if (templateData.metadata?.originalHtml) {
      return templateData.metadata.originalHtml;
    }

    // Case 2: Sections with elements
    if (templateData.sections && Array.isArray(templateData.sections)) {
      let html = '<div class="template-container">';
      
      templateData.sections.forEach((section: TemplateSection) => {
        if (!section) return;

        html += '<div class="template-section">';
        
        // Handle elements array
        if (section.elements && Array.isArray(section.elements)) {
          section.elements.forEach((element: TemplateElement) => {
            if (!element) return;

            switch (element.type) {
              case 'html':
                if (element.content?.html) {
                  html += element.content.html;
                }
                break;
              case 'text':
                if (element.content?.text) {
                  html += `<div style="font-size: ${element.styles?.fontSize || '16px'}; color: ${element.styles?.color || '#000000'}; text-align: ${element.styles?.textAlign || 'left'};">${element.content.text}</div>`;
                }
                break;
              case 'image':
                if (element.content?.src) {
                  html += `<div style="text-align: center;"><img src="${element.content.src}" alt="${element.content?.alt || ''}" style="max-width: 100%; height: auto;" /></div>`;
                }
                break;
              case 'button':
                if (element.content?.text) {
                  html += `<div style="text-align: center; margin: 10px 0;"><a href="${element.content?.href || '#'}" style="display: inline-block; padding: 10px 20px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px;">${element.content.text}</a></div>`;
                }
                break;
            }
          });
        }
        // Handle direct content
        else if (section.content) {
          html += section.content;
        }
        
        html += '</div>';
      });

      html += '</div>';
      return html;
    }

    // Case 3: Direct HTML or content string
    if (typeof templateData.html === 'string') {
      return templateData.html;
    }
    if (typeof templateData.content === 'string') {
      return templateData.content;
    }

    // Case 4: Fallback - display JSON structure
    return `<div class="template-json-preview">
      <div style="padding: 20px; background-color: #f7f7f7; border-radius: 6px;">
        <pre style="white-space: pre-wrap; font-family: monospace; font-size: 14px;">${JSON.stringify(templateData, null, 2)}</pre>
      </div>
    </div>`;
  } catch (e) {
    // If JSON parsing fails, return the content as is (assuming it's HTML)
    return content;
  }
};

// Function to personalize content with placeholders
const personalizeContent = (content: string, data: Record<string, any> = {}): string => {
  let personalizedContent = content;
  
  // Replace all {{placeholder}} with actual data
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    personalizedContent = personalizedContent.replace(regex, String(value));
  });
  
  // Fill any remaining placeholders with sample data
  personalizedContent = personalizedContent.replace(/{{\\s*[a-zA-Z0-9_.-]+\\s*}}/g, '[Sample Data]');
  
  return personalizedContent;
};

const InteractiveTemplatePreview: React.FC<InteractiveTemplatePreviewProps> = ({
  templateContent,
  personalizedData = {},
  isLoading = false,
  onContentChange
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [displayMode, setDisplayMode] = useState<'preview' | 'code'>('preview');
  const [personalizeView, setPersonalizeView] = useState(false);
  const { toast } = useToast();
  
  // Fetch a list of sample profile data that can be used for personalization
  const { data: sampleProfiles, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['/api/contacts/sample-profiles'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/contacts/sample-profiles');
        return response.json();
      } catch (error) {
        // Return a default sample profile if API fails
        return {
          profiles: [{
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            company: 'Acme Inc',
            role: 'Manager',
            city: 'New York',
            country: 'USA'
          }]
        };
      }
    },
    enabled: personalizeView,
  });
  
  // Get the parsed HTML content
  const getParsedContent = () => {
    if (!templateContent) return '';
    
    const parsedHtml = parseTemplateContent(templateContent);
    
    if (personalizeView) {
      const profileData = sampleProfiles?.profiles?.[0] || personalizedData;
      return personalizeContent(parsedHtml, profileData);
    }
    
    return parsedHtml;
  };
  
  // Handle viewport dimensions based on selected device
  const getViewportStyle = () => {
    switch (viewMode) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          maxHeight: '80vh',
          transform: 'scale(0.9)',
          transformOrigin: 'top center'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          maxHeight: '80vh',
          transform: 'scale(0.7)',
          transformOrigin: 'top center'
        };
      default:
        return {
          width: '100%',
          maxWidth: '900px',
          height: '100%',
          maxHeight: '80vh'
        };
    }
  };
  
  // Auto-resize the iframe to content height
  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const iframe = event.target as HTMLIFrameElement;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        const style = iframeDoc.createElement('style');
        style.textContent = `
          body { 
            margin: 0; 
            padding: 20px;
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            background-color: #f4f4f4;
          }
          .template-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .template-section { 
            margin-bottom: 20px; 
          }
          img { 
            max-width: 100%; 
            height: auto; 
          }
          a { 
            color: #2563eb; 
            text-decoration: none; 
          }
          .template-json-preview {
            padding: 20px;
            background-color: #f7f7f7;
            border-radius: 6px;
          }
        `;
        iframeDoc.head.appendChild(style);
      }
    } catch (error) {
      console.error('Error setting up iframe:', error);
    }
  };
  
  // Toggle responsive preview modes
  const handleViewModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setViewMode(mode);
  };
  
  // Toggle between preview and code view
  const handleDisplayModeChange = (mode: 'preview' | 'code') => {
    setDisplayMode(mode);
  };
  
  // Toggle personalization
  const handlePersonalizeToggle = () => {
    setPersonalizeView(!personalizeView);
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-2">
        <h3 className="font-medium">Template Preview</h3>
        
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-md flex">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 h-8 rounded-none ${viewMode === 'desktop' ? 'bg-gray-100' : ''}`}
              onClick={() => handleViewModeChange('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 h-8 rounded-none ${viewMode === 'tablet' ? 'bg-gray-100' : ''}`}
              onClick={() => handleViewModeChange('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 h-8 rounded-none ${viewMode === 'mobile' ? 'bg-gray-100' : ''}`}
              onClick={() => handleViewModeChange('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md flex">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 h-8 rounded-none ${displayMode === 'preview' ? 'bg-gray-100' : ''}`}
              onClick={() => handleDisplayModeChange('preview')}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 h-8 rounded-none ${displayMode === 'code' ? 'bg-gray-100' : ''}`}
              onClick={() => handleDisplayModeChange('code')}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant={personalizeView ? "default" : "outline"}
            size="sm"
            className="gap-1 h-8"
            onClick={handlePersonalizeToggle}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Personalize
          </Button>
        </div>
      </div>
      
      <div className="p-4 flex justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <LoaderCircle className="h-8 w-8 animate-spin mb-2" />
            <span>Loading preview...</span>
          </div>
        ) : displayMode === 'preview' ? (
          <div 
            className="border border-gray-200 rounded-md overflow-hidden transition-all duration-300 bg-gray-50 mx-auto"
            style={getViewportStyle()}
          >
            <iframe
              title="Email Template Preview"
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { margin: 0; font-family: Arial, sans-serif; }
                    * { box-sizing: border-box; }
                  </style>
                </head>
                <body>${getParsedContent()}</body>
                </html>
              `}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
            />
          </div>
        ) : (
          <div className="w-full max-w-3xl">
            <div className="rounded-md border bg-gray-50 p-2">
              <pre className="text-xs overflow-auto p-2 max-h-[600px]">{getParsedContent()}</pre>
            </div>
          </div>
        )}
      </div>
      
      {personalizeView && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Sparkles className="h-4 w-4" />
            <span>Showing personalized preview with sample data.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveTemplatePreview;