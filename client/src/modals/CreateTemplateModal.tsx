import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'wouter';
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
      // Get client ID from session
      const sessionResponse = await fetch('/api/client/session');
      const session = await sessionResponse.json();
      if (!session.user?.clientId) {
        throw new Error('Client not authenticated');
      }
      
      // Create template with client ID
      const response = await apiRequest('POST', `/api/client/${session.user.clientId}/templates`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client/templates'] });
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
  
  // We now use a direct link for navigation
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="text-center pb-2 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Create New Template
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Design beautiful emails with our visual builder
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col items-center justify-center">
          <div className="p-6 text-center relative bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
            <div className="mx-auto mb-5 bg-gradient-to-r from-purple-600 to-indigo-600 w-16 h-16 flex items-center justify-center rounded-full shadow-lg relative">
              {/* Removed blur effect for better compatibility */}
              <FileText className="h-8 w-8 text-white relative z-10 drop-shadow-md" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Template Builder</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create professional email templates with our intuitive drag-and-drop visual editor - no coding required.
            </p>
            <button
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-md shadow-md border border-purple-400 transition-all duration-200 hover:scale-105"
              onClick={() => {
                onOpenChange(false);
                // Use direct window location change as fallback
                window.location.href = '/client-template-builder';
              }}
            >
              <FileText className="h-5 w-5 mr-2 inline-block" />
              Open Visual Builder
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}