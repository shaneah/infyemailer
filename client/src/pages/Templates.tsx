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
  Copy, 
  Sparkles,
  Wand2,
  ChevronDown,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedTemplateGenerator from "@/components/AdvancedTemplateGenerator";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  subject: string;
  metadata?: {
    generatedByAI?: boolean;
    icon?: string;
    iconColor?: string;
    new?: boolean;
    [key: string]: any;
  };
}

export default function Templates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  
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

  const handleTemplateGenerated = (template: Template) => {
    toast({
      title: "Template Created",
      description: "Your AI template has been generated and saved to the library",
      variant: "default",
    });
    setSelectedTemplate(template);
  };

  // Filter templates based on search query and selected category
  const filteredTemplates = savedTemplates.filter((template: Template) => {
    const matchesSearch = searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeTab === "all" || 
      (template.metadata?.generatedByAI && activeTab === "ai") ||
      (!template.metadata?.generatedByAI && activeTab === "manual");
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage email templates for your campaigns
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Input
              type="search"
              placeholder="Search templates..."
              className="w-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowAIGenerator(!showAIGenerator)}
            >
              {showAIGenerator ? (
                <>Hide AI Generator</>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> 
                  AI Template Generator
                </>
              )}
            </Button>
            <Link href="/template-builder">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" /> 
                Create Manual Template
              </Button>
            </Link>
          </div>
        </div>

        <Collapsible open={showAIGenerator} onOpenChange={setShowAIGenerator}>
          <CollapsibleContent className="mt-2">
            <AdvancedTemplateGenerator onTemplateGenerated={handleTemplateGenerated} />
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Template Library
          </h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Templates
              </TabsTrigger>
              <TabsTrigger value="manual">Manual Templates</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoadingTemplates ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No templates match your search query "${searchQuery}".` 
                : "You don't have any templates yet. Create your first template."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowAIGenerator(true)}
              >
                <Wand2 className="h-4 w-4" /> 
                Use AI Generator
              </Button>
              <Link href="/template-builder">
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" /> Create Manual Template
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template: Template) => (
              <Card 
                key={template.id} 
                className="flex flex-col h-full border hover:border-primary/30 hover:shadow-md transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.metadata?.generatedByAI && (
                        <div className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center">
                          <Sparkles className="h-2.5 w-2.5 mr-1" /> AI
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">ID: {template.id}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="py-2 flex-grow">
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <span className="font-medium">Subject:</span>
                    <span className="line-clamp-2">{template.subject}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2 border-t flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTemplate(template)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(`/preview-template?id=${template.id}`, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  <Link href={`/template-builder?id=${template.id}`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {selectedTemplate && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Template Details</h2>
          <Card className="border">
            <CardHeader>
              <div className="flex items-center">
                <CardTitle>{selectedTemplate.name}</CardTitle>
                {selectedTemplate.metadata?.generatedByAI && (
                  <div className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                  </div>
                )}
              </div>
              <CardDescription>{selectedTemplate.description}</CardDescription>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="mr-2">Subject:</Badge>
                <span className="text-sm">{selectedTemplate.subject || 'No subject'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex justify-between items-center bg-muted p-2 rounded-t-md">
                  <span className="text-xs font-medium">Template HTML</span>
                  <Button variant="ghost" size="sm" onClick={handleCopyHtmlCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
                <pre className="p-4 text-xs bg-zinc-950 text-zinc-100 overflow-auto rounded-b-md max-h-[400px]">
                  <code>{selectedTemplate.content || 'No template content available.'}</code>
                </pre>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyHtmlCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.open(`/preview-template?id=${selectedTemplate.id}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
              <Link href={`/template-builder?id=${selectedTemplate.id}`}>
                <Button>
                  Edit Template
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}