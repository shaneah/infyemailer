import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as ReChartsPieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { 
  Activity, Inbox, BarChart3, Users, Calendar, MailCheck, Menu, 
  Sparkles, TrendingUp, Mail, ChevronRight, CircleUser, PieChart,
  Bell, Home, RefreshCw, Download, LogOut, ArrowDownRight,
  ArrowUpRight, BarChart2, Zap, Clock, Target, Lightbulb,
  Settings, ChevronsRight, Filter, Share2, Eye, MousePointerClick,
  BellRing, ListFilter, TabletSmartphone, ClipboardCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, parseISO } from "date-fns";

type EnhancedClientDashboardProps = {
  clientId?: string;
};

// Improved dashboard with AI insights, customizable widgets, and interactive analytics
export default function EnhancedClientDashboard({ clientId }: EnhancedClientDashboardProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [engagementView, setEngagementView] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  
  // Get client user info from session storage
  const getClientUser = () => {
    const sessionUser = sessionStorage.getItem('clientUser');
    
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch (error) {
        console.error('Error parsing client user', error);
        return null;
      }
    }
    
    return null;
  };

  const clientUser = getClientUser();

  // Refresh dashboard data
  const refreshDashboard = useCallback(() => {
    setIsRefreshing(true);
    // Simulate API call delay
    setTimeout(() => {
      fetchClientData();
      setIsRefreshing(false);
      toast({
        title: "Dashboard refreshed",
        description: "Latest data has been loaded"
      });
    }, 1200);
  }, [toast]);

  // Fetch client data (campaigns, stats, etc.)
  const fetchClientData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching data for time range:", timeRange);
      
      // In a real app, this would be a fetch call to your API with the time range
      // Simulated API call - this would come from real data in production
      // const response = await fetch(`/api/client-portal/dashboard?timeRange=${timeRange}`);
      // const data = await response.json();

      // Using demo data based on the logged-in client
      setClientData({
        clientName: clientUser?.name || "Client",
        clientCompany: clientUser?.company || "Company Name",
        stats: {
          activeCampaigns: 4,
          totalEmails: 24500,
          totalEmailsSent: 21345,
          openRate: 27.8,
          clickRate: 4.9,
          contactsCount: 6820,
          listsCount: 12,
          bounceRate: 0.8,
          unsubscribeRate: 0.3,
          emailsSentToday: 750,
          templateCount: 18
        },
        campaigns: {
          active: 4,
          draft: 2,
          scheduled: 3,
          completed: 8
        },
        recentCampaigns: [
          { id: 1, name: "Monthly Newsletter", date: "2025-04-12", status: "Completed", opens: 3430, clicks: 458, contactsReached: 12483, openRate: 27.5, clickRate: 3.7 },
          { id: 2, name: "Product Launch", date: "2025-04-08", status: "Active", opens: 2856, clicks: 539, contactsReached: 9865, openRate: 29.0, clickRate: 5.5 },
          { id: 3, name: "Spring Promotion", date: "2025-04-20", status: "Scheduled", opens: 0, clicks: 0, contactsReached: 0, openRate: 0, clickRate: 0 },
          { id: 4, name: "Customer Survey", date: "2025-04-14", status: "Completed", opens: 2112, clicks: 876, contactsReached: 8520, openRate: 24.8, clickRate: 10.3 }
        ],
        performanceData: [
          { date: "2025-04-10", opens: 65, clicks: 12, sends: 315 },
          { date: "2025-04-11", opens: 59, clicks: 10, sends: 245 },
          { date: "2025-04-12", opens: 80, clicks: 15, sends: 342 },
          { date: "2025-04-13", opens: 81, clicks: 16, sends: 290 },
          { date: "2025-04-14", opens: 56, clicks: 8, sends: 210 },
          { date: "2025-04-15", opens: 55, clicks: 7, sends: 180 },
          { date: "2025-04-16", opens: 70, clicks: 14, sends: 240 }
        ],
        deviceData: [
          { name: "Mobile", value: 52 },
          { name: "Desktop", value: 38 },
          { name: "Tablet", value: 10 }
        ],
        locationData: [
          { name: "United States", value: 65 },
          { name: "Europe", value: 18 },
          { name: "Asia", value: 10 },
          { name: "Other", value: 7 }
        ],
        emailClientData: [
          { name: "Gmail", value: 42 },
          { name: "Outlook", value: 20 },
          { name: "Apple Mail", value: 15 },
          { name: "Yahoo", value: 12 },
          { name: "Other", value: 11 }
        ],
        engagementTrends: [
          { name: "Week 1", opens: 22.5, clicks: 3.2 },
          { name: "Week 2", opens: 24.1, clicks: 3.5 },
          { name: "Week 3", opens: 26.3, clicks: 4.1 },
          { name: "Week 4", opens: 27.8, clicks: 4.9 }
        ],
        timeOfDayData: [
          { hour: "12am", opens: 21 },
          { hour: "3am", opens: 15 },
          { hour: "6am", opens: 42 },
          { hour: "9am", opens: 75 },
          { hour: "12pm", opens: 87 },
          { hour: "3pm", opens: 65 },
          { hour: "6pm", opens: 52 },
          { hour: "9pm", opens: 34 }
        ],
        dayOfWeekData: [
          { day: "Sunday", opens: 42, clicks: 8 },
          { day: "Monday", opens: 67, clicks: 15 },
          { day: "Tuesday", opens: 71, clicks: 14 },
          { day: "Wednesday", opens: 80, clicks: 16 },
          { day: "Thursday", opens: 75, clicks: 14 },
          { day: "Friday", opens: 62, clicks: 12 },
          { day: "Saturday", opens: 45, clicks: 9 }
        ],
        contactGrowth: [
          { date: "2025-03-16", total: 6550 },
          { date: "2025-03-23", total: 6590 },
          { date: "2025-03-30", total: 6645 },
          { date: "2025-04-06", total: 6710 },
          { date: "2025-04-13", total: 6760 },
          { date: "2025-04-17", total: 6820 }
        ]
      });

      // Generate AI insights
      setInsights([
        {
          id: 1,
          title: "Open Rate Improving",
          description: "Your email open rate has increased by 2.3% compared to the previous month.",
          icon: <ArrowUpRight className="h-5 w-5 text-green-500" />,
          color: "bg-green-100 text-green-800 border-green-200"
        },
        {
          id: 2,
          title: "Device Usage Shift",
          description: "Mobile opens have increased 5% compared to last month, indicating a shift in your audience's behavior.",
          icon: <TabletSmartphone className="h-5 w-5 text-blue-500" />,
          color: "bg-blue-100 text-blue-800 border-blue-200"
        },
        {
          id: 3,
          title: "Inactive Subscribers",
          description: "850 subscribers haven't opened emails in 60+ days. Consider a re-engagement campaign.",
          icon: <BellRing className="h-5 w-5 text-amber-500" />,
          color: "bg-amber-100 text-amber-800 border-amber-200"
        }
      ]);

      // Generate AI campaign suggestions
      setAiSuggestions([
        {
          id: 1,
          title: "Send at 9am Tuesday",
          description: "Your audience engages most with emails sent mid-morning on Tuesdays.",
          icon: <Clock className="h-5 w-5 text-indigo-500" />
        },
        {
          id: 2,
          title: "Optimize subject lines",
          description: "Questions in subject lines increase your open rates by 15%.",
          icon: <Eye className="h-5 w-5 text-blue-500" />
        },
        {
          id: 3,
          title: "Mobile-friendly templates",
          description: "Over 50% of opens are on mobile. Ensure all templates are optimized.",
          icon: <TabletSmartphone className="h-5 w-5 text-green-500" />
        }
      ]);
    } catch (error) {
      console.error("Error fetching client data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast, clientUser?.name, clientUser?.company]);

  useEffect(() => {
    // If no client user is logged in, redirect to client login
    const currentClientUser = getClientUser();
    if (!currentClientUser) {
      toast({
        title: "Access denied",
        description: "Please log in to access your dashboard",
        variant: "destructive"
      });
      setLocation('/client-login');
      return;
    }

    fetchClientData();
  }, [fetchClientData, setLocation, toast]);

  // For the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleLogout = () => {
    // Clear session storage and localStorage
    sessionStorage.removeItem('clientUser');
    localStorage.removeItem('clientUser');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    
    // Redirect to login page
    setLocation('/client-login');
  };

  // Generate formatted date range for display
  const dateRangeText = useMemo(() => {
    const today = new Date();
    switch (timeRange) {
      case "7d":
        return `${format(subDays(today, 7), 'MMM d')} - ${format(today, 'MMM d, yyyy')}`;
      case "30d":
        return `${format(subDays(today, 30), 'MMM d')} - ${format(today, 'MMM d, yyyy')}`;
      case "90d":
        return `${format(subDays(today, 90), 'MMM d')} - ${format(today, 'MMM d, yyyy')}`;
      default:
        return `${format(subDays(today, 7), 'MMM d')} - ${format(today, 'MMM d, yyyy')}`;
    }
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1929] via-[#112b4a] to-[#1a3a5f]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#d4af37]/30 rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#d4af37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-white/80 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-md border border-blue-200">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-xl text-blue-800">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-slate-600">There was an error loading your dashboard data. Please try again later.</p>
            <Button 
              onClick={handleLogout} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format performance data for charts
  const formattedPerformanceData = clientData.performanceData.map((item: any) => ({
    ...item,
    date: format(parseISO(item.date), 'MMM d')
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto py-4 px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Client Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                Overview of your email campaign performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-medium bg-slate-100 border-slate-200 text-slate-600 py-1 px-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {dateRangeText}
                </Badge>
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-xs border border-slate-200 rounded-md py-1 pl-3 pr-8 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                </select>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="text-slate-700 border-slate-200 hover:bg-slate-100 flex items-center gap-1"
                onClick={refreshDashboard}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Refreshing...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto py-6 px-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="text-sm font-medium text-slate-500">Email Engagement</CardTitle>
              <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                <MailCheck className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-bold text-slate-800">{clientData.stats.openRate}%</div>
                <div className="flex items-center text-green-600 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  <span>2.3%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Average open rate</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Open Rate</span>
                  <span className="font-semibold text-blue-600">{clientData.stats.openRate}%</span>
                </div>
                <Progress value={clientData.stats.openRate} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-600" />
                
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="font-medium text-slate-600">Click Rate</span>
                  <span className="font-semibold text-blue-600">{clientData.stats.clickRate}%</span>
                </div>
                <Progress value={clientData.stats.clickRate * 5} className="h-1.5 bg-blue-100" indicatorClassName="bg-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="text-sm font-medium text-slate-500">Active Campaigns</CardTitle>
              <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-bold text-slate-800">{clientData.campaigns.active}</div>
                <div className="flex items-center text-green-600 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  <span>1</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Currently running campaigns</p>
              
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-slate-100 p-2">
                    <div className="text-xs font-medium text-slate-500">Draft</div>
                    <div className="text-lg font-semibold text-slate-800">{clientData.campaigns.draft}</div>
                  </div>
                  <div className="rounded-md bg-slate-100 p-2">
                    <div className="text-xs font-medium text-slate-500">Scheduled</div>
                    <div className="text-lg font-semibold text-slate-800">{clientData.campaigns.scheduled}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="text-sm font-medium text-slate-500">Audience Growth</CardTitle>
              <div className="h-8 w-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-bold text-slate-800">{clientData.stats.contactsCount.toLocaleString()}</div>
                <div className="flex items-center text-green-600 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  <span>2.1%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Total subscribers</p>
              
              <div className="mt-4 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={clientData.contactGrowth} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="total" stroke="#F59E0B" fillOpacity={1} fill="url(#colorContacts)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-100">
              <CardTitle className="text-sm font-medium text-slate-500">Emails Sent</CardTitle>
              <div className="h-8 w-8 rounded-md bg-violet-500/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-bold text-slate-800">{clientData.stats.totalEmailsSent.toLocaleString()}</div>
                <div className="text-xs text-slate-500 font-medium">
                  total
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">{clientData.stats.emailsSentToday.toLocaleString()} sent today</p>
              
              <div className="mt-4 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedPerformanceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="sends" fill="#8884d8" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* AI Insights Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-blue-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">AI Insights</h2>
            </div>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <div 
                key={insight.id} 
                className={`rounded-lg border p-3 bg-white/80 backdrop-blur-sm ${insight.color}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">{insight.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart - 2/3 width */}
          <Card className="lg:col-span-2 border border-slate-200 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">Email Performance</CardTitle>
                <CardDescription className="text-xs text-slate-500">Daily engagement metrics</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600">
                  <Filter className="h-3 w-3 mr-1" /> Filter
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 text-slate-600">
                  <Download className="h-3 w-3 mr-1" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 12}} 
                      tickLine={false} 
                      axisLine={{stroke: '#E2E8F0'}}
                    />
                    <YAxis 
                      tick={{fontSize: 12}} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: '#FFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="opens" 
                      name="Opens" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorOpens)" 
                      activeDot={{ r: 6 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      name="Clicks" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorClicks)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Demographics & Engagement - 1/3 width */}
          <div className="space-y-6">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800">Audience Breakdown</CardTitle>
                <CardDescription className="text-xs text-slate-500">Where and how people access your emails</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Tabs defaultValue="device">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="device" className="text-xs">Device</TabsTrigger>
                    <TabsTrigger value="location" className="text-xs">Location</TabsTrigger>
                    <TabsTrigger value="client" className="text-xs">Email Client</TabsTrigger>
                  </TabsList>
                  <TabsContent value="device">
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChartsPieChart>
                          <Pie
                            data={clientData.deviceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {clientData.deviceData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </ReChartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex justify-between items-center px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#0088FE]"></div>
                        <span className="text-xs text-slate-600">Mobile ({clientData.deviceData[0].value}%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#00C49F]"></div>
                        <span className="text-xs text-slate-600">Desktop ({clientData.deviceData[1].value}%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#FFBB28]"></div>
                        <span className="text-xs text-slate-600">Tablet ({clientData.deviceData[2].value}%)</span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="location">
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChartsPieChart>
                          <Pie
                            data={clientData.locationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {clientData.locationData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </ReChartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="client">
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChartsPieChart>
                          <Pie
                            data={clientData.emailClientData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {clientData.emailClientData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </ReChartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-800">Campaign Suggestions</CardTitle>
                <CardDescription className="text-xs text-slate-500">AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center bg-white border border-slate-200 shrink-0">
                        {suggestion.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-800">{suggestion.title}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">{suggestion.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <Lightbulb className="h-4 w-4 mr-1" /> Get More Insights
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Engagement Analysis */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Engagement Optimization</CardTitle>
            <CardDescription className="text-xs text-slate-500">Discover when your audience is most active</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Tabs defaultValue="time" className="mt-2">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="time" className="text-xs">Time of Day</TabsTrigger>
                <TabsTrigger value="day" className="text-xs">Day of Week</TabsTrigger>
                <TabsTrigger value="trends" className="text-xs">Engagement Trends</TabsTrigger>
              </TabsList>
              <TabsContent value="time">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientData.timeOfDayData} margin={{top: 5, right: 30, left: 0, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="opens" name="Opens" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-indigo-600" />
                    <p className="text-xs text-indigo-700">
                      <strong>Best times to send:</strong> 9am and 12pm show the highest open rates for your audience
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="day">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientData.dayOfWeekData} margin={{top: 5, right: 30, left: 0, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="opens" name="Opens" fill="#6366F1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clicks" name="Clicks" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-indigo-600" />
                    <p className="text-xs text-indigo-700">
                      <strong>Best days to send:</strong> Tuesday and Wednesday show the highest engagement rates
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="trends">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={clientData.engagementTrends} margin={{top: 5, right: 30, left: 0, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="opens" name="Open Rate %" stroke="#6366F1" activeDot={{r: 8}} />
                      <Line type="monotone" dataKey="clicks" name="Click Rate %" stroke="#10B981" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mt-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <p className="text-xs text-indigo-700">
                      <strong>Trend analysis:</strong> Your engagement rates are steadily increasing over the past month
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Campaigns Table */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">Recent Campaigns</CardTitle>
                <CardDescription className="text-xs text-slate-500">Performance of your latest email campaigns</CardDescription>
              </div>
              <Button variant="link" className="text-blue-600 p-0 h-auto font-medium">
                View all campaigns <ChevronsRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Campaign Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Recipients</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Open Rate</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Click Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.recentCampaigns.map((campaign: any) => {
                    // Status colors
                    const statusColors: {[key: string]: string} = {
                      "Completed": "bg-green-100 text-green-800 border-green-200",
                      "Active": "bg-blue-100 text-blue-800 border-blue-200",
                      "Scheduled": "bg-amber-100 text-amber-800 border-amber-200",
                      "Draft": "bg-slate-100 text-slate-800 border-slate-200",
                    };
                    
                    return (
                      <tr key={campaign.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-sm text-slate-800">{campaign.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`text-xs font-medium ${statusColors[campaign.status]}`}>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(campaign.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {campaign.contactsReached.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-2 bg-slate-100 rounded-full overflow-hidden mr-2">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${campaign.openRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">{campaign.openRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-2 bg-slate-100 rounded-full overflow-hidden mr-2">
                              <div 
                                className="h-full bg-emerald-500" 
                                style={{ width: `${campaign.clickRate * 3}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">{campaign.clickRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-2">
            <div className="w-full flex justify-center">
              <Button variant="link" className="text-sm text-blue-600">
                Load more campaigns
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}