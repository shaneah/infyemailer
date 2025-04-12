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
  XCircle
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
    
    const matchesCategory = activeTab === "all" || 
      (template.metadata?.generatedByAI && activeTab === "ai");
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage email templates for your campaigns
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Input
              type="search"
              placeholder="Search templates..."
              className="w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowAIGenerator(!showAIGenerator)}
            >
              {showAIGenerator ? (
                <>Hide AI Generator</>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> 
                  AI Template Generator
                </>
              )}
            </Button>
            <Button 
              className="gap-2"
              onClick={() => setShowImportModal(true)}
            >
              <Import className="h-4 w-4" /> 
              Import Template
            </Button>
          </div>
        </div>

        <Collapsible open={showAIGenerator} onOpenChange={setShowAIGenerator}>
          <CollapsibleContent className="mt-2">
            <AdvancedTemplateGenerator onTemplateGenerated={handleTemplateGenerated} />
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Template Library
          </h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Templates
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoadingTemplates ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
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
                onClick={() => setShowImportModal(true)}
              >
                <Import className="h-4 w-4" /> 
                Import Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template: Template) => (
              <Card 
                key={template.id} 
                className="flex flex-col h-full border hover:border-primary/30 hover:shadow-md transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.metadata?.generatedByAI && (
                        <div className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center">
                          <Sparkles className="h-2.5 w-2.5 mr-1" /> AI
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">ID: {template.id}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="py-2 flex-grow">
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <span className="font-medium">Subject:</span>
                    <span className="line-clamp-2">{template.subject}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2 border-t flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTemplate(template)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`/preview-template?id=${template.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  <Link href={`/template-builder?id=${template.id}`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
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
              <Link href={`/template-builder?id=${selectedTemplate.id}`}>
                <Button>
                  Edit Template
                </Button>
              </Link>
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
      <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new email template from scratch.
            </DialogDescription>
          </DialogHeader>

          <Form {...updateTemplateForm}>
            <form 
              onSubmit={updateTemplateForm.handleSubmit(handleCreateTemplate)} 
              className="space-y-4 py-3"
            >
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

              <FormField
                control={updateTemplateForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Your Monthly Update from Company" />
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
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
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
                        {...field} 
                        className="font-mono text-xs h-[300px]"
                        placeholder="<!DOCTYPE html><html><head>...</head><body>Your email content here</body></html>" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreatingTemplate(false)} 
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
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
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}