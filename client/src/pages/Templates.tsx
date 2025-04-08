import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, HelpCircle, Info, AlertCircle, Check, Copy } from "lucide-react";

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  subject: string;
}

interface PreviewState {
  subject: string;
  content: string;
  description: string;
  name: string;
}

export default function Templates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'code' | 'saved'>('editor');
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
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const { data: savedTemplates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    }
  });

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

      // Auto switch to code tab
      setActiveTab('code');
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
      const response = await apiRequest("POST", '/api/generate-template', data);
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

      setGeneratingTemplate(false);

      // Auto switch to code tab
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

  const handleLoadSavedTemplate = (template: Template) => {
    setPreviewState({
      subject: template.subject || '',
      content: template.content || '',
      description: template.description || '',
      name: template.name || ''
    });

    // Switch to code tab to view the loaded template
    setActiveTab('code');
  };

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">AI Email Template Generator</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link href="/template-builder">
            <button type="button" className="btn btn-sm btn-primary">
              <i className="bi bi-pencil-square me-1"></i> Open in Editor
            </button>
          </Link>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header pb-0 border-bottom">
          <div className="tabs-container">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'editor' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('editor')}
                >
                  <i className="bi bi-pencil-square me-1"></i> Template Generator
                </button>
              </li>

              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'code' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('code')}
                >
                  <i className="bi bi-code-slash me-1"></i> HTML Code
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'saved' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('saved')}
                >
                  <i className="bi bi-bookmark me-1"></i> Saved Templates
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="card-body pt-4">
          {activeTab === 'editor' && (
            <form onSubmit={handleSubmit} className="relative">
              {/* Redesigned hero section */}
              <div className="space-y-6">
                {/* Hero banner */}
                <div className="relative w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden">
                  {/* Background decoration elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/10 to-teal-300/5 rounded-full blur-xl"></div>
                  <div className="absolute bottom-0 left-10 w-64 h-64 bg-gradient-to-tr from-blue-400/10 to-teal-500/5 rounded-full blur-lg"></div>
                  <div className="absolute top-1/2 transform -translate-y-1/2 right-10 w-48 h-48 bg-gradient-to-tr from-teal-400/10 to-blue-500/5 rounded-full blur-lg"></div>

                  {/* Tech pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-8 left-[10%] w-32 h-px bg-teal-400/40"></div>
                    <div className="absolute top-8 left-[10%] w-px h-16 bg-teal-400/40"></div>
                    <div className="absolute top-32 right-[15%] w-24 h-px bg-teal-400/40"></div>
                    <div className="absolute top-32 right-[15%] w-px h-12 bg-teal-400/40"></div>
                    <div className="absolute bottom-12 left-[30%] w-48 h-px bg-teal-400/40"></div>
                    <div className="absolute bottom-12 left-[30%] w-px h-8 bg-teal-400/40"></div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between p-8 relative z-10">
                    <div className="mb-6 md:mb-0 md:mr-8">
                      <div className="flex items-center mb-3">
                        <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl shadow-lg mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                            <path d="M12 6.5c1.657 0 3 .843 3 1.883s-1.343 1.884-3 1.884-3-.844-3-1.884S10.343 6.5 12 6.5Z"/>
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-blue-200 to-teal-200">
                            AI Email Generator
                          </h2>
                          <div className="flex items-center mt-1">
                            <div className="px-2 py-1 bg-teal-900/60 rounded-md border border-teal-700/50 flex items-center mr-3">
                              <span className="text-xs font-semibold text-teal-300">GPT-4o</span>
                              <div className="ml-1.5 w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse"></div>
                            </div>
                            <span className="text-slate-400 text-sm">Powered by OpenAI</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300 md:text-lg max-w-xl mb-4">
                        Create professional, high-converting email templates instantly with advanced AI. 
                        Customize content for your audience, purpose, and brand voice in minutes.
                      </p>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/60 backdrop-blur border border-slate-700 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                          </svg>
                          <span className="text-xs font-medium text-slate-300">Generation Speed</span>
                        </div>
                        <p className="text-lg font-semibold text-white">15-20 sec</p>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur border border-slate-700 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 21a9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9Z" />
                            <path d="m12 12 4-2" />
                            <path d="M12 7v5" />
                          </svg>
                          <span className="text-xs font-medium text-slate-300">Templates Created</span>
                        </div>
                        <p className="text-lg font-semibold text-white">12,500+</p>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur border border-slate-700 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                          <span className="text-xs font-medium text-slate-300">Content Quality</span>
                        </div>
                        <p className="text-lg font-semibold text-white">Premium</p>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur border border-slate-700 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                          <span className="text-xs font-medium text-slate-300">Email Length</span>
                        </div>
                        <p className="text-lg font-semibold text-white">300-500 w</p>
                      </div>
                    </div>
                  </div>

                  {/* Workflow steps */}
                  <div className="px-8 pb-8 relative z-10">
                    <div className="relative">
                      <div className="absolute top-1/2 transform -translate-y-1/2 left-0 right-0 h-1 bg-slate-700/70 rounded-full"></div>
                      <div className="relative flex justify-between">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2 relative z-10">1</div>
                          <span className="text-sm text-teal-300 font-medium">Input Details</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-sm font-bold border border-slate-600 mb-2 relative z-10">2</div>
                          <span className="text-sm text-slate-400 font-medium">Generate</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-sm font-bold border border-slate-600 mb-2 relative z-10">3</div>
                          <span className="text-sm text-slate-400 font-medium">Review</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-sm font-bold border border-slate-600 mb-2 relative z-10">4</div>
                          <span className="text-sm text-slate-400 font-medium">Save</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two-column layout */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Panel - Form Fields */}
                  <div className="md:w-2/3 flex flex-col gap-6">

                  {/* Core Email Details Panel */}
                  <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-teal-600 to-blue-600 flex justify-between items-center">
                      <h4 className="font-medium text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                        Template Essentials
                      </h4>

                      <div className="bg-blue-500/30 rounded-md px-2 py-0.5 text-xs font-medium text-blue-200 border border-blue-500/20">
                        Required
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Template Type */}
                        <div>
                          <label htmlFor="templateType" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Template Type <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <select 
                              id="templateType" 
                              name="templateType" 
                              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              value={formData.templateType}
                              onChange={handleInputChange}
                              required
                            >
                              {templateTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400 transition-colors">
                                    <HelpCircle className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs bg-slate-900 text-slate-200 border border-slate-700">
                                  <p>Select the type of email template you want to create. This determines the structure and purpose of your email.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* Industry */}
                        <div>
                          <label htmlFor="industry" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Industry <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <input 
                              type="text" 
                              id="industry" 
                              name="industry" 
                              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="e.g., ecommerce, real estate, tech"
                              value={formData.industry}
                              onChange={handleInputChange}
                              required
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400 transition-colors">
                                    <HelpCircle className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs bg-slate-900 text-slate-200 border border-slate-700">
                                  <p>Enter your business industry for industry-specific language, examples, and tone.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>

                      {/* Purpose */}
                      <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-slate-300 mb-1.5">
                          Email Purpose <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input 
                            type="text" 
                            id="purpose" 
                            name="purpose" 
                            className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="e.g., announce a product launch, welcome new subscribers"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            required
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400 transition-colors">
                                  <HelpCircle className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs bg-slate-900 text-slate-200 border border-slate-700">
                                <p>Clearly state what you want to achieve with this email. This is crucial for the AI to generate appropriate content.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      {/* AI Insights Tip */}
                      <div className="flex p-2.5 bg-teal-950/40 rounded-lg border border-teal-900/50">
                        <div className="bg-teal-900/60 rounded-lg p-1.5 mr-2.5 h-fit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                          </svg>
                        </div>
                        <div className="text-xs text-teal-300">
                          <p className="font-medium mb-0.5">AI Insight</p>
                          <p>Being specific with your purpose significantly improves AI's ability to create effective content. For example, "drive registrations for June 15 webinar" is better than "promote webinar".</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Audience & Content Panel */}
                  <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-5 py-3 bg-teal-600 flex justify-between items-center">
                      <h4 className="font-medium text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Audience & Content
                      </h4>

                      <div className="flex itemscenter space-x-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-300"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-300"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-300"></div>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-800 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Target Audience */}
                        <div>
                          <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Target Audience <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <input 
                              type="text" 
                              id="targetAudience" 
                              name="targetAudience" 
                              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="e.g., IT managers aged 30-45"
                              value={formData.targetAudience}
                              onChange={handleInputChange}
                              required
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400 transition-colors">
                                    <HelpCircle className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs bg-slate-900 text-slate-200 border border-slate-700">
                                  <p>Describe who will receive this email, including demographics, interests, and customer status. This helps personalize the message.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* Brand Tone */}
                        <div>
                          <label htmlFor="brandTone" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Communication Style
                          </label>
                          <div className="relative">
                            <select 
                              id="brandTone" 
                              name="brandTone" 
                              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              value={formData.brandTone}
                              onChange={handleInputChange}
                            >
                              {brandToneOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-400 transition-colors">
                                    <HelpCircle className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs bg-slate-900 text-slate-200 border border-slate-700">
                                  <p>Choose the tone and style that best matches your brand voice and resonates with your audience.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>

                      {/* Key Points */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label htmlFor="keyPoints" className="block text-sm font-medium text-slate-300">
                            Key Points
                          </label>
                          <span className="text-xs text-teal-400">Recommended</span>
                        </div>
                        <textarea 
                          id="keyPoints" 
                          name="keyPoints" 
                          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[120px]"
                          placeholder="• Limited time 30% discount ending June 20
• Free shipping on orders over $50
• New summer collection now available
• Members-only early access"
                          value={formData.keyPoints}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>

                      {/* Advanced Writing Tips */}
                      <div className="p-3 bg-teal-950/40 rounded-lg border border-teal-900/40">
                        <h5 className="text-xs font-semibold text-teal-400 flex items-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                          </svg>
                          ADVANCED AI WRITING TECHNIQUES
                        </h5>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-800/50 p-2 rounded border border-teal-900/20">
                            <h6 className="text-xs font-medium text-teal-300 mb-1">Psychological Triggers</h6>
                            <p className="text-xs text-slate-400">Include scarcity ("Limited time") or social proof ("Join 10,000+ users")</p>
                          </div>
                          <div className="bg-slate-800/50 p-2 rounded border border-teal-900/20">
                            <h6 className="text-xs font-medium text-teal-300 mb-1">Engagement Boosters</h6>
                            <p className="text-xs text-slate-400">Use questions, countdowns, or personalized elements ("Chosen for you")</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Style Panel */}
                  <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 flex justify-between items-center">
                      <h4 className="font-medium text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="13.5" cy="6.5" r="2.5" />
                          <circle cx="17.5" cy="10.5" r="2.5" />
                          <circle cx="8.5" cy="7.5" r="2.5" />
                          <circle cx="6.5" cy="12.5" r="2.5" />
                        </svg>
                        Visual Design & Style
                      </h4>
                    </div>

                    <div className="p-5 bg-slate-800 space-y-4">
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Brand Color Theme
                      </label>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {colorThemes.map(theme => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => handleColorThemeChange(theme.id)}
                            className={`relative rounded-lg overflow-hidden transition-all duration-300 h-9 w-9 hover:scale-110 ${
                              selectedColorTheme.id === theme.id ? 'ring-2 ring-offset-1 ring-offset-slate-800 ring-white scale-110' : ''
                            }`}
                            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary} 40%, ${theme.secondary} 60%, ${theme.secondary} 100%)` }}
                          >
                            {selectedColorTheme.id === theme.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="p-3 bg-gradient-to-r from-slate-700/60 to-slate-700/30 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-1.5 rounded-md mr-3 flex" style={{ background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.secondary})` }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22v-6M2 12l5-3 1-4 2 1 1 4 5 3 1-4 2 1 1 4 2 2M18 5l-4 3-1.5-1.5L9 9 6 5.5 3 9" />
                            </svg>
                          </div>

                          <div>
                            <h6 className="text-sm font-medium text-slate-300">{selectedColorTheme.name}</h6>
                            <p className="text-xs text-slate-500">Primary: {selectedColorTheme.primary} • Secondary: {selectedColorTheme.secondary}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded border border-slate-600" style={{ backgroundColor: selectedColorTheme.primary }}></div>
                          <div className="w-5 h-5 rounded border border-slate-600" style={{ backgroundColor: selectedColorTheme.secondary }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Engine & Generation Settings */}
                  <div className="bg-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-slate-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="8" />
                          <path d="m15 9-6 6" />
                          <path d="m9 9 6 6" />
                        </svg>
                        AI Engine Settings
                      </h4>

                      <div className="px-2 py-1 bg-teal-900/40 rounded text-xs text-teal-400 border border-teal-900/40 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                        </svg>
                        GPT-4o Optimized
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="saveTemplate" 
                          name="saveTemplate"
                          className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-teal-600 focus:ring-teal-500"
                          checked={formData.saveTemplate}
                          onChange={handleCheckboxChange}
                        />
                        <label className="ml-2 text-sm text-slate-300" htmlFor="saveTemplate">
                          Save to template library
                        </label>
                      </div>


                    </div>
                  </div>

                  {/* Generate Button */}
                  {!generatingTemplate ? (
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl blur opacity-30"></div>
                      <Button 
                        type="submit" 
                        className="relative w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-3 border border-slate-700 shadow-lg transition-all"
                        disabled={generateTemplateMutation.isPending || generatingTemplate}
                      >
                        <div className="p-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                          </svg>
                        </div>
                        <span className="text-lg font-semibold">Generate AI Template</span>
                      </Button>
                    </div>
                  ) : null}
                </div>

                {/* Right Panel - Live Preview & Status */}
                <div className="md:w-1/3 bg-slate-900 rounded-xl shadow-lg overflow-hidden">
                  {!generatingTemplate ? (
                    <div className="h-full flex flex-col">
                      <div className="px-5 py-3 bg-slate-800 border-b border-slate-700">
                        <h4 className="font-medium text-slate-300 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          Preview Panel
                        </h4>
                      </div>

                      <div className="flex-grow p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="14" x="3" y="5" rx="2" />
                            <polyline points="3 7 12 13 21 7" />
                          </svg>
                        </div>

                        <h5 className="text-lg font-medium text-slate-400">Preview Ready</h5>
                        <p className="text-sm text-slate-500 max-w-xs mt-2">
                          Your email template preview will appear here after generation. Fill out the form and click "Generate AI Template".
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
                          <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                            <h6 className="text-xs font-medium text-slate-400 mb-1">Estimated Length</h6>
                            <p className="text-xs text-slate-500">300-500 words</p>
                          </div>
                          <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                            <h6 className="text-xs font-medium text-slate-400 mb-1">Generation Time</h6>
                            <p className="text-xs text-slate-500">~15-20 seconds</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 p-4">
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>AI Email Generator v2.0</span>
                          <div className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-1"></span>
                            <span>Ready</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      {/* Generation Status Header */}
                      <div className="px-5 py-3 bg-slate-800 border-b border-slate-700">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-slate-300 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                              <path d="M12 7v5l3 3" />
                            </svg>
                            Processing
                          </h4>
                          <div className="text-teal-400 font-bold">{Math.round(generationProgress)}%</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="px-5 pt-5">
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${generationProgress}%` }}
                          ></div>
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {generationProgress < 25 ? 'Analyzing your requirements...' : 
                          generationProgress < 50 ? 'Creating email structure...' : 
                          generationProgress < 75 ? 'Generating engaging content...' : 
                          generationProgress < 95 ? 'Optimizing for conversions...' : 
                          'Finalizing your template...'}
                        </p>
                      </div>

                      {/* Advanced Generation Status */}
                      <div className="flex-grow p-5 space-y-3 overflow-y-auto">
                        {/* Task Progress */}
                        <div className="space-y-2">
                          <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 20 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
                            <div className="flex items-center">
                              {generationProgress > 20 ? (
                                <div className="mr-2 w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="mr-2 w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center">
                                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                                </div>
                              )}
                              <span className={`text-sm ${generationProgress > 20 ? 'text-slate-300' : 'text-slate-500'}`}>Analyzing inputs</span>
                            </div>
                            {generationProgress > 20 && <span className="text-xs text-teal-500">Completed</span>}
                          </div>

                          <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 40 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
                            <div className="flex items-center">
                              {generationProgress > 40 ? (
                                <div className="mr-2 w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              ) : generationProgress > 20 ? (
                                <div className="mr-2 w-5 h-5 rounded-full border border-blue-500/50 flex items-center justify-center">
                                  <div className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"></div>
                                </div>
                              ) : (
                                <div className="mr-2 w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center">
                                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                                </div>
                              )}
                              <span className={`text-sm ${generationProgress > 20 ? 'text-slate-300' : 'text-slate-500'}`}>Crafting subject line</span>
                            </div>
                            {generationProgress > 40 && <span className="text-xs text-teal-500">Completed</span>}
                          </div>

                          <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 60 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
                            <div className="flex items-center">
                              {generationProgress > 60 ? (
                                <div className="mr-2 w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              ) : generationProgress > 40 ? (
                                <div className="mr-2 w-5 h-5 rounded-full border border-blue-500/50 flex items-center justify-center">
                                  <div className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"></div>
                                </div>
                              ) : (
                                <div className="mr-2 w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center">
                                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                                </div>
                              )}
                              <span className={`text-sm ${generationProgress > 40 ? 'text-slate-300' : 'text-slate-500'}`}>Generating content</span>
                            </div>
                            {generationProgress > 60 && <span className="text-xs text-teal-500">Completed</span>}
                          </div>

                          <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 80 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
                            <div className="flex items-center">
                              {generationProgress > 80 ? (
                                <div className="mr-2 w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              ) : generationProgress > 60 ? (
                                <div className="mr-2 w-5 h-5 rounded-full border border-blue-500/50 flex items-center justify-center">
                                  <div className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"></div>
                                </div>
                              ) : (
                                <div className="mr-2 w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center">
                                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                                </div>
                              )}
                              <span className={`text-sm ${generationProgress > 60 ? 'text-slate-300' : 'text-slate-500'}`}>Optimizing template</span>
                            </div>
                            {generationProgress > 80 && <span className="text-xs text-teal-500">Completed</span>}
                          </div>

                          <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 95 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
                            <div className="flex items-center">
                              {generationProgress > 95 ? (
                                <div className="mr-2 w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                              ) : generationProgress > 80 ? (
                                <div className="mr-2 w-5 h-5 rounded-full border border-blue-500/50 flex items-center justify-center">
                                  <div className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"></div>
                                </div>
                              ) : (
                                <div className="mr-2 w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center">
                                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                                </div>
                              )}
                              <span className={`text-sm ${generationProgress > 80 ? 'text-slate-300' : 'text-slate-500'}`}>Finalizing template</span>
                            </div>
                            {generationProgress > 95 && <span className="text-xs text-teal-500">Completed</span>}
                          </div>
                        </div>

                        {/* AI Activity Log */}
                        {generationProgress > 30 && (
                          <div className="mt-4 border border-slate-700 rounded-lg overflow-hidden">
                            <div className="p-2 bg-slate-800 border-b border-slate-700 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                              </svg>
                            </div>
                          <div>
                            <h6 className="text-xs font-medium text-slate-300">GPT-4o AI Engine</h6>
                            <p className="text-xs text-slate-500">Optimized for marketing & email content</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}



          {activeTab === 'code' && (
            <div className="code-viewer bg-dark rounded">
              {previewState.content ? (
                <>
                  <div className="d-flex justify-content-between align-items-center bg-dark text-white px-3 py-2 border-bottom border-secondary">
                    <div>
                      <small>HTML Source</small>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-light"
                      onClick={() => {
                        navigator.clipboard.writeText(previewState.content);
                        toast({
                          title: "Copied!",
                          description: "HTML code copied to clipboard",
                          variant: "default"
                        });
                      }}
                    >
                      <i className="bi bi-clipboard me-1"></i> Copy HTML
                    </button>
                  </div>
                  <pre className="m-0 p-3 text-white" style={{ 
                    maxHeight: '600px', 
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    backgroundColor: '#1e1e1e'
                  }}>
                    <code>{previewState.content}</code>
                  </pre>
                </>
              ) : (
                <div className="text-center py-5 text-white">
                  <i className="bi bi-code-slash fs-1 mb-3 text-muted"></i>
                  <h5>No HTML Code Available</h5>
                  <p className="text-muted">Generate a template first to view its HTML code.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="saved-templates">
              <h5 className="mb-3">Your Saved Templates</h5>

              {isLoadingTemplates ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading saved templates...</p>
                </div>
              ) : savedTemplates.length === 0 ? (
                <div className="text-center py-4 border rounded bg-light">
                  <i className="bi bi-inbox text-muted fs-1 mb-2"></i>
                  <h6>No Saved Templates Yet</h6>
                  <p className="text-muted">Generate and save templates to see them here.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th style={{ width: "20%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedTemplates.map((template: Template) => (
                        <tr key={template.id}>
                          <td>{template.name}</td>
                          <td className="text-muted small">{template.description}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary" 
                                onClick={() => handleLoadSavedTemplate(template)}
                              >
                                <i className="bi bi-eye me-1"></i> View
                              </button>
                              <Link href={`/template-builder/${template.id}`}>
                                <button className="btn btn-outline-success">
                                  <i className="bi bi-pencil me-1"></i> Edit
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0"><i className="bi bi-lightbulb me-2 text-warning"></i> How to Use</h5>
            </div>
            <div className="card-body">
              <ol className="mb-0">
                <li className="mb-2">Fill out the <strong>Template Generator</strong> form with your requirements</li>
                <li className="mb-2">Click <strong>Generate AI Email Template</strong> to create your template</li>
                <li className="mb-2">Review your template in the <strong>HTML Code</strong> tab, which will appear automatically</li>
                <li className="mb-2">Copy the HTML code if needed for use in other systems</li>
                <li className="mb-2">Save your template for future use (checked by default)</li>
                <li>Access all your saved templates in the <strong>Saved Templates</strong> tab</li>
              </ol>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0"><i className="bi bi-stars me-2 text-primary"></i> Tips for Better Results</h5>
            </div>
            <div className="card-body">
              <ul className="mb-0">
                <li className="mb-2">Be <strong>specific about your industry</strong> (e.g., "luxury real estate" instead of just "real estate")</li>
                <li className="mb-2">Clearly state your <strong>purpose</strong> (e.g., "announce our annual summer sale with 30% discount")</li>
                <li className="mb-2">Define your <strong>target audience</strong> with details like age, interests, or buyer stage</li>
                <li className="mb-2">Choose a <strong>brand tone</strong> that matches your company's voice</li>
                <li className="mb-2">Include <strong>key points</strong> that must be included in the email</li>
                <li>Select a <strong>color theme</strong> that complements your brand identity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}