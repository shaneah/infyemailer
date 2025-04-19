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

// Client A/B Testing Advanced component
const ClientABTestingAdvanced = () => {
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
    data: campaignsFromServer = [] as Campaign[], 
    isLoading: isLoadingCampaigns,
    error: campaignsError
  } = useQuery<Campaign[]>({
    queryKey: ['/api/ab-testing/campaigns'],
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
  
  // Use sample A/B test campaigns if none are returned from the server
  const campaigns = React.useMemo(() => {
    if (campaignsFromServer && campaignsFromServer.length > 0) {
      return campaignsFromServer;
    }
    
    // Provide sample A/B test campaigns when none are returned from server
    return [
      {
        id: 1,
        name: "Subject Line Testing",
        subject: "A/B Test: Subject Line Variations",
        status: "active",
        metadata: {
          subtitle: "Subject Line Testing",
          date: "April 25, 2025",
          icon: { name: "bar-chart-fill", color: "success" }
        }
      },
      {
        id: 2,
        name: "Email Design Testing",
        subject: "April Product Newsletter",
        status: "active",
        metadata: {
          subtitle: "Design Testing",
          date: "April 30, 2025",
          icon: { name: "layout-fill", color: "primary" }
        }
      }
    ] as Campaign[];
  }, [campaignsFromServer]);
  
  // Fetch campaign details if ID is provided
  const {
    data: campaignDetailFromServer,
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
  
  // Use sample campaign details if none are returned from the server
  const campaignDetail = React.useMemo(() => {
    if (campaignDetailFromServer) {
      return campaignDetailFromServer;
    }
    
    if (!params?.id) {
      return undefined;
    }
    
    // Generate mock campaign details based on the ID in the URL
    const campaignId = parseInt(params.id, 10);
    const matchingCampaign = campaigns.find(c => c.id === campaignId);
    
    if (!matchingCampaign) {
      return undefined;
    }
    
    // Create sample campaign details
    if (campaignId === 1) { // Subject Line Testing
      return {
        campaign: {
          ...matchingCampaign,
          winningVariantId: 1 // Variant A is winning
        },
        variants: [
          {
            id: 1,
            name: "Variant A",
            subject: "Limited Time Offer - 30% Off All Products!",
            previewText: "Get your discount before it's gone",
            content: "<h1>Limited Time Offer!</h1><p>Enjoy 30% off all products for the next 48 hours.</p>",
            weight: 50
          },
          {
            id: 2,
            name: "Variant B",
            subject: "Exclusive Deal: Save 30% On Your Next Purchase",
            previewText: "Members-only savings inside",
            content: "<h1>Exclusive Deal!</h1><p>As a valued customer, you can save 30% on your next purchase.</p>",
            weight: 50
          }
        ]
      } as CampaignDetailResponse;
    } else if (campaignId === 2) { // Email Design Testing
      return {
        campaign: {
          ...matchingCampaign,
          winningVariantId: null // No winner yet
        },
        variants: [
          {
            id: 3,
            name: "Minimal Design",
            subject: "April Product Newsletter",
            previewText: "See what's new this month",
            content: "<h1>April Updates</h1><p>A clean, minimal design highlighting our newest products.</p>",
            weight: 50
          },
          {
            id: 4,
            name: "Image-heavy Design",
            subject: "April Product Newsletter",
            previewText: "See what's new this month",
            content: "<h1>April Updates</h1><p>An image-focused design showcasing product photography.</p>",
            weight: 50
          }
        ]
      } as CampaignDetailResponse;
    }
    
    return undefined;
  }, [campaignDetailFromServer, params?.id, campaigns]);
  
  // Fetch campaign analytics if ID is provided
  const {
    data: campaignAnalyticsFromServer,
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
        throw error;
      }
    },
    enabled: !!params?.id && !!campaignDetail,
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
  
  // Create mock analytics data if none is returned from server
  const campaignAnalytics = React.useMemo(() => {
    if (campaignAnalyticsFromServer) {
      return campaignAnalyticsFromServer;
    }
    
    if (!params?.id || !campaignDetail) {
      return undefined;
    }
    
    const campaignId = parseInt(params.id, 10);
    
    // Generate mock analytics based on the campaign ID
    if (campaignId === 1) { // Subject Line Testing
      return {
        campaign: campaignDetail.campaign,
        variantAnalytics: [
          {
            variant: campaignDetail.variants[0], // Variant A
            analytics: [
              {
                id: 1,
                variantId: 1,
                campaignId: 1,
                recipients: 2500,
                opens: 1045,
                clicks: 350,
                bounces: 25,
                unsubscribes: 12,
                date: '2025-04-25'
              }
            ]
          },
          {
            variant: campaignDetail.variants[1], // Variant B
            analytics: [
              {
                id: 2,
                variantId: 2,
                campaignId: 1,
                recipients: 2500,
                opens: 880,
                clicks: 265,
                bounces: 35,
                unsubscribes: 18,
                date: '2025-04-25'
              }
            ]
          }
        ]
      } as CampaignAnalyticsResponse;
    } else if (campaignId === 2) { // Email Design Testing
      return {
        campaign: campaignDetail.campaign,
        variantAnalytics: [
          {
            variant: campaignDetail.variants[0], // Minimal Design
            analytics: [
              {
                id: 3,
                variantId: 3,
                campaignId: 2,
                recipients: 1750,
                opens: 775,
                clicks: 295,
                bounces: 20,
                unsubscribes: 8,
                date: '2025-04-30'
              }
            ]
          },
          {
            variant: campaignDetail.variants[1], // Image-heavy Design
            analytics: [
              {
                id: 4,
                variantId: 4,
                campaignId: 2,
                recipients: 1750,
                opens: 690,
                clicks: 255,
                bounces: 15,
                unsubscribes: 12,
                date: '2025-04-30'
              }
            ]
          }
        ]
      } as CampaignAnalyticsResponse;
    }
    
    return undefined;
  }, [campaignAnalyticsFromServer, params?.id, campaignDetail]);
  
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
        <Button variant="outline" onClick={handleBackClick} className="mb-6">
          &larr; Back to A/B Tests
        </Button>
        
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Loading campaign details...</span>
          </div>
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
            
            <h2 className="text-2xl font-bold mb-4">Performance Comparison</h2>
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Loading analytics data...</span>
              </div>
            ) : analyticsError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load analytics data</AlertDescription>
              </Alert>
            ) : campaignAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {campaignAnalytics.variantAnalytics.map(({ variant, analytics }) => {
                  const metrics = calculatePerformanceMetrics(analytics);
                  const totalRecipients = analytics.reduce((acc, curr) => acc + curr.recipients, 0);
                  const totalOpens = analytics.reduce((acc, curr) => acc + curr.opens, 0);
                  const totalClicks = analytics.reduce((acc, curr) => acc + curr.clicks, 0);
                  
                  return (
                    <Card key={variant.id} className={campaign.winningVariantId === variant.id ? 'border-primary' : ''}>
                      <CardHeader className={campaign.winningVariantId === variant.id ? 'bg-primary/5' : ''}>
                        <div className="flex justify-between items-center">
                          <CardTitle>{variant.name}</CardTitle>
                          {campaign.winningVariantId === variant.id && (
                            <Badge variant="success">Winner</Badge>
                          )}
                        </div>
                        <CardDescription>
                          Subject: {variant.subject}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Recipients</span>
                            <span className="font-medium">{totalRecipients.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Open Rate</span>
                            <span className="font-medium">{metrics.openRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.openRate} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Click Rate</span>
                            <span className="font-medium">{metrics.clickRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.clickRate} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-500 block">Opens</span>
                            <span className="font-medium text-lg">{totalOpens.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500 block">Clicks</span>
                            <span className="font-medium text-lg">{totalClicks.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-6">
                <CardContent>
                  <p>No analytics data available for this campaign yet.</p>
                </CardContent>
              </Card>
            )}
            
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
                      {campaign.winningVariantId === variant.id && (
                        <Badge variant="success">Winner</Badge>
                      )}
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
      </div>
    );
  }
  
  // Overview/list view
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with blue gradient styling to match other client pages */}
      <div className="w-full bg-gradient-to-r from-blue-500 to-blue-700">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">A/B Testing</h1>
              <p className="text-blue-100 text-sm">View and manage your A/B test campaigns</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-6 pt-6">

      {isLoadingCampaigns ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading campaigns...</span>
        </div>
      ) : campaignsError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load A/B test campaigns</AlertDescription>
        </Alert>
      ) : campaigns.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="mb-4">No A/B test campaigns found</p>
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
    </div>
  );
};

export default ClientABTestingAdvanced;