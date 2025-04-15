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

// Function to parse template content that could be HTML or JSON
const parseTemplateContent = (content: string): string => {
  try {
    // Try to parse as JSON first
    const templateData = JSON.parse(content);
    
    // Handle various template formats
    if (templateData.metadata?.originalHtml) {
      return templateData.metadata.originalHtml;
    } else if (templateData.sections) {
      // Process sections with HTML elements
      let html = '';
      templateData.sections.forEach((section: any) => {
        if (section.elements) {
          section.elements.forEach((element: any) => {
            if (element.type === 'html' && element.content?.html) {
              html += element.content.html;
            } else if (element.type === 'text' && element.content?.text) {
              html += `<div style="font-size: ${element.styles?.fontSize || '16px'}; color: ${element.styles?.color || '#000000'}; text-align: ${element.styles?.textAlign || 'left'};">${element.content.text}</div>`;
            }
          });
        }
      });
      return html || content; // Return the constructed HTML or the original content if empty
    }
    
    // If we couldn't extract HTML from JSON, return a formatted display of the JSON
    return `<pre style="white-space: pre-wrap; font-family: monospace; font-size: 14px;">${JSON.stringify(templateData, null, 2)}</pre>`;
  } catch (e) {
    // If parsing as JSON fails, assume it's already HTML
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
  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.currentTarget;
    if (iframe.contentWindow) {
      // Add resize event listener
      const resizeObserver = new ResizeObserver(() => {
        if (iframe.contentDocument?.body) {
          const height = iframe.contentDocument.body.scrollHeight;
          iframe.style.height = `${Math.min(height, 800)}px`;
        }
      });
      
      if (iframe.contentDocument?.body) {
        resizeObserver.observe(iframe.contentDocument.body);
      }
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