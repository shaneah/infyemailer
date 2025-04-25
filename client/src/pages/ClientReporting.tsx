import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  BarChart2, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Calendar, 
  Users, 
  Mail, 
  MousePointer, 
  AlertCircle, 
  ArrowRight, 
  Download,
  FileText,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';

// Define types for our data
interface PerformanceMetrics {
  openRate: { value: number; change: number };
  clickRate: { value: number; change: number };
  bounceRate: { value: number; change: number };
  unsubscribeRate: { value: number; change: number };
  deliverability: { value: number; change: number };
}

interface TimeSeriesData {
  weeklyPerformance: { day: string; opens: number; clicks: number; unsubscribes: number }[];
  monthlyTrends: { month: string; campaigns: number; opens: number; engagementScore: number }[];
}

interface RealtimeEvent {
  time: string;
  type: string;
  campaign: string;
  email?: string;
  location?: string;
  device?: string;
}

interface TopPerformer {
  type: string;
  name: string;
  rate: number;
  total: number;
}

interface AudienceOverview {
  total: number;
  active: number;
  new: number;
  demographics: { 
    age: { label: string; value: number }[]; 
    gender: { label: string; value: number }[];
    location: { label: string; value: number }[];
  };
  engagement: { 
    frequency: { label: string; value: number }[];
    timeOfDay: { label: string; value: number }[];
  };
}

interface CampaignMetrics {
  id: number;
  name: string;
  sentDate: string;
  recipients: number;
  opens: number;
  openRate: number;
  clicks: number;
  clickRate: number;
  bounces: number;
  unsubscribes: number;
}

const ClientReporting = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [reportType, setReportType] = useState('campaigns');
  const [_, setLocation] = useLocation();
  
  // Fetch performance metrics
  const { 
    data: metrics,
    isLoading: isLoadingMetrics
  } = useQuery<PerformanceMetrics>({
    queryKey: ['/api/email-performance/metrics'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch time series data for charts
  const {
    data: chartData,
    isLoading: isLoadingCharts
  } = useQuery<TimeSeriesData>({
    queryKey: ['/api/email-performance/charts'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch realtime events
  const {
    data: realtimeEvents,
    isLoading: isLoadingRealtime
  } = useQuery<RealtimeEvent[]>({
    queryKey: ['/api/email-performance/realtime'],
    refetchOnWindowFocus: false,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  // Fetch top performers
  const {
    data: topPerformers,
    isLoading: isLoadingTopPerformers
  } = useQuery<{ subjects: TopPerformer[]; campaigns: TopPerformer[]; templates: TopPerformer[] }>({
    queryKey: ['/api/email-performance/top-performers'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch audience overview
  const {
    data: audienceData,
    isLoading: isLoadingAudience
  } = useQuery<AudienceOverview>({
    queryKey: ['/api/audience/overview'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch campaign metrics
  const {
    data: campaignMetrics,
    isLoading: isLoadingCampaigns
  } = useQuery<CampaignMetrics[]>({
    queryKey: ['/api/campaigns/metrics'],
    refetchOnWindowFocus: false,
  });
  
  // Format large numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };
  
  // Format percentage for display
  const formatPercent = (value: number) => {
    return value.toFixed(1) + '%';
  };
  
  // Determine color based on performance
  const getPerformanceColor = (value: number, isHigherBetter = true, threshold = 5) => {
    if (isHigherBetter) {
      if (value > threshold) return 'text-green-600';
      if (value < -threshold) return 'text-red-600';
      return 'text-amber-600';
    } else {
      if (value < -threshold) return 'text-green-600';
      if (value > threshold) return 'text-red-600';
      return 'text-amber-600';
    }
  };
  
  // Format date for consistent display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Generate dummy chart data for demonstration
  const generateChartData = () => {
    if (chartData?.weeklyPerformance) {
      return chartData.weeklyPerformance.map(day => ({
        day: day.day,
        opens: day.opens,
        clicks: day.clicks
      }));
    }
    return [];
  };

  // Download report (dummy function - would connect to real export in production)
  const downloadReport = () => {
    alert('Report download functionality would be implemented here in production.');
  };
  
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-2 rounded-full">
          <BarChart2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Reporting Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Comprehensive analytics and reporting for all your email marketing activities
          </p>
        </div>
      </div>
      
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto">
            <Select defaultValue="last30days" onValueChange={(value) => console.log(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          
          <div className="w-full sm:w-auto">
            <Select defaultValue="all" onValueChange={(value) => console.log(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All campaigns</SelectItem>
                <SelectItem value="active">Active campaigns</SelectItem>
                <SelectItem value="completed">Completed campaigns</SelectItem>
                <SelectItem value="draft">Draft campaigns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>More filters</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={downloadReport}>
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
      
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Open Rate Card */}
        <Card>
          <CardContent className="p-4">
            {isLoadingMetrics ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-500">Open Rate</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatPercent(metrics?.openRate.value || 0)}
                </div>
                <div className={`text-xs flex items-center ${getPerformanceColor(metrics?.openRate.change || 0)}`}>
                  {metrics?.openRate.change && metrics.openRate.change > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                  )}
                  <span>
                    {metrics?.openRate.change && metrics.openRate.change > 0 ? '+' : ''}
                    {formatPercent(metrics?.openRate.change || 0)} vs. previous
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Click Rate Card */}
        <Card>
          <CardContent className="p-4">
            {isLoadingMetrics ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm text-gray-500">Click Rate</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatPercent(metrics?.clickRate.value || 0)}
                </div>
                <div className={`text-xs flex items-center ${getPerformanceColor(metrics?.clickRate.change || 0)}`}>
                  {metrics?.clickRate.change && metrics.clickRate.change > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                  )}
                  <span>
                    {metrics?.clickRate.change && metrics.clickRate.change > 0 ? '+' : ''}
                    {formatPercent(metrics?.clickRate.change || 0)} vs. previous
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Bounce Rate Card */}
        <Card>
          <CardContent className="p-4">
            {isLoadingMetrics ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-500">Bounce Rate</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatPercent(metrics?.bounceRate.value || 0)}
                </div>
                <div className={`text-xs flex items-center ${getPerformanceColor(metrics?.bounceRate.change || 0, false)}`}>
                  {metrics?.bounceRate.change && metrics.bounceRate.change < 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                  )}
                  <span>
                    {metrics?.bounceRate.change && metrics.bounceRate.change > 0 ? '+' : ''}
                    {formatPercent(metrics?.bounceRate.change || 0)} vs. previous
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Deliverability Card */}
        <Card>
          <CardContent className="p-4">
            {isLoadingMetrics ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-500">Deliverability</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatPercent(metrics?.deliverability.value || 0)}
                </div>
                <div className={`text-xs flex items-center ${getPerformanceColor(metrics?.deliverability.change || 0)}`}>
                  {metrics?.deliverability.change && metrics.deliverability.change > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                  )}
                  <span>
                    {metrics?.deliverability.change && metrics.deliverability.change > 0 ? '+' : ''}
                    {formatPercent(metrics?.deliverability.change || 0)} vs. previous
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Unsubscribe Rate Card */}
        <Card>
          <CardContent className="p-4">
            {isLoadingMetrics ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-500">Unsubscribe Rate</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatPercent(metrics?.unsubscribeRate.value || 0)}
                </div>
                <div className={`text-xs flex items-center ${getPerformanceColor(metrics?.unsubscribeRate.change || 0, false)}`}>
                  {metrics?.unsubscribeRate.change && metrics.unsubscribeRate.change < 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                  )}
                  <span>
                    {metrics?.unsubscribeRate.change && metrics.unsubscribeRate.change > 0 ? '+' : ''}
                    {formatPercent(metrics?.unsubscribeRate.change || 0)} vs. previous
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Main Reporting Tabs */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-4 sm:grid-cols-none sm:inline-flex mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="exports">Export Reports</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Email Performance Trends</CardTitle>
                <CardDescription>
                  Open and click rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCharts ? (
                  <div className="space-y-2">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="h-[250px] w-full flex flex-col items-center justify-center">
                    {/* This would be a real chart in production */}
                    <LineChart className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500">
                      Performance chart would be rendered here with opens and clicks over time
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-500">Opens</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span className="text-xs text-gray-500">Clicks</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Realtime Activity Feed */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Realtime Activity</CardTitle>
                <CardDescription>
                  Latest subscriber interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRealtime ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                    {realtimeEvents?.map((event, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <div className={`p-2 rounded-full bg-gray-100 ${
                          event.type === 'open' ? 'text-blue-600' :
                          event.type === 'click' ? 'text-indigo-600' :
                          event.type === 'unsubscribe' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {event.type === 'open' ? <Mail className="h-4 w-4" /> :
                           event.type === 'click' ? <MousePointer className="h-4 w-4" /> :
                           event.type === 'unsubscribe' ? <Users className="h-4 w-4" /> :
                           <Calendar className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">
                            {event.type === 'open' ? 'Email opened' :
                             event.type === 'click' ? 'Link clicked' :
                             event.type === 'unsubscribe' ? 'Unsubscribed' :
                             'Other activity'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.email || 'Anonymous user'} • {event.campaign}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-400 mt-1">
                              {event.device} • {event.location} • {event.time}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(!realtimeEvents || realtimeEvents.length === 0) && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Top Performers Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Performers</CardTitle>
              <CardDescription>
                Best performing campaigns, subject lines, and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTopPerformers ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-5 w-32" />
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Top Subject Lines */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      Top Subject Lines
                    </h3>
                    <div className="space-y-4">
                      {topPerformers?.subjects.slice(0, 3).map((subject, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <div className="font-medium truncate pr-4 flex-1" title={subject.name}>
                              {index + 1}. {subject.name}
                            </div>
                            <div className="text-green-600 font-medium">
                              {formatPercent(subject.rate)}
                            </div>
                          </div>
                          <Progress value={subject.rate} max={100} className="h-1" />
                          <p className="text-xs text-gray-500">{formatNumber(subject.total)} opens</p>
                        </div>
                      ))}
                      
                      {(!topPerformers?.subjects || topPerformers.subjects.length === 0) && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Top Campaigns */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center">
                      <LineChart className="h-4 w-4 mr-2 text-purple-600" />
                      Top Campaigns
                    </h3>
                    <div className="space-y-4">
                      {topPerformers?.campaigns.slice(0, 3).map((campaign, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <div className="font-medium truncate pr-4 flex-1" title={campaign.name}>
                              {index + 1}. {campaign.name}
                            </div>
                            <div className="text-green-600 font-medium">
                              {formatPercent(campaign.rate)}
                            </div>
                          </div>
                          <Progress value={campaign.rate} max={100} className="h-1" />
                          <p className="text-xs text-gray-500">{formatNumber(campaign.total)} engagements</p>
                        </div>
                      ))}
                      
                      {(!topPerformers?.campaigns || topPerformers.campaigns.length === 0) && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Top Templates */}
                  <div>
                    <h3 className="text-sm font-medium mb-4 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                      Top Templates
                    </h3>
                    <div className="space-y-4">
                      {topPerformers?.templates.slice(0, 3).map((template, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <div className="font-medium truncate pr-4 flex-1" title={template.name}>
                              {index + 1}. {template.name}
                            </div>
                            <div className="text-green-600 font-medium">
                              {formatPercent(template.rate)}
                            </div>
                          </div>
                          <Progress value={template.rate} max={100} className="h-1" />
                          <p className="text-xs text-gray-500">{formatNumber(template.total)} clicks</p>
                        </div>
                      ))}
                      
                      {(!topPerformers?.templates || topPerformers.templates.length === 0) && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Campaigns Tab Content */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Campaign Performance</CardTitle>
              <CardDescription>
                Detailed metrics for all your email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCampaigns ? (
                <>
                  <Skeleton className="h-8 w-full mb-4" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Campaign Name</TableHead>
                        <TableHead className="text-center">Sent Date</TableHead>
                        <TableHead className="text-center">Recipients</TableHead>
                        <TableHead className="text-center">Opens</TableHead>
                        <TableHead className="text-center">Open Rate</TableHead>
                        <TableHead className="text-center">Clicks</TableHead>
                        <TableHead className="text-center">Click Rate</TableHead>
                        <TableHead className="text-center">Bounces</TableHead>
                        <TableHead className="text-center">Unsubscribes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignMetrics?.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">
                            <Button variant="link" className="p-0 h-auto font-medium justify-start">
                              {campaign.name}
                            </Button>
                          </TableCell>
                          <TableCell className="text-center">{formatDate(campaign.sentDate)}</TableCell>
                          <TableCell className="text-center">{formatNumber(campaign.recipients)}</TableCell>
                          <TableCell className="text-center">{formatNumber(campaign.opens)}</TableCell>
                          <TableCell className="text-center font-medium">
                            <span className={campaign.openRate >= 20 ? 'text-green-600' : 
                                          campaign.openRate >= 15 ? 'text-emerald-600' :
                                          campaign.openRate >= 10 ? 'text-amber-600' : 'text-gray-600'}>
                              {formatPercent(campaign.openRate)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">{formatNumber(campaign.clicks)}</TableCell>
                          <TableCell className="text-center font-medium">
                            <span className={campaign.clickRate >= 4 ? 'text-green-600' : 
                                          campaign.clickRate >= 2.5 ? 'text-emerald-600' :
                                          campaign.clickRate >= 1 ? 'text-amber-600' : 'text-gray-600'}>
                              {formatPercent(campaign.clickRate)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={campaign.bounces / campaign.recipients * 100 <= 1 ? 'text-green-600' : 
                                          campaign.bounces / campaign.recipients * 100 <= 3 ? 'text-amber-600' : 
                                          'text-red-600'}>
                              {formatNumber(campaign.bounces)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={campaign.unsubscribes / campaign.recipients * 100 <= 0.1 ? 'text-green-600' : 
                                          campaign.unsubscribes / campaign.recipients * 100 <= 0.5 ? 'text-amber-600' : 
                                          'text-red-600'}>
                              {formatNumber(campaign.unsubscribes)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {(!campaignMetrics || campaignMetrics.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center">
                              <BarChart2 className="h-12 w-12 text-gray-300 mb-2" />
                              <p className="text-gray-500">No campaign data available</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="text-sm text-gray-500">
                Showing {campaignMetrics?.length || 0} campaigns
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <span>View all campaigns</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">A/B Test Results</CardTitle>
                <CardDescription>
                  Performance comparison of A/B test campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCampaigns ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y">
                    <div className="py-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-sm">Subject Line Testing</h4>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Variant A: "Spring Sale: 25% Off All Products"</span>
                            <span className="text-green-600 font-medium">Winner</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={24.8} max={100} className="h-2 flex-1" />
                            <span className="text-xs font-medium">24.8%</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Variant B: "Last Chance: Spring Discounts Inside"</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={19.2} max={100} className="h-2 flex-1" />
                            <span className="text-xs font-medium">19.2%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-sm">Call-to-Action Testing</h4>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Variant A: "Shop Now"</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={3.2} max={10} className="h-2 flex-1" />
                            <span className="text-xs font-medium">3.2%</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Variant B: "See Exclusive Deals"</span>
                            <span className="text-blue-600 font-medium">Leading</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={4.5} max={10} className="h-2 flex-1" />
                            <span className="text-xs font-medium">4.5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end">
                <Button size="sm" onClick={() => setLocation('/client-ab-testing')}>
                  View all A/B tests
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Campaign Engagement</CardTitle>
                <CardDescription>
                  Link click distribution and content engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCampaigns ? (
                  <div className="space-y-3">
                    <Skeleton className="h-[200px] w-full" />
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-[180px] w-full flex flex-col items-center justify-center mb-4">
                      {/* This would be a real chart in production */}
                      <PieChart className="h-16 w-16 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500 mb-2">
                        Link click distribution by content type
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          Product links (45%)
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          CTA buttons (30%)
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          Content links (20%)
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                          Other (5%)
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm font-medium mb-2">Top clicked links</div>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between items-center py-1 border-b">
                          <span className="flex-1 truncate">Shop New Arrivals</span>
                          <span className="text-green-600 font-medium">12.4%</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b">
                          <span className="flex-1 truncate">Spring Collection 2025</span>
                          <span className="text-green-600 font-medium">8.7%</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b">
                          <span className="flex-1 truncate">Limited Time Offer</span>
                          <span className="text-green-600 font-medium">6.2%</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Audience Tab Content */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Audience Overview</CardTitle>
                <CardDescription>
                  Subscriber statistics and growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAudience ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Total Subscribers</span>
                        <span className="text-xs text-green-600">+5% this month</span>
                      </div>
                      <div className="text-3xl font-bold">
                        {formatNumber(audienceData?.total || 0)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Active</div>
                        <div className="text-xl font-medium">
                          {formatNumber(audienceData?.active || 0)}
                          <span className="text-sm text-gray-500 ml-1">
                            ({formatPercent((audienceData?.active || 0) / (audienceData?.total || 1) * 100)})
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500 mb-1">New This Month</div>
                        <div className="text-xl font-medium">
                          {formatNumber(audienceData?.new || 0)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Subscriber Growth</div>
                      <div className="h-[120px] w-full flex flex-col items-center justify-center">
                        {/* This would be a real chart in production */}
                        <LineChart className="h-12 w-12 text-gray-300 mb-2" />
                        <p className="text-xs text-gray-500">
                          Growth trend would be displayed here
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Demographics</CardTitle>
                <CardDescription>
                  Subscriber demographic breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAudience ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-[150px] w-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-[100px] w-full" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <div className="text-sm font-medium mb-3">Age Distribution</div>
                      <div className="space-y-2">
                        {audienceData?.demographics.age.map((item, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{item.label}</span>
                              <span>{formatPercent(item.value)}%</span>
                            </div>
                            <Progress value={item.value} max={100} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-sm font-medium mb-3">Top Locations</div>
                      <div className="space-y-2">
                        {audienceData?.demographics.location.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{item.label}</span>
                            <Badge variant="outline">{formatPercent(item.value)}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Engagement Patterns</CardTitle>
                <CardDescription>
                  When and how subscribers engage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAudience ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-[100px] w-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-[100px] w-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm font-medium mb-3">Best Time to Send</div>
                      <div className="h-[100px] w-full flex flex-col items-center justify-center mb-2">
                        {/* This would be a real chart in production */}
                        <BarChart2 className="h-12 w-12 text-gray-300 mb-2" />
                        <div className="text-sm">
                          <span className="font-medium text-green-600">Tuesday-Thursday</span>
                          <span className="text-gray-500 mx-1">•</span>
                          <span className="font-medium text-green-600">9am-11am</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Based on historical open rates and engagement
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-sm font-medium mb-3">Device Usage</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Mobile</span>
                          <Badge variant="outline">68%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Desktop</span>
                          <Badge variant="outline">24%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tablet</span>
                          <Badge variant="outline">8%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Exports Tab Content */}
        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export Reports</CardTitle>
              <CardDescription>
                Generate and download detailed reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
                  <div className="flex flex-col items-center text-center space-y-2 mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <BarChart2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium">Campaign Performance</h3>
                    <p className="text-sm text-gray-500">
                      Detailed metrics and analytics for all campaigns
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="radio" id="camp-all" name="camp-report" className="mr-2" defaultChecked />
                      <label htmlFor="camp-all" className="text-sm">All campaigns</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="camp-select" name="camp-report" className="mr-2" />
                      <label htmlFor="camp-select" className="text-sm">Selected campaigns</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="camp-date" name="camp-report" className="mr-2" />
                      <label htmlFor="camp-date" className="text-sm">Date range</label>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={downloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
                  <div className="flex flex-col items-center text-center space-y-2 mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium">Audience Report</h3>
                    <p className="text-sm text-gray-500">
                      Subscriber growth, demographics and engagement data
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="radio" id="aud-overview" name="aud-report" className="mr-2" defaultChecked />
                      <label htmlFor="aud-overview" className="text-sm">Overview</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="aud-demo" name="aud-report" className="mr-2" />
                      <label htmlFor="aud-demo" className="text-sm">Demographics</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="aud-eng" name="aud-report" className="mr-2" />
                      <label htmlFor="aud-eng" className="text-sm">Engagement</label>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={downloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors">
                  <div className="flex flex-col items-center text-center space-y-2 mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <LineChart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium">Growth & Trends</h3>
                    <p className="text-sm text-gray-500">
                      Long-term performance trends and growth analytics
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="radio" id="trend-month" name="trend-report" className="mr-2" defaultChecked />
                      <label htmlFor="trend-month" className="text-sm">Monthly</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="trend-quarter" name="trend-report" className="mr-2" />
                      <label htmlFor="trend-quarter" className="text-sm">Quarterly</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="trend-annual" name="trend-report" className="mr-2" />
                      <label htmlFor="trend-annual" className="text-sm">Annual</label>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={downloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 border-t pt-6">
                <h3 className="text-sm font-medium mb-4">Scheduled Reports</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-medium">Weekly Performance Summary</div>
                      <div className="text-sm text-gray-500">Sent every Monday at 9:00 AM</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="cursor-pointer">Edit</Badge>
                      <Badge variant="outline" className="cursor-pointer">Delete</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-medium">Monthly Audience Report</div>
                      <div className="text-sm text-gray-500">Sent on the 1st of every month</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="cursor-pointer">Edit</Badge>
                      <Badge variant="outline" className="cursor-pointer">Delete</Badge>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="mt-6">
                  Schedule New Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientReporting;