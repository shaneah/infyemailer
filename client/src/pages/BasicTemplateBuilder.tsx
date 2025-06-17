import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BasicTemplateBuilderProps = {
  isClientPortal?: boolean;
};

export default function BasicTemplateBuilder({ isClientPortal = false }: BasicTemplateBuilderProps) {
  const { toast } = useToast();
  const params = useParams();
  const [location, navigate] = useLocation();
  
  // Extract the template ID from query parameters (new approach)
  const searchParams = new URLSearchParams(window.location.search);
  const queryTemplateId = searchParams.get('id');
  
  // Also get ID from URL parameters as fallback (old approach)
  const pathTemplateId = params.id;
  
  // Use query parameter ID first, then fall back to path ID
  const templateId = queryTemplateId || pathTemplateId;
  
  // Determine if we're in edit mode based on whether we have a template ID
  const isEditModeFromUrl = !!templateId;
  
  // Log debugging information
  console.log('BasicTemplateBuilder - Template ID Check:', {
    url: window.location.href,
    queryParams: window.location.search,
    queryTemplateId,
    pathTemplateId,
    finalTemplateId: templateId,
    isEditMode: isEditModeFromUrl
  });
  
  if (templateId) {
    console.log(`BasicTemplateBuilder - Edit mode detected with template ID: ${templateId}`);
  } else {
    console.log('BasicTemplateBuilder - Create mode detected (no template ID)');
  }
  
  // Get additional mode from URL query parameters
  const mode = searchParams.get('mode');
  
  // Fetch template data if editing an existing template
  const { data: templateData, isLoading: isLoadingTemplate } = useQuery({
    queryKey: [`/api/templates/${templateId}`],
    queryFn: async () => {
      if (!templateId) {
        console.log('No template ID provided, skipping fetch');
        return null;
      }
      
      console.log('Fetching template with ID:', templateId);
      try {
        // Ensure the URL is correctly formed
        const url = `/api/templates/${templateId}`;
        console.log('Fetch URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('Fetch response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Template data loaded:', data);
        return data;
      } catch (error) {
        console.error('Error fetching template:', error);
        toast({
          title: "Error",
          description: "Failed to load template",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!templateId,
  });

  // Template data
  const [isEditMode, setIsEditMode] = useState(isEditModeFromUrl);
  const [templateName, setTemplateName] = useState("New Email Template");
  const [templateSubject, setTemplateSubject] = useState("Your Email Subject");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("general");
  const [templateContent, setTemplateContent] = useState("");
  const [templateHtml, setTemplateHtml] = useState("");
  const [sections, setSections] = useState<Array<{
    id: string;
    type: string;
    content: string;
  }>>([]);
  const [activeTab, setActiveTab] = useState(mode === "import" ? "import" : mode === "ai" ? "ai" : "editor");
  const [isSaving, setIsSaving] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [showImportUI, setShowImportUI] = useState(mode === "import");
  const [showAIUI, setShowAIUI] = useState(mode === "ai");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  // Initialize form with template data when editing
  useEffect(() => {
    if (templateData) {
      console.log('Initializing form with template data:', templateData);
      setIsEditMode(true);
      setTemplateName(templateData.name || "Untitled Template");
      setTemplateSubject(templateData.subject || "Your Email Subject");
      setTemplateDescription(templateData.description || "");
      
      // Set HTML content if available
      if (templateData.content) {
        setHtmlContent(templateData.content);
      }
    }
  }, [templateData]);

  // Add a new section to the template
  const addSection = (type: string) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type,
      content: getDefaultContent(type)
    };
    
    setSections([...sections, newSection]);
  };

  // Get default content based on section type
  const getDefaultContent = (type: string) => {
    switch(type) {
      case "heading":
        return "Your Heading";
      case "text":
        return "Enter your text content here. This can be a paragraph of information for your recipients.";
      case "image":
        return "https://placehold.co/600x200?text=Image+Placeholder";
      case "button":
        return JSON.stringify({
          text: "Click Here",
          url: "#"
        });
      case "spacer":
        return "30";
      case "video":
        return "https://www.youtube.com/embed/dQw4w9WgXcQ";
      case "social":
        return JSON.stringify({
          facebook: "https://facebook.com",
          twitter: "https://twitter.com",
          instagram: "https://instagram.com",
          linkedin: "https://linkedin.com"
        });
      case "banner":
        return JSON.stringify({
          imageUrl: "https://placehold.co/600x200?text=Banner+Image",
          title: "Banner Title",
          text: "Banner description text goes here"
        });
      case "html":
        return "<div style='padding: 20px; background-color: #f9f9f9; border-radius: 5px;'><p>Custom HTML content can be added here.</p></div>";
      case "timer":
        // Default to 7 days from now
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString();
      case "menu":
        return JSON.stringify([
          { text: "Home", url: "#" },
          { text: "Products", url: "#" },
          { text: "About Us", url: "#" },
          { text: "Contact", url: "#" }
        ]);
      default:
        return "";
    }
  };

  // Update section content
  const updateSectionContent = (id: string, content: string) => {
    setSections(
      sections.map(section => 
        section.id === id ? { ...section, content } : section
      )
    );
  };

  // Remove section
  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  // Generate HTML preview
  const generateHtml = () => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${templateName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .header {
            background-color: #1a3a5f;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          h1, h2 {
            color: #1a3a5f;
          }
          p {
            line-height: 1.5;
            color: #333333;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #d4af37;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            text-align: center;
          }
          .button-container {
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            background-color: #f5f0e1;
            padding: 15px;
            text-align: center;
            color: #666666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${templateName}</h1>
            <p>${templateSubject}</p>
          </div>
          <div class="content">
    `;

    sections.forEach(section => {
      switch(section.type) {
        case "heading":
          html += `<h2>${section.content}</h2>`;
          break;
        case "text":
          html += `<p>${section.content}</p>`;
          break;
        case "image":
          html += `<img src="${section.content}" alt="Email image" />`;
          break;
        case "button":
          let buttonText = section.content;
          let buttonUrl = "#";
          
          try {
            const buttonData = JSON.parse(section.content);
            if (buttonData.text) buttonText = buttonData.text;
            if (buttonData.url) buttonUrl = buttonData.url;
          } catch (e) {
            // If not valid JSON, use content as button text with default URL
          }
          
          html += `
            <div class="button-container">
              <a href="${buttonUrl}" class="button">${buttonText}</a>
            </div>
          `;
          break;
        case "spacer":
          const spacerHeight = parseInt(section.content) || 30;
          html += `<div style="height: ${spacerHeight}px; line-height: 0; font-size: 0;">&nbsp;</div>`;
          break;
        default:
          // Handle other section types as needed
          break;
      }
    });

    html += `
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
            <p><a href="#" style="color: #666666;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  // Get client user info and extract the client ID
  const getClientUser = () => {
    const sessionUser = sessionStorage.getItem('clientUser');
    console.log('Session user:', sessionUser);
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        console.log('Parsed client user:', parsed);
        return parsed;
      } catch (error) {
        console.error('Error parsing client user', error);
        return null;
      }
    }
    return null;
  };

  const clientUser = getClientUser();
  const clientId = clientUser?.clientId;
  console.log('Client ID:', clientId);

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      if (!clientId && isClientPortal) {
        throw new Error('Client ID not found. Please try logging in again.');
      }

      const templateData = {
        name: templateName,
        subject: templateSubject,
        description: templateDescription,
        content: generateHtml(),
        category: templateCategory,
        clientId: clientId // Include client ID in the request
      };

      let url;
      if (isClientPortal) {
        url = isEditMode 
          ? `/api/client/${clientId}/templates/${templateId}`
          : `/api/client/${clientId}/templates`;
      } else {
        url = isEditMode 
          ? `/api/templates/${templateId}`
          : '/api/templates';
      }

      console.log('Saving template to:', url, 'with data:', templateData);

      const response = await apiRequest(isEditMode ? 'PATCH' : 'POST', url, templateData);
      const savedTemplate = await response.json();
      console.log('Template saved successfully:', savedTemplate);

      // Verify the template was saved with the client ID
      if (isClientPortal && (!savedTemplate.clientId || savedTemplate.clientId !== clientId)) {
        throw new Error('Template was not saved with the correct client ID');
      }

      return savedTemplate;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template saved successfully",
      });
      // Navigate back to templates list
      navigate(isClientPortal ? '/client/templates' : '/templates');
    },
    onError: (error) => {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
    }
  });

  // Handle saving template
  const saveTemplate = async () => {
    try {
      setIsSaving(true);
      await saveTemplateMutation.mutateAsync();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading template...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(isClientPortal ? '/client/templates' : '/templates')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Button>
        
        <h1 className="text-xl font-semibold">{isEditMode ? 'Edit Template' : 'Create New Template'}</h1>
        
        <div className="ml-auto">
          <Button
            onClick={saveTemplate}
            className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/90 text-white"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="templateSubject">Email Subject Line</Label>
                  <Input
                    id="templateSubject"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="Enter email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription">Description</Label>
                  <Textarea
                    id="templateDescription"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Enter template description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Template Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <div key={section.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium capitalize">{section.type}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {section.type === "text" || section.type === "heading" ? (
                        <Textarea
                          value={section.content}
                          onChange={(e) => updateSectionContent(section.id, e.target.value)}
                          rows={section.type === "heading" ? 1 : 4}
                        />
                      ) : section.type === "image" ? (
                        <Input
                          value={section.content}
                          onChange={(e) => updateSectionContent(section.id, e.target.value)}
                          placeholder="Enter image URL"
                        />
                      ) : (
                        <Textarea
                          value={section.content}
                          onChange={(e) => updateSectionContent(section.id, e.target.value)}
                          rows={4}
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSection("heading")}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Heading
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSection("text")}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Text
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSection("image")}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Image
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSection("button")}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Button
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSection("spacer")}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Spacer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4">
                  <iframe
                    title="Template Preview"
                    srcDoc={generateHtml()}
                    style={{ width: '100%', height: '500px', border: 'none' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
