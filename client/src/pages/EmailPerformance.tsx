import { useState } from 'react';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

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

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subValue, 
  trend = 'neutral',
  trendValue
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
          </div>
          {trend && trendValue && (
            <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'outline'}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'} {trendValue}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmailPerformance: React.FC = () => {
  const [timeframe, setTimeframe] = useState('7days');
  const [campaignFilter, setCampaignFilter] = useState('all');
  
  // Using React Query to fetch metrics data
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery<EmailMetrics>({
    queryKey: ['/api/email-performance/metrics', timeframe, campaignFilter],
  });
  
  // Using React Query to fetch chart data
  const { data: chartData, isLoading: isLoadingCharts } = useQuery<ChartData>({
    queryKey: ['/api/email-performance/charts', timeframe, campaignFilter],
  });
  
  // Using React Query to fetch real-time activity
  const { data: realtimeData } = useQuery<RealtimeActivity[]>({
    queryKey: ['/api/email-performance/realtime'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Sample campaign data
  const campaigns = [
    { id: 1, name: 'Summer Sale Campaign' },
    { id: 2, name: 'Product Launch' },
    { id: 3, name: 'Weekly Newsletter' },
    { id: 4, name: 'Customer Re-engagement' },
  ];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Email Performance Dashboard
          </h1>
          <p className="text-gray-500">Track and analyze your email campaign metrics</p>
        </div>
        <div className="flex space-x-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Weekly Performance Trend</CardTitle>
                <CardDescription>Email opens, clicks, and conversions over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={chartData?.weeklyPerformance || emailPerformanceData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="opens" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="clicks" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="conversions" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Email engagement by device type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.deviceBreakdown || engagementByDevice}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(chartData?.deviceBreakdown || engagementByDevice).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Click Distribution</CardTitle>
                <CardDescription>Top clicked links in your emails</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { link: 'Product Link', clicks: 423 },
                      { link: 'Pricing Page', clicks: 312 },
                      { link: 'Blog Post', clicks: 287 },
                      { link: 'Contact Us', clicks: 196 },
                      { link: 'Social Media', clicks: 152 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" />
                    <YAxis dataKey="link" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Opens Tab */}
        <TabsContent value="opens" className="space-y-4">
          <DetailedOpens />
        </TabsContent>
        
        {/* Engagement Metrics Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
                <CardDescription>Open, click, and conversion rates trend</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { date: '01/04', open: 24.2, click: 3.1, conversion: 0.9 },
                      { date: '02/04', open: 25.1, click: 3.3, conversion: 1.0 },
                      { date: '03/04', open: 23.8, click: 3.0, conversion: 0.8 },
                      { date: '04/04', open: 24.5, click: 3.2, conversion: 1.1 },
                      { date: '05/04', open: 26.3, click: 3.7, conversion: 1.2 },
                      { date: '06/04', open: 28.1, click: 3.9, conversion: 1.4 },
                      { date: '07/04', open: 27.5, click: 3.8, conversion: 1.3 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="open" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="click" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="conversion" stackId="3" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Time of Day</CardTitle>
                <CardDescription>When your audience is most active</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { hour: '6am-9am', opens: 1240 },
                      { hour: '9am-12pm', opens: 2180 },
                      { hour: '12pm-3pm', opens: 3150 },
                      { hour: '3pm-6pm', opens: 2870 },
                      { hour: '6pm-9pm', opens: 1950 },
                      { hour: '9pm-12am', opens: 1050 },
                      { hour: '12am-6am', opens: 420 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="opens" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Client Distribution</CardTitle>
                <CardDescription>Most popular email clients among your subscribers</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.emailClientDistribution || [
                        { name: 'Gmail', value: 45 },
                        { name: 'Apple Mail', value: 28 },
                        { name: 'Outlook', value: 15 },
                        { name: 'Yahoo', value: 7 },
                        { name: 'Other', value: 5 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(chartData?.emailClientDistribution || [
                        { name: 'Gmail', value: 45 },
                        { name: 'Apple Mail', value: 28 },
                        { name: 'Outlook', value: 15 },
                        { name: 'Yahoo', value: 7 },
                        { name: 'Other', value: 5 },
                      ]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Campaign Comparison Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Campaign Performance Comparison</CardTitle>
                <CardDescription>Key metrics across different campaigns</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.campaignComparison || [
                      { name: 'Summer Sale', open: 26.2, click: 4.1, conversion: 1.2 },
                      { name: 'Product Launch', open: 31.8, click: 5.7, conversion: 1.8 },
                      { name: 'Weekly Newsletter', open: 22.4, click: 2.8, conversion: 0.7 },
                      { name: 'Re-engagement', open: 18.5, click: 3.2, conversion: 1.1 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="open" name="Open Rate %" fill="#8884d8" />
                    <Bar dataKey="click" name="Click Rate %" fill="#82ca9d" />
                    <Bar dataKey="conversion" name="Conversion Rate %" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subject Line Performance</CardTitle>
                <CardDescription>Open rates by subject line type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { type: 'Question-based', rate: 28.4 },
                      { type: 'Personalized', rate: 31.2 },
                      { type: 'Curiosity', rate: 26.8 },
                      { type: 'Urgency', rate: 25.3 },
                      { type: 'Value-prop', rate: 24.1 },
                      { type: 'Announcement', rate: 22.7 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" name="Open Rate %" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Send Time Effectiveness</CardTitle>
                <CardDescription>Open rates by day of week and time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: 'Mon', morning: 22.4, afternoon: 25.3, evening: 21.1 },
                      { day: 'Tue', morning: 24.1, afternoon: 26.8, evening: 22.5 },
                      { day: 'Wed', morning: 25.7, afternoon: 28.4, evening: 23.9 },
                      { day: 'Thu', morning: 23.5, afternoon: 27.2, evening: 22.8 },
                      { day: 'Fri', morning: 21.9, afternoon: 24.6, evening: 20.3 },
                      { day: 'Sat', morning: 18.6, afternoon: 20.4, evening: 19.2 },
                      { day: 'Sun', morning: 19.2, afternoon: 21.5, evening: 23.1 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="morning" name="Morning" fill="#8884d8" />
                    <Bar dataKey="afternoon" name="Afternoon" fill="#82ca9d" />
                    <Bar dataKey="evening" name="Evening" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Audience Insights Tab */}
        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Geographical Distribution</CardTitle>
                <CardDescription>Opens by geographical location</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { country: 'United States', opens: 5240 },
                      { country: 'United Kingdom', opens: 1820 },
                      { country: 'Canada', opens: 1350 },
                      { country: 'Australia', opens: 980 },
                      { country: 'Germany', opens: 780 },
                      { country: 'France', opens: 650 },
                      { country: 'Other', opens: 1540 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" />
                    <YAxis dataKey="country" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="opens" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown Over Time</CardTitle>
                <CardDescription>Changing device preferences</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: 'Jan', desktop: 48, mobile: 40, tablet: 12 },
                      { month: 'Feb', desktop: 47, mobile: 41, tablet: 12 },
                      { month: 'Mar', desktop: 46, mobile: 42, tablet: 12 },
                      { month: 'Apr', desktop: 45, mobile: 43, tablet: 12 },
                      { month: 'May', desktop: 43, mobile: 45, tablet: 12 },
                      { month: 'Jun', desktop: 42, mobile: 47, tablet: 11 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="desktop" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="mobile" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="tablet" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Subscriber Engagement Segments</CardTitle>
                <CardDescription>Distribution of subscribers by engagement level</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { segment: 'Highly Engaged (3+ clicks/email)', value: 15, count: 3658 },
                      { segment: 'Engaged (1-2 clicks/email)', value: 28, count: 6789 },
                      { segment: 'Passive (opens only)', value: 32, count: 7865 },
                      { segment: 'Dormant (no opens in 30 days)', value: 18, count: 4321 },
                      { segment: 'At Risk (no opens in 60 days)', value: 7, count: 1654 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip formatter={(value, name, props) => {
                      return name === 'value' ? `${value}% (${props.payload.count} subscribers)` : value;
                    }} />
                    <Bar dataKey="value" fill="#8884d8" name="Percentage" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Real-time activity feed */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Real-time Activity</CardTitle>
          <CardDescription>Latest email interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(realtimeData ? realtimeData.slice(0, 5) : [
              { time: '2 mins ago', type: 'open', email: 'Weekly Newsletter', user: 'john.doe@example.com' },
              { time: '5 mins ago', type: 'click', email: 'Product Launch', user: 'maria.smith@example.com' },
              { time: '8 mins ago', type: 'conversion', email: 'Summer Sale', user: 'robert.jones@example.com' },
              { time: '15 mins ago', type: 'open', email: 'Weekly Newsletter', user: 'alice.johnson@example.com' },
              { time: '18 mins ago', type: 'click', email: 'Customer Re-engagement', user: 'david.wilson@example.com' },
            ]).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
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
    </div>
  );
};

// Detailed Opens component to show which emails have been opened
const DetailedOpens = () => {
  // Using React Query to fetch detailed open data
  const { data: openData, isLoading } = useQuery<{
    emails: Array<{
      id: number;
      emailName: string;
      recipient: string;
      openCount: number;
      lastOpenedAt: string;
      device: string;
    }>
  }>({
    queryKey: ['/api/email-performance/detailed-opens'],
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Detailed Email Opens</CardTitle>
        <CardDescription>Specific emails that have been opened</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Loading open data...</div>
        ) : (
          <div className="overflow-auto max-h-96">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-500">Recipient</th>
                  <th className="text-center py-2 px-4 font-medium text-gray-500">Opens</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-500">Last Opened</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-500">Device</th>
                </tr>
              </thead>
              <tbody>
                {!openData?.emails || openData.emails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-400">No email open data available</td>
                  </tr>
                ) : (
                  openData.emails.map((email) => (
                    <tr key={email.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{email.emailName}</td>
                      <td className="py-3 px-4">{email.recipient}</td>
                      <td className="py-3 px-4 text-center font-medium">{email.openCount}</td>
                      <td className="py-3 px-4">{email.lastOpenedAt}</td>
                      <td className="py-3 px-4">{email.device}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailPerformance;