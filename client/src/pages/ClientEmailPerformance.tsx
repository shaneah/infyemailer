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

const ClientEmailPerformance: React.FC = () => {
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
                          <span className="text-sm">Low Click Areas (<5% CTR)</span>
                        </div>
                        <span className="text-sm font-medium">3.2%</span>
                      </div>
                      <Progress value={3.2} className="h-2" style={{ '--progress-foreground': 'rgb(234, 179, 8)' } as React.CSSProperties} />
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Content Effectiveness</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm">CTA Buttons</span>
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
              </div>
            </CardContent>
          </Card>
          
          {/* Email performance over time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>Opens, clicks and conversions by day</CardDescription>
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
                    <Line type="monotone" dataKey="opens" stroke="#1e40af" activeDot={{ r: 8 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="clicks" stroke="#d4af37" activeDot={{ r: 6 }} strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#1a3a5f" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Email opens by device type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.deviceBreakdown || engagementByDevice}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(chartData?.deviceBreakdown || engagementByDevice).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Engagement by Time of Day & Email Clients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Time of Day</CardTitle>
                <CardDescription>When your audience opens emails</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.engagementByTimeOfDay || [
                      { hour: '12am-4am', opens: 120 },
                      { hour: '4am-8am', opens: 380 },
                      { hour: '8am-12pm', opens: 980 },
                      { hour: '12pm-4pm', opens: 850 },
                      { hour: '4pm-8pm', opens: 620 },
                      { hour: '8pm-12am', opens: 450 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="opens" fill="#1e40af" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Client Distribution</CardTitle>
                <CardDescription>What your audience uses to read emails</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.emailClientDistribution || [
                      { name: 'Gmail', value: 42 },
                      { name: 'Apple Mail', value: 28 },
                      { name: 'Outlook', value: 18 },
                      { name: 'Yahoo Mail', value: 8 },
                      { name: 'Samsung Mail', value: 3 },
                      { name: 'Other', value: 1 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#d4af37" name="Percentage" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Email Opens Tab Content - Detailed breakdown */}
        <TabsContent value="opens">
          <DetailedOpens />
        </TabsContent>
        
        {/* Engagement Metrics Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Subject Line Performance</CardTitle>
                <CardDescription>Open rates by subject line type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.subjectLinePerformance || [
                      { type: 'Question-based', rate: 28.4 },
                      { type: 'Emoji in subject', rate: 22.7 },
                      { type: 'Personalized', rate: 31.2 },
                      { type: 'Urgent/FOMO', rate: 26.8 },
                      { type: 'Discount mention', rate: 29.5 },
                      { type: 'Curiosity gap', rate: 25.3 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#1e40af" name="Open Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Send Time Effectiveness</CardTitle>
                <CardDescription>Open rates by day and time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.sendTimeEffectiveness || [
                      { day: 'Monday', morning: 23.4, afternoon: 21.2, evening: 18.7 },
                      { day: 'Tuesday', morning: 24.8, afternoon: 22.5, evening: 19.2 },
                      { day: 'Wednesday', morning: 25.2, afternoon: 23.8, evening: 19.5 },
                      { day: 'Thursday', morning: 23.1, afternoon: 21.9, evening: 18.4 },
                      { day: 'Friday', morning: 21.5, afternoon: 19.8, evening: 17.2 },
                      { day: 'Saturday', morning: 18.9, afternoon: 20.1, evening: 21.3 },
                      { day: 'Sunday', morning: 19.2, afternoon: 20.8, evening: 22.4 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="morning" fill="#1e40af" name="Morning (6am-12pm)" />
                    <Bar dataKey="afternoon" fill="#d4af37" name="Afternoon (12pm-6pm)" />
                    <Bar dataKey="evening" fill="#1a3a5f" name="Evening (6pm-12am)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
                <CardDescription>Tracking opens, clicks and conversions over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData?.engagementOverTime || [
                      { date: 'Jan', open: 24.2, click: 3.8, conversion: 1.2 },
                      { date: 'Feb', open: 23.8, click: 3.5, conversion: 1.1 },
                      { date: 'Mar', open: 25.1, click: 4.0, conversion: 1.3 },
                      { date: 'Apr', open: 26.4, click: 4.2, conversion: 1.4 },
                      { date: 'May', open: 24.8, click: 3.7, conversion: 1.2 },
                      { date: 'Jun', open: 23.5, click: 3.5, conversion: 1.0 }
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="open" stackId="1" stroke="#1e40af" fill="#1e40af" fillOpacity={0.8} name="Open Rate %" />
                    <Area type="monotone" dataKey="click" stackId="2" stroke="#d4af37" fill="#d4af37" fillOpacity={0.8} name="Click Rate %" />
                    <Area type="monotone" dataKey="conversion" stackId="3" stroke="#1a3a5f" fill="#1a3a5f" fillOpacity={0.8} name="Conversion Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Click Distribution</CardTitle>
                <CardDescription>Most clicked links in your emails</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.clickDistribution || [
                      { link: 'Product Page', clicks: 423 },
                      { link: 'Pricing', clicks: 356 },
                      { link: 'Blog Post', clicks: 289 },
                      { link: 'Special Offer', clicks: 475 },
                      { link: 'Documentation', clicks: 187 },
                      { link: 'Contact Us', clicks: 142 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" />
                    <YAxis dataKey="link" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="clicks" fill="#1a3a5f" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Campaign Comparison Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Comparison</CardTitle>
              <CardDescription>Compare open, click, and conversion rates across campaigns</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData?.campaignComparison || [
                    { name: 'Monthly Newsletter', open: 25.4, click: 3.9, conversion: 1.2 },
                    { name: 'Product Launch', open: 31.8, click: 4.7, conversion: 1.8 },
                    { name: 'Summer Sale', open: 28.2, click: 5.3, conversion: 2.1 },
                    { name: 'Customer Re-engagement', open: 22.5, click: 3.2, conversion: 0.9 },
                    { name: 'Weekly Digest', open: 24.3, click: 3.5, conversion: 1.0 }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="open" fill="#1e40af" name="Open Rate %" />
                  <Bar dataKey="click" fill="#d4af37" name="Click Rate %" />
                  <Bar dataKey="conversion" fill="#1a3a5f" name="Conversion Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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
                    <Bar dataKey="opens" fill="#1e40af" />
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
                    <Area type="monotone" dataKey="desktop" stackId="1" stroke="#1e40af" fill="#1e40af" />
                    <Area type="monotone" dataKey="mobile" stackId="1" stroke="#d4af37" fill="#d4af37" />
                    <Area type="monotone" dataKey="tablet" stackId="1" stroke="#1a3a5f" fill="#1a3a5f" />
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
                    <Bar dataKey="value" fill="#1e40af" name="Percentage" />
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
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Fetch campaigns for the filter dropdown
  const { data: campaignsData } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ['/api/campaigns'],
  });
  
  // Using React Query to fetch detailed open data
  const { data: openData, isLoading } = useQuery<{
    emails: Array<{
      id: number;
      emailName: string;
      recipient: string;
      openCount: number;
      lastOpenedAt: string;
      device: string;
      campaignId: number;
      campaignName: string;
    }>
  }>({
    queryKey: ['/api/email-performance/detailed-opens', selectedCampaign],
    queryFn: async () => {
      const res = await fetch(`/api/email-performance/detailed-opens${selectedCampaign !== "all" ? `?campaignId=${selectedCampaign}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch open data');
      return res.json();
    }
  });

  // Define the EmailOpen type
  type EmailOpen = {
    id: number;
    emailName: string;
    recipient: string;
    openCount: number;
    lastOpenedAt: string;
    device: string;
    campaignId: number;
    campaignName: string;
  };

  // Filter emails based on search term
  const filteredEmails = useMemo(() => {
    if (!openData?.emails) return [];
    return openData.emails.filter((email: EmailOpen) => 
      email.emailName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [openData, searchTerm]);

  // Function to download email opens data as CSV
  const handleDownload = () => {
    if (!filteredEmails || filteredEmails.length === 0) return;
    
    // Create CSV content
    const headers = ["Email Name", "Recipient", "Opens", "Last Opened", "Device", "Campaign"];
    const csvRows = [headers];
    
    filteredEmails.forEach((email: EmailOpen) => {
      csvRows.push([
        email.emailName,
        email.recipient,
        email.openCount.toString(),
        email.lastOpenedAt,
        email.device,
        email.campaignName
      ]);
    });
    
    // Convert to CSV format
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `email-opens-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Detailed Email Opens</CardTitle>
            <CardDescription>Specific emails that have been opened</CardDescription>
          </div>
          <Button onClick={handleDownload} variant="outline" size="sm" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download CSV
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <div className="flex-1">
            <label htmlFor="search-opens" className="text-sm font-medium mb-1 block">Search</label>
            <input
              id="search-opens"
              type="text"
              placeholder="Search by email or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label htmlFor="campaign-filter" className="text-sm font-medium mb-1 block">Filter by Campaign</label>
            <select
              id="campaign-filter"
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Campaigns</option>
              {campaignsData?.map(campaign => (
                <option key={campaign.id} value={campaign.id.toString()}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
        </div>
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
                  <th className="text-left py-2 px-4 font-medium text-gray-500">Campaign</th>
                </tr>
              </thead>
              <tbody>
                {!filteredEmails || filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-400">No email open data available</td>
                  </tr>
                ) : (
                  filteredEmails.map((email: EmailOpen) => (
                    <tr key={email.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{email.emailName}</td>
                      <td className="py-3 px-4">{email.recipient}</td>
                      <td className="py-3 px-4 text-center font-medium">{email.openCount}</td>
                      <td className="py-3 px-4">{email.lastOpenedAt}</td>
                      <td className="py-3 px-4">{email.device}</td>
                      <td className="py-3 px-4">{email.campaignName}</td>
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

export default ClientEmailPerformance;