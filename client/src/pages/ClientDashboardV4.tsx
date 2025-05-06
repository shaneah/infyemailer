import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { 
  Menu, BarChart3, Mail, Users, Bell, Settings, LogOut, 
  Calendar, BarChart, PieChart, Search, Zap, Award, Target,
  TrendingUp, Clock, Activity, Layout as LayoutIcon, Lightbulb,
  ArrowRight, ArrowUp, ArrowDown, Shield, Send, Eye, 
  BarChart2, MousePointer, CheckCircle2, Share2, FileText,
  Gauge, RefreshCw, Timer, Smartphone, Filter, Download
} from "lucide-react";
import Database from "@/components/Database";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import ClientSidebar from "@/components/ClientSidebar";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  Legend
} from "recharts";

export default function ClientDashboardV4() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("overview");
  const [dateRange, setDateRange] = useState("Jan 1, 2023 - Mar 31, 2023");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Format numbers with appropriate suffixes
  const formatNumber = (num: number, prefix = "", suffix = "", decimals = 1) => {
    if (num >= 1000000) {
      return prefix + (num / 1000000).toFixed(decimals) + 'M' + suffix;
    } else if (num >= 1000) {
      return prefix + (num / 1000).toFixed(decimals) + 'K' + suffix;
    }
    return prefix + num.toString() + suffix;
  };

  // Format percentage values
  const formatPercent = (num: number, showSign = false) => {
    const sign = showSign && num > 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  // Load client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const sessionResponse = await fetch('/api/client/verify-session');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.verified || !sessionData.user) {
          console.error("Session not verified or user not found");
          setLocation("/client-login");
          return;
        }
        
        const userData = sessionData.user;
        
        // Fetch client campaigns data
        const campaignsResponse = await fetch(`/api/client-campaigns?clientId=${userData.clientId}`);
        const campaignsData = await campaignsResponse.json();
        
        // Fetch client stats
        const statsResponse = await fetch(`/api/client-stats?clientId=${userData.clientId}`);
        const statsData = await statsResponse.json();
        
        const clientDataObj = {
          clientId: userData.clientId,
          clientName: userData.clientName || "Client User",
          clientCompany: userData.clientCompany || "Company",
          clientEmail: userData.email || "client@example.com",
          stats: statsData || {
            contactsCount: 0,
            contactsGrowth: 0,
            listsCount: 0,
            activeCampaigns: 0,
            totalEmails: 0,
            openRate: 0,
            clickRate: 0,
            conversionRate: 0
          },
          campaigns: campaignsData || []
        };

        console.log("Loaded client data:", clientDataObj);
        setClientData(clientDataObj);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again or contact support.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchClientData();
  }, [toast, setLocation]);

  // Mock data for dashboard metrics (based on the Improvado dashboard in the image)
  const mockMetricsData = {
    spend: {
      value: 36.00,
      unit: "M",
      change: 9.17,
      trend: "up",
      sparklineData: [25, 29, 30, 34, 29, 33, 36, 31, 35, 32, 34, 36]
    },
    cpm: {
      value: 405,
      unit: "K",
      change: 1.28,
      trend: "up",
      sparklineData: [340, 350, 370, 360, 380, 390, 385, 395, 400, 405, 402, 405]
    },
    ctr: {
      value: 10.5,
      unit: "%",
      change: 0.08,
      trend: "up",
      sparklineData: [9.8, 9.9, 10.0, 10.2, 10.3, 10.4, 10.3, 10.4, 10.2, 10.3, 10.4, 10.5]
    },
    cpc: {
      value: 4,
      unit: "K",
      change: -18.34,
      trend: "down",
      sparklineData: [5.2, 5.0, 4.8, 4.6, 4.5, 4.3, 4.2, 4.1, 4.0, 4.2, 4.1, 4.0]
    },
    videoViews: {
      value: 93,
      unit: "K",
      change: 93.0,
      trend: "up",
      sparklineData: [70, 75, 80, 78, 85, 90, 89, 91, 93, 92, 94, 93]
    },
    impressions: {
      value: 89.0,
      unit: "K",
      change: 937.0,
      trend: "up",
      sparklineData: [65, 70, 75, 73, 78, 80, 82, 85, 87, 86, 88, 89]
    },
    conversions: {
      value: 791,
      unit: "",
      change: 36.0,
      trend: "up",
      sparklineData: [600, 630, 650, 670, 690, 710, 730, 750, 770, 780, 785, 791]
    },
    conversionRate: {
      value: 9.8,
      unit: "%",
      change: 0.2,
      trend: "up",
      sparklineData: [9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.7, 9.8, 9.8, 9.8]
    }
  };

  // Channel performance data
  const channelPerformanceData = [
    { channel: "Programmatic", impressions: "34.7K", change: "-4.2%", ctr: "10.44%", changePercent: "1.5%" },
    { channel: "Paid Search", impressions: "31.4K", change: "30.7%", ctr: "10.57%", changePercent: "3.1%" },
    { channel: "Paid Social", impressions: "11.4K", change: "-25.6%", ctr: "10.28%", changePercent: "-4.1%" },
    { channel: "Organic", impressions: "11.5K", change: "-8.0%", ctr: "10.6%", changePercent: "-0.4%" }
  ];

  // Data source performance data
  const dataSourcePerformanceData = [
    { source: "Amazon Ad Server (Sizmek Ad Suite)", impressions: "5.8K", change: "2010%", ctr: "10.17%", changePercent: "-10.0%" },
    { source: "StackAdapt", impressions: "4.8K", change: "68.7%", ctr: "10%", changePercent: "-7.3%" },
    { source: "LinkedIn Ads", impressions: "5.8K", change: "-", ctr: "10.09%", changePercent: "-" },
    { source: "Facebook", impressions: "5.7K", change: "92.0%", ctr: "10.82%", changePercent: "14.3%" },
    { source: "Google Display & Video 360", impressions: "4.7K", change: "65.2%", ctr: "10.28%", changePercent: "-5.8%" },
    { source: "Bing Ads (Microsoft Advertising)", impressions: "4.8K", change: "3.7%", ctr: "10.7%", changePercent: "-1.8%" }
  ];

  // Campaign performance data
  const campaignPerformanceData = [
    { campaign: "Business-focused zero tolerance architecture", impressions: "931", change: "-", ctr: "10.42%", changePercent: "-" },
    { campaign: "Persistent 24/7 attitude", impressions: "1K", change: "-", ctr: "9.71%", changePercent: "-" },
    { campaign: "Integrated dedicated contingency", impressions: "950", change: "-", ctr: "9.58%", changePercent: "-" },
    { campaign: "Profound intangible policy", impressions: "978", change: "-", ctr: "8.69%", changePercent: "-" },
    { campaign: "Centralized modular throughput", impressions: "955", change: "-", ctr: "9.42%", changePercent: "-" },
    { campaign: "Automated uniform software", impressions: "952", change: "-", ctr: "10.19%", changePercent: "-" }
  ];

  // Monthly trend chart data
  const monthlyTrendData = [
    {month: 'Jan 2023', programmatic: 4.5, paidSearch: 3.2, paidSocial: 1.2, organic: 0.8},
    {month: 'Feb 2023', programmatic: 5.2, paidSearch: 4.1, paidSocial: 1.5, organic: 0.9},
    {month: 'Mar 2023', programmatic: 4.8, paidSearch: 7.5, paidSocial: 1.3, organic: 1.0},
    {month: 'Apr 2023', programmatic: 5.0, paidSearch: 4.9, paidSocial: 1.6, organic: 1.1},
    {month: 'May 2023', programmatic: 9.5, paidSearch: 5.2, paidSocial: 1.4, organic: 1.2},
    {month: 'Jun 2023', programmatic: 6.8, paidSearch: 4.8, paidSocial: 5.0, organic: 1.1},
    {month: 'Jul 2023', programmatic: 12.5, paidSearch: 3.5, paidSocial: 4.5, organic: 1.2},
    {month: 'Aug 2023', programmatic: 10.2, paidSearch: 3.0, paidSocial: 2.7, organic: 1.1},
    {month: 'Sep 2023', programmatic: 7.5, paidSearch: 7.8, paidSocial: 3.2, organic: 1.0},
    {month: 'Oct 2023', programmatic: 5.5, paidSearch: 4.2, paidSocial: 3.7, organic: 1.1},
    {month: 'Nov 2023', programmatic: 6.4, paidSearch: 7.5, paidSocial: 2.5, organic: 1.3},
    {month: 'Dec 2023', programmatic: 7.0, paidSearch: 4.0, paidSocial: 2.0, organic: 1.5}
  ];

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Handle client logout
  const handleClientLogout = async () => {
    try {
      const response = await fetch('/api/client-logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Clear all storage
        sessionStorage.clear();
        localStorage.clear();
        
        // Redirect to client login page
        window.location.href = '/client-login';
      } else {
        console.error('Logout failed:', response.status);
        toast({
          title: "Logout failed",
          description: "There was an error logging out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-slate-900 border border-slate-800 shadow-lg rounded-sm">
          <p className="text-xs font-medium text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p className="text-xs" key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Sparkline component for metrics cards
  const Sparkline = ({ data, color = "#6366f1", height = 30 }: { data: number[], color?: string, height?: number }) => {
    return (
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.map((value, index) => ({ value, index }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Loading state with animation
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e29] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="relative h-20 w-20 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-600/20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-600/40"></div>
            <div className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-600 animate-pulse"></div>
            </div>
          </div>
          <p className="text-indigo-100 text-sm font-medium">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-[#0e0e29] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 text-slate-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-slate-400 text-sm mb-4">Unable to load dashboard data. Please try again or contact support.</p>
            <Button 
              onClick={handleClientLogout} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0e0e29] text-slate-200">
      {/* Sidebar for navigation */}
      <ClientSidebar isOpen={sidebarOpen} onClose={toggleSidebar} onLogout={handleClientLogout} />
      
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-md bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95"
      >
        <Menu size={24} />
      </button>
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header with filters and date selection */}
        <header className="sticky top-0 z-30 w-full bg-[#0e0e29] border-b border-slate-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800/60"
                  onClick={toggleSidebar}
                >
                  <Menu size={20} />
                </Button>
                
                {/* Filter dropdowns */}
                <div className="flex items-center space-x-2">
                  <div className="relative bg-slate-800/50 rounded-md border border-slate-700 px-3 py-1.5 text-sm">
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-2">Data Source</span>
                      <span className="text-slate-200 font-medium">Original</span>
                    </div>
                  </div>
                  
                  <div className="relative bg-slate-800/50 rounded-md border border-slate-700 px-3 py-1.5 text-sm">
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-2">Campaign</span>
                      <span className="text-slate-200 font-medium">All Campaigns</span>
                    </div>
                  </div>
                  
                  <div className="relative bg-slate-800/50 rounded-md border border-slate-700 px-3 py-1.5 text-sm">
                    <div className="flex items-center">
                      <span className="text-slate-400 mr-2">Ad Set</span>
                      <span className="text-slate-200 font-medium">All Sets</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Date range selector */}
              <div className="relative bg-slate-800/50 rounded-md border border-slate-700 px-3 py-1.5 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-slate-200 font-medium">{dateRange}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4">
          {/* Top metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Spend */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Spend</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">${mockMetricsData.spend.value}M</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> ${mockMetricsData.spend.change}K
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={mockMetricsData.spend.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* CPM */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">CPM</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">${mockMetricsData.cpm.value}K</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> ${mockMetricsData.cpm.change}K
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={mockMetricsData.cpm.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* CTR */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">CTR</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">{mockMetricsData.ctr.value}%</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {mockMetricsData.ctr.change}%
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={mockMetricsData.ctr.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* CPC */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">CPC</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">${mockMetricsData.cpc.value}K</h3>
                      <span className="ml-2 flex items-center text-xs text-red-600">
                        <ArrowDown className="h-3 w-3 mr-0.5" /> ${Math.abs(mockMetricsData.cpc.change)}.34
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={mockMetricsData.cpc.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>
          </div>

          {/* Second row of metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Video Views */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Video Views</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">{mockMetricsData.videoViews.value}K</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {mockMetricsData.videoViews.change}.0
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={mockMetricsData.videoViews.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* Impressions */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Impressions</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">{mockMetricsData.impressions.value}K</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {mockMetricsData.impressions.change}.0
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={mockMetricsData.impressions.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* Conversions */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Conversions</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">{mockMetricsData.conversions.value}</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {mockMetricsData.conversions.change}.0
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={mockMetricsData.conversions.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Conversion Rate</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">{mockMetricsData.conversionRate.value}%</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {mockMetricsData.conversionRate.change}%
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={mockMetricsData.conversionRate.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Channel Performance Table */}
            <Card className="overflow-hidden bg-white border-0 shadow-sm">
              <CardHeader className="pb-0 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center text-white">
                      <BarChart3 className="h-3 w-3" />
                    </div>
                    <CardTitle className="text-base text-slate-800 font-medium">Channel Performance</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                      <BarChart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-slate-500">
                        <th className="pb-2 font-medium">Channel</th>
                        <th className="pb-2 font-medium text-right">Impressions</th>
                        <th className="pb-2 font-medium text-right">% Δ</th>
                        <th className="pb-2 font-medium text-right">CTR</th>
                        <th className="pb-2 font-medium text-right">% Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelPerformanceData.map((item, index) => (
                        <tr key={index} className="border-t border-slate-100 text-sm">
                          <td className="py-2 text-slate-800 font-medium">{item.channel}</td>
                          <td className="py-2 text-right text-slate-700">{item.impressions}</td>
                          <td className="py-2 text-right text-slate-700">{item.change}</td>
                          <td className="py-2 text-right text-slate-700">{item.ctr}</td>
                          <td className="py-2 text-right text-slate-700">{item.changePercent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Data Source Performance Table */}
            <Card className="overflow-hidden bg-white border-0 shadow-sm">
              <CardHeader className="pb-0 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-cyan-600 rounded-full flex items-center justify-center text-white">
                      <Database className="h-3 w-3" />
                    </div>
                    <CardTitle className="text-base text-slate-800 font-medium">Data Source Performance</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                      <BarChart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-slate-500">
                        <th className="pb-2 font-medium">Source</th>
                        <th className="pb-2 font-medium text-right">Impressions</th>
                        <th className="pb-2 font-medium text-right">% Δ</th>
                        <th className="pb-2 font-medium text-right">CTR</th>
                        <th className="pb-2 font-medium text-right">% Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataSourcePerformanceData.map((item, index) => (
                        <tr key={index} className="border-t border-slate-100 text-sm">
                          <td className="py-2 text-slate-800 font-medium">{item.source}</td>
                          <td className="py-2 text-right text-slate-700">{item.impressions}</td>
                          <td className="py-2 text-right text-slate-700">{item.change}</td>
                          <td className="py-2 text-right text-slate-700">{item.ctr}</td>
                          <td className="py-2 text-right text-slate-700">{item.changePercent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Trend Chart */}
          <Card className="overflow-hidden bg-white border-0 shadow-sm mb-5">
            <CardHeader className="pb-0 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-800 font-medium">Channel Performance Trend</CardTitle>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-center items-center h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyTrendData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748b" 
                      fontSize={12}
                      tick={{ dy: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(value) => `${value}M`}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line 
                      name="Programmatic" 
                      type="monotone" 
                      dataKey="programmatic" 
                      stroke="#7c3aed" 
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 4 }}
                    />
                    <Line 
                      name="Paid Search" 
                      type="monotone" 
                      dataKey="paidSearch" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 4 }}
                    />
                    <Line 
                      name="Paid Social" 
                      type="monotone" 
                      dataKey="paidSocial" 
                      stroke="#0ea5e9" 
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 4 }}
                    />
                    <Line 
                      name="Organic" 
                      type="monotone" 
                      dataKey="organic" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 4 }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="left"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ paddingLeft: 10 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Performance Table */}
          <Card className="overflow-hidden bg-white border-0 shadow-sm mb-5">
            <CardHeader className="pb-0 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                    <Mail className="h-3 w-3" />
                  </div>
                  <CardTitle className="text-base text-slate-800 font-medium">Campaign Performance</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-slate-700">
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-slate-500">
                      <th className="pb-2 font-medium">Campaign</th>
                      <th className="pb-2 font-medium text-right">Impressions</th>
                      <th className="pb-2 font-medium text-right">% Δ</th>
                      <th className="pb-2 font-medium text-right">CTR</th>
                      <th className="pb-2 font-medium text-right">% Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignPerformanceData.map((item, index) => (
                      <tr key={index} className="border-t border-slate-100 text-sm">
                        <td className="py-2 text-slate-800 font-medium">{item.campaign}</td>
                        <td className="py-2 text-right text-slate-700">{item.impressions}</td>
                        <td className="py-2 text-right text-slate-700">{item.change}</td>
                        <td className="py-2 text-right text-slate-700">{item.ctr}</td>
                        <td className="py-2 text-right text-slate-700">{item.changePercent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}