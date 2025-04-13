import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  PlusCircle, 
  Sparkles,
  Eye,
  Pencil,
  Trash2,
  Search,
  MoreVertical,
  Import,
  RefreshCcw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ImportTemplateModal from "@/components/ImportTemplateModal";
import CreateTemplateModal from "@/components/CreateTemplateModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  subject: string;
  category?: string;
  metadata?: {
    generatedByAI?: boolean;
    icon?: string;
    iconColor?: string;
    new?: boolean;
    previewImage?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Format date in a user-friendly way
function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric', 
    day: 'numeric', 
    year: 'numeric'
  }).format(date);
}

// Get placeholder image based on category
function getTemplateImage(template: Template) {
  if (template.metadata?.previewImage) {
    return template.metadata.previewImage;
  }
  
  const category = template.category?.toLowerCase() || "";
  
  // Return placeholder based on category using SVG data URLs
  if (category === "newsletter") {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23a5b4fc'/%3E%3Cpath d='M35,30 L65,30 L65,70 L35,70 Z' fill='%234f46e5'/%3E%3Cpath d='M40,40 L60,40 L60,45 L40,45 Z' fill='white'/%3E%3Cpath d='M40,50 L60,50 L60,55 L40,55 Z' fill='white'/%3E%3Cpath d='M40,60 L55,60 L55,65 L40,65 Z' fill='white'/%3E%3C/svg%3E";
  } else if (category === "welcome" || category === "onboarding") {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23bfdbfe'/%3E%3Ccircle cx='50' cy='40' r='15' fill='%233b82f6'/%3E%3Cpath d='M30,85 L70,85 L70,65 C70,55 60,50 50,50 C40,50 30,55 30,65 Z' fill='%233b82f6'/%3E%3C/svg%3E";
  } else if (category === "promotional" || category === "marketing") {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23fecaca'/%3E%3Cpath d='M30,70 L70,70 L70,40 L50,25 L30,40 Z' fill='%23ef4444'/%3E%3Cpath d='M45,70 L55,70 L55,55 L45,55 Z' fill='%23b91c1c'/%3E%3C/svg%3E";
  } else if (category === "events") {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23fde68a'/%3E%3Crect x='30' y='30' width='40' height='40' fill='%23d97706'/%3E%3Cpath d='M30,30 L70,30 L70,40 L30,40 Z' fill='%23f59e0b'/%3E%3Ccircle cx='40' cy='35' r='2' fill='%23fef3c7'/%3E%3Ccircle cx='50' cy='35' r='2' fill='%23fef3c7'/%3E%3Ccircle cx='60' cy='35' r='2' fill='%23fef3c7'/%3E%3C/svg%3E";
  } else if (category === "engagement") {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23fbcfe8'/%3E%3Cpath d='M30,50 C30,40 35,30 50,30 C65,30 70,40 70,50 C70,65 60,70 50,70 C40,70 30,65 30,50 Z' fill='%23ec4899'/%3E%3Cpath d='M42,45 C42,45 45,40 50,45 C55,40 58,45 58,45 L50,55 Z' fill='%23fbcfe8'/%3E%3C/svg%3E";
  }
  
  // Default placeholder
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Cpath d='M30,30 L70,30 L70,70 L30,70 Z' fill='%239ca3af'/%3E%3Cpath d='M40,40 L60,40 L60,45 L40,45 Z' fill='%23f3f4f6'/%3E%3Cpath d='M40,50 L60,50 L60,55 L40,55 Z' fill='%23f3f4f6'/%3E%3Cpath d='M40,60 L55,60 L55,65 L40,65 Z' fill='%23f3f4f6'/%3E%3C/svg%3E";
}

export default function EmailTemplatesNew() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'onboarding', name: 'Onboarding' },
    { id: 'newsletters', name: 'Newsletters' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'promotional', name: 'Promotional' },
    { id: 'events', name: 'Events' },
    { id: 'engagement', name: 'Engagement' }
  ];
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleTemplateCreated = (template: Template) => {
    toast({
      title: "Template Created",
      description: "Your template has been successfully created",
      variant: "default",
    });
    
    // Refresh templates list
    refetchTemplates();
  };
  
  const handleImportSuccess = (template: Template) => {
    toast({
      title: "Template Imported",
      description: "Your template has been successfully imported",
      variant: "default",
    });
    
    // Refresh templates list
    refetchTemplates();
  };

  // Fetch templates with a dedicated refetch function
  const { 
    data: savedTemplates = [], 
    isLoading: isLoadingTemplates,
    refetch: refetchTemplates,
    isRefetching
  } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      // Force a fresh fetch by adding timestamp to bypass browser cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/templates?_cache=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      return response.json();
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await apiRequest("DELETE", `/api/templates/${templateId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: "Template Deleted",
        description: "Your template has been deleted successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete template: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Filter templates based on search query and selected category
  const filteredTemplates = savedTemplates.filter((template: Template) => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (template.subject && template.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      activeCategory === "all" || 
      (template.category && template.category.toLowerCase() === activeCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  }).sort((a: Template, b: Template) => {
    // Sorting logic
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    } else if (sortBy === "name_asc") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "name_desc") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-purple-600">Email Templates</h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => refetchTemplates()}
            disabled={isRefetching}
            className="flex items-center gap-2" 
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isRefetching ? 'animate-spin' : ''}`}>
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2" 
          >
            Import
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-700 hover:bg-indigo-800 flex items-center gap-2" 
          >
            <PlusCircle className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>
      
      <div className="flex overflow-auto pb-1">
        <div className="flex space-x-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 whitespace-nowrap ${
                activeCategory === category.id 
                  ? "border-b-2 border-purple-500 font-medium text-purple-700" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort By</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoadingTemplates ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-md p-6 text-center">
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No templates match your search query "${searchQuery}".` 
                : "You don't have any templates yet. Create your first template."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                className="gap-2"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusCircle className="h-4 w-4" /> 
                Create Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: Template) => (
              <Card 
                key={template.id} 
                className="overflow-hidden border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img 
                    src={getTemplateImage(template)} 
                    alt={template.name}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => window.open(`/preview-template?id=${template.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/template-builder?id=${template.id}`}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit Template
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600" 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${template.name}?`)) {
                              deleteTemplateMutation.mutate(template.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardContent className="py-3">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-medium text-lg line-clamp-1">{template.name}</h3>
                    <div className="flex items-center">
                      <Badge variant="outline" className="font-normal text-xs text-gray-500 capitalize">
                        {template.category || 'General'}
                      </Badge>
                      {template.metadata?.generatedByAI && (
                        <div className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center">
                          <Sparkles className="h-2.5 w-2.5 mr-1" /> AI
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {template.description}
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0 pb-3 flex justify-between text-xs text-gray-500 border-t">
                  <div>Last modified: {formatDate(template.updatedAt || new Date().toISOString())}</div>
                  <Link href={`/template-builder?id=${template.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1 text-purple-600 hover:text-purple-700 p-0"
                    >
                      Use Template
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <ImportTemplateModal 
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportSuccess={handleImportSuccess}
      />
      
      <CreateTemplateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleTemplateCreated}
      />
    </div>
  );
}