import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import EmailEditor from "@/components/EmailEditor";
import { ArrowLeft, Loader2, Code } from "lucide-react";

// Main Template Builder component
export default function TemplateBuilder() {
  const { toast } = useToast();
  const params = useParams();
  const [location, navigate] = useLocation();
  const entityId = params.id;
  const [activeTab, setActiveTab] = useState("visual");
  const [htmlCode, setHtmlCode] = useState<string>("");
  const [isHtmlCodeVisible, setIsHtmlCodeVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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
        subject: "",
        sections: [
          {
            id: `section-${Date.now()}`,
            elements: [
              {
                id: `element-${Date.now()}`,
                type: "text",
                content: { text: "This template was created in an older format and needs to be rebuilt." },
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
          subject: templateData.subject || "",
          content: JSON.stringify(templateData),
          previewText: templateData.previewText || "",
          category: "custom", // Default category
          description: `Email template created with drag-and-drop editor on ${new Date().toLocaleString()}`
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
  const handleSaveTemplate = (templateData: any, htmlContent: string) => {
    setHtmlCode(htmlContent);
    saveTemplateMutation.mutate({ templateData, htmlContent });
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/templates');
  };

  // Toggle HTML code view
  const toggleHtmlCode = () => {
    setIsHtmlCodeVisible(!isHtmlCodeVisible);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <h1 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Template' : 'Create New Template'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleHtmlCode}
            className={isHtmlCodeVisible ? 'bg-gray-100' : ''}
          >
            <Code className="h-4 w-4 mr-2" />
            {isHtmlCodeVisible ? 'Hide HTML' : 'View HTML'}
          </Button>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <Tabs 
          defaultValue="visual" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="container mx-auto">
              <TabsList className="h-10">
                <TabsTrigger value="visual" className="px-4">Visual Editor</TabsTrigger>
                {isHtmlCodeVisible && (
                  <TabsTrigger value="code" className="px-4">HTML Code</TabsTrigger>
                )}
              </TabsList>
            </div>
          </div>
          
          <TabsContent value="visual" className="flex-1 overflow-hidden mt-0 p-0">
            {isTemplateLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-gray-500">Loading template...</p>
                </div>
              </div>
            ) : (
              <EmailEditor 
                initialTemplate={initialTemplate}
                onSave={handleSaveTemplate}
                isSaving={isSaving}
                className="h-full"
              />
            )}
          </TabsContent>
          
          {isHtmlCodeVisible && (
            <TabsContent value="code" className="flex-1 overflow-auto mt-0 p-0">
              <div className="container mx-auto py-4 px-6">
                <div className="bg-gray-900 text-gray-200 p-4 rounded-md overflow-auto h-[calc(100vh-180px)]">
                  <pre className="text-sm">{htmlCode}</pre>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}