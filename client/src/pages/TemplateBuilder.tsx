import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import EmailEditor from "@/components/EmailEditor";
import { ArrowLeft, Loader2, Save, Zap, Eye, Undo, Settings, Code } from "lucide-react";

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
  const [currentTab, setCurrentTab] = useState('editor');
  
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
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Top navigation */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 border-b border-blue-800">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="mr-4 text-blue-100 hover:bg-blue-800 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {initialTemplate?.name || "New Email Template"}
            </h1>
            <p className="text-blue-300 text-sm">
              {initialTemplate?.id ? "Editing existing template" : "Creating new template"}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-blue-500 text-blue-300 hover:bg-blue-800 hover:text-blue-100"
            onClick={() => {
              toast({
                title: "Preview Mode",
                description: "Preview functionality will be available soon!"
              });
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <Button
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
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
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentTab('editor')}
              className={`px-4 py-3 text-sm font-medium flex items-center ${
                currentTab === 'editor' 
                  ? 'border-b-2 border-emerald-500 text-white' 
                  : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-500'
              }`}
            >
              <Zap className={`h-4 w-4 mr-2 ${currentTab === 'editor' ? 'text-emerald-500' : 'text-gray-400'}`} />
              Design Editor
            </button>
            <button
              onClick={() => {
                toast({
                  title: "Code View",
                  description: "HTML code view will be available soon!"
                });
              }}
              className="px-4 py-3 text-sm font-medium flex items-center text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-500"
            >
              <Code className="h-4 w-4 mr-2 text-gray-400" />
              Code View
            </button>
            <button
              onClick={() => {
                toast({
                  title: "Settings",
                  description: "Template settings will be available soon!"
                });
              }}
              className="px-4 py-3 text-sm font-medium flex items-center text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-500"
            >
              <Settings className="h-4 w-4 mr-2 text-gray-400" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 bg-gray-800 overflow-auto">
        {isTemplateLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-emerald-500" />
              <p className="text-gray-300 font-medium">Loading template...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto p-6">
            <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
              {/* Additional toolbar */}
              <div className="bg-gray-900 border-b border-gray-700 p-3 flex justify-between items-center">
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                    <Undo className="h-4 w-4 mr-2" />
                    Undo
                  </Button>
                </div>
                <div className="text-sm text-gray-400">
                  Last edited: {new Date().toLocaleDateString()}
                </div>
              </div>
              
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
          </div>
        )}
      </div>
    </div>
  );
}