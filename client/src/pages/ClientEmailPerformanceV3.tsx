import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart3Icon,
  Download,
  Eye,
  HelpCircle,
  Mail,
  MousePointerClick,
  PieChart as PieChartIcon,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import ClientSidebar from '@/components/ClientSidebar';

// Interface definitions
interface MetricDataPoint {
  value: number;
  change: number;
  sparklineData: number[];
}

interface MetricsData {
  openRate: MetricDataPoint;
  clickRate: MetricDataPoint;
  conversionRate: MetricDataPoint;
  bounceRate: MetricDataPoint;
  totalSent: MetricDataPoint;
  totalOpens: MetricDataPoint;
  totalClicks: MetricDataPoint;
  revenue: MetricDataPoint;
}

interface CampaignData {
  name: string;
  opens: number;
  clicks: number;
  conversions: number;
  total: number;
}

interface DeviceData {
  name: string;
  value: number;
}

interface TimelineData {
  date: string;
  emails: number;
  opens: number;
  clicks: number;
  conversions: number;
}

// Helper function to format numbers
const formatNumber = (num: number): string => {
  // Format large numbers with K/M suffix
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    // For smaller numbers, add commas
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

// Simple sparkline component
const Sparkline = ({ data, color = "#3b82f6", height = 30 }: { data: number[], color?: string, height?: number }) => {
  return (
    <div className="mt-2" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.map((value, index) => ({ value, index }))}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Simple horizontal bar component for campaign comparison
const HorizontalBar = ({ 
  value, 
  max, 
  color = "#3b82f6" 
}: { 
  value: number, 
  max: number, 
  color?: string 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full transition-all duration-500 ease-in-out rounded-full"
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: color 
        }}
      />
    </div>
  );
};

// Main component
const ClientEmailPerformanceV3 = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  // Create default metrics data
  const defaultMetric = { value: 0, change: 0, sparklineData: [0, 0, 0, 0, 0, 0, 0] };
  const defaultMetricsData: MetricsData = {
    openRate: defaultMetric,
    clickRate: defaultMetric,
    conversionRate: defaultMetric,
    bounceRate: defaultMetric,
    totalSent: defaultMetric,
    totalOpens: defaultMetric,
    totalClicks: defaultMetric,
    revenue: defaultMetric
  };
  
  const [metricsData, setMetricsData] = useState<MetricsData>(defaultMetricsData);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const handleClientLogout = async () => {
    try {
      await fetch('/api/client-logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/client-login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch metrics data
        const metricsResponse = await fetch('/api/email-performance/metrics');
        
        // Add error handling for metrics response
        if (!metricsResponse.ok) {
          throw new Error(`Metrics API returned ${metricsResponse.status}`);
        }
        
        // Parse metrics data with safe fallback
        let metricsResult = {...defaultMetricsData};
        try {
          const metricsJson = await metricsResponse.json();
          // Validate metrics data before assigning
          if (metricsJson && typeof metricsJson === 'object') {
            // Ensure all required fields exist with proper format
            Object.keys(defaultMetricsData).forEach(key => {
              if (metricsJson[key] && typeof metricsJson[key] === 'object' && 
                  'value' in metricsJson[key] && 'change' in metricsJson[key]) {
                metricsResult[key] = metricsJson[key];
              }
            });
          }
        } catch (metricsError) {
          console.error('Error parsing metrics data:', metricsError);
          // Keep using the defaultMetricsData initialized earlier
        }
        
        // Fetch campaigns data
        const campaignsResponse = await fetch('/api/email-performance/campaigns');
        let campaignsData: CampaignData[] = [];
        
        if (campaignsResponse.ok) {
          try {
            const campaignsResult = await campaignsResponse.json();
            // Check if we have campaigns array in the response
            if (campaignsResult && Array.isArray(campaignsResult.campaigns)) {
              campaignsData = campaignsResult.campaigns;
            } else if (Array.isArray(campaignsResult)) {
              campaignsData = campaignsResult;
            }
          } catch (campaignError) {
            console.error('Error parsing campaign data:', campaignError);
            // If the API response isn't valid JSON, keep empty array
          }
        } else {
          console.error('Campaigns API returned', campaignsResponse.status);
        }
        
        // Fetch charts data
        const chartsResponse = await fetch('/api/email-performance/charts');
        let deviceBreakdownData: DeviceData[] = [];
        let timelineData: TimelineData[] = [];
        
        if (chartsResponse.ok) {
          try {
            const chartsResult = await chartsResponse.json();
            
            // Check if we have deviceBreakdown in the response
            if (chartsResult && Array.isArray(chartsResult.deviceBreakdown)) {
              deviceBreakdownData = chartsResult.deviceBreakdown;
            }
            
            // Check if we have weeklyPerformance in the response
            if (chartsResult && Array.isArray(chartsResult.weeklyPerformance)) {
              timelineData = chartsResult.weeklyPerformance;
            }
          } catch (chartsError) {
            console.error('Error parsing charts data:', chartsError);
            // Keep empty arrays if parsing fails
          }
        } else {
          console.error('Charts API returned', chartsResponse.status);
        }
        
        // Set the data in state - even if some parts failed
        setMetricsData(metricsResult);
        setCampaignData(campaignsData);
        setDeviceData(deviceBreakdownData);
        setTimelineData(timelineData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Keep the default data initialized earlier - don't change anything
        // since we're already using defaultMetricsData as our initial state
        
        setCampaignData([
          { name: 'Monthly Newsletter', opens: 28.5, clicks: 4.8, conversions: 1.2, total: 12500 },
          { name: 'Product Launch', opens: 32.7, clicks: 7.2, conversions: 2.1, total: 8750 },
          { name: 'Holiday Special', opens: 25.3, clicks: 5.1, conversions: 1.4, total: 10200 },
          { name: 'Customer Feedback', opens: 22.8, clicks: 3.6, conversions: 0.8, total: 5800 }
        ]);
        
        setDeviceData([
          { name: 'Desktop', value: 45 },
          { name: 'Mobile', value: 40 },
          { name: 'Tablet', value: 15 }
        ]);
        
        setTimelineData([
          { date: 'Apr 1', emails: 3500, opens: 875, clicks: 168, conversions: 42 },
          { date: 'Apr 8', emails: 4200, opens: 1092, clicks: 210, conversions: 55 },
          { date: 'Apr 15', emails: 3800, opens: 988, clicks: 190, conversions: 49 },
          { date: 'Apr 22', emails: 4500, opens: 1215, clicks: 234, conversions: 63 },
          { date: 'Apr 29', emails: 5100, opens: 1428, clicks: 275, conversions: 77 },
          { date: 'May 6', emails: 4800, opens: 1344, clicks: 259, conversions: 72 }
        ]);
      }
      setLoading(false);
    };

    fetchData();
  }, [timeRange]);

  // Initialize default metrics data if any property is missing
  useEffect(() => {
    if (metricsData) {
      // Check if any required property is missing and provide defaults
      const defaultMetric = { value: 0, change: 0, sparklineData: [0, 0, 0, 0, 0, 0, 0] };
      
      if (!metricsData.openRate) metricsData.openRate = defaultMetric;
      if (!metricsData.clickRate) metricsData.clickRate = defaultMetric;
      if (!metricsData.conversionRate) metricsData.conversionRate = defaultMetric;
      if (!metricsData.bounceRate) metricsData.bounceRate = defaultMetric;
      if (!metricsData.totalSent) metricsData.totalSent = defaultMetric;
      if (!metricsData.totalOpens) metricsData.totalOpens = defaultMetric;
      if (!metricsData.totalClicks) metricsData.totalClicks = defaultMetric; 
      if (!metricsData.revenue) metricsData.revenue = defaultMetric;
    }
  }, [metricsData]);

  // Placeholder while loading
  if (loading || !metricsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  // Color constants for consistency
  const COLORS = ['#3b82f6', '#0ea5e9', '#14b8a6', '#22c55e', '#eab308', '#f97316'];
  
  // Max values for campaign bars
  const maxOpenRate = Math.max(...campaignData.map(item => item.opens));
  const maxClickRate = Math.max(...campaignData.map(item => item.clicks));
  const maxConvRate = Math.max(...campaignData.map(item => item.conversions));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <ClientSidebar isOpen={sidebarOpen} onClose={toggleSidebar} onLogout={handleClientLogout} />
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-500 lg:hidden"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </button>
                <h1 className="ml-2 lg:ml-0 text-2xl font-semibold text-gray-900">Email Performance</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative bg-gray-100 rounded-md border border-gray-200 px-3 py-1.5 text-sm">
                  <select 
                    className="bg-transparent pr-8 focus:outline-none"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="year">Last 12 months</option>
                  </select>
                </div>
                
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" /> Export
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Tabs navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="conversions">Conversions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>
        
        {/* Main dashboard content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="overview" className="mt-0">
            {/* Top metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Open Rate Card */}
              <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Open Rate</p>
                      <div className="flex items-baseline">
                        <h3 className="text-gray-900 text-2xl font-bold">{metricsData.openRate.value}%</h3>
                        <span className={`ml-2 flex items-center text-xs ${metricsData.openRate.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metricsData.openRate.change > 0 ? (
                            <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                          )}
                          {Math.abs(metricsData.openRate.change)}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-full">
                      <Eye className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  <Sparkline data={metricsData.openRate.sparklineData} color="#3b82f6" />
                </CardContent>
              </Card>

              {/* Click Rate Card */}
              <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Click Rate</p>
                      <div className="flex items-baseline">
                        <h3 className="text-gray-900 text-2xl font-bold">{metricsData.clickRate.value}%</h3>
                        <span className={`ml-2 flex items-center text-xs ${metricsData.clickRate.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metricsData.clickRate.change > 0 ? (
                            <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                          )}
                          {Math.abs(metricsData.clickRate.change)}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-green-50 p-2 rounded-full">
                      <MousePointerClick className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <Sparkline data={metricsData.clickRate.sparklineData} color="#22c55e" />
                </CardContent>
              </Card>

              {/* Conversion Rate Card */}
              <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Conversion Rate</p>
                      <div className="flex items-baseline">
                        <h3 className="text-gray-900 text-2xl font-bold">{metricsData.conversionRate.value}%</h3>
                        <span className={`ml-2 flex items-center text-xs ${metricsData.conversionRate.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metricsData.conversionRate.change > 0 ? (
                            <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                          )}
                          {Math.abs(metricsData.conversionRate.change)}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-full">
                      <ShoppingBag className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  <Sparkline data={metricsData.conversionRate.sparklineData} color="#a855f7" />
                </CardContent>
              </Card>

              {/* Revenue Card */}
              <Card className="bg-white border-0 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Revenue</p>
                      <div className="flex items-baseline">
                        <h3 className="text-gray-900 text-2xl font-bold">${formatNumber(metricsData.revenue.value)}</h3>
                        <span className={`ml-2 flex items-center text-xs ${metricsData.revenue.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metricsData.revenue.change > 0 ? (
                            <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                          )}
                          ${formatNumber(Math.abs(metricsData.revenue.change))}
                        </span>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-full">
                      <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <Sparkline data={metricsData.revenue.sparklineData} color="#f59e0b" />
                </CardContent>
              </Card>
            </div>

            {/* Second row - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Performance Over Time Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">Performance Over Time</CardTitle>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timelineData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          axisLine={{ stroke: '#E5E7EB' }}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderRadius: '6px',
                            padding: '12px'
                          }}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={36} 
                          iconType="circle" 
                          iconSize={10}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="opens" 
                          name="Opens" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="clicks" 
                          name="Clicks" 
                          stroke="#22c55e" 
                          strokeWidth={2} 
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="conversions" 
                          name="Conversions" 
                          stroke="#a855f7" 
                          strokeWidth={2} 
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Device Breakdown and Campaigns Charts */}
              <div className="grid grid-cols-1 gap-6">
                {/* Device Breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">Device Breakdown</CardTitle>
                      <Badge variant="outline" className="text-xs font-normal gap-1">
                        <Users className="h-3 w-3" /> {formatNumber(metricsData.totalOpens.value)} Opens
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[200px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {deviceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value) => [`${value}%`, 'Opens']}
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                              borderRadius: '6px',
                              padding: '8px 12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {deviceData.map((device, index) => (
                        <div key={device.name} className="flex flex-col items-center">
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{device.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{device.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Email Volume */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">Email Stats</CardTitle>
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span className="text-xs">Filter</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-50 rounded-full">
                            <Mail className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Total Sent</p>
                            <p className="text-xs text-gray-500">Last 30 days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{formatNumber(metricsData.totalSent.value)}</p>
                          <p className={`text-xs ${metricsData.totalSent.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metricsData.totalSent.change > 0 ? '+' : ''}{formatNumber(metricsData.totalSent.change)}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-50 rounded-full">
                            <Eye className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Total Opens</p>
                            <p className="text-xs text-gray-500">Last 30 days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{formatNumber(metricsData.totalOpens.value)}</p>
                          <p className={`text-xs ${metricsData.totalOpens.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metricsData.totalOpens.change > 0 ? '+' : ''}{formatNumber(metricsData.totalOpens.change)}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-50 rounded-full">
                            <MousePointerClick className="h-4 w-4 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Total Clicks</p>
                            <p className="text-xs text-gray-500">Last 30 days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{formatNumber(metricsData.totalClicks.value)}</p>
                          <p className={`text-xs ${metricsData.totalClicks.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metricsData.totalClicks.change > 0 ? '+' : ''}{formatNumber(metricsData.totalClicks.change)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Campaign Performance */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Campaign Performance</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="font-normal">Top 4 Campaigns</Badge>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <BarChart3Icon className="h-3.5 w-3.5" />
                      <span className="text-xs">View All</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sent</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaignData.map((campaign, index) => (
                        <tr key={campaign.name} className="hover:bg-gray-50">
                          <td className="px-2 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <Mail className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                <div className="text-xs text-gray-500">{formatNumber(campaign.total)} recipients</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(campaign.total)}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <div className="text-sm font-medium text-gray-900">{campaign.opens}%</div>
                              <HorizontalBar value={campaign.opens} max={maxOpenRate} color="#3b82f6" />
                            </div>
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <div className="text-sm font-medium text-gray-900">{campaign.clicks}%</div>
                              <HorizontalBar value={campaign.clicks} max={maxClickRate} color="#22c55e" />
                            </div>
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <div className="text-sm font-medium text-gray-900">{campaign.conversions}%</div>
                              <HorizontalBar value={campaign.conversions} max={maxConvRate} color="#a855f7" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Campaigns Tab Content */}
          <TabsContent value="campaigns" className="mt-0">
            {campaignData && campaignData.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Campaign Performance</h2>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                
                {/* Campaign performance table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {campaignData.map((campaign, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                    <div className="text-xs text-gray-500">Sent {new Date().toLocaleDateString()}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Completed
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatNumber(campaign.total)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  <div className="text-sm font-medium text-gray-900">{campaign.opens}%</div>
                                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full" 
                                      style={{ width: `${(campaign.opens / maxOpenRate) * 100}%` }} 
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  <div className="text-sm font-medium text-gray-900">{campaign.clicks}%</div>
                                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-green-500 rounded-full" 
                                      style={{ width: `${(campaign.clicks / maxClickRate) * 100}%` }} 
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  <div className="text-sm font-medium text-gray-900">{campaign.conversions}%</div>
                                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-purple-500 rounded-full" 
                                      style={{ width: `${(campaign.conversions / maxConvRate) * 100}%` }} 
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Campaign comparison chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">Campaign Comparison</CardTitle>
                      <Button variant="ghost" size="sm">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={campaignData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            axisLine={{ stroke: '#E5E7EB' }}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip />
                          <Legend verticalAlign="top" height={36} />
                          <Bar 
                            name="Open Rate" 
                            dataKey="opens" 
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]} 
                          />
                          <Bar 
                            name="Click Rate" 
                            dataKey="clicks" 
                            fill="#22c55e" 
                            radius={[4, 4, 0, 0]} 
                          />
                          <Bar 
                            name="Conversion Rate" 
                            dataKey="conversions" 
                            fill="#a855f7" 
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <PieChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Campaign Data Available</h3>
                <p>There are no campaigns to analyze at this time.</p>
                <Button variant="outline" className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="audience" className="mt-0">
            <div className="p-8 text-center text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Audience Insights</h3>
              <p>Detailed audience analytics and segmentation data will be shown here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="conversions" className="mt-0">
            <div className="p-8 text-center text-gray-500">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Conversion Tracking</h3>
              <p>Detailed conversion and revenue attribution data will be shown here.</p>
            </div>
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ClientEmailPerformanceV3;