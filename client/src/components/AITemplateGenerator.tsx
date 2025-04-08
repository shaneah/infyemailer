import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
import { 
  Loader2, 
  Code, 
  PencilLine, 
  Sparkles
} from "lucide-react";

interface AITemplateGeneratorProps {
  onTemplateGenerated?: (template: any) => void;
}

interface TemplateData {
  subject: string;
  content: string;
  description: string;
  name: string;
}

export default function AITemplateGenerator({ onTemplateGenerated }: AITemplateGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'editor' | 'code'>('editor');
  const [templateData, setTemplateData] = useState<TemplateData>({
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
  }, [generatingTemplate]);
  
  const generateTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/generate-template', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Update template data with generated template
      const newTemplateData = {
        subject: data.template.subject || '',
        content: data.template.content || '',
        description: data.template.description || '',
        name: data.template.name || ''
      };
      
      setTemplateData(newTemplateData);
      
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
      
      // Switch to code tab to let user see the HTML
      setActiveTab('code');
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
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-full mr-3 shadow-md">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-xl font-semibold">AI Email Template Generator</h4>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'editor' | 'code')} className="mt-2">
            <TabsList className="grid grid-cols-2 w-[200px]">
              <TabsTrigger value="editor">
                <PencilLine className="h-4 w-4 mr-1" /> Editor
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="h-4 w-4 mr-1" /> HTML
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="pt-3">
        <div className="p-0">
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
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    disabled={generateTemplateMutation.isPending || generatingTemplate}
                  >
                    {(generateTemplateMutation.isPending || generatingTemplate) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Template...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate AI Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="code" className="mt-0">
            <div className="bg-zinc-950 rounded-md overflow-hidden border border-zinc-800">
              {templateData.content ? (
                <>
                  <div className="flex justify-between items-center bg-zinc-900 text-white px-4 py-2 border-b border-zinc-800">
                    <div className="flex items-center">
                      <Code className="h-4 w-4 mr-2 text-zinc-400" />
                      <span className="text-sm font-medium">HTML Source</span>
                    </div>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="text-xs hover:bg-zinc-800 text-zinc-300"
                      onClick={() => {
                        if (templateData.content) {
                          navigator.clipboard.writeText(templateData.content);
                          toast({
                            title: "Copied",
                            description: "HTML code copied to clipboard",
                            variant: "default",
                          });
                        }
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                      >
                        <path
                          d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      Copy Code
                    </Button>
                  </div>
                  <pre className="p-4 text-xs text-zinc-300 overflow-auto max-h-[400px]">
                    <code>{templateData.content}</code>
                  </pre>
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="mb-3 text-zinc-400">
                    <Code className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <span className="text-lg font-medium block">No template generated yet</span>
                  </div>
                  <p className="text-sm text-zinc-500 mb-4 max-w-md mx-auto">
                    Fill out the form in the Editor tab and click "Generate AI Template" to create a new email template with AI
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('editor')}
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                  >
                    <PencilLine className="h-4 w-4 mr-2" />
                    Switch to Editor
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </CardContent>
    </Card>
  );
}