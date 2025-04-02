import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

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
}

export default function Templates() {
  const [activeTab, setActiveTab] = useState("all");
  
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

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Email Templates</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Link href="/template-builder">
            <button type="button" className="btn btn-sm btn-primary">
              <i className="bi bi-plus-lg me-1"></i> Create Template
            </button>
          </Link>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 max-w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletters</TabsTrigger>
              <TabsTrigger value="promotional">Promotional</TabsTrigger>
              <TabsTrigger value="transactional">Transactional</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {isLoading ? (
              [...Array(6)].map((_, index) => (
                <div className="col" key={index}>
                  <div className="card template-card">
                    <Skeleton className="h-40 w-full" />
                    <div className="card-body">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              templates?.map((template: Template) => (
                <div className="col" key={template.id}>
                  <div className={`card template-card ${template.selected ? 'selected' : ''}`}>
                    <div className="position-relative">
                      <div 
                        className="card-img-top bg-light d-flex justify-content-center align-items-center"
                        style={{ height: '160px' }}
                      >
                        <i className={`bi bi-${template.icon} fs-1 text-${template.iconColor}`}></i>
                      </div>
                      {template.new && (
                        <span className="position-absolute top-0 end-0 badge bg-success m-2">New</span>
                      )}
                    </div>
                    <div className="card-body">
                      <h6 className="card-title">{template.name}</h6>
                      <p className="card-text small text-muted">{template.description}</p>
                      <div className="d-flex gap-2 mt-3">
                        <Link href={`/template-builder/${template.id}`} className="flex-grow-1">
                          <button className="btn btn-sm btn-primary w-100">Use</button>
                        </Link>
                        <button className="btn btn-sm btn-outline-secondary flex-grow-1">Preview</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
                  templates?.slice(0, 3).map((template: Template) => (
                    <div className="list-group-item d-flex align-items-center gap-3" key={template.id}>
                      <div className={`bg-${template.iconColor} bg-opacity-10 p-2 rounded`}>
                        <i className={`bi bi-${template.icon} text-${template.iconColor}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-medium">{template.name}</div>
                        <small className="text-muted">Last used: {template.lastUsed}</small>
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
