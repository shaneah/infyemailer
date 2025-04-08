import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Code, 
  Eye, 
  PencilLine, 
  Mail, 
  ClipboardCopy 
} from "lucide-react";

interface AITemplateGeneratorProps {
  onTemplateGenerated?: (template: any) => void;
}

interface PreviewState {
  subject: string;
  content: string;
  description: string;
  name: string;
}

export default function AITemplateGenerator({ onTemplateGenerated }: AITemplateGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'code'>('editor');
  const [previewState, setPreviewState] = useState<PreviewState>({
    subject: '',
    content: '',
    description: '',
    name: ''
  });
  
  const [formData, setFormData] = useState({
    templateType: "newsletter",
    industry: "",
    purpose: "",
    targetAudience: "",
    brandTone: "professional",
    keyPoints: "",
    saveTemplate: true
  });
  
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [autoPreviewEnabled, setAutoPreviewEnabled] = useState(true);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  const templateTypeOptions = [
    { value: "newsletter", label: "Newsletter" },
    { value: "promotional", label: "Promotional" },
    { value: "announcement", label: "Announcement" },
    { value: "welcome", label: "Welcome Email" },
    { value: "invitation", label: "Invitation" },
    { value: "transactional", label: "Transactional" },
    { value: "feedback", label: "Feedback Request" }
  ];
  
  const brandToneOptions = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "formal", label: "Formal" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "motivational", label: "Motivational" },
    { value: "humorous", label: "Humorous" }
  ];

  // Color themes for templates
  const colorThemes = [
    { id: 'green', name: 'Green', primary: '#10b981', secondary: '#d1fae5' },
    { id: 'blue', name: 'Blue', primary: '#3b82f6', secondary: '#dbeafe' },
    { id: 'purple', name: 'Purple', primary: '#8b5cf6', secondary: '#ede9fe' },
    { id: 'red', name: 'Red', primary: '#ef4444', secondary: '#fee2e2' },
    { id: 'orange', name: 'Orange', primary: '#f97316', secondary: '#ffedd5' },
    { id: 'teal', name: 'Teal', primary: '#14b8a6', secondary: '#ccfbf1' },
  ];
  
  const [selectedColorTheme, setSelectedColorTheme] = useState(colorThemes[0]);
  
  // Update preview iframe content whenever preview state changes
  useEffect(() => {
    if (previewIframeRef.current && previewState.content) {
      const doc = previewIframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        
        // Add responsive viewport and bootstrap CSS
        const styledContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${previewState.subject || 'Email Preview'}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
              body { 
                margin: 0; 
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              }
              
              /* Apply selected color theme */
              :root {
                --primary-color: ${selectedColorTheme.primary};
                --secondary-color: ${selectedColorTheme.secondary};
              }
              
              .btn-primary {
                background-color: var(--primary-color) !important;
                border-color: var(--primary-color) !important;
              }
              
              .text-primary {
                color: var(--primary-color) !important;
              }
              
              .bg-primary-light {
                background-color: var(--secondary-color) !important;
              }
              
              .border-primary {
                border-color: var(--primary-color) !important;
              }
            </style>
          </head>
          <body>
            ${previewState.content}
          </body>
          </html>
        `;
        
        doc.write(styledContent);
        doc.close();
      }
    }
  }, [previewState.content, previewState.subject, selectedColorTheme]);

  // Create animated progress indicator for template generation
  useEffect(() => {
    if (generatingTemplate) {
      setGenerationProgress(0);
      
      // Simulate progress with intervals
      progressInterval.current = setInterval(() => {
        setGenerationProgress(prev => {
          // Slow down as we approach 90%
          const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 80 ? 1 : 0.5;
          const newValue = Math.min(prev + increment, 90);
          return newValue;
        });
      }, 300);
      
      // Auto switch to preview tab if enabled
      if (autoPreviewEnabled) {
        setActiveTab('preview');
      }
    } else {
      // Clear interval when done generating
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      
      // Set to 100% when complete
      if (generationProgress > 0) {
        setGenerationProgress(100);
      }
    }
    
    // Cleanup
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [generatingTemplate, autoPreviewEnabled]);
  
  const generateTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/generate-template', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Update preview state with generated template
      setPreviewState({
        subject: data.template.subject || '',
        content: data.template.content || '',
        description: data.template.description || '',
        name: data.template.name || ''
      });
      
      toast({
        title: "Template Generated",
        description: data.message || "Your AI template was successfully generated.",
        variant: "default"
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      
      if (onTemplateGenerated) {
        onTemplateGenerated(data.template);
      }
      
      setGeneratingTemplate(false);
      
      // Auto switch to preview tab if not already there
      if (activeTab !== 'preview' && autoPreviewEnabled) {
        setActiveTab('preview');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate template. Please try again.",
        variant: "destructive"
      });
      setGeneratingTemplate(false);
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingTemplate(true);
    generateTemplateMutation.mutate(formData);
  };

  const handleColorThemeChange = (themeId: string) => {
    const theme = colorThemes.find(t => t.id === themeId);
    if (theme) {
      setSelectedColorTheme(theme);
    }
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center mb-2">
            <div className="bg-green-100 p-2 rounded-full mr-2">
              <div className="h-6 w-6 text-green-600">🤖</div>
            </div>
            <h4 className="text-xl font-medium">AI Email Template Generator</h4>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'editor' | 'preview' | 'code')} className="mt-2">
            <TabsList className="grid grid-cols-3 w-[300px]">
              <TabsTrigger value="editor">
                <PencilLine className="h-4 w-4 mr-1" /> Editor
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-1" /> Preview
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="h-4 w-4 mr-1" /> HTML
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="pt-3">
        <div className="card-body p-0">
          <TabsContent value="editor" className="mt-0">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="templateType">Template Type</Label>
                    <Select 
                      value={formData.templateType}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, templateType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template type" />
                      </SelectTrigger>
                      <SelectContent>
                        {templateTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input 
                      id="industry" 
                      name="industry" 
                      placeholder="e.g., e-commerce, healthcare, technology"
                      value={formData.industry}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Input 
                      id="purpose" 
                      name="purpose" 
                      placeholder="e.g., announce a sale, share monthly updates"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input 
                      id="targetAudience" 
                      name="targetAudience" 
                      placeholder="e.g., existing customers aged 25-45"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="brandTone">Brand Tone</Label>
                    <Select 
                      value={formData.brandTone}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, brandTone: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandToneOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="space-y-2">
                    <Label>Color Theme</Label>
                    <div className="flex flex-wrap gap-2">
                      {colorThemes.map(theme => (
                        <div 
                          key={theme.id}
                          onClick={() => handleColorThemeChange(theme.id)}
                          style={{ 
                            backgroundColor: theme.secondary, 
                            border: `2px solid ${selectedColorTheme.id === theme.id ? theme.primary : 'transparent'}`,
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title={theme.name}
                          className="transition-all hover:scale-110"
                        >
                          <div style={{ 
                            width: '15px', 
                            height: '15px', 
                            borderRadius: '50%', 
                            backgroundColor: theme.primary 
                          }}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="keyPoints">Key Points to Include (optional)</Label>
                    <Textarea 
                      id="keyPoints" 
                      name="keyPoints" 
                      placeholder="e.g., limited time offer, new features, special benefits"
                      rows={3}
                      value={formData.keyPoints}
                      onChange={handleInputChange}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox 
                      id="saveTemplate" 
                      checked={formData.saveTemplate}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, saveTemplate: checked === true }))
                      }
                    />
                    <Label htmlFor="saveTemplate" className="text-sm font-normal cursor-pointer">
                      Save template after generation
                    </Label>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox 
                      id="autoPreview"
                      checked={autoPreviewEnabled}
                      onCheckedChange={(checked) => setAutoPreviewEnabled(checked === true)}
                    />
                    <Label htmlFor="autoPreview" className="text-sm font-normal cursor-pointer">
                      Auto-switch to preview when generating
                    </Label>
                  </div>
                </div>
                
                <div className="col-span-2 mt-3">
                  {generatingTemplate && (
                    <div className="mb-3">
                      <Progress
                        value={generationProgress}
                        className="h-2 w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Generating email template...</span>
                        <span className="text-sm text-muted-foreground">{Math.round(generationProgress)}%</span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={generateTemplateMutation.isPending || generatingTemplate}
                  >
                    {(generateTemplateMutation.isPending || generatingTemplate) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Template...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✨</span>
                        Generate AI Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className="preview-container bg-gray-50 rounded-md p-4">
              {previewState.content ? (
                <>
                  <div className="mb-3 pb-2 border-b">
                    <h5 className="text-lg font-semibold mb-1">{previewState.name}</h5>
                    <div className="flex items-center mb-2">
                      <Badge className="mr-2">Subject</Badge>
                      <span>{previewState.subject}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{previewState.description}</p>
                  </div>
                  <div className="aspect-video min-h-[500px] bg-white rounded-md shadow-sm">
                    <iframe 
                      ref={previewIframeRef}
                      title="Email Template Preview" 
                      className="w-full h-full border-0 rounded-md"
                    ></iframe>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  {generatingTemplate ? (
                    <div>
                      <div className="mb-3 flex justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                      </div>
                      <h5 className="text-lg font-medium">Creating your email template...</h5>
                      <p className="text-muted-foreground mt-1">This may take a few moments</p>
                      <div className="mt-4 w-full max-w-md mx-auto">
                        <Progress
                          value={generationProgress}
                          className="h-2 w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                      </div>
                      <h5 className="text-lg font-medium">No Email Template Generated Yet</h5>
                      <p className="text-muted-foreground mt-1">Go to the Editor tab and fill out the form to generate an AI-powered email template.</p>
                      <Button 
                        variant="outline"
                        className="mt-4" 
                        onClick={() => setActiveTab('editor')}
                      >
                        Go to Editor
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="mt-0">
            <div className="code-viewer bg-zinc-950 rounded-md">
              {previewState.content ? (
                <>
                  <div className="flex justify-between items-center bg-zinc-900 text-white px-4 py-2 border-b border-zinc-800">
                    <div>
                      <span className="text-sm">HTML Source</span>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent border-zinc-700 hover:bg-zinc-800 text-white"
                      onClick={() => {
                        navigator.clipboard.writeText(previewState.content);
                        toast({
                          title: "Copied!",
                          description: "HTML code copied to clipboard",
                          variant: "default"
                        });
                      }}
                    >
                      <ClipboardCopy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <pre className="m-0 p-4 text-white overflow-auto" style={{ 
                    maxHeight: '500px', 
                    fontSize: '0.875rem',
                    backgroundColor: '#121212'
                  }}>
                    <code>{previewState.content}</code>
                  </pre>
                </>
              ) : (
                <div className="text-center py-12 text-white">
                  <Code className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
                  <h5 className="text-lg font-medium">No HTML Code Available</h5>
                  <p className="text-zinc-400 mt-1">Generate a template first to view its HTML code.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </CardContent>
    </Card>
  );
}