import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Code, File } from "lucide-react";

interface ImportTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (template: any) => void;
}

export default function ImportTemplateModal({ open, onOpenChange, onImportSuccess }: ImportTemplateModalProps) {
  const [activeTab, setActiveTab] = useState<string>("html");
  const [templateName, setTemplateName] = useState<string>("");
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Import HTML template mutation
  const importHtmlMutation = useMutation({
    mutationFn: async (data: { name: string; content: string }) => {
      return apiRequest("POST", "/api/templates", {
        name: data.name,
        content: data.content,
        description: `Imported HTML template: ${data.name}`,
        category: "imported"
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      response.json().then(data => {
        onImportSuccess(data);
        toast({
          title: "Template Imported",
          description: "HTML template has been successfully imported",
        });
      });
      onOpenChange(false);
      setHtmlContent("");
      setTemplateName("");
    },
    onError: (error: any) => {
      console.error("Error importing template:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import template. Please check your HTML code.",
        variant: "destructive"
      });
    }
  });

  // Import ZIP template mutation
  const importZipMutation = useMutation({
    mutationFn: async (data: { name: string; file: File }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("file", data.file);
      
      return apiRequest("POST", "/api/templates/import-zip", formData, {
        headers: {
          // Don't set Content-Type here, it will be set automatically with the correct boundary
        }
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      response.json().then(data => {
        onImportSuccess(data);
        toast({
          title: "Template Imported",
          description: "ZIP template has been successfully imported",
        });
      });
      onOpenChange(false);
      setZipFile(null);
      setTemplateName("");
    },
    onError: (error: any) => {
      console.error("Error importing ZIP template:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import ZIP template. Please check your file.",
        variant: "destructive"
      });
    }
  });

  const handleHtmlImport = () => {
    if (!templateName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a template name",
        variant: "destructive"
      });
      return;
    }

    if (!htmlContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter HTML content",
        variant: "destructive"
      });
      return;
    }

    importHtmlMutation.mutate({
      name: templateName,
      content: htmlContent
    });
  };

  const handleZipImport = () => {
    if (!templateName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a template name",
        variant: "destructive"
      });
      return;
    }

    if (!zipFile) {
      toast({
        title: "Validation Error",
        description: "Please select a ZIP file",
        variant: "destructive"
      });
      return;
    }

    importZipMutation.mutate({
      name: templateName,
      file: zipFile
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/zip") {
      setZipFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid ZIP file",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Email Template</DialogTitle>
          <DialogDescription>
            Import an existing email template by uploading HTML code or a ZIP file with HTML and assets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              placeholder="Enter template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html" className="flex items-center gap-2">
                <Code className="h-4 w-4" /> HTML Code
              </TabsTrigger>
              <TabsTrigger value="zip" className="flex items-center gap-2">
                <File className="h-4 w-4" /> ZIP File
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Label htmlFor="htmlContent">HTML Content</Label>
                <Textarea
                  id="htmlContent"
                  placeholder="Paste your HTML code here"
                  className="min-h-[300px] font-mono text-sm"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Paste valid HTML code for your email template. Include all CSS inline for best email client compatibility.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="zip" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Label htmlFor="zipFile">ZIP File</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Drag and drop your ZIP file here, or click to browse.
                    <br />
                    The ZIP should contain an index.html file and any assets (images, CSS) it references.
                  </p>
                  <Input
                    id="zipFile"
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="zipFile">
                    <Button variant="outline" type="button">
                      <Upload className="h-4 w-4 mr-2" />
                      Select ZIP File
                    </Button>
                  </label>
                  {zipFile && (
                    <p className="text-sm text-primary mt-2">
                      Selected: {zipFile.name} ({Math.round(zipFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={activeTab === "html" ? handleHtmlImport : handleZipImport}
            disabled={importHtmlMutation.isPending || importZipMutation.isPending}
          >
            {(importHtmlMutation.isPending || importZipMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}