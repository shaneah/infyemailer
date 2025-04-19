import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data for now - will be replaced with API data
const emailPerformanceData = [
  { day: 'Mon', opens: 120, clicks: 45, conversions: 12 },
  { day: 'Tue', opens: 140, clicks: 55, conversions: 15 },
  { day: 'Wed', opens: 180, clicks: 70, conversions: 18 },
  { day: 'Thu', opens: 190, clicks: 65, conversions: 20 },
  { day: 'Fri', opens: 210, clicks: 80, conversions: 22 },
  { day: 'Sat', opens: 150, clicks: 45, conversions: 14 },
  { day: 'Sun', opens: 130, clicks: 40, conversions: 10 },
];

const engagementByDevice = [
  { name: 'Desktop', value: 45 },
  { name: 'Mobile', value: 40 },
  { name: 'Tablet', value: 15 },
];

const COLORS = ['#1e40af', '#d4af37', '#1a3a5f'];

// Define interfaces for our API data
interface MetricRate {
  value: number;
  industryAvg: number;
  trend: string;
  trendValue: string;
}

interface ConversionRate {
  value: number;
  goal: number;
  trend: string;
  trendValue: string;
}

interface EmailMetrics {
  openRate: MetricRate;
  clickRate: MetricRate;
  conversionRate: ConversionRate;
  bounceRate: MetricRate;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  unsubscribes: number;
}

interface ChartData {
  weeklyPerformance: Array<{ day: string; opens: number; clicks: number; conversions: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  clickDistribution: Array<{ link: string; clicks: number }>;
  engagementOverTime: Array<{ date: string; open: number; click: number; conversion: number }>;
  engagementByTimeOfDay: Array<{ hour: string; opens: number }>;
  emailClientDistribution: Array<{ name: string; value: number }>;
  campaignComparison: Array<{ name: string; open: number; click: number; conversion: number }>;
  subjectLinePerformance: Array<{ type: string; rate: number }>;
  sendTimeEffectiveness: Array<{ day: string; morning: number; afternoon: number; evening: number }>;
  geographicalDistribution: Array<{ country: string; opens: number }>;
  deviceOverTime: Array<{ month: string; desktop: number; mobile: number; tablet: number }>;
  subscriberEngagementSegments: Array<{ segment: string; value: number; count: number }>;
}

interface RealtimeActivity {
  time: string;
  type: string;
  email: string;
  user: string;
}

// Types for metrics card props
interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subValue, 
  trend, 
  trendValue 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{value}</h4>
            {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
          </div>
          {trend && (
            <Badge 
              variant={trend === 'up' ? 'success' : trend === 'down' ? 'destructive' : 'outline'}
              className="flex items-center gap-1"
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ClientEmailPerformance: React.FC = () => {
  const [timeframe, setTimeframe] = useState('7days');
  const [campaignFilter, setCampaignFilter] = useState('all');
  
  // Get client info from sessionStorage as that's where ClientSidebar stores it
  const clientInfo = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('clientUser');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error parsing client info from sessionStorage', e);
      return null;
    }
  }, []);

  // Sample fallback metrics data
  const fallbackMetricsData: EmailMetrics = {
    openRate: { value: 24.8, industryAvg: 21.5, trend: 'up', trendValue: '3.2%' },
    clickRate: { value: 3.6, industryAvg: 2.7, trend: 'up', trendValue: '0.9%' },
    conversionRate: { value: 1.2, goal: 1.5, trend: 'down', trendValue: '0.3%' },
    bounceRate: { value: 0.8, industryAvg: 1.2, trend: 'up', trendValue: '0.4%' },
    totalSent: 42857,
    totalOpens: 10628,
    totalClicks: 1543,
    unsubscribes: 38
  };

  // Sample fallback chart data
  const fallbackChartData: ChartData = {
    weeklyPerformance: emailPerformanceData,
    deviceBreakdown: engagementByDevice,
    clickDistribution: [
      { link: 'Primary CTA', clicks: 523 },
      { link: 'Secondary CTA', clicks: 412 },
      { link: 'Logo', clicks: 289 },
      { link: 'Feature Link 1', clicks: 156 },
      { link: 'Feature Link 2', clicks: 98 },
      { link: 'Social Media', clicks: 65 }
    ],
    engagementOverTime: [
      { date: '2025-03-15', open: 22.4, click: 3.2, conversion: 1.1 },
      { date: '2025-03-22', open: 23.1, click: 3.4, conversion: 1.2 },
      { date: '2025-03-29', open: 22.8, click: 3.3, conversion: 1.1 },
      { date: '2025-04-05', open: 23.5, click: 3.5, conversion: 1.3 },
      { date: '2025-04-12', open: 24.2, click: 3.6, conversion: 1.2 },
      { date: '2025-04-18', open: 24.8, click: 3.7, conversion: 1.3 }
    ],
    engagementByTimeOfDay: [
      { hour: '6am', opens: 3.2 },
      { hour: '8am', opens: 8.7 },
      { hour: '10am', opens: 15.3 },
      { hour: '12pm', opens: 12.8 },
      { hour: '2pm', opens: 10.5 },
      { hour: '4pm', opens: 9.2 },
      { hour: '6pm', opens: 14.6 },
      { hour: '8pm', opens: 18.2 },
      { hour: '10pm', opens: 7.5 }
    ],
    emailClientDistribution: [
      { name: 'Gmail', value: 48 },
      { name: 'Apple Mail', value: 27 },
      { name: 'Outlook', value: 18 },
      { name: 'Yahoo', value: 5 },
      { name: 'Other', value: 2 }
    ],
    campaignComparison: [
      { name: 'Newsletter', open: 24.8, click: 3.6, conversion: 1.2 },
      { name: 'Product Launch', open: 28.3, click: 4.2, conversion: 1.7 },
      { name: 'Sale Announcement', open: 32.1, click: 5.8, conversion: 2.3 },
      { name: 'Reengagement', open: 18.5, click: 2.7, conversion: 0.9 }
    ],
    subjectLinePerformance: [
      { type: 'Question', rate: 26.8 },
      { type: 'Curiosity', rate: 28.3 },
      { type: 'Benefit', rate: 24.1 },
      { type: 'Urgency', rate: 27.5 },
      { type: 'Announcement', rate: 23.2 }
    ],
    sendTimeEffectiveness: [
      { day: 'Mon', morning: 23.5, afternoon: 22.8, evening: 24.3 },
      { day: 'Tue', morning: 24.2, afternoon: 23.5, evening: 25.1 },
      { day: 'Wed', morning: 22.8, afternoon: 23.1, evening: 24.9 },
      { day: 'Thu', morning: 23.1, afternoon: 22.4, evening: 24.5 },
      { day: 'Fri', morning: 22.2, afternoon: 21.9, evening: 24.0 },
      { day: 'Sat', morning: 21.0, afternoon: 22.2, evening: 23.8 },
      { day: 'Sun', morning: 20.5, afternoon: 21.7, evening: 23.2 }
    ],
    geographicalDistribution: [
      { country: 'United States', opens: 5840 },
      { country: 'United Kingdom', opens: 1280 },
      { country: 'Canada', opens: 940 },
      { country: 'Australia', opens: 720 },
      { country: 'Germany', opens: 540 },
      { country: 'Other', opens: 1308 }
    ],
    deviceOverTime: [
      { month: 'Jan', desktop: 38, mobile: 55, tablet: 7 },
      { month: 'Feb', desktop: 36, mobile: 57, tablet: 7 },
      { month: 'Mar', desktop: 34, mobile: 59, tablet: 7 },
      { month: 'Apr', desktop: 32, mobile: 61, tablet: 7 },
      { month: 'May', desktop: 30, mobile: 63, tablet: 7 },
      { month: 'Jun', desktop: 29, mobile: 64, tablet: 7 }
    ],
    subscriberEngagementSegments: [
      { segment: 'Highly engaged', value: 28, count: 12040 },
      { segment: 'Regular', value: 42, count: 18002 },
      { segment: 'Occasional', value: 18, count: 7714 },
      { segment: 'Dormant', value: 12, count: 5101 }
    ]
  };

  // Sample fallback realtime data
  const fallbackRealtimeData: RealtimeActivity[] = [
    { time: '2 mins ago', type: 'Open', email: 'newsletter@company.com', user: 'j.smith@example.com' },
    { time: '5 mins ago', type: 'Click', email: 'offers@company.com', user: 'a.johnson@example.com' },
    { time: '8 mins ago', type: 'Open', email: 'newsletter@company.com', user: 'd.williams@example.com' },
    { time: '10 mins ago', type: 'Conversion', email: 'offers@company.com', user: 's.brown@example.com' },
    { time: '12 mins ago', type: 'Open', email: 'updates@company.com', user: 'm.jones@example.com' },
    { time: '15 mins ago', type: 'Click', email: 'newsletter@company.com', user: 'r.davis@example.com' },
    { time: '18 mins ago', type: 'Open', email: 'offers@company.com', user: 't.miller@example.com' }
  ];

  // Using React Query to fetch metrics data with fallback
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery<EmailMetrics>({
    queryKey: ['/api/email-performance/metrics', timeframe, campaignFilter],
    queryFn: async () => {
      try {
        const clientId = clientInfo?.clientId;
        const res = await fetch(`/api/email-performance/metrics?timeframe=${timeframe}&campaignFilter=${campaignFilter}${clientId ? `&clientId=${clientId}` : ''}`);
        if (!res.ok) {
          throw new Error('Failed to fetch metrics data');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching metrics:', error);
        return fallbackMetricsData;
      }
    },
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute 
    gcTime: 300000, // 5 minutes
  });

  // Using React Query to fetch chart data with fallback
  const { data: chartData, isLoading: isLoadingCharts } = useQuery<ChartData>({
    queryKey: ['/api/email-performance/charts', timeframe, campaignFilter],
    queryFn: async () => {
      try {
        const clientId = clientInfo?.clientId;
        const res = await fetch(`/api/email-performance/charts?timeframe=${timeframe}&campaignFilter=${campaignFilter}${clientId ? `&clientId=${clientId}` : ''}`);
        if (!res.ok) {
          throw new Error('Failed to fetch chart data');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching charts:', error);
      return fallbackChartData;
      }
    },
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute 
    gcTime: 300000, // 5 minutes
  });
  
  // Using React Query to fetch real-time activity with fallback
  const { data: realtimeData } = useQuery<RealtimeActivity[]>({
    queryKey: ['/api/email-performance/realtime'],
    queryFn: async () => {
      try {
        const clientId = clientInfo?.clientId;
        const res = await fetch(`/api/email-performance/realtime${clientId ? `?clientId=${clientId}` : ''}`);
        if (!res.ok) {
          throw new Error('Failed to fetch realtime data');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching realtime data:', error);
        return fallbackRealtimeData;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
  
  // Sample campaign data
  const campaigns = [
    { id: 1, name: 'Summer Sale Campaign' },
    { id: 2, name: 'Product Launch' },
    { id: 3, name: 'Weekly Newsletter' },
    { id: 4, name: 'Customer Re-engagement' },
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with blue gradient styling to match other client pages */}
      <div className="w-full bg-gradient-to-r from-blue-500 to-blue-700">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h3.8a2 2 0 0 0 1.4-.6L12 4.6a2 2 0 0 1 1.4-.6H20a2 2 0 0 1 2 2v1.4"></path>
                  <path d="M8 16l8-8"></path>
                  <path d="M16 16V8h-8"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Email Performance</h1>
                <p className="text-blue-100 text-sm">Analytics & Engagement Metrics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {clientInfo && (
                <div className="flex items-center bg-blue-800/50 rounded-full px-4 py-2 border border-blue-700/50">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></div>
                  <span className="text-sm text-blue-50">
                    {timeframe === '7days' ? 'Last 7 Days' : 
                     timeframe === '30days' ? 'Last 30 Days' : 
                     timeframe === 'today' ? 'Today' : 
                     timeframe === 'yesterday' ? 'Yesterday' : 'Last 90 Days'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        {/* Page introduction */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-300">Email Campaign Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Track open rates, click rates, and performance across all campaigns
              </p>
            </div>
            <div className="flex space-x-4">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="border-blue-200 dark:border-blue-800">
                  <SelectValue placeholder="Select Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="border-blue-200 dark:border-blue-800">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={String(campaign.id)}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="h-0.5 w-full bg-gradient-to-r from-blue-800 to-blue-400 rounded-full opacity-70"></div>
        </div>
      
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Open Rate" 
          value={metricsData ? `${metricsData.openRate.value.toFixed(1)}%` : "24.8%"} 
          subValue={metricsData ? `Industry avg: ${metricsData.openRate.industryAvg.toFixed(1)}%` : "Industry avg: 21.5%"} 
          trend={metricsData ? metricsData.openRate.trend as 'up' | 'down' | 'neutral' : "up"} 
          trendValue={metricsData ? metricsData.openRate.trendValue : "3.2%"}
        />
        <MetricCard 
          title="Click Rate" 
          value={metricsData ? `${metricsData.clickRate.value.toFixed(1)}%` : "3.6%"} 
          subValue={metricsData ? `Industry avg: ${metricsData.clickRate.industryAvg.toFixed(1)}%` : "Industry avg: 2.7%"} 
          trend={metricsData ? metricsData.clickRate.trend as 'up' | 'down' | 'neutral' : "up"} 
          trendValue={metricsData ? metricsData.clickRate.trendValue : "0.9%"}
        />
        <MetricCard 
          title="Conversion Rate" 
          value={metricsData ? `${metricsData.conversionRate.value.toFixed(1)}%` : "1.2%"} 
          subValue={metricsData ? `Goal: ${metricsData.conversionRate.goal.toFixed(1)}%` : "Goal: 1.5%"} 
          trend={metricsData ? metricsData.conversionRate.trend as 'up' | 'down' | 'neutral' : "down"} 
          trendValue={metricsData ? metricsData.conversionRate.trendValue : "0.3%"}
        />
        <MetricCard 
          title="Bounce Rate" 
          value={metricsData ? `${metricsData.bounceRate.value.toFixed(1)}%` : "0.8%"} 
          subValue={metricsData ? `Industry avg: ${metricsData.bounceRate.industryAvg.toFixed(1)}%` : "Industry avg: 1.2%"} 
          trend={metricsData ? metricsData.bounceRate.trend as 'up' | 'down' | 'neutral' : "up"} 
          trendValue={metricsData ? metricsData.bounceRate.trendValue : "0.4%"}
        />
      </div>
      
      {/* Extended Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Total Sent" 
          value={metricsData ? metricsData.totalSent.toLocaleString() : "42,857"} 
          subValue={`Last ${timeframe === '7days' ? '7 days' : timeframe === '30days' ? '30 days' : timeframe === '90days' ? '90 days' : timeframe}`}
        />
        <MetricCard 
          title="Total Opens" 
          value={metricsData ? metricsData.totalOpens.toLocaleString() : "10,628"} 
          subValue={metricsData ? `${(metricsData.totalOpens / metricsData.totalSent * 100).toFixed(1)}% of sent` : "24.8% of sent"}
        />
        <MetricCard 
          title="Total Clicks" 
          value={metricsData ? metricsData.totalClicks.toLocaleString() : "1,543"} 
          subValue={metricsData ? `${(metricsData.totalClicks / metricsData.totalSent * 100).toFixed(1)}% of sent` : "3.6% of sent"}
        />
        <MetricCard 
          title="Unsubscribes" 
          value={metricsData ? metricsData.unsubscribes.toLocaleString() : "38"} 
          subValue={metricsData ? `${(metricsData.unsubscribes / metricsData.totalSent * 100).toFixed(2)}% of sent` : "0.09% of sent"}
        />
      </div>
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opens">Email Opens</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Metrics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Comparison</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Email Heatmap Section */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Email Click Heatmap</CardTitle>
              <CardDescription>Visual representation of where users click in your emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative border rounded-md p-2">
                  <h4 className="text-center text-sm font-medium mb-2">Monthly Newsletter Template</h4>
                  <div className="relative bg-gray-100 rounded-md overflow-hidden" style={{ height: '400px' }}>
                    {/* Email Header */}
                    <div className="p-4 bg-[#1e40af] text-white text-center">
                      <div className="text-lg font-bold">Company Newsletter</div>
                      <div className="text-xs">Monthly Updates & Insights</div>
                    </div>
                    
                    {/* Hero Section */}
                    <div className="p-4 bg-white text-center border-b">
                      <h3 className="text-lg font-bold mb-2">April Edition: New Product Launch</h3>
                      <div className="bg-gray-200 mx-auto mb-2" style={{ height: '100px', width: '90%' }}></div>
                      <div className="inline-block px-3 py-1 bg-[#d4af37] text-white rounded relative">
                        Read More
                        {/* High click area overlay */}
                        <div className="absolute inset-0 bg-red-500 rounded opacity-40"></div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="grid grid-cols-2 gap-2 p-3">
                      <div className="bg-white p-2 rounded">
                        <div className="bg-gray-200 mb-1" style={{ height: '40px', width: '100%' }}></div>
                        <div className="bg-gray-200 mb-1" style={{ height: '20px', width: '80%' }}></div>
                        <div className="bg-gray-200 mb-1" style={{ height: '20px', width: '90%' }}></div>
                        <div className="inline-block px-2 py-1 text-xs bg-[#1e40af] text-white rounded mt-1 relative">
                          Learn More
                          {/* Medium click area overlay */}
                          <div className="absolute inset-0 bg-orange-500 rounded opacity-40"></div>
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="bg-gray-200 mb-1" style={{ height: '40px', width: '100%' }}></div>
                        <div className="bg-gray-200 mb-1" style={{ height: '20px', width: '70%' }}></div>
                        <div className="bg-gray-200 mb-1" style={{ height: '20px', width: '85%' }}></div>
                        <div className="inline-block px-2 py-1 text-xs bg-[#1e40af] text-white rounded mt-1 relative">
                          View Details
                          {/* Low click area overlay */}
                          <div className="absolute inset-0 bg-yellow-500 rounded opacity-40"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="p-3 bg-gray-200 text-center text-xs">
                      <div className="mb-1">© 2025 Your Company</div>
                      <div className="flex justify-center gap-2">
                        <span className="underline relative">Unsubscribe
                          {/* Medium click area overlay */}
                          <div className="absolute inset-0 bg-orange-500 opacity-30"></div>
                        </span>
                        <span className="underline">Preferences</span>
                        <span className="underline">View in Browser</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-4">Click Distribution Analysis</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 opacity-70 mr-2"></div>
                          <span className="text-sm">High Click Areas (15%+ CTR)</span>
                        </div>
                        <span className="text-sm font-medium">24.8%</span>
                      </div>
                      <Progress value={24.8} className="h-2" style={{ '--progress-foreground': 'rgb(239, 68, 68)' } as React.CSSProperties} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-orange-500 opacity-70 mr-2"></div>
                          <span className="text-sm">Medium Click Areas (5-15% CTR)</span>
                        </div>
                        <span className="text-sm font-medium">12.3%</span>
                      </div>
                      <Progress value={12.3} className="h-2" style={{ '--progress-foreground': 'rgb(249, 115, 22)' } as React.CSSProperties} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 opacity-70 mr-2"></div>
                          <span className="text-sm">Low Click Areas (&lt; 5% CTR)</span>
                        </div>
                        <span className="text-sm font-medium">3.8%</span>
                      </div>
                      <Progress value={3.8} className="h-2" style={{ '--progress-foreground': 'rgb(234, 179, 8)' } as React.CSSProperties} />
                    </div>
                    
                    <div className="mt-6">
                      <h5 className="text-sm font-medium mb-3">CTA Performance</h5>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Main CTA Button</span>
                          <span className="text-sm font-medium">23.5% CTR</span>
                        </div>
                        <Progress value={23.5} className="h-2" style={{ '--progress-foreground': '#1e40af' } as React.CSSProperties} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm">Links in Text</span>
                          <span className="text-sm font-medium">8.7% CTR</span>
                        </div>
                        <Progress value={8.7} className="h-2" style={{ '--progress-foreground': '#d4af37' } as React.CSSProperties} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm">Image + Text CTAs</span>
                          <span className="text-sm font-medium">18.3% CTR</span>
                        </div>
                        <Progress value={18.3} className="h-2" style={{ '--progress-foreground': '#1a3a5f' } as React.CSSProperties} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Weekly Performance & Device Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
                <CardDescription>Open, click, and conversion rates by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData?.weeklyPerformance || fallbackChartData.weeklyPerformance}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="opens" fill="#1e40af" name="Opens" />
                      <Bar dataKey="clicks" fill="#d4af37" name="Clicks" />
                      <Bar dataKey="conversions" fill="#1a3a5f" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Email opens by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData?.deviceBreakdown || fallbackChartData.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {(chartData?.deviceBreakdown || fallbackChartData.deviceBreakdown).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Engagement Over Time and Link Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
                <CardDescription>Open, click, and conversion rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData?.engagementOverTime || fallbackChartData.engagementOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="open" stroke="#1e40af" name="Open Rate %" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="click" stroke="#d4af37" name="Click Rate %" />
                      <Line type="monotone" dataKey="conversion" stroke="#1a3a5f" name="Conversion Rate %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Link Performance</CardTitle>
                <CardDescription>Click distribution by link type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={chartData?.clickDistribution || fallbackChartData.clickDistribution}
                      margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="link" />
                      <Tooltip />
                      <Bar dataKey="clicks" fill="#1e40af" name="Clicks">
                        {(chartData?.clickDistribution || fallbackChartData.clickDistribution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Realtime Activity */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Realtime Email Activity</CardTitle>
              <CardDescription>Live feed of opens, clicks, and conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(realtimeData || fallbackRealtimeData).map((activity, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full w-2 h-2 bg-primary"></div>
                      <span className="font-medium">{activity.user}</span>
                      <Badge variant={activity.type === 'open' ? 'outline' : activity.type === 'click' ? 'secondary' : 'default'}>
                        {activity.type === 'open' ? 'Opened' : activity.type === 'click' ? 'Clicked' : 'Converted'}
                      </Badge>
                      <span>{activity.email}</span>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline">View All Activity</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default ClientEmailPerformance;