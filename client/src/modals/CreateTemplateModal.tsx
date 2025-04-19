import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  FileText, 
  SparkleIcon,
  BrainCircuit, 
  Wand2, 
  Palette, 
  Terminal, 
  Eye, 
  Layers, 
  Code,
  MoveRight,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema for new template
const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().default('general'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required').default('<p>Your email content here</p>'),
});

// Interface for AI prompt suggestions
interface PromptSuggestion {
  title: string;
  prompt: string;
  icon: React.ReactNode;
}

type CreateTemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateTemplateModal({ open, onOpenChange }: CreateTemplateModalProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("visual");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTemplatePreview, setAiTemplatePreview] = useState<string | null>(null);
  
  // Form for manually creating a template
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'general',
      subject: '',
      content: '<p>Your email content here</p>',
    },
  });
  
  // Pre-defined AI prompt suggestions
  const promptSuggestions: PromptSuggestion[] = [
    {
      title: "Welcome Email",
      prompt: "Create a welcome email for new subscribers with a modern, professional design",
      icon: <Sparkles className="h-4 w-4 text-blue-500" />
    },
    {
      title: "Product Launch",
      prompt: "Design a product launch announcement with bold imagery and compelling CTAs",
      icon: <Sparkles className="h-4 w-4 text-green-500" />
    },
    {
      title: "Monthly Newsletter",
      prompt: "Build a monthly newsletter template with sections for news, featured items, and testimonials",
      icon: <Sparkles className="h-4 w-4 text-amber-500" />
    },
    {
      title: "Promotional Offer",
      prompt: "Design a promotional email with dynamic discount sections and countdown timer",
      icon: <Sparkles className="h-4 w-4 text-red-500" />
    }
  ];

  // AI Template generation function
  const generateAiTemplate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your template",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAI(true);
    setAiTemplatePreview(null);
    
    try {
      // This would normally call our AI service
      // For demo purposes, we'll just simulate a response
      setTimeout(() => {
        setAiTemplatePreview("AI-generated template preview would appear here");
        setIsGeneratingAI(false);
        
        // Show success toast
        toast({
          title: "Template Generated",
          description: "Your AI template is ready to customize",
        });
      }, 2000);
      
    } catch (error) {
      setIsGeneratingAI(false);
      toast({
        title: "Generation Failed",
        description: "Could not generate template. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof templateSchema>) => {
      const response = await apiRequest('POST', '/api/templates', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof templateSchema>) => {
    createTemplateMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Next-Gen Template Design Studio
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Create stunning email templates with AI assistance or visual editing
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="visual" className="w-full mt-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="visual" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Layers className="h-4 w-4 mr-2" />
              Visual Builder
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Generation
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">
              <Code className="h-4 w-4 mr-2" />
              Code Editor
            </TabsTrigger>
          </TabsList>
          
          {/* Visual Builder Tab */}
          <TabsContent value="visual" className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 relative mb-6">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-tr from-blue-600 to-blue-400 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                    <Layers className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-blue-800 mb-2">Drag & Drop Builder</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Create professional templates with our intuitive visual editor - no coding required.
                Customize with your brand colors, images, and content blocks.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <div className="bg-white rounded-md p-3 shadow-sm border border-blue-100 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 mr-3">
                    <Palette className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Brand Colors</span>
                </div>
                
                <div className="bg-white rounded-md p-3 shadow-sm border border-blue-100 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 mr-3">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">40+ Components</span>
                </div>
                
                <div className="bg-white rounded-md p-3 shadow-sm border border-blue-100 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 mr-3">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Live Preview</span>
                </div>
              </div>
              
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-6 h-auto rounded-md shadow-md border border-blue-400 transition-all duration-200 hover:shadow-lg"
                onClick={() => {
                  onOpenChange(false);
                  // Navigate to the template builder without leading slash to match App.tsx routes
                  window.location.href = 'client-template-builder';
                }}
              >
                <Layers className="h-5 w-5 mr-2" />
                Launch Visual Builder
                <MoveRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </TabsContent>
          
          {/* AI Generation Tab */}
          <TabsContent value="ai" className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 relative mb-6">
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-tr from-purple-600 to-purple-400 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                    <BrainCircuit className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-purple-800 mb-3">AI-Powered Template Generation</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Describe your ideal email template and let our AI design it for you.
                Customize the results or use them as-is for your campaigns.
              </p>
              
              <div className="w-full bg-white rounded-lg shadow-sm border border-purple-100 p-4 mb-6">
                <div className="flex items-center mb-3">
                  <Wand2 className="h-5 w-5 text-purple-500 mr-2" />
                  <h4 className="font-medium text-purple-800">Template Description</h4>
                </div>
                <Textarea 
                  placeholder="Describe the email template you need. For example: A welcome email for new customers with an elegant design, promotional discount section, and social media links."
                  className="w-full p-3 border border-purple-200 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200 mb-2 min-h-[100px]"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                
                <div className="mt-4 mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-2">Quick Suggestions:</div>
                  <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs rounded-md border border-purple-200 transition-colors"
                        onClick={() => setAiPrompt(suggestion.prompt)}
                      >
                        {suggestion.icon}
                        <span className="ml-1.5">{suggestion.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-2 rounded-md"
                  onClick={generateAiTemplate}
                  disabled={isGeneratingAI}
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Template...
                    </>
                  ) : (
                    <>
                      <SparkleIcon className="h-4 w-4 mr-2" />
                      Generate AI Template
                    </>
                  )}
                </Button>
              </div>
              
              {aiTemplatePreview && (
                <div className="w-full mt-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs px-2 py-1 rounded-t-md inline-block">
                    PREVIEW
                  </div>
                  <div className="border border-purple-200 rounded-md rounded-tl-none p-4 bg-white shadow-sm">
                    <div className="text-center bg-gray-50 p-6 rounded border border-dashed border-gray-200">
                      <SparkleIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">AI template preview would appear here</div>
                    </div>
                    
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button variant="outline" size="sm" 
                        onClick={() => {
                          onOpenChange(false);
                          window.location.href = 'client-template-builder';
                        }}
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Customize in Editor
                      </Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Use This Template
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Code Editor Tab */}
          <TabsContent value="code" className="border rounded-lg p-6 shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 relative mb-6">
                <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-gradient-to-tr from-amber-600 to-amber-400 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-amber-800 mb-2">HTML/CSS Code Editor</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                For advanced users who prefer direct HTML/CSS editing.
                Full control over your email template code with syntax highlighting.
              </p>
              
              <div className="w-full bg-gray-900 rounded-md overflow-hidden mb-6 shadow-lg">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center text-gray-400 text-xs">
                    <Terminal className="h-3.5 w-3.5 mr-1.5" />
                    <span>index.html</span>
                  </div>
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-4 font-mono text-xs text-white overflow-auto" style={{ maxHeight: '150px' }}>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">1</span>
                    <span className="text-blue-400">&lt;!DOCTYPE <span className="text-green-400">html</span>&gt;</span>
                  </div>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">2</span>
                    <span className="text-blue-400">&lt;html <span className="text-yellow-400">lang</span>=<span className="text-green-400">"en"</span>&gt;</span>
                  </div>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">3</span>
                    <span className="text-blue-400">&lt;head&gt;</span>
                  </div>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">4</span>
                    <span className="ml-4 text-blue-400">&lt;meta <span className="text-yellow-400">charset</span>=<span className="text-green-400">"UTF-8"</span>&gt;</span>
                  </div>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">5</span>
                    <span className="ml-4 text-blue-400">&lt;title&gt;</span><span className="text-gray-300">Email Template</span><span className="text-blue-400">&lt;/title&gt;</span>
                  </div>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">6</span>
                    <span className="text-blue-400">&lt;/head&gt;</span>
                  </div>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">7</span>
                    <span className="text-blue-400">&lt;body&gt;</span>
                  </div>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">8</span>
                    <span className="ml-4 text-blue-400">&lt;div <span className="text-yellow-400">class</span>=<span className="text-green-400">"container"</span>&gt;</span>
                  </div>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">9</span>
                    <span className="ml-8 text-blue-400">&lt;h1&gt;</span><span className="text-gray-300">Welcome to Our Newsletter</span><span className="text-blue-400">&lt;/h1&gt;</span>
                  </div>
                  <div className="mb-1 flex">
                    <span className="text-gray-500 mr-4 select-none">10</span>
                    <span className="ml-8 text-blue-400">&lt;p&gt;</span><span className="text-gray-300">Your email content here...</span><span className="text-blue-400">&lt;/p&gt;</span>
                  </div>
                </div>
              </div>
              
              <Button
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white px-8 py-6 h-auto rounded-md shadow-md border border-amber-400 transition-all duration-200 hover:shadow-lg"
                onClick={() => {
                  onOpenChange(false);
                  window.location.href = 'client-template-builder';
                }}
              >
                <Code className="h-5 w-5 mr-2" />
                Open Code Editor
                <MoveRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}