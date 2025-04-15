import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Sparkles, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Form schema for new template
const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().default('general'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required').default('<p>Your email content here</p>'),
});

type CreateTemplateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateTemplateModal({ open, onOpenChange }: CreateTemplateModalProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('visual');
  
  // Form for manually creating a template
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'general',
      subject: '',
      content: '<p>Your email content here</p>',
    },
  });
  
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof templateSchema>) => {
      const response = await apiRequest('POST', '/api/templates', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof templateSchema>) => {
    createTemplateMutation.mutate(data);
  };
  
  const handleImportClick = () => {
    // Close this modal and navigate
    onOpenChange(false);
    // Slight delay to avoid modal transition issues
    setTimeout(() => {
      navigate('/template-builder?mode=import');
    }, 100);
  };

  const handleAIGeneratorClick = () => {
    // Close this modal and navigate
    onOpenChange(false);
    // Slight delay to avoid modal transition issues
    setTimeout(() => {
      navigate('/template-builder?mode=ai');
    }, 100);
  };
  
  const handleVisualBuilderClick = () => {
    // Close this modal and navigate
    onOpenChange(false);
    // Slight delay to avoid modal transition issues
    setTimeout(() => {
      navigate('/template-builder');
    }, 100);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Template</DialogTitle>
          <DialogDescription>
            Choose a method to create your email template
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="visual" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="visual">Visual Builder</TabsTrigger>
            <TabsTrigger value="ai">AI Generator</TabsTrigger>
            <TabsTrigger value="import">Import HTML</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="space-y-4">
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-md p-5 border border-teal-100">
              <div className="flex items-start">
                <div className="mr-4 bg-gradient-to-r from-teal-500 to-blue-500 p-2 rounded-md shadow-sm">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Visual Template Builder</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Create professional email templates with our drag-and-drop visual editor - no coding required.
                  </p>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                    onClick={handleVisualBuilderClick}
                  >
                    Open Visual Builder
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-md p-5 border border-indigo-100">
              <div className="flex items-start">
                <div className="mr-4 bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-md shadow-sm">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI Template Generator</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Generate beautiful email templates with AI by describing what you need in plain English.
                  </p>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onClick={handleAIGeneratorClick}
                  >
                    Generate with AI
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-md p-5 border border-blue-100">
              <div className="flex items-start">
                <div className="mr-4 bg-gradient-to-r from-blue-500 to-sky-500 p-2 rounded-md shadow-sm">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Import HTML Template</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Import existing HTML templates or paste code from external sources.
                  </p>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700"
                    onClick={handleImportClick}
                  >
                    Import HTML
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}