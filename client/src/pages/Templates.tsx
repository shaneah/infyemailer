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
import { Loader2, MoveRight, ExternalLink, FileText, PlusCircle } from "lucide-react";

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
  
  return (
    <>
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage email templates for your campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/template-builder">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Open in Editor
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Email Templates
          </h2>
          <Link href="/template-builder">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Create New Template
            </Button>
          </Link>
        </div>
        
        {isLoadingTemplates ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : savedTemplates.length === 0 ? (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  No saved templates found. Create templates using the Template Editor.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTemplates.map((template: Template) => (
              <Card key={template.id} className="flex flex-col overflow-hidden h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className="ml-2" variant="secondary">ID: {template.id}</Badge>
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
                <CardFooter className="pt-2 border-t bg-muted/50">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between"
                    onClick={() => handleViewTemplate(template)}
                  >
                    View Template <MoveRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {selectedTemplate && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{selectedTemplate.name || 'Email Template'}</CardTitle>
              <CardDescription>{selectedTemplate.description}</CardDescription>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="text-sm mr-2">Subject:</Badge>
                <span className="text-sm">{selectedTemplate.subject || 'No subject'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex justify-between items-center bg-muted p-2 rounded-t-md">
                  <span className="text-xs font-medium">HTML Source</span>
                  <Button variant="ghost" size="sm" onClick={handleCopyHtmlCode}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                    >
                      <path
                        d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    Copy Code
                  </Button>
                </div>
                <pre className="p-4 text-xs bg-zinc-950 text-zinc-100 overflow-auto rounded-b-md max-h-[400px]">
                  <code>{selectedTemplate.content || 'No template content available.'}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}