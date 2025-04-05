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
  const [autoPreviewEnabled, setAutoPreviewEnabled] = useState(true);
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

  const handleLoadSavedTemplate = (template: Template) => {
    setPreviewState({
      subject: template.subject || '',
      content: template.content || '',
      description: template.description || '',
      name: template.name || ''
    });
    
    if (activeTab !== 'preview') {
      setActiveTab('preview');
    }
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
                  className={`nav-link ${activeTab === 'preview' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('preview')}
                >
                  <i className="bi bi-eye me-1"></i> Preview
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
            <form onSubmit={handleSubmit} className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-sm">
              <div className="rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 border border-teal-100 p-5 mb-8">
                <div className="flex items-start">
                  <div className="mr-4 p-2 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                      <path d="M12 6.5c1.657 0 3 .843 3 1.883s-1.343 1.884-3 1.884-3-.844-3-1.884S10.343 6.5 12 6.5Z"/>
                      <path d="M12 19v3"/>
                      <path d="M10 22h4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">AI Email Template Generator</h3>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      Use our AI assistant to create a professional email template tailored to your needs. 
                      The more specific your inputs, the better your results will be.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Main Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Template Type */}
                  <div className="relative p-5 bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md group">
                    <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-teal-100 to-blue-100 rounded-bl-xl rounded-tr-lg z-0 group-hover:from-teal-200 group-hover:to-blue-200 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-sm mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <path d="M3 9h18" />
                              <path d="M9 21V9" />
                            </svg>
                          </div>
                          <label htmlFor="templateType" className="block text-sm font-medium">
                            Template Type <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white">
                              <p>Select the type of email template you want to create. This determines the structure and purpose of your email.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <select 
                        id="templateType" 
                        name="templateType" 
                        className="w-full border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm"
                        value={formData.templateType}
                        onChange={handleInputChange}
                        required
                      >
                        {templateTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Industry */}
                  <div className="relative p-5 bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md group">
                    <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-teal-100 to-blue-100 rounded-bl-xl rounded-tr-lg z-0 group-hover:from-teal-200 group-hover:to-blue-200 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-sm mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                              <path d="M17 18h1" />
                              <path d="M12 18h1" />
                              <path d="M7 18h1" />
                            </svg>
                          </div>
                          <label htmlFor="industry" className="block text-sm font-medium">
                            Industry <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white">
                              <p>Enter your business industry to tailor the template to your specific market (e.g., e-commerce, healthcare, technology).</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <input 
                        type="text" 
                        id="industry" 
                        name="industry" 
                        className="w-full border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm"
                        placeholder="e.g., e-commerce, healthcare, technology"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Purpose & Target Audience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Purpose */}
                  <div className="relative p-5 bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md group">
                    <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-teal-100 to-blue-100 rounded-bl-xl rounded-tr-lg z-0 group-hover:from-teal-200 group-hover:to-blue-200 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-sm mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <path d="m15 9-6 6" />
                              <path d="m9 9 6 6" />
                            </svg>
                          </div>
                          <label htmlFor="purpose" className="block text-sm font-medium">
                            Purpose <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white">
                              <p>Describe what you want to achieve with this email (e.g., announce a sale, share monthly updates, welcome new customers).</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <input 
                        type="text" 
                        id="purpose" 
                        name="purpose" 
                        className="w-full border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm"
                        placeholder="e.g., announce a sale, share monthly updates"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Target Audience */}
                  <div className="relative p-5 bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md group">
                    <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-teal-100 to-blue-100 rounded-bl-xl rounded-tr-lg z-0 group-hover:from-teal-200 group-hover:to-blue-200 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-sm mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          </div>
                          <label htmlFor="targetAudience" className="block text-sm font-medium">
                            Target Audience <span className="text-red-500">*</span>
                          </label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white">
                              <p>Describe who will receive this email. Include demographic details like age range, customer status, interests, etc.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <input 
                        type="text" 
                        id="targetAudience" 
                        name="targetAudience" 
                        className="w-full border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm"
                        placeholder="e.g., existing customers aged 25-45"
                        value={formData.targetAudience}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Appearance Settings */}
                <div className="p-5 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-teal-500">
                      <path d="M12 22a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
                      <path d="M12 2v7" />
                      <path d="m4.9 4.9 4.2 4.2" />
                      <path d="m19.1 4.9-4.2 4.2" />
                    </svg>
                    Appearance Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Brand Tone */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-sm mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </div>
                          <label htmlFor="brandTone" className="block text-sm font-medium">
                            Brand Tone
                          </label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white">
                              <p>Choose the voice and style for your email that best represents your brand's personality.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <select 
                        id="brandTone" 
                        name="brandTone" 
                        className="w-full border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm"
                        value={formData.brandTone}
                        onChange={handleInputChange}
                      >
                        {brandToneOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Color Theme */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-sm mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="13.5" cy="6.5" r="2.5" />
                              <circle cx="17.5" cy="10.5" r="2.5" />
                              <circle cx="8.5" cy="7.5" r="2.5" />
                              <circle cx="6.5" cy="12.5" r="2.5" />
                              <path d="M12 22v-6" />
                              <path d="M12 13.5V16" />
                              <path d="M12 13.5a5 5 0 0 1 8.66-3.6l-1.47 1.46a3 3 0 0 0-4.24.38L12 13.5Z" />
                              <path d="M12 13.5a5 5 0 0 0-9-3l1.42 1.5a3 3 0 0 1 4.3.37L12 13.5Z" />
                            </svg>
                          </div>
                          <label className="block text-sm font-medium">
                            Color Theme
                          </label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white">
                              <p>Select a color scheme for your email template that matches your brand.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {colorThemes.map(theme => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => handleColorThemeChange(theme.id)}
                            className={`relative w-10 h-10 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-teal-500 transition-all duration-300 transform hover:scale-110 ${
                              selectedColorTheme.id === theme.id ? 'ring-2 ring-offset-2 ring-offset-white ring-teal-500 scale-110' : ''
                            }`}
                            style={{ 
                              backgroundColor: theme.secondary
                            }}
                            title={theme.name}
                          >
                            <span className="w-5 h-5 rounded-md" style={{ backgroundColor: theme.primary }}></span>
                            {selectedColorTheme.id === theme.id && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                <Check className="w-3 h-3 text-white" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Key Points */}
                <div className="relative p-5 bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md group">
                  <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-teal-100 to-blue-100 rounded-bl-xl rounded-tr-lg z-0 group-hover:from-teal-200 group-hover:to-blue-200 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-sm mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 11V8a3 3 0 0 1 6 0v3" />
                            <path d="M12 11h6a2 2 0 0 1 0 4h-4" />
                            <path d="M9 15v-4" />
                            <path d="M5 15h4" />
                            <path d="M19 15a2 2 0 0 1 0 4H5a2 2 0 0 1 0-4" />
                          </svg>
                        </div>
                        <label htmlFor="keyPoints" className="block text-sm font-medium">
                          Key Points to Include
                        </label>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center text-slate-400 hover:text-slate-700">
                              <HelpCircle className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white">
                            <p>List any specific details, offers, or key points you want to include in the email. Separate multiple points with new lines.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <textarea 
                      id="keyPoints" 
                      name="keyPoints" 
                      className="w-full border border-slate-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm"
                      placeholder="• Limited time offer ending soon
• Free shipping on orders over $50
• New spring collection now available
• Exclusive discount for loyalty members"
                      rows={5}
                      value={formData.keyPoints}
                      onChange={handleInputChange}
                    ></textarea>
                    <p className="mt-2 text-xs text-slate-500">Enter each key point on a new line. AI will incorporate these points into your email.</p>
                  </div>
                </div>
                
                {/* Options */}
                <div className="flex flex-col md:flex-row md:justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 3H5a2 2 0 0 0-2 2v4" />
                        <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                        <path d="M19 3h-4" />
                        <path d="M19 21h-4" />
                        <path d="M3 9v6" />
                        <path d="M21 9v6" />
                        <path d="M9 3v18" />
                        <path d="M9 9h12" />
                        <path d="M9 15h12" />
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="saveTemplate" 
                        name="saveTemplate"
                        className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                        checked={formData.saveTemplate}
                        onChange={handleCheckboxChange}
                      />
                      <label className="text-sm text-slate-700 font-medium" htmlFor="saveTemplate">
                        Save template to library
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-md shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="autoPreview" 
                        name="autoPreview"
                        className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                        checked={autoPreviewEnabled}
                        onChange={() => setAutoPreviewEnabled(!autoPreviewEnabled)}
                      />
                      <label className="text-sm text-slate-700 font-medium" htmlFor="autoPreview">
                        Auto-switch to preview when ready
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Generation Button and Progress */}
              <div className="mt-10 flex flex-col items-center">
                <div className="w-full max-w-md">
                  <Button 
                    type="submit" 
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                    disabled={generateTemplateMutation.isPending || generatingTemplate}
                  >
                    {(generateTemplateMutation.isPending || generatingTemplate) ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>AI is crafting your template...</span>
                      </>
                    ) : (
                      <>
                        <div className="p-1 bg-white bg-opacity-20 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                            <path d="M12 6.5c1.657 0 3 .843 3 1.883s-1.343 1.884-3 1.884-3-.844-3-1.884S10.343 6.5 12 6.5Z"/>
                          </svg>
                        </div>
                        <span>Generate AI Email Template</span>
                      </>
                    )}
                  </Button>
                  
                  {generatingTemplate && (
                    <div className="w-full mt-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <svg className="animate-pulse mr-2 text-teal-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                            <path d="M16.5 9.4 7.55 4.24" />
                            <polyline points="3.29 7 12 12 20.71 7" />
                            <line x1="12" y1="22" x2="12" y2="12" />
                            <circle cx="18.5" cy="15.5" r="2.5" />
                            <path d="M20.27 17.27 22 19" />
                          </svg>
                          <span className="text-sm font-medium text-slate-700">
                            {generationProgress < 50 ? 'Analyzing inputs...' : 
                             generationProgress < 75 ? 'Creating template structure...' : 
                             generationProgress < 90 ? 'Crafting content...' : 
                             'Finalizing your template...'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-teal-600">{Math.round(generationProgress)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                          style={{ width: `${generationProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center mt-3 text-xs text-slate-500 justify-between">
                        <span className="inline-flex items-center">
                          <div className="p-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                            </svg>
                          </div>
                          Powered by GPT-4o AI
                        </span>
                        <span>~15-20 seconds remaining</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
          
          {activeTab === 'preview' && (
            <div className="preview-container rounded">
              {previewState.content ? (
                <>
                  <div className="mb-3 pb-2 border-bottom">
                    <h5 className="mb-1">{previewState.name}</h5>
                    <div className="email-subject d-flex align-items-center mb-2">
                      <span className="badge bg-primary me-2">Subject</span>
                      <span>{previewState.subject}</span>
                    </div>
                    <p className="text-muted mb-0">{previewState.description}</p>
                  </div>
                  <div className="ratio ratio-16x9" style={{ minHeight: '600px', background: '#fff' }}>
                    <iframe 
                      ref={previewIframeRef}
                      title="Email Template Preview" 
                      className="border-0 shadow-sm"
                    ></iframe>
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  {generatingTemplate ? (
                    <div>
                      <div className="spinner-border text-success mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <h5>Creating your email template...</h5>
                      <p className="text-muted">This may take a few moments</p>
                      <div className="progress mt-3" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                          role="progressbar" 
                          style={{ width: `${generationProgress}%` }} 
                          aria-valuenow={generationProgress} 
                          aria-valuemin={0} 
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <i className="bi bi-envelope-paper text-muted fs-1"></i>
                      </div>
                      <h5>No Email Template Generated Yet</h5>
                      <p className="text-muted">Go to the Template Generator tab and fill out the form to generate an AI-powered email template.</p>
                      <button 
                        className="btn btn-outline-primary mt-2" 
                        onClick={() => setActiveTab('editor')}
                      >
                        Go to Template Generator
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
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
                <li className="mb-2">Review your template in the <strong>Preview</strong> tab</li>
                <li className="mb-2">If needed, view or copy the HTML code in the <strong>HTML Code</strong> tab</li>
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
