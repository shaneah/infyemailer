import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Campaign</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="d-flex">
            <div className="modal-body flex-grow-1">
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
                  
                  <div className="mt-4 d-flex justify-content-end">
                    <button 
                      type="button" 
                      className="btn btn-primary"
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
                      Next: Content
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'content' && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Select a Template</label>
                    <div className="row row-cols-1 row-cols-md-3 g-3">
                      {templates.map((template: Template) => (
                        <div className="col" key={template.id}>
                          <div 
                            className={`card template-card ${selectedTemplateId === template.id.toString() ? 'selected' : ''}`}
                            onClick={() => setSelectedTemplateId(template.id.toString())}
                          >
                            <div 
                              className="card-img-top bg-light d-flex justify-content-center align-items-center" 
                              style={{ height: '120px' }}
                            >
                              <i className={`bi bi-file-earmark-text fs-1 text-${Number(template.id) === 1 ? "primary" : Number(template.id) === 2 ? "danger" : "success"}`}></i>
                            </div>
                            <div className="card-body">
                              <h6 className="card-title">{template.name}</h6>
                              <p className="card-text small text-muted">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setActiveTab('details')}
                    >
                      Back to Details
                    </button>
                    
                    <div>
                      <button 
                        type="button" 
                        className="btn btn-primary me-2"
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
                        Next: Contact Lists
                      </button>
                      
                      <button 
                        type="button" 
                        className="btn btn-outline-primary"
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
                        Create & Proceed to Editor
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'audience' && (
                <div>
                  {console.log("Audience tab rendered, available lists:", lists)}
                  <div className="mb-4">
                    <label className="form-label">Select Contact List(s)</label>
                    <p className="text-muted mb-3">Choose one or more contact lists for your campaign</p>
                    
                    <div className="card mb-3">
                      <div className="card-body p-0">
                        <div className="list-group list-group-flush">
                          {lists.map((list) => (
                            <div key={list.id} className="list-group-item">
                              <div className="form-check">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  id={`list-${list.id}`} 
                                  value={list.id}
                                  checked={selectedLists.includes(list.id.toString())}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedLists([...selectedLists, list.id.toString()]);
                                    } else {
                                      setSelectedLists(selectedLists.filter(id => id !== list.id.toString()));
                                    }
                                  }}
                                />
                                <label className="form-check-label d-flex justify-content-between align-items-center w-100" htmlFor={`list-${list.id}`}>
                                  <span>{list.name}</span>
                                  <span className="badge bg-primary rounded-pill">{list.count.toLocaleString()} contacts</span>
                                </label>
                              </div>
                            </div>
                          ))}
                          
                          {lists.length === 0 && (
                            <div className="list-group-item text-center py-4">
                              <p className="mb-1">No contact lists available</p>
                              <a href="/contacts" className="btn btn-sm btn-outline-primary mt-2">Create a contact list</a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <a href="/contacts" className="btn btn-outline-secondary btn-sm">
                      <i className="bi bi-plus-circle me-1"></i>
                      Create a new contact list
                    </a>
                    
                    <div className="mt-4 d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setActiveTab('content')}
                      >
                        Back to Content
                      </button>
                      
                      <button 
                        type="button" 
                        className="btn btn-primary"
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
                          setActiveTab('ab-testing');
                        }}
                      >
                        Next: A/B Testing
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'ab-testing' && (
                <div>
                  <div className="mb-4">
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="abTestingSwitch"
                        checked={isAbTesting}
                        onChange={() => setIsAbTesting(!isAbTesting)}
                      />
                      <label className="form-check-label fw-medium" htmlFor="abTestingSwitch">
                        Enable A/B Testing
                      </label>
                    </div>

                    {isAbTesting && (
                      <>
                        <div className="alert alert-info mb-4">
                          <div className="d-flex">
                            <div className="me-3 fs-5"><i className="bi bi-info-circle-fill"></i></div>
                            <div>
                              <p className="mb-1 fw-bold">How A/B Testing Works</p>
                              <p className="small mb-0">Create multiple variants of your email with different subjects, content, or preview text. InfyMailer will automatically distribute these variants to your audience and track which performs better, allowing you to determine the winning variant based on open rates, click rates, and conversions.</p>
                            </div>
                          </div>
                        </div>

                        <div className="card mb-4 border-0 shadow-sm">
                          <div className="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">Email Variants</h5>
                            <span className="badge bg-white text-primary">{variants.length} variant{variants.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="card-body">
                            {variants.length > 0 ? (
                              <div className="mb-3">
                                {variants.map((variant, index) => (
                                  <div key={variant.id} className="card mb-3 border shadow-sm">
                                    <div className="card-header bg-gradient-light d-flex justify-content-between align-items-center py-2">
                                      <h6 className="mb-0 fw-bold">Variant {index + 1}: {variant.name}</h6>
                                      <div>
                                        <button 
                                          type="button" 
                                          className="btn btn-sm btn-outline-primary me-2"
                                          onClick={() => {
                                            // Implement edit variant functionality
                                            // For now, we'll just open a simple prompt to rename
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
                                        </button>
                                        <button 
                                          type="button" 
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => {
                                            setVariants(variants.filter(v => v.id !== variant.id));
                                          }}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                    <div className="card-body">
                                      <div className="row g-3">
                                        <div className="col-md-12">
                                          <div className="d-flex align-items-center">
                                            <div className="badge bg-primary me-2 fs-6 px-2">A</div>
                                            <div>
                                              <div className="text-muted small mb-1">Subject Line</div>
                                              <div className="fw-medium">{variant.subject}</div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-md-12">
                                          <div className="d-flex align-items-center">
                                            <div className="badge bg-secondary me-2 fs-6 px-2">P</div>
                                            <div>
                                              <div className="text-muted small mb-1">Preview Text</div>
                                              <div className="fw-medium">{variant.previewText}</div>
                                            </div>
                                          </div>
                                        </div>
                                        {index === 0 && (
                                          <div className="col-12">
                                            <div className="alert alert-success mb-0 py-2">
                                              <div className="d-flex align-items-center">
                                                <div className="me-2"><i className="bi bi-star-fill"></i></div>
                                                <div className="small">Control variant (original email)</div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center p-4 border border-dashed rounded mb-3">
                                <div className="text-muted mb-3"><i className="bi bi-envelope-plus fs-2"></i></div>
                                <p className="text-muted mb-0">No variants created yet. Add at least one variant to use A/B testing.</p>
                              </div>
                            )}

                            <button 
                              type="button" 
                              className="btn btn-primary w-100 mb-3"
                              onClick={() => {
                                // Clone the template as a new variant
                                const selectedTemplate = templates.find(t => t.id.toString() === selectedTemplateId);
                                
                                if (!selectedTemplate) {
                                  toast({
                                    title: "Template Not Found",
                                    description: "Please select a template first",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                                
                                const newVariant = {
                                  id: `variant-${Date.now()}`,
                                  name: `Variant ${variants.length + 1}`,
                                  subject: form.getValues('subject') || 'New Subject',
                                  previewText: form.getValues('previewText') || 'Preview text for this variant',
                                  content: selectedTemplate.content
                                };
                                
                                setVariants([...variants, newVariant]);
                              }}
                            >
                              <i className="bi bi-plus-circle me-2"></i> Add New Variant
                            </button>
                          </div>
                        </div>
                        
                        {variants.length > 0 && (
                          <div className="card mb-4 border-0 shadow-sm">
                            <div className="card-header bg-gradient-primary text-white">
                              <h5 className="card-title mb-0">Test Settings</h5>
                            </div>
                            <div className="card-body">
                              <div className="form-group mb-3">
                                <label className="form-label fw-medium">Distribution Method</label>
                                <select className="form-select mb-2">
                                  <option value="even">Even Split (Default)</option>
                                  <option value="percent">Custom Percentages</option>
                                </select>
                                <div className="form-text text-muted small">
                                  Even Split distributes your audience equally across all variants. Custom Percentages allows you to set specific weights for each variant.
                                </div>
                              </div>
                              
                              <div className="form-group mb-3">
                                <label className="form-label fw-medium">Success Metric</label>
                                <select className="form-select mb-2">
                                  <option value="open_rate">Open Rate (Default)</option>
                                  <option value="click_rate">Click Rate</option>
                                  <option value="conversion">Conversion Rate</option>
                                </select>
                                <div className="form-text text-muted small">
                                  Select which metric to use when determining the winning variant.
                                </div>
                              </div>
                              
                              <div className="form-group">
                                <label className="form-label fw-medium">Winner Selection</label>
                                <div className="form-check mb-2">
                                  <input className="form-check-input" type="radio" name="winnerSelection" id="automatic" checked />
                                  <label className="form-check-label" htmlFor="automatic">
                                    Automatic (After 48 hours)
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input className="form-check-input" type="radio" name="winnerSelection" id="manual" />
                                  <label className="form-check-label" htmlFor="manual">
                                    Manual Selection
                                  </label>
                                </div>
                                <div className="form-text text-muted small">
                                  Choose whether InfyMailer should automatically select the winning variant based on the success metric, or if you want to choose manually.
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="text-end">
                    <div className="d-flex justify-content-between">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={() => setActiveTab('audience')}
                      >
                        Back
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        onClick={() => {
                          if (isAbTesting && variants.length === 0) {
                            toast({
                              title: "Missing Variants",
                              description: "Please add at least one variant or disable A/B testing",
                              variant: "destructive"
                            });
                            return;
                          }
                          
                          // Go to settings tab
                          setActiveTab('settings');
                        }}
                      >
                        Next: Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <Form {...form}>
                    <form>
                      <div className="mb-3">
                        <label className="form-label">When to Send</label>
                        <div className="form-check mb-2">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="sendOptions" 
                            id="sendNow" 
                            checked={sendOption === 'now'}
                            onChange={() => setSendOption('now')}
                          />
                          <label className="form-check-label" htmlFor="sendNow">
                            Send immediately
                          </label>
                        </div>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="sendOptions" 
                            id="scheduleDate" 
                            checked={sendOption === 'schedule'}
                            onChange={() => setSendOption('schedule')}
                          />
                          <label className="form-check-label" htmlFor="scheduleDate">
                            Schedule for later
                          </label>
                        </div>
                      </div>
                      
                      {sendOption === 'schedule' && (
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <FormField
                              control={form.control}
                              name="scheduledDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="scheduleDate">Date</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      id="scheduleDate" 
                                      type="date"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-md-6">
                            <FormField
                              control={form.control}
                              name="scheduledTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="scheduleTime">Time</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      id="scheduleTime" 
                                      type="time"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </form>
                  </Form>
                  
                  <div className="mb-3">
                    <label className="form-label">Tracking Options</label>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="trackOpens" defaultChecked />
                      <label className="form-check-label" htmlFor="trackOpens">
                        Track opens
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input className="form-check-input" type="checkbox" id="trackClicks" defaultChecked />
                      <label className="form-check-label" htmlFor="trackClicks">
                        Track link clicks
                      </label>
                    </div>
                    <div className="form-check mb-4">
                      <input className="form-check-input" type="checkbox" id="googleAnalytics" />
                      <label className="form-check-label" htmlFor="googleAnalytics">
                        Add Google Analytics parameters
                      </label>
                    </div>
                    
                    <div className="mt-4 d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setActiveTab('ab-testing')}
                      >
                        Back to A/B Testing
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <nav className="px-3 pt-4 border-start" style={{ minWidth: '180px' }}>
              <div className="nav flex-column nav-pills" role="tablist">
                <button 
                  className={`nav-link ${activeTab === 'details' ? 'active' : ''} text-start mb-2`} 
                  type="button" 
                  onClick={() => setActiveTab('details')}
                >
                  Campaign Details
                </button>
                <button 
                  className={`nav-link ${activeTab === 'content' ? 'active' : ''} text-start mb-2`}
                  type="button" 
                  onClick={() => setActiveTab('content')}
                >
                  Content
                </button>
                <button 
                  className={`nav-link ${activeTab === 'audience' ? 'active' : ''} text-start mb-2 d-flex justify-content-between align-items-center`}
                  type="button" 
                  onClick={() => setActiveTab('audience')}
                >
                  <span>Contact Lists</span>
                  {selectedLists.length > 0 && (
                    <span className="badge bg-primary rounded-pill ms-2">{selectedLists.length}</span>
                  )}
                </button>
                <button 
                  className={`nav-link ${activeTab === 'ab-testing' ? 'active' : ''} text-start mb-2 d-flex justify-content-between align-items-center`}
                  type="button" 
                  onClick={() => setActiveTab('ab-testing')}
                >
                  <span>A/B Testing</span>
                  {isAbTesting && (
                    <span className="badge bg-success rounded-pill ms-2">{variants.length}</span>
                  )}
                </button>
                <button 
                  className={`nav-link ${activeTab === 'settings' ? 'active' : ''} text-start`}
                  type="button" 
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              </div>
            </nav>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending ? 'Scheduling...' : 'Schedule Campaign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCampaignModal;