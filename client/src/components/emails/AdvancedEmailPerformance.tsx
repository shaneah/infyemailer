import { useState, useMemo, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
import { 
  BarChart3, 
  TrendingUp,
  Activity,
  Users,
  Clock,
  AlertCircle,
  BarChart2, 
  PieChart as PieChartIcon,
  Globe,
  Zap,
  ArrowUp,
  ArrowDown,
  Cpu,
  Mail,
  Target,
  Calendar,
  TrendingDown,
  LineChart as LineChartIcon,
  Smartphone,
  Tablet,
  Laptop,
  DollarSign,
  Percent,
  UserPlus,
  MousePointer
} from 'lucide-react';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType?: 'positive' | 'negative';
  period?: string;
  icon?: React.ReactNode;
  color?: string;
  target?: number;
  targetLabel?: string;
  dataSource?: string;
  compact?: boolean;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  period = 'Month to date', 
  icon, 
  color = 'primary',
  target,
  targetLabel,
  dataSource,
  compact = false
}: MetricCardProps) => {
  const progressValue = typeof target === 'number' ? Math.min(100, (Number(value.toString().replace(/[^0-9.]/g, '')) / target) * 100) : 67;
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border ${compact ? 'h-44' : ''}`}>
      <p className="text-xs text-muted-foreground mb-2">{period}</p>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="mt-1 flex items-end justify-between">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{value}</span>
        </div>
        <div className={`flex items-center text-xs ${
          changeType === 'positive' 
            ? "text-emerald-500" 
            : "text-rose-500" 
        }`}>
          {changeType === 'positive' ? (
            <ArrowUp className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDown className="h-3 w-3 mr-1" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      
      {targetLabel && (
        <div className="mt-1 mb-1 text-xs text-muted-foreground">
          {targetLabel}
        </div>
      )}
      
      <div className="mt-2 relative h-2 w-full bg-gray-100 dark:bg-gray-700 rounded">
        <div 
          className={`absolute top-0 left-0 h-full rounded`}
          style={{ 
            width: `${progressValue}%`,
            backgroundColor: color === 'primary' 
              ? 'hsl(var(--primary))' 
              : color === 'secondary' 
                ? 'hsl(var(--secondary))' 
                : color
          }}
        ></div>
      </div>
      
      {dataSource && (
        <div className="mt-2 flex items-center">
          {icon || <Activity className={`h-3 w-3 mr-1 text-${color}`} />}
          <span className="text-xs text-muted-foreground">{dataSource}</span>
        </div>
      )}
    </div>
  );
};

interface DashboardCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const DashboardCard = ({ children, title, description, action, className = '' }: DashboardCardProps) => {
  return (
    <Card className={`shadow-sm border ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

interface RecentDashboardCardProps {
  title: string;
  lastViewed: string;
  icon: React.ReactNode;
  color?: string;
}

const RecentDashboardCard = ({ title, lastViewed, icon, color = 'primary' }: RecentDashboardCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="aspect-video mb-4 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{lastViewed}</p>
    </div>
  );
};

// Sample data
const deviceBreakdown = [
  { name: 'Mobile', value: 62 },
  { name: 'Desktop', value: 28 },
  { name: 'Tablet', value: 10 },
];

const emailClientData = [
  { client: 'Gmail', percentage: 45 },
  { client: 'Apple Mail', percentage: 28 },
  { client: 'Outlook', percentage: 15 },
  { client: 'Yahoo', percentage: 7 },
  { client: 'Other', percentage: 5 },
];

const clickDistributionData = [
  { link: 'Product Link', clicks: 423 },
  { link: 'Pricing Page', clicks: 312 },
  { link: 'Blog Post', clicks: 287 },
  { link: 'Contact Us', clicks: 196 },
  { link: 'Social Media', clicks: 152 },
];

const performanceTrendData = [
  { day: 'Mon', opens: 2134, clicks: 324, conversions: 52 },
  { day: 'Tue', opens: 2485, clicks: 387, conversions: 61 },
  { day: 'Wed', opens: 2781, clicks: 452, conversions: 78 },
  { day: 'Thu', opens: 2542, clicks: 412, conversions: 64 },
  { day: 'Fri', opens: 2309, clicks: 356, conversions: 51 },
  { day: 'Sat', opens: 1876, clicks: 287, conversions: 42 },
  { day: 'Sun', opens: 1998, clicks: 301, conversions: 47 },
];

interface AdvancedEmailPerformanceProps {
  userName?: string;
  metrics?: any;
  charts?: any;
  isClient?: boolean;
  timeframe?: string;
  setTimeframe?: (value: string) => void;
  campaignFilter?: string;
  setCampaignFilter?: (value: string) => void;
}

export default function AdvancedEmailPerformance({ 
  userName = 'User', 
  metrics, 
  charts,
  isClient = false,
  timeframe = '7days',
  setTimeframe = () => {},
  campaignFilter = 'all',
  setCampaignFilter = () => {}
}: AdvancedEmailPerformanceProps) {
  
  useEffect(() => {
    console.log(`AdvancedEmailPerformance: timeframe changed to ${timeframe}`);
    console.log("Current metrics data:", metrics);
  }, [timeframe, metrics]);
  
  useEffect(() => {
    console.log(`AdvancedEmailPerformance: campaignFilter changed to ${campaignFilter}`);
    console.log("Current charts data:", charts);
  }, [campaignFilter, charts]);
  
  const userGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            {userGreeting}, {userName}
          </h1>
          <p className="text-muted-foreground mt-1">Email Performance Overview</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={timeframe || "7days"} 
            onValueChange={(value) => {
              console.log(`Select timeframe changed to: ${value}`);
              if (setTimeframe) setTimeframe(value);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs bg-white dark:bg-gray-800">
              <SelectValue>
                {timeframe === 'today' && 'Today'}
                {timeframe === 'yesterday' && 'Yesterday'}
                {timeframe === '7days' && 'Last 7 Days'}
                {timeframe === '30days' && 'Month to date'}
                {timeframe === '90days' && 'Quarter to date'}
                {!timeframe && 'Last 7 Days'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Month to date</SelectItem>
              <SelectItem value="90days">Quarter to date</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={campaignFilter || "all"} 
            onValueChange={(value) => {
              console.log(`Select campaign changed to: ${value}`);
              if (setCampaignFilter) setCampaignFilter(value);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs bg-white dark:bg-gray-800">
              <SelectValue>
                {campaignFilter === 'all' && 'All Campaigns'}
                {campaignFilter === '1' && 'Monthly Newsletter'}
                {campaignFilter === '2' && 'Product Announcements'}
                {campaignFilter === '3' && 'Welcome Series'}
                {!campaignFilter && 'All Campaigns'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="1">Monthly Newsletter</SelectItem>
              <SelectItem value="2">Product Announcements</SelectItem>
              <SelectItem value="3">Welcome Series</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Metrics Overview */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border">
        <h2 className="text-lg font-medium mb-4">Performance overview</h2>
        
        {/* Key Metrics - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard 
            title="Open Rate" 
            value={metrics?.openRate?.value ? `${metrics.openRate.value.toFixed(1)}%` : "24.8%"}
            change={metrics?.openRate?.trendValue ? parseFloat(metrics.openRate.trendValue) : 3.2}
            changeType={metrics?.openRate?.trend === "up" ? "positive" : "negative"}
            icon={<Mail className="h-3 w-3 text-primary mr-1" />}
            color="primary"
            dataSource="Mailchimp"
            target={50}
          />
          
          <MetricCard 
            title="Click Rate" 
            value={metrics?.clickRate?.value ? `${metrics.clickRate.value.toFixed(1)}%` : "3.6%"}
            change={metrics?.clickRate?.trendValue ? parseFloat(metrics.clickRate.trendValue) : 0.9}
            changeType={metrics?.clickRate?.trend === "up" ? "positive" : "negative"}
            icon={<MousePointer className="h-3 w-3 text-green-500 mr-1" />}
            color="#10b981"
            dataSource="HubSpot"
            target={10}
          />
          
          <MetricCard 
            title="Total Subscribers" 
            value={metrics?.totalSent ? metrics.totalSent.toLocaleString() : "42,857"}
            change={5.1}
            changeType="positive"
            icon={<Users className="h-3 w-3 text-orange-500 mr-1" />}
            color="#f59e0b"
            dataSource="Analytics"
            target={50000}
            targetLabel="Goal: 50,000"
          />
          
          <MetricCard 
            title="Conversion Rate" 
            value={metrics?.conversionRate?.value ? `${metrics.conversionRate.value.toFixed(1)}%` : "1.2%"}
            change={metrics?.conversionRate?.trendValue ? parseFloat(metrics.conversionRate.trendValue) : 0.3}
            changeType={metrics?.conversionRate?.trend === "up" ? "positive" : "negative"}
            icon={<Target className="h-3 w-3 text-purple-500 mr-1" />}
            color="#8b5cf6"
            dataSource="Analytics"
            target={4}
            targetLabel="Goal: 4.0%"
          />
        </div>
        
        {/* Second Row Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Bounce Rate" 
            value={metrics?.bounceRate?.value ? `${metrics.bounceRate.value.toFixed(1)}%` : "0.8%"}
            change={metrics?.bounceRate?.trendValue ? parseFloat(metrics.bounceRate.trendValue) : 0.4}
            changeType={metrics?.bounceRate?.trend === "up" ? "negative" : "positive"}
            icon={<AlertCircle className="h-3 w-3 text-red-500 mr-1" />}
            color="#ef4444"
            dataSource="Mailchimp"
            target={5}
          />
          
          <MetricCard 
            title="Active Readers" 
            value={metrics?.totalOpens ? metrics.totalOpens.toLocaleString() : "27,883"}
            change={12}
            changeType="positive"
            icon={<Activity className="h-3 w-3 text-green-500 mr-1" />}
            color="#10b981"
            dataSource="Mixpanel"
            target={40000}
          />
          
          <MetricCard 
            title="Revenue per Email" 
            value="$1.71"
            change={3.4}
            changeType="negative"
            icon={<DollarSign className="h-3 w-3 text-orange-500 mr-1" />}
            color="#f59e0b"
            dataSource="Stripe Analytics"
            target={3}
            targetLabel="Goal: $3.00"
          />
          
          <MetricCard 
            title="Unsubscribe Rate" 
            value={metrics?.unsubscribes ? `${(metrics.unsubscribes / metrics.totalSent * 100).toFixed(2)}%` : "0.09%"}
            change={2}
            changeType="positive"
            icon={<Globe className="h-3 w-3 text-blue-500 mr-1" />}
            color="#3b82f6"
            dataSource="Analytics"
            target={1}
          />
        </div>
      </div>
      
      {/* Recently Viewed Dashboards */}
      <div>
        <h2 className="text-lg font-medium mb-4">Recently viewed dashboards and reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <RecentDashboardCard
            title="Weekly Performance Dashboard"
            lastViewed="Last viewed 2 days ago"
            icon={<BarChart2 className="h-12 w-12 text-primary/50" />}
          />
          
          <RecentDashboardCard
            title="Marketing Dashboard"
            lastViewed="Last viewed 3 days ago"
            icon={<LineChartIcon className="h-12 w-12 text-purple-400/50" />}
          />
          
          <RecentDashboardCard
            title="Campaign Analytics Report"
            lastViewed="Last viewed 5 days ago"
            icon={<PieChartIcon className="h-12 w-12 text-orange-400/50" />}
          />
          
          <RecentDashboardCard
            title="Audience Demographics"
            lastViewed="Last viewed 1 week ago"
            icon={<BarChart3 className="h-12 w-12 text-blue-400/50" />}
          />
          
          <RecentDashboardCard
            title="Geographic Performance"
            lastViewed="Last viewed 2 weeks ago"
            icon={<Globe className="h-12 w-12 text-green-400/50" />}
          />
        </div>
      </div>
      
      {/* Tabs Interface */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex flex-wrap mb-2 bg-white dark:bg-gray-800 border">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="campaigns" 
            className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Campaign Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="audience" 
            className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Audience Insights
          </TabsTrigger>
          <TabsTrigger 
            value="engagement" 
            className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Engagement
          </TabsTrigger>
          <TabsTrigger 
            value="opens" 
            className="data-[state=active]:bg-primary/10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Email Activity
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend Chart */}
            <DashboardCard
              title="Performance Trend"
              description="Opens, clicks, and conversions over time"
              action={
                <Select defaultValue="7days" onValueChange={(value) => console.log(`Chart timeframe changed to: ${value}`)}>
                  <SelectTrigger className="h-8 w-[130px] text-xs border bg-white dark:bg-gray-800">
                    <SelectValue>Last 7 days</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              }
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={charts?.weeklyPerformance || performanceTrendData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={true}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="opens" 
                      name="Opens" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ r: 3, fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      name="Clicks" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={{ r: 3, fill: "hsl(var(--secondary))" }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      name="Conversions" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#10b981" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
            
            {/* Device Distribution Chart */}
            <DashboardCard
              title="Device Breakdown"
              description="Email engagement by device type"
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts?.deviceBreakdown || deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(charts?.deviceBreakdown || deviceBreakdown).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>
          
          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Click Distribution Bar Chart */}
            <DashboardCard
              title="Click Distribution"
              description="Top clicked links in your emails"
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={charts?.clickDistribution || clickDistributionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      axisLine={true}
                      tickLine={false}
                    />
                    <YAxis 
                      dataKey="link" 
                      type="category" 
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="clicks" 
                      name="Clicks"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
            
            {/* Email Client Distribution */}
            <DashboardCard
              title="Email Client Distribution"
              description="Most popular email clients among subscribers"
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={charts?.emailClientDistribution || emailClientData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis 
                      dataKey="client"
                      axisLine={true}
                      tickLine={false}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, "Percentage"]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="percentage" 
                      name="Percentage" 
                      fill="hsl(var(--secondary))"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
        
        {/* Other tabs would be implemented here */}
        <TabsContent value="campaigns">
          <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
            <div className="text-center">
              <BarChart2 className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
              <h3 className="text-lg font-medium">Campaign Analysis</h3>
              <p className="text-muted-foreground mt-1">Campaign-specific performance data would appear here</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="audience">
          <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
            <div className="text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
              <h3 className="text-lg font-medium">Audience Insights</h3>
              <p className="text-muted-foreground mt-1">Audience segmentation and behavior data would appear here</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="engagement">
          <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
            <div className="text-center">
              <Activity className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
              <h3 className="text-lg font-medium">Engagement Metrics</h3>
              <p className="text-muted-foreground mt-1">Detailed engagement data would appear here</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="opens">
          <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
            <div className="text-center">
              <Mail className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
              <h3 className="text-lg font-medium">Email Activity</h3>
              <p className="text-muted-foreground mt-1">Detailed email open and click data would appear here</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}