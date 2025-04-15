import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Wand2, PlusCircle, Import, Pencil, FileText, Code, Mail, X, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTemplate: (data: any) => void;
  onShowAIGenerator: () => void;
  onShowImportModal: () => void;
}

// Template update form schema
const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().min(1, "Description is required"),
  subject: z.string().min(1, "Subject line is required"),
  content: z.string().min(1, "HTML content is required"),
  category: z.string().default("general"),
});

export default function CreateTemplateDialog({
  isOpen,
  onOpenChange,
  onCreateTemplate,
  onShowAIGenerator,
  onShowImportModal
}: CreateTemplateDialogProps) {
  const { toast } = useToast();
  
  // Initialize the form
  const form = useForm<z.infer<typeof createTemplateSchema>>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      subject: "",
      content: "",
      category: "general"
    }
  });

  // Handle form submission
  const handleSubmit = (data: z.infer<typeof createTemplateSchema>) => {
    onCreateTemplate(data);
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-hidden rounded-xl">
        <div className="flex flex-col h-full">
          {/* Header with gradient */}
          <div className="sticky top-0 z-20 bg-white shadow-sm">
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>
            <div className="p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Create New Template</h2>
                <p className="text-sm text-gray-500">
                  Design a professional template for your email campaigns
                </p>
              </div>
              <Button 
                variant="ghost"
                size="icon" 
                onClick={() => onOpenChange(false)}
                className="text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
              
          {/* Main content with scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 bg-gray-50">
              <Form {...form}>
                <form 
                  onSubmit={form.handleSubmit(handleSubmit)} 
                  className="space-y-5"
                >
                  {/* Creation Options */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-base font-medium text-gray-800 mb-3">Choose Your Method</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Select the easiest way to create your email template
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center text-center"
                        onClick={() => {
                          onOpenChange(false);
                          window.open('/template-builder', '_blank');
                        }}
                      >
                        <div className="bg-blue-50 rounded-full p-3 mb-2">
                          <Pencil className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800 mb-1">Visual Builder</span>
                        <p className="text-xs text-gray-600">Drag-and-drop interface to create beautiful templates</p>
                      </div>
                      
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center text-center"
                        onClick={() => {
                          onOpenChange(false);
                          onShowAIGenerator();
                        }}
                      >
                        <div className="bg-indigo-50 rounded-full p-3 mb-2">
                          <Wand2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-800 mb-1">AI Generator</span>
                        <p className="text-xs text-gray-600">Let AI create a professional template for you</p>
                      </div>
                      
                      <div 
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center text-center"
                        onClick={() => {
                          onOpenChange(false);
                          onShowImportModal();
                        }}
                      >
                        <div className="bg-purple-50 rounded-full p-3 mb-2">
                          <Import className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-800 mb-1">Import HTML</span>
                        <p className="text-xs text-gray-600">Import existing HTML code or templates</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Basic Details */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-base font-medium text-gray-800 mb-3">
                      Basic Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g. Monthly Newsletter" 
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="newsletter">Newsletter</SelectItem>
                                <SelectItem value="promotional">Promotional</SelectItem>
                                <SelectItem value="announcement">Announcement</SelectItem>
                                <SelectItem value="welcome">Welcome</SelectItem>
                                <SelectItem value="transactional">Transactional</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="A brief description of your template" 
                                className="resize-none h-20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Email Subject */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-base font-medium text-gray-800 mb-3">
                      Email Subject
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Line</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. Your Monthly Update from [Company]" 
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            This is what recipients will see in their inbox
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* HTML Content */}
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-base font-medium text-gray-800 mb-3">
                      HTML Content
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HTML Code</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="<!DOCTYPE html><html><head>...</head><body>Your email content here</body></html>" 
                              className="font-mono text-xs h-[200px] resize-none bg-gray-50"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Paste your HTML email code here or use one of our template creation tools above
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      onClick={() => onOpenChange(false)} 
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create Template
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}