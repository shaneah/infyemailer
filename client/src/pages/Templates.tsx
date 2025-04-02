import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <div className="alert alert-info" role="alert">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Fill out the form below to generate a professional email template using AI. The more specific your inputs, the better your results will be.
                  </div>
                </div>
              
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
                  <label htmlFor="keyPoints" className="form-label">Key Points to Include</label>
                  <textarea 
                    id="keyPoints" 
                    name="keyPoints" 
                    className="form-control"
                    placeholder="e.g., limited time offer, new features, special benefits (separate by commas)"
                    rows={4}
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
                    className="btn btn-success btn-lg w-100"
                    disabled={generateTemplateMutation.isPending || generatingTemplate}
                  >
                    {(generateTemplateMutation.isPending || generatingTemplate) ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating AI Email Template...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-magic me-2"></i>
                        Generate AI Email Template
                      </>
                    )}
                  </button>
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
