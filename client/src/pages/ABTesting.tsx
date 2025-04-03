import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CreateABTestModal } from '@/modals/CreateABTestModal';

// Define types for better TypeScript support
interface Campaign {
  id: number;
  name: string;
  subject: string;
  winningVariantId?: number;
  status: string;
  metadata?: {
    subtitle?: string;
    date?: string;
    icon?: { name: string; color: string };
  };
}

interface Variant {
  id: number;
  name: string;
  subject: string;
  previewText: string;
  content: string;
  weight: number;
}

interface CampaignDetailResponse {
  campaign: Campaign;
  variants: Variant[];
}

// Main ABTesting component with route handling
export default function ABTesting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute('/ab-testing/:id');
  const [_, setLocation] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Fetch all A/B test campaigns
  const { 
    data: campaigns = [] as Campaign[], 
    isLoading: isLoadingCampaigns,
    error: campaignsError
  } = useQuery<Campaign[]>({
    queryKey: ['/api/ab-testing/campaigns']
  });
  
  // Fetch campaign details if ID is provided
  const {
    data: campaignDetail,
    isLoading: isLoadingDetail,
    error: detailError
  } = useQuery<CampaignDetailResponse>({
    queryKey: ['/api/ab-testing/campaigns', params?.id],
    enabled: !!params?.id
  });

  // Mutation to set winning variant
  const { mutate: setWinningVariant, isPending: isSettingWinner } = useMutation({
    mutationFn: async ({ campaignId, variantId }: { campaignId: number, variantId: number }) => {
      return await apiRequest('POST', `/api/ab-testing/campaigns/${campaignId}/winner`, { variantId });
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Winning variant has been set successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ab-testing/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ab-testing/campaigns', params?.id] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Could not set winning variant. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Handle declaring a variant as winner
  const handleDeclareWinner = (variantId: number) => {
    if (params?.id) {
      setWinningVariant({ campaignId: parseInt(params.id), variantId });
    }
  };

  // Handle opening create modal
  const handleCreateTest = () => {
    setIsCreateModalOpen(true);
  };
  
  // Handle going back to the list view
  const handleBackClick = () => {
    setLocation('/ab-testing');
  };
  
  // If we're viewing the details page
  if (match) {
    const campaign = campaignDetail?.campaign;
    const variants = campaignDetail?.variants || [];
    
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={handleBackClick} className="mb-6">
          &larr; Back to A/B Tests
        </Button>
        
        {isLoadingDetail ? (
          <div className="text-center py-10">Loading campaign details...</div>
        ) : detailError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load campaign details</AlertDescription>
          </Alert>
        ) : campaign ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold">{campaign.name}</h1>
                <p className="text-gray-500">{campaign.metadata?.subtitle || 'A/B Test Campaign'}</p>
              </div>
              <Badge variant={
                campaign.status === 'active' ? 'success' : 
                campaign.status === 'draft' ? 'outline' : 'secondary'
              }>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-gray-500">Subject:</span>
                      <span className="col-span-2 font-medium">{campaign.subject}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-gray-500">Status:</span>
                      <span className="col-span-2">{campaign.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-gray-500">Winning Variant:</span>
                      <span className="col-span-2 font-medium">
                        {campaign.winningVariantId ? (
                          variants.find(v => v.id === campaign.winningVariantId)?.name || `Variant ${campaign.winningVariantId}`
                        ) : (
                          'Not determined yet'
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Variants Overview</CardTitle>
                  <CardDescription>
                    {variants.length} variant{variants.length !== 1 ? 's' : ''} in this test
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {variants.map((variant) => (
                    <div key={variant.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{variant.name}</div>
                        <Badge variant={campaign.winningVariantId === variant.id ? 'success' : 'outline'}>
                          {campaign.winningVariantId === variant.id ? 'Winner' : `Weight: ${variant.weight}%`}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Subject: {variant.subject}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Variant Details</h2>
            <div className="space-y-6">
              {variants.map((variant) => (
                <Card key={variant.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{variant.name}</CardTitle>
                        <CardDescription>Weight: {variant.weight}%</CardDescription>
                      </div>
                      {campaign.winningVariantId === variant.id ? (
                        <Badge variant="success">Winner</Badge>
                      ) : !campaign.winningVariantId && campaign.status !== 'draft' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeclareWinner(variant.id)}
                          disabled={isSettingWinner}
                        >
                          Declare Winner
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Subject</h4>
                        <p className="border p-2 rounded-md">{variant.subject}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Preview Text</h4>
                        <p className="border p-2 rounded-md">{variant.previewText || 'No preview text'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Content Preview</h4>
                        <div 
                          className="border p-3 rounded-md max-h-[150px] overflow-auto bg-gray-50"
                          dangerouslySetInnerHTML={{ __html: variant.content }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10">Campaign not found</div>
        )}
        
        <CreateABTestModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    );
  }
  
  // Overview/list view
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">A/B Testing</h1>
          <p className="text-gray-500">Create and manage A/B test campaigns</p>
        </div>
        <Button onClick={handleCreateTest}>
          Create A/B Test
        </Button>
      </div>

      {isLoadingCampaigns ? (
        <div className="text-center py-10">Loading campaigns...</div>
      ) : campaignsError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load A/B test campaigns</AlertDescription>
        </Alert>
      ) : campaigns.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="mb-4">No A/B test campaigns found</p>
            <Button onClick={handleCreateTest}>
              Create Your First A/B Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription>{campaign.metadata?.subtitle || ''}</CardDescription>
                  </div>
                  <Badge variant={
                    campaign.status === 'active' ? 'success' : 
                    campaign.status === 'draft' ? 'outline' : 'secondary'
                  }>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subject:</span>
                    <span className="font-medium truncate max-w-[200px]">{campaign.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Winning Variant:</span>
                    <span>{campaign.winningVariantId ? `Variant ${campaign.winningVariantId}` : 'Not set'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setLocation(`/ab-testing/${campaign.id}`);
                  }}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <CreateABTestModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}