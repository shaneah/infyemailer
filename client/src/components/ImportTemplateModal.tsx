import { useState, useRef } from "react";
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
import { Separator } from "@/components/ui/separator";

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
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHtmlDragging, setIsHtmlDragging] = useState<boolean>(false);
  const zipFileInputRef = useRef<HTMLInputElement>(null);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Import HTML template mutation
  const importHtmlMutation = useMutation({
    mutationFn: async (data: { name: string; content: string }) => {
      console.log("Importing HTML template...", data.name);
      try {
        // Create the email content structure (this needs to be a string in the database)
        const emailContentStructure = {
          name: data.name,
          subject: `${data.name}`,
          previewText: `${data.name} - Imported HTML Template`,
          sections: [
            {
              id: `section-${Date.now()}`,
              elements: [
                {
                  id: `element-${Date.now()}`,
                  type: "text",
                  content: { 
                    text: "This template was imported from HTML. You can now edit it using the drag-and-drop editor." 
                  },
                  styles: { 
                    fontSize: "16px", 
                    color: "#666666", 
                    textAlign: "left" 
                  }
                },
                {
                  id: `element-${Date.now() + 1}`,
                  type: "html",
                  content: { 
                    html: data.content 
                  },
                  styles: {}
                }
              ],
              styles: {
                backgroundColor: "#ffffff",
                padding: "12px"
              }
            }
          ],
          styles: {
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#f4f4f4",
            maxWidth: "600px"
          }
        };

        // Create a template object with responsive email structure
        const templateData = {
          name: data.name,
          // Make sure this is properly stringified content
          content: JSON.stringify(emailContentStructure),
          description: `Imported HTML template: ${data.name}`,
          category: "imported",
          subject: `${data.name} Subject`,
          metadata: {
            importedFromHtml: true,
            new: true,
            importMethod: htmlFile ? 'file' : 'paste',
            originalFileName: htmlFile?.name
            // Don't include originalHtml in metadata as it can be too large and cause issues
          }
        };

        console.log("Sending template data...");
        // Use regular fetch instead of apiRequest for better error handling with HTML content
        const response = await fetch("/api/templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(templateData),
          credentials: "include"
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to import template: ${errorText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error in mutation function:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Import success:", data);
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      onImportSuccess(data);
      toast({
        title: "Template Imported",
        description: "HTML template has been successfully imported",
      });
      onOpenChange(false);
      setHtmlContent("");
      setHtmlFile(null);
      setTemplateName("");
    },
    onError: (error: any) => {
      console.error("Error importing template:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import template: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    }
  });

  // Import ZIP template mutation
  const importZipMutation = useMutation({
    mutationFn: async (data: { name: string; file: File }) => {
      console.log("Preparing ZIP upload for template:", data.name);
      
      try {
        // Create a multipart form-data object
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("zipFile", data.file); // Change key to zipFile to match server expectation
        
        console.log("File information:", {
          name: data.file.name,
          type: data.file.type,
          size: data.file.size
        });
        
        // First, try with proper multipart/form-data
        const response = await fetch("/api/templates/import-zip", {
          method: "POST",
          body: formData,
          credentials: "include",
          // Let the browser set the correct Content-Type with boundary
        });
        
        console.log("Response status:", response.status, response.statusText);
        
        if (!response.ok) {
          // Try to get detailed error information
          let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
          
          try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errorData = await response.json();
              if (errorData && errorData.error) {
                errorMessage = errorData.error;
              }
            } else {
              // If not JSON, try to get text
              const errorText = await response.text();
              if (errorText) {
                errorMessage = `Server error: ${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}`;
              }
            }
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }
          
          // Throw a detailed error
          throw new Error(`Failed to import template: ${errorMessage}`);
        }
        
        // Parse successful response
        try {
          const result = await response.json();
          console.log("Template import successful:", result);
          return result;
        } catch (jsonError) {
          console.error("Error parsing success response:", jsonError);
          throw new Error("Invalid response from server: not valid JSON");
        }
      } catch (error) {
        console.error("ZIP import error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      onImportSuccess(data);
      toast({
        title: "Template Imported",
        description: "ZIP template has been successfully imported",
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

  const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check for .zip extension or zip mime type
      const isZip = file.name.toLowerCase().endsWith('.zip') || 
                  file.type === "application/zip" || 
                  file.type === "application/x-zip-compressed";
      
      if (isZip) {
        setZipFile(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a valid ZIP file",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleHtmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check for .html extension or html mime type
      const isHtml = file.name.toLowerCase().endsWith('.html') || 
                    file.name.toLowerCase().endsWith('.htm') || 
                    file.type === "text/html";
      
      if (isHtml) {
        setHtmlFile(file);
        
        // Read file content
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setHtmlContent(content || "");
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a valid HTML file",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Email Template</DialogTitle>
          <DialogDescription>
            Import an existing email template by uploading HTML code, an HTML file, or a ZIP file with HTML and assets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {importHtmlMutation.error || importZipMutation.error ? (
            <div className="p-3 bg-destructive/15 text-destructive rounded-md mb-4">
              <p className="text-sm font-medium">Validation Error</p>
              <p className="text-xs mt-1">Please enter a template name</p>
            </div>
          ) : null}
          
          <div className="space-y-4">
            <Label htmlFor="templateName" className="flex">
              Template Name <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="templateName"
              placeholder="Enter template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className={!templateName.trim() ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html" className="flex items-center gap-2">
                <Code className="h-4 w-4" /> HTML Import
              </TabsTrigger>
              <TabsTrigger value="zip" className="flex items-center gap-2">
                <File className="h-4 w-4" /> ZIP File
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* HTML File Upload */}
                <div className="space-y-2">
                  <Label>Upload HTML File</Label>
                  <div 
                    className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center
                      ${isHtmlDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsHtmlDragging(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsHtmlDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsHtmlDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsHtmlDragging(false);
                      
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        const file = files[0];
                        const isHtml = file.name.toLowerCase().endsWith('.html') || 
                                    file.name.toLowerCase().endsWith('.htm') || 
                                    file.type === "text/html";
                        
                        if (isHtml) {
                          setHtmlFile(file);
                          
                          // Read file content
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const content = e.target?.result as string;
                            setHtmlContent(content || "");
                          };
                          reader.readAsText(file);
                        } else {
                          toast({
                            title: "Invalid File",
                            description: "Please select a valid HTML file",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                    onClick={() => htmlFileInputRef.current?.click()}
                  >
                    <Upload className={`h-8 w-8 mb-2 ${isHtmlDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-sm text-muted-foreground text-center mb-2">
                      {isHtmlDragging ? (
                        <span className="font-medium text-primary">Drop HTML file here</span>
                      ) : (
                        <>
                          Drag and drop HTML file here, or click to browse
                        </>
                      )}
                    </p>
                    <Input
                      ref={htmlFileInputRef}
                      id="htmlFile"
                      type="file"
                      accept=".html,.htm,text/html"
                      className="hidden"
                      onChange={handleHtmlFileChange}
                    />
                    <Button variant="outline" size="sm" type="button" onClick={(e) => {
                      e.stopPropagation();
                      htmlFileInputRef.current?.click();
                    }}>
                      <Upload className="h-4 w-4 mr-2" />
                      Select HTML File
                    </Button>
                    {htmlFile && (
                      <p className="text-sm text-primary mt-2">
                        Selected: {htmlFile.name} ({Math.round(htmlFile.size / 1024)} KB)
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="relative my-4">
                  <Separator />
                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-background text-xs text-muted-foreground">
                    OR PASTE HTML CODE
                  </div>
                </div>
                
                {/* HTML Content Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="htmlContent">HTML Content</Label>
                  <Textarea
                    id="htmlContent"
                    placeholder="Paste your HTML code here"
                    className="min-h-[200px] font-mono text-sm"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste valid HTML code for your email template. Include all CSS inline for best email client compatibility.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="zip" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Label htmlFor="zipFile">ZIP File</Label>
                <div 
                  className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const file = files[0];
                      const isZip = file.name.toLowerCase().endsWith('.zip') || 
                                  file.type === "application/zip" ||
                                  file.type === "application/x-zip-compressed";
                      
                      if (isZip) {
                        setZipFile(file);
                      } else {
                        toast({
                          title: "Invalid File",
                          description: "Please select a valid ZIP file",
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                  onClick={() => zipFileInputRef.current?.click()}
                >
                  <Upload className={`h-10 w-10 mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {isDragging ? (
                      <span className="font-medium text-primary">Drop ZIP file here</span>
                    ) : (
                      <>
                        Drag and drop your ZIP file here, or click to browse.
                        <br />
                        The ZIP should contain an index.html file and any assets (images, CSS) it references.
                      </>
                    )}
                  </p>
                  <Input
                    ref={zipFileInputRef}
                    id="zipFile"
                    type="file"
                    accept=".zip,.zip-compressed"
                    className="hidden"
                    onChange={handleZipFileChange}
                  />
                  <Button variant="outline" type="button" onClick={(e) => {
                    e.stopPropagation();
                    zipFileInputRef.current?.click();
                  }}>
                    <Upload className="h-4 w-4 mr-2" />
                    Select ZIP File
                  </Button>
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