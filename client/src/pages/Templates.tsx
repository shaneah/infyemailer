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
  Check
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

export default function Templates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);
  const [isUpdateTemplateOpen, setIsUpdateTemplateOpen] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [templateToShare, setTemplateToShare] = useState<number | null>(null);
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
  
  const handleCopyHtmlCode = () => {
    if (selectedTemplate?.content) {
      navigator.clipboard.writeText(selectedTemplate.content);
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

  const createNewTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateTemplateSchema>) => {
      const response = await apiRequest("POST", "/api/templates", data);
      return response.json();
    },
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template Created",
        description: "Your template has been created successfully",
        variant: "default",
      });
      setIsCreatingTemplate(false);
      setSelectedTemplate(newTemplate);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create template: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await apiRequest("DELETE", `/api/templates/${templateId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template Deleted",
        description: "Your template has been deleted successfully",
        variant: "default",
      });
      
      // If the deleted template was selected, clear the selection
      if (selectedTemplate) {
        setSelectedTemplate(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete template: ${error.message}`,
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

  const handleCreateTemplate = (data: z.infer<typeof updateTemplateSchema>) => {
    createNewTemplateMutation.mutate(data);
  };

  const [, navigate] = useLocation();
  
  const handleOpenCreateTemplate = () => {
    // Instead of opening the create template modal, navigate directly to the template builder
    navigate('/template-builder');
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
    <div className="space-y-8 px-4 py-6 max-w-[1600px] mx-auto">
      {/* Hero section with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-6 sm:p-8 shadow-sm border border-blue-100">
        <div className="absolute inset-0 bg-grid-primary-500/10 [mask-image:linear-gradient(0deg,#fff2,transparent)] bg-fixed"></div>
        <div className="relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Email Template Library
              </h1>
              <p className="text-slate-600 mt-2 max-w-2xl text-sm sm:text-base">
                Create professional email templates that will engage your audience and drive results
              </p>
              <div className="flex mt-4 gap-2 text-sm text-slate-500 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  Ready to use
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  AI-powered
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="h-3 w-3 text-blue-600" />
                  Customizable
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
                className="rounded-lg shadow-md gap-2 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
                onClick={handleOpenCreateTemplate}
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="relative w-full sm:w-64">
            <Input
              type="search"
              placeholder="Search templates..."
              className="w-full border-blue-200 focus-visible:ring-blue-300 pl-9"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-[50%] transform -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex-1 sm:flex-none"
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
              variant="outline"
              className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors flex-1 sm:flex-none"
              onClick={() => setShowImportModal(true)}
            >
              <Import className="h-4 w-4" /> 
              Import Template
            </Button>

          </div>
        </div>

        {/* AI Generator Section */}
        <Collapsible open={showAIGenerator} onOpenChange={setShowAIGenerator}>
          <CollapsibleContent className="mt-1">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
              <AdvancedTemplateGenerator onTemplateGenerated={handleTemplateGenerated} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {/* Template listing section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
          <div className="flex flex-wrap items-center gap-4 w-full justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Template Library
            </h2>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="bg-gray-100 rounded-md p-1 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded flex items-center ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded flex items-center ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                  List
                </button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-[300px]">
                <TabsList className="grid grid-cols-2 bg-gray-100/80">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                    All Templates
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Templates
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoadingTemplates ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `No templates match your search query "${searchQuery}".` 
                : "You don't have any templates yet. Create your first template to get started."}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button 
                variant="outline" 
                className="gap-2 border-blue-200 bg-white shadow-sm"
                onClick={() => setShowAIGenerator(true)}
              >
                <Wand2 className="h-4 w-4" /> 
                Use AI Generator
              </Button>
              <Button 
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={handleOpenCreateTemplate}
              >
                <PlusCircle className="h-4 w-4" /> 
                Create Template
              </Button>
              <Button 
                variant="outline"
                className="gap-2 border-blue-200 bg-white shadow-sm"
                onClick={() => setShowImportModal(true)}
              >
                <Import className="h-4 w-4" /> 
                Import Template
              </Button>

            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template: Template) => (
                  <Card 
                    key={template.id} 
                    className="flex flex-col h-full overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group rounded-xl"
                    onClick={() => handleViewTemplate(template)}
                  >
                <div className="relative overflow-hidden h-[180px] bg-gradient-to-br from-gray-50 to-blue-50">
                  {/* Template preview thumbnail */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center p-3 overflow-hidden"
                  >
                    <div className="relative w-full h-full bg-white rounded-lg shadow-md overflow-hidden transform transition-transform group-hover:scale-[1.02] duration-300 origin-center">
                      <iframe 
                        srcDoc={template.content}
                        className="w-full h-full transform scale-[0.6] origin-top bg-white"
                        title={`Preview of ${template.name}`}
                      />
                      
                      {/* Gradient overlay at bottom for text readability */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/90 to-transparent"></div>
                    </div>
                  </div>
                  
                  {/* Quick action overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                    <div className="absolute bottom-4 w-full flex justify-center gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="shadow-md bg-white/90 backdrop-blur-sm hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/preview-template?id=${template.id}`, '_blank');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1.5 text-blue-600" />
                        Preview
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="shadow-md bg-white/90 backdrop-blur-sm hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareTemplate(template.id);
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-1.5 text-blue-600" />
                        Share
                      </Button>
                      <Link 
                        href={`/template-builder?id=${template.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="secondary" size="sm" className="shadow-md bg-white/90 backdrop-blur-sm hover:bg-white">
                          <Pencil className="h-4 w-4 mr-1.5 text-blue-600" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Category pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white shadow-sm rounded-full text-xs font-medium text-blue-700 backdrop-blur-sm border border-blue-100">
                    {template.category || 'General'}
                  </div>
                  
                  {/* AI badge if applicable */}
                  {template.metadata?.generatedByAI && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-2.5 py-1 text-xs font-medium flex items-center shadow-sm">
                      <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-1.5 pt-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1 text-sm text-gray-500">
                        {template.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs text-gray-500 shrink-0 border-gray-200">ID: {template.id}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="py-1.5 flex-grow">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start gap-1.5 text-sm text-gray-500">
                      <span className="font-medium text-blue-700">Subject:</span>
                      <span className="line-clamp-2">{template.subject}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-3 pb-4 border-t border-gray-100 flex justify-between">
                  <Link href={`/campaigns?templateId=${template.id}`} className="flex-1 mr-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Use In Campaign
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete ${template.name}?`)) {
                        deleteTemplateMutation.mutate(template.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates.map((template: Template) => (
                  <Card 
                    key={template.id} 
                    className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group bg-white rounded-lg overflow-hidden"
                    onClick={() => handleViewTemplate(template)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
                      <div className="md:col-span-2 flex justify-center md:justify-start">
                        <div className="relative w-20 h-20 overflow-hidden rounded-md border border-gray-100 shadow-sm bg-white">
                          <iframe 
                            srcDoc={typeof template.content === 'string' ? template.content : JSON.stringify(template.content)}
                            className="absolute inset-0 w-full h-full transform scale-[0.25] origin-top-left"
                            title={`Thumbnail of ${template.name}`}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/50"></div>
                          {template.metadata?.generatedByAI && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 h-5 flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="md:col-span-7 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-700 transition-colors group-hover:text-primary">
                            {template.name}
                            {template.metadata?.new && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                New
                              </span>
                            )}
                          </h3>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50 border-gray-200">
                            {template.category}
                          </Badge>
                          
                          {template.metadata?.generatedByAI && (
                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-xs">
                              <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                            </Badge>
                          )}
                          
                          <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50 border-blue-200">
                            ID: {template.id}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-500 line-clamp-2 mb-1">{template.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {template.createdAt ? formatDistanceToNow(new Date(template.createdAt), { addSuffix: true }) : 'Date unavailable'}
                          </div>
                          
                          <div className="w-px h-3 bg-gray-200"></div>
                          
                          <div className="flex items-center text-gray-500">
                            <span className="font-medium text-blue-700 mr-1">Subject:</span>
                            <span className="truncate max-w-[200px]">{template.subject}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-3 flex flex-col md:flex-row items-center justify-end gap-2 md:gap-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full md:w-auto h-9 text-sm px-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/preview-template?id=${template.id}`, '_blank');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          Preview
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full md:w-auto h-9 text-sm px-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/template-builder/${template.id}`);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1.5" />
                          Edit
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:ml-1">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/campaigns?templateId=${template.id}`;
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Use in Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareTemplate(template.id);
                              }}
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share Template
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                const contentText = typeof template.content === 'string' ? template.content : JSON.stringify(template.content);
                                window.navigator.clipboard.writeText(contentText);
                                toast({
                                  title: "HTML code copied",
                                  description: "The template HTML has been copied to your clipboard.",
                                  duration: 3000,
                                });
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy HTML Code
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete ${template.name}?`)) {
                                  deleteTemplateMutation.mutate(template.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {selectedTemplate && (
        <div className="mt-4">
          <div className="flex items-center justify-between pb-4 border-b mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-1.5 text-primary">
              <FileText className="h-5 w-5" />
              Template Details
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm bg-blue-50 border-blue-200">ID: {selectedTemplate.id}</Badge>
              {selectedTemplate.metadata?.generatedByAI && (
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Generated
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex flex-col gap-2">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {selectedTemplate.name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {selectedTemplate.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-primary">Subject Line</span>
                        <div className="p-2 bg-blue-50/50 rounded-md text-sm">
                          {selectedTemplate.subject || 'No subject'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-primary">Category</span>
                        <div className="p-2 bg-blue-50/50 rounded-md text-sm">
                          {selectedTemplate.category || 'General'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative mt-4">
                      <div className="flex justify-between items-center bg-gradient-to-r from-gray-100 to-gray-50 p-3 rounded-t-md border border-gray-200">
                        <span className="font-medium text-sm text-gray-700">Template HTML</span>
                        <Button variant="ghost" size="sm" onClick={handleCopyHtmlCode} className="text-primary">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </Button>
                      </div>
                      <div className="border border-t-0 border-gray-200 rounded-b-md">
                        <pre className="p-4 text-xs bg-zinc-950 text-zinc-100 overflow-auto max-h-[350px] rounded-b-md">
                          <code>{typeof selectedTemplate.content === 'string' ? selectedTemplate.content : JSON.stringify(selectedTemplate.content, null, 2) || 'No template content available.'}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col gap-4">
              <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3 pt-3 border-b">
                  <CardTitle className="text-base font-semibold">Template Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start gap-2"
                      onClick={() => window.open(`/preview-template?id=${selectedTemplate.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                      Preview Template
                    </Button>
                    
                    <Link href={`/template-builder?id=${selectedTemplate.id}`} className="w-full">
                      <Button className="w-full justify-start gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit Template
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-primary/20"
                      onClick={() => setIsTestEmailOpen(true)}
                    >
                      <Mail className="h-4 w-4" />
                      Send Test Email
                    </Button>
                    
                    <Link href={`/campaigns?templateId=${selectedTemplate.id}`} className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 border-primary/20"
                      >
                        <Send className="h-4 w-4" />
                        Use In Campaign
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-primary/20"
                      onClick={() => handleShareTemplate(selectedTemplate.id)}
                    >
                      <Share2 className="h-4 w-4" />
                      Share Template
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-primary/20"
                      onClick={handleCopyHtmlCode}
                    >
                      <Copy className="h-4 w-4" />
                      Copy HTML Code
                    </Button>
                    
                    <Button 
                      variant="destructive"
                      className="w-full justify-start gap-2 mt-4"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${selectedTemplate.name}?`)) {
                          deleteTemplateMutation.mutate(selectedTemplate.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Button
                variant="outline"
                className="gap-2 justify-center"
                onClick={() => setSelectedTemplate(null)}
              >
                <XCircle className="h-4 w-4" />
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ImportTemplateModal 
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportSuccess={handleImportSuccess}
      />

      {/* Update template actions */}
      {selectedTemplate && (
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsUpdateTemplateOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Update email template
          </Button>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open(`/preview-template?id=${selectedTemplate.id}`, '_blank')}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsTestEmailOpen(true)}
          >
            <Mail className="h-4 w-4" />
            Send a test email using this template
          </Button>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleOpenCreateTemplate}
          >
            <PlusCircle className="h-4 w-4" />
            Create new
          </Button>
          
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => setSelectedTemplate(null)}
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      )}

      {/* Test Email Dialog */}
      <Dialog open={isTestEmailOpen} onOpenChange={setIsTestEmailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify how this template will appear in email clients.
            </DialogDescription>
          </DialogHeader>

          <Form {...testEmailForm}>
            <form 
              onSubmit={testEmailForm.handleSubmit(handleSendTestEmail)} 
              className="space-y-4 py-3"
            >
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

              <FormField
                control={testEmailForm.control}
                name="personalizeContent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Personalize content with test data
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsTestEmailOpen(false)} 
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
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

      {/* Update Template Dialog */}
      <Dialog open={isUpdateTemplateOpen} onOpenChange={setIsUpdateTemplateOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Update Template</DialogTitle>
            <DialogDescription>
              Make changes to your email template.
            </DialogDescription>
          </DialogHeader>

          <Form {...updateTemplateForm}>
            <form 
              onSubmit={updateTemplateForm.handleSubmit(handleUpdateTemplate)} 
              className="space-y-4 py-3"
            >
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                      </SelectContent>
                    </Select>
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
                        {...field} 
                        className="font-mono text-xs h-[300px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsUpdateTemplateOpen(false)} 
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTemplateMutation.isPending}
                >
                  {updateTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Template"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>


      {/* Create Template Dialog */}
      <CreateTemplateDialog 
        isOpen={isCreatingTemplate}
        onOpenChange={setIsCreatingTemplate}
        onCreateTemplate={handleCreateTemplate}
        onShowAIGenerator={() => setShowAIGenerator(true)}
        onShowImportModal={() => setShowImportModal(true)}
      />

      {/* Share Template Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Share Template
            </DialogTitle>
            <DialogDescription>
              Create a shareable link for this template with customized expiration settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="expiration">Link Expiration</Label>
              <Select value={shareExpiration} onValueChange={setShareExpiration}>
                <SelectTrigger id="expiration" className="w-full">
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="never">Never expires</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {shareExpiration === "never" 
                  ? "This link will never expire and can be accessed indefinitely."
                  : `This link will expire ${shareExpiration} days after creation.`}
              </p>
            </div>

            <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-1.5">
                <Info className="h-4 w-4" /> 
                About Template Sharing
              </h4>
              <p className="text-xs text-blue-700">
                Anyone with the link can view and import this template. No account is required to access shared templates.
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
              className="gap-2"
              onClick={handleConfirmShare}
              disabled={shareTemplateMutation.isPending}
            >
              {shareTemplateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Generate Link
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}