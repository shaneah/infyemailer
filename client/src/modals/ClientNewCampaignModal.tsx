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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Users, FileText, FileEdit, BadgePercent, Settings, X, Mail } from "lucide-react";

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

interface ClientNewCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | number;
}

const steps = [
  { key: 'details', label: 'Campaign Details', icon: FileText },
  { key: 'template', label: 'Template', icon: FileEdit },
  { key: 'audience', label: 'Audience', icon: Users },
  { key: 'testing', label: 'A/B Testing', icon: BadgePercent },
  { key: 'schedule', label: 'Schedule & Send', icon: Settings },
];

export default function ClientNewCampaignModal({ open, onOpenChange, clientId }: ClientNewCampaignModalProps) {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [isAbTesting, setIsAbTesting] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);

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

  // Fetch client templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<any[]>({
    queryKey: ['/api/client/' + clientId + '/templates'],
    queryFn: async () => {
      const res = await fetch(`/api/client/${clientId}/templates`);
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    }
  });

  // Fetch client contact lists
  const { data: lists = [], isLoading: isLoadingLists } = useQuery<any[]>({
    queryKey: ['/api/clients/' + clientId + '/lists'],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${clientId}/lists`);
      if (!res.ok) throw new Error('Failed to fetch lists');
      return res.json();
    }
  });

  // Campaign creation mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await apiRequest("POST", `/api/client/${clientId}/campaigns`, {
        ...values,
        templateId: selectedTemplateId,
        contactLists: selectedLists,
        isAbTest: isAbTesting,
        variants,
      });
      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Campaign created successfully!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (values: any) => {
    createCampaignMutation.mutate(values);
  };

  // Log for debugging
  useEffect(() => {
    console.log('ClientId:', clientId, 'Templates:', templates, 'Lists:', lists);
  }, [clientId, templates, lists]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogDescription>
          Follow the steps to create your campaign. Only templates and contact lists related to this client will be shown.
        </DialogDescription>
        <div className="flex">
          {/* Side navigation */}
          <div className="w-48 border-r pr-4">
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <button
                  key={step.key}
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-sm ${activeStep === idx ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-indigo-100'}`}
                  onClick={() => setActiveStep(idx)}
                  type="button"
                >
                  <step.icon className="h-4 w-4 mr-2" />
                  {step.label}
                </button>
              ))}
            </div>
          </div>
          {/* Main content */}
          <div className="flex-1 pl-6">
            {activeStep === 0 && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleNext)}>
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem className="mb-3">
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Summer Sale" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem className="mb-3">
                      <FormLabel>Email Subject</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Don't Miss Out!" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="previewText" render={({ field }) => (
                    <FormItem className="mb-3">
                      <FormLabel>Preview Text</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Get up to 50% off..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="senderName" render={({ field }) => (
                    <FormItem className="mb-3">
                      <FormLabel>Sender Name</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Your Company" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="replyToEmail" render={({ field }) => (
                    <FormItem className="mb-3">
                      <FormLabel>Reply-to Email</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. support@yourcompany.com" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-between mt-6">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit">Next</Button>
                  </div>
                </form>
              </Form>
            )}
            {activeStep === 1 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Select a Template</h2>
                {isLoadingTemplates ? (
                  <div>Loading templates...</div>
                ) : templates.length === 0 ? (
                  <div className="text-gray-500">No templates found for this client. Please create a template first.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((tpl: any) => (
                      <div key={tpl.id} className={`border rounded-lg p-4 cursor-pointer ${selectedTemplateId === tpl.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`} onClick={() => setSelectedTemplateId(tpl.id)}>
                        <div className="font-medium">{tpl.name}</div>
                        <div className="text-xs text-gray-500">{tpl.description}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                  <Button type="button" onClick={handleNext} disabled={!selectedTemplateId}>Next</Button>
                </div>
              </div>
            )}
            {activeStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Select Contact Lists</h2>
                {isLoadingLists ? (
                  <div>Loading lists...</div>
                ) : lists.length === 0 ? (
                  <div className="text-gray-500">No contact lists found for this client. Please create a contact list first.</div>
                ) : (
                  <div className="space-y-2">
                    {lists.map((list: any) => (
                      <label key={list.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedLists.includes(list.id)} onChange={e => {
                          if (e.target.checked) setSelectedLists([...selectedLists, list.id]);
                          else setSelectedLists(selectedLists.filter(id => id !== list.id));
                        }} />
                        <span>{list.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                  <Button type="button" onClick={handleNext} disabled={selectedLists.length === 0}>Next</Button>
                </div>
              </div>
            )}
            {activeStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">A/B Testing</h2>
                <label className="flex items-center gap-2 mb-4">
                  <input type="checkbox" checked={isAbTesting} onChange={e => setIsAbTesting(e.target.checked)} />
                  Enable A/B Testing
                </label>
                {isAbTesting && (
                  <div className="space-y-2">
                    {/* Simple variant management for demo; can be expanded */}
                    <Button type="button" onClick={() => setVariants([...variants, { name: '', subject: '', previewText: '', content: '', weight: 50 }])}>Add Variant</Button>
                    {variants.map((variant, idx) => (
                      <div key={idx} className="border rounded p-2 flex flex-col gap-2 mt-2">
                        <Input placeholder="Variant Name" value={variant.name} onChange={e => {
                          const v = [...variants]; v[idx].name = e.target.value; setVariants(v);
                        }} />
                        <Input placeholder="Subject" value={variant.subject} onChange={e => {
                          const v = [...variants]; v[idx].subject = e.target.value; setVariants(v);
                        }} />
                        <Input placeholder="Preview Text" value={variant.previewText} onChange={e => {
                          const v = [...variants]; v[idx].previewText = e.target.value; setVariants(v);
                        }} />
                        <Input placeholder="Content (optional)" value={variant.content} onChange={e => {
                          const v = [...variants]; v[idx].content = e.target.value; setVariants(v);
                        }} />
                        <Input type="number" placeholder="Weight" value={variant.weight} onChange={e => {
                          const v = [...variants]; v[idx].weight = Number(e.target.value); setVariants(v);
                        }} />
                        <Button type="button" variant="destructive" onClick={() => setVariants(variants.filter((_, i) => i !== idx))}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                  <Button type="button" onClick={handleNext}>Next</Button>
                </div>
              </div>
            )}
            {activeStep === 4 && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <h2 className="text-lg font-semibold mb-4">Schedule & Send</h2>
                  <FormField control={form.control} name="scheduledDate" render={({ field }) => (
                    <FormItem className="mb-3">
                      <FormLabel>Scheduled Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="scheduledTime" render={({ field }) => (
                    <FormItem className="mb-3">
                      <FormLabel>Scheduled Time</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-between mt-6">
                    <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                    <Button type="submit">Create Campaign</Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 