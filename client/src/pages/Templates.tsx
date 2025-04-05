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
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-md">
              {/* Hero Header with AI Icon */}
              <div className="flex items-center mb-6">
                <div className="mr-4 p-2.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg shadow-sm relative">
                  {/* Pulsing dot */}
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-200 animate-pulse"></span>
                  
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                    <path d="M12 6.5c1.657 0 3 .843 3 1.883s-1.343 1.884-3 1.884-3-.844-3-1.884S10.343 6.5 12 6.5Z"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold text-slate-800">AI Email Template Generator</h3>
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full border border-teal-200">GPT-4o</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    Create professional email templates tailored to your specific needs
                  </p>
                </div>
              </div>

              {/* Steps Overview */}
              <div className="mb-6 flex flex-wrap gap-2">
                <div className="flex items-center px-3 py-2 bg-teal-50 rounded-lg">
                  <span className="w-5 h-5 flex items-center justify-center bg-teal-500 text-white rounded-full text-xs font-bold mr-2">1</span>
                  <span className="text-sm text-teal-700">Enter details</span>
                </div>
                <div className="flex items-center px-3 py-2 bg-blue-50 rounded-lg">
                  <span className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-full text-xs font-bold mr-2">2</span>
                  <span className="text-sm text-blue-700">AI creates template</span>
                </div>
                <div className="flex items-center px-3 py-2 bg-slate-50 rounded-lg">
                  <span className="w-5 h-5 flex items-center justify-center bg-slate-500 text-white rounded-full text-xs font-bold mr-2">3</span>
                  <span className="text-sm text-slate-700">Review & save</span>
                </div>
              </div>

              {/* Required Fields Note */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <div className="text-blue-500 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4"/>
                      <path d="M12 8h.01"/>
                    </svg>
                  </div>
                  <p className="text-sm text-blue-700">
                    Fields marked with <span className="text-red-500">*</span> are required for the AI to generate your template
                  </p>
                </div>
              </div>
              
              {/* Main Form Sections */}
              <div className="space-y-6">
                {/* Basic Email Info Section */}
                <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-teal-500 px-4 py-3">
                    <h4 className="font-medium text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </svg>
                      Basic Email Information
                    </h4>
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Template Type */}
                    <div>
                      <label htmlFor="templateType" className="block text-sm font-medium text-slate-700 mb-1">
                        Template Type <span className="text-red-500">*</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-1 inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>Select the type of email template you want to create</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <select 
                        id="templateType" 
                        name="templateType" 
                        className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={formData.templateType}
                        onChange={handleInputChange}
                        required
                      >
                        {templateTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Industry */}
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">
                        Industry <span className="text-red-500">*</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-1 inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>Enter your business industry to tailor the content</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <input 
                        type="text" 
                        id="industry" 
                        name="industry" 
                        className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., e-commerce, real estate, healthcare"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    {/* Purpose */}
                    <div className="md:col-span-2">
                      <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 mb-1">
                        Purpose <span className="text-red-500">*</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-1 inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>Describe what you want to achieve with this email</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <input 
                        type="text" 
                        id="purpose" 
                        name="purpose" 
                        className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., announce a sale, welcome new customers"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Helpful AI Tip */}
                  <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
                    <p className="text-xs text-slate-600 flex items-center">
                      <svg className="mr-1.5 text-teal-500" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                      </svg>
                      AI Tip: Being specific about your purpose helps create more relevant content
                    </p>
                  </div>
                </div>
                
                {/* Audience & Content */}
                <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-blue-500 px-4 py-3">
                    <h4 className="font-medium text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Audience & Content
                    </h4>
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Target Audience */}
                    <div>
                      <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-700 mb-1">
                        Target Audience <span className="text-red-500">*</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-1 inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>Describe who will receive this email (demographics, interests, etc.)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <input 
                        type="text" 
                        id="targetAudience" 
                        name="targetAudience" 
                        className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., existing customers aged 25-45"
                        value={formData.targetAudience}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    {/* Brand Tone */}
                    <div>
                      <label htmlFor="brandTone" className="block text-sm font-medium text-slate-700 mb-1">
                        Brand Tone
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-1 inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>Choose the voice and style for your email</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <select 
                        id="brandTone" 
                        name="brandTone" 
                        className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        value={formData.brandTone}
                        onChange={handleInputChange}
                      >
                        {brandToneOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Key Points */}
                    <div className="md:col-span-2">
                      <label htmlFor="keyPoints" className="block text-sm font-medium text-slate-700 mb-1">
                        Key Points to Include
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="ml-1 inline-flex items-center text-slate-400 hover:text-slate-700">
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>Enter specific details to include in your email (one per line)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                      <textarea 
                        id="keyPoints" 
                        name="keyPoints" 
                        className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="• Limited time offer ending soon
• Free shipping on orders over $50
• New spring collection now available"
                        rows={4}
                        value={formData.keyPoints}
                        onChange={handleInputChange}
                      ></textarea>
                      
                      {/* AI Tips Box */}
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                        <h5 className="text-xs font-medium text-blue-700 flex items-center mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                          </svg>
                          AI Writing Tips:
                        </h5>
                        <ul className="text-xs text-blue-600 grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
                          <li className="flex items-center">
                            <svg className="h-3 w-3 mr-1 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Include specific numbers
                          </li>
                          <li className="flex items-center">
                            <svg className="h-3 w-3 mr-1 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Mention deadlines for urgency
                          </li>
                          <li className="flex items-center">
                            <svg className="h-3 w-3 mr-1 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Add specific benefits
                          </li>
                          <li className="flex items-center">
                            <svg className="h-3 w-3 mr-1 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Include clear call-to-action
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Design Options */}
                <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-slate-700 px-4 py-3">
                    <h4 className="font-medium text-white flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <circle cx="13.5" cy="6.5" r="2.5" />
                        <circle cx="17.5" cy="10.5" r="2.5" />
                        <circle cx="8.5" cy="7.5" r="2.5" />
                        <circle cx="6.5" cy="12.5" r="2.5" />
                      </svg>
                      Design Options
                    </h4>
                  </div>
                  
                  <div className="p-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {colorThemes.map(theme => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleColorThemeChange(theme.id)}
                          className={`relative rounded-md overflow-hidden transition-all h-10 ${
                            selectedColorTheme.id === theme.id ? 'ring-2 ring-offset-2 ring-teal-500 scale-105' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: theme.secondary }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: theme.primary }}></div>
                          </div>
                          {selectedColorTheme.id === theme.id && (
                            <div className="absolute bottom-0.5 right-0.5 bg-white rounded-full p-0.5">
                              <Check className="h-2.5 w-2.5 text-teal-500" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-600">
                      <span className="mr-2">Selected:</span>
                      <span className="font-medium">{selectedColorTheme.name}</span>
                      <div className="ml-auto flex items-center">
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: selectedColorTheme.primary }}></div>
                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: selectedColorTheme.secondary }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Options & AI Info */}
                <div className="border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex flex-wrap gap-4 md:justify-between">
                      {/* Options */}
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="saveTemplate" 
                            name="saveTemplate"
                            className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                            checked={formData.saveTemplate}
                            onChange={handleCheckboxChange}
                          />
                          <label className="ml-2 text-sm text-slate-700" htmlFor="saveTemplate">
                            Save generated template to library
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="autoPreview" 
                            name="autoPreview"
                            className="h-4 w-4 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                            checked={autoPreviewEnabled}
                            onChange={() => setAutoPreviewEnabled(!autoPreviewEnabled)}
                          />
                          <label className="ml-2 text-sm text-slate-700" htmlFor="autoPreview">
                            Auto-switch to preview when ready
                          </label>
                        </div>
                      </div>
                      
                      {/* AI Info */}
                      <div className="flex items-center p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex flex-col items-center mr-3">
                          <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-1.5 rounded-md mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                            </svg>
                          </div>
                          <span className="text-xs text-slate-500">AI</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-700">Powered by GPT-4o</p>
                          <p className="text-xs text-slate-500">Optimized for marketing content</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Generate Button */}
              <div className="mt-6">
                {!generatingTemplate ? (
                  <Button 
                    type="submit" 
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
                    disabled={generateTemplateMutation.isPending || generatingTemplate}
                  >
                    <div className="bg-white/20 p-1 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                      </svg>
                    </div>
                    <span>Generate AI Email Template</span>
                  </Button>
                ) : (
                  <div className="w-full p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          <div className="absolute inset-0 bg-teal-400/30 rounded-full animate-ping"></div>
                          <div className="relative bg-gradient-to-r from-teal-500 to-blue-500 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2c1.714 0 3.33.567 4.615 1.556a1 1 0 0 1 .385.78v12.332a1 1 0 0 1-.385.78C15.33 18.433 13.714 19 12 19s-3.33-.567-4.615-1.556a1 1 0 0 1-.385-.78V4.333a1 1 0 0 1 .385-.78C8.67 2.567 10.286 2 12 2Z"/>
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">AI is working on your template</h4>
                          <p className="text-sm text-slate-500">
                            {generationProgress < 30 ? 'Analyzing your inputs...' : 
                             generationProgress < 60 ? 'Creating content structure...' : 
                             generationProgress < 90 ? 'Designing email layout...' : 
                             'Finalizing your template...'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xl font-semibold text-teal-600">{Math.round(generationProgress)}%</span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                    
                    {/* Processing steps */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className={`p-2 rounded text-xs flex items-center ${generationProgress > 20 ? 'bg-teal-50 text-teal-700' : 'bg-slate-50 text-slate-500'}`}>
                        {generationProgress > 20 ? (
                          <svg className="h-3.5 w-3.5 mr-1.5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          </svg>
                        )}
                        <span>Analyze inputs</span>
                      </div>
                      
                      <div className={`p-2 rounded text-xs flex items-center ${generationProgress > 40 ? 'bg-teal-50 text-teal-700' : 'bg-slate-50 text-slate-500'}`}>
                        {generationProgress > 40 ? (
                          <svg className="h-3.5 w-3.5 mr-1.5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          </svg>
                        )}
                        <span>Craft subject line</span>
                      </div>
                      
                      <div className={`p-2 rounded text-xs flex items-center ${generationProgress > 60 ? 'bg-teal-50 text-teal-700' : 'bg-slate-50 text-slate-500'}`}>
                        {generationProgress > 60 ? (
                          <svg className="h-3.5 w-3.5 mr-1.5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          </svg>
                        )}
                        <span>Create content</span>
                      </div>
                      
                      <div className={`p-2 rounded text-xs flex items-center ${generationProgress > 80 ? 'bg-teal-50 text-teal-700' : 'bg-slate-50 text-slate-500'}`}>
                        {generationProgress > 80 ? (
                          <svg className="h-3.5 w-3.5 mr-1.5 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          </svg>
                        )}
                        <span>Format HTML</span>
                      </div>
                    </div>
                  </div>
                )}
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
