import React, { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2,
  FileUp,
  FileCode,
  Archive,
  Paintbrush,
  Code,
  Text
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  subject: string;
  category?: string;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface ImportTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (template: Template) => void;
}

export default function ImportTemplateModal({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportTemplateModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importTab, setImportTab] = useState<string>("html");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setSubject("");
    setCategory("general");
    setContent("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const importHtmlTemplateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/templates/import", {
        name,
        description,
        subject,
        category,
        content,
      });
      return response.json();
    },
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      resetForm();
      onOpenChange(false);
      onImportSuccess(newTemplate);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to import HTML template: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const importZipTemplateMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description || "");
      formData.append("subject", subject || "");
      formData.append("category", category);
      formData.append("templateFile", file);
      
      setFileUploading(true);
      const response = await fetch("/api/templates/import-zip", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to import ZIP template");
      }
      
      return response.json();
    },
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      resetForm();
      onOpenChange(false);
      onImportSuccess(newTemplate);
      setFileUploading(false);
    },
    onError: (error) => {
      setFileUploading(false);
      toast({
        title: "Error",
        description: `Failed to import ZIP template: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleHtmlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and HTML content",
        variant: "destructive",
      });
      return;
    }
    importHtmlTemplateMutation.mutate();
  };

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and ZIP file",
        variant: "destructive",
      });
      return;
    }
    importZipTemplateMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/zip" && 
          selectedFile.type !== "application/x-zip-compressed" && 
          !selectedFile.name.endsWith('.zip')) {
        toast({
          title: "Invalid file type",
          description: "Please select a ZIP file",
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
    }
  };

  const isPending = importHtmlTemplateMutation.isPending || importZipTemplateMutation.isPending || fileUploading;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Email Template</DialogTitle>
          <DialogDescription>
            Import an email template using HTML code or a ZIP file package.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={importTab} onValueChange={setImportTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>HTML Code</span>
            </TabsTrigger>
            <TabsTrigger value="zip" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <span>ZIP Package</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="html">
            <form onSubmit={handleHtmlSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="html-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="html-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="html-subject" className="text-right">
                    Subject
                  </Label>
                  <Input
                    id="html-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="html-category" className="text-right">
                    Category
                  </Label>
                  <select
                    id="html-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="general">General</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="marketing">Marketing</option>
                    <option value="promotional">Promotional</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="events">Events</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="html-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="html-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">
                    HTML Content
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="col-span-3 font-mono text-xs"
                    rows={10}
                    required
                    placeholder="<html>&#10;  <body>&#10;    <!-- Your HTML Template Here -->&#10;  </body>&#10;</html>"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {importHtmlTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FileCode className="mr-2 h-4 w-4" />
                      Import HTML Template
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="zip">
            <form onSubmit={handleZipSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zip-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="zip-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zip-subject" className="text-right">
                    Subject
                  </Label>
                  <Input
                    id="zip-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zip-category" className="text-right">
                    Category
                  </Label>
                  <select
                    id="zip-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="general">General</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="marketing">Marketing</option>
                    <option value="promotional">Promotional</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="events">Events</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zip-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="zip-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="zipFile" className="text-right pt-2">
                    ZIP File
                  </Label>
                  <div className="col-span-3">
                    <div className="grid gap-2">
                      <Input
                        ref={fileInputRef}
                        id="zipFile"
                        type="file"
                        accept=".zip"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        onChange={handleFileChange}
                        required
                      />
                      {file && (
                        <div className="text-xs text-gray-500 mt-1">
                          Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        <p className="font-medium mb-1">ZIP package should contain:</p>
                        <ul className="list-disc list-inside pl-2 space-y-1">
                          <li>index.html (main template file)</li>
                          <li>css folder (optional)</li>
                          <li>images folder (optional)</li>
                          <li>fonts folder (optional)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {fileUploading || importZipTemplateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      Import ZIP Template
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}