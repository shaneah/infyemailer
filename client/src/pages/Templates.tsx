import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import AITemplateGenerator from "@/components/AITemplateGenerator";

interface Template {
  id: number;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  content: string;
  category: string;
  lastUsed?: string;
  selected?: boolean;
  new?: boolean;
  metadata?: any;
  previewImage?: string;
}

export default function Templates() {
  const [activeTab, setActiveTab] = useState("all");
  const [designMode, setDesignMode] = useState<'drag-drop' | 'html'>('drag-drop');
  
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/templates', activeTab],
    queryFn: async ({ queryKey }) => {
      const [url, category] = queryKey;
      const endpoint = category && category !== 'all' 
        ? `${url}?category=${category}` 
        : url;
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    }
  });

  const categories = [
    { id: 'email', name: 'Email' },
    { id: 'online-marketing', name: 'Online Marketing' },
    { id: 'webinar', name: 'Webinar' },
    { id: 'cooking', name: 'Cooking' },
    { id: 'home', name: 'Home' },
    { id: 'animals', name: 'Animals & Pets' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'technology', name: 'Technology' },
    { id: 'advertising', name: 'Advertising' },
    { id: 'internet', name: 'Internet' },
    { id: 'business', name: 'Business' },
    { id: 'domain', name: 'Domain Names' },
    { id: 'personal', name: 'Personal Sites' },
    { id: 'blog', name: 'Blog' }
  ];

  // Preview images for templates
  const templatePreviews = {
    'newsletter': 'https://i.imgur.com/X3McBPj.png',
    'promotional': 'https://i.imgur.com/HNgJlD1.png',
    'transactional': 'https://i.imgur.com/3fL9VK1.png',
    'welcome': 'https://i.imgur.com/D6m4SQy.png',
    'announcement': 'https://i.imgur.com/QsNY2q0.png',
    'discount': 'https://i.imgur.com/WM0vvTQ.png',
    'webinar': 'https://i.imgur.com/KGJUVP7.png',
    'feedback': 'https://i.imgur.com/mGZ9nrm.png'
  };

  // Add preview images to templates
  const templatesWithPreviews = templates.map((template: Template) => {
    // Use specific preview based on template type or fallback to a default
    let previewKey = 'newsletter';
    if (template && template.category) {
      previewKey = template.category.toLowerCase() as keyof typeof templatePreviews;
    }
    return {
      ...template,
      previewImage: templatePreviews[previewKey] || templatePreviews.newsletter
    };
  });

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Campaign Design</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link href="/template-builder">
            <button type="button" className="btn btn-sm btn-primary">
              <i className="bi bi-plus-lg me-1"></i> Create Template
            </button>
          </Link>
        </div>
      </div>

      <p className="text-center mb-4">Choose how you want to design your campaign or just select one from our popular designs</p>

      {/* Design Mode Selection */}
      <div className="row mb-5">
        <div className="col-md-6">
          <div className="card h-100 cursor-pointer" onClick={() => setDesignMode('drag-drop')}>
            <div className="card-body text-center py-4">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                <i className="bi bi-grid-3x3 fs-2 text-primary"></i>
              </div>
              <h4>Newfangled Drag and Drop Design Builder</h4>
              <p className="text-muted mb-0">Easy to use drag-n-drop builder to create mobile friendly email that looks great on any device or screen size.</p>
            </div>
            <div className="card-footer bg-transparent text-center">
              <button 
                className={`btn ${designMode === 'drag-drop' ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                Select
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 cursor-pointer" onClick={() => setDesignMode('html')}>
            <div className="card-body text-center py-4">
              <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                <i className="bi bi-code-slash fs-2 text-primary"></i>
              </div>
              <h4>HTML/Simple Text Editor</h4>
              <p className="text-muted mb-0">Copy and paste your own HTML code or use a simple editor for basic emails without complex design elements.</p>
            </div>
            <div className="card-footer bg-transparent text-center">
              <button 
                className={`btn ${designMode === 'html' ? 'btn-primary' : 'btn-outline-primary'}`}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center mb-3">
        <h3 className="mb-0 me-auto">Popular Designs</h3>
        <div className="btn-group">
          <button className="btn btn-sm btn-outline-secondary">Previous</button>
          <button className="btn btn-sm btn-outline-secondary">Next</button>
        </div>
      </div>

      {/* Categories Sidebar and Template Grid */}
      <div className="row mb-4">
        {/* Categories Sidebar */}
        <div className="col-md-3 col-lg-2">
          <div className="list-group categories-list mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`list-group-item list-group-item-action border-0 ${activeTab === category.id ? 'active bg-primary text-white' : ''}`}
                onClick={() => setActiveTab(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="col-md-9 col-lg-10">
          <div className="row g-3">
            {isLoading ? (
              [...Array(6)].map((_, index) => (
                <div className="col-md-6 col-lg-4 col-xl-3" key={index}>
                  <div className="card template-card h-100">
                    <Skeleton className="h-[180px] w-full" />
                    <div className="card-body">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full mt-1" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              templatesWithPreviews?.map((template: Template) => (
                <div className="col-md-6 col-lg-4 col-xl-3" key={template.id}>
                  <div className={`card template-card h-100 ${template.selected ? 'selected' : ''}`}>
                    <div className="position-relative template-preview">
                      <img 
                        src={template.previewImage} 
                        alt={template.name} 
                        className="card-img-top"
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                      {template.new && (
                        <span className="position-absolute top-0 end-0 badge bg-success m-2">New</span>
                      )}
                      <div className="template-actions position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center opacity-0">
                        <Link href={`/template-builder/${template.id}`}>
                          <button className="btn btn-primary me-2">
                            <i className="bi bi-pencil-square me-1"></i> Edit
                          </button>
                        </Link>
                        <button className="btn btn-outline-light">
                          <i className="bi bi-eye me-1"></i> Preview
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <h6 className="card-title">{template.name}</h6>
                      <p className="card-text small text-muted">{template.description}</p>
                    </div>
                    <div className="card-footer bg-transparent d-flex gap-2">
                      <Link href={`/template-builder/${template.id}`} className="flex-grow-1">
                        <button className="btn btn-sm btn-primary w-100">Use This</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <AITemplateGenerator onTemplateGenerated={(template) => {
            // Handle generated template if needed
            console.log("Template generated:", template);
          }} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Recently Used Templates</h5>
            </CardHeader>
            <CardContent>
              <div className="list-group">
                {isLoading ? (
                  [...Array(3)].map((_, index) => (
                    <div className="list-group-item d-flex align-items-center gap-3" key={index}>
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-grow-1">
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))
                ) : (
                  templatesWithPreviews?.slice(0, 3).map((template: Template) => (
                    <div className="list-group-item d-flex align-items-center gap-3" key={template.id}>
                      <div className="template-thumbnail" style={{ width: '50px', height: '50px' }}>
                        <img 
                          src={template.previewImage} 
                          alt={template.name} 
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-medium">{template.name}</div>
                        <small className="text-muted">Last used: {template.lastUsed || 'Never'}</small>
                      </div>
                      <Link href={`/template-builder/${template.id}`}>
                        <button className="btn btn-sm btn-outline-primary">Use</button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-md-6">
          <Card>
            <CardHeader>
              <h5 className="mb-0">Import Template</h5>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 border border-dashed rounded-md">
                <i className="bi bi-cloud-upload fs-2 text-muted mb-3"></i>
                <h6>Import from file or URL</h6>
                <p className="text-muted mb-3">Drag and drop HTML file here or click to browse</p>
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-outline-primary">
                    <i className="bi bi-file-earmark-code me-1"></i> Browse Files
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-link-45deg me-1"></i> Import from URL
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
