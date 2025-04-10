import { useState } from "react";
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
});

interface NewCampaignModalProps {
  onClose: () => void;
}

const NewCampaignModal = ({ onClose }: NewCampaignModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [sendOption, setSendOption] = useState("schedule");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  
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
      const response = await apiRequest("POST", "/api/campaigns", {
        ...values,
        templateId: selectedTemplateId,
        contactLists: selectedLists,
        sendOption
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: "Success",
        description: "Your campaign has been scheduled successfully!",
      });
      onClose();
    },
    onError: (error) => {
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
    createCampaignMutation.mutate(values);
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
  const { data: templates = [] } = useQuery<Template[]>({ 
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    }
  });
  
  // Fetch lists from the server
  const { data: lists = [] } = useQuery<{ id: number | string, name: string, count: number }[]>({ 
    queryKey: ['/api/lists'],
    queryFn: async () => {
      const response = await fetch('/api/lists');
      if (!response.ok) {
        throw new Error('Failed to fetch contact lists');
      }
      const lists = await response.json();
      // Transform the data to include contact counts
      return lists.map((list: any) => ({
        id: list.id,
        name: list.name,
        count: list.contactCount || 0
      }));
    }
  });

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Campaign</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <nav className="px-3 pt-2">
            <div className="nav nav-tabs" role="tablist">
              <button 
                className={`nav-link ${activeTab === 'details' ? 'active' : ''}`} 
                type="button" 
                onClick={() => setActiveTab('details')}
              >
                Campaign Details
              </button>
              <button 
                className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
                type="button" 
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button 
                className={`nav-link ${activeTab === 'audience' ? 'active' : ''}`}
                type="button" 
                onClick={() => setActiveTab('audience')}
              >
                Contact Lists
                {selectedLists.length > 0 && (
                  <span className="badge bg-primary rounded-pill ms-2">{selectedLists.length}</span>
                )}
              </button>
              <button 
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                type="button" 
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </nav>
          <div className="modal-body">
            <div className="tab-content">
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
                        onClick={() => setActiveTab('audience')}
                      >
                        Back to Contact Lists
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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