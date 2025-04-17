import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import EmailEditor from "@/components/EmailEditor";
import {
  PanelLeftOpen,
  PanelRightOpen,
  PanelTopOpen,
  Layers,
  LayoutPanelLeft,
  AlignLeft,
  Copy,
  FileCode,
  Save,
  Play,
  Download,
  Upload,
  Code,
  Settings,
  Eye,
  Zap,
  RefreshCw,
  HelpCircle,
  Sparkles,
  MessageSquareText,
  FileText
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

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

interface AdvancedTemplateBuilderProps {
  initialTemplate?: Template;
  onSave: (template: Template, html: string) => void;
  isSaving?: boolean;
}

const TEMPLATE_PRESETS = [
  { id: 'blank', name: 'Blank Template', description: 'Start with a clean slate' },
  { id: 'newsletter', name: 'Newsletter', description: 'Perfect for regular updates' },
  { id: 'promotional', name: 'Promotional', description: 'Highlight products or services' },
  { id: 'announcement', name: 'Announcement', description: 'Share important news' },
  { id: 'welcome', name: 'Welcome Email', description: 'Greet new subscribers' },
  { id: 'event', name: 'Event Invitation', description: 'Invite to upcoming events' },
]

const AI_TEMPLATE_IDEAS = [
  "Monthly Company Newsletter",
  "Product Launch Announcement",
  "Special Discount Offer",
  "Welcome Series - First Email",
  "Event Registration Confirmation",
  "Holiday Promotion",
  "Customer Feedback Request",
  "New Feature Announcement",
  "Annual Review Highlights",
  "Educational Content Series"
]

const AdvancedTemplateBuilder: React.FC<AdvancedTemplateBuilderProps> = ({
  initialTemplate,
  onSave,
  isSaving = false,
}) => {
  const { toast } = useToast();
  
  // Template state
  const [activeTemplate, setActiveTemplate] = useState<Template>(
    initialTemplate || {
      name: "New Template",
      subject: "Important: Your Email Subject",
      previewText: "A preview of your email content...",
      sections: [],
      styles: {
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        width: "100%",
        maxWidth: "600px"
      }
    }
  );
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [currentTab, setCurrentTab] = useState('design');
  const [isCodeView, setIsCodeView] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
  // Handle saving of template
  const handleSaveTemplate = (templateData: any, html: string) => {
    setGeneratedHtml(html);
    setActiveTemplate({
      ...activeTemplate,
      ...templateData,
    });
    
    onSave(templateData, html);
  };

  // Function to handle AI template generation (simplified version)
  const generateTemplateWithAI = (prompt: string) => {
    toast({
      title: "AI Assistant",
      description: "Generating template based on your idea... (This is a demo)",
    });
    
    // In a real implementation, this would call an AI service
    setTimeout(() => {
      toast({
        title: "Template Generated",
        description: "Your AI-generated template is ready!",
      });
      
      // Close the dialog
      setShowAiAssistant(false);
    }, 2000);
  };

  // Function to load a template preset
  const loadTemplatePreset = (presetId: string) => {
    // In a real implementation, this would load different template structures
    toast({
      title: "Template Loaded",
      description: `${presetId} template has been loaded.`,
    });
    
    // Close the dialog
    setShowTemplateLibrary(false);
  };

  // Render the header toolbar
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
          >
            <PanelLeftOpen className="h-4 w-4 mr-1" />
            <span className="text-xs">Panels</span>
          </Button>
          
          <Separator orientation="vertical" className="h-6 bg-gray-700" />
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => setShowTemplateLibrary(true)}
          >
            <Layers className="h-4 w-4 mr-1" />
            <span className="text-xs">Templates</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => setShowAiAssistant(true)}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            <span className="text-xs">AI Assist</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => toast({
              title: "Preview",
              description: "Preview functionality will be available soon!"
            })}
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="text-xs">Preview</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => toast({
              title: "Export HTML",
              description: "Export functionality will be available soon!"
            })}
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="text-xs">Export</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              if (generatedHtml) {
                onSave(activeTemplate, generatedHtml);
              } else {
                toast({
                  title: "No Content",
                  description: "Please design your template before saving.",
                  variant: "destructive"
                });
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                <span className="text-xs">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                <span className="text-xs">Save Template</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Render the main tabs
  const renderTabs = () => {
    return (
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex px-4">
          <Tabs 
            defaultValue="design" 
            className="flex-1" 
            value={currentTab}
            onValueChange={setCurrentTab}
          >
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger 
                value="design" 
                className={`px-4 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                  currentTab === 'design' 
                    ? 'border-b-2 border-emerald-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className={`h-4 w-4 mr-2 ${currentTab === 'design' ? 'text-emerald-500' : ''}`} />
                Design Editor
              </TabsTrigger>
              
              <TabsTrigger 
                value="code" 
                className={`px-4 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                  currentTab === 'code' 
                    ? 'border-b-2 border-emerald-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code className={`h-4 w-4 mr-2 ${currentTab === 'code' ? 'text-emerald-500' : ''}`} />
                HTML Code
              </TabsTrigger>
              
              <TabsTrigger 
                value="settings" 
                className={`px-4 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                  currentTab === 'settings' 
                    ? 'border-b-2 border-emerald-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Settings className={`h-4 w-4 mr-2 ${currentTab === 'settings' ? 'text-emerald-500' : ''}`} />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center">
            <div className="flex items-center border-l border-gray-700 pl-4">
              <div className="flex items-center mr-4">
                <Switch
                  id="mobile-preview"
                  checked={isMobilePreview}
                  onCheckedChange={setIsMobilePreview}
                  className="mr-2"
                />
                <Label htmlFor="mobile-preview" className="text-sm text-gray-300">
                  Mobile Preview
                </Label>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className="text-gray-300 hover:text-white"
              >
                <PanelRightOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the left sidebar with template components
  const renderLeftSidebar = () => {
    if (!showLeftSidebar) return null;
    
    return (
      <div className="w-64 bg-gray-900 border-r border-gray-700 overflow-y-auto flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Template Details</h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="template-name" className="text-xs text-gray-400">
                Template Name
              </Label>
              <Input
                id="template-name"
                value={activeTemplate.name}
                onChange={(e) => setActiveTemplate({...activeTemplate, name: e.target.value})}
                className="h-8 text-sm bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="template-subject" className="text-xs text-gray-400">
                Email Subject
              </Label>
              <Input
                id="template-subject"
                value={activeTemplate.subject}
                onChange={(e) => setActiveTemplate({...activeTemplate, subject: e.target.value})}
                className="h-8 text-sm bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="template-preview" className="text-xs text-gray-400">
                Preview Text
              </Label>
              <Textarea
                id="template-preview"
                value={activeTemplate.previewText || ''}
                onChange={(e) => setActiveTemplate({...activeTemplate, previewText: e.target.value})}
                className="h-16 text-sm resize-none bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Design Elements</h3>
          <p className="text-xs text-gray-400 mb-3">
            Drag and drop elements into your template.
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {currentTab === 'design' && (
              <>
                <Button variant="outline" size="sm" className="justify-start text-xs border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
                  <LayoutPanelLeft className="h-3.5 w-3.5 mr-2" />
                  Header
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-xs border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
                  <AlignLeft className="h-3.5 w-3.5 mr-2" />
                  Text
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-xs border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Upload className="h-3.5 w-3.5 mr-2" />
                  Image
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-xs border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Play className="h-3.5 w-3.5 mr-2" />
                  Button
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-xs border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Social
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-xs border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Spacer
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Smart Components</h3>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-xs bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              <MessageSquareText className="h-3.5 w-3.5 mr-2" />
              Testimonial Block
            </Button>
            <Button variant="outline" className="w-full justify-start text-xs bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              <FileText className="h-3.5 w-3.5 mr-2" />
              Feature Grid
            </Button>
            <Button variant="outline" className="w-full justify-start text-xs bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              <HelpCircle className="h-3.5 w-3.5 mr-2" />
              FAQ Section
            </Button>
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-xs text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => toast({
              title: "Help",
              description: "Help documentation will be available soon!"
            })}
          >
            <HelpCircle className="h-3.5 w-3.5 mr-2" />
            Template Builder Help
          </Button>
        </div>
      </div>
    );
  };

  // Render the email editor content
  const renderContent = () => {
    if (currentTab === 'code') {
      return (
        <div className="flex-1 bg-gray-900 text-gray-200 overflow-auto p-4">
          <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-200">HTML Code View</h3>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                onClick={() => toast({
                  title: "Copy HTML",
                  description: "HTML code copied to clipboard!"
                })}
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy HTML
              </Button>
            </div>
            <Textarea
              className="h-[calc(100vh-300px)] bg-gray-900 border-gray-700 text-gray-100 font-mono text-sm"
              placeholder="HTML code will appear here after designing your template."
              value={generatedHtml || '<div><!-- Design your template to generate HTML --></div>'}
              readOnly
            />
          </div>
        </div>
      );
    } else if (currentTab === 'settings') {
      return (
        <div className="flex-1 bg-gray-900 text-gray-200 overflow-auto p-4">
          <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-md border border-gray-700">
            <h2 className="text-lg font-medium text-gray-100 mb-4">Template Settings</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">General Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="font-family" className="text-xs text-gray-400">
                      Font Family
                    </Label>
                    <Select defaultValue={activeTemplate.styles?.fontFamily || "Arial, sans-serif"}>
                      <SelectTrigger className="h-8 text-sm bg-gray-800 border-gray-700 text-gray-100">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="Tahoma, sans-serif">Tahoma</SelectItem>
                        <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="bg-color" className="text-xs text-gray-400">
                      Background Color
                    </Label>
                    <Input
                      id="bg-color"
                      type="color"
                      value={activeTemplate.styles?.backgroundColor || '#f5f5f5'}
                      onChange={(e) => setActiveTemplate({
                        ...activeTemplate,
                        styles: {...activeTemplate.styles, backgroundColor: e.target.value}
                      })}
                      className="h-8 w-full text-sm bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Responsive Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="max-width" className="text-xs text-gray-400">
                      Max Width
                    </Label>
                    <Input
                      id="max-width"
                      value={activeTemplate.styles?.maxWidth || '600px'}
                      onChange={(e) => setActiveTemplate({
                        ...activeTemplate,
                        styles: {...activeTemplate.styles, maxWidth: e.target.value}
                      })}
                      className="h-8 text-sm bg-gray-800 border-gray-700 text-gray-100"
                    />
                  </div>
                  
                  <div className="space-y-1 flex items-center">
                    <div className="space-x-2 flex items-center mt-5">
                      <Switch id="responsive" defaultChecked={true} />
                      <Label htmlFor="responsive" className="text-sm text-gray-300">
                        Responsive Design
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Advanced Options</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="inline-css" defaultChecked={true} />
                    <Label htmlFor="inline-css" className="text-sm text-gray-300">
                      Use Inline CSS (Recommended)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="tracking-pixels" defaultChecked={true} />
                    <Label htmlFor="tracking-pixels" className="text-sm text-gray-300">
                      Add Tracking Pixels
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="dark-mode" defaultChecked={false} />
                    <Label htmlFor="dark-mode" className="text-sm text-gray-300">
                      Support Dark Mode
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <Button 
                  variant="default" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    toast({
                      title: "Settings Saved",
                      description: "Your template settings have been updated."
                    });
                    setCurrentTab('design');
                  }}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Design tab (default)
    return (
      <div className={`flex-1 bg-gray-800 overflow-auto ${isMobilePreview ? 'flex justify-center' : ''}`}>
        <div className={isMobilePreview ? 'w-[375px] mt-6 shadow-xl rounded-md overflow-hidden' : 'w-full'}>
          <EmailEditor
            initialTemplate={activeTemplate}
            onSave={handleSaveTemplate}
            isSaving={isSaving}
            className="bg-white min-h-[500px]"
          />
        </div>
      </div>
    );
  };

  // Render the right sidebar with properties
  const renderRightSidebar = () => {
    if (!showRightSidebar) return null;
    
    return (
      <div className="w-64 bg-gray-900 border-l border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-200 mb-3">Properties</h3>
          <p className="text-xs text-gray-400 mb-4">
            Select an element to edit its properties.
          </p>
          
          <div className="border border-gray-700 rounded-md p-3 bg-gray-800">
            <p className="text-sm text-gray-400 text-center">
              Select an element in the template to edit its properties
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-200 mb-3">Template Library</h3>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white mb-2"
            onClick={() => setShowTemplateLibrary(true)}
          >
            <Layers className="h-3.5 w-3.5 mr-2" />
            Browse Templates
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={() => setShowAiAssistant(true)}
          >
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            AI Template Assistant
          </Button>
        </div>
      </div>
    );
  };

  // Template Library Dialog
  const renderTemplateLibraryDialog = () => {
    return (
      <Dialog open={showTemplateLibrary} onOpenChange={setShowTemplateLibrary}>
        <DialogContent className="max-w-2xl bg-gray-900 text-gray-100 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Template Library</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {TEMPLATE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="bg-gray-800 border border-gray-700 rounded-md p-4 hover:border-emerald-500 cursor-pointer transition-all"
                onClick={() => loadTemplatePreset(preset.id)}
              >
                <h3 className="text-gray-200 font-medium mb-1">{preset.name}</h3>
                <p className="text-gray-400 text-sm">{preset.description}</p>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => setShowTemplateLibrary(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // AI Assistant Dialog
  const renderAiAssistantDialog = () => {
    const [aiPrompt, setAiPrompt] = useState('');
    const [selectedIdea, setSelectedIdea] = useState('');
    
    return (
      <Dialog open={showAiAssistant} onOpenChange={setShowAiAssistant}>
        <DialogContent className="max-w-2xl bg-gray-900 text-gray-100 border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">AI Template Assistant</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="ai-prompt" className="text-gray-300 mb-2 block">
              Describe the email template you want to create
            </Label>
            <Textarea
              id="ai-prompt"
              placeholder="E.g., Create a monthly newsletter template with a header, featured article section, and product showcase..."
              className="bg-gray-800 border-gray-700 text-gray-100 mb-4"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            
            <div className="mb-4">
              <Label className="text-gray-300 mb-2 block">
                Or choose from template ideas:
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {AI_TEMPLATE_IDEAS.map((idea) => (
                  <Button
                    key={idea}
                    variant="outline"
                    className={`justify-start text-xs border-gray-700 ${selectedIdea === idea ? 'bg-emerald-900 border-emerald-700 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    onClick={() => {
                      setSelectedIdea(idea);
                      setAiPrompt(idea);
                    }}
                  >
                    {idea}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => setShowAiAssistant(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => generateTemplateWithAI(aiPrompt)}
              disabled={!aiPrompt.trim()}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header Toolbar */}
      {renderHeader()}
      
      {/* Tabs */}
      {renderTabs()}
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar with toolbox */}
        {renderLeftSidebar()}
        
        {/* Center content area */}
        {renderContent()}
        
        {/* Right sidebar with properties */}
        {renderRightSidebar()}
      </div>
      
      {/* Template Library Dialog */}
      {renderTemplateLibraryDialog()}
      
      {/* AI Assistant Dialog */}
      {renderAiAssistantDialog()}
    </div>
  );
};

export default AdvancedTemplateBuilder;