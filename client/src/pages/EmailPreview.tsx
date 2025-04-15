import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Mail, 
  Smartphone, 
  Tablet, 
  ArrowLeft, 
  CornerDownRight, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Download,
  Copy,
  Code,
  Eye,
  Settings,
  Pen,
  MailCheck,
  Users,
  Sparkles,
  AlertCircle,
  Layers
} from 'lucide-react';
import InteractiveTemplatePreview from '@/components/InteractiveTemplatePreview';

// Schema for form validation
const previewFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  from: z.string().min(1, 'Sender is required'),
  personalize: z.boolean().default(false),
  templateId: z.number().optional(),
  content: z.string().min(1, 'Content is required')
});

type PreviewFormValues = z.infer<typeof previewFormSchema>;

export default function EmailPreview() {
  const [activeTab, setActiveTab] = useState('preview');
  const [editMode, setEditMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  // Load templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/templates');
      return response.json();
    }
  });
  
  // Form for preview settings
  const form = useForm<PreviewFormValues>({
    resolver: zodResolver(previewFormSchema),
    defaultValues: {
      email: '',
      subject: '',
      from: 'mailer@ingmailer.com',
      personalize: false,
      content: ''
    }
  });
  
  // Update form when selected template changes
  useEffect(() => {
    if (selectedTemplate) {
      form.reset({
        ...form.getValues(),
        subject: selectedTemplate.subject || '',
        templateId: selectedTemplate.id,
        content: selectedTemplate.content || ''
      });
    }
  }, [selectedTemplate, form]);
  
  // Handle template selection
  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
  };
  
  // Send test email
  const handleSendTestEmail = async (values: PreviewFormValues) => {
    setIsSending(true);
    try {
      const response = await apiRequest('POST', `/api/templates/${values.templateId}/test-email`, {
        email: values.email,
        subject: values.subject,
        personalizeContent: values.personalize
      });
      
      toast({
        title: 'Email Sent',
        description: 'Test email has been sent successfully',
        variant: 'default'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test email',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle content changes
  const handleContentChange = (content: string) => {
    form.setValue('content', content);
  };
  
  // Mock personalization data
  const mockPersonaData = {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    company: 'Acme Inc.',
    city: 'New York',
    product: 'Premium Plan',
    date: new Date().toLocaleDateString(),
    amount: '$99.00'
  };

  return (
    <div className="container mx-auto p-6 max-w-[1600px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Interactive Email Preview</h1>
        </div>
        <p className="text-muted-foreground">
          Preview your email templates across different devices and see how personalized content looks
        </p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Template selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Select Template</CardTitle>
              <CardDescription>
                Choose a template to preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="relative">
                  <Input 
                    type="search" 
                    placeholder="Search templates..." 
                    className="pl-9"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground absolute left-3 top-[50%] transform -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
                
                <ScrollArea className="h-[400px] pr-4 -mr-4">
                  {isLoadingTemplates ? (
                    <div className="py-8 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : templates && templates.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      {templates.map((template: any) => (
                        <div
                          key={template.id}
                          className={`p-3 rounded-md cursor-pointer border transition-colors ${
                            selectedTemplate?.id === template.id
                              ? 'border-primary/50 bg-primary/5'
                              : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-sm">{template.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {template.description || 'No description'}
                              </p>
                            </div>
                            {template.metadata?.generatedByAI && (
                              <div className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <p>No templates found</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
          
          {/* Preview settings */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>Preview Settings</CardTitle>
              <CardDescription>
                Configure how you want to preview the email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSendTestEmail)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Line</FormLabel>
                        <FormControl>
                          <Input placeholder="Email subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Address</FormLabel>
                        <FormControl>
                          <Input placeholder="sender@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="personalize"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Personalization</FormLabel>
                          <FormDescription>
                            Show template with personalized content
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedTemplate || isSending}
                  >
                    {isSending ? (
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
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        {/* Right content - Template preview */}
        <div className="lg:col-span-2">
          {!selectedTemplate ? (
            <div className="h-full flex items-center justify-center border rounded-lg bg-gray-50 p-8 text-center">
              <div>
                <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Template Selected</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Select a template from the sidebar to preview how it will look across different devices
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {selectedTemplate.description || 'No description available'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                        {editMode ? (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </>
                        ) : (
                          <>
                            <Pen className="h-4 w-4 mr-1" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {editMode ? (
                    <div className="p-4">
                      <Label htmlFor="template-editor">HTML Content</Label>
                      <Textarea
                        id="template-editor"
                        value={form.watch('content')}
                        onChange={(e) => form.setValue('content', e.target.value)}
                        className="font-mono text-xs min-h-[500px] mt-2"
                      />
                    </div>
                  ) : (
                    <InteractiveTemplatePreview
                      templateContent={form.watch('content')}
                      personalizedData={form.watch('personalize') ? mockPersonaData : undefined}
                      onContentChange={handleContentChange}
                    />
                  )}
                </CardContent>
              </Card>
              
              {/* Analytics and Insights */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Smart Insights</CardTitle>
                  <CardDescription>
                    AI-powered analysis of your email template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                        <div className="text-amber-600 mb-2">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <h4 className="font-medium">Deliverability</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="bg-amber-200 h-2 rounded-full w-full">
                            <div className="bg-amber-500 h-2 rounded-full w-[75%]"></div>
                          </div>
                          <span className="text-sm font-medium text-amber-700">75%</span>
                        </div>
                        <p className="text-xs text-amber-800 mt-2">
                          Consider reducing image count to improve deliverability.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                        <div className="text-green-600 mb-2">
                          <MailCheck className="h-5 w-5" />
                        </div>
                        <h4 className="font-medium">Engagement Prediction</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="bg-green-200 h-2 rounded-full w-full">
                            <div className="bg-green-500 h-2 rounded-full w-[88%]"></div>
                          </div>
                          <span className="text-sm font-medium text-green-700">88%</span>
                        </div>
                        <p className="text-xs text-green-800 mt-2">
                          Strong call-to-action and clear value proposition.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="text-blue-600 mb-2">
                          <Users className="h-5 w-5" />
                        </div>
                        <h4 className="font-medium">Audience Fit</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="bg-blue-200 h-2 rounded-full w-full">
                            <div className="bg-blue-500 h-2 rounded-full w-[92%]"></div>
                          </div>
                          <span className="text-sm font-medium text-blue-700">92%</span>
                        </div>
                        <p className="text-xs text-blue-800 mt-2">
                          Content aligns well with your target audience.
                        </p>
                      </div>
                    </div>
                    
                    <Alert className="bg-gray-50">
                      <Sparkles className="h-4 w-4" />
                      <AlertTitle>AI-Powered Suggestions</AlertTitle>
                      <AlertDescription className="text-sm">
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                          <li>Add more personalization to improve engagement</li>
                          <li>Your subject line could be more compelling</li>
                          <li>Consider adding social media links at the bottom</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}