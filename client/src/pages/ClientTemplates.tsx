import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import ClientHeader from "@/components/ClientHeader";
import { 
  Code,
  Loader2, 
  MoveRight, 
  FileText, 
  PlusCircle, 
  Copy, 
  Sparkles,
  Wand2,
  ChevronDown,
  Eye,
  Upload,
  Import,
  Send,
  Pencil,
  Mail,
  Trash2,
  ExternalLink,
  X,
  XCircle,
  MoreVertical,
  Calendar,
  MoreHorizontal,
  Share2,
  Link2,
  Info,
  Check,
  Edit
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedTemplateGenerator from "@/components/AdvancedTemplateGenerator";
import ImportTemplateModal from "@/components/ImportTemplateModal";
import CreateTemplateDialog from "@/components/CreateTemplateDialog";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  subject: string;
  category: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  metadata?: {
    generatedByAI?: boolean;
    icon?: string;
    iconColor?: string;
    new?: boolean;
    [key: string]: any;
  };
}

// Email test form schema
const testEmailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
  personalizeContent: z.boolean().optional().default(false),
});

// Template update form schema
const updateTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().min(1, "Description is required"),
  subject: z.string().min(1, "Subject line is required"),
  content: z.string().min(1, "HTML content is required"),
  category: z.string().default("general"),
});

const ClientTemplates = ({ onCreateTemplate }: { onCreateTemplate: () => void }) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);
  const [isUpdateTemplateOpen, setIsUpdateTemplateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [templateToShare, setTemplateToShare] = useState<number | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [shareExpiration, setShareExpiration] = useState("7"); // Default to 7 days
  
  const { data: savedTemplates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    }
  });
  
  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };
  
  const parseTemplateContent = (content: string): string => {
    if (!content) return "";
    
    // Check if it's already HTML content (starts with '<' and ends with '>')
    if (content.trim().startsWith('<') && content.trim().endsWith('>')) {
      return content;
    }
    
    try {
      // Try to parse as JSON first
      const templateData = JSON.parse(content);
      
      // Handle various template formats
      if (templateData.metadata?.originalHtml) {
        return templateData.metadata.originalHtml;
      } else if (templateData.sections) {
        // Process sections with HTML elements
        let html = '<div class="template-container">';
        templateData.sections.forEach((section: any) => {
          if (section.elements) {
            html += '<div class="template-section">';
            section.elements.forEach((element: any) => {
              if (element.type === 'html' && element.content?.html) {
                html += element.content.html;
              } else if (element.type === 'text' && element.content?.text) {
                html += `<div style="font-size: ${element.styles?.fontSize || '16px'}; color: ${element.styles?.color || '#000000'}; text-align: ${element.styles?.textAlign || 'left'};">${element.content.text}</div>`;
              } else if (element.type === 'image' && element.content?.src) {
                html += `<div style="text-align: center;"><img src="${element.content.src}" alt="${element.content.alt || ''}" style="max-width: 100%; height: auto;" /></div>`;
              } else if (element.type === 'button' && element.content?.text) {
                html += `<div style="text-align: center; margin: 10px 0;"><a href="${element.content.href || '#'}" style="display: inline-block; padding: 10px 20px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 4px;">${element.content.text}</a></div>`;
              }
            });
            html += '</div>';
          }
        });
        html += '</div>';
        return html || content; // Return the constructed HTML or the original content if empty
      } else if (typeof templateData.html === 'string') {
        // Some templates might have HTML directly in the JSON
        return templateData.html;
      } else if (typeof templateData.content === 'string') {
        // Some templates might have content field directly in the JSON
        return templateData.content;
      } else if (templateData.body && typeof templateData.body === 'string') {
        // Another common template format
        return templateData.body;
      } else if (templateData.template && typeof templateData.template === 'string') {
        // Another common template format
        return templateData.template;
      }
      
      // If we couldn't extract HTML from JSON, return a formatted display of the JSON
      return `<div class="template-json-preview">
        <div style="padding: 20px; background-color: #f7f7f7; border-radius: 6px; text-align: center;">
          <p style="margin: 0; font-style: italic; color: #555;">Template preview available when edited</p>
        </div>
      </div>`;
    } catch (e) {
      // If parsing as JSON fails, assume it's already HTML
      return content;
    }
  };
  
  // Function to handle edit template action - redirects to client template builder
  const [, navigate] = useLocation();
  
  const handleEditTemplate = (template: Template) => {
    navigate(`/client-template-builder/${template.id}`);
  };
  
  const handleCopyHtmlCode = () => {
    if (selectedTemplate?.content) {
      // If it's a JSON template, parse it to get the actual HTML
      const htmlContent = parseTemplateContent(selectedTemplate.content);
      navigator.clipboard.writeText(htmlContent);
      toast({
        title: "Copied",
        description: "HTML code copied to clipboard",
        variant: "default",
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTemplateGenerated = (template: Template) => {
    toast({
      title: "Template Created",
      description: "Your AI template has been generated and saved to the library",
      variant: "default",
    });
    setSelectedTemplate(template);
  };
  
  const handleImportSuccess = (template: Template) => {
    toast({
      title: "Template Imported",
      description: "Your template has been successfully imported",
      variant: "default",
    });
    setSelectedTemplate(template);
  };

  // Initialize forms
  const testEmailForm = useForm<z.infer<typeof testEmailSchema>>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      email: "",
      subject: selectedTemplate ? selectedTemplate.subject : "",
      personalizeContent: false
    }
  });
  
  const updateTemplateForm = useForm<z.infer<typeof updateTemplateSchema>>({
    resolver: zodResolver(updateTemplateSchema),
    defaultValues: {
      name: selectedTemplate ? selectedTemplate.name : "",
      description: selectedTemplate ? selectedTemplate.description : "",
      subject: selectedTemplate ? selectedTemplate.subject : "",
      content: selectedTemplate ? selectedTemplate.content : "",
      category: selectedTemplate?.category || "general"
    }
  });

  // Set form values when selected template changes
  React.useEffect(() => {
    if (selectedTemplate) {
      updateTemplateForm.reset({
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        subject: selectedTemplate.subject,
        content: selectedTemplate.content,
        category: selectedTemplate.category || "general"
      });
      
      testEmailForm.reset({
        email: "",
        subject: selectedTemplate.subject,
        personalizeContent: false
      });
    }
  }, [selectedTemplate, updateTemplateForm, testEmailForm]);

  // Template mutations
  const sendTestEmailMutation = useMutation({
    mutationFn: async (data: z.infer<typeof testEmailSchema>) => {
      if (!selectedTemplate) throw new Error("No template selected");
      const response = await apiRequest("POST", `/api/templates/${selectedTemplate.id}/test-email`, data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Your test email has been sent successfully",
        variant: "default",
      });
      setIsTestEmailOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send test email: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateTemplateSchema>) => {
      if (!selectedTemplate) throw new Error("No template selected");
      const response = await apiRequest("PATCH", `/api/templates/${selectedTemplate.id}`, data);
      return response.json();
    },
    onSuccess: (updatedTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template Updated",
        description: "Your template has been updated successfully",
        variant: "default",
      });
      setIsUpdateTemplateOpen(false);
      setSelectedTemplate(updatedTemplate);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update template: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Share template mutation
  const shareTemplateMutation = useMutation({
    mutationFn: async ({ templateId, expiresIn }: { templateId: number, expiresIn: string }) => {
      const response = await apiRequest("POST", `/api/templates/${templateId}/share`, { expiresIn });
      return response.json();
    },
    onSuccess: (data) => {
      // Copy the share URL to clipboard
      navigator.clipboard.writeText(data.shareUrl);
      
      const expiryText = data.expiresIn === "never" 
        ? "The link never expires." 
        : `The link expires in ${data.expiresIn} days.`;
      
      toast({
        title: "Template Shared",
        description: `Share link copied to clipboard. ${expiryText}`,
        variant: "default",
      });
      setIsShareDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to share template: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      return apiRequest("DELETE", `/api/templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template Deleted",
        description: "The template has been deleted successfully",
        variant: "default",
      });
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete template: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handler functions
  const handleShareTemplate = (templateId: number) => {
    setTemplateToShare(templateId);
    setIsShareDialogOpen(true);
  };
  
  const handleConfirmShare = () => {
    if (templateToShare) {
      shareTemplateMutation.mutate({ 
        templateId: templateToShare, 
        expiresIn: shareExpiration 
      });
    }
  };
  
  const handleSendTestEmail = (data: z.infer<typeof testEmailSchema>) => {
    sendTestEmailMutation.mutate(data);
  };

  const handleUpdateTemplate = (data: z.infer<typeof updateTemplateSchema>) => {
    updateTemplateMutation.mutate(data);
  };
  
  const handleDeleteTemplate = () => {
    if (templateToDelete) {
      deleteTemplateMutation.mutate(templateToDelete);
    }
  };

  // Get client user info from session storage
  const getClientUser = () => {
    const sessionUser = sessionStorage.getItem('clientUser');
    
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch (error) {
        console.error('Error parsing client user', error);
        return null;
      }
    }
    
    return null;
  };

  const clientUser = getClientUser();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter templates based on search query and selected category
  const filteredTemplates = savedTemplates.filter((template: Template) => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeTab === "all" || 
      (template.metadata?.generatedByAI && activeTab === "ai");
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ClientHeader 
        title="Templates"
        subtitle="Manage your email templates"
        userName={clientUser?.name || 'User'}
        companyName={clientUser?.clientCompany || 'Acme Corporation'}
        onSidebarOpen={() => setSidebarOpen(true)}
      />
      
      <div className="space-y-8 p-6 max-w-[1600px] mx-auto">
        {/* Hero section with blue/gold gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-xl p-6 sm:p-8 shadow-md border border-blue-100">
          <div className="absolute inset-0 bg-grid-primary-500/10 [mask-image:linear-gradient(0deg,#fff2,transparent)] bg-fixed"></div>
          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-slate-700 mt-2 max-w-2xl text-sm sm:text-base">
                  Create professional email templates that engage your audience and drive exceptional results
                </p>
                <div className="flex mt-4 gap-3 text-sm text-slate-600 items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-amber-400"></span>
                    Premium quality
                  </div>
                  <div className="w-px h-4 bg-blue-200"></div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    AI-enhanced
                  </div>
                  <div className="w-px h-4 bg-blue-200"></div>
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="h-3 w-3 text-blue-600" />
                    Fully customizable
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="shadow-sm gap-2 px-4 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => setShowImportModal(true)}
                >
                  <Import className="h-4 w-4" /> 
                  Import
                </Button>
                <Button 
                  variant="outline"
                  className="shadow-sm gap-2 px-4 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => setShowAIGenerator(!showAIGenerator)}
                >
                  {showAIGenerator ? (
                    <>
                      <XCircle className="h-4 w-4" />
                      Hide AI Generator
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" /> 
                      AI Template Generator
                    </>
                  )}
                </Button>
                <Button 
                  className="rounded-lg shadow-md gap-2 px-5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white transition-all border border-blue-300"
                  onClick={onCreateTemplate}
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> 
                  Create Template
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and action tools */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl p-4 border border-blue-100 shadow-sm">
            <div className="relative w-full sm:w-64">
              <Input
                type="search"
                placeholder="Search templates..."
                className="w-full border-blue-200 focus-visible:ring-blue-300 pl-9 bg-white shadow-sm"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 absolute left-3 top-[50%] transform -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs px-3 py-1 h-9 shadow-sm ${activeTab === 'all' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200 text-blue-800' : 'bg-white text-slate-600 hover:text-blue-700 hover:border-blue-200'}`}
                onClick={() => setActiveTab('all')}
              >
                All Templates
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs px-3 py-1 h-9 shadow-sm ${activeTab === 'ai' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200 text-blue-800' : 'bg-white text-slate-600 hover:text-blue-700 hover:border-blue-200'}`}
                onClick={() => setActiveTab('ai')}
              >
                <Sparkles className="h-3 w-3 mr-1 text-amber-500" /> 
                AI Generated
              </Button>
              <div className="ml-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`px-2 h-9 ${viewMode === 'grid' ? 'text-blue-700' : 'text-slate-400 hover:text-blue-600'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`px-2 h-9 ${viewMode === 'list' ? 'text-blue-700' : 'text-slate-400 hover:text-blue-600'}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Template Generator */}
        {showAIGenerator && (
          <div className="mb-8 bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
            <AdvancedTemplateGenerator 
              onTemplateGenerated={handleTemplateGenerated}
            />
          </div>
        )}
        
        {/* Templates Grid/List View */}
        <div className="relative min-h-[200px]">
          {isLoadingTemplates && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="mt-2 text-sm">Loading templates...</span>
              </div>
            </div>
          )}
          
          {!isLoadingTemplates && filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-300" />

              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try adjusting your search or filters' : 'Create your first template to get started'}
              </p>
              <div className="mt-6">
                <Button 
                  className="rounded-lg gap-2 px-5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white transition-all border border-blue-300"
                  onClick={onCreateTemplate}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </div>
          )}
          
          {!isLoadingTemplates && filteredTemplates.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredTemplates.map((template: Template) => (
                    <Card key={template.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white rounded-xl border border-blue-100">
                      <CardHeader className="p-0 overflow-hidden relative">
                        {/* Template Preview Section */}
                        <div className="h-44 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 overflow-hidden relative flex items-center justify-center">
                          {/* Template design preview */}
                          <div className="template-preview-card bg-white rounded-lg shadow-md w-[85%] h-[85%] mx-auto overflow-hidden flex flex-col transform group-hover:scale-105 transition-transform duration-300">
                            {/* Template header */}
                            <div className="template-preview-header h-7 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center px-3">
                              <div className="flex space-x-1.5">
                                <div className="w-2 h-2 rounded-full bg-white opacity-80"></div>
                                <div className="w-2 h-2 rounded-full bg-white opacity-80"></div>
                                <div className="w-2 h-2 rounded-full bg-white opacity-80"></div>
                              </div>
                            </div>
                            
                            {/* Template content mockup */}
                            <div className="flex-1 p-2 flex flex-col">
                              {/* Template title bar */}
                              <div className="h-4 w-3/4 bg-gradient-to-r from-blue-300 to-indigo-300 rounded mb-2"></div>
                              
                              {/* Template content lines */}
                              <div className="space-y-1.5 mb-auto">
                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
                                <div className="h-2 w-4/6 bg-gray-100 rounded"></div>
                              </div>
                              
                              {/* Template footer */}
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <div className="h-3 w-2/3 bg-gray-100 rounded mx-auto"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Template badges */}
                        <div className="absolute top-0 left-0 w-full flex justify-between p-2.5">
                          <Badge 
                            variant="outline" 
                            className="capitalize px-2 py-0.5 text-xs bg-white bg-opacity-90 text-blue-700 border-blue-200 rounded-md shadow-sm"
                          >
                            {template.category || "general"}
                          </Badge>
                          
                          {template.metadata?.generatedByAI && (
                            <Badge 
                              className="capitalize px-2 py-0.5 text-xs rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0 shadow-sm flex items-center gap-1"
                            >
                              <Sparkles className="h-3 w-3" /> AI
                            </Badge>
                          )}
                        </div>
                        
                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 backdrop-blur-[1px] transition-all duration-300 flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              className="shadow-lg opacity-90 hover:opacity-100 bg-gradient-to-r from-blue-600 to-blue-800 border border-blue-300 hover:from-blue-700 hover:to-blue-900"
                              onClick={() => handleViewTemplate(template)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              className="shadow-lg opacity-90 hover:opacity-100 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        {/* NEW badge */}
                        {template.metadata?.new && (
                          <div className="absolute top-12 -right-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs px-10 py-1 font-medium shadow-md transform rotate-45">
                            NEW
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium text-base text-gray-900 line-clamp-1">{template.name}</div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 -mt-1 -mr-2">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                                <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                <Edit className="h-4 w-4 mr-2 text-blue-600" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => {
                                setSelectedTemplate(template);
                                setIsTestEmailOpen(true); 
                              }}>
                                <Send className="h-4 w-4 mr-2 text-blue-600" />
                                Send Test
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleShareTemplate(template.id)}>
                                <Share2 className="h-4 w-4 mr-2 text-blue-600" />
                                Share Template
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onSelect={() => {
                                  setSelectedTemplate(template);
                                  setIsUpdateTemplateOpen(true);
                                }}
                                className="text-blue-600"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onSelect={() => setTemplateToDelete(template.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 h-10">{template.description}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {template.updatedAt ? 
                              formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true }) : 
                              'Just added'
                            }
                          </div>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto text-blue-600 hover:text-blue-800"
                            onClick={() => handleViewTemplate(template)}
                          >
                            Preview <MoveRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTemplates.map((template: Template) => (
                        <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 flex items-center justify-center border border-blue-100">
                                <Mail className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                <div className="text-sm text-gray-500 line-clamp-1 max-w-md">{template.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="outline" 
                              className="capitalize px-2 py-0.5 text-xs bg-white text-blue-700 border-blue-200 rounded-md shadow-sm"
                            >
                              {template.category || "general"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {template.updatedAt ? 
                              formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true }) : 
                              'Just added'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {template.metadata?.generatedByAI ? (
                              <Badge 
                                className="capitalize px-2 py-0.5 text-xs rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0 shadow-sm flex items-center gap-1"
                              >
                                <Sparkles className="h-3 w-3" /> AI Generated
                              </Badge>
                            ) : (
                              <Badge 
                                variant="outline" 
                                className="px-2 py-0.5 text-xs bg-white text-gray-600 border-gray-200 rounded-md"
                              >
                                Standard
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 h-8"
                                onClick={() => handleViewTemplate(template)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 h-8"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-2 h-8"
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setIsTestEmailOpen(true); 
                                }}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 h-8"
                                onClick={() => setTemplateToDelete(template.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Template Modal - when a template is selected */}
        <Dialog open={selectedTemplate !== null} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {selectedTemplate?.name}
                {selectedTemplate?.metadata?.generatedByAI && (
                  <Badge className="ml-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0 shadow-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI Generated
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedTemplate?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col md:flex-row gap-4 overflow-hidden flex-1">
              <div className="flex-1 overflow-y-auto border rounded-lg p-1">
                <iframe
                  srcDoc={selectedTemplate ? parseTemplateContent(selectedTemplate.content) : ''}
                  className="w-full h-full min-h-[400px] border-0"
                  title="Template Preview"
                />
              </div>
              
              <div className="w-full md:w-64 flex flex-col space-y-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Template Details</h3>
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{selectedTemplate?.category || "General"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-gray-200">
                      <span className="text-gray-500">Subject:</span>
                      <span className="font-medium truncate max-w-[120px]">{selectedTemplate?.subject || "No subject"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-gray-200">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{selectedTemplate?.createdAt 
                        ? new Date(selectedTemplate.createdAt).toLocaleDateString() 
                        : "Recently"
                      }</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">Actions</h3>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      className="justify-start text-blue-700 border-blue-200 hover:bg-blue-50"
                      onClick={() => handleEditTemplate(selectedTemplate!)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Template
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start text-blue-700 border-blue-200 hover:bg-blue-50"
                      onClick={() => {
                        setIsTestEmailOpen(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start text-blue-700 border-blue-200 hover:bg-blue-50"
                      onClick={handleCopyHtmlCode}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy HTML Code
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start text-blue-700 border-blue-200 hover:bg-blue-50"
                      onClick={() => handleShareTemplate(selectedTemplate!.id)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Template
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start text-blue-700 border-blue-200 hover:bg-blue-50"
                      onClick={() => {
                        setIsUpdateTemplateOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        setSelectedTemplate(null);
                        setTemplateToDelete(selectedTemplate!.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Send Test Email Dialog */}
        <Dialog open={isTestEmailOpen} onOpenChange={setIsTestEmailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Test Email</DialogTitle>
              <DialogDescription>
                Send a test email to verify the template appearance before using it in a campaign.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...testEmailForm}>
              <form onSubmit={testEmailForm.handleSubmit(handleSendTestEmail)} className="space-y-4">
                <FormField
                  control={testEmailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          {...field} 
                          className="border-blue-200 focus-visible:ring-blue-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={testEmailForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Test Email Subject" 
                          {...field} 
                          className="border-blue-200 focus-visible:ring-blue-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={testEmailForm.control}
                  name="personalizeContent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-blue-200 p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="accent-blue-600 h-4 w-4 mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Personalize Content</FormLabel>
                        <FormDescription className="text-xs">
                          Replace placeholder tags with test data
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="sm:justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsTestEmailOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                    disabled={sendTestEmailMutation.isPending}
                  >
                    {sendTestEmailMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Update Template Details Dialog */}
        <Dialog open={isUpdateTemplateOpen} onOpenChange={setIsUpdateTemplateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Template Details</DialogTitle>
              <DialogDescription>
                Update the details of your email template
              </DialogDescription>
            </DialogHeader>
            
            <Form {...updateTemplateForm}>
              <form onSubmit={updateTemplateForm.handleSubmit(handleUpdateTemplate)} className="space-y-4">
                <FormField
                  control={updateTemplateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="My Newsletter Template" 
                          {...field} 
                          className="border-blue-200 focus-visible:ring-blue-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={updateTemplateForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A brief description of the template" 
                          {...field} 
                          className="border-blue-200 focus-visible:ring-blue-300 min-h-20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={updateTemplateForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Email Subject</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Email Subject Line" 
                          {...field} 
                          className="border-blue-200 focus-visible:ring-blue-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={updateTemplateForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-blue-200 focus-visible:ring-blue-300">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="event">Event Invitation</SelectItem>
                          <SelectItem value="welcome">Welcome Email</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="sm:justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpdateTemplateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                    disabled={updateTemplateMutation.isPending}
                  >
                    {updateTemplateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Share Template Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Template</DialogTitle>
              <DialogDescription>
                Create a shareable link for this template
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiration">Link Expiration</Label>
                <Select value={shareExpiration} onValueChange={setShareExpiration}>
                  <SelectTrigger className="w-full border-blue-200 focus-visible:ring-blue-300">
                    <SelectValue placeholder="Select expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="never">Never expires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                <Info className="h-4 w-4 inline-block mr-2" />
                The recipient will be able to import this template into their own account.
              </div>
            </div>
            
            <DialogFooter className="sm:justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsShareDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                onClick={handleConfirmShare}
                disabled={shareTemplateMutation.isPending}
              >
                {shareTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Link...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Create Share Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Import Template Modal */}
        {showImportModal && (
          <ImportTemplateModal 
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImportSuccess={handleImportSuccess}
          />
        )}
        
        {/* Delete Template Confirmation */}
        <Dialog open={templateToDelete !== null} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Template</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this template? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center p-4 border border-red-100 bg-red-50 rounded-md">
              <div className="mr-4 bg-red-100 rounded-full p-2">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-red-900">Warning: Permanent Action</h4>
                <p className="text-sm text-gray-500">This will remove the template from your library</p>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTemplateToDelete(null)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDeleteTemplate}
                disabled={deleteTemplateMutation.isPending}
              >
                {deleteTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>Delete Template</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ClientTemplates;