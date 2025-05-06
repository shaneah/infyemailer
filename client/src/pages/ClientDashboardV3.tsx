import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { 
  Menu, BarChart3, Mail, Users, Bell, Settings, LogOut, 
  Calendar, BarChart, PieChart, UserPlus, Zap, Award, Target,
  TrendingUp, Clock, Activity, Layout as LayoutIcon, Lightbulb, 
  ArrowRight, ArrowUp, ArrowDown, Shield, Send, Eye, 
  BarChart2, MousePointer, CheckCircle2, Share2, FileText,
  Gauge, RefreshCw, Timer, Smartphone
} from "lucide-react";
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
  Cell
} from 'recharts';

export default function ClientDashboardV3() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("overview");
  const [currentTheme, setCurrentTheme] = useState<string>("navy");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Professional Theme options
  const themes = {
    blue: {
      primary: "from-blue-700 to-blue-600",
      gradient: "from-blue-900 to-blue-800",
      accentGradient: "from-blue-700 to-blue-600",
      accent: "bg-blue-700",
      accentHover: "hover:bg-blue-800",
      accentLight: "bg-blue-600/10",
      accentBorder: "border-blue-600/30",
      textAccent: "text-blue-600",
      progressFill: "bg-blue-600",
      chartColors: ["#2563EB", "#1D4ED8", "#3B82F6", "#60A5FA", "#93C5FD"]
    },
    navy: {
      primary: "from-indigo-900 to-blue-900",
      gradient: "from-indigo-950 to-blue-950",
      accentGradient: "from-indigo-800 to-blue-800",
      accent: "bg-indigo-900",
      accentHover: "hover:bg-indigo-950",
      accentLight: "bg-indigo-900/10",
      accentBorder: "border-indigo-900/30",
      textAccent: "text-indigo-600",
      progressFill: "bg-indigo-600",
      chartColors: ["#312E81", "#3730A3", "#4338CA", "#4F46E5", "#6366F1"]
    },
    gray: {
      primary: "from-gray-700 to-gray-600",
      gradient: "from-gray-900 to-gray-800",
      accentGradient: "from-gray-600 to-gray-500",
      accent: "bg-gray-700",
      accentHover: "hover:bg-gray-800",
      accentLight: "bg-gray-600/10",
      accentBorder: "border-gray-600/30",
      textAccent: "text-gray-200",
      progressFill: "bg-gray-500",
      chartColors: ["#4B5563", "#6B7280", "#9CA3AF", "#D1D5DB", "#E5E7EB"]
    },
    slate: {
      primary: "from-slate-700 to-slate-600",
      gradient: "from-slate-900 to-slate-800",
      accentGradient: "from-slate-600 to-slate-500",
      accent: "bg-slate-700",
      accentHover: "hover:bg-slate-800",
      accentLight: "bg-slate-600/10",
      accentBorder: "border-slate-600/30",
      textAccent: "text-slate-300",
      progressFill: "bg-slate-500",
      chartColors: ["#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1"]
    }
  };

  // Active theme
  const theme = themes[currentTheme as keyof typeof themes];

  // Helper function to format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
    // Persist theme preference if needed
    // localStorage.setItem('dashboard-theme', newTheme);
  };

  // Handle logout
  const handleLogout = () => {
    // Implement logout logic here
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    // Redirect to login page
    setLocation("/login");
  };

  // Helper function to get trend indicator icon
  const getTrendIndicator = (value: number) => {
    if (value > 0) {
      return <ArrowUp className="h-3 w-3 text-green-500" />;
    } else if (value < 0) {
      return <ArrowDown className="h-3 w-3 text-red-500" />;
    }
    return <div className="h-3 w-3" />;
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: "bg-green-500/10 text-green-400 border border-green-500/20",
      draft: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
      sent: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      scheduled: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      paused: "bg-orange-500/10 text-orange-400 border border-orange-500/20"
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status.toLowerCase()] || "bg-gray-500/10 text-gray-400"}`}>
        {status}
      </span>
    );
  };

  // Sample chart tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
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

  // Weekly stats
  const weeklyStats = {
    emailsSent: 850,
    openRate: 29.1,
    clickRate: 4.2
  };

  // Engagement over time
  const engagementOverTimeData = [
    { month: 'Jan', open: 22.5, click: 3.2, conversion: 0.6 },
    { month: 'Feb', open: 23.1, click: 3.5, conversion: 0.7 },
    { month: 'Mar', open: 24.8, click: 3.4, conversion: 0.6 },
    { month: 'Apr', open: 28.3, click: 3.7, conversion: 0.8 },
    { month: 'May', open: 26.2, click: 4.1, conversion: 0.9 },
    { month: 'Jun', open: 27.5, click: 4.3, conversion: 1.0 }
  ];

  // Device breakdown
  const deviceBreakdownData = [
    { name: 'Mobile', value: 62 },
    { name: 'Desktop', value: 28 },
    { name: 'Tablet', value: 10 }
  ];

  // Performance metrics
  const avgOpenRateLast30Days = 28.3;
  const avgClickRateLast30Days = 3.7;
  const avgConversionRateLast30Days = 0.8;
  const openRateChange = 2.6;
  const clickRateChange = 0.4;
  const conversionRateChange = 0.2;

  // AI optimization recommendations
  const bestDay = "Tuesday";
  const bestTime = "10:00 AM";

  // Loading state with fancy animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32 mb-8">
            {/* Concentric animated circles */}
            <div className="absolute inset-0 rounded-full border border-indigo-800/30"></div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-700/40"></div>
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-800 to-blue-700"></div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-indigo-600"
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
          <p className="mt-8 text-white text-lg font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden bg-gray-800 text-white">
          <div className={`h-2 bg-gradient-to-r ${theme.accentGradient}`}></div>
          <CardHeader>
            <CardTitle className="text-xl text-white">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-300">There was an error loading your dashboard data. Please try again later.</p>
            <Button 
              onClick={handleLogout} 
              className={`mt-6 ${theme.accent} ${theme.accentHover} text-white w-full`}
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Toggle sidebar for mobile
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

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Sidebar for navigation */}
      <ClientSidebar isOpen={sidebarOpen} onClose={toggleSidebar} onLogout={handleClientLogout} />
      
      {/* Mobile menu button - visible on mobile only */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-r from-indigo-900 to-blue-900 text-white shadow-lg transition-all duration-150 hover:shadow-xl active:scale-95"
      >
        <Menu size={24} className="transition-all duration-200 animate-in fade-in" />
      </button>
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Theme Selector (Floating top-right corner) */}
        <div className="fixed top-4 right-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg z-40 p-2 flex space-x-2 shadow-xl">
          <button 
            onClick={() => setCurrentTheme("navy")} 
            className={`h-7 w-7 rounded-md bg-gradient-to-r from-indigo-900 to-blue-900 flex items-center justify-center ${currentTheme === "navy" ? "ring-2 ring-indigo-400 ring-offset-1 ring-offset-gray-800" : "opacity-70"}`} 
          >
            {currentTheme === "navy" && <CheckCircle2 className="h-4 w-4 text-white" />}
          </button>
          <button 
            onClick={() => setCurrentTheme("blue")} 
            className={`h-7 w-7 rounded-md bg-gradient-to-r from-blue-700 to-blue-600 flex items-center justify-center ${currentTheme === "blue" ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-800" : "opacity-70"}`} 
          >
            {currentTheme === "blue" && <CheckCircle2 className="h-4 w-4 text-white" />}
          </button>
          <button 
            onClick={() => setCurrentTheme("gray")} 
            className={`h-7 w-7 rounded-md bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center ${currentTheme === "gray" ? "ring-2 ring-gray-400 ring-offset-1 ring-offset-gray-800" : "opacity-70"}`} 
          >
            {currentTheme === "gray" && <CheckCircle2 className="h-4 w-4 text-white" />}
          </button>
          <button 
            onClick={() => setCurrentTheme("slate")} 
            className={`h-7 w-7 rounded-md bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-center ${currentTheme === "slate" ? "ring-2 ring-slate-400 ring-offset-1 ring-offset-gray-800" : "opacity-70"}`} 
          >
            {currentTheme === "slate" && <CheckCircle2 className="h-4 w-4 text-white" />}
          </button>
        </div>

        {/* Professional header with subtle accent and clean design */}
        <header className="relative border-b border-gray-800 bg-gray-900/70 shadow-md">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-800 to-transparent opacity-30"></div>
          
          <div className="container mx-auto px-4 py-5 lg:py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="mr-3 lg:hidden text-gray-400 hover:text-white hover:bg-gray-800/60"
                  onClick={toggleSidebar}
                >
                  <Menu size={20} />
                </Button>
                
                <div className="relative">
                  {/* Subtle accent element */}
                  <div className="absolute -left-2 -top-2 w-12 h-12 rounded-full bg-indigo-900/10 blur-xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-baseline">
                      <h1 className="text-2xl md:text-3xl font-bold text-white">
                        Welcome, {clientData.clientName}
                      </h1>
                      <span className="ml-3 px-3 py-1 text-xs font-medium rounded-md border border-gray-700 bg-gray-800/60 text-gray-300">
                        {clientData.clientCompany}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base mt-1">
                      Your campaign performance dashboard 
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/60" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  <span>Alerts</span>
                </Button>
                
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/60" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </Button>
                
                <Button 
                  variant="default" 
                  className={`${theme.accent} ${theme.accentHover} text-white`}
                  size="sm"
                  onClick={handleClientLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Dashboard Tabs */}
          <div className="mb-8">
            <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-gray-800/40 backdrop-blur-sm p-1 rounded-xl border border-gray-700/50 max-w-xl mx-auto">
                <TabsTrigger 
                  value="overview" 
                  className={`data-[state=active]:bg-gradient-to-r data-[state=active]:${theme.accentGradient} data-[state=active]:text-white rounded-lg text-sm h-10 hover:text-white`}
                >
                  <LayoutIcon className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="campaigns" 
                  className={`data-[state=active]:bg-gradient-to-r data-[state=active]:${theme.accentGradient} data-[state=active]:text-white rounded-lg text-sm h-10 hover:text-white`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Campaigns
                </TabsTrigger>
                <TabsTrigger 
                  value="performance" 
                  className={`data-[state=active]:bg-gradient-to-r data-[state=active]:${theme.accentGradient} data-[state=active]:text-white rounded-lg text-sm h-10 hover:text-white`}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger 
                  value="audience" 
                  className={`data-[state=active]:bg-gradient-to-r data-[state=active]:${theme.accentGradient} data-[state=active]:text-white rounded-lg text-sm h-10 hover:text-white`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Audience
                </TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                    {/* Glowing top border */}
                    <div className={`h-1 bg-gradient-to-r ${theme.accentGradient}`}></div>
                    <CardHeader className="pb-3 pt-4">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-purple-400" />
                          <span>Active Campaigns</span>
                        </div>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          10%
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                          {clientData.stats.activeCampaigns}
                        </span>
                        <span className="ml-1 text-xs text-gray-500">campaigns</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Overall completion</span>
                          <span className="text-white font-semibold">66%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} style={{ width: '66%' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${theme.accentGradient}`}></div>
                    <CardHeader className="pb-3 pt-4">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                        <div className="flex items-center">
                          <Send className="h-4 w-4 mr-2 text-purple-400" />
                          <span>Total Emails</span>
                        </div>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          12%
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                          {formatNumber(clientData.stats.totalEmails)}
                        </span>
                        <span className="ml-1 text-xs text-gray-500">sent</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Last 7 days</span>
                          <span className="text-white font-semibold">+{formatNumber(weeklyStats.emailsSent)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} style={{ width: '78%' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${theme.accentGradient}`}></div>
                    <CardHeader className="pb-3 pt-4">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-2 text-purple-400" />
                          <span>Open Rate</span>
                        </div>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {openRateChange}%
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                          {clientData.stats.openRate}%
                        </span>
                        <span className="ml-1 text-xs text-gray-500">30 day avg</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Industry avg</span>
                          <span className="text-white font-semibold">21.5%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} style={{ width: `${(clientData.stats.openRate / 40) * 100}%` }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${theme.accentGradient}`}></div>
                    <CardHeader className="pb-3 pt-4">
                      <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                        <div className="flex items-center">
                          <MousePointer className="h-4 w-4 mr-2 text-purple-400" />
                          <span>Click Rate</span>
                        </div>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {clickRateChange}%
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                          {clientData.stats.clickRate}%
                        </span>
                        <span className="ml-1 text-xs text-gray-500">30 day avg</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Industry avg</span>
                          <span className="text-white font-semibold">2.7%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} style={{ width: `${(clientData.stats.clickRate / 10) * 100}%` }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Insights Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-purple-400" />
                    <span>AI Insights</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Optimization Card */}
                    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden col-span-1">
                      <div className={`h-1 bg-gradient-to-r ${theme.accentGradient}`}></div>
                      <CardHeader className="pb-2">
                        <div className="bg-purple-900/20 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                          <Clock className="h-4 w-4 text-purple-400" />
                        </div>
                        <CardTitle className="text-lg text-white">Optimal Send Time</CardTitle>
                        <CardDescription className="text-gray-400">
                          Based on your audience engagement patterns, you'll get the best results by sending on:
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center bg-gray-800/40 rounded-lg px-4 py-3">
                          <div className="bg-purple-900/20 w-8 h-8 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-purple-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-200">{bestDay}</p>
                            <p className="text-xs text-gray-400">Best day of week</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center bg-gray-800/40 rounded-lg px-4 py-3">
                          <div className="bg-purple-900/20 w-8 h-8 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-purple-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-200">{bestTime}</p>
                            <p className="text-xs text-gray-400">Best time of day</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Subject Line Card */}
                    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden col-span-1 md:col-span-2">
                      <div className={`h-1 bg-gradient-to-r ${theme.accentGradient}`}></div>
                      <CardHeader className="pb-2">
                        <div className="bg-purple-900/20 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                          <FileText className="h-4 w-4 text-purple-400" />
                        </div>
                        <CardTitle className="text-lg text-white">Subject Line Optimization</CardTitle>
                        <CardDescription className="text-gray-400">
                          Your personalized subject lines are outperforming generic ones by 37%. Continue this strategy.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          className="w-full bg-gray-800/60 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white mt-4"
                        >
                          View Full Analysis
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Recent Campaigns */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-purple-400" />
                      <span>Recent Campaigns</span>
                    </h2>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-gray-800/60 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      New Campaign
                    </Button>
                  </div>
                  
                  <div className="overflow-hidden rounded-xl border border-gray-800">
                    <div className="bg-gray-900/60 backdrop-blur-sm py-3 px-4">
                      <div className="grid grid-cols-12 text-xs text-gray-400 uppercase tracking-wider">
                        <div className="col-span-5 md:col-span-3 font-medium">Campaign</div>
                        <div className="col-span-3 md:col-span-2 font-medium text-center">Status</div>
                        <div className="col-span-4 md:col-span-2 font-medium text-center">Sent Date</div>
                        <div className="hidden md:block md:col-span-1 font-medium text-right">Sent</div>
                        <div className="hidden md:block md:col-span-1 font-medium text-right">Open Rate</div>
                        <div className="hidden md:block md:col-span-1 font-medium text-right">Click Rate</div>
                        <div className="hidden md:block md:col-span-2 font-medium text-right">Actions</div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-800">
                      {clientData.campaigns && clientData.campaigns.length > 0 ? (
                        clientData.campaigns.map((campaign: any) => (
                          <div key={campaign.id} className="bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
                            <div className="py-3 px-4 grid grid-cols-12 items-center">
                              <div className="col-span-5 md:col-span-3 font-medium text-gray-200">
                                {campaign.name}
                              </div>
                              <div className="col-span-3 md:col-span-2 text-center">
                                {getStatusBadge(campaign.status)}
                              </div>
                              <div className="col-span-4 md:col-span-2 text-center text-gray-400 text-sm">
                                {campaign.sentDate || '-'}
                              </div>
                              <div className="hidden md:block md:col-span-1 text-right text-gray-300">
                                {formatNumber(campaign.emailsSent)}
                              </div>
                              <div className="hidden md:block md:col-span-1 text-right text-gray-300">
                                {(campaign.openRate * 100).toFixed(1)}%
                              </div>
                              <div className="hidden md:block md:col-span-1 text-right text-gray-300">
                                {(campaign.clickRate * 100).toFixed(1)}%
                              </div>
                              <div className="hidden md:flex md:col-span-2 justify-end space-x-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                  <BarChart2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-gray-400">
                          <Mail className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                          <p>No campaigns yet</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-4 bg-gray-800/60 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white"
                          >
                            Create Your First Campaign
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Campaigns Tab */}
              <TabsContent value="campaigns">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Campaigns Content</h3>
                  <p className="text-gray-400">
                    View your full campaign history, create new campaigns, and analyze performance.
                  </p>
                  <Button className={`mt-4 ${theme.accent} ${theme.accentHover}`}>
                    View All Campaigns
                  </Button>
                </div>
              </TabsContent>
              
              {/* Performance Tab */}
              <TabsContent value="performance">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Email Performance Analytics</h3>
                  <p className="text-gray-400">
                    Detailed analytics about your email campaigns, including open rates, click rates, and more.
                  </p>
                  <Button className={`mt-4 ${theme.accent} ${theme.accentHover}`}>
                    View Full Analytics
                  </Button>
                </div>
              </TabsContent>
              
              {/* Audience Tab */}
              <TabsContent value="audience">
                <div className="text-center py-8">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle>Your Audience Overview</CardTitle>
                      <CardDescription>Total contacts: {formatNumber(clientData.stats.contactsCount)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-gray-400 py-8">
                        Total contacts: {formatNumber(clientData.stats.contactsCount)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <footer className="mt-12 py-4 border-t border-gray-800 text-center text-xs text-gray-500">
            <p>Email Marketing Dashboard &copy; 2025 Infinity Tech. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}