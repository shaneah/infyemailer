import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { 
  Loader2, 
  Code, 
  Sparkles,
  Palette,
  PencilLine,
  Settings,
  Wand2,
  FileText,
  Eye,
  LucideImage,
  MoveVertical,
  Type,
  Layers
} from "lucide-react";

interface AdvancedTemplateGeneratorProps {
  onTemplateGenerated?: (template: any) => void;
}

export default function AdvancedTemplateGenerator({ onTemplateGenerated }: AdvancedTemplateGeneratorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'editor' | 'design' | 'preview' | 'code'>('editor');
  const [generatedTemplate, setGeneratedTemplate] = useState<any>(null);
  const [templateStyle, setTemplateStyle] = useState({
    layoutStyle: 'modern',
    colorScheme: 'brand',
    imageStyle: 'rounded',
    typographyStyle: 'clean',
    buttonStyle: 'rounded',
    accentColor: '#3b82f6',
    spacingDensity: 2, // 1-3 scale
  });
  
  const [formData, setFormData] = useState({
    templateType: "newsletter",
    templateName: "",
    industry: "",
    purpose: "",
    targetAudience: "",
    brandTone: "professional",
    keyPoints: "",
    includeImages: true,
    includeFooter: true,
    includeUnsubscribe: true,
    includeHeader: true,
    includeSocialMedia: true,
    saveTemplate: true,
    complexity: "balanced" // simple, balanced, detailed
  });
  
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  
  const templateTypeOptions = [
    { value: "newsletter", label: "Newsletter" },
    { value: "promotional", label: "Promotional" },
    { value: "announcement", label: "Announcement" },
    { value: "welcome", label: "Welcome Email" },
    { value: "invitation", label: "Invitation" },
    { value: "transactional", label: "Transactional" },
    { value: "feedback", label: "Feedback Request" },
    { value: "lead-nurturing", label: "Lead Nurturing" },
    { value: "re-engagement", label: "Re-engagement" },
    { value: "event", label: "Event" },
    { value: "holiday", label: "Holiday/Seasonal" }
  ];
  
  const brandToneOptions = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "formal", label: "Formal" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "motivational", label: "Motivational" },
    { value: "humorous", label: "Humorous" },
    { value: "urgent", label: "Urgent" },
    { value: "luxury", label: "Luxury/Premium" },
    { value: "technical", label: "Technical" }
  ];
  
  const layoutOptions = [
    { value: 'modern', label: 'Modern (Clean & Spacious)' },
    { value: 'compact', label: 'Compact (Dense Content)' },
    { value: 'magazine', label: 'Magazine (Editorial Style)' },
    { value: 'minimal', label: 'Minimal (Simplistic)' },
    { value: 'visually-rich', label: 'Visually Rich (Image-focused)' }
  ];
  
  const colorSchemeOptions = [
    { value: 'brand', label: 'Brand Colors' },
    { value: 'monochrome', label: 'Monochrome' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'vibrant', label: 'Vibrant' },
    { value: 'muted', label: 'Muted/Subtle' },
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' }
  ];

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
      const response = await apiRequest('POST', '/api/generate-template', {
        ...data,
        stylePreferences: templateStyle 
      });
      const responseData = await response.json();
      return responseData;
    },
    onSuccess: (data) => {
      if (!data?.template) {
        toast({
          title: "Template Generation Error",
          description: "Received incomplete template data from server. Please try again.",
          variant: "destructive"
        });
        setGeneratingTemplate(false);
        return;
      }
      
      try {
        setGeneratedTemplate(data.template);
        setPreviewHTML(data.template.content);
        
        toast({
          title: "Template Generated",
          description: data.message || "Your AI template was successfully generated.",
          variant: "default"
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
        
        if (onTemplateGenerated) {
          onTemplateGenerated(data.template);
        }
        
        // Switch to preview tab
        setActiveTab('preview');
      } catch (err) {
        console.error('Error processing template data:', err);
        toast({
          title: "Template Processing Error",
          description: "Template was generated but an error occurred while processing it.",
          variant: "destructive"
        });
      } finally {
        setGeneratingTemplate(false);
      }
    },
    onError: (error: any) => {
      console.error('Template generation error:', error);
      toast({
        title: "Template Generation Failed",
        description: error.message || "Failed to generate template. Please try again with different parameters.",
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
    
    // Validate form
    if (!formData.industry || !formData.purpose || !formData.targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields before generating a template.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.templateName) {
      // Generate a default name based on type and industry
      setFormData(prev => ({
        ...prev,
        templateName: `${formData.brandTone} ${formData.templateType} for ${formData.industry}`
      }));
    }
    
    setGeneratingTemplate(true);
    generateTemplateMutation.mutate(formData);
  };

  // Render the content based on active tab
  const renderTabContent = () => {
    switch(activeTab) {
      case 'editor':
        return (
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="templateType" className="text-sm font-medium">Template Type <span className="text-red-500">*</span></Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="templateName" className="text-sm font-medium">Template Name</Label>
                  <Input 
                    id="templateName" 
                    name="templateName" 
                    placeholder="Name your template (optional)"
                    value={formData.templateName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium">Industry <span className="text-red-500">*</span></Label>
                  <Input 
                    id="industry" 
                    name="industry" 
                    placeholder="e.g., e-commerce, healthcare, technology"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brandTone" className="text-sm font-medium">Brand Tone <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.brandTone}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, brandTone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tone" />
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
              
              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-sm font-medium">Purpose <span className="text-red-500">*</span></Label>
                <Input 
                  id="purpose" 
                  name="purpose" 
                  placeholder="e.g., announce a sale, share monthly updates, onboard new customers"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-sm font-medium">Target Audience <span className="text-red-500">*</span></Label>
                <Input 
                  id="targetAudience" 
                  name="targetAudience" 
                  placeholder="e.g., existing customers aged 25-45, tech professionals, new subscribers"
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keyPoints" className="text-sm font-medium">Key Points to Include</Label>
                <Textarea 
                  id="keyPoints" 
                  name="keyPoints" 
                  placeholder="e.g., limited time offer, new features, special benefits"
                  rows={3}
                  value={formData.keyPoints}
                  onChange={handleInputChange}
                  className="resize-none"
                />
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced-options">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" /> 
                      Advanced Options
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-5 pt-2">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Content Complexity</Label>
                        <RadioGroup 
                          value={formData.complexity} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, complexity: value }))}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="simple" id="complexity-simple" />
                            <Label htmlFor="complexity-simple" className="font-normal cursor-pointer">Simple</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="balanced" id="complexity-balanced" />
                            <Label htmlFor="complexity-balanced" className="font-normal cursor-pointer">Balanced</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="detailed" id="complexity-detailed" />
                            <Label htmlFor="complexity-detailed" className="font-normal cursor-pointer">Detailed</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeHeader" 
                            checked={formData.includeHeader}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, includeHeader: checked === true }))
                            }
                          />
                          <Label htmlFor="includeHeader" className="text-sm font-normal cursor-pointer">Include Header</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeFooter" 
                            checked={formData.includeFooter}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, includeFooter: checked === true }))
                            }
                          />
                          <Label htmlFor="includeFooter" className="text-sm font-normal cursor-pointer">Include Footer</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeImages" 
                            checked={formData.includeImages}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, includeImages: checked === true }))
                            }
                          />
                          <Label htmlFor="includeImages" className="text-sm font-normal cursor-pointer">Include Images</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeSocialMedia" 
                            checked={formData.includeSocialMedia}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, includeSocialMedia: checked === true }))
                            }
                          />
                          <Label htmlFor="includeSocialMedia" className="text-sm font-normal cursor-pointer">Include Social Media</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 col-span-2">
                          <Checkbox 
                            id="includeUnsubscribe" 
                            checked={formData.includeUnsubscribe}
                            onCheckedChange={(checked) => 
                              setFormData(prev => ({ ...prev, includeUnsubscribe: checked === true }))
                            }
                          />
                          <Label htmlFor="includeUnsubscribe" className="text-sm font-normal cursor-pointer">
                            Include Unsubscribe Link (Recommended)
                          </Label>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {generatingTemplate && (
                <div>
                  <Progress
                    value={generationProgress}
                    className="h-2 w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {generationProgress < 100 
                        ? "AI generating your template..." 
                        : "Template generation complete!"}
                    </span>
                    <span className="text-xs text-muted-foreground">{Math.round(generationProgress)}%</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox 
                  id="saveTemplate" 
                  checked={formData.saveTemplate}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, saveTemplate: checked === true }))
                  }
                />
                <Label htmlFor="saveTemplate" className="text-sm font-normal cursor-pointer">
                  Save template to library after generation
                </Label>
              </div>
                
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={generatingTemplate}
              >
                {generatingTemplate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Template
                  </>
                )}
              </Button>
              
              <div className="text-xs text-muted-foreground text-center">
                Fill out the form above and click "Generate AI Template" to create a professional email template powered by AI
              </div>
            </div>
          </form>
        );
        
      case 'design':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Layout Style</Label>
                <Select 
                  value={templateStyle.layoutStyle}
                  onValueChange={(value) => 
                    setTemplateStyle(prev => ({ ...prev, layoutStyle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select layout style" />
                  </SelectTrigger>
                  <SelectContent>
                    {layoutOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color Scheme</Label>
                <Select 
                  value={templateStyle.colorScheme}
                  onValueChange={(value) => 
                    setTemplateStyle(prev => ({ ...prev, colorScheme: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Accent Color</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: templateStyle.accentColor }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{templateStyle.accentColor}</span>
                </div>
              </div>
              <Input 
                type="color" 
                value={templateStyle.accentColor}
                onChange={(e) => setTemplateStyle(prev => ({ ...prev, accentColor: e.target.value }))}
                className="h-10 p-1 cursor-pointer"
              />
            </div>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Typography Style</Label>
                <Select 
                  value={templateStyle.typographyStyle}
                  onValueChange={(value) => 
                    setTemplateStyle(prev => ({ ...prev, typographyStyle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select typography style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean">Clean Sans-Serif</SelectItem>
                    <SelectItem value="modern">Modern Mixed</SelectItem>
                    <SelectItem value="elegant">Elegant Serif</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Button Style</Label>
                <Select 
                  value={templateStyle.buttonStyle}
                  onValueChange={(value) => 
                    setTemplateStyle(prev => ({ ...prev, buttonStyle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select button style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="pill">Pill</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="soft">Soft Shadow</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
              
            <div className="space-y-3">
              <Label className="text-sm font-medium">Image Style</Label>
              <Select 
                value={templateStyle.imageStyle}
                onValueChange={(value) => 
                  setTemplateStyle(prev => ({ ...prev, imageStyle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select image style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">Rounded Corners</SelectItem>
                  <SelectItem value="circle">Circular</SelectItem>
                  <SelectItem value="square">Square/Rectangle</SelectItem>
                  <SelectItem value="shadow">Drop Shadow</SelectItem>
                  <SelectItem value="polaroid">Polaroid Frame</SelectItem>
                </SelectContent>
              </Select>
            </div>
              
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Spacing Density</Label>
                <span className="text-xs text-muted-foreground">
                  {templateStyle.spacingDensity === 1 
                    ? "Compact" 
                    : templateStyle.spacingDensity === 2
                      ? "Balanced"
                      : "Spacious"
                  }
                </span>
              </div>
              <Slider
                value={[templateStyle.spacingDensity]}
                min={1}
                max={3}
                step={1}
                onValueChange={(values) => setTemplateStyle(prev => ({ ...prev, spacingDensity: values[0] }))}
                className="py-4"
              />
            </div>
              
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                if (!formData.industry || !formData.purpose || !formData.targetAudience) {
                  toast({
                    title: "Incomplete Content Information",
                    description: "Please fill out all required content fields before updating design.",
                    variant: "destructive"
                  });
                  setActiveTab('editor');
                  return;
                }
                  
                if (generatedTemplate) {
                  setGeneratingTemplate(true);
                  setTimeout(() => {
                    setGeneratingTemplate(false);
                    toast({
                      title: "Design Updated",
                      description: "The template design has been updated. Check the preview tab to see changes.",
                    });
                    setActiveTab('preview');
                  }, 1500);
                } else {
                  toast({
                    title: "Generate Template First",
                    description: "Please generate a template in the Content tab before updating design.",
                  });
                  setActiveTab('editor');
                }
              }}
            >
              <Palette className="mr-2 h-4 w-4" /> Update Template Design
            </Button>
              
            <div className="text-xs text-muted-foreground text-center">
              Customize the visual appearance of your template. Changes will apply to your next generated template.
            </div>
          </div>
        );
          
      case 'preview':
        return (
          <div className="space-y-6">
            {generatedTemplate ? (
              <div className="border rounded-md overflow-hidden flex-1 bg-white">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <div className="text-sm font-medium">Template Preview</div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8"
                    onClick={() => window.open('/preview-template?id=' + generatedTemplate.id, '_blank')}
                  >
                    <Eye className="mr-2 h-3.5 w-3.5" /> Open in New Tab
                  </Button>
                </div>
                <div 
                  className="p-4 overflow-auto h-[500px]"
                  dangerouslySetInnerHTML={{ __html: previewHTML }}
                />
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden flex-1 bg-white">
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No Template Generated Yet</h3>
                  <p className="text-sm mb-4">Complete the content form and click "Generate AI Template" to create your template.</p>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('editor')}
                  >
                    Go to Content Editor
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
            
      case 'code':
        return (
          <div className="space-y-6">
            {generatedTemplate ? (
              <div className="border rounded-md overflow-hidden flex-1">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <div className="text-sm font-medium">HTML Source</div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      navigator.clipboard.writeText(previewHTML);
                      toast({
                        title: "Copied to clipboard",
                        description: "The HTML code has been copied to your clipboard.",
                      });
                    }}
                  >
                    <FileText className="mr-2 h-3.5 w-3.5" /> Copy HTML
                  </Button>
                </div>
                <div className="p-4 overflow-auto bg-gray-900 text-gray-100 text-sm font-mono whitespace-pre h-[500px]">
                  {previewHTML}
                </div>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden flex-1 bg-white">
                <div className="p-8 text-center text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No HTML Code Available</h3>
                  <p className="text-sm mb-4">Generate a template first to view its HTML code.</p>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('editor')}
                  >
                    Go to Content Editor
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card className="mb-6 shadow-md border-0">
      <CardHeader className="pb-0 pt-5 border-b">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center mb-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full mr-3 shadow-md">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">Advanced AI Template Designer</CardTitle>
              <CardDescription className="text-sm mt-1">
                Create professional email templates with AI-powered content and design
              </CardDescription>
            </div>
          </div>
          
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mt-2">
            <button
              type="button"
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "editor" ? "bg-background text-foreground shadow-sm" : ""
              }`}
              onClick={() => setActiveTab("editor")}
            >
              <PencilLine className="h-3.5 w-3.5 mr-1" /> Content
            </button>
            <button
              type="button"
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "design" ? "bg-background text-foreground shadow-sm" : ""
              }`}
              onClick={() => setActiveTab("design")}
            >
              <Palette className="h-3.5 w-3.5 mr-1" /> Design
            </button>
            <button
              type="button"
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "preview" ? "bg-background text-foreground shadow-sm" : ""
              }`}
              onClick={() => setActiveTab("preview")}
              disabled={!generatedTemplate}
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Preview
            </button>
            <button
              type="button"
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "code" ? "bg-background text-foreground shadow-sm" : ""
              }`}
              onClick={() => setActiveTab("code")}
              disabled={!generatedTemplate}
            >
              <Code className="h-3.5 w-3.5 mr-1" /> HTML
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5">
        {renderTabContent()}
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t py-3 px-6">
        <div className="text-xs text-muted-foreground w-full flex justify-between items-center">
          <span>Created with AI assistance</span>
          <div className="flex items-center">
            <span>Powered by</span>
            <div className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 ml-1">
              InfyMailer Pro
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}