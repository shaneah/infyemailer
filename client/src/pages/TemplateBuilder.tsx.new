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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navigation */}
      <div className="flex items-center gap-4 p-4 bg-white border-b">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1">
          <h1 className="text-xl font-semibold">
            {isEditMode ? 'Edit Template' : 'Create New Template'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mr-4">
            <TabsList>
              <TabsTrigger value="visual">
                <Eye className="h-4 w-4 mr-2" />
                Visual Editor
              </TabsTrigger>
              <TabsTrigger value="code">
                <FileCode className="h-4 w-4 mr-2" />
                HTML Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            disabled={isSaving}
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} className="flex-1 flex flex-col">
          <TabsContent value="visual" className="flex-1 p-4 overflow-auto mt-0">
            {isTemplateLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading template...</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-[900px] bg-white rounded shadow-sm p-4 min-h-[600px]">
                <EmailEditor 
                  initialTemplate={initialTemplate || {
                    name: "New Email Template",
                    subject: "Your Email Subject",
                    previewText: "",
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
            )}
          </TabsContent>
          
          <TabsContent value="code" className="flex-1 p-4 overflow-auto mt-0">
            <div className="mx-auto max-w-[900px]">
              <div className="bg-gray-900 text-gray-200 p-4 rounded-md overflow-auto min-h-[600px]">
                <pre className="text-sm">{htmlCode || '<!-- No HTML code generated yet -->'}</pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}