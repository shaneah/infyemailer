import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, FileEdit, Mail, Send, Users, X } from "lucide-react";
import { apiRequest } from "@/lib/api";

// Campaign schema
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

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialTemplateId?: string | null;
}

const CreateCampaignModal = ({ open, onOpenChange, onSuccess, initialTemplateId = null }: CreateCampaignModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
        const response = await apiRequest("POST", "/api/client-campaigns", {
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
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Invalidating /api/client-campaigns query cache");
      
      // Invalidate multiple queries to ensure everything is refreshed
      queryClient.invalidateQueries({ queryKey: ['/api/client-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns/stats'] });
      
      // Force an immediate refetch to ensure data is up-to-date
      queryClient.refetchQueries({ queryKey: ['/api/client-campaigns'] });
      queryClient.refetchQueries({ queryKey: ['/api/campaigns/stats'] });
      
      // Schedule another refetch after a delay to catch any delayed database updates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/client-campaigns'] });
        queryClient.refetchQueries({ queryKey: ['/api/campaigns/stats'] });
      }, 500);
      
      toast({
        title: "Success",
        description: "Your campaign has been created successfully!",
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
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

  // Fetch templates from the server
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<any[]>({ 
    queryKey: ['/api/templates'],
  });
  
  // Fetch contact lists from the server
  const { data: lists = [], isLoading: isLoadingLists } = useQuery<any[]>({ 
    queryKey: ['/api/lists'],
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
          {/* Header with gradient background */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex justify-between items-center text-white rounded-t-xl z-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create New Campaign</h2>
                <p className="text-xs text-white/80">Design a perfect email campaign</p>
              </div>
            </div>
            <button 
              onClick={() => onOpenChange(false)} 
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
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
                          placeholder="e.g. Check out our amazing deals..."
                        />
                      </FormControl>
                      <div className="form-text">This appears in the email preview</div>
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
                      <div className="form-text">The name that will appear as the sender</div>
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
                          type="email"
                          placeholder="e.g. support@yourcompany.com"
                        />
                      </FormControl>
                      <div className="form-text">Where replies to this email will be sent</div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                      // Create campaign with draft status
                      createCampaignMutation.mutate(
                        {
                          ...form.getValues(),
                          status: 'draft',
                          templateId: selectedTemplateId,
                          contactLists: selectedLists
                        },
                        {
                          onSuccess: (response: CampaignResponse) => {
                            // Navigate to template builder with campaign ID
                            window.location.href = `/client-template-builder/${response.id}`;
                          }
                        }
                      );
                    }}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Create & Proceed to Editor
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateCampaignModal;