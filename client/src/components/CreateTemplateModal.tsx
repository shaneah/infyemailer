import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FilePenLine, 
  Copy, 
  Loader2 
} from "lucide-react";

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
  subject: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  metadata: any;
}

interface CreateTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (template: Template) => void;
}

const templateCategories = [
  { value: "general", label: "General" },
  { value: "newsletter", label: "Newsletter" },
  { value: "marketing", label: "Marketing" },
  { value: "promotional", label: "Promotional" },
  { value: "onboarding", label: "Onboarding" },
  { value: "events", label: "Events" },
  { value: "engagement", label: "Engagement" },
  { value: "imported", label: "Imported" },
];

export default function CreateTemplateModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTemplateModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [startingPoint, setStartingPoint] = useState<"blank" | "existing">("blank");
  const [existingTemplateId, setExistingTemplateId] = useState<number | null>(null);
  
  // Fetch all templates for the dropdown
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
    enabled: open && startingPoint === 'existing'
  });

  const resetForm = () => {
    setName("");
    setCategory("");
    setDescription("");
    setTags("");
    setStartingPoint("blank");
    setExistingTemplateId(null);
  };

  const createTemplateMutation = useMutation({
    mutationFn: async () => {
      // Prepare metadata with tags
      const metadata: any = {};
      
      if (tags) {
        metadata.tags = tags.split(",").map(tag => tag.trim());
      }

      const templateData = {
        name,
        description,
        category: category || "general",
        content: startingPoint === "blank" 
          ? "<html><body><h1>Start your template here</h1></body></html>" 
          : "",
        subject: `${name} Subject`,
        metadata
      };

      // For duplicating existing template, we would need to fetch it first and copy content
      if (startingPoint === "existing" && existingTemplateId) {
        const existingTemplate = await apiRequest("GET", `/api/templates/${existingTemplateId}`);
        const existingData = await existingTemplate.json();
        templateData.content = existingData.content;
      }

      const response = await apiRequest("POST", "/api/templates", templateData);
      return await response.json();
    },
    onSuccess: (newTemplate) => {
      // Invalidate the templates query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      
      toast({
        title: "Template Created",
        description: "Your new template has been created successfully.",
        variant: "default",
      });
      
      resetForm();
      onOpenChange(false);
      onSuccess(newTemplate);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create template: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your template",
        variant: "destructive",
      });
      return;
    }
    if (!category) {
      toast({
        title: "Missing information",
        description: "Please select a category for your template",
        variant: "destructive",
      });
      return;
    }
    createTemplateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Create a new email template to use in your campaigns.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="template-name"
                placeholder="e.g., Monthly Newsletter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>Select a category</option>
                {templateCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Add a description for this template"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags (comma separated)
              </Label>
              <Input
                id="tags"
                placeholder="e.g., Newsletter, Professional, Monthly"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <Label>Starting Point</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800 ${startingPoint === 'blank' ? 'border-primary ring-2 ring-primary' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => setStartingPoint('blank')}
                >
                  <FilePenLine className="h-12 w-12 mb-2 text-gray-500" />
                  <div className="font-medium">Blank Template</div>
                  <div className="text-sm text-muted-foreground">Start from scratch</div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-800 ${startingPoint === 'existing' ? 'border-primary ring-2 ring-primary' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => setStartingPoint('existing')}
                >
                  <Copy className="h-12 w-12 mb-2 text-gray-500" />
                  <div className="font-medium">Existing Template</div>
                  <div className="text-sm text-muted-foreground">Duplicate and modify</div>
                </div>
              </div>
            </div>

            {/* We would add the existing template selector if that option is chosen */}
            {startingPoint === 'existing' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="existing-template" className="text-right">
                  Template to Copy
                </Label>
                <select
                  id="existing-template"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => setExistingTemplateId(parseInt(e.target.value))}
                  value={existingTemplateId || ""}
                  required={startingPoint === 'existing'}
                >
                  <option value="" disabled>Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline" type="button" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={createTemplateMutation.isPending}
              className="bg-[#1E3A5F] hover:bg-[#15293f]"
            >
              {createTemplateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Open Editor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}