import React, { useState } from "react";
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
import { Loader2 } from "lucide-react";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setSubject("");
    setCategory("general");
    setContent("");
  };

  const importTemplateMutation = useMutation({
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
        description: `Failed to import template: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and HTML content",
        variant: "destructive",
      });
      return;
    }
    importTemplateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Email Template</DialogTitle>
          <DialogDescription>
            Paste HTML code to create a new email template.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <select
                id="category"
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
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
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
              disabled={importTemplateMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {importTemplateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}