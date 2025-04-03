import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
});

interface NewCampaignModalProps {
  onClose: () => void;
}

const NewCampaignModal = ({ onClose }: NewCampaignModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [sendOption, setSendOption] = useState("schedule");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [audienceOption, setAudienceOption] = useState("all");
  
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
  
  const createCampaignMutation = useMutation({
    mutationFn: (values: z.infer<typeof campaignSchema>) => {
      return apiRequest("POST", "/api/campaigns", {
        ...values,
        templateId: selectedTemplateId,
        audienceOption,
        sendOption
      });
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
    createCampaignMutation.mutate(values);
  };
  
  const templates = [
    { id: "1", name: "Newsletter", description: "Standard newsletter layout", image: "newsletter" },
    { id: "2", name: "Promotional", description: "For sales and offers", image: "promotional" },
    { id: "3", name: "Welcome", description: "For new subscribers", image: "welcome" },
  ];
  
  const lists = [
    { id: "1", name: "Newsletter Subscribers", count: 18742 },
    { id: "2", name: "Product Updates", count: 12103 },
    { id: "3", name: "New Customers", count: 4928 },
    { id: "4", name: "VIP Members", count: 1254 },
  ];

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Campaign</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <nav>
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
                    Audience
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
              <div className="tab-content pt-3">
                {activeTab === 'details' && (
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
                )}
                
                {activeTab === 'content' && (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">Select a Template</label>
                      <div className="row row-cols-1 row-cols-md-3 g-3">
                        {templates.map((template) => (
                          <div className="col" key={template.id}>
                            <div 
                              className={`card template-card ${selectedTemplateId === template.id ? 'selected' : ''}`}
                              onClick={() => setSelectedTemplateId(template.id)}
                            >
                              <div 
                                className="card-img-top bg-light d-flex justify-content-center align-items-center" 
                                style={{ height: '120px' }}
                              >
                                <i className={`bi bi-file-earmark-text fs-1 text-${template.id === "1" ? "primary" : template.id === "2" ? "danger" : "success"}`}></i>
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
                    <div className="mt-4">
                      <a href="#" className="btn btn-outline-primary">Edit in Visual Editor</a>
                      <a href="#" className="btn btn-outline-secondary ms-2">Edit HTML Code</a>
                    </div>
                  </div>
                )}
                
                {activeTab === 'audience' && (
                  <div>
                    <div className="mb-3">
                      <label className="form-label">Select Recipients</label>
                      <div className="form-check mb-2">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="audienceOptions" 
                          id="allSubscribers" 
                          checked={audienceOption === 'all'} 
                          onChange={() => setAudienceOption('all')}
                        />
                        <label className="form-check-label" htmlFor="allSubscribers">
                          All Subscribers (24,581)
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input 
                          className="form-check-input" 
                          type="radio" 
                          name="audienceOptions" 
                          id="specificLists" 
                          checked={audienceOption === 'lists'}
                          onChange={() => setAudienceOption('lists')}
                        />
                        <label className="form-check-label" htmlFor="specificLists">
                          Specific Lists
                        </label>
                      </div>
                    </div>
                    <div className="mb-3">
                      <select 
                        className="form-select" 
                        multiple 
                        aria-label="Select lists" 
                        disabled={audienceOption !== 'lists'}
                      >
                        {lists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.name} ({list.count.toLocaleString()})
                          </option>
                        ))}
                      </select>
                      <div className="form-text">Hold Ctrl/Cmd to select multiple lists</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Segment Recipients (Optional)</label>
                      <div className="card">
                        <div className="card-body">
                          <div className="mb-3">
                            <select className="form-select">
                              <option selected>Select condition</option>
                              <option>Opened any campaign</option>
                              <option>Clicked any link</option>
                              <option>Purchased in the last 30 days</option>
                              <option>Location</option>
                              <option>Subscription date</option>
                            </select>
                          </div>
                          <button className="btn btn-sm btn-outline-primary">Add Condition</button>
                        </div>
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
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="googleAnalytics" />
                        <label className="form-check-label" htmlFor="googleAnalytics">
                          Add Google Analytics parameters
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
