import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  MoveRight, 
  FileText, 
  PlusCircle, 
  Search, 
  Mail, 
  Code, 
  Copy, 
  CheckCircle2,
  ArrowUpRight,
  LayoutTemplate,
  Sparkles,
  Filter,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  subject: string;
}

type TemplateCategory = 'all' | 'newsletter' | 'promotional' | 'transactional' | 'announcement';

export default function Templates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  
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
  
  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    // Scroll to the selected template details
    setTimeout(() => {
      document.getElementById('template-details')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const handleCopyHtmlCode = () => {
    if (selectedTemplate?.content) {
      navigator.clipboard.writeText(selectedTemplate.content);
      toast({
        title: "Copied",
        description: "HTML code copied to clipboard",
        variant: "default",
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter templates based on search query and active category
  const filteredTemplates = savedTemplates.filter((template: Template) => {
    const matchesSearch = 
      searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category if not showing all
    const matchesCategory = 
      activeCategory === 'all' || 
      (template as any)?.category?.toLowerCase() === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <>
      <div className="relative">
        {/* Header with gradient background */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-r from-primary/40 to-primary/10 -z-10 rounded-b-3xl"></div>
        
        {/* Main content */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 pb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage professional email templates for your campaigns
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href="/template-builder">
                <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md">
                  <PlusCircle className="h-4 w-4" /> 
                  Create New Template
                </Button>
              </Link>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  className="pl-9 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          
          {/* New Feature Banner */}
          <div className="mb-8">
            <Link href="/template-builder">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-xl p-6 cursor-pointer hover:shadow-md transition-all border border-primary/20">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="bg-gradient-to-br from-primary to-primary/70 text-white p-3 rounded-full">
                    <LayoutTemplate className="h-6 w-6" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium mb-1">Advanced Template Builder</h3>
                    <p className="text-muted-foreground">
                      Create stunning email templates with our drag-and-drop editor. No coding skills required!
                    </p>
                  </div>
                  <Button variant="ghost" className="gap-2 mt-2 md:mt-0">
                    Try it now <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Template categories */}
          <Tabs
            defaultValue="all"
            className="mb-6"
            onValueChange={(value) => setActiveCategory(value as TemplateCategory)}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Template Library
              </h2>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
                <TabsTrigger value="promotional">Promotional</TabsTrigger>
                <TabsTrigger value="announcement">Announcement</TabsTrigger>
                <TabsTrigger value="transactional">Transactional</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {renderTemplateGrid(filteredTemplates)}
            </TabsContent>
            <TabsContent value="newsletter" className="mt-0">
              {renderTemplateGrid(filteredTemplates)}
            </TabsContent>
            <TabsContent value="promotional" className="mt-0">
              {renderTemplateGrid(filteredTemplates)}
            </TabsContent>
            <TabsContent value="announcement" className="mt-0">
              {renderTemplateGrid(filteredTemplates)}
            </TabsContent>
            <TabsContent value="transactional" className="mt-0">
              {renderTemplateGrid(filteredTemplates)}
            </TabsContent>
          </Tabs>
          
          {/* Template Details Section */}
          {selectedTemplate && (
            <div id="template-details" className="mt-12 scroll-mt-4">
              <Card className="border-primary/20 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{selectedTemplate.name || 'Email Template'}</CardTitle>
                      <CardDescription className="mt-1">{selectedTemplate.description}</CardDescription>
                    </div>
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Template #{selectedTemplate.id}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 text-sm">
                      <Mail className="h-3.5 w-3.5" />
                      Subject: {selectedTemplate.subject || 'No subject'}
                    </Badge>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={handleCopyHtmlCode}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy HTML
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    
                    <Link href={`/template-builder?id=${selectedTemplate.id}`}>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="gap-2"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Edit Template
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="flex justify-between items-center bg-zinc-950 text-white px-4 py-3 border-b border-zinc-800">
                    <div className="flex items-center">
                      <Code className="h-4 w-4 mr-2 text-zinc-400" />
                      <span className="text-sm font-medium">Template HTML</span>
                    </div>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="text-xs hover:bg-zinc-800 text-zinc-300"
                      onClick={handleCopyHtmlCode}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy Code
                    </Button>
                  </div>
                  <pre className="p-4 text-xs bg-zinc-950 text-zinc-100 overflow-auto max-h-[400px]">
                    <code>{selectedTemplate.content || 'No template content available.'}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
  
  // Helper function to render template grid
  function renderTemplateGrid(templates: Template[]) {
    if (isLoadingTemplates) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your templates...</p>
        </div>
      );
    }
    
    if (templates.length === 0) {
      return (
        <div className="bg-gradient-to-r from-blue-50/50 to-primary/5 border border-blue-200 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery 
              ? `No templates match your search query "${searchQuery}". Try a different search term.` 
              : "You don't have any templates yet. Create your first template with our powerful template builder."}
          </p>
          <Link href="/template-builder">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" /> Create New Template
            </Button>
          </Link>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: Template) => (
          <Card 
            key={template.id} 
            className="flex flex-col overflow-hidden h-full transition-all hover:shadow-md border-muted hover:border-primary/20 group"
          >
            <CardHeader className="pb-2 pt-5">
              <div className="flex justify-between items-center">
                <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {(template as any)?.category || 'Template'}
                </Badge>
                <Badge variant="outline" className="text-xs">ID: {template.id}</Badge>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {template.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="py-2 flex-grow">
              <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <span className="font-medium shrink-0">Subject:</span>
                <span className="line-clamp-2 text-sm">{template.subject}</span>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 border-t bg-muted/30 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => handleCopyHtmlCode()}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                className="gap-1.5 justify-center text-sm font-normal text-muted-foreground hover:text-primary"
                onClick={() => handleViewTemplate(template)}
              >
                View Details <MoveRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
              <Link href={`/template-builder?id=${template.id}`}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
}