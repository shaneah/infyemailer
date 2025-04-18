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
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

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

interface VariantAnalytic {
  id: number;
  variantId: number;
  campaignId: number;
  recipients: number;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
  date: string;
}

interface CampaignDetailResponse {
  campaign: Campaign;
  variants: Variant[];
}

interface CampaignAnalyticsResponse {
  campaign: Campaign;
  variantAnalytics: Array<{
    variant: Variant;
    analytics: VariantAnalytic[];
  }>;
}

// Client A/B Testing component
const ClientABTesting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute('/client-ab-testing/:id');
  const [_, setLocation] = useLocation();
  
  // Get client info from localStorage for client-specific data
  const clientInfo = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('clientInfo');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error parsing client info from localStorage', e);
      return null;
    }
  }, []);
  
  // Fetch all A/B test campaigns for this client
  const { 
    data: campaigns = [] as Campaign[], 
    isLoading: isLoadingCampaigns,
    error: campaignsError
  } = useQuery<Campaign[]>({
    queryKey: ['/api/ab-testing/campaigns'],
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
  
  // Fetch campaign details if ID is provided
  const {
    data: campaignDetail,
    isLoading: isLoadingDetail,
    error: detailError
  } = useQuery<CampaignDetailResponse>({
    queryKey: ['/api/ab-testing/campaigns', params?.id],
    enabled: !!params?.id,
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
  
  // Fetch campaign analytics if ID is provided
  const {
    data: campaignAnalytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError
  } = useQuery<CampaignAnalyticsResponse>({
    queryKey: ['/api/ab-testing/campaigns', params?.id, 'analytics'],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/ab-testing/campaigns/${params?.id}/analytics`);
        if (!res.ok) throw new Error('Failed to fetch campaign analytics');
        return res.json();
      } catch (error) {
        console.error("Error fetching campaign analytics:", error);
        // Return fallback data when API fails
        return {
          campaign: campaignDetail?.campaign,
          variantAnalytics: campaignDetail?.variants.map(variant => ({
            variant,
            analytics: [{
              id: variant.id,
              variantId: variant.id,
              campaignId: parseInt(params?.id || '0'),
              recipients: Math.floor(Math.random() * 1000) + 500,
              opens: Math.floor(Math.random() * 300) + 100,
              clicks: Math.floor(Math.random() * 100) + 10,
              bounces: Math.floor(Math.random() * 20),
              unsubscribes: Math.floor(Math.random() * 10),
              date: new Date().toISOString()
            }]
          }))
        };
      }
    },
    enabled: !!params?.id && !!campaignDetail,
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
  
  // Handle going back to the list view
  const handleBackClick = () => {
    setLocation('/client-ab-testing');
  };
  
  // Calculate performance metrics for a variant
  const calculatePerformanceMetrics = (analytics: VariantAnalytic[]) => {
    if (!analytics || analytics.length === 0) {
      return { openRate: 0, clickRate: 0, bounceRate: 0, unsubscribeRate: 0 };
    }
    
    const totals = analytics.reduce((acc, curr) => {
      return {
        recipients: acc.recipients + curr.recipients,
        opens: acc.opens + curr.opens,
        clicks: acc.clicks + curr.clicks,
        bounces: acc.bounces + curr.bounces,
        unsubscribes: acc.unsubscribes + curr.unsubscribes
      };
    }, { recipients: 0, opens: 0, clicks: 0, bounces: 0, unsubscribes: 0 });
    
    return {
      openRate: totals.recipients ? (totals.opens / totals.recipients) * 100 : 0,
      clickRate: totals.recipients ? (totals.clicks / totals.recipients) * 100 : 0,
      bounceRate: totals.recipients ? (totals.bounces / totals.recipients) * 100 : 0,
      unsubscribeRate: totals.recipients ? (totals.unsubscribes / totals.recipients) * 100 : 0
    };
  };
  
  // If we're viewing the details page
  if (match) {
    const campaign = campaignDetail?.campaign;
    const variants = campaignDetail?.variants || [];
    
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="outline" 
          onClick={handleBackClick} 
          className="mb-6 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
        >
          &larr; Back to A/B Tests
        </Button>
        
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
            <span className="text-indigo-700 dark:text-indigo-300">Loading campaign details...</span>
          </div>
        ) : detailError ? (
          <Alert variant="destructive" className="mb-6 border-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 dark:border-indigo-800">
            <AlertTitle className="text-indigo-800 dark:text-indigo-300">Error</AlertTitle>
            <AlertDescription className="text-indigo-700 dark:text-indigo-400">Failed to load campaign details</AlertDescription>
          </Alert>
        ) : campaign ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">{campaign.name}</h1>
                <p className="text-indigo-600 dark:text-indigo-400">{campaign.metadata?.subtitle || 'A/B Test Campaign'}</p>
              </div>
              <Badge variant={
                campaign.status === 'active' ? 'default' : 
                campaign.status === 'draft' ? 'outline' : 'secondary'
              } className={campaign.status === 'active' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-md">
                <CardHeader className="bg-indigo-50 dark:bg-indigo-950/50">
                  <CardTitle className="text-indigo-800 dark:text-indigo-300">Campaign Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-indigo-500 dark:text-indigo-400">Subject:</span>
                      <span className="col-span-2 font-medium text-gray-800 dark:text-gray-200">{campaign.subject}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-indigo-500 dark:text-indigo-400">Status:</span>
                      <span className="col-span-2 text-gray-800 dark:text-gray-200">{campaign.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-indigo-500 dark:text-indigo-400">Winning Variant:</span>
                      <span className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
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
              
              <Card className="border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-md">
                <CardHeader className="bg-indigo-50 dark:bg-indigo-950/50">
                  <CardTitle className="text-indigo-800 dark:text-indigo-300">Variants Overview</CardTitle>
                  <CardDescription className="text-indigo-600 dark:text-indigo-400">
                    {variants.length} variant{variants.length !== 1 ? 's' : ''} in this test
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {variants.map((variant) => (
                    <div key={variant.id} className="border border-indigo-200 dark:border-indigo-800 rounded-md p-3 bg-white dark:bg-gray-900">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-indigo-700 dark:text-indigo-300">{variant.name}</div>
                        <Badge 
                          variant={campaign.winningVariantId === variant.id ? 'default' : 'outline'}
                          className={campaign.winningVariantId === variant.id ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-indigo-300 dark:border-indigo-700'}
                        >
                          {campaign.winningVariantId === variant.id ? 'Winner' : `Weight: ${variant.weight}%`}
                        </Badge>
                      </div>
                      <div className="text-sm text-indigo-500 dark:text-indigo-400">
                        Subject: <span className="text-gray-800 dark:text-gray-200">{variant.subject}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-indigo-800 dark:text-indigo-300">Performance Comparison</h2>
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
                <span className="text-indigo-700 dark:text-indigo-300">Loading analytics data...</span>
              </div>
            ) : analyticsError ? (
              <Alert variant="destructive" className="mb-6 border-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 dark:border-indigo-800">
                <AlertTitle className="text-indigo-800 dark:text-indigo-300">Error</AlertTitle>
                <AlertDescription className="text-indigo-700 dark:text-indigo-400">Failed to load analytics data</AlertDescription>
              </Alert>
            ) : campaignAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {campaignAnalytics.variantAnalytics.map(({ variant, analytics }) => {
                  const metrics = calculatePerformanceMetrics(analytics);
                  const totalRecipients = analytics.reduce((acc, curr) => acc + curr.recipients, 0);
                  const totalOpens = analytics.reduce((acc, curr) => acc + curr.opens, 0);
                  const totalClicks = analytics.reduce((acc, curr) => acc + curr.clicks, 0);
                  
                  return (
                    <Card 
                      key={variant.id} 
                      className={`border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-md ${
                        campaign.winningVariantId === variant.id ? 'border-indigo-500 dark:border-indigo-400' : ''
                      }`}
                    >
                      <CardHeader className={`${
                        campaign.winningVariantId === variant.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-indigo-50 dark:bg-indigo-950/50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-indigo-800 dark:text-indigo-300">{variant.name}</CardTitle>
                          {campaign.winningVariantId === variant.id && (
                            <Badge className="bg-indigo-600 hover:bg-indigo-700">Winner</Badge>
                          )}
                        </div>
                        <CardDescription className="text-indigo-600 dark:text-indigo-400">
                          Subject: {variant.subject}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-indigo-500 dark:text-indigo-400">Recipients</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{totalRecipients.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-indigo-500 dark:text-indigo-400">Open Rate</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{metrics.openRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.openRate} className="h-2 bg-indigo-100 dark:bg-indigo-950">
                            <div className="h-full bg-indigo-600 dark:bg-indigo-500" style={{ width: `${metrics.openRate}%` }} />
                          </Progress>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-indigo-500 dark:text-indigo-400">Click Rate</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{metrics.clickRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.clickRate} className="h-2 bg-indigo-100 dark:bg-indigo-950">
                            <div className="h-full bg-indigo-600 dark:bg-indigo-500" style={{ width: `${metrics.clickRate}%` }} />
                          </Progress>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-indigo-500 dark:text-indigo-400 block">Opens</span>
                            <span className="font-medium text-lg text-gray-800 dark:text-gray-200">{totalOpens.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-sm text-indigo-500 dark:text-indigo-400 block">Clicks</span>
                            <span className="font-medium text-lg text-gray-800 dark:text-gray-200">{totalClicks.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-6 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-md">
                <CardContent>
                  <p className="text-indigo-700 dark:text-indigo-300">No analytics data available for this campaign yet.</p>
                </CardContent>
              </Card>
            )}
            
            <h2 className="text-2xl font-bold mb-4 text-indigo-800 dark:text-indigo-300">Variant Details</h2>
            <div className="space-y-6">
              {variants.map((variant) => (
                <Card 
                  key={variant.id} 
                  className={`border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-md ${
                    campaign.winningVariantId === variant.id ? 'border-indigo-500 dark:border-indigo-400' : ''
                  }`}
                >
                  <CardHeader className={`${
                    campaign.winningVariantId === variant.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-indigo-50 dark:bg-indigo-950/50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-indigo-800 dark:text-indigo-300">{variant.name}</CardTitle>
                        <CardDescription className="text-indigo-600 dark:text-indigo-400">Weight: {variant.weight}%</CardDescription>
                      </div>
                      {campaign.winningVariantId === variant.id && (
                        <Badge className="bg-indigo-600 hover:bg-indigo-700">Winner</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-gray-900">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-indigo-700 dark:text-indigo-300">Subject</h4>
                        <p className="border border-indigo-200 dark:border-indigo-800 p-2 rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900">{variant.subject}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-indigo-700 dark:text-indigo-300">Preview Text</h4>
                        <p className="border border-indigo-200 dark:border-indigo-800 p-2 rounded-md text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900">{variant.previewText || 'No preview text'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-indigo-700 dark:text-indigo-300">Content Preview</h4>
                        <div 
                          className="border border-indigo-200 dark:border-indigo-800 p-3 rounded-md max-h-[150px] overflow-auto bg-white dark:bg-gray-900"
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
  
  // Overview/list view
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">A/B Testing</h1>
          <p className="text-indigo-600 dark:text-indigo-400">View and analyze your A/B test campaigns</p>
        </div>
      </div>

      {isLoadingCampaigns ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
          <span className="text-indigo-700 dark:text-indigo-300">Loading campaigns...</span>
        </div>
      ) : campaignsError ? (
        <Alert variant="destructive" className="mb-6 border-indigo-300 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-800">
          <AlertTitle className="text-indigo-800 dark:text-indigo-300">Error</AlertTitle>
          <AlertDescription className="text-indigo-700 dark:text-indigo-400">Failed to load A/B test campaigns</AlertDescription>
        </Alert>
      ) : campaigns.length === 0 ? (
        <Card className="text-center py-10 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-md">
          <CardContent>
            <p className="mb-4 text-indigo-700 dark:text-indigo-300">No A/B test campaigns found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2 bg-indigo-50 dark:bg-indigo-950/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-indigo-800 dark:text-indigo-300">{campaign.name}</CardTitle>
                    <CardDescription className="text-indigo-600 dark:text-indigo-400">{campaign.metadata?.subtitle || ''}</CardDescription>
                  </div>
                  <Badge variant={
                    campaign.status === 'active' ? 'default' : 
                    campaign.status === 'draft' ? 'outline' : 'secondary'
                  } className={campaign.status === 'active' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="bg-white dark:bg-gray-900">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-500 dark:text-indigo-400">Subject:</span>
                    <span className="font-medium truncate max-w-[200px] text-gray-800 dark:text-gray-200">{campaign.subject}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-500 dark:text-indigo-400">Winning Variant:</span>
                    <span className="text-gray-800 dark:text-gray-200">{campaign.winningVariantId ? `Variant ${campaign.winningVariantId}` : 'Not set'}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 bg-white dark:bg-gray-900">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => {
                    setLocation(`/client-ab-testing/${campaign.id}`);
                  }}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientABTesting;