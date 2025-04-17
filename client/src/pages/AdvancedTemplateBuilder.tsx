import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import AdvancedTemplateBuilder from "@/components/AdvancedTemplateBuilder";
import { Loader2 } from "lucide-react";

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

export default function AdvancedTemplateBuilderPage() {
  const [, navigate] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  
  const [initialTemplate, setInitialTemplate] = useState<Template | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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
        navigate(`/templates/advanced-builder/${response.id}`);
      }
      
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

  if (isTemplateLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-emerald-500" />
          <p className="text-gray-300 font-medium">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <AdvancedTemplateBuilder
      initialTemplate={initialTemplate || undefined}
      onSave={handleSaveTemplate}
      isSaving={isSaving}
    />
  );
}