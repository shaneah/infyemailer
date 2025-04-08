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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 15h0m5 0h0m5 0h0M8.5 9h0m7 0h0M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18" />
                          </svg>
                          <span className="text-xs font-medium text-slate-300">Available Styles</span>
                        </div>
                        <p className="text-lg font-semibold text-white">15+</p>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur border border-slate-700 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 12c2.5 0 4-1.8 4-4s-1.5-4-4-4-4 1.8-4 4 1.5 4 4 4" />
                            <path d="M20 17.5c0 2.5-3.5 4.5-8 4.5s-8-2-8-4.5c0-1.2 1.5-2.4 4-3.2 1.5.4 3 .7 4 .7s2.5-.3 4-.7c2.5.8 4 2 4 3.2" />
                          </svg>
                          <span className="text-xs font-medium text-slate-300">Industries</span>
                        </div>
                        <p className="text-lg font-semibold text-white">50+</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two column layout */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left panel - form inputs */}
                  <div className="md:w-2/3 space-y-6">
                    {/* Template Type */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                      <div className="p-5">
                        <div className="mb-4">
                          <label className="flex items-center text-slate-300 font-medium mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <path d="M9 14v1m3-1v3m3-2v-1" />
                              <path d="M9 8h1m3 0h1m-4 3h1" />
                            </svg>
                            Template Type
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {templateTypeOptions.map(option => (
                              <div key={option.value} className="flex-1 min-w-[100px]">
                                <input 
                                  type="radio" 
                                  id={`templateType-${option.value}`} 
                                  name="templateType" 
                                  value={option.value} 
                                  className="hidden peer" 
                                  checked={formData.templateType === option.value}
                                  onChange={handleInputChange}
                                />
                                <label 
                                  htmlFor={`templateType-${option.value}`} 
                                  className="block text-center p-3 bg-slate-900/70 border border-slate-700 rounded-lg cursor-pointer transition-all peer-checked:bg-teal-900/20 peer-checked:border-teal-500/50 peer-checked:text-teal-300 text-slate-400 hover:bg-slate-800"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Industry */}
                        <div className="mb-4">
                          <label className="flex items-center text-slate-300 font-medium mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                            </svg>
                            Industry
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="ml-1 cursor-help text-slate-500">
                                    <HelpCircle size={14} />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="w-80 p-3">
                                  <p>Specify your industry for more relevant content. Be specific, e.g. "luxury real estate" instead of just "real estate".</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </label>
                          <input 
                            type="text" 
                            name="industry" 
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            placeholder="E.g. Fintech, Retail, Healthcare, Tech SaaS, etc."
                            value={formData.industry}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Email Purpose */}
                        <div className="mb-4">
                          <label className="flex items-center text-slate-300 font-medium mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 17V8" />
                              <path d="m9 11 3-3 3 3" />
                              <circle cx="12" cy="16" r="1" />
                            </svg>
                            Email Purpose
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="ml-1 cursor-help text-slate-500">
                                    <HelpCircle size={14} />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="w-80 p-3">
                                  <p>What is the main goal of this email? Be specific about what you want recipients to do or understand.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </label>
                          <input 
                            type="text" 
                            name="purpose" 
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            placeholder="E.g. Announce new product, Welcome new users, Special discount, etc."
                            value={formData.purpose}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Target Audience */}
                        <div className="mb-4">
                          <label className="flex items-center text-slate-300 font-medium mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Target Audience
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="ml-1 cursor-help text-slate-500">
                                    <HelpCircle size={14} />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="w-80 p-3">
                                  <p>Describe your audience in detail. Include demographics, interests, or buying stage for more personalized content.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </label>
                          <input 
                            type="text" 
                            name="targetAudience" 
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            placeholder="E.g. Marketing professionals, First-time homebuyers, Existing customers, etc."
                            value={formData.targetAudience}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Brand Tone */}
                        <div className="mb-4">
                          <label className="flex items-center text-slate-300 font-medium mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 10v11l-6-4-6 4V10a9 9 0 0 1 12 0z" />
                            </svg>
                            Brand Tone
                          </label>
                          <select 
                            name="brandTone" 
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
                            value={formData.brandTone}
                            onChange={handleInputChange}
                          >
                            {brandToneOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Key Points */}
                        <div className="mb-4">
                          <label className="flex items-center text-slate-300 font-medium mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                              <path d="M12 11h4" />
                              <path d="M12 16h4" />
                              <path d="M8 11h.01" />
                              <path d="M8 16h.01" />
                            </svg>
                            Key Points (optional)
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="ml-1 cursor-help text-slate-500">
                                    <HelpCircle size={14} />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="w-80 p-3">
                                  <p>Enter key information points to include in your email, with each point on a new line. Think of features, benefits, dates, or specific details.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </label>
                          <textarea 
                            name="keyPoints" 
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 min-h-[150px]"
                            placeholder="Enter key points to include, one per line:&#10;- First important point&#10;- Second important point&#10;- Third important point"
                            value={formData.keyPoints}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>

                        {/* Color Theme */}
                        <div className="mb-4">
                          <label className="flex items-center text-slate-300 font-medium mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="13.5" cy="6.5" r="2.5" />
                              <circle cx="19" cy="13" r="2.5" />
                              <circle cx="6" cy="12" r="2.5" />
                              <circle cx="10" cy="20" r="2.5" />
                            </svg>
                            Color Theme
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {colorThemes.map(theme => (
                              <div 
                                key={theme.id} 
                                className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-all flex items-center justify-center ${selectedColorTheme.id === theme.id ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: theme.primary }}
                                onClick={() => handleColorThemeChange(theme.id)}
                              >
                                {selectedColorTheme.id === theme.id && (
                                  <Check size={14} className="text-white" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Save Template */}
                        <div className="mb-4">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="saveTemplate" 
                              name="saveTemplate" 
                              className="rounded border-slate-600 text-teal-500 focus:ring-teal-500/50 bg-slate-900 w-5 h-5"
                              checked={formData.saveTemplate}
                              onChange={handleCheckboxChange}
                            />
                            <label htmlFor="saveTemplate" className="ml-2 text-slate-300">
                              Save template for future use
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <div className="px-5 pb-5">
                        {!generatingTemplate ? (
                          <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl blur opacity-30"></div>
                            <Button 
                              type="submit" 
                              className="relative w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-3 border border-slate-700 shadow-lg transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                                <path d="M12 6.5c1.657 0 3 .843 3 1.883s-1.343 1.884-3 1.884-3-.844-3-1.884S10.343 6.5 12 6.5Z"/>
                              </svg>
                              <span className="font-medium">Generate AI Email Template</span>
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            disabled 
                            className="w-full py-4 bg-slate-800 text-white rounded-xl flex items-center justify-center gap-3 border border-slate-700"
                          >
                            <Loader2 className="h-5 w-5 animate-spin text-teal-400" />
                            <span className="font-medium">Generating Template...</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                    
                  {/* Right panel - status or preview */}
                  <div className="md:w-1/3 bg-slate-900 rounded-xl shadow-lg overflow-hidden">
                    {!generatingTemplate ? (
                      <div className="h-full flex flex-col">
                        <div className="px-5 py-3 bg-slate-800 border-b border-slate-700">
                          <h4 className="font-medium text-slate-300 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                              <circle cx="12" cy="5" r="3" />
                            </svg>
                            Ready to Generate
                          </h4>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-slate-300 mb-2">Fill in the form</h5>
                              <p className="text-xs text-slate-400">Complete the fields on the left to describe the email template you need. The more details you provide, the better the result will be.</p>
                            </div>
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-medium mr-3">1</div>
                              <div className="flex-1 h-0.5 bg-slate-700"></div>
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-medium mx-3">2</div>
                              <div className="flex-1 h-0.5 bg-slate-700"></div>
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-medium ml-3">3</div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 px-2">
                              <span>Inputs</span>
                              <span>Processing</span>
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
                                <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                                <path d="M12 6.5c1.657 0 3 .843 3 1.883s-1.343 1.884-3 1.884-3-.844-3-1.884S10.343 6.5 12 6.5Z"/>
                              </svg>
                              Generating Template
                            </h4>
                            <div className="text-sm text-teal-400 font-medium">{Math.round(generationProgress)}%</div>
                          </div>
                          <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
                          </div>
                        </div>

                        {/* Generation Progress Steps */}
                        <div className="p-5 flex-1">
                          <div className="space-y-2">
                            <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 0 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
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

                            <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 20 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
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

                            <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 40 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
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

                            <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 60 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
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

                            <div className={`flex justify-between items-center p-2.5 rounded-lg border ${generationProgress > 80 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/30 border-slate-700/50'}`}>
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
                                <span className="text-xs font-medium text-slate-400 ml-1.5">AI Activity Log</span>
                              </div>
                              
                              <div className="max-h-32 overflow-y-auto p-2 space-y-1.5 text-xs">
                                <div className="text-slate-500">
                                  <span className="text-teal-500">system</span>: Initializing GPT-4o engine...
                                </div>
                                <div className="text-slate-500">
                                  <span className="text-teal-500">system</span>: Loading {formData.industry} industry knowledge base...
                                </div>
                                {generationProgress > 40 && (
                                  <div className="text-slate-500">
                                    <span className="text-teal-500">system</span>: Analyzing {formData.targetAudience} profile...
                                  </div>
                                )}
                                {generationProgress > 50 && (
                                  <div className="text-slate-500">
                                    <span className="text-teal-500">system</span>: Creating content structure for {formData.templateType}...
                                  </div>
                                )}
                                {generationProgress > 65 && (
                                  <div className="text-slate-500">
                                    <span className="text-teal-500">system</span>: Adapting tone to "{formData.brandTone}" style...
                                  </div>
                                )}
                                {generationProgress > 75 && (
                                  <div className="text-slate-500">
                                    <span className="text-teal-500">system</span>: Incorporating {formData.keyPoints.split('\n').filter(line => line.trim()).length || 0} key points...
                                  </div>
                                )}
                                {generationProgress > 85 && (
                                  <div className="text-slate-500">
                                    <span className="text-teal-500">system</span>: Applying {selectedColorTheme.name} color theme...
                                  </div>
                                )}
                                {generationProgress > 95 && (
                                  <div className="text-slate-500">
                                    <span className="text-teal-500">system</span>: Running final quality checks...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Engine Info */}
                        <div className="border-t border-slate-800 p-4">
                          <div className="bg-slate-800 rounded-lg p-3 flex items-center">
                            <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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