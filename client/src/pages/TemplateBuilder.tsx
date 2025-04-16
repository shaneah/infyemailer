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
  Save,
  Settings,
  PenLine,
  Send
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
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [editorSection, setEditorSection] = useState<string>("content");

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
            New Batch Email
          </h1>
        </div>
        
        <Button
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-md"
          disabled={isSaving}
          onClick={() => {
            if (htmlCode) {
              handleSaveTemplate(
                initialTemplate || { name: "New Batch Email", subject: "Important: Your Email Subject Line" },
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

      {/* Main Tabs */}
      <div className="flex flex-col flex-1">
        <div className="border-b border-slate-200 flex bg-white">
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent flex justify-start h-12 px-4 gap-8 border-b border-slate-200">
                <TabsTrigger 
                  value="edit" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  <PenLine className="h-4 w-4 mr-2" />
                  Edit
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent" 
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger 
                  value="send"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent" 
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send or Schedule
                </TabsTrigger>
              </TabsList>
            
              {/* The content goes inside the same Tabs component */}
              <div className="flex-1">
                <TabsContent value="edit" className="mt-0 h-[calc(100vh-112px)]">
                  <div className="flex h-full">
                    {/* Left sidebar with content/design tabs */}
                    <div className="w-48 bg-slate-50 border-r border-slate-200">
                      <div className="py-4">
                        <button 
                          className={`w-full text-left px-6 py-3 font-medium border-l-2 ${editorSection === 'content' ? 'border-primary bg-white text-primary' : 'border-transparent'}`}
                          onClick={() => setEditorSection('content')}
                        >
                          Content
                        </button>
                        <button 
                          className={`w-full text-left px-6 py-3 font-medium border-l-2 ${editorSection === 'design' ? 'border-primary bg-white text-primary' : 'border-transparent'}`}
                          onClick={() => setEditorSection('design')}
                        >
                          Design
                        </button>
                      </div>
                    </div>
                    
                    {/* Middle panel - content tools */}
                    <div className="w-72 border-r border-slate-200 overflow-y-auto">
                      {editorSection === 'content' ? (
                        <div className="p-6">
                          <h2 className="text-xl font-medium mb-4">Add content</h2>
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                              <div className="border border-slate-300 rounded w-12 h-12 flex items-center justify-center mb-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 7H20" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                  <path d="M4 12H20" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                  <path d="M4 17H14" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-slate-700">Text</span>
                            </div>
                            
                            <div className="border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                              <div className="border border-slate-300 rounded w-12 h-12 flex items-center justify-center mb-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="#6B7280" strokeWidth="1.5" />
                                  <path d="M9 12L16 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                  <path d="M15 9L8 9" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                  <path d="M9 15L12 15" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-slate-700">Image</span>
                            </div>
                            
                            <div className="border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                              <div className="border border-slate-300 rounded w-12 h-12 flex items-center justify-center mb-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="4" y="7" width="16" height="10" rx="2" stroke="#6B7280" strokeWidth="1.5" />
                                  <path d="M8 12H16" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-slate-700">Button</span>
                            </div>
                            
                            <div className="border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                              <div className="border border-slate-300 rounded w-12 h-12 flex items-center justify-center mb-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 12H20" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-slate-700">Divider</span>
                            </div>
                            
                            <div className="border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                              <div className="border border-slate-300 rounded w-12 h-12 flex items-center justify-center mb-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="1.5" />
                                  <path d="M17.5 12C17.5 15.0376 15.0376 17.5 12 17.5C8.96243 17.5 6.5 15.0376 6.5 12C6.5 8.96243 8.96243 6.5 12 6.5C15.0376 6.5 17.5 8.96243 17.5 12Z" stroke="#6B7280" strokeWidth="1.5" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-slate-700">Social</span>
                            </div>
                          </div>
                          
                          <h2 className="text-xl font-medium mb-4">Add layouts</h2>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                              <div className="border border-slate-300 rounded w-12 h-12 flex items-center justify-center mb-2">
                                <div className="bg-slate-200 w-8 h-6 rounded"></div>
                              </div>
                              <span className="text-sm font-medium text-slate-700">1 column</span>
                            </div>
                            
                            <div className="border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                              <div className="border border-slate-300 rounded w-12 h-12 flex items-center justify-center mb-2">
                                <div className="flex w-8 justify-between">
                                  <div className="bg-slate-200 w-3.5 h-6 rounded"></div>
                                  <div className="bg-slate-200 w-3.5 h-6 rounded"></div>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-slate-700">2 columns</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6">
                          <h2 className="text-xl font-medium mb-4">Design settings</h2>
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Theme</h3>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                                  <div className="h-16 bg-slate-100 rounded-sm flex items-center justify-center">
                                    <div className="w-3/4 h-4 bg-slate-300 rounded"></div>
                                  </div>
                                  <p className="text-xs mt-2 text-center">Simple</p>
                                </div>
                                <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                                  <div className="h-16 bg-blue-50 rounded-sm flex items-center justify-center">
                                    <div className="w-3/4 h-4 bg-blue-200 rounded"></div>
                                  </div>
                                  <p className="text-xs mt-2 text-center">Modern</p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-2">Colors</h3>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="h-6 w-full bg-sky-500 rounded cursor-pointer"></div>
                                <div className="h-6 w-full bg-emerald-500 rounded cursor-pointer"></div>
                                <div className="h-6 w-full bg-amber-500 rounded cursor-pointer"></div>
                                <div className="h-6 w-full bg-rose-500 rounded cursor-pointer"></div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-2">Fonts</h3>
                              <div className="space-y-2">
                                <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                                  <p className="font-sans">Arial, sans-serif</p>
                                </div>
                                <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                                  <p className="font-serif">Times New Roman, serif</p>
                                </div>
                                <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                                  <p className="font-mono">Courier New, monospace</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Preview Area */}
                    <div className="flex-1 p-6 bg-slate-100 overflow-auto">
                      {isTemplateLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-gray-700 font-medium">Loading template...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-md shadow-md min-h-[600px] mx-auto max-w-[600px]">
                          <EmailEditor 
                            initialTemplate={initialTemplate || {
                              name: "New Batch Email",
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
                </TabsContent>
                
                <TabsContent value="settings" className="p-6 mt-0 h-[calc(100vh-112px)] overflow-auto">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-6">Email Settings</h2>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Email name</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            placeholder="Enter email name" 
                            defaultValue="New Batch Email"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">From name</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            placeholder="Enter from name" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Subject line</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            placeholder="Enter subject line" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Preview text</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            placeholder="Enter preview text" 
                          />
                          <p className="text-xs text-slate-500 mt-1">This text will appear in the inbox preview of most email clients.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="send" className="p-6 mt-0 h-[calc(100vh-112px)] overflow-auto">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-6">Send or Schedule</h2>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Recipients</label>
                          <select className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option>All contacts (245)</option>
                            <option>Newsletter subscribers (120)</option>
                            <option>New customers (75)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="flex items-center">
                            <input type="radio" name="send-type" className="mr-2" defaultChecked />
                            <span>Send now</span>
                          </label>
                        </div>
                        
                        <div>
                          <label className="flex items-center">
                            <input type="radio" name="send-type" className="mr-2" />
                            <span>Schedule for later</span>
                          </label>
                        </div>
                        
                        <Button 
                          className="bg-primary hover:bg-primary/90 text-white mt-4"
                        >
                          Send email to 245 recipients
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-white">
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Send test email
              <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
            >
              Actions
              <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}