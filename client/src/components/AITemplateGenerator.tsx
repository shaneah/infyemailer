import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
      const response = await apiRequest('/api/generate-template', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
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
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <div className="d-flex align-items-center mb-2">
            <div className="bg-success bg-opacity-10 p-2 rounded-circle me-2">
              <i className="bi bi-robot fs-4 text-success"></i>
            </div>
            <h4 className="mb-0">AI Email Template Generator</h4>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'editor' | 'preview' | 'code')} className="mt-2">
            <TabsList className="grid grid-cols-3 w-[300px]">
              <TabsTrigger value="editor">
                <i className="bi bi-pencil-square me-1"></i> Editor
              </TabsTrigger>
              <TabsTrigger value="preview">
                <i className="bi bi-eye me-1"></i> Preview
              </TabsTrigger>
              <TabsTrigger value="code">
                <i className="bi bi-code-slash me-1"></i> HTML
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="pt-3">
        <div className="card-body p-0">
          <TabsContent value="editor" className="mt-0">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="templateType" className="form-label">Template Type</label>
                  <select 
                    id="templateType" 
                    name="templateType" 
                    className="form-select"
                    value={formData.templateType}
                    onChange={handleInputChange}
                    required
                  >
                    {templateTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="industry" className="form-label">Industry</label>
                  <input 
                    type="text" 
                    id="industry" 
                    name="industry" 
                    className="form-control"
                    placeholder="e.g., e-commerce, healthcare, technology"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-12">
                  <label htmlFor="purpose" className="form-label">Purpose</label>
                  <input 
                    type="text" 
                    id="purpose" 
                    name="purpose" 
                    className="form-control"
                    placeholder="e.g., announce a sale, share monthly updates"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-12">
                  <label htmlFor="targetAudience" className="form-label">Target Audience</label>
                  <input 
                    type="text" 
                    id="targetAudience" 
                    name="targetAudience" 
                    className="form-control"
                    placeholder="e.g., existing customers aged 25-45"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="brandTone" className="form-label">Brand Tone</label>
                  <select 
                    id="brandTone" 
                    name="brandTone" 
                    className="form-select"
                    value={formData.brandTone}
                    onChange={handleInputChange}
                  >
                    {brandToneOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Color Theme</label>
                  <div className="d-flex flex-wrap gap-2">
                    {colorThemes.map(theme => (
                      <div 
                        key={theme.id}
                        className={`color-theme-option ${selectedColorTheme.id === theme.id ? 'active' : ''}`}
                        onClick={() => handleColorThemeChange(theme.id)}
                        style={{ 
                          backgroundColor: theme.secondary, 
                          borderColor: selectedColorTheme.id === theme.id ? theme.primary : 'transparent',
                          cursor: 'pointer',
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          border: `2px solid ${selectedColorTheme.id === theme.id ? theme.primary : 'transparent'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title={theme.name}
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
                
                <div className="col-12">
                  <label htmlFor="keyPoints" className="form-label">Key Points to Include (optional)</label>
                  <textarea 
                    id="keyPoints" 
                    name="keyPoints" 
                    className="form-control"
                    placeholder="e.g., limited time offer, new features, special benefits"
                    rows={3}
                    value={formData.keyPoints}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check mt-1">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="saveTemplate" 
                      name="saveTemplate"
                      checked={formData.saveTemplate}
                      onChange={handleCheckboxChange}
                    />
                    <label className="form-check-label" htmlFor="saveTemplate">
                      Save template after generation
                    </label>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-check mt-1">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="autoPreview" 
                      name="autoPreview"
                      checked={autoPreviewEnabled}
                      onChange={() => setAutoPreviewEnabled(!autoPreviewEnabled)}
                    />
                    <label className="form-check-label" htmlFor="autoPreview">
                      Auto-switch to preview when generating
                    </label>
                  </div>
                </div>
                
                <div className="col-12 mt-3">
                  {generatingTemplate && (
                    <div className="mb-3">
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                          role="progressbar" 
                          style={{ width: `${generationProgress}%` }} 
                          aria-valuenow={generationProgress} 
                          aria-valuemin={0} 
                          aria-valuemax={100}
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-muted">Generating email template...</small>
                        <small className="text-muted">{Math.round(generationProgress)}%</small>
                      </div>
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="btn btn-success w-100"
                    disabled={generateTemplateMutation.isPending || generatingTemplate}
                  >
                    {(generateTemplateMutation.isPending || generatingTemplate) ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating Template...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic me-2"></i>
                        Generate AI Template
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className="preview-container bg-light rounded p-3">
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
                  <div className="ratio ratio-16x9" style={{ minHeight: '500px', background: '#fff' }}>
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
                      <p className="text-muted">Go to the Editor tab and fill out the form to generate an AI-powered email template.</p>
                      <button 
                        className="btn btn-outline-primary mt-2" 
                        onClick={() => setActiveTab('editor')}
                      >
                        Go to Editor
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="mt-0">
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
                      <i className="bi bi-clipboard me-1"></i> Copy
                    </button>
                  </div>
                  <pre className="m-0 p-3 text-white" style={{ 
                    maxHeight: '500px', 
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
          </TabsContent>
        </div>
      </CardContent>
    </Card>
  );
}