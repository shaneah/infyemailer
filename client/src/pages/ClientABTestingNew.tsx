import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useRoute } from 'wouter';
import { ChevronLeft, BarChart2, LineChart, Lightbulb, TrendingUp, ArrowUpRight, Zap, Mail, Users, ScrollText, FileCheck, CircleOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Define types for better TypeScript support
interface Campaign {
  id: number;
  name: string;
  subject: string;
  winningVariantId?: number;
  status: string;
  createdAt?: string;
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

// Client A/B Testing component with modern, clean design
const ClientABTestingNew = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [match, params] = useRoute('/client-ab-testing/:id');
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get client info from localStorage for client-specific data
  const clientInfo = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('clientUser');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error parsing client info from localStorage', e);
      return null;
    }
  }, []);
  
  // Fetch all A/B test campaigns
  const { 
    data: campaigns = [], 
    isLoading: isLoadingCampaigns,
    error: campaignsError
  } = useQuery<Campaign[]>({
    queryKey: ['/api/ab-testing/campaigns'],
    retry: 3,
    refetchOnWindowFocus: false,
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
  });
  
  // Fetch campaign analytics if ID is provided
  const {
    data: campaignAnalytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError
  } = useQuery<CampaignAnalyticsResponse>({
    queryKey: ['/api/ab-testing/campaigns', params?.id, 'analytics'],
    enabled: !!params?.id && !!campaignDetail,
    retry: 3,
  });
  
  // Format percentage for display
  const formatPercent = (value: number) => {
    return value.toFixed(1) + '%';
  };
  
  // Format large numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  }
  
  // Get color class based on test performance
  const getPerformanceColorClass = (value: number, isHigherBetter = true) => {
    if (isHigherBetter) {
      if (value >= 25) return 'text-green-600';
      if (value >= 15) return 'text-emerald-600';
      if (value >= 5) return 'text-amber-600';
      return 'text-gray-600';
    } else {
      if (value <= 1) return 'text-green-600';
      if (value <= 2) return 'text-emerald-600';
      if (value <= 5) return 'text-amber-600';
      return 'text-red-600';
    }
  };
  
  // Calculate performance metrics for a variant
  const calculatePerformanceMetrics = (analytics: VariantAnalytic[]) => {
    if (!analytics || analytics.length === 0) {
      return { 
        openRate: 0, 
        clickRate: 0, 
        clickThroughRate: 0,
        bounceRate: 0, 
        unsubscribeRate: 0, 
        totals: { recipients: 0, opens: 0, clicks: 0, bounces: 0, unsubscribes: 0 } 
      };
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
    
    const openRate = totals.recipients ? (totals.opens / totals.recipients) * 100 : 0;
    const clickRate = totals.opens ? (totals.clicks / totals.opens) * 100 : 0;
    const clickThroughRate = totals.recipients ? (totals.clicks / totals.recipients) * 100 : 0;
    const bounceRate = totals.recipients ? (totals.bounces / totals.recipients) * 100 : 0;
    const unsubscribeRate = totals.recipients ? (totals.unsubscribes / totals.recipients) * 100 : 0;
    
    return {
      openRate,
      clickRate,
      clickThroughRate,
      bounceRate,
      unsubscribeRate,
      totals
    };
  };
  
  // Get status badge variant based on campaign status
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'draft': return 'outline';
      default: return 'default';
    }
  };
  
  // Handle navigation back to the list view
  const handleBackToList = () => {
    setLocation('/client-ab-testing');
  };
  
  // If we're viewing campaign details
  if (match && params?.id) {
    const campaign = campaignDetail?.campaign;
    const variants = campaignDetail?.variants || [];
    
    if (isLoadingDetail) {
      return (
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <LineChart className="h-8 w-8 animate-pulse text-primary/70" />
              <p className="text-gray-500">Loading campaign details...</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (detailError || !campaign) {
      return (
        <div className="p-8">
          <Button variant="outline" size="sm" onClick={handleBackToList} className="mb-6">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to A/B Tests
          </Button>
          
          <Alert variant="destructive">
            <AlertTitle>Error loading campaign</AlertTitle>
            <AlertDescription>
              We couldn't load the campaign details. Please try again or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    // Calculate metrics for each variant if analytics are available
    const variantMetrics = campaignAnalytics?.variantAnalytics.map(({ variant, analytics }) => ({
      variant,
      metrics: calculatePerformanceMetrics(analytics)
    })) || [];
    
    // Find the winning variant based on open rate if not already set
    const winningVariantId = campaign.winningVariantId || 
      (variantMetrics.length > 0 ? 
        variantMetrics.reduce((winner, current) => 
          current.metrics.openRate > winner.metrics.openRate ? current : winner
        , variantMetrics[0]).variant.id : undefined);
    
    return (
      <div className="p-8">
        <Button variant="outline" size="sm" onClick={handleBackToList} className="mb-6">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to A/B Tests
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <p className="text-gray-500 text-sm">{campaign.subject}</p>
          </div>
          
          <Badge className="self-start sm:self-auto" variant={getStatusBadgeVariant(campaign.status)}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
        </div>
        
        <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-none sm:inline-flex mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-gray-500">Subject:</span>
                    <span className="col-span-2 text-sm font-medium">{campaign.subject}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className="col-span-2 text-sm">
                      <Badge variant={getStatusBadgeVariant(campaign.status)} className="font-normal">
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="col-span-2 text-sm">
                      {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 
                       campaign.metadata?.date || 'Not available'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-gray-500">Variants:</span>
                    <span className="col-span-2 text-sm">{variants.length}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm text-gray-500">Winner:</span>
                    <span className="col-span-2 text-sm font-medium">
                      {winningVariantId ? (
                        variants.find(v => v.id === winningVariantId)?.name || `Variant ${winningVariantId}`
                      ) : (
                        <span className="text-gray-500">Not determined yet</span>
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Test Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingAnalytics ? (
                    <div className="flex justify-center items-center h-32">
                      <LineChart className="h-6 w-6 animate-pulse text-primary/70" />
                    </div>
                  ) : (
                    variantMetrics.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Total Sent</span>
                            </div>
                            <p className="text-xl font-bold pl-6">
                              {formatNumber(variantMetrics.reduce((sum, { metrics }) => 
                                sum + (metrics.totals?.recipients || 0), 0))}
                            </p>
                          </div>
                          
                          <div className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-medium">Avg. Open Rate</span>
                            </div>
                            <p className="text-xl font-bold pl-6">
                              {formatPercent(variantMetrics.reduce((sum, { metrics }) => 
                                sum + metrics.openRate, 0) / variantMetrics.length)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium mb-3 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-indigo-600" />
                            Performance Difference
                          </h4>
                          
                          {variantMetrics.length > 1 && (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Open Rate</span>
                                  <span>
                                    {variantMetrics[0].metrics.openRate > variantMetrics[1].metrics.openRate
                                      ? `${variantMetrics[0].variant.name} outperforms by ${formatPercent(variantMetrics[0].metrics.openRate - variantMetrics[1].metrics.openRate)}`
                                      : `${variantMetrics[1].variant.name} outperforms by ${formatPercent(variantMetrics[1].metrics.openRate - variantMetrics[0].metrics.openRate)}`
                                    }
                                  </span>
                                </div>
                                <Progress 
                                  value={Math.abs(variantMetrics[0].metrics.openRate - variantMetrics[1].metrics.openRate)} 
                                  max={30}
                                  className="h-2"
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Click Rate</span>
                                  <span>
                                    {variantMetrics[0].metrics.clickRate > variantMetrics[1].metrics.clickRate
                                      ? `${variantMetrics[0].variant.name} outperforms by ${formatPercent(variantMetrics[0].metrics.clickRate - variantMetrics[1].metrics.clickRate)}`
                                      : `${variantMetrics[1].variant.name} outperforms by ${formatPercent(variantMetrics[1].metrics.clickRate - variantMetrics[0].metrics.clickRate)}`
                                    }
                                  </span>
                                </div>
                                <Progress 
                                  value={Math.abs(variantMetrics[0].metrics.clickRate - variantMetrics[1].metrics.clickRate)} 
                                  max={20}
                                  className="h-2"
                                />
                              </div>
                            </div>
                          )}
                          
                          {variantMetrics.length <= 1 && (
                            <p className="text-sm text-gray-500">Not enough variants to compare.</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-sm text-gray-500">No analytics data available for this campaign.</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Key Insights</CardTitle>
                <CardDescription>
                  Data-driven recommendations for this A/B test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  <div className="flex gap-3 items-start">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-700">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Subject Line Impact</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {winningVariantId ? (
                          (() => {
                            const winningVariant = variants.find(v => v.id === winningVariantId);
                            const subject = winningVariant?.subject || '';
                            return `"${subject}" performed better, suggesting ${subject.length < 50 ? 'shorter' : 'more detailed'} subject lines resonate with your audience.`;
                          })()
                        ) : (
                          'Try testing different subject line lengths and styles to see what resonates with your audience.'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-700">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Engagement Patterns</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {winningVariantId ? (
                          (() => {
                            const winningVariant = variants.find(v => v.id === winningVariantId);
                            const name = winningVariant?.name || 'Winning variant';
                            return `${name} showed higher engagement. Consider using similar messaging in future campaigns.`;
                          })()
                        ) : (
                          'Track which content elements receive the most clicks to optimize future emails.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="variants" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {variants.map((variant) => (
                <Card key={variant.id} className={variant.id === winningVariantId ? 'border-green-200 shadow-md' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center">
                        {variant.name}
                        {variant.id === winningVariantId && (
                          <Badge variant="success" className="ml-2">Winner</Badge>
                        )}
                      </CardTitle>
                      <Badge variant="outline">Weight: {variant.weight}%</Badge>
                    </div>
                    <CardDescription>
                      Variant ID: {variant.id}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="border-l-4 border-blue-300 pl-3 py-1">
                      <div className="text-xs text-gray-500 uppercase">Subject Line</div>
                      <div className="font-medium">{variant.subject}</div>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-3 py-1">
                      <div className="text-xs text-gray-500 uppercase">Preview Text</div>
                      <div className="text-sm">{variant.previewText}</div>
                    </div>
                    
                    <div className="p-3 border rounded-md bg-slate-50 overflow-hidden">
                      <div className="text-xs text-gray-500 uppercase mb-2">Content Preview</div>
                      <div className="text-sm max-h-20 overflow-hidden relative">
                        <div dangerouslySetInnerHTML={{ __html: variant.content }} />
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent"></div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm" disabled>
                      <ScrollText className="mr-1 h-4 w-4" /> View Full Content
                    </Button>
                    
                    {variant.id === winningVariantId ? (
                      <Badge variant="success" className="flex items-center">
                        <FileCheck className="mr-1 h-3 w-3" /> Winning Variant
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center">
                        <CircleOff className="mr-1 h-3 w-3" /> Not Selected
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            {isLoadingAnalytics ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <BarChart2 className="h-8 w-8 animate-pulse text-primary/70" />
                  <p className="text-gray-500">Loading analytics data...</p>
                </div>
              </div>
            ) : analyticsError ? (
              <Alert variant="destructive">
                <AlertTitle>Analytics Error</AlertTitle>
                <AlertDescription>
                  We couldn't load the analytics data. Please try again or contact support if the problem persists.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>
                      Compare how each variant performed across key metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left font-medium px-4 py-3">Variant</th>
                            <th className="text-center font-medium px-4 py-3">Recipients</th>
                            <th className="text-center font-medium px-4 py-3">Opens</th>
                            <th className="text-center font-medium px-4 py-3">Open Rate</th>
                            <th className="text-center font-medium px-4 py-3">Clicks</th>
                            <th className="text-center font-medium px-4 py-3">Click Rate</th>
                            <th className="text-center font-medium px-4 py-3">Bounces</th>
                            <th className="text-center font-medium px-4 py-3">Unsubscribes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variantMetrics.map(({ variant, metrics }, index) => (
                            <tr key={variant.id} className={`border-b ${variant.id === winningVariantId ? 'bg-green-50' : (index % 2 === 0 ? 'bg-gray-50' : '')}`}>
                              <td className="px-4 py-3 flex items-center">
                                <div className="font-medium flex items-center">
                                  {variant.name}
                                  {variant.id === winningVariantId && (
                                    <Badge variant="success" className="ml-2 text-xs">Winner</Badge>
                                  )}
                                </div>
                              </td>
                              <td className="text-center px-4 py-3">{formatNumber(metrics.totals?.recipients || 0)}</td>
                              <td className="text-center px-4 py-3">{formatNumber(metrics.totals?.opens || 0)}</td>
                              <td className={`text-center px-4 py-3 ${getPerformanceColorClass(metrics.openRate)}`}>
                                {formatPercent(metrics.openRate)}
                              </td>
                              <td className="text-center px-4 py-3">{formatNumber(metrics.totals?.clicks || 0)}</td>
                              <td className={`text-center px-4 py-3 ${getPerformanceColorClass(metrics.clickRate)}`}>
                                {formatPercent(metrics.clickRate)}
                              </td>
                              <td className={`text-center px-4 py-3 ${getPerformanceColorClass(metrics.bounceRate, false)}`}>
                                {formatPercent(metrics.bounceRate)}
                              </td>
                              <td className={`text-center px-4 py-3 ${getPerformanceColorClass(metrics.unsubscribeRate, false)}`}>
                                {formatPercent(metrics.unsubscribeRate)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Open Rate Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {variantMetrics.map(({ variant, metrics }) => (
                          <div key={variant.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <div className="font-medium">{variant.name}</div>
                              <div className={getPerformanceColorClass(metrics.openRate)}>
                                {formatPercent(metrics.openRate)}
                              </div>
                            </div>
                            <Progress value={metrics.openRate} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Click Rate Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {variantMetrics.map(({ variant, metrics }) => (
                          <div key={variant.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <div className="font-medium">{variant.name}</div>
                              <div className={getPerformanceColorClass(metrics.clickRate)}>
                                {formatPercent(metrics.clickRate)}
                              </div>
                            </div>
                            <Progress value={metrics.clickRate * 2} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  // List view - Showing available A/B test campaigns
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-2 rounded-full">
          <BarChart2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">A/B Testing</h1>
          <p className="text-gray-500 text-sm">
            Compare different versions of your emails to optimize performance
          </p>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>A/B Testing Overview</CardTitle>
          <CardDescription>
            Test different versions of your emails to determine what resonates best with your audience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm">
            A/B testing allows you to create multiple variants of an email campaign and send them to different segments 
            of your audience to determine which version performs better. You can test different:
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-1.5 rounded-full">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-medium">Subject Lines</h3>
              </div>
              <p className="text-sm text-gray-600">
                Test different subject lines to improve open rates
              </p>
            </div>
            
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-1.5 rounded-full">
                  <ScrollText className="h-4 w-4 text-purple-600" />
                </div>
                <h3 className="font-medium">Email Content</h3>
              </div>
              <p className="text-sm text-gray-600">
                Try different content layouts and messaging
              </p>
            </div>
            
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 p-1.5 rounded-full">
                  <ArrowUpRight className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="font-medium">Call to Actions</h3>
              </div>
              <p className="text-sm text-gray-600">
                Compare different CTAs to improve click rates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Your A/B Tests</h2>
        
        {isLoadingCampaigns ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex flex-col items-center gap-2">
              <BarChart2 className="h-8 w-8 animate-pulse text-primary/70" />
              <p className="text-gray-500">Loading your A/B tests...</p>
            </div>
          </div>
        ) : campaignsError ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              We couldn't load your A/B test campaigns. Please try again or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(campaign.status)}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>{campaign.subject}</CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span>{campaign.metadata?.date || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Winner Determined:</span>
                      <span>{campaign.winningVariantId ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-4 pb-3">
                  <Button 
                    size="sm" 
                    onClick={() => setLocation(`/client-ab-testing/${campaign.id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No A/B Tests Found</h3>
              <p className="text-gray-500 text-sm mb-4">
                You don't have any A/B tests set up yet. Create a new campaign with multiple variants to get started.
              </p>
              <Button variant="outline" disabled className="mx-auto">
                Create A/B Test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientABTestingNew;