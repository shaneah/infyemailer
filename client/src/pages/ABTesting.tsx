import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const ABTesting = () => {
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute('/ab-testing/:id');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState(match ? 'detail' : 'overview');
  
  // Fetch all A/B test campaigns
  const { 
    data: campaigns, 
    isLoading: isLoadingCampaigns,
    error: campaignsError
  } = useQuery({
    queryKey: ['/api/ab-testing/campaigns'],
    enabled: activeTab === 'overview'
  });
  
  // Fetch specific campaign details if ID is provided
  const {
    data: campaignDetail,
    isLoading: isLoadingDetail,
    error: detailError
  } = useQuery({
    queryKey: ['/api/ab-testing/campaigns', params?.id],
    enabled: !!params?.id && activeTab === 'detail'
  });
  
  // Fetch analytics for a specific campaign
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError
  } = useQuery({
    queryKey: ['/api/ab-testing/campaigns', params?.id, 'analytics'],
    enabled: !!params?.id && activeTab === 'analytics'
  });
  
  // Mutation to set winning variant
  const { mutate: setWinningVariant, isPending: isSettingWinner } = useMutation({
    mutationFn: async ({ campaignId, variantId }: { campaignId: number, variantId: number }) => {
      return apiRequest(`/api/ab-testing/campaigns/${campaignId}/winner`, {
        method: 'POST',
        body: JSON.stringify({ variantId })
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Winning variant has been set successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ab-testing/campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ab-testing/campaigns', params?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/ab-testing/campaigns', params?.id, 'analytics'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Could not set winning variant. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Handle back button click
  const handleBackClick = () => {
    setActiveTab('overview');
    setLocation('/ab-testing');
  };
  
  // Handle declaring a variant as winner
  const handleDeclareWinner = (variantId: number) => {
    if (params?.id) {
      setWinningVariant({ campaignId: parseInt(params.id), variantId });
    }
  };
  
  // Calculate open rate and click rate
  const calculateRates = (analytics: any) => {
    if (!analytics || !analytics.opens) return { openRate: 0, clickRate: 0 };
    
    const openRate = (analytics.opens / (analytics.opens + analytics.bounces)) * 100;
    const clickRate = analytics.opens > 0 ? (analytics.clicks / analytics.opens) * 100 : 0;
    
    return {
      openRate: openRate.toFixed(1),
      clickRate: clickRate.toFixed(1)
    };
  };
  
  if (activeTab === 'overview') {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">A/B Testing</h1>
            <p className="text-gray-500">Create and manage A/B test campaigns</p>
          </div>
          <Button onClick={() => alert('Create A/B Test feature coming soon')}>
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
        ) : campaigns?.length === 0 ? (
          <Card className="text-center py-10">
            <CardContent>
              <p className="mb-4">No A/B test campaigns found</p>
              <Button onClick={() => alert('Create A/B Test feature coming soon')}>
                Create Your First A/B Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map((campaign: any) => {
              const metadata = campaign.metadata || {};
              const icon = metadata.icon || { name: 'envelope', color: 'primary' };
              
              return (
                <Card key={campaign.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <CardDescription>{metadata.subtitle || ''}</CardDescription>
                      </div>
                      <Badge variant={
                        campaign.status === 'sent' ? 'success' : 
                        campaign.status === 'scheduled' ? 'warning' : 
                        campaign.status === 'active' ? 'default' : 'secondary'
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
                        <span className="text-gray-500">Date:</span>
                        <span>{metadata.date || 'N/A'}</span>
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
                        setActiveTab('detail');
                        setLocation(`/ab-testing/${campaign.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  
  if (activeTab === 'detail' && params?.id) {
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
                campaign.status === 'sent' ? 'success' : 
                campaign.status === 'scheduled' ? 'warning' : 
                campaign.status === 'active' ? 'default' : 'secondary'
              }>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="detail">Campaign Details</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </Tabs>
            
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
                      <span className="text-gray-500">Preview Text:</span>
                      <span className="col-span-2">{campaign.previewText}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-gray-500">Sender:</span>
                      <span className="col-span-2">{campaign.senderName} &lt;{campaign.replyToEmail}&gt;</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-gray-500">Scheduled:</span>
                      <span className="col-span-2">
                        {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'Not scheduled'}
                      </span>
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
                  {variants.map((variant: any) => (
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
              {variants.map((variant: any) => (
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
                        <p className="border p-2 rounded-md">{variant.previewText}</p>
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
      </div>
    );
  }
  
  if (activeTab === 'analytics' && params?.id) {
    const campaign = analyticsData?.campaign;
    const variantAnalytics = analyticsData?.variantAnalytics || [];
    
    // Find best performing variant
    let bestVariant = null;
    let highestOpenRate = 0;
    let highestClickRate = 0;
    
    variantAnalytics.forEach((va: any) => {
      const analytics = va.analytics[0];
      if (!analytics) return;
      
      const rates = calculateRates(analytics);
      const openRate = parseFloat(rates.openRate);
      const clickRate = parseFloat(rates.clickRate);
      
      if (openRate > highestOpenRate) {
        highestOpenRate = openRate;
        bestVariant = va.variant;
      }
      
      if (clickRate > highestClickRate) {
        highestClickRate = clickRate;
      }
    });
    
    return (
      <div className="container mx-auto py-6">
        <Button variant="outline" onClick={handleBackClick} className="mb-6">
          &larr; Back to A/B Tests
        </Button>
        
        {isLoadingAnalytics ? (
          <div className="text-center py-10">Loading analytics data...</div>
        ) : analyticsError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load analytics data</AlertDescription>
          </Alert>
        ) : campaign ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold">{campaign.name} - Analytics</h1>
                <p className="text-gray-500">{campaign.metadata?.subtitle || 'A/B Test Campaign'}</p>
              </div>
              <Badge variant={
                campaign.status === 'sent' ? 'success' : 
                campaign.status === 'scheduled' ? 'warning' : 
                campaign.status === 'active' ? 'default' : 'secondary'
              }>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="detail">Campaign Details</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {variantAnalytics.length > 0 ? (
              <>
                {bestVariant && !campaign.winningVariantId && (
                  <Alert className="mb-6">
                    <AlertTitle>Best Performing Variant</AlertTitle>
                    <AlertDescription className="flex justify-between items-center">
                      <span><strong>{bestVariant.name}</strong> is currently performing best with {highestOpenRate}% open rate</span>
                      <Button 
                        size="sm"
                        onClick={() => handleDeclareWinner(bestVariant.id)}
                        disabled={isSettingWinner}
                      >
                        Declare Winner
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {variantAnalytics.map((va: any) => {
                    const variant = va.variant;
                    const analytics = va.analytics[0] || {}; // Using first analytics entry
                    const { openRate, clickRate } = calculateRates(analytics);
                    
                    return (
                      <Card key={variant.id} className={campaign.winningVariantId === variant.id ? 'border-green-500 border-2' : ''}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{variant.name}</CardTitle>
                            {campaign.winningVariantId === variant.id && <Badge variant="success">Winner</Badge>}
                          </div>
                          <CardDescription>Weight: {variant.weight}%</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Open Rate</span>
                              <span className="text-sm font-medium">{openRate}%</span>
                            </div>
                            <Progress value={parseFloat(openRate)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Click Rate</span>
                              <span className="text-sm font-medium">{clickRate}%</span>
                            </div>
                            <Progress value={parseFloat(clickRate)} className="h-2" />
                          </div>
                          <Separator />
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Opens:</span>
                              <span>{analytics.opens || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Clicks:</span>
                              <span>{analytics.clicks || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Bounces:</span>
                              <span>{analytics.bounces || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Unsubscribes:</span>
                              <span>{analytics.unsubscribes || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                        {!campaign.winningVariantId && campaign.status !== 'draft' && (
                          <CardFooter>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleDeclareWinner(variant.id)}
                              disabled={isSettingWinner}
                            >
                              Declare Winner
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    );
                  })}
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Comparative Performance</h2>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Open Rate</h3>
                        <div className="space-y-3">
                          {variantAnalytics.map((va: any) => {
                            const variant = va.variant;
                            const analytics = va.analytics[0] || {};
                            const { openRate } = calculateRates(analytics);
                            
                            return (
                              <div key={`open-${variant.id}`} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{variant.name}</span>
                                  <span className="font-medium">{openRate}%</span>
                                </div>
                                <Progress value={parseFloat(openRate)} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Click Rate</h3>
                        <div className="space-y-3">
                          {variantAnalytics.map((va: any) => {
                            const variant = va.variant;
                            const analytics = va.analytics[0] || {};
                            const { clickRate } = calculateRates(analytics);
                            
                            return (
                              <div key={`click-${variant.id}`} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{variant.name}</span>
                                  <span className="font-medium">{clickRate}%</span>
                                </div>
                                <Progress value={parseFloat(clickRate)} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Unsubscribe Rate</h3>
                        <div className="space-y-3">
                          {variantAnalytics.map((va: any) => {
                            const variant = va.variant;
                            const analytics = va.analytics[0] || {};
                            const unsubRate = analytics.opens > 0 
                              ? ((analytics.unsubscribes || 0) / analytics.opens * 100).toFixed(1) 
                              : '0.0';
                            
                            return (
                              <div key={`unsub-${variant.id}`} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{variant.name}</span>
                                  <span className="font-medium">{unsubRate}%</span>
                                </div>
                                <Progress value={parseFloat(unsubRate)} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="mb-4">No analytics data available for this campaign yet.</p>
                {campaign.status === 'draft' && (
                  <p>This campaign is still in draft mode. Analytics will be available once it's sent.</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">Campaign not found</div>
        )}
      </div>
    );
  }
  
  return <div>Loading...</div>;
};

export default ABTesting;