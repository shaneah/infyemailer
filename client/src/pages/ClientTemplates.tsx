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
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto">
      {/* Hero section with green gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-xl p-6 sm:p-8 shadow-md border border-green-100">
        <div className="absolute inset-0 bg-grid-primary-500/10 [mask-image:linear-gradient(0deg,#fff2,transparent)] bg-fixed"></div>
        <div className="relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">
                Email Template Library
              </h1>
              <p className="text-slate-700 mt-2 max-w-2xl text-sm sm:text-base">
                Create refreshing email templates that engage your audience and drive exceptional results
              </p>
              <div className="flex mt-4 gap-3 text-sm text-slate-600 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></span>
                  Premium quality
                </div>
                <div className="w-px h-4 bg-green-200"></div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-green-600" />
                  AI-enhanced
                </div>
                <div className="w-px h-4 bg-green-200"></div>
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="h-3 w-3 text-green-600" />
                  Fully customizable
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="shadow-sm gap-2 px-4 border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => setShowImportModal(true)}
              >
                <Import className="h-4 w-4" /> 
                Import
              </Button>
              <Button 
                variant="outline"
                className="shadow-sm gap-2 px-4 border-green-200 text-green-700 hover:bg-green-50"
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
                className="rounded-lg shadow-md gap-2 px-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all border border-green-300"
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-green-50/70 to-emerald-50/70 rounded-xl p-4 border border-green-100 shadow-sm">
          <div className="relative w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search templates..."
              className="w-full border-green-200 focus-visible:ring-green-300 pl-9 bg-white shadow-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 absolute left-3 top-[50%] transform -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs px-3 py-1 h-9 shadow-sm ${activeTab === 'all' ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 text-green-800' : 'bg-white text-slate-600 hover:text-green-700 hover:border-green-200'}`}
              onClick={() => setActiveTab('all')}
            >
              All Templates
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs px-3 py-1 h-9 shadow-sm ${activeTab === 'ai' ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 text-green-800' : 'bg-white text-slate-600 hover:text-green-700 hover:border-green-200'}`}
              onClick={() => setActiveTab('ai')}
            >
              <Sparkles className="h-3 w-3 mr-1 text-green-500" /> 
              AI Generated
            </Button>
            <div className="ml-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`px-2 h-9 ${viewMode === 'grid' ? 'text-green-700' : 'text-slate-400 hover:text-green-600'}`}
                onClick={() => setViewMode('grid')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`px-2 h-9 ${viewMode === 'list' ? 'text-green-700' : 'text-slate-400 hover:text-green-600'}`}
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
        <div className="mb-8 bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search or filters' : 'Create your first template to get started'}
            </p>
            <div className="mt-6">
              <Button 
                className="rounded-lg gap-2 px-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all border border-green-300"
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
                  <Card key={template.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white rounded-xl border border-green-100">
                    <CardHeader className="p-0 overflow-hidden relative">
                      {/* Template Preview Section */}
                      <div className="h-44 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 overflow-hidden relative flex items-center justify-center">
                        {/* Template design preview */}
                        <div className="template-preview-card bg-white rounded-lg shadow-md w-[85%] h-[85%] mx-auto overflow-hidden flex flex-col transform group-hover:scale-105 transition-transform duration-300">
                          {/* Template header */}
                          <div className="template-preview-header h-7 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center px-3">
                            <div className="flex space-x-1.5">
                              <div className="w-2 h-2 rounded-full bg-white opacity-80"></div>
                              <div className="w-2 h-2 rounded-full bg-white opacity-80"></div>
                              <div className="w-2 h-2 rounded-full bg-white opacity-80"></div>
                            </div>
                          </div>
                          
                          {/* Template content mockup */}
                          <div className="flex-1 p-2 flex flex-col">
                            {/* Template title bar */}
                            <div className="h-4 w-3/4 bg-gradient-to-r from-green-300 to-emerald-300 rounded mb-2"></div>
                            
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
                          className="capitalize px-2 py-0.5 text-xs bg-white bg-opacity-90 text-green-700 border-green-200 rounded-md shadow-sm"
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
                            className="shadow-lg opacity-90 hover:opacity-100 bg-gradient-to-r from-green-500 to-emerald-500 border border-green-300 hover:from-green-600 hover:to-emerald-600"
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
                        <div className="absolute top-12 -right-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-10 py-1 font-medium shadow-md transform rotate-45">
                          NEW
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-base text-gray-900 line-clamp-1">{template.name}</h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-green-600 -mt-1 -mr-2">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                              <Eye className="h-4 w-4 mr-2 text-green-600" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                              <Edit className="h-4 w-4 mr-2 text-green-600" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => {
                              setSelectedTemplate(template);
                              setIsTestEmailOpen(true); 
                            }}>
                              <Send className="h-4 w-4 mr-2 text-green-600" />
                              Send Test
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onSelect={() => handleShareTemplate(template.id)}
                            >
                              <Share2 className="h-4 w-4 mr-2 text-green-600" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onSelect={() => setTemplateToDelete(template.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Template description */}
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{template.description}</p>
                      
                      {/* Template actions */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {template.updatedAt ? (
                            <time dateTime={new Date(template.updatedAt).toISOString()}>
                              Updated {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
                            </time>
                          ) : "Recently added"}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsTestEmailOpen(true); 
                            }}
                            title="Send Test Email"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full"
                            onClick={() => handleShareTemplate(template.id)}
                            title="Share Template"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Template
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTemplates.map((template: Template) => (
                        <tr key={template.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                <FileText className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                  {template.metadata?.generatedByAI && (
                                    <Badge className="ml-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-[10px] h-5">
                                      <Sparkles className="h-3 w-3 mr-1" /> AI
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-1 max-w-md">{template.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-green-200 text-green-800 bg-green-50">
                              {template.category || "General"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {template.updatedAt ? 
                              formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true }) : 
                              "Recently added"
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewTemplate(template)}
                              >
                                <Eye className="h-4 w-4 text-gray-500 hover:text-teal-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setIsTestEmailOpen(true);
                                }}
                              >
                                <Send className="h-4 w-4 text-gray-500 hover:text-teal-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Pencil className="h-4 w-4 text-gray-500 hover:text-teal-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleShareTemplate(template.id)}
                              >
                                <Share2 className="h-4 w-4 text-gray-500 hover:text-teal-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">{selectedTemplate.name}</DialogTitle>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setSelectedTemplate(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs px-2 py-0.5 border-green-200 text-green-700 bg-green-50">
                  {selectedTemplate.category || "General"}
                </Badge>
                {selectedTemplate.metadata?.generatedByAI && (
                  <Badge className="bg-gradient-to-r from-indigo-600 to-blue-600 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                {selectedTemplate.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="border rounded-md overflow-hidden mt-2">
              <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Subject:</span>
                  <span className="text-xs text-gray-700">{selectedTemplate.subject}</span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={handleCopyHtmlCode}
                  >
                    <Copy className="h-3 w-3" />
                    Copy HTML
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setIsTestEmailOpen(true);
                    }}
                  >
                    <Send className="h-3 w-3" />
                    Send Test
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleEditTemplate(selectedTemplate)}
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-white">
                <div className="border rounded-md min-h-[400px] overflow-auto p-2">
                  {/* Check if content can be parsed */}
                  {selectedTemplate.content ? (
                    <div className="template-preview-content"
                      dangerouslySetInnerHTML={{ __html: parseTemplateContent(selectedTemplate.content) }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No template content available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Send Test Email Dialog */}
      <Dialog open={isTestEmailOpen} onOpenChange={setIsTestEmailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify how your template looks in an email client
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
                      <Input placeholder="your@email.com" {...field} />
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
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTestEmailOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendTestEmailMutation.isPending}
                  className="gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  {sendTestEmailMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Test Email
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Dialog */}
      <Dialog open={isUpdateTemplateOpen} onOpenChange={setIsUpdateTemplateOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Make changes to your email template
            </DialogDescription>
          </DialogHeader>
          
          <Form {...updateTemplateForm}>
            <form onSubmit={updateTemplateForm.handleSubmit(handleUpdateTemplate)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={updateTemplateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="transactional">Transactional</SelectItem>
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="welcome">Welcome</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={updateTemplateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="resize-none"
                        rows={2}
                        {...field} 
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
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={updateTemplateForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTML Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="font-mono text-xs"
                        rows={15}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUpdateTemplateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateTemplateMutation.isPending}
                  className="gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  {updateTemplateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Share Template Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Template</DialogTitle>
            <DialogDescription>
              Create a shareable link to this template
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Link Expiration</Label>
              <Select 
                defaultValue={shareExpiration} 
                onValueChange={setShareExpiration}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="never">Never expires</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                <Info className="h-3 w-3 inline mr-1" />
                Anyone with the link will be able to view and import this template
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsShareDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={shareTemplateMutation.isPending}
              onClick={handleConfirmShare}
              className="gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
            >
              {shareTemplateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Template Modal */}
      {showImportModal && (
        <ImportTemplateModal 
          open={showImportModal} 
          onOpenChange={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
};

export default ClientTemplates;