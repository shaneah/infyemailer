import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import EmailEditor from "@/components/EmailEditor";
import {
  ArrowLeft, 
  Loader2, 
  FileCode, 
  Eye,
  Save
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Main Template Builder component 
export default function TemplateBuilder() {
  const { toast } = useToast();
  const params = useParams();
  const [location, navigate] = useLocation();
  const entityId = params.id;
  const [htmlCode, setHtmlCode] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("visual");

  // Fetch template if in edit mode
  const { data: template, isLoading: isTemplateLoading } = useQuery({
    queryKey: [`/api/templates/${entityId}`],
    queryFn: async () => {
      if (!entityId) return null;
      try {
        const response = await fetch(`/api/templates/${entityId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching template:", error);
        toast({
          title: "Error",
          description: "Failed to load template",
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: !!entityId,
  });

  // Set edit mode when template is loaded
  useEffect(() => {
    if (template) {
      setIsEditMode(true);
    }
  }, [template]);

  // Initialize template data
  let initialTemplate = null;
  if (template && template.content) {
    try {
      // Try to parse the template content as JSON
      initialTemplate = JSON.parse(template.content);
    } catch (err) {
      console.error("Failed to parse template content:", err);
      // If it's not valid JSON, it might be HTML content from an old template
      initialTemplate = {
        name: template.name || "Untitled Template",
        subject: template.subject || "",
        previewText: "",
        sections: [
          {
            id: `section-${Date.now()}`,
            elements: [
              {
                id: `element-${Date.now()}`,
                type: "text",
                content: { text: template.content || "This template was created in an older format and needs to be rebuilt." },
                styles: { fontSize: "16px", color: "#666666", textAlign: "left" }
              }
            ],
            styles: {
              backgroundColor: "#ffffff",
              padding: "12px"
            }
          }
        ],
        styles: {
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#f4f4f4",
          maxWidth: "600px"
        }
      };
    }
  }

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async ({ templateData, htmlContent }: { templateData: any, htmlContent: string }) => {
      setIsSaving(true);
      try {
        // Prepare data for API
        const payload = {
          name: templateData.name,
          subject: templateData.subject,
          content: htmlContent,
          previewText: templateData.previewText || "",
          category: templateData.category || "general",
          description: templateData.description || `Email template created with the editor on ${new Date().toLocaleString()}`
        };

        // Determine if we're creating or updating
        let response;
        if (isEditMode && entityId) {
          // Update existing template
          response = await apiRequest('PATCH', `/api/templates/${entityId}`, payload);
        } else {
          // Create new template
          response = await apiRequest('POST', '/api/templates', payload);
        }

        if (!response.ok) {
          throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} template`);
        }

        const savedTemplate = await response.json();
        return savedTemplate;
      } catch (error) {
        console.error("Error saving template:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    onSuccess: (savedTemplate) => {
      toast({
        title: `Template ${isEditMode ? 'updated' : 'created'} successfully`,
        description: `Your email template has been ${isEditMode ? 'updated' : 'saved'}.`,
        variant: "default",
      });
      
      // Invalidate templates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      
      // Navigate to templates list after a short delay
      setTimeout(() => {
        navigate('/templates');
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to save template: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // Handle template save
  const handleSaveTemplate = (template: any, html: string) => {
    setHtmlCode(html);
    saveTemplateMutation.mutate({ 
      templateData: template, 
      htmlContent: html 
    });
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/templates');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top navigation */}
      <div className="flex items-center gap-4 p-5 bg-white border-b shadow-sm">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleBack}
          className="rounded-full hover:bg-gray-100 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {isEditMode ? 'Edit Template' : 'Create New Template'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEditMode ? 'Update your email template design' : 'Design a beautiful email template with our drag-and-drop editor'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mr-2">
            <TabsList className="bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="visual" 
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger 
                value="code"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm" 
              >
                <FileCode className="h-4 w-4 mr-2" />
                HTML Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            disabled={isSaving}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            onClick={() => {
              if (htmlCode) {
                handleSaveTemplate(
                  initialTemplate || { name: "Untitled Template", subject: "Email Subject" },
                  htmlCode
                );
              } else {
                toast({
                  title: "Error",
                  description: "No template content to save. Please design your template first.",
                  variant: "destructive"
                });
              }
            }}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        <Tabs value={activeTab} className="flex-1 flex flex-col w-full">
          <TabsContent value="visual" className="flex-1 p-6 overflow-auto mt-0">
            {isTemplateLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-700 font-medium">Loading template...</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-[960px]">
                <div className="bg-white rounded-lg shadow-lg p-6 min-h-[600px] border border-gray-100">
                  <EmailEditor 
                    initialTemplate={initialTemplate || {
                      name: "My Professional Template",
                      subject: "Important: Your Email Subject Line",
                      previewText: "A preview of your email content goes here...",
                      sections: [],
                      styles: {
                        fontFamily: "Arial, sans-serif",
                        backgroundColor: "#f5f5f5",
                        width: "100%",
                        maxWidth: "600px"
                      }
                    }}
                    onSave={handleSaveTemplate}
                    isSaving={isSaving}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="code" className="flex-1 p-6 overflow-auto mt-0">
            <div className="mx-auto max-w-[960px]">
              <div className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-lg overflow-auto min-h-[600px] border border-gray-800">
                <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-400">HTML Output</div>
                </div>
                <pre className="text-sm font-mono">{htmlCode || '<!-- No HTML code generated yet -->'}</pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}