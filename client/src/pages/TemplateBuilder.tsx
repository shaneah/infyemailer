import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import EmailEditor from "@/components/EmailEditor";
import { ArrowLeft, Loader2, Save } from "lucide-react";

interface Template {
  id?: number;
  name: string;
  subject: string;
  previewText?: string;
  sections?: Array<any>;
  styles?: {
    fontFamily?: string;
    backgroundColor?: string;
    width?: string;
    maxWidth?: string;
  };
}

export default function TemplateBuilder() {
  const [, navigate] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  
  const [initialTemplate, setInitialTemplate] = useState<Template | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');
  
  // Fetch the template data if editing an existing template
  useEffect(() => {
    if (params?.id) {
      setIsTemplateLoading(true);
      fetch(`/api/templates/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setInitialTemplate(data);
        })
        .catch(err => {
          toast({
            title: "Error",
            description: "Failed to load template. " + (err.message || ""),
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsTemplateLoading(false);
        });
    }
  }, [params?.id, toast]);
  
  // Handle saving of template
  const handleSaveTemplate = async (templateData: any, html: string) => {
    setIsSaving(true);
    
    try {
      const method = templateData.id ? 'PATCH' : 'POST';
      const url = templateData.id ? `/api/templates/${templateData.id}` : '/api/templates';
      
      const payload = {
        ...templateData,
        content: html,
        category: 'email',
      };
      
      const response = await apiRequest(url, {
        method,
        body: payload
      });
      
      toast({
        title: templateData.id ? "Template Updated" : "Template Created",
        description: `Successfully ${templateData.id ? 'updated' : 'created'} template "${templateData.name}"`,
      });
      
      if (!templateData.id) {
        navigate(`/templates/builder/${response.id}`);
      }
      
      setHtmlCode(html);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save template. " + (error.message || ""),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate('/templates');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="mr-3 text-white hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-medium">
            {initialTemplate?.name || "New Email Template"}
          </h1>
        </div>
        
        <Button
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-md"
          disabled={isSaving}
          onClick={() => {
            if (htmlCode) {
              handleSaveTemplate(
                initialTemplate || { name: "New Email Template", subject: "Important: Your Email Subject Line" },
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
              Save
            </>
          )}
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-6 bg-slate-100 overflow-auto">
        {isTemplateLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-700 font-medium">Loading template...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-md shadow-md min-h-[600px] mx-auto max-w-[800px]">
            <EmailEditor 
              initialTemplate={initialTemplate || {
                name: "New Email Template",
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
        )}
      </div>
    </div>
  );
}