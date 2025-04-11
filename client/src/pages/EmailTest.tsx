import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const testEmailSchema = z.object({
  to: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  text: z.string().min(1, 'Email content is required'),
  html: z.string().optional(),
  from: z.string().email('Please enter a valid sender email').optional(),
  fromName: z.string().optional()
});

type TestEmailFormValues = z.infer<typeof testEmailSchema>;

export default function EmailTest() {
  const { toast } = useToast();
  const [lastTestResult, setLastTestResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const form = useForm<TestEmailFormValues>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      to: '',
      subject: 'Test Email from InfyMailer',
      text: 'This is a test email from InfyMailer application.',
      html: '<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f0e1; border-radius: 5px; border-left: 4px solid #d4af37;">' +
            '<h2 style="color: #1a3a5f; margin-top: 0;">InfyMailer Test Email</h2>' +
            '<p>This is a test email sent from the InfyMailer application.</p>' +
            '<p>If you received this email, it means the SendGrid integration is working correctly!</p>' +
            '<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #d4af37; color: #666;">' +
            '<p style="margin: 0; font-size: 12px;">Sent from InfyMailer - Your Email Marketing Platform</p>' +
            '</div></div>',
      from: 'notifications@infymailer.com',
      fromName: 'InfyMailer'
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: TestEmailFormValues) => {
      try {
        const response = await apiRequest('POST', '/api/test-email/sendgrid', values);
        // Clone the response before reading the body
        const clonedResponse = response.clone();
        
        // Parse the JSON from the cloned response
        const data = await clonedResponse.json();
        return { success: true, data };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Email sent',
          description: 'Test email sent successfully!',
          variant: 'default',
        });
        setLastTestResult({
          success: true,
          message: result.data?.message || 'Email sent successfully'
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to send email: ${result.error}`,
          variant: 'destructive',
        });
        setLastTestResult({
          success: false,
          message: result.error || 'Failed to send email'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to send email: ${error.message}`,
        variant: 'destructive',
      });
      setLastTestResult({
        success: false,
        message: error.message || 'Failed to send email'
      });
    }
  });

  const onSubmit = (values: TestEmailFormValues) => {
    setLastTestResult(null);
    mutate(values);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">SendGrid Email Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>
              Use this form to test the SendGrid email integration by sending a test email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Email</FormLabel>
                      <FormControl>
                        <Input placeholder="recipient@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Content</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-end space-x-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Test Email
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Results of the last email test will be displayed here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Sending test email...</span>
                </div>
              ) : lastTestResult ? (
                <Alert variant={lastTestResult.success ? "default" : "destructive"}>
                  {lastTestResult.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {lastTestResult.success ? "Success" : "Error"}
                  </AlertTitle>
                  <AlertDescription>{lastTestResult.message}</AlertDescription>
                </Alert>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No test has been run yet. Use the form to send a test email.
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
              <CardDescription>
                Preview of the HTML content that will be sent in the email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: form.watch('html') || '' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}