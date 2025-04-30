import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Email subject is required"),
  previewText: z.string().min(1, "Preview text is required"),
  senderName: z.string().min(1, "Sender name is required"),
  replyToEmail: z.string().email("Must be a valid email address"),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  status: z.string().optional(),
  templateId: z.string().optional(),
  contactLists: z.array(z.string()).optional(),
  isAbTest: z.boolean().optional().default(false),
  variants: z.array(z.object({
    name: z.string().min(1, "Variant name is required"),
    subject: z.string().min(1, "Subject is required"),
    previewText: z.string().optional(),
    content: z.string().optional(),
    weight: z.number().min(1).max(99).optional().default(50),
  })).optional().default([]),
});

interface NewCampaignModalProps {
  onClose: () => void;
  initialTemplateId?: string | null;
}

const NewCampaignModal = ({ onClose, initialTemplateId = null }: NewCampaignModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [sendOption, setSendOption] = useState("schedule");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialTemplateId);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [isAbTesting, setIsAbTesting] = useState(false);
  const [variants, setVariants] = useState<Array<{
    id: string;
    name: string;
    subject: string;
    previewText: string;
    content?: string;
    weight: number;
  }>>([]);
  
  // If an initial template ID is provided, switch to the content tab
  useEffect(() => {
    if (initialTemplateId) {
      setActiveTab("content");
    }
  }, [initialTemplateId]);
  
  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      previewText: "",
      senderName: "Your Company",
      replyToEmail: "",
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: "09:00"
    },
  });
  
  // Campaign response type
  interface CampaignResponse {
    id: number | string;
    name: string;
    status?: string;
    [key: string]: any;
  }

  const createCampaignMutation = useMutation<CampaignResponse, Error, z.infer<typeof campaignSchema>>({
    mutationFn: async (values: z.infer<typeof campaignSchema>) => {
      console.log("Creating campaign with values:", values);
      
      const response = await apiRequest("POST", "/api/campaigns", {
        ...values,
        templateId: selectedTemplateId,
        contactLists: selectedLists,
        sendOption
      });
      
      const data = await response.json();
      console.log("Campaign created successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Invalidating /api/campaigns query cache");
      
      // Invalidate and reset queries to ensure everything is refreshed
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns/stats'] });
      queryClient.resetQueries({ queryKey: ['/api/campaigns'] });
      queryClient.resetQueries({ queryKey: ['/api/campaigns/stats'] });
      
      // Force a refetch immediately
      queryClient.refetchQueries({ queryKey: ['/api/campaigns'] });
      queryClient.refetchQueries({ queryKey: ['/api/campaigns/stats'] });
      
      // Also schedule another refetch after a short delay as a backup
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/campaigns'] });
        queryClient.refetchQueries({ queryKey: ['/api/campaigns/stats'] });
      }, 500);
      
      toast({
        title: "Success",
        description: "Your campaign has been created successfully!",
      });
      
      onClose();
    },
    onError: (error) => {
      console.error("Campaign creation error:", error);
      toast({
        title: "Error",
        description: `Failed to create campaign: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof campaignSchema>) => {
    if (selectedLists.length === 0) {
      toast({
        title: "No Contact Lists Selected",
        description: "Please select at least one contact list for your campaign",
        variant: "destructive"
      });
      setActiveTab('audience');
      return;
    }
    
    // Add A/B testing data if enabled
    const campaignData = {
      ...values,
      isAbTest: isAbTesting,
      variants: isAbTesting ? variants : []
    };
    
    createCampaignMutation.mutate(campaignData);
  };
  
  // Define template interface
  interface Template {
    id: string | number;
    name: string;
    description?: string;
    content?: string;
    category?: string;
  }

  // Fetch templates from the server
  const { data: serverTemplates = [], isLoading: isLoadingTemplates } = useQuery<Template[]>({ 
    queryKey: ['/api/templates'],
  });
  
  // Fetch lists from the server
  const { data: serverLists = [], isLoading: isLoadingLists } = useQuery<{ id: number | string, name: string, count: number }[]>({ 
    queryKey: ['/api/lists'],
  });
  
  // Use data from the server
  const templates = serverTemplates;
  const lists = serverLists;
  
  console.log("Template count:", templates.length, "List count:", lists.length);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Create and configure your new email marketing campaign
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Campaign Details</TabsTrigger>
            <TabsTrigger value="content">Template</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. Summer Sale Announcement"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">Internal name to identify your campaign</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. Don't Miss Our Summer Sale!"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">This will appear as the subject of your email</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="previewText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preview Text</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. Get up to 50% off on all products this week only"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">Short text shown after the subject line in some email clients</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="senderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sender Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. Your Company Name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="replyToEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reply-to Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. support@yourcompany.com"
                              type="email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => {
                      // Validate required fields
                      const name = form.getValues("name");
                      const subject = form.getValues("subject");
                      const previewText = form.getValues("previewText");
                      const senderName = form.getValues("senderName");
                      const replyToEmail = form.getValues("replyToEmail");
                      
                      // Check if any fields are empty
                      if (!name || !subject || !previewText || !senderName || !replyToEmail) {
                        // Show error for each empty field
                        if (!name) form.setError("name", { message: "Campaign name is required" });
                        if (!subject) form.setError("subject", { message: "Subject is required" });
                        if (!previewText) form.setError("previewText", { message: "Preview text is required" });
                        if (!senderName) form.setError("senderName", { message: "Sender name is required" });
                        if (!replyToEmail) form.setError("replyToEmail", { message: "Reply-to email is required" });
                        
                        return;
                      }
                      
                      // Check if email is valid
                      if (replyToEmail && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(replyToEmail)) {
                        form.setError("replyToEmail", { message: "Please enter a valid email address" });
                        return;
                      }
                      
                      // Move to next tab (content)
                      setActiveTab('content');
                    }}
                  >
                    Next: Select Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Select a Template</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div 
                      key={template.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedTemplateId === template.id.toString() ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setSelectedTemplateId(template.id.toString())}
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center mb-3">
                        <svg className="w-12 h-12 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setActiveTab('details')}>
                    Back to Details
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      if (!selectedTemplateId) {
                        toast({
                          title: "No Template Selected",
                          description: "Please select a template first",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      // Go to audience tab
                      setActiveTab('audience');
                    }}
                  >
                    Next: Select Audience
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audience" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Select Contact Lists</h3>
                
                <div className="grid gap-2">
                  {lists.map((list) => (
                    <div 
                      key={list.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all flex justify-between items-center ${selectedLists.includes(list.id.toString()) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                      onClick={() => {
                        if (selectedLists.includes(list.id.toString())) {
                          setSelectedLists(selectedLists.filter(id => id !== list.id.toString()));
                        } else {
                          setSelectedLists([...selectedLists, list.id.toString()]);
                        }
                      }}
                    >
                      <div>
                        <h4 className="font-medium">{list.name}</h4>
                        <p className="text-sm text-muted-foreground">{list.count} contacts</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border ${selectedLists.includes(list.id.toString()) ? 'bg-primary border-primary' : 'border-muted'}`}>
                        {selectedLists.includes(list.id.toString()) && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setActiveTab('content')}>
                    Back to Templates
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      if (selectedLists.length === 0) {
                        toast({
                          title: "No Contact Lists Selected",
                          description: "Please select at least one contact list for your campaign",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      // Go to settings tab
                      setActiveTab('settings');
                    }}
                  >
                    Next: Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Campaign Settings</h3>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">When to send</h4>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sendOption" 
                        checked={sendOption === "schedule"} 
                        onChange={() => setSendOption("schedule")}
                        className="h-4 w-4 text-primary"
                      />
                      <span>Schedule for later</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sendOption" 
                        checked={sendOption === "sendNow"} 
                        onChange={() => setSendOption("sendNow")}
                        className="h-4 w-4 text-primary"
                      />
                      <span>Send immediately</span>
                    </label>
                  </div>
                  
                  {sendOption === "schedule" && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scheduledTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createCampaignMutation.isPending}
          >
            {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewCampaignModal;