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
import { Loader2, MoveRight, FileText, PlusCircle, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  subject: string;
}

export default function Templates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
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

  // Filter templates based on search query
  const filteredTemplates = savedTemplates.filter((template: Template) => {
    return searchQuery === "" || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase());
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
        
        <Link href="/template-builder">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> 
            Create New Template
          </Button>
        </Link>
      </div>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Template Library
          </h2>
          
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
              <Link href="/template-builder">
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" /> Create New Template
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template: Template) => (
                <Card 
                  key={template.id} 
                  className="flex flex-col h-full border"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewTemplate(template)}
                    >
                      View Details
                    </Button>
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
                <CardTitle>{selectedTemplate.name}</CardTitle>
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
                <Button variant="outline" onClick={handleCopyHtmlCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
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
    </div>
  );
}