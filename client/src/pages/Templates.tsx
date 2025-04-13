import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Link } from "wouter";
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
  Search,
  MoreVertical,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedTemplateGenerator from "@/components/AdvancedTemplateGenerator";
import ImportTemplateModal from "@/components/ImportTemplateModal";
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
  DropdownMenuLabel,
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
  metadata?: {
    generatedByAI?: boolean;
    icon?: string;
    iconColor?: string;
    new?: boolean;
    previewImage?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
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

// Format date in a user-friendly way
function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric', 
    day: 'numeric', 
    year: 'numeric'
  }).format(date);
}

// Get placeholder image based on category
function getTemplateImage(template: Template) {
  if (template.metadata?.previewImage) {
    return template.metadata.previewImage;
  }
  
  const category = template.category.toLowerCase();
  
  // Return specific placeholder based on category
  if (category === "newsletter") {
    return "https://images.unsplash.com/photo-1591258739299-5b65d5cbb235?q=80&w=1000";
  } else if (category === "welcome" || category === "onboarding") {
    return "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?q=80&w=1000";
  } else if (category === "promotional" || category === "marketing") {
    return "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000";
  } else if (category === "events") {
    return "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000";
  } else if (category === "engagement") {
    return "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000";
  }
  
  // Default placeholder
  return "https://images.unsplash.com/photo-1634128221889-82ed6efebfc3?q=80&w=1000";
}

export default function Templates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);
  const [isUpdateTemplateOpen, setIsUpdateTemplateOpen] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'onboarding', name: 'Onboarding' },
    { id: 'newsletter', name: 'Newsletters' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'promotional', name: 'Promotional' },
    { id: 'events', name: 'Events' },
    { id: 'engagement', name: 'Engagement' }
  ];
  
  // Fetch templates
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

  // Handler functions
  const handleSendTestEmail = (data: z.infer<typeof testEmailSchema>) => {
    sendTestEmailMutation.mutate(data);
  };

  const handleUpdateTemplate = (data: z.infer<typeof updateTemplateSchema>) => {
    updateTemplateMutation.mutate(data);
  };

  const handleCreateTemplate = (data: z.infer<typeof updateTemplateSchema>) => {
    createNewTemplateMutation.mutate(data);
  };

  const handleOpenCreateTemplate = () => {
    updateTemplateForm.reset({
      name: "",
      description: "",
      subject: "",
      content: "",
      category: "general"
    });
    setIsCreatingTemplate(true);
  };

  // Filter templates based on search query and selected category
  const filteredTemplates = savedTemplates.filter((template: Template) => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      activeCategory === "all" || 
      (template.category && template.category.toLowerCase() === activeCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  }).sort((a: Template, b: Template) => {
    // Sorting logic
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    } else if (sortBy === "name_asc") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "name_desc") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-purple-600">Email Templates</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2" 
          >
            Import
          </Button>
          <Button 
            onClick={handleOpenCreateTemplate}
            className="bg-indigo-700 hover:bg-indigo-800 flex items-center gap-2" 
          >
            <PlusCircle className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>
      
      <div className="flex overflow-auto pb-1">
        <div className="flex space-x-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 whitespace-nowrap ${
                activeCategory === category.id 
                  ? "border-b-2 border-purple-500 font-medium text-purple-700" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort By</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoadingTemplates ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-md p-6 text-center">
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No templates match your search query "${searchQuery}".` 
                : "You don't have any templates yet. Create your first template."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowAIGenerator(true)}
              >
                <Wand2 className="h-4 w-4" /> 
                Use AI Generator
              </Button>
              <Button 
                className="gap-2"
                onClick={handleOpenCreateTemplate}
              >
                <PlusCircle className="h-4 w-4" /> 
                Create Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: Template) => (
              <Card 
                key={template.id} 
                className="overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img 
                    src={getTemplateImage(template)} 
                    alt={template.name}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewTemplate(template)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/preview-template?id=${template.id}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/template-builder?id=${template.id}`}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit Template
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600" 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${template.name}?`)) {
                              deleteTemplateMutation.mutate(template.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardHeader className="pb-2 pt-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="font-normal text-xs text-gray-500 capitalize">
                      {template.category || 'General'}
                    </Badge>
                    {template.metadata?.generatedByAI && (
                      <div className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center">
                        <Sparkles className="h-2.5 w-2.5 mr-1" /> AI
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="py-1">
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {template.description}
                  </p>
                </CardContent>
                
                <CardFooter className="pt-0 pb-3 flex justify-between text-xs text-gray-500">
                  <div>Last modified: {formatDate(template.updatedAt || new Date().toISOString())}</div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 text-purple-600 hover:text-purple-700 p-0"
                    onClick={() => handleViewTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {selectedTemplate && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Template Details</h2>
          <Card className="border">
            <CardHeader>
              <div className="flex items-center">
                <CardTitle>{selectedTemplate.name}</CardTitle>
                {selectedTemplate.metadata?.generatedByAI && (
                  <div className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                  </div>
                )}
              </div>
              <CardDescription>{selectedTemplate.description}</CardDescription>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="mr-2">Subject:</Badge>
                <span className="text-sm">{selectedTemplate.subject || 'No subject'}</span>
              </div>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="mr-2">Category:</Badge>
                <span className="text-sm">{selectedTemplate.category || 'General'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex justify-between items-center bg-muted p-2 rounded-t-md">
                  <span className="text-xs font-medium">Template HTML</span>
                  <Button variant="ghost" size="sm" onClick={handleCopyHtmlCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
                <pre className="p-4 text-xs bg-zinc-950 text-zinc-100 overflow-auto rounded-b-md max-h-[400px]">
                  <code>{selectedTemplate.content || 'No template content available.'}</code>
                </pre>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyHtmlCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.open(`/preview-template?id=${selectedTemplate.id}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
              <div className="flex gap-2">
                <Link href={`/template-builder?id=${selectedTemplate.id}`}>
                  <Button>
                    Edit Template
                  </Button>
                </Link>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${selectedTemplate.name}?`)) {
                      deleteTemplateMutation.mutate(selectedTemplate.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Template
                </Button>
              </div>
            </CardFooter>
          </Card>
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
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
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
                  className="bg-indigo-700 hover:bg-indigo-800"
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
      <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
        <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
          <div className="flex h-full">
            {/* Left sidebar with gradient */}
            <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 w-64 p-6 text-white hidden md:block">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                New Template
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-1 opacity-80">STEP 1</h4>
                  <p className="text-sm">Enter basic template details like name, category and description</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1 opacity-80">STEP 2</h4>
                  <p className="text-sm">Craft your email subject line that recipients will see</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1 opacity-80">STEP 3</h4>
                  <p className="text-sm">Add your HTML content with your design and copy</p>
                </div>
                <div className="pt-6 border-t border-white/20">
                  <p className="text-xs text-white/70">
                    Need inspiration? Try our AI Template Generator for professionally designed templates in seconds.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 z-10 bg-background p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Create New Template</h2>
                    <p className="text-sm text-muted-foreground">
                      Create a custom email template for your campaigns
                    </p>
                  </div>
                  <Button 
                    variant="ghost"
                    size="icon" 
                    onClick={() => setIsCreatingTemplate(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <Form {...updateTemplateForm}>
                  <form 
                    onSubmit={updateTemplateForm.handleSubmit(handleCreateTemplate)} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={updateTemplateForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. Monthly Newsletter" />
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
                                <SelectItem value="onboarding">Onboarding</SelectItem>
                                <SelectItem value="newsletter">Newsletter</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="promotional">Promotional</SelectItem>
                                <SelectItem value="events">Events</SelectItem>
                                <SelectItem value="engagement">Engagement</SelectItem>
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
                            <Input {...field} placeholder="A brief description of this template" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-blue-50/50 p-4 rounded-md border border-blue-100">
                      <FormField
                        control={updateTemplateForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <span>Subject Line</span>
                              <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">Email Preview</Badge>
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Your email subject line" />
                            </FormControl>
                            <FormDescription>
                              The subject line is what recipients will see in their inbox.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={updateTemplateForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HTML Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Paste your HTML content here..."
                              className="font-mono text-xs h-[300px]" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => setIsCreatingTemplate(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-indigo-700 hover:bg-indigo-800" 
                        disabled={createNewTemplateMutation.isPending}
                      >
                        {createNewTemplateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Template"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}