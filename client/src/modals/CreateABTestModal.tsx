import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const createABTestSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  senderName: z.string().min(1, 'Sender name is required'),
  replyToEmail: z.string().email('Valid email is required'),
  status: z.string().default('draft'),
  isAbTest: z.boolean().default(true),
  variants: z.array(
    z.object({
      name: z.string().min(1, 'Variant name is required'),
      subject: z.string().min(1, 'Subject is required'),
      previewText: z.string().optional(),
      content: z.string().min(1, 'Content is required'),
      weight: z.number().min(1).max(100).default(50)
    })
  ).min(2, 'At least two variants are required for A/B testing')
});

type CreateABTestSchema = z.infer<typeof createABTestSchema>;

interface CreateABTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateABTestModal({ open, onOpenChange }: CreateABTestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState('basic-info');

  const form = useForm<CreateABTestSchema>({
    resolver: zodResolver(createABTestSchema),
    defaultValues: {
      name: '',
      senderName: '',
      replyToEmail: '',
      status: 'draft',
      isAbTest: true,
      variants: [
        {
          name: 'Variant A',
          subject: '',
          previewText: '',
          content: '',
          weight: 50
        },
        {
          name: 'Variant B',
          subject: '',
          previewText: '',
          content: '',
          weight: 50
        }
      ]
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CreateABTestSchema) => {
      // First create the campaign
      const campaignRes = await apiRequest('POST', '/api/campaigns', {
        name: data.name,
        subject: '(A/B Test)',
        previewText: '',
        senderName: data.senderName,
        replyToEmail: data.replyToEmail,
        content: '',
        status: data.status,
        isAbTest: true
      });

      if (!campaignRes.ok) {
        throw new Error('Failed to create campaign');
      }

      const campaign = await campaignRes.json();

      // Then create variants
      for (const variant of data.variants) {
        const variantRes = await apiRequest('POST', `/api/ab-testing/campaigns/${campaign.id}/variants`, variant);
        if (!variantRes.ok) {
          throw new Error('Failed to create variant');
        }
      }

      return campaign;
    },
    onSuccess: () => {
      toast({
        title: 'A/B Test created',
        description: 'Your A/B test campaign has been created successfully.'
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/ab-testing/campaigns'] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create A/B test campaign. Please try again.',
        variant: 'destructive'
      });
      console.error('Error creating A/B test:', error);
    }
  });

  const onSubmit = (data: CreateABTestSchema) => {
    // Calculate total weight
    const totalWeight = data.variants.reduce((acc, variant) => acc + variant.weight, 0);
    
    // Check if weights add up to 100
    if (totalWeight !== 100) {
      toast({
        title: 'Invalid weights',
        description: 'Variant weights must add up to 100%',
        variant: 'destructive'
      });
      return;
    }

    createCampaignMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create A/B Test Campaign</DialogTitle>
          <DialogDescription>
            Create a campaign with multiple variants to test which performs better.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
                <TabsTrigger value="variant-a">Variant A</TabsTrigger>
                <TabsTrigger value="variant-b">Variant B</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic-info" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Sale A/B Test" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="replyToEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reply-To Email*</FormLabel>
                      <FormControl>
                        <Input placeholder="support@yourcompany.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setCurrentTab('variant-a')}>
                    Next: Variant A
                  </Button>
                </div>
              </TabsContent>

              {/* Variant A Tab */}
              <TabsContent value="variant-a" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="variants.0.subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Line*</FormLabel>
                      <FormControl>
                        <Input placeholder="Check out our summer sale!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variants.0.previewText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preview Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Save up to 50% on selected items..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variants.0.content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Content*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your email content here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variants.0.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distribution Weight (%)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="99" 
                          placeholder="50" 
                          {...field}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            field.onChange(newValue);
                            
                            // Update variant B's weight
                            const variantBWeight = 100 - newValue;
                            form.setValue('variants.1.weight', variantBWeight);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentTab('basic-info')}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setCurrentTab('variant-b')}>
                    Next: Variant B
                  </Button>
                </div>
              </TabsContent>

              {/* Variant B Tab */}
              <TabsContent value="variant-b" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="variants.1.subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Line*</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Sale: Up to 50% off!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variants.1.previewText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preview Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Limited time offer! Shop now..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variants.1.content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Content*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your email content here..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variants.1.weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distribution Weight (%)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="99" 
                          placeholder="50" 
                          {...field}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            field.onChange(newValue);
                            
                            // Update variant A's weight
                            const variantAWeight = 100 - newValue;
                            form.setValue('variants.0.weight', variantAWeight);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentTab('variant-a')}>
                    Back
                  </Button>
                  <Button type="submit" disabled={createCampaignMutation.isPending}>
                    {createCampaignMutation.isPending ? 'Creating...' : 'Create A/B Test'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {currentTab === 'variant-b' && (
                <Button type="submit" disabled={createCampaignMutation.isPending}>
                  {createCampaignMutation.isPending ? 'Creating...' : 'Create A/B Test'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}