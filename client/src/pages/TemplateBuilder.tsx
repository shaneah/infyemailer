import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft, 
  Loader2, 
  Code, 
  Image as ImageIcon, 
  Type, 
  Link as LinkIcon, 
  Save, 
  SeparatorHorizontal, 
  Share2, 
  Menu, 
  Eye,
  Settings,
  FileDown,
  Send,
  FileText,
  X,
  Plus,
  MoveVertical,
  Trash2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Main Template Builder component 
export default function TemplateBuilder() {
  const { toast } = useToast();
  const params = useParams();
  const [location, navigate] = useLocation();
  const entityId = params.id;
  
  // State for template information
  const [templateName, setTemplateName] = useState("New Email Template");
  const [templateSubject, setTemplateSubject] = useState("Your Email Subject");
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for HTML preview and editing
  const [htmlCode, setHtmlCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState("design");
  const [isSaving, setIsSaving] = useState(false);
  
  // State for blocks management
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<'blocks' | 'appearance' | 'content'>('blocks');
  const [activeNavTab, setActiveNavTab] = useState<'visual' | 'code'>('visual');

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
          name: templateData.name || "Untitled Template",
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
    if (!isHtmlCodeVisible) {
      setActiveNavTab('code');
    } else {
      setActiveNavTab('visual');
    }
  };
  
  // Handle drag and drop of content blocks
  const [emailSections, setEmailSections] = useState<any[]>([]);
  
  const handleBlockDrop = (blockType: string) => {
    console.log('Block dropped:', blockType);
    // Add a new section with the dropped block
    const newSection = {
      id: `section-${Date.now()}`,
      type: blockType,
      content: getDefaultContentForType(blockType),
    };
    
    setEmailSections([...emailSections, newSection]);
    toast({
      title: 'Block added',
      description: `Added a new ${blockType} block to your template`,
    });
  };
  
  // Helper function to get default content based on block type
  const getDefaultContentForType = (type: string) => {
    switch (type) {
      case 'text':
        return 'Double-click to edit this text';
      case 'button':
        return 'Click Me';
      case 'image':
        return 'https://via.placeholder.com/600x200?text=Your+Image+Here';
      case 'spacer':
        return { height: '20px' };
      default:
        return 'New content';
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
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
          <h1 className="text-lg font-semibold text-gray-800 mr-6">
            {isEditMode ? 'Edit Template' : 'Create New Template'}
          </h1>
          
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-xs"
              onClick={() => saveTemplateMutation.mutate({ templateData: initialTemplate || {}, htmlContent: htmlCode })}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
              Save
            </Button>
            <Button size="sm" variant="ghost" className="text-xs">
              <Eye className="h-4 w-4 mr-1.5" />
              Preview
            </Button>
            <Button size="sm" variant="ghost" className="text-xs">
              <Send className="h-4 w-4 mr-1.5" />
              Send Test
            </Button>
            <Button size="sm" variant="ghost" className="text-xs">
              <ArrowRightLeft className="h-4 w-4 mr-1.5" />
              Convert
            </Button>
            <Button size="sm" variant="ghost" className="text-xs">
              <FileDown className="h-4 w-4 mr-1.5" />
              Export
            </Button>
          </div>
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
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => saveTemplateMutation.mutate({ templateData: initialTemplate || {}, htmlContent: htmlCode })}
            disabled={isSaving}
            className="bg-[#1a3a5f] hover:bg-[#1a3a5f]/90"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Template
          </Button>
        </div>
      </div>
      
      {/* Main Navigation Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeNavTab === 'visual' ? 'border-b-2 border-[#1a3a5f] text-[#1a3a5f]' : 'text-gray-600'}`}
            onClick={() => setActiveNavTab('visual')}
          >
            Visual Editor
          </button>
          {isHtmlCodeVisible && (
            <button
              className={`px-4 py-2 text-sm font-medium ${activeNavTab === 'code' ? 'border-b-2 border-[#1a3a5f] text-[#1a3a5f]' : 'text-gray-600'}`}
              onClick={() => setActiveNavTab('code')}
            >
              HTML Code
            </button>
          )}
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {activeNavTab === 'visual' && (
          <>
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="border-b border-gray-200">
                <div className="w-full flex rounded-none h-auto">
                  <button 
                    type="button"
                    onClick={() => setActiveSidebar('blocks')}
                    className={`flex-1 rounded-none py-3 focus:outline-none ${activeSidebar === 'blocks' ? 'border-b-2 border-[#1a3a5f] font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Blocks
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSidebar('appearance')}
                    className={`flex-1 rounded-none py-3 focus:outline-none ${activeSidebar === 'appearance' ? 'border-b-2 border-[#1a3a5f] font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Appearance
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSidebar('content')}
                    className={`flex-1 rounded-none py-3 focus:outline-none ${activeSidebar === 'content' ? 'border-b-2 border-[#1a3a5f] font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                  >
                    Content
                  </button>
                </div>
              </div>

              {/* Structures & Blocks */}
              {activeSidebar === 'blocks' && (
                <div className="flex-1 overflow-auto">
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-3">Structures</h3>
                    <StructuresGrid />

                    <h3 className="font-medium text-sm mb-3">Blocks</h3>
                    <BlocksGrid onBlockDrop={handleBlockDrop} />
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeSidebar === 'appearance' && (
                <div className="flex-1 overflow-auto">
                  <div className="p-4 space-y-4">
                    <h3 className="font-medium text-sm mb-3">Template Style</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="font-family" className="text-xs mb-1 block">
                          Font Family
                        </Label>
                        <Input 
                          id="font-family" 
                          defaultValue="Arial, sans-serif" 
                          className="h-8 text-sm" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="background-color" className="text-xs mb-1 block">
                          Background Color
                        </Label>
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded border border-gray-300 bg-gray-100 mr-2"></div>
                          <Input 
                            id="background-color" 
                            defaultValue="#f4f4f4" 
                            className="h-8 text-sm" 
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="text-color" className="text-xs mb-1 block">
                          Text Color
                        </Label>
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded border border-gray-300 bg-gray-800 mr-2"></div>
                          <Input 
                            id="text-color" 
                            defaultValue="#333333" 
                            className="h-8 text-sm" 
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="link-color" className="text-xs mb-1 block">
                          Link Color
                        </Label>
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded border border-gray-300 bg-blue-600 mr-2"></div>
                          <Input 
                            id="link-color" 
                            defaultValue="#1a73e8" 
                            className="h-8 text-sm" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Management */}
              {activeSidebar === 'content' && (
                <div className="flex-1 overflow-auto p-4">
                  <h3 className="font-medium text-sm mb-3">Email Settings</h3>
                  <div className="space-y-3 mb-6">
                    <div>
                      <Label htmlFor="subject" className="text-xs mb-1 block">
                        Subject Line
                      </Label>
                      <Input 
                        id="subject" 
                        placeholder="Enter email subject" 
                        className="h-8 text-sm" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="preheader" className="text-xs mb-1 block">
                        Preheader Text
                      </Label>
                      <Input 
                        id="preheader" 
                        placeholder="Enter preheader text" 
                        className="h-8 text-sm" 
                      />
                    </div>
                  </div>

                  <h3 className="font-medium text-sm mb-3">Dynamic Content</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      Insert personalization variables in your email:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        {"{{firstName}}"}
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        {"{{lastName}}"}
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        {"{{companyName}}"}
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs justify-start">
                        {"{{unsubscribeLink}}"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
              {/* Content Area */}
              <div className="flex-1 overflow-auto p-4">
                {isTemplateLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-gray-500">Loading template...</p>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto max-w-[600px] bg-white rounded shadow-sm p-4 min-h-[600px]">
                    <DroppableArea 
                      onDrop={handleBlockDrop} 
                      placeholder="Click on blocks in the sidebar to add content here"
                    />
                    
                    {/* Display added content */}
                    {emailSections.map((section) => (
                      <div 
                        key={section.id}
                        className="p-3 mb-4 border border-gray-200 rounded relative hover:border-blue-300 group"
                      >
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                            onClick={() => {
                              setEmailSections(emailSections.filter(s => s.id !== section.id));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center mb-2 text-sm font-medium text-gray-700">
                          {section.type === 'text' && <Type className="h-4 w-4 mr-2" />}
                          {section.type === 'image' && <ImageIcon className="h-4 w-4 mr-2" />}
                          {section.type === 'button' && <div className="w-4 h-4 mr-2 flex items-center justify-center text-gray-600">B</div>}
                          {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                        </div>
                        
                        {section.type === 'text' && (
                          <div className="relative p-2 border border-gray-200 rounded">
                            <textarea
                              className="w-full min-h-[100px] p-2 text-sm border border-gray-200 rounded resize-y"
                              placeholder="Enter your text here"
                              defaultValue={section.content}
                              onChange={(e) => {
                                const updatedSections = emailSections.map(s => 
                                  s.id === section.id ? {...s, content: e.target.value} : s
                                );
                                setEmailSections(updatedSections);
                              }}
                            />
                          </div>
                        )}
                        
                        {section.type === 'image' && (
                          <div className="bg-gray-50 p-2 rounded border border-gray-200">
                            <div className="flex flex-col items-center">
                              {section.content && (
                                <img 
                                  src={section.content} 
                                  alt="Template content" 
                                  className="max-w-full h-auto mb-2" 
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                                  }}
                                />
                              )}
                              <div className="w-full mt-2">
                                <Label htmlFor={`image-url-${section.id}`} className="text-xs mb-1">Image URL:</Label>
                                <Input
                                  id={`image-url-${section.id}`}
                                  type="text"
                                  placeholder="https://example.com/image.jpg"
                                  value={section.content || ''}
                                  className="text-sm mb-2"
                                  onChange={(e) => {
                                    const updatedSections = emailSections.map(s => 
                                      s.id === section.id ? {...s, content: e.target.value} : s
                                    );
                                    setEmailSections(updatedSections);
                                  }}
                                />
                                <p className="text-xs text-muted-foreground mb-2">
                                  Enter a URL above or use a sample image:
                                </p>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                  {['https://placehold.co/400x200/D4AF37/ffffff?text=Sample+1', 
                                    'https://placehold.co/400x200/1A3A5F/ffffff?text=Sample+2',
                                    'https://placehold.co/400x200/F5F0E1/000000?text=Sample+3'
                                  ].map((url, idx) => (
                                    <img 
                                      key={idx} 
                                      src={url} 
                                      alt={`Sample ${idx+1}`} 
                                      className="w-full border border-gray-200 cursor-pointer hover:border-blue-400"
                                      onClick={() => {
                                        const updatedSections = emailSections.map(s => 
                                          s.id === section.id ? {...s, content: url} : s
                                        );
                                        setEmailSections(updatedSections);
                                      }} 
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {section.type === 'button' && (
                          <div className="flex flex-col p-2">
                            <div className="flex justify-center mb-3">
                              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                                {section.content}
                              </button>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Label htmlFor={`button-text-${section.id}`} className="text-xs w-24">Button Text:</Label>
                                <Input
                                  id={`button-text-${section.id}`}
                                  type="text"
                                  placeholder="Button Text"
                                  defaultValue={section.content}
                                  className="text-sm h-8"
                                  onChange={(e) => {
                                    const updatedSections = emailSections.map(s => 
                                      s.id === section.id ? {...s, content: e.target.value} : s
                                    );
                                    setEmailSections(updatedSections);
                                  }}
                                />
                              </div>
                              <div className="flex items-center">
                                <Label htmlFor={`button-link-${section.id}`} className="text-xs w-24">Button Link:</Label>
                                <Input
                                  id={`button-link-${section.id}`}
                                  type="text"
                                  placeholder="https://example.com"
                                  defaultValue="#"
                                  className="text-sm h-8"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {section.type === 'spacer' && (
                          <div className="p-2">
                            <div style={{ height: section.content.height }} className="bg-gray-200 w-full"></div>
                            <div className="mt-2">
                              <div className="flex items-center">
                                <Label htmlFor={`spacer-height-${section.id}`} className="text-xs w-24">Height (px):</Label>
                                <Input
                                  id={`spacer-height-${section.id}`}
                                  type="number"
                                  min="1"
                                  max="200"
                                  placeholder="Height in pixels"
                                  defaultValue={section.content.height ? parseInt(section.content.height) : 20}
                                  className="text-sm h-8 w-24"
                                  onChange={(e) => {
                                    const height = `${e.target.value}px`;
                                    const updatedSections = emailSections.map(s => 
                                      s.id === section.id ? {...s, content: { height }} : s
                                    );
                                    setEmailSections(updatedSections);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <DroppableArea 
                      onDrop={handleBlockDrop} 
                      placeholder="Add more content blocks here"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* HTML Code View */}
        {activeNavTab === 'code' && (
          <div className="flex-1 overflow-auto p-4 bg-gray-50">
            <div className="mx-auto container">
              <div className="bg-gray-900 text-gray-200 p-4 rounded-md overflow-auto h-[calc(100vh-140px)]">
                <pre className="text-sm">{htmlCode || '<!-- No HTML code generated yet -->'}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}