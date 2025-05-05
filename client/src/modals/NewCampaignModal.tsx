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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  FileEdit,
  Send,
  BadgePercent,
  CalendarCheck,
  PlusCircle,
  Trash,
  AlertCircle,
  Info
} from "lucide-react";

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
    subject: z.string().min(1, "Variant subject is required"),
    previewText: z.string().min(1, "Variant preview text is required"),
    content: z.string().optional(),
    weight: z.number().min(1, "Weight must be at least 1").default(50),
  })).optional(),
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
      
      try {
        const response = await apiRequest("POST", "/api/campaigns", {
          ...values,
          templateId: selectedTemplateId,
          contactLists: selectedLists,
          sendOption
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Campaign created successfully:", data);
        return data;
      } catch (error) {
        console.error("Error during campaign creation:", error);
        throw error; // Re-throw to be handled by onError
      }
    },
    onSuccess: (data) => {
      console.log("Invalidating /api/campaigns query cache");
      
      // Invalidate multiple queries to ensure everything is refreshed
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns/stats'] });
      
      // Force an immediate refetch to ensure data is up-to-date
      queryClient.refetchQueries({ queryKey: ['/api/campaigns'] });
      queryClient.refetchQueries({ queryKey: ['/api/campaigns/stats'] });
      
      // Schedule another refetch after a delay to catch any delayed database updates
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
    // Validate required fields for campaign creation
    if (!selectedTemplateId) {
      toast({
        title: "Template Required",
        description: "Please select a template for your campaign",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedLists.length === 0) {
      toast({
        title: "Audience Required",
        description: "Please select at least one contact list for your campaign",
        variant: "destructive",
      });
      return;
    }
    
    // Add icon and other metadata
    const iconColor = 
      values.name.toLowerCase().includes('welcome') ? 'success' :
      values.name.toLowerCase().includes('sale') || values.name.toLowerCase().includes('discount') ? 'danger' :
      values.name.toLowerCase().includes('newsletter') ? 'secondary' :
      'primary';
    
    const iconName = 
      values.name.toLowerCase().includes('newsletter') ? 'envelope-fill' :
      values.name.toLowerCase().includes('welcome') ? 'chat-fill' :
      values.name.toLowerCase().includes('sale') || values.name.toLowerCase().includes('discount') ? 'megaphone-fill' :
      values.name.toLowerCase().includes('product') ? 'box-fill' :
      values.name.toLowerCase().includes('testing') ? 'bar-chart-fill' :
      'envelope-fill';
      
    // Calculate estimated recipients from selected lists
    const estimatedRecipients = selectedLists.reduce((total, listId) => {
      const list = lists.find(l => l.id.toString() === listId);
      return total + (list ? (list.count || 0) : 0);
    }, 0);
    
    // Add A/B testing data if enabled
    const campaignData = {
      ...values,
      isAbTest: isAbTesting,
      variants: isAbTesting ? variants : [],
      sendOption,
      // Add additional metadata for better display in the campaigns list
      metadata: {
        subtitle: values.previewText?.substring(0, 30) || '',
        icon: { 
          name: iconName, 
          color: iconColor 
        },
        recipients: estimatedRecipients,
        openRate: 0,
        clickRate: 0,
        date: sendOption === 'schedule' && values.scheduledDate 
          ? new Date(values.scheduledDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) 
          : new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })
      }
    };
    
    // Log the data being sent
    console.log("Submitting campaign:", campaignData);
    
    // Show loading toast
    const loadingToastId = toast({
      title: "Creating Campaign",
      description: "Please wait while we create your campaign...",
      duration: 60000, // Long duration as we'll dismiss it manually
    });
    
    // Submit with mutation
    createCampaignMutation.mutate(campaignData, {
      onSuccess: () => {
        // Dismiss the loading toast
        toast({
          id: loadingToastId,
          title: "Campaign Created",
          description: "Your campaign has been created successfully!",
          variant: "success",
        });
      },
      onError: (error) => {
        // Dismiss the loading toast and show error
        toast({
          id: loadingToastId,
          title: "Creation Failed",
          description: `Failed to create campaign: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  // Define template interface
  interface Template {
    id: string | number;
    name: string;
    description?: string;
    content?: string;
    category?: string;
  }

  // Mock templates for testing
  const mockTemplates = [
    { id: 1, name: "Newsletter Template", description: "Professional newsletter layout", category: "newsletter" },
    { id: 2, name: "Promotional Email", description: "Great for sales and special offers", category: "promotional" },
    { id: 3, name: "Welcome Email", description: "Introduce new subscribers to your brand", category: "onboarding" }
  ];
  
  // Mock contact lists for testing
  const mockLists = [
    { id: 1, name: "All Subscribers", count: 2450 },
    { id: 2, name: "Newsletter Subscribers", count: 1820 },
    { id: 3, name: "New Customers", count: 356 }
  ];
  
  // Fetch templates from the server
  const { data: serverTemplates = [], isLoading: isLoadingTemplates } = useQuery<Template[]>({ 
    queryKey: ['/api/templates'],
  });
  
  // Fetch contact lists from the server
  const { data: serverLists = [], isLoading: isLoadingLists } = useQuery<any[]>({ 
    queryKey: ['/api/lists'],
  });
  
  // Use server data if available, otherwise use mock data
  const templates = serverTemplates.length > 0 ? serverTemplates : mockTemplates;
  const lists = serverLists.length > 0 ? serverLists : mockLists;
  
  // Used to ensure Dialog doesn't unmount during animations
  const [isOpen, setIsOpen] = useState(true);
  
  // Close the dialog and then call the parent's onClose after animation
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };
  
  console.log("Templates:", templates.length > 0 ? "Using data" : "Using mocks", "Lists:", lists.length > 0 ? "Using data" : "Using mocks");
  console.log("Template count:", templates.length, "List count:", lists.length);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white rounded-xl max-w-4xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-5 text-white relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-10 translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Mail className="h-6 w-6 mr-2" />
              Create New Campaign
            </DialogTitle>
            <DialogDescription className="text-white/80 max-w-lg">
              Create, schedule, and send your email campaign. Design, target, and track all in one place.
            </DialogDescription>
          </div>
          
          <button 
            onClick={handleClose} 
            className="absolute top-2 right-2 rounded-full p-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex">
          {/* Side navigation */}
          <div className="w-48 bg-gradient-to-b from-purple-50 to-pink-50 p-4 border-r border-purple-100">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('details')}
                className={`w-full flex items-center p-2 rounded-lg text-sm transition-all ${
                  activeTab === 'details' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-sm' 
                    : 'text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                <FileText className={`h-4 w-4 mr-2 ${activeTab === 'details' ? 'text-white' : 'text-purple-500'}`} />
                Campaign Details
              </button>
              
              <button
                onClick={() => setActiveTab('content')}
                className={`w-full flex items-center p-2 rounded-lg text-sm transition-all ${
                  activeTab === 'content' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-sm' 
                    : 'text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                <FileEdit className={`h-4 w-4 mr-2 ${activeTab === 'content' ? 'text-white' : 'text-purple-500'}`} />
                Email Content
              </button>
              
              <button
                onClick={() => setActiveTab('audience')}
                className={`w-full flex items-center p-2 rounded-lg text-sm transition-all ${
                  activeTab === 'audience' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-sm' 
                    : 'text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                <Users className={`h-4 w-4 mr-2 ${activeTab === 'audience' ? 'text-white' : 'text-purple-500'}`} />
                Select Audience
                {selectedLists.length > 0 && (
                  <span className="ml-auto bg-purple-100 text-purple-600 text-xs font-medium rounded-full px-2 py-0.5">
                    {selectedLists.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('testing')}
                className={`w-full flex items-center p-2 rounded-lg text-sm transition-all ${
                  activeTab === 'testing' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-sm' 
                    : 'text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                <BadgePercent className={`h-4 w-4 mr-2 ${activeTab === 'testing' ? 'text-white' : 'text-purple-500'}`} />
                A/B Testing
                {isAbTesting && (
                  <span className="ml-auto bg-green-100 text-green-600 text-xs font-medium rounded-full px-2 py-0.5">
                    On
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center p-2 rounded-lg text-sm transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-sm' 
                    : 'text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                <Settings className={`h-4 w-4 mr-2 ${activeTab === 'settings' ? 'text-white' : 'text-purple-500'}`} />
                Schedule & Send
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-grow p-5 max-h-[70vh] overflow-y-auto">
            {activeTab === 'details' && (
                <div>
                  <Form {...form}>
                    <form onSubmit={(e) => { e.preventDefault(); }}>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormLabel htmlFor="campaignName">Campaign Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                id="campaignName" 
                                placeholder="e.g. Summer Sale Announcement"
                              />
                            </FormControl>
                            <div className="form-text">Internal name to identify your campaign</div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormLabel htmlFor="emailSubject">Email Subject</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                id="emailSubject" 
                                placeholder="e.g. Don't Miss Our Summer Sale!"
                              />
                            </FormControl>
                            <div className="form-text">This will appear as the subject of your email</div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="previewText"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormLabel htmlFor="previewText">Preview Text</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                id="previewText" 
                                placeholder="e.g. Get up to 50% off on all products this week only"
                              />
                            </FormControl>
                            <div className="form-text">Short text shown after the subject line in some email clients</div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="senderName"
                        render={({ field }) => (
                          <FormItem className="mb-3">
                            <FormLabel htmlFor="senderName">Sender Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                id="senderName" 
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
                          <FormItem className="mb-3">
                            <FormLabel htmlFor="replyToEmail">Reply-to Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                id="replyToEmail" 
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
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      type="button" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md"
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
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Next: Choose Template
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'content' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Choose a Template for Your Campaign</h3>
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {templates.map((template: Template) => {
                        // Determine template color by id
                        const colors = [
                          { bg: "from-purple-500 to-pink-600", text: "text-purple-700", border: "border-purple-200", hover: "hover:border-purple-300" },
                          { bg: "from-blue-500 to-cyan-600", text: "text-blue-700", border: "border-blue-200", hover: "hover:border-blue-300" },
                          { bg: "from-orange-500 to-amber-600", text: "text-orange-700", border: "border-orange-200", hover: "hover:border-orange-300" },
                        ];
                        
                        const templateIndex = typeof template.id === 'number' ? template.id % colors.length : 0;
                        const color = colors[templateIndex];
                        
                        return (
                          <Card 
                            key={template.id}
                            className={`cursor-pointer transition-all border ${color.border} ${color.hover} ${selectedTemplateId === String(template.id) ? 'ring-2 ring-purple-400 shadow-md' : ''}`}
                            onClick={() => setSelectedTemplateId(String(template.id))}
                          >
                            <CardHeader className={`p-4 bg-gradient-to-r ${color.bg} text-white pb-12`}>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-medium">{template.name}</CardTitle>
                                {selectedTemplateId === String(template.id) && (
                                  <CheckCircle className="h-5 w-5 text-white" />
                                )}
                              </div>
                            </CardHeader>
                            <div className="px-4 -mt-8">
                              <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 mb-3">
                                <div className="text-xs text-gray-500 mb-1">Preview</div>
                                <div className="bg-gray-100 rounded h-16"></div>
                              </div>
                            </div>
                            <CardContent className="p-4 pt-0">
                              <CardDescription className="text-sm text-gray-600">
                                {template.description || "A professional email template"}
                              </CardDescription>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('details')}
                      className="flex items-center"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <div className="space-x-2">
                      <Button 
                        type="button" 
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md"
                        onClick={() => {
                          if (!selectedTemplateId) {
                            toast({
                              title: "No Template Selected",
                              description: "Please select a template first",
                              variant: "destructive"
                            });
                            setActiveTab('audience');
                            return;
                          }
                            
                          // Create campaign with draft status
                          const formValues = form.getValues();
                          createCampaignMutation.mutate(
                            {
                              ...formValues,
                              status: 'draft',
                              templateId: selectedTemplateId,
                              contactLists: selectedLists
                            },
                            {
                              onSuccess: (response: CampaignResponse) => {
                                // Navigate to template builder with campaign ID
                                window.location.href = `/template-builder/${response.id}`;
                              }
                            }
                          );
                        }}
                      >
                        <FileEdit className="mr-2 h-4 w-4" />
                        Proceed to Editor
                      </Button>
                      
                      <Button 
                        type="button" 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md"
                        onClick={() => {
                          if (!selectedTemplateId) {
                            toast({
                              title: "No Template Selected",
                              description: "Please select a template first",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          console.log("Moving to audience tab, selected template:", selectedTemplateId);
                          // Go to audience tab
                          setActiveTab('audience');
                        }}
                      >
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Next: Select Audience
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'audience' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Select Your Target Audience</h3>
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lists.map((list: any) => (
                        <div 
                          key={list.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedLists.includes(String(list.id)) 
                              ? 'border-purple-400 bg-purple-50 shadow-sm' 
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                          }`}
                          onClick={() => {
                            const listId = String(list.id);
                            setSelectedLists(prev => 
                              prev.includes(listId)
                                ? prev.filter(id => id !== listId)
                                : [...prev, listId]
                            );
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{list.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {list.count} contacts · Last updated: {list.lastUpdated || "Recently"}
                              </div>
                            </div>
                            <div className="h-5 w-5 border rounded-full grid place-items-center bg-white">
                              {selectedLists.includes(String(list.id)) && (
                                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('content')}
                      className="flex items-center"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <Button 
                      type="button" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md"
                      onClick={() => {
                        if (selectedLists.length === 0) {
                          toast({
                            title: "No Lists Selected",
                            description: "Please select at least one contact list",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        // Go to A/B testing tab
                        setActiveTab('testing');
                      }}
                    >
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Next: A/B Testing
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'testing' && (
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">A/B Testing Options</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Test different versions of your email to optimize performance.
                  </p>
                  
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">Enable A/B Testing</h4>
                        <p className="text-sm text-gray-600">Create multiple variants of your campaign to test effectiveness</p>
                      </div>
                      <Switch
                        checked={isAbTesting}
                        onCheckedChange={setIsAbTesting}
                      />
                    </div>
                  </div>
                  
                  {isAbTesting && (
                    <div className="border border-gray-200 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-gray-800 mb-3">Variant Manager</h4>
                      
                      <div className="space-y-4">
                        {variants.length > 0 ? (
                          variants.map((variant, index) => (
                            <div key={variant.id} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex justify-between mb-2">
                                <div className="font-medium text-gray-800">
                                  Variant {index + 1}: {variant.name}
                                </div>
                                <button
                                  className="text-gray-400 hover:text-red-500"
                                  onClick={() => {
                                    setVariants(variants.filter(v => v.id !== variant.id));
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div>Subject: {variant.subject}</div>
                                <div>Preview: {variant.previewText}</div>
                                <div>Weight: {variant.weight}%</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg">
                            <div className="text-gray-500">No variants added yet</div>
                            <p className="text-xs text-gray-400 mt-1">Add at least one variant to use A/B testing</p>
                          </div>
                        )}
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 flex items-center justify-center"
                          onClick={() => {
                            // Add a new variant
                            const newVariant = {
                              id: `variant-${Date.now()}`,
                              name: `Variant ${variants.length + 1}`,
                              subject: form.getValues("subject") + (variants.length > 0 ? ` (v${variants.length + 1})` : ""),
                              previewText: form.getValues("previewText"),
                              weight: Math.floor(100 / (variants.length + 1)),
                              content: ""
                            };
                            
                            setVariants([...variants, newVariant]);
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Variant
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('audience')}
                      className="flex items-center"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <Button 
                      type="button" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md"
                      onClick={() => {
                        // Validate A/B testing setup if enabled
                        if (isAbTesting && variants.length === 0) {
                          toast({
                            title: "No Variants Added",
                            description: "Please add at least one variant for A/B testing, or disable it",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        // Go to settings tab
                        setActiveTab('settings');
                      }}
                    >
                      <ChevronRight className="mr-2 h-4 w-4" />
                      Next: Schedule & Send
                    </Button>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Schedule & Send Options</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Choose when to send your campaign to your audience.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          sendOption === 'now' 
                            ? 'border-purple-400 bg-purple-50 shadow-sm' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                        onClick={() => setSendOption('now')}
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mb-3">
                          <Send className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-800">Send Now</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Send your campaign immediately after creation
                        </p>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          sendOption === 'schedule' 
                            ? 'border-purple-400 bg-purple-50 shadow-sm' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                        onClick={() => setSendOption('schedule')}
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mb-3">
                          <CalendarCheck className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-800">Schedule</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Pick a date and time to automatically send
                        </p>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          sendOption === 'draft' 
                            ? 'border-purple-400 bg-purple-50 shadow-sm' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                        onClick={() => setSendOption('draft')}
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center mb-3">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-800">Save as Draft</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Save your campaign to send later
                        </p>
                      </div>
                    </div>
                    
                    {sendOption === 'schedule' && (
                      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <h4 className="font-medium text-gray-800 mb-3">Schedule Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input 
                              type="date" 
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              value={form.getValues("scheduledDate")}
                              onChange={(e) => form.setValue("scheduledDate", e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input 
                              type="time" 
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              value={form.getValues("scheduledTime")}
                              onChange={(e) => form.setValue("scheduledTime", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-start">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-xs text-blue-700">
                            The campaign will be automatically sent at the specified date and time. Make sure to complete all 
                            campaign setup before scheduling.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('testing')}
                      className="flex items-center"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <Button 
                      type="button"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={createCampaignMutation.isPending}
                    >
                      {createCampaignMutation.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Campaign...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {sendOption === 'now' ? 'Send Campaign' : sendOption === 'schedule' ? 'Schedule Campaign' : 'Save as Draft'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewCampaignModal;