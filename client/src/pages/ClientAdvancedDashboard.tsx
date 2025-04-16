import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, formatISO } from "date-fns";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3, 
  Users, 
  Mail, 
  Globe, 
  Calendar, 
  Zap,
  Activity,
  MousePointerClick,
  Clock,
  Inbox,
  BarChart4,
  ArrowRight,
  Filter,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Types
interface CampaignData {
  id: number;
  name: string;
  subtitle: string;
  icon: {
    name: string;
    color: string;
  };
  status: {
    label: string;
    color: string;
  };
  recipients: number;
  openRate: number;
  clickRate: number;
  date: string;
}

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeText: string;
  icon: React.ElementType;
  color: string;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  time: string;
  description: string;
}

// Demo data
const CAMPAIGNS_DATA: CampaignData[] = [
  {
    id: 1,
    name: "Monthly Newsletter",
    subtitle: "May 2023",
    icon: { name: "envelope-fill", color: "primary" },
    status: { label: "Sent", color: "success" },
    recipients: 12483,
    openRate: 46.2,
    clickRate: 21.8,
    date: "May 15, 2023"
  },
  {
    id: 2,
    name: "Product Launch",
    subtitle: "ProMax X1",
    icon: { name: "megaphone-fill", color: "danger" },
    status: { label: "Sent", color: "success" },
    recipients: 24192,
    openRate: 58.7,
    clickRate: 32.4,
    date: "May 8, 2023"
  },
  {
    id: 3,
    name: "Spring Sale",
    subtitle: "25% Discount",
    icon: { name: "tag-fill", color: "warning" },
    status: { label: "Scheduled", color: "warning" },
    recipients: 18743,
    openRate: 0,
    clickRate: 0,
    date: "May 20, 2023"
  },
  {
    id: 4,
    name: "Welcome Series",
    subtitle: "Automation",
    icon: { name: "envelope-fill", color: "info" },
    status: { label: "Active", color: "primary" },
    recipients: 3891,
    openRate: 52.1,
    clickRate: 27.5,
    date: "Ongoing"
  }
];

// Demo data for charts
const generateLineChartData = () => {
  const today = new Date();
  const startDay = startOfWeek(today);
  const endDay = endOfWeek(today);
  
  const days = eachDayOfInterval({ start: startDay, end: endDay });
  
  return days.map((day, index) => {
    // Generate random values that increase overall
    const opens = 20 + Math.floor(Math.random() * 10) + (index * 5);
    const clicks = 5 + Math.floor(Math.random() * 8) + (index * 3);
    
    return {
      date: format(day, 'EEE'),
      opens: opens,
      clicks: clicks,
    };
  });
};

const generateDeviceData = () => [
  { name: 'Desktop', value: 42, color: '#2563eb' },
  { name: 'Mobile', value: 48, color: '#0891b2' },
  { name: 'Tablet', value: 10, color: '#8b5cf6' }
];

const generateEmailClientData = () => [
  { name: 'Gmail', value: 35, color: '#e11d48' },
  { name: 'Outlook', value: 25, color: '#0891b2' },
  { name: 'Apple Mail', value: 18, color: '#8b5cf6' },
  { name: 'Yahoo Mail', value: 12, color: '#4f46e5' },
  { name: 'Other', value: 10, color: '#a1a1aa' }
];

const generatePeriodData = () => {
  const data = [];
  for (let i = 0; i < 12; i++) {
    const month = subDays(new Date(), i * 30);
    
    data.push({
      month: format(month, 'MMM'),
      delivered: 12000 - i * 500 + Math.floor(Math.random() * 800),
      opens: 6500 - i * 300 + Math.floor(Math.random() * 400),
      clicks: 2800 - i * 150 + Math.floor(Math.random() * 200),
    });
  }
  return data.reverse();
};

const generateHourlyData = () => {
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    data.push({
      hour: hour,
      opens: 10 + Math.floor(Math.random() * 90),
      label: `${hour}:00`
    });
  }
  return data;
};

const getEngagementScore = (campaigns: CampaignData[]) => {
  if (!campaigns.length) return 0;
  
  const totalOpenRate = campaigns.reduce((sum, campaign) => sum + campaign.openRate, 0);
  const totalClickRate = campaigns.reduce((sum, campaign) => sum + campaign.clickRate, 0);
  
  // Weight open rate at 40% and click rate at 60%
  return Math.round(((totalOpenRate / campaigns.length) * 0.4) + ((totalClickRate / campaigns.length) * 0.6));
};

const ClientAdvancedDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("7days");
  
  // Demo data
  const lineChartData = generateLineChartData();
  const deviceData = generateDeviceData();
  const emailClientData = generateEmailClientData();
  const periodData = generatePeriodData();
  const hourlyData = generateHourlyData();
  const campaigns = CAMPAIGNS_DATA;
  
  // For demo purposes - we'd fetch real data here
  const { data: statsData } = useQuery({
    queryKey: ['/api/stats'],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Calculate demo stats
  const totalRecipients = campaigns.reduce((sum, campaign) => sum + campaign.recipients, 0);
  const averageOpenRate = campaigns.reduce((sum, campaign) => sum + campaign.openRate, 0) / campaigns.length;
  const averageClickRate = campaigns.reduce((sum, campaign) => sum + campaign.clickRate, 0) / campaigns.length;
  const engagementScore = getEngagementScore(campaigns);
  
  // Stats for the dashboard
  const stats: StatCard[] = [
    {
      title: "Subscribers",
      value: statsData?.[0]?.value || "24,518",
      change: 12.3,
      changeText: "from last month",
      icon: Users,
      color: "blue"
    },
    {
      title: "Email Deliverability",
      value: "98.7%",
      change: 3.2,
      changeText: "from last month",
      icon: Mail,
      color: "green"
    },
    {
      title: "Avg Open Rate",
      value: `${averageOpenRate.toFixed(1)}%`,
      change: 5.1,
      changeText: "from last month",
      icon: Inbox,
      color: "amber"
    },
    {
      title: "Avg Click Rate",
      value: `${averageClickRate.toFixed(1)}%`,
      change: -2.4,
      changeText: "from last month",
      icon: MousePointerClick,
      color: "rose"
    }
  ];
  
  // Recent activity - demo data
  const recentActivity: RecentActivity[] = [
    {
      id: 1,
      type: "campaign",
      title: "Monthly Newsletter",
      time: "2 hours ago",
      description: "Campaign sent to 12,483 recipients"
    },
    {
      id: 2,
      type: "subscriber",
      title: "New Subscribers",
      time: "3 hours ago",
      description: "237 new subscribers added to your lists"
    },
    {
      id: 3,
      type: "domain",
      title: "Domain Verification",
      time: "5 hours ago",
      description: "yourdomain.com DKIM verification completed"
    },
    {
      id: 4,
      type: "analytics",
      title: "Analytics Update",
      time: "8 hours ago",
      description: "Weekly performance report is now available"
    }
  ];
  
  const getIconForActivity = (type: string) => {
    switch (type) {
      case "campaign": return <Mail size={16} className="text-blue-500" />;
      case "subscriber": return <Users size={16} className="text-emerald-500" />;
      case "domain": return <Globe size={16} className="text-purple-500" />;
      case "analytics": return <BarChart3 size={16} className="text-amber-500" />;
      default: return <Calendar size={16} className="text-gray-500" />;
    }
  };
  
  const COLORS = ['#2563eb', '#0891b2', '#8b5cf6', '#4f46e5', '#a1a1aa'];
  
  return (
    <div className="bg-white min-h-screen">
      <main className="px-4 py-5 sm:px-6 lg:px-8">
        {/* Dashboard header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Advanced Analytics Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Comprehensive view of your email marketing performance
            </p>
          </div>
          
          <div className="flex gap-3 mt-3 sm:mt-0">
            <Select defaultValue={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[160px] text-sm bg-white">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="gap-1 text-sm">
              <Filter size={14} /> Filter
            </Button>
            
            <Button variant="outline" size="sm" className="gap-1 text-sm">
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold mt-1">{stat.value}</CardTitle>
                  </div>
                  <div className={`rounded-full p-2 bg-${stat.color}-50`}>
                    <stat.icon size={20} className={`text-${stat.color}-500`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3">
                <div className="flex items-center">
                  {stat.change > 0 ? (
                    <span className="flex items-center text-emerald-600 text-xs font-medium">
                      <ArrowUpRight size={14} className="mr-1" /> +{stat.change}%
                    </span>
                  ) : (
                    <span className="flex items-center text-rose-600 text-xs font-medium">
                      <ArrowDownRight size={14} className="mr-1" /> {stat.change}%
                    </span>
                  )}
                  <span className="ml-2 text-xs text-slate-500">{stat.changeText}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Dashboard tabs */}
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 w-full justify-start space-x-6">
              <TabsTrigger 
                value="overview" 
                className="py-2.5 px-0.5 text-sm font-medium data-[state=active]:border-b-2 border-blue-600 data-[state=active]:shadow-none rounded-none data-[state=active]:text-blue-700 data-[state=active]:font-semibold"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="trends" 
                className="py-2.5 px-0.5 text-sm font-medium data-[state=active]:border-b-2 border-blue-600 data-[state=active]:shadow-none rounded-none data-[state=active]:text-blue-700 data-[state=active]:font-semibold"
              >
                Trends
              </TabsTrigger>
              <TabsTrigger 
                value="audience" 
                className="py-2.5 px-0.5 text-sm font-medium data-[state=active]:border-b-2 border-blue-600 data-[state=active]:shadow-none rounded-none data-[state=active]:text-blue-700 data-[state=active]:font-semibold"
              >
                Audience
              </TabsTrigger>
              <TabsTrigger 
                value="behavior" 
                className="py-2.5 px-0.5 text-sm font-medium data-[state=active]:border-b-2 border-blue-600 data-[state=active]:shadow-none rounded-none data-[state=active]:text-blue-700 data-[state=active]:font-semibold"
              >
                Behavior
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Overview tab */}
          <TabsContent value="overview" className="space-y-5">
            {/* Performance overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="col-span-2 border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">Engagement Metrics</CardTitle>
                      <CardDescription>Opens, clicks, and overall engagement</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                        Daily
                      </Button>
                      <Button variant="default" size="sm" className="h-8 px-2 text-xs bg-blue-600">
                        Weekly
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                        Monthly
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={lineChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => `${value}`}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0' }}
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="opens"
                          name="Opens"
                          stroke="#2563eb"
                          strokeWidth={2}
                          fill="url(#colorOpens)"
                          activeDot={{ r: 6 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="clicks"
                          name="Clicks"
                          stroke="#0891b2"
                          strokeWidth={2}
                          fill="url(#colorClicks)"
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex flex-col gap-5">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base font-medium">Engagement Score</CardTitle>
                    <CardDescription>Based on open and click-through rates</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center my-4">
                      <div className="absolute text-3xl font-bold">{engagementScore}</div>
                      <svg 
                        viewBox="0 0 100 100" 
                        width="160" 
                        height="160" 
                        className="transform -rotate-90"
                      >
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke="#f1f5f9" 
                          strokeWidth="8" 
                        />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="none" 
                          stroke={engagementScore > 60 ? "#16a34a" : engagementScore > 30 ? "#e6b302" : "#dc2626"}
                          strokeWidth="8" 
                          strokeDasharray={`${(engagementScore/100) * 251.2} 251.2`}
                        />
                      </svg>
                    </div>
                    <div className="w-full grid grid-cols-3 gap-2 mt-3">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">Poor</span>
                        <span className="bg-red-500 h-1.5 w-6 mt-1 rounded-full"></span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">Average</span>
                        <span className="bg-amber-400 h-1.5 w-6 mt-1 rounded-full"></span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500">Great</span>
                        <span className="bg-green-500 h-1.5 w-6 mt-1 rounded-full"></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base font-medium">Device Breakdown</CardTitle>
                    <CardDescription>User device distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="h-[150px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deviceData}
                            nameKey="name"
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={2}
                          >
                            {deviceData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              borderColor: '#e2e8f0' 
                            }}
                            formatter={(value) => [`${value}%`, 'Usage']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {deviceData.map((device, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <span className="text-xs text-slate-500">{device.name}</span>
                          <span 
                            className="h-1.5 w-6 mt-1 rounded-full" 
                            style={{ backgroundColor: device.color }}
                          ></span>
                          <span className="text-xs font-medium mt-1">{device.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Recent campaigns and activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="col-span-2 border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">Recent Campaigns</CardTitle>
                      <CardDescription>Performance of your latest email campaigns</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-600">
                      View all <ArrowRight size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div key={campaign.id} className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                          <Mail size={18} />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex flex-wrap justify-between gap-2">
                            <div>
                              <div className="font-medium text-sm">{campaign.name}</div>
                              <div className="text-xs text-slate-500">{campaign.date}</div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`rounded-full px-2 py-0 text-xs ${
                                campaign.status.color === 'success' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : campaign.status.color === 'warning'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {campaign.status.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div>
                              <div className="text-xs text-slate-500">Recipients</div>
                              <div className="text-sm font-medium">
                                {campaign.recipients.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Open Rate</div>
                              <div className="text-sm font-medium">
                                {campaign.openRate}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Click Rate</div>
                              <div className="text-sm font-medium">
                                {campaign.clickRate}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                      <CardDescription>Latest events and updates</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-600">
                      View all <ArrowRight size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {recentActivity.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex">
                        <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          {getIconForActivity(activity.type)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-sm">{activity.title}</div>
                          <div className="text-xs text-slate-500">{activity.description}</div>
                          <div className="text-xs text-slate-400 mt-1">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Trends tab */}
          <TabsContent value="trends" className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-3 border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">Email Performance Trends</CardTitle>
                      <CardDescription>Delivered, opens and clicks over time</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="monthly">
                        <SelectTrigger className="h-8 w-[130px] text-xs bg-white">
                          <SelectValue placeholder="Time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={periodData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => `${value / 1000}k`}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip
                          contentStyle={{ 
                            borderRadius: '8px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderColor: '#e2e8f0' 
                          }}
                          formatter={(value) => [value.toLocaleString(), '']}
                        />
                        <Legend />
                        <Bar 
                          dataKey="delivered" 
                          name="Delivered" 
                          fill="#93c5fd" 
                          radius={[4, 4, 0, 0]} 
                          barSize={20} 
                        />
                        <Bar 
                          dataKey="opens" 
                          name="Opens" 
                          fill="#2563eb" 
                          radius={[4, 4, 0, 0]} 
                          barSize={20} 
                        />
                        <Bar 
                          dataKey="clicks" 
                          name="Clicks" 
                          fill="#1d4ed8" 
                          radius={[4, 4, 0, 0]} 
                          barSize={20} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-base font-medium">Hourly Engagement</CardTitle>
                  <CardDescription>Opens by hour of day (24-hour format)</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={hourlyData}
                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="label" 
                          axisLine={{ stroke: '#e2e8f0' }} 
                          tickLine={false}
                          ticks={[0, 4, 8, 12, 16, 20, 23].map(h => `${h}:00`)}
                        />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip
                          contentStyle={{ 
                            borderRadius: '8px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderColor: '#e2e8f0' 
                          }}
                          formatter={(value, name) => [value, 'Opens']}
                          labelFormatter={(value) => `${value} hours`}
                        />
                        <Bar 
                          dataKey="opens" 
                          fill="#2563eb" 
                          radius={[4, 4, 0, 0]} 
                          barSize={10} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 text-center">
                    Most emails are opened between 8:00 and 11:00, with a second peak around 15:00-16:00.
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-base font-medium">Email Client Usage</CardTitle>
                  <CardDescription>Distribution of email clients used by recipients</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={emailClientData}
                          nameKey="name"
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          label={({ name, value }) => `${name}: ${value}%`}
                          labelLine={{ stroke: '#64748b', strokeWidth: 0.5 }}
                        >
                          {emailClientData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderColor: '#e2e8f0' 
                          }}
                          formatter={(value) => [`${value}%`, 'Usage']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {emailClientData.map((client, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <span 
                          className="h-2 w-12 rounded-full" 
                          style={{ backgroundColor: client.color }}
                        ></span>
                        <span className="text-xs mt-1">{client.name}</span>
                        <span className="text-xs font-medium">{client.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Audience tab */}
          <TabsContent value="audience" className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="col-span-2 border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">Subscriber Growth</CardTitle>
                      <CardDescription>Net new subscribers over time</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="monthly">
                        <SelectTrigger className="h-8 w-[130px] text-xs bg-white">
                          <SelectValue placeholder="Time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={periodData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => `${value / 1000}k`}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0' }}
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="delivered"
                          name="Subscribers"
                          stroke="#0284c7"
                          strokeWidth={2}
                          fill="url(#colorGrowth)"
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-base font-medium">Audience Overview</CardTitle>
                  <CardDescription>Key metrics about your subscribers</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Active subscribers</span>
                        <span className="text-sm font-medium">23,518</span>
                      </div>
                      <Progress value={92} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                      <div className="mt-1 text-xs text-slate-500">92% of total</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">New this month</span>
                        <span className="text-sm font-medium">1,248</span>
                      </div>
                      <Progress value={12} className="h-2 bg-slate-100" indicatorClassName="bg-emerald-600" />
                      <div className="mt-1 text-xs text-slate-500">+12% growth rate</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Unsubscribed</span>
                        <span className="text-sm font-medium">218</span>
                      </div>
                      <Progress value={2} className="h-2 bg-slate-100" indicatorClassName="bg-red-500" />
                      <div className="mt-1 text-xs text-slate-500">2% churn rate</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Engagement rate</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2 bg-slate-100" indicatorClassName="bg-amber-500" />
                      <div className="mt-1 text-xs text-slate-500">Based on opens and clicks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Top Subscribers</CardTitle>
                    <CardDescription>Most engaged members of your audience</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-600">
                    View all <ArrowRight size={14} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className="flex items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <Avatar className="h-10 w-10 shadow-sm">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {["JD", "AR", "TK", "MC", "LS", "BW"][index - 1]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-sm">
                          {["John Doe", "Alice Ray", "Thomas King", "Mia Chen", "Leo Smith", "Beth Wilson"][index - 1]}
                        </div>
                        <div className="text-xs text-slate-500">
                          {["john@example.com", "alice@example.com", "thomas@example.com", "mia@example.com", "leo@example.com", "beth@example.com"][index - 1]}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {[98, 96, 95, 93, 90, 88][index - 1]}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Behavior tab */}
          <TabsContent value="behavior" className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-base font-medium">Click Behavior</CardTitle>
                      <CardDescription>Most clicked links and content areas</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select defaultValue="last7">
                        <SelectTrigger className="h-8 w-[130px] text-xs bg-white">
                          <SelectValue placeholder="Time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last7">Last 7 days</SelectItem>
                          <SelectItem value="last30">Last 30 days</SelectItem>
                          <SelectItem value="last90">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium">Main CTA button</div>
                        <div className="text-sm font-bold">68%</div>
                      </div>
                      <Progress value={68} className="h-3 bg-slate-100" indicatorClassName="bg-blue-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium">Product link</div>
                        <div className="text-sm font-bold">42%</div>
                      </div>
                      <Progress value={42} className="h-3 bg-slate-100" indicatorClassName="bg-blue-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium">Social media icons</div>
                        <div className="text-sm font-bold">29%</div>
                      </div>
                      <Progress value={29} className="h-3 bg-slate-100" indicatorClassName="bg-blue-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium">Header logo</div>
                        <div className="text-sm font-bold">24%</div>
                      </div>
                      <Progress value={24} className="h-3 bg-slate-100" indicatorClassName="bg-blue-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium">Secondary links</div>
                        <div className="text-sm font-bold">18%</div>
                      </div>
                      <Progress value={18} className="h-3 bg-slate-100" indicatorClassName="bg-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-base font-medium">Open Timing</CardTitle>
                  <CardDescription>When recipients open your emails</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">Within 1 hour</span>
                        <span className="text-sm font-medium">62%</span>
                      </div>
                      <Progress value={62} className="h-2 bg-slate-100" indicatorClassName="bg-green-600" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">1-4 hours</span>
                        <span className="text-sm font-medium">24%</span>
                      </div>
                      <Progress value={24} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">4-24 hours</span>
                        <span className="text-sm font-medium">11%</span>
                      </div>
                      <Progress value={11} className="h-2 bg-slate-100" indicatorClassName="bg-amber-500" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600">After 24 hours</span>
                        <span className="text-sm font-medium">3%</span>
                      </div>
                      <Progress value={3} className="h-2 bg-slate-100" indicatorClassName="bg-slate-400" />
                    </div>
                    
                    <div className="pt-3 text-xs text-slate-500 border-t border-slate-100">
                      <div className="font-medium mb-1">Key insight:</div>
                      <p>Most of your audience engages with emails within the first hour of delivery. Consider timing your campaigns to reach recipients during their most active hours.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Content Engagement</CardTitle>
                    <CardDescription>How subscribers interact with different content types</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                      By Campaign <ChevronDown size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">87%</div>
                      <div className="text-sm text-slate-500">Image Engagement</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Product images</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-1.5 bg-slate-100" indicatorClassName="bg-blue-600" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Header images</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-1.5 bg-slate-100" indicatorClassName="bg-blue-600" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Banners</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-1.5 bg-slate-100" indicatorClassName="bg-blue-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">74%</div>
                      <div className="text-sm text-slate-500">Text Content</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Headlines</span>
                        <span className="font-medium">89%</span>
                      </div>
                      <Progress value={89} className="h-1.5 bg-slate-100" indicatorClassName="bg-amber-500" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Product descriptions</span>
                        <span className="font-medium">76%</span>
                      </div>
                      <Progress value={76} className="h-1.5 bg-slate-100" indicatorClassName="bg-amber-500" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Footer info</span>
                        <span className="font-medium">42%</span>
                      </div>
                      <Progress value={42} className="h-1.5 bg-slate-100" indicatorClassName="bg-amber-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">68%</div>
                      <div className="text-sm text-slate-500">Interactive Elements</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CTA buttons</span>
                        <span className="font-medium">93%</span>
                      </div>
                      <Progress value={93} className="h-1.5 bg-slate-100" indicatorClassName="bg-green-600" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Product links</span>
                        <span className="font-medium">81%</span>
                      </div>
                      <Progress value={81} className="h-1.5 bg-slate-100" indicatorClassName="bg-green-600" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Social icons</span>
                        <span className="font-medium">62%</span>
                      </div>
                      <Progress value={62} className="h-1.5 bg-slate-100" indicatorClassName="bg-green-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientAdvancedDashboard;