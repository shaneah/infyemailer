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
      
      // Invalidate multiple queries to ensure everything is refreshed
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns/stats'] });
      
      setTimeout(() => {
        // Force a refetch after a short delay
        queryClient.refetchQueries({ queryKey: ['/api/campaigns'] });
        queryClient.refetchQueries({ queryKey: ['/api/campaigns/stats'] });
      }, 300);
      
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
  
  // Fetch lists from the server
  const { data: serverLists = [], isLoading: isLoadingLists } = useQuery<{ id: number | string, name: string, count: number }[]>({ 
    queryKey: ['/api/lists'],
  });
  
  // Use mock data if the server endpoint doesn't return any data
  const templates = serverTemplates.length > 0 ? serverTemplates : mockTemplates;
  const lists = serverLists.length > 0 ? serverLists : mockLists;
  
  console.log("Templates:", templates.length > 0 ? "Using data" : "Using mocks", "Lists:", lists.length > 0 ? "Using data" : "Using mocks");
  console.log("Template count:", templates.length, "List count:", lists.length);

  return (
    <Dialog open={true} onOpenChange={onClose}>
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
            onClick={onClose} 
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
                    <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        
                        const colorIndex = (Number(template.id) - 1) % colors.length;
                        const color = colors[colorIndex];
                        
                        return (
                          <div className="group" key={template.id}>
                            <motion.div 
                              className={`relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 cursor-pointer 
                                ${selectedTemplateId === template.id.toString() 
                                  ? `border-2 border-${color.bg.split(' ')[0].replace('from-', '')} shadow-md` 
                                  : `border border-gray-200 ${color.hover} shadow-sm hover:shadow`}
                              `}
                              onClick={() => setSelectedTemplateId(template.id.toString())}
                              whileHover={{ y: -4 }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Header with gradient */}
                              <div className={`h-24 bg-gradient-to-r ${color.bg} flex items-center justify-center p-4`}>
                                <FileText className="h-10 w-10 text-white" />
                                
                                {/* Selection indicator */}
                                {selectedTemplateId === template.id.toString() && (
                                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="p-4 flex-grow bg-white">
                                <h3 className={`font-medium mb-1 ${color.text}`}>{template.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                              </div>
                                
                              {/* Footer */}
                              <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
                                {template.category && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {template.category}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          </div>
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
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                        onClick={() => {
                          if (!selectedTemplateId) {
                            toast({
                              title: "No Template Selected",
                              description: "Please select a template first",
                              variant: "destructive"
                            });
                            return;
                          }
                            
                          if (selectedLists.length === 0) {
                            toast({
                              title: "No Contact Lists Selected",
                              description: "Please select at least one contact list for your campaign",
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
                  {console.log("Audience tab rendered, available lists:", lists)}
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2 text-gray-800">Select Your Audience</h3>
                    <p className="text-sm text-gray-500 mb-4">Choose one or more contact lists to receive your campaign</p>
                    
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
                      {lists.map((list, index) => (
                        <div 
                          key={list.id} 
                          className={`flex items-center p-3 hover:bg-purple-50 transition-colors cursor-pointer ${
                            index !== lists.length - 1 ? 'border-b border-gray-100' : ''
                          } ${
                            selectedLists.includes(list.id.toString()) ? 'bg-purple-50' : ''
                          }`}
                          onClick={() => {
                            if (selectedLists.includes(list.id.toString())) {
                              setSelectedLists(selectedLists.filter(id => id !== list.id.toString()));
                            } else {
                              setSelectedLists([...selectedLists, list.id.toString()]);
                            }
                          }}
                        >
                          <div className="flex items-center flex-1">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${
                              selectedLists.includes(list.id.toString()) 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent' 
                                : 'border-gray-300'
                            }`}>
                              {selectedLists.includes(list.id.toString()) && (
                                <CheckCircle className="h-4 w-4 text-white" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <span className="font-medium text-gray-800">{list.name}</span>
                            </div>
                            
                            <div className="ml-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                                {list.count.toLocaleString()} contacts
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {lists.length === 0 && (
                        <div className="p-8 text-center">
                          <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-100 mb-4">
                            <Users className="h-6 w-6 text-purple-600" />
                          </div>
                          <h4 className="text-gray-800 font-medium mb-2">No contact lists available</h4>
                          <p className="text-gray-500 mb-4">You need to create a contact list first</p>
                          <a 
                            href="/contacts" 
                            className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-sm text-sm font-medium"
                          >
                            Create a contact list
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {lists.length > 0 && (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="flex items-center text-sm">
                          <div className="mr-3 bg-purple-100 p-2 rounded-full">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <span className="font-medium">Total audience: </span>
                            <span className="text-gray-700">
                              {selectedLists.length > 0 
                                ? lists
                                    .filter(list => selectedLists.includes(list.id.toString()))
                                    .reduce((sum, list) => sum + list.count, 0)
                                    .toLocaleString()
                                : 0} contacts
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
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
                              title: "No Contact Lists Selected",
                              description: "Please select at least one contact list for your campaign",
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
                </div>
              )}
              
              {activeTab === 'testing' && (
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-800">A/B Testing Configuration</h3>
                  <p className="text-sm text-gray-500 mb-4">Create multiple variants of your email to test different subject lines and content</p>
                    
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                    <div className="flex-grow">
                      <p className="font-medium mb-0.5">Enable A/B Testing</p>
                      <p className="text-sm text-gray-500">Test different subject lines, preview text, or content versions</p>
                    </div>
                    <Switch 
                      checked={isAbTesting}
                      onCheckedChange={setIsAbTesting}
                    />
                  </div>

                  {isAbTesting && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100 mb-4">
                        <div className="flex">
                          <div className="mr-3 text-purple-500">
                            <Info className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-purple-800">How A/B Testing Works</p>
                            <p className="text-sm text-purple-700">
                              Create multiple variants of your email with different subjects, content, or preview text. 
                              We'll distribute these variants to your audience and track which performs better, allowing you 
                              to determine the winning variant based on open rates, clicks, and conversions.
                            </p>
                          </div>
                        </div>
                      </div>
                        
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white flex justify-between items-center">
                          <h3 className="text-base font-medium m-0 flex items-center">
                            <BadgePercent className="h-4 w-4 mr-2" />
                            Email Variants
                          </h3>
                          {variants.length > 0 && (
                            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                              {variants.length} variant{variants.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                          
                        <div className="p-4">
                          {variants.length > 0 ? (
                            <div className="space-y-3">
                              {variants.map((variant, index) => (
                                <div 
                                  key={variant.id} 
                                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                                >
                                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                    <h4 className="text-sm font-medium m-0 flex items-center text-gray-800">
                                      Variant {index + 1}: {variant.name}
                                    </h4>
                                    <div className="flex space-x-1">
                                      <Button 
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-gray-500 hover:text-gray-800"
                                        onClick={() => {
                                          // Implement edit variant functionality
                                          const newName = prompt("Enter a new name for this variant:", variant.name);
                                          if (newName && newName.trim() !== '') {
                                            const updatedVariants = [...variants];
                                            updatedVariants[index] = {
                                              ...variant,
                                              name: newName.trim()
                                            };
                                            setVariants(updatedVariants);
                                          }
                                        }}
                                      >
                                        Edit
                                      </Button>
                                      <Button 
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                          setVariants(variants.filter(v => v.id !== variant.id));
                                        }}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                          <span className="flex h-7 w-7 rounded-full bg-purple-100 text-purple-600 text-xs items-center justify-center font-medium">A</span>
                                        </div>
                                        <div className="ml-3">
                                          <p className="text-xs text-gray-500 mb-1">Subject Line</p>
                                          <p className="text-sm font-medium text-gray-800">{variant.subject}</p>
                                        </div>
                                      </div>
                                        
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                          <span className="flex h-7 w-7 rounded-full bg-gray-100 text-gray-600 text-xs items-center justify-center font-medium">P</span>
                                        </div>
                                        <div className="ml-3">
                                          <p className="text-xs text-gray-500 mb-1">Preview Text</p>
                                          <p className="text-sm text-gray-700">{variant.previewText}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-100 mb-3">
                                <BadgePercent className="h-6 w-6 text-purple-600" />
                              </div>
                              <h4 className="text-gray-800 font-medium mb-1">No Variants Added Yet</h4>
                              <p className="text-gray-500 mb-4 text-sm">Create at least one variant to use A/B testing</p>
                            </div>
                          )}
                            
                          <div className="mt-4">
                            <Button
                              type="button"
                              onClick={() => {
                                // Get current form values
                                const formValues = form.getValues();
                                
                                // Generate random ID
                                const variantId = Date.now().toString();
                                
                                // Create new variant
                                const newVariant = {
                                  id: variantId,
                                  name: `Variant ${variants.length + 1}`,
                                  subject: formValues.subject || "",
                                  previewText: formValues.previewText || "",
                                  content: "", // Empty content for now
                                  weight: 50
                                };
                                
                                // Add to variants array
                                setVariants([...variants, newVariant]);
                              }}
                              className="w-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                              variant="outline"
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add New Variant
                            </Button>
                          </div>
                        </div>
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
                        // If A/B testing is enabled, make sure there's at least one variant
                        if (isAbTesting && variants.length === 0) {
                          toast({
                            title: "No Variants Added",
                            description: "Please add at least one variant or disable A/B testing",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        // Move to settings tab
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
                  <h3 className="text-lg font-medium mb-3 text-gray-800">Schedule & Send</h3>
                  <p className="text-sm text-gray-500 mb-5">Choose when to send your campaign</p>
                  
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="p-5">
                      <div className="space-y-5">
                        <div 
                          className={`flex items-start p-3 rounded-lg cursor-pointer ${
                            sendOption === 'now' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => setSendOption('now')}
                        >
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 mt-0.5 ${
                            sendOption === 'now' ? 'bg-purple-600 border-transparent' : 'border-gray-300'
                          }`}>
                            {sendOption === 'now' && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-base font-medium mb-1">Send immediately</h4>
                            <p className="text-sm text-gray-500">Your campaign will be sent right after creation</p>
                          </div>
                        </div>
                        
                        <div 
                          className={`flex items-start p-3 rounded-lg cursor-pointer ${
                            sendOption === 'schedule' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => setSendOption('schedule')}
                        >
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 mt-0.5 ${
                            sendOption === 'schedule' ? 'bg-purple-600 border-transparent' : 'border-gray-300'
                          }`}>
                            {sendOption === 'schedule' && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-base font-medium mb-1">Schedule for later</h4>
                            <p className="text-sm text-gray-500 mb-3">Choose a specific date and time to send your campaign</p>
                            
                            {sendOption === 'schedule' && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-sm text-gray-700 mb-1">Date</p>
                                  <Input
                                    type="date"
                                    value={form.getValues("scheduledDate")}
                                    onChange={(e) => form.setValue("scheduledDate", e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="border-gray-300"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-700 mb-1">Time</p>
                                  <Input
                                    type="time"
                                    value={form.getValues("scheduledTime")}
                                    onChange={(e) => form.setValue("scheduledTime", e.target.value)}
                                    className="border-gray-300"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div 
                          className={`flex items-start p-3 rounded-lg cursor-pointer ${
                            sendOption === 'draft' ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => setSendOption('draft')}
                        >
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 mt-0.5 ${
                            sendOption === 'draft' ? 'bg-purple-600 border-transparent' : 'border-gray-300'
                          }`}>
                            {sendOption === 'draft' && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-base font-medium mb-1">Save as draft</h4>
                            <p className="text-sm text-gray-500">Your campaign will be saved and can be sent later</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg border border-purple-100 p-4 mb-6">
                    <div className="flex">
                      <div className="mr-3 text-purple-500">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-purple-800 mb-1">Campaign Summary</h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li><span className="font-medium">Name:</span> {form.getValues("name")}</li>
                          <li><span className="font-medium">Subject:</span> {form.getValues("subject")}</li>
                          <li><span className="font-medium">Template:</span> {templates.find(t => t.id.toString() === selectedTemplateId)?.name || "None"}</li>
                          <li>
                            <span className="font-medium">Recipients:</span> {
                              selectedLists.length > 0 
                                ? lists
                                    .filter(list => selectedLists.includes(list.id.toString()))
                                    .reduce((sum, list) => sum + list.count, 0)
                                    .toLocaleString()
                                : 0
                            } contacts
                          </li>
                          <li><span className="font-medium">A/B Testing:</span> {isAbTesting ? `Enabled (${variants.length} variants)` : "Disabled"}</li>
                          <li>
                            <span className="font-medium">Delivery:</span> {
                              sendOption === 'now' 
                                ? "Send immediately" 
                                : sendOption === 'schedule' 
                                  ? `Scheduled for ${form.getValues("scheduledDate")} at ${form.getValues("scheduledTime")}` 
                                  : "Save as draft"
                            }
                          </li>
                        </ul>
                      </div>
                    </div>
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