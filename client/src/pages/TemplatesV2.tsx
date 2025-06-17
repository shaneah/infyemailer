import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
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
  LayoutGrid,
  LayoutList,
  Filter,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  FileCode,
  MailOpen,
  Inbox,
  Archive,
  Star,
  StarIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Categories mapping for visual styles
const CATEGORIES_CONFIG = {
  "newsletter": { 
    icon: <MailOpen className="h-4 w-4" />, 
    color: "bg-indigo-100 text-indigo-800 border-indigo-200" 
  },
  "promotional": { 
    icon: <Sparkles className="h-4 w-4" />, 
    color: "bg-pink-100 text-pink-800 border-pink-200" 
  },
  "transactional": { 
    icon: <Send className="h-4 w-4" />, 
    color: "bg-green-100 text-green-800 border-green-200" 
  },
  "announcement": { 
    icon: <Info className="h-4 w-4" />, 
    color: "bg-blue-100 text-blue-800 border-blue-200" 
  },
  "welcome": { 
    icon: <Inbox className="h-4 w-4" />, 
    color: "bg-purple-100 text-purple-800 border-purple-200" 
  },
  "general": { 
    icon: <FileText className="h-4 w-4" />, 
    color: "bg-gray-100 text-gray-800 border-gray-200" 
  }
};

export default function TemplatesV2() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
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

  const handleTemplateGenerated = (template: any) => {
    toast({
      title: "Template Created",
      description: "Your AI template has been generated and saved to the library",
      variant: "default",
    });
    setSelectedTemplate(template);
  };
  
  const handleImportSuccess = (template: any) => {
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

  // Get all unique categories from templates
  const uniqueCategories = React.useMemo(() => {
    const categories = new Set<string>();
    savedTemplates.forEach((template: Template) => {
      if (template.category) {
        categories.add(template.category);
      } else {
        categories.add('general');
      }
    });
    return Array.from(categories);
  }, [savedTemplates]);

  // Filter templates based on search query, selected category, and type
  const filteredTemplates = savedTemplates.filter((template: Template) => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = activeTab === "all" || 
      (template.metadata?.generatedByAI && activeTab === "ai") ||
      (!template.metadata?.generatedByAI && activeTab === "standard");
    
    const matchesCategory = activeCategory === "all" || 
      template.category === activeCategory ||
      (!template.category && activeCategory === "general");
    
    return matchesSearch && matchesType && matchesCategory;
  });
  
  // Function to get the category badge
  const getCategoryBadge = (category: string) => {
    const categoryConfig = (CATEGORIES_CONFIG as any)[category?.toLowerCase()] || CATEGORIES_CONFIG.general;
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1.5 font-medium ${categoryConfig.color}`}
      >
        {categoryConfig.icon}
        <span className="capitalize">{category || 'General'}</span>
      </Badge>
    );
  };

  // Render loading skeleton
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, i) => (
      <Card key={i} className="h-[420px] overflow-hidden border border-gray-200 rounded-xl">
        <div className="h-[200px] bg-gray-100 animate-pulse" />
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mt-1" />
        </CardHeader>
        <CardContent className="py-1.5">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
        <CardFooter className="pt-3 pb-4 border-t border-gray-100 flex justify-between">
          <Skeleton className="h-9 w-full rounded-md" />
        </CardFooter>
      </Card>
    ));
  };
  
  // Error state component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 h-[400px]">
      <XCircle className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Templates</h3>
      <p className="text-gray-600 max-w-md mb-6">We encountered an error while trying to load your templates. Please try again or contact support if the problem persists.</p>
      <Button 
        onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/templates'] })}
        className="bg-indigo-600 hover:bg-indigo-700"
      >
        <Loader2 className="mr-2 h-4 w-4" /> Try Again
      </Button>
    </div>
  );
  
  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 h-[400px]">
      <Mail className="h-12 w-12 text-indigo-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Templates Found</h3>
      <p className="text-gray-600 max-w-md mb-6">
        {searchQuery || activeTab !== "all" || activeCategory !== "all" 
          ? "No templates match your current filters. Try adjusting your search criteria."
          : "You don't have any email templates yet. Create your first template to get started."}
      </p>
      {!searchQuery && activeTab === "all" && activeCategory === "all" && (
        <div className="flex gap-3">
          <Button 
            onClick={handleOpenCreateTemplate}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Template
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowImportModal(true)}
          >
            <Import className="mr-2 h-4 w-4" /> Import Template
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-[1600px]">
      {/* Header with Gradient */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 md:p-8">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Email Templates</h1>
            <p className="text-white/90 max-w-3xl text-sm md:text-base">
              Create professional email templates that engage your audience and drive results. Use our template builder or generate templates with AI.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <Button 
                onClick={handleOpenCreateTemplate}
                className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Create New Template
              </Button>
              
              <Button 
                variant="outline"
                className="bg-indigo-700/20 text-white border-white/40 hover:bg-indigo-700/30 hover:border-white/60 backdrop-blur-sm"
                onClick={() => setShowAIGenerator(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" /> 
                Generate with AI
              </Button>
              
              <Button 
                variant="outline"
                className="bg-indigo-700/20 text-white border-white/40 hover:bg-indigo-700/30 hover:border-white/60 backdrop-blur-sm"
                onClick={() => setShowImportModal(true)}
              >
                <Import className="mr-2 h-4 w-4" /> 
                Import Template
              </Button>
            </div>
          </div>
          
          {/* Abstract pattern background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzIgMGMxNy42NzMgMCAzMiAxNC4zMjcgMzIgMzIgMCAxNy42NzMtMTQuMzI3IDMyLTMyIDMyQzE0LjMyNyA2NCAwIDQ5LjY3MyAwIDMyIDAgMTQuMzI3IDE0LjMyNyAwIDMyIDB6bTAgOGEyNCAyNCAwIDEgMCAwIDQ4IDI0IDI0IDAgMCAwIDAtNDh6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4xIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-10 bg-repeat" />
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm flex items-center">
          <div className="rounded-full bg-indigo-50 p-3 mr-4">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Templates</p>
            <p className="text-2xl font-bold text-gray-900">{savedTemplates.length}</p>
          </div>
        </div>
        
        <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm flex items-center">
          <div className="rounded-full bg-purple-50 p-3 mr-4">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">AI Generated</p>
            <p className="text-2xl font-bold text-gray-900">
              {savedTemplates.filter((t: Template) => t.metadata?.generatedByAI).length}
            </p>
          </div>
        </div>
        
        <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm flex items-center">
          <div className="rounded-full bg-blue-50 p-3 mr-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{uniqueCategories.length}</p>
          </div>
        </div>
        
        <div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm flex items-center">
          <div className="rounded-full bg-green-50 p-3 mr-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-lg font-bold text-gray-900">
              {savedTemplates.length > 0 
                ? formatDistanceToNow(new Date(savedTemplates[0].updatedAt || savedTemplates[0].createdAt || new Date()), { addSuffix: true }) 
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Filters & Search Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="pl-9 border-gray-200 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Category Filter */}
            <Select
              value={activeCategory}
              onValueChange={setActiveCategory}
            >
              <SelectTrigger className="w-full sm:w-40 border-gray-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    <span className="capitalize">{category}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 items-center justify-between md:justify-end">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-md p-0.5">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Type Filter */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="bg-gray-100 h-8">
                <TabsTrigger value="all" className="text-xs h-7 px-3">All</TabsTrigger>
                <TabsTrigger value="standard" className="text-xs h-7 px-3">Standard</TabsTrigger>
                <TabsTrigger value="ai" className="text-xs h-7 px-3">
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  AI Generated
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Templates Grid/List */}
      <div>
        {isLoadingTemplates ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {renderSkeletons()}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template: Template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className="h-full overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group rounded-xl cursor-pointer"
                      onClick={() => handleViewTemplate(template)}
                    >
                      <div className="relative overflow-hidden h-[180px]">
                        {/* Template preview thumbnail */}
                        <div 
                          className="absolute inset-0 flex items-center justify-center p-3 overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50/30"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                          <div className="absolute bottom-4 w-full flex justify-center gap-2">
                            {/* Edit button commented out
                            <Button variant="secondary" size="sm" className="shadow-md bg-white/90 backdrop-blur-sm hover:bg-white">
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                            */}
                          </div>
                        </div>

                        {/* Category and AI badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {getCategoryBadge(template.category)}
                        </div>
                        
                        {/* AI badge if applicable */}
                        {template.metadata?.generatedByAI && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-2.5 py-1 text-xs font-medium flex items-center shadow-sm">
                            <Sparkles className="h-3 w-3 mr-1" /> AI
                          </div>
                        )}
                      </div>
                      
                      <CardHeader className="pb-1.5 pt-4">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-800 mb-1">
                              {template.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-sm text-gray-500">
                              {template.description}
                            </CardDescription>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleShareTemplate(template.id);
                              }}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplate(template);
                                setIsTestEmailOpen(true);
                              }}>
                                <Send className="mr-2 h-4 w-4" />
                                Send Test
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                if (template.content) {
                                  navigator.clipboard.writeText(template.content);
                                  toast({
                                    title: "Copied",
                                    description: "HTML code copied to clipboard",
                                    variant: "default",
                                  });
                                }
                              }}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy HTML
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTemplateMutation.mutate(template.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="py-1.5 flex-grow">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-start gap-1.5 text-sm text-gray-500">
                            <span className="font-medium text-gray-700">Subject:</span>
                            <span className="line-clamp-2">{template.subject}</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-3 pb-4 border-t border-gray-100 flex justify-between">
                        <Link href={`/campaigns?templateId=${template.id}`} className="flex-1 mr-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            <Send className="h-4 w-4 mr-1.5" />
                            Use in Campaign
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTemplates.map((template: Template) => (
                        <tr key={template.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewTemplate(template)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {template.name}
                                  {template.metadata?.generatedByAI && (
                                    <Badge className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                                      <Sparkles className="h-3 w-3 mr-1" /> AI
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-1 max-w-md">
                                  {template.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getCategoryBadge(template.category)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 line-clamp-1 max-w-xs">{template.subject}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(template.createdAt || '').toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-900"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/preview-template?id=${template.id}`, '_blank');
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {/* Edit button commented out
                              <Button variant="secondary" size="sm" className="shadow-md bg-white/90 backdrop-blur-sm hover:bg-white">
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              */}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareTemplate(template.id);
                                  }}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTemplate(template);
                                    setIsTestEmailOpen(true);
                                  }}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Test
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    if (template.content) {
                                      navigator.clipboard.writeText(template.content);
                                      toast({
                                        title: "Copied",
                                        description: "HTML code copied to clipboard",
                                        variant: "default",
                                      });
                                    }
                                  }}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy HTML
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTemplateMutation.mutate(template.id);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
      
      {/* Template Details Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              {selectedTemplate?.name}
              {selectedTemplate?.metadata?.generatedByAI && (
                <Badge className="ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {selectedTemplate?.description}
            </DialogDescription>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTemplate && getCategoryBadge(selectedTemplate.category)}
              <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                ID: {selectedTemplate?.id}
              </Badge>
              <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                Created: {selectedTemplate?.createdAt ? new Date(selectedTemplate?.createdAt).toLocaleDateString() : 'Unknown'}
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col lg:flex-row gap-6 overflow-hidden">
            <div className="w-full lg:w-7/12 overflow-auto max-h-[calc(90vh-180px)] rounded-md border border-gray-200">
              <div className="bg-white p-4 h-full overflow-auto">
                <iframe 
                  srcDoc={selectedTemplate?.content} 
                  className="w-full h-full min-h-[400px] border-0"
                  title={`Preview of ${selectedTemplate?.name}`}
                />
              </div>
            </div>
            
            <div className="w-full lg:w-5/12 overflow-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Description</h3>
                  <p className="mt-1 text-sm text-gray-600">{selectedTemplate?.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Subject Line</h3>
                  <p className="mt-1 text-sm text-gray-600">{selectedTemplate?.subject}</p>
                </div>
                
                <Collapsible className="border rounded-md">
                  <CollapsibleTrigger className="flex justify-between items-center p-3 w-full text-left">
                    <span className="text-sm font-medium text-gray-700">HTML Code</span>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-3 bg-gray-50 rounded-b-md overflow-x-auto max-h-[200px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">HTML Source</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 gap-1 text-xs"
                          onClick={handleCopyHtmlCode}
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                      <pre className="text-xs p-2 bg-gray-100 rounded border border-gray-200 overflow-x-auto">
                        <code>{selectedTemplate?.content}</code>
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t pt-4 mt-2">
            <div className="flex gap-2 w-full justify-between flex-col-reverse sm:flex-row">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedTemplate(null);
                  }}
                >
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCopyHtmlCode}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTestEmailOpen(true);
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Test
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => {
                    setIsUpdateTemplateOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Template
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Test Email Dialog */}
      <Dialog open={isTestEmailOpen} onOpenChange={setIsTestEmailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify how your template will appear in email clients.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...testEmailForm}>
            <form onSubmit={testEmailForm.handleSubmit(handleSendTestEmail)} className="space-y-4">
              <FormField
                control={testEmailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
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
                      <Input placeholder="Email Subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={testEmailForm.control}
                name="personalizeContent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Personalize Content</FormLabel>
                      <FormDescription>
                        Replace placeholders with sample data
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsTestEmailOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={sendTestEmailMutation.isPending}
                >
                  {sendTestEmailMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the details for this email template.
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
                      <Textarea {...field} />
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
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="general">General</SelectItem>
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
                        className="font-mono text-sm h-40"
                      />
                    </FormControl>
                    <FormDescription>
                      For more advanced editing, use the Template Builder.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsUpdateTemplateOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={updateTemplateMutation.isPending}
                >
                  {updateTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Share Template Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Share Template</DialogTitle>
            <DialogDescription>
              Create a shareable link to this template that others can use.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="expiration">Link Expiration</Label>
              <Select 
                value={shareExpiration}
                onValueChange={setShareExpiration}
              >
                <SelectTrigger id="expiration">
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="never">Never expires</SelectItem>
                </SelectContent>
              </Select>
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
              onClick={handleConfirmShare}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={shareTemplateMutation.isPending}
            >
              {shareTemplateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Generate Link
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Generator Dialog */}
      {showAIGenerator && (
        <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
                Generate Template with AI
              </DialogTitle>
              <DialogDescription>
                Describe your needs and our AI will create an email template for you.
              </DialogDescription>
            </DialogHeader>
            
            <AdvancedTemplateGenerator 
              onTemplateGenerated={handleTemplateGenerated}
            />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowAIGenerator(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Import Template Modal */}
      <ImportTemplateModal 
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}