import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ActivityIcon,
  AlertCircle,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BarChart3Icon,
  BarChart4,
  BookOpenIcon,
  BriefcaseIcon,
  CheckCircle2,
  ChevronRightIcon,
  ClockIcon,
  Download,
  ExternalLinkIcon,
  Eye,
  FileBarChart,
  FileText,
  Globe,
  HelpCircle,
  HistoryIcon,
  InfoIcon,
  LayoutDashboard,
  Loader2,
  Mail,
  MousePointerClick,
  PieChart as PieChartIcon,
  RefreshCw,
  SendIcon,
  ShareIcon,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  TabletSmartphone,
  Tag,
  Timer,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react';

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
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal';
  delay?: number;
}

// Enhanced Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subValue, 
  trend = 'neutral',
  trendValue,
  icon,
  color = 'blue',
  delay = 0
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-700',
      title: 'text-blue-800',
      value: 'text-blue-900',
      trendUp: 'bg-blue-100 text-blue-800',
      trendDown: 'bg-red-100 text-red-800',
      trendNeutral: 'bg-gray-100 text-gray-800'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      iconBg: 'bg-green-100',
      iconText: 'text-green-700',
      title: 'text-green-800',
      value: 'text-green-900',
      trendUp: 'bg-green-100 text-green-800',
      trendDown: 'bg-red-100 text-red-800',
      trendNeutral: 'bg-gray-100 text-gray-800'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      iconBg: 'bg-red-100',
      iconText: 'text-red-700',
      title: 'text-red-800',
      value: 'text-red-900',
      trendUp: 'bg-green-100 text-green-800',
      trendDown: 'bg-red-100 text-red-800',
      trendNeutral: 'bg-gray-100 text-gray-800'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-700',
      title: 'text-purple-800',
      value: 'text-purple-900',
      trendUp: 'bg-purple-100 text-purple-800',
      trendDown: 'bg-red-100 text-red-800',
      trendNeutral: 'bg-gray-100 text-gray-800'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-700',
      title: 'text-orange-800',
      value: 'text-orange-900',
      trendUp: 'bg-green-100 text-green-800',
      trendDown: 'bg-orange-100 text-orange-800',
      trendNeutral: 'bg-gray-100 text-gray-800'
    },
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      iconBg: 'bg-teal-100',
      iconText: 'text-teal-700',
      title: 'text-teal-800',
      value: 'text-teal-900',
      trendUp: 'bg-teal-100 text-teal-800',
      trendDown: 'bg-red-100 text-red-800',
      trendNeutral: 'bg-gray-100 text-gray-800'
    }
  };
  
  const classes = colorClasses[color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
    >
      <Card className={`${classes.bg} border ${classes.border} shadow-sm h-full`}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className={`text-sm font-medium ${classes.title}`}>{title}</CardTitle>
          </div>
          {icon && (
            <div className={`p-2 rounded-full ${classes.iconBg}`}>
              <span className={classes.iconText}>{icon}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div>
              <div className={`text-2xl font-bold ${classes.value}`}>{value}</div>
              {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
            </div>
            {trend && trendValue && (
              <Badge className={
                trend === 'up' 
                  ? classes.trendUp 
                  : trend === 'down' 
                    ? classes.trendDown 
                    : classes.trendNeutral
              }>
                {trend === 'up' ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                 trend === 'down' ? <ArrowDownIcon className="h-3 w-3 mr-1" /> : 
                 <ArrowRightIcon className="h-3 w-3 mr-1" />} 
                {trendValue}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Chart Card Component
interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  action?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  description, 
  children, 
  className = '',
  delay = 0,
  action
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className={className}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {action && (
              <div>
                {action}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Analytics Dashboard
const ClientEmailPerformance: React.FC = () => {
  const [timeframe, setTimeframe] = useState('7days');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ 
    metrics: EmailMetrics, 
    charts: ChartData,
    realtime: RealtimeActivity[]
  } | null>(null);
  
  // Reference for the auto-refresh timer
  const timerRef = useRef<number | null>(null);
  
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

  // Safe sample fallback metrics data - used when API calls fail
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

  // Safe fallback chart data
  const fallbackChartData: ChartData = {
    weeklyPerformance: [
      { day: 'Mon', opens: 120, clicks: 45, conversions: 12 },
      { day: 'Tue', opens: 140, clicks: 55, conversions: 15 },
      { day: 'Wed', opens: 180, clicks: 70, conversions: 18 },
      { day: 'Thu', opens: 190, clicks: 65, conversions: 20 },
      { day: 'Fri', opens: 210, clicks: 80, conversions: 22 },
      { day: 'Sat', opens: 150, clicks: 45, conversions: 14 },
      { day: 'Sun', opens: 130, clicks: 40, conversions: 10 }
    ],
    deviceBreakdown: [
      { name: 'Desktop', value: 45 },
      { name: 'Mobile', value: 40 },
      { name: 'Tablet', value: 15 }
    ],
    clickDistribution: [
      { link: 'Primary CTA', clicks: 350 },
      { link: 'Secondary Link', clicks: 210 },
      { link: 'Learn More', clicks: 180 },
      { link: 'Help Link', clicks: 90 },
      { link: 'Footer', clicks: 75 }
    ],
    engagementOverTime: [
      { date: '01/01', open: 24.5, click: 4.5, conversion: 1.2 },
      { date: '01/08', open: 25.1, click: 4.7, conversion: 1.3 },
      { date: '01/15', open: 24.8, click: 4.6, conversion: 1.1 },
      { date: '01/22', open: 26.2, click: 5.3, conversion: 1.5 },
      { date: '01/29', open: 27.1, click: 5.5, conversion: 1.6 },
      { date: '02/05', open: 28.3, click: 5.8, conversion: 1.8 }
    ],
    engagementByTimeOfDay: [
      { hour: '6am', opens: 320 },
      { hour: '9am', opens: 1240 },
      { hour: '12pm', opens: 1800 },
      { hour: '3pm', opens: 2100 },
      { hour: '6pm', opens: 1900 },
      { hour: '9pm', opens: 1050 }
    ],
    emailClientDistribution: [
      { name: 'Gmail', value: 45 },
      { name: 'Outlook', value: 28 },
      { name: 'Apple Mail', value: 15 },
      { name: 'Yahoo', value: 8 },
      { name: 'Other', value: 4 }
    ],
    campaignComparison: [
      { name: 'Campaign A', open: 26.5, click: 5.2, conversion: 1.3 },
      { name: 'Campaign B', open: 24.8, click: 4.9, conversion: 1.1 },
      { name: 'Campaign C', open: 28.9, click: 6.1, conversion: 1.8 },
      { name: 'Campaign D', open: 22.3, click: 3.8, conversion: 0.9 }
    ],
    subjectLinePerformance: [
      { type: 'Question-based', rate: 28.4 },
      { type: 'Emoji in subject', rate: 22.7 },
      { type: 'Personalized', rate: 31.2 },
      { type: 'Urgent/FOMO', rate: 26.8 },
      { type: 'Discount mention', rate: 29.5 },
      { type: 'Curiosity gap', rate: 25.3 }
    ],
    sendTimeEffectiveness: [
      { day: 'Mon', morning: 23.4, afternoon: 24.8, evening: 21.2 },
      { day: 'Tue', morning: 24.1, afternoon: 25.3, evening: 22.0 },
      { day: 'Wed', morning: 25.6, afternoon: 26.9, evening: 23.5 },
      { day: 'Thu', morning: 23.9, afternoon: 24.7, evening: 22.1 },
      { day: 'Fri', morning: 22.5, afternoon: 23.8, evening: 20.9 },
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

  // Safe fallback realtime data
  const fallbackRealtimeData: RealtimeActivity[] = [
    { time: '2 mins ago', type: 'Open', email: 'newsletter@company.com', user: 'j.smith@example.com' },
    { time: '5 mins ago', type: 'Click', email: 'offers@company.com', user: 'a.johnson@example.com' },
    { time: '8 mins ago', type: 'Open', email: 'newsletter@company.com', user: 'd.williams@example.com' },
    { time: '10 mins ago', type: 'Conversion', email: 'offers@company.com', user: 's.brown@example.com' },
    { time: '12 mins ago', type: 'Open', email: 'updates@company.com', user: 'm.jones@example.com' },
    { time: '15 mins ago', type: 'Click', email: 'newsletter@company.com', user: 'r.davis@example.com' },
    { time: '18 mins ago', type: 'Open', email: 'offers@company.com', user: 't.miller@example.com' }
  ];

  // Function to refresh data
  const refreshData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Set up common URL params
      const clientId = clientInfo?.clientId;
      const clientIdParam = clientId ? `&clientId=${clientId}` : '';
      
      // Fetch metrics data
      const metricsRes = await fetch(`/api/email-performance/metrics?timeframe=${timeframe}&campaignFilter=${campaignFilter}${clientIdParam}`);
      const metrics = metricsRes.ok ? await metricsRes.json() : fallbackMetricsData;
      
      // Fetch chart data
      const chartsRes = await fetch(`/api/email-performance/charts?timeframe=${timeframe}&campaignFilter=${campaignFilter}${clientIdParam}`);
      const charts = chartsRes.ok ? await chartsRes.json() : fallbackChartData;
      
      // Fetch realtime data
      const realtimeRes = await fetch(`/api/email-performance/realtime${clientId ? `?clientId=${clientId}` : ''}`);
      const realtime = realtimeRes.ok ? await realtimeRes.json() : fallbackRealtimeData;
      
      // Set all data together
      setData({
        metrics,
        charts,
        realtime
      });
    } catch (err) {
      console.error('Error fetching email performance data:', err);
      setError('Failed to load email performance data. Please try again later.');
      
      // Set fallback data if fetch fails
      setData({
        metrics: fallbackMetricsData,
        charts: fallbackChartData,
        realtime: fallbackRealtimeData
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Use useEffect to fetch data safely
  useEffect(() => {
    refreshData();
    
    // Set up interval to fetch realtime data
    const interval = setInterval(() => {
      refreshData(false);
    }, 30000);
    
    // Store the interval ID
    timerRef.current = interval as unknown as number;
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeframe, campaignFilter, clientInfo]);
  
  // Sample campaign data for filter
  const campaigns = [
    { id: 1, name: 'Summer Sale Campaign' },
    { id: 2, name: 'Product Launch' },
    { id: 3, name: 'Weekly Newsletter' },
    { id: 4, name: 'Customer Re-engagement' },
  ];
  
  // Color configurations for charts
  const chartColors = {
    opens: '#3b82f6',
    clicks: '#8b5cf6', 
    conversions: '#10b981',
    bounces: '#ef4444',
    desktop: '#3b82f6',
    mobile: '#8b5cf6',
    tablet: '#10b981',
    gmail: '#ea4335',
    outlook: '#0078d4',
    apple: '#a3aaae',
    yahoo: '#6001d2'
  };
  
  // Custom formatter for X-axis tick text with adaptive rotation
  const formatXAxisTickText = (tickItem: string) => {
    if (tickItem.length > 10) {
      return tickItem.substring(0, 10) + '...';
    }
    return tickItem;
  };
  
  // Device color configuration for pie charts
  const DEVICE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];
  
  // Email client color configuration for pie charts
  const EMAIL_CLIENT_COLORS = ['#ea4335', '#0078d4', '#a3aaae', '#6001d2', '#94a3b8'];
  
  // Subscriber segment color configuration
  const SUBSCRIBER_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Email Performance Analytics
            </h1>
            <p className="text-gray-500">Advanced insights and real-time tracking</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Loading analytics data...</p>
            <p className="text-sm text-muted-foreground">Processing performance metrics and engagement insights</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Email Performance Analytics
            </h1>
            <p className="text-gray-500">Advanced insights and real-time tracking</p>
          </div>
        </div>
        
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-destructive mr-3 mt-0.5" />
            <div>
              <h3 className="text-xl font-medium text-destructive mb-2">Error Loading Analytics Data</h3>
              <p className="mb-4">{error}</p>
              <Button onClick={() => refreshData()} variant="outline" className="mr-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract the data safely
  const metricsData = data?.metrics;
  const chartData = data?.charts;
  const realtimeData = data?.realtime;
  
  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  
  // Format percentages
  const formatPercent = (num: number): string => {
    return num.toFixed(1) + '%';
  };
  
  // Main content when data is loaded
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Email Performance Analytics
          </h1>
          <p className="text-gray-500">Advanced insights and real-time tracking</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
          
          <Button variant="outline" size="icon" onClick={() => refreshData()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs 
        value={activeDashboardTab} 
        onValueChange={setActiveDashboardTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Engagement</span>
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <TabletSmartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Devices & Clients</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Smart Insights</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard 
              title="Average Open Rate" 
              value={formatPercent(metricsData?.openRate?.value || 0)} 
              subValue={`Industry avg: ${formatPercent(metricsData?.openRate?.industryAvg || 0)}`}
              trend={(metricsData?.openRate?.trend || 'neutral') as 'up' | 'down' | 'neutral'}
              trendValue={metricsData?.openRate?.trendValue || ''}
              icon={<Eye className="h-4 w-4" />}
              color="blue"
              delay={0}
            />
            
            <MetricCard 
              title="Average Click Rate" 
              value={formatPercent(metricsData?.clickRate?.value || 0)} 
              subValue={`Industry avg: ${formatPercent(metricsData?.clickRate?.industryAvg || 0)}`}
              trend={(metricsData?.clickRate?.trend || 'neutral') as 'up' | 'down' | 'neutral'}
              trendValue={metricsData?.clickRate?.trendValue || ''}
              icon={<MousePointerClick className="h-4 w-4" />}
              color="purple"
              delay={1}
            />
            
            <MetricCard 
              title="Conversion Rate" 
              value={formatPercent(metricsData?.conversionRate?.value || 0)} 
              subValue={`Goal: ${formatPercent(metricsData?.conversionRate?.goal || 0)}`}
              trend={(metricsData?.conversionRate?.trend || 'neutral') as 'up' | 'down' | 'neutral'}
              trendValue={metricsData?.conversionRate?.trendValue || ''}
              icon={<ShoppingBag className="h-4 w-4" />}
              color="green"
              delay={2}
            />
            
            <MetricCard 
              title="Bounce Rate" 
              value={formatPercent(metricsData?.bounceRate?.value || 0)} 
              subValue={`Industry avg: ${formatPercent(metricsData?.bounceRate?.industryAvg || 0)}`}
              trend={metricsData?.bounceRate?.trend === 'up' ? 'down' : 'up'}
              trendValue={metricsData?.bounceRate?.trendValue || ''}
              icon={<XCircle className="h-4 w-4" />}
              color="red"
              delay={3}
            />
          </div>
          
          {/* Volume Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard 
              title="Total Emails Sent" 
              value={formatNumber(metricsData?.totalSent || 0)} 
              icon={<SendIcon className="h-4 w-4" />}
              color="teal"
              delay={4}
            />
            
            <MetricCard 
              title="Total Opens" 
              value={formatNumber(metricsData?.totalOpens || 0)} 
              icon={<Mail className="h-4 w-4" />}
              color="blue"
              delay={5}
            />
            
            <MetricCard 
              title="Total Clicks" 
              value={formatNumber(metricsData?.totalClicks || 0)} 
              icon={<MousePointerClick className="h-4 w-4" />}
              color="purple"
              delay={6}
            />
            
            <MetricCard 
              title="Unsubscribes" 
              value={formatNumber(metricsData?.unsubscribes || 0)} 
              icon={<UserMinus className="h-4 w-4" />}
              color="orange"
              delay={7}
            />
          </div>
          
          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard 
              title="Weekly Performance Trends" 
              description="Opens, clicks, and conversions over the past week"
              delay={0}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.weeklyPerformance}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatXAxisTickText}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [value, '']}
                      labelFormatter={(label) => `Day: ${label}`}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="opens" 
                      name="Opens" 
                      fill={chartColors.opens} 
                      radius={[4, 4, 0, 0]}
                      barSize={20} 
                    />
                    <Bar 
                      dataKey="clicks" 
                      name="Clicks" 
                      fill={chartColors.clicks} 
                      radius={[4, 4, 0, 0]}
                      barSize={20} 
                    />
                    <Bar 
                      dataKey="conversions" 
                      name="Conversions" 
                      fill={chartColors.conversions} 
                      radius={[4, 4, 0, 0]}
                      barSize={20} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Engagement Over Time" 
              description="Open, click, and conversion rates by date"
              delay={1}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData?.engagementOverTime}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="open" 
                      name="Open Rate" 
                      stroke={chartColors.opens} 
                      strokeWidth={2}
                      dot={{ r: 4, fill: chartColors.opens, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="click" 
                      name="Click Rate" 
                      stroke={chartColors.clicks} 
                      strokeWidth={2}
                      dot={{ r: 4, fill: chartColors.clicks, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversion" 
                      name="Conversion Rate" 
                      stroke={chartColors.conversions} 
                      strokeWidth={2}
                      dot={{ r: 4, fill: chartColors.conversions, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ChartCard 
              title="Device Breakdown" 
              description="Email opens by device type"
              delay={2}
            >
              <div className="p-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.deviceBreakdown || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(chartData?.deviceBreakdown || []).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  {(chartData?.deviceBreakdown || []).map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-1.5" 
                        style={{ backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length] }}
                      ></div>
                      <span className="text-sm">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Email Client Distribution" 
              description="Opens by email client"
              delay={3}
            >
              <div className="p-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.emailClientDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(chartData?.emailClientDistribution || []).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={EMAIL_CLIENT_COLORS[index % EMAIL_CLIENT_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  {(chartData?.emailClientDistribution || []).map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-1.5" 
                        style={{ backgroundColor: EMAIL_CLIENT_COLORS[index % EMAIL_CLIENT_COLORS.length] }}
                      ></div>
                      <span className="text-sm">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Real-time Activity" 
              description="Latest email interactions"
              delay={4}
              action={
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse mr-1.5"></span>
                    Live
                  </span>
                </Badge>
              }
            >
              <div className="h-[calc(100%-2rem)] overflow-y-auto p-3">
                <ul className="space-y-3">
                  {realtimeData?.map((activity, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start p-2 rounded-md bg-gray-50"
                    >
                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center mr-3
                        ${activity.type === 'Open' ? 'bg-blue-100 text-blue-700' : 
                          activity.type === 'Click' ? 'bg-purple-100 text-purple-700' : 
                          'bg-green-100 text-green-700'}
                      `}>
                        {activity.type === 'Open' ? (
                          <Eye className="h-4 w-4" />
                        ) : activity.type === 'Click' ? (
                          <MousePointerClick className="h-4 w-4" />
                        ) : (
                          <ShoppingBag className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className={`
                            text-xs font-medium px-1.5 py-0.5 rounded mr-2
                            ${activity.type === 'Open' ? 'bg-blue-100 text-blue-700' : 
                              activity.type === 'Click' ? 'bg-purple-100 text-purple-700' : 
                              'bg-green-100 text-green-700'}
                          `}>
                            {activity.type}
                          </span>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <p className="text-sm font-medium truncate mt-0.5">{activity.user}</p>
                        <p className="text-xs text-gray-500 truncate">{activity.email}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </ChartCard>
          </div>
        </TabsContent>
        
        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ChartCard 
              title="Click Distribution" 
              description="Performance of email links"
              delay={0}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.clickDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      dataKey="link" 
                      type="category" 
                      tick={{ fontSize: 12 }} 
                      width={120}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value} clicks`, '']}
                      labelFormatter={(label) => `Link: ${label}`}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Bar 
                      dataKey="clicks" 
                      fill={chartColors.clicks}
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    >
                      {chartData?.clickDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`hsl(265, ${50 + (index * 10)}%, ${60 - (index * 4)}%)`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Engagement by Time of Day" 
              description="When your audience is most active"
              delay={1}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData?.engagementByTimeOfDay}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.opens} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.opens} stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value} opens`, '']}
                      labelFormatter={(label) => `Time: ${label}`}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="opens" 
                      stroke={chartColors.opens} 
                      fillOpacity={1} 
                      fill="url(#colorOpens)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ChartCard 
              title="Subscriber Engagement Segments" 
              description="Distribution of subscriber activity levels"
              delay={2}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="20%" 
                    outerRadius="90%" 
                    barSize={20} 
                    data={chartData?.subscriberEngagementSegments}
                  >
                    <RadialBar
                      label={{ position: 'insideStart', fill: '#fff', fontWeight: 600 }}
                      background
                      dataKey="value"
                    >
                      {(chartData?.subscriberEngagementSegments || []).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SUBSCRIBER_COLORS[index % SUBSCRIBER_COLORS.length]} 
                        />
                      ))}
                    </RadialBar>
                    <RechartsTooltip
                      formatter={(value: number, name: string, props: any) => {
                        const segment = props.payload;
                        return [`${value}% (${formatNumber(segment.count)} subscribers)`, segment.segment];
                      }}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  {(chartData?.subscriberEngagementSegments || []).map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-1.5" 
                        style={{ backgroundColor: SUBSCRIBER_COLORS[index % SUBSCRIBER_COLORS.length] }}
                      ></div>
                      <span className="text-sm">{entry.segment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Geographical Distribution" 
              description="Email opens by country"
              delay={3}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.geographicalDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      dataKey="country" 
                      type="category" 
                      tick={{ fontSize: 12 }} 
                      width={100}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value} opens`, '']}
                      labelFormatter={(label) => `${label}`}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Bar 
                      dataKey="opens" 
                      fill={chartColors.opens}
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    >
                      {chartData?.geographicalDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`hsl(220, ${50 + (index * 8)}%, ${60 - (index * 5)}%)`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </TabsContent>
        
        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard 
              title="Device Breakdown" 
              description="Email opens by device type"
              delay={0}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value}% (${(percent * 100).toFixed(1)}%)`}
                    >
                      {chartData?.deviceBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Device Usage Over Time" 
              description="Trends in device usage over months"
              delay={1}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData?.deviceOverTime}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    stackOffset="expand"
                  >
                    <defs>
                      <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.desktop} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.desktop} stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.mobile} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.mobile} stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorTablet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.tablet} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.tablet} stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="desktop" 
                      stackId="1"
                      stroke={chartColors.desktop} 
                      fill={chartColors.desktop} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="mobile" 
                      stackId="1"
                      stroke={chartColors.mobile} 
                      fill={chartColors.mobile} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tablet" 
                      stackId="1"
                      stroke={chartColors.tablet} 
                      fill={chartColors.tablet} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title="Email Client Distribution" 
              description="Opens by email client"
              delay={2}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.emailClientDistribution}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Percentage"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    >
                      {chartData?.emailClientDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={EMAIL_CLIENT_COLORS[index % EMAIL_CLIENT_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Device Insights" 
              description="Actionable information about device usage"
              delay={3}
            >
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-lg mb-2 flex items-center">
                      <TabletSmartphone className="h-5 w-5 mr-2 text-blue-600" />
                      Device Optimization Recommendations
                    </h4>
                    <div className="space-y-3">
                      {chartData?.deviceBreakdown[0]?.name === 'Mobile' && chartData?.deviceBreakdown[0]?.value > 50 ? (
                        <Alert className="bg-blue-50 border-blue-200">
                          <div className="flex">
                            <InfoIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <AlertDescription>
                              <strong>Mobile First:</strong> Over 50% of your audience uses mobile devices. Prioritize mobile-optimized email designs.
                            </AlertDescription>
                          </div>
                        </Alert>
                      ) : (
                        <Alert className="bg-blue-50 border-blue-200">
                          <div className="flex">
                            <InfoIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <AlertDescription>
                              <strong>Multi-device Strategy:</strong> Your audience uses various devices. Ensure responsive design for all screen sizes.
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}
                      
                      {chartData?.emailClientDistribution[0]?.name === 'Gmail' && chartData?.emailClientDistribution[0]?.value > 40 ? (
                        <Alert className="bg-blue-50 border-blue-200">
                          <div className="flex">
                            <InfoIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <AlertDescription>
                              <strong>Gmail Dominance:</strong> A large portion of your audience uses Gmail. Test with Gmail's rendering and promotions tab placement.
                            </AlertDescription>
                          </div>
                        </Alert>
                      ) : (
                        <Alert className="bg-blue-50 border-blue-200">
                          <div className="flex">
                            <InfoIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <AlertDescription>
                              <strong>Client Diversity:</strong> Your audience uses multiple email clients. Test across all major platforms for consistency.
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg mb-2 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Trend Analysis
                    </h4>
                    
                    <div className="space-y-3">
                      {chartData?.deviceOverTime && chartData.deviceOverTime.length > 0 ? (
                        chartData.deviceOverTime[0]?.mobile < chartData.deviceOverTime[chartData.deviceOverTime.length - 1]?.mobile ? (
                          <Alert className="bg-green-50 border-green-200">
                            <div className="flex">
                              <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                              <AlertDescription>
                                <strong>Mobile Growth:</strong> Mobile usage has increased by approximately {Math.round((chartData.deviceOverTime[chartData.deviceOverTime.length - 1]?.mobile || 0) - (chartData.deviceOverTime[0]?.mobile || 0))}% since {chartData.deviceOverTime[0]?.month || 'start'}. Continue optimizing for mobile devices.
                              </AlertDescription>
                            </div>
                          </Alert>
                        ) : (
                          <Alert className="bg-orange-50 border-orange-200">
                            <div className="flex">
                              <InfoIcon className="h-4 w-4 text-orange-600 mr-2" />
                              <AlertDescription>
                                <strong>Device Shift:</strong> Consider testing new designs optimized for your audience's evolving device preferences.
                              </AlertDescription>
                            </div>
                          </Alert>
                        )
                      ) : (
                        <Alert className="bg-blue-50 border-blue-200">
                          <div className="flex">
                            <InfoIcon className="h-4 w-4 text-blue-600 mr-2" />
                            <AlertDescription>
                              <strong>Device Trend Analysis:</strong> Collect more data to analyze device usage patterns over time.
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </TabsContent>
        
        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard 
              title="Campaign Comparison" 
              description="Open, click and conversion rates by campaign"
              delay={0}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.campaignComparison}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`} 
                      tick={{ fontSize: 12 }} 
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="open" 
                      name="Open Rate" 
                      fill={chartColors.opens}
                      radius={[4, 4, 0, 0]} 
                      barSize={16}
                    />
                    <Bar 
                      dataKey="click" 
                      name="Click Rate" 
                      fill={chartColors.clicks}
                      radius={[4, 4, 0, 0]} 
                      barSize={16}
                    />
                    <Bar 
                      dataKey="conversion" 
                      name="Conversion Rate" 
                      fill={chartColors.conversions}
                      radius={[4, 4, 0, 0]} 
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Subject Line Performance" 
              description="How different subject line types perform"
              delay={1}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.subjectLinePerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => `${value}%`} 
                      tick={{ fontSize: 12 }} 
                    />
                    <YAxis 
                      dataKey="type" 
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }} 
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}% open rate`, '']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Bar 
                      dataKey="rate" 
                      name="Open Rate" 
                      fill={chartColors.opens}
                      radius={[0, 4, 4, 0]} 
                      barSize={16}
                    >
                      {chartData?.subjectLinePerformance.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`hsl(220, ${90 - (index * 8)}%, ${50 + (index * 3)}%)`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title="Send Time Effectiveness" 
              description="Open rates by day and time"
              delay={2}
            >
              <div className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData?.sendTimeEffectiveness}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tickFormatter={(value) => `${value}%`} 
                      tick={{ fontSize: 12 }} 
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}% open rate`, '']}
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="morning" 
                      name="Morning" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]} 
                      barSize={12}
                    />
                    <Bar 
                      dataKey="afternoon" 
                      name="Afternoon" 
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]} 
                      barSize={12}
                    />
                    <Bar 
                      dataKey="evening" 
                      name="Evening" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]} 
                      barSize={12}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Campaign Recommendations" 
              description="Automated insights for better campaigns"
              delay={3}
            >
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h4 className="text-blue-800 font-semibold text-sm mb-2 flex items-center">
                      <Timer className="h-4 w-4 mr-2" />
                      Best Sending Times
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Based on your data, emails sent on <strong>Wednesday afternoons</strong> have the highest open rates (26.9%). Consider scheduling your important campaigns at this time.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <h4 className="text-green-800 font-semibold text-sm mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-2" />
                      Subject Line Strategy
                    </h4>
                    <p className="text-green-700 text-sm">
                      <strong>Personalized subject lines</strong> are your top performers with 31.2% open rate. This is 5.4% higher than your average open rate. Consider increasing the use of personalization.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                    <h4 className="text-purple-800 font-semibold text-sm mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      High-performing Campaign
                    </h4>
                    <p className="text-purple-700 text-sm">
                      <strong>Campaign C</strong> has your best performance metrics with a 28.9% open rate and 6.1% click rate. Review this campaign's content, subject line, and timing to apply those tactics in future campaigns.
                    </p>
                  </div>
                  
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2 mt-2">
                    <FileBarChart className="h-4 w-4" />
                    View Detailed Campaign Analytics
                  </Button>
                </div>
              </div>
            </ChartCard>
          </div>
        </TabsContent>
        
        {/* Smart Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard 
              title="AI-Generated Engagement Score" 
              value="87/100" 
              subValue="Better than 73% of similar senders"
              trend="up"
              trendValue="5 points"
              icon={<Sparkles className="h-4 w-4" />}
              color="purple"
              delay={0}
            />
            
            <MetricCard 
              title="Predicted Monthly Growth" 
              value="8.3%" 
              subValue="Based on current trend analysis"
              trend="up"
              trendValue="1.2%"
              icon={<TrendingUp className="h-4 w-4" />}
              color="green"
              delay={1}
            />
            
            <MetricCard 
              title="Audience Health Score" 
              value="92/100" 
              subValue="List quality and engagement metrics"
              trend="up"
              trendValue="3 points"
              icon={<Users className="h-4 w-4" />}
              color="blue"
              delay={2}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title="Smart Insights" 
              description="AI-powered recommendations"
              delay={0}
            >
              <div className="p-6">
                <div className="space-y-5">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium mb-1">Audience Engagement Insights</h4>
                      <p className="text-sm text-gray-600 mb-2">Your highly engaged segment (28%) shows strong interaction with your content. Consider a loyalty program or exclusive content for this group to further boost engagement.</p>
                      <Button variant="link" size="sm" className="px-0 h-auto text-sm text-purple-700">
                        Analyze Engaged Segment
                        <ChevronRightIcon className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <ActivityIcon className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium mb-1">Content Performance Analysis</h4>
                      <p className="text-sm text-gray-600 mb-2">Email campaigns with product education content have a 23% higher click rate than promotional content. Consider increasing educational content in your email strategy.</p>
                      <Button variant="link" size="sm" className="px-0 h-auto text-sm text-blue-700">
                        View Content Analytics
                        <ChevronRightIcon className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                      <BriefcaseIcon className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium mb-1">Revenue Opportunity</h4>
                      <p className="text-sm text-gray-600 mb-2">Based on your current conversion rates, a 2% increase in click-through rate could generate approximately 15% more revenue from email campaigns.</p>
                      <Button variant="link" size="sm" className="px-0 h-auto text-sm text-green-700">
                        Explore Revenue Impact
                        <ChevronRightIcon className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>
            
            <ChartCard 
              title="Performance Benchmarks" 
              description="How you compare to industry standards"
              delay={1}
            >
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Open Rate</span>
                    </div>
                    <span className="text-sm font-medium">24.8% vs. 21.5% (Industry)</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
                          Your performance: +15.3%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                      <div style={{ width: "80%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <MousePointerClick className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">Click Rate</span>
                    </div>
                    <span className="text-sm font-medium">3.6% vs. 2.7% (Industry)</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-100">
                          Your performance: +33.3%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                      <div style={{ width: "85%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600"></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <ShoppingBag className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Conversion Rate</span>
                    </div>
                    <span className="text-sm font-medium">1.2% vs. 1.5% (Goal)</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-100">
                          Your performance: -20.0%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                      <div style={{ width: "60%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium">Bounce Rate</span>
                    </div>
                    <span className="text-sm font-medium">0.8% vs. 1.2% (Industry)</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-100">
                          Your performance: +33.3%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                      <div style={{ width: "90%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600"></div>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full flex items-center justify-center gap-2 mt-3">
                  <FileText className="h-4 w-4" />
                  Download Benchmark Report
                </Button>
              </div>
            </ChartCard>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <ChartCard 
              title="AI-Powered Recommendations" 
              description="Smart suggestions to improve your email performance"
              delay={2}
            >
              <div className="p-6">
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-full shadow-sm mr-4">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-blue-800 font-semibold mb-1">
                          Subject Line Enhancement
                        </h4>
                        <p className="text-blue-700 text-sm mb-3">
                          Personalized subject lines perform 31.2% better than other types. Consider adding customer names or browsing history references to increase open rates.
                        </p>
                        <div className="flex items-center text-sm">
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 mr-2">
                            High Impact
                          </Badge>
                          <Button variant="outline" size="sm" className="h-7 bg-white">
                            Apply to Next Campaign
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-100 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-full shadow-sm mr-4">
                        <ClockIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-purple-800 font-semibold mb-1">
                          Optimal Send Time Adjustment
                        </h4>
                        <p className="text-purple-700 text-sm mb-3">
                          Your data indicates Wednesday afternoons (2-4pm) have a 26.9% higher open rate than your current average send time. Consider rescheduling campaigns.
                        </p>
                        <div className="flex items-center text-sm">
                          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 mr-2">
                            Medium Impact
                          </Badge>
                          <Button variant="outline" size="sm" className="h-7 bg-white">
                            Adjust Send Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-full shadow-sm mr-4">
                        <TabletSmartphone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-green-800 font-semibold mb-1">
                          Mobile Optimization
                        </h4>
                        <p className="text-green-700 text-sm mb-3">
                          With mobile usage at 63% in May (up from 55% in January), focus on mobile-first design to improve click rates. Simplify layouts and use larger touch targets.
                        </p>
                        <div className="flex items-center text-sm">
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 mr-2">
                            High Impact
                          </Badge>
                          <Button variant="outline" size="sm" className="h-7 bg-white">
                            Get Mobile Templates
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Personalized Strategy Consultation
                    </Button>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Export the component
export default ClientEmailPerformance;

// Custom hook component
const UserMinus = ({ className }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
};