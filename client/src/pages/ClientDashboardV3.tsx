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
  const [currentTheme, setCurrentTheme] = useState<string>("premium");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Premium Business Theme options
  const themes = {
    classic: {
      primary: "from-gray-900 to-gray-800",
      gradient: "from-gray-950 to-gray-900",
      accentGradient: "from-gray-800 to-gray-700",
      accent: "bg-gray-800",
      accentHover: "hover:bg-gray-900",
      accentLight: "bg-gray-800/10",
      accentBorder: "border-gray-700/30",
      textAccent: "text-gray-200",
      progressFill: "bg-gray-700",
      chartColors: ["#111827", "#1f2937", "#374151", "#4b5563", "#6b7280"]
    },
    premium: {
      primary: "from-zinc-900 to-zinc-800",
      gradient: "from-zinc-900 to-zinc-800",
      accentGradient: "from-zinc-800 to-zinc-700",
      accent: "bg-zinc-800",
      accentHover: "hover:bg-zinc-900",
      accentLight: "bg-zinc-800/10",
      accentBorder: "border-zinc-700/30",
      textAccent: "text-zinc-200",
      progressFill: "bg-zinc-700",
      chartColors: ["#18181b", "#27272a", "#3f3f46", "#52525b", "#71717a"]
    },
    business: {
      primary: "from-slate-900 to-slate-800",
      gradient: "from-slate-900 to-slate-800",
      accentGradient: "from-slate-800 to-slate-700",
      accent: "bg-slate-800",
      accentHover: "hover:bg-slate-900",
      accentLight: "bg-slate-800/10",
      accentBorder: "border-slate-700/30",
      textAccent: "text-slate-200",
      progressFill: "bg-slate-700",
      chartColors: ["#0f172a", "#1e293b", "#334155", "#475569", "#64748b"]
    },
    corporate: {
      primary: "from-stone-900 to-stone-800",
      gradient: "from-stone-900 to-stone-800",
      accentGradient: "from-stone-800 to-stone-700",
      accent: "bg-stone-800",
      accentHover: "hover:bg-stone-900",
      accentLight: "bg-stone-800/10",
      accentBorder: "border-stone-700/30",
      textAccent: "text-stone-200",
      progressFill: "bg-stone-700",
      chartColors: ["#1c1917", "#292524", "#44403c", "#57534e", "#78716c"]
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

  // Loading state with professional animation
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="relative h-24 w-24 mb-8">
            {/* Concentric animated circles */}
            <div className="absolute inset-0 rounded-md border border-zinc-800"></div>
            <div className="absolute inset-0 rounded-md border border-zinc-700"></div>
            
            {/* Center element */}
            <div className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <div className="w-5 h-5 rounded-sm border border-zinc-700 animate-pulse"></div>
            </div>

            {/* Subtle elements */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-sm bg-zinc-700"
                style={{ 
                  top: `${20 + Math.random() * 60}%`, 
                  left: `${20 + Math.random() * 60}%`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
          <p className="mt-8 text-zinc-300 text-sm font-medium tracking-wider uppercase">
            Loading Dashboard
          </p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl border border-zinc-800 overflow-hidden bg-zinc-900 text-zinc-100">
          <div className={`h-0.5 bg-gradient-to-r ${theme.accentGradient}`}></div>
          <CardHeader>
            <CardTitle className="text-base font-medium text-zinc-200">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-zinc-400 text-sm">Unable to load your dashboard data. Please try again or contact system administrator.</p>
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
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Sidebar for navigation */}
      <ClientSidebar isOpen={sidebarOpen} onClose={toggleSidebar} onLogout={handleClientLogout} />
      
      {/* Mobile menu button - visible on mobile only */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-md bg-gradient-to-r from-zinc-800 to-zinc-900 text-white shadow-lg transition-all duration-150 hover:shadow-xl active:scale-95"
      >
        <Menu size={24} className="transition-all duration-200 animate-in fade-in" />
      </button>
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Theme Selector (Floating top-right corner) */}
        <div className="fixed top-4 right-4 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-sm z-40 p-2 flex space-x-2 shadow-xl">
          <button 
            onClick={() => setCurrentTheme("classic")} 
            className={`h-7 w-7 rounded-sm bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center ${currentTheme === "classic" ? "ring-1 ring-gray-600 ring-offset-1 ring-offset-zinc-900" : "opacity-70"}`} 
          >
            {currentTheme === "classic" && <CheckCircle2 className="h-4 w-4 text-white" />}
          </button>
          <button 
            onClick={() => setCurrentTheme("premium")} 
            className={`h-7 w-7 rounded-sm bg-gradient-to-r from-zinc-900 to-zinc-800 flex items-center justify-center ${currentTheme === "premium" ? "ring-1 ring-zinc-600 ring-offset-1 ring-offset-zinc-900" : "opacity-70"}`} 
          >
            {currentTheme === "premium" && <CheckCircle2 className="h-4 w-4 text-white" />}
          </button>
          <button 
            onClick={() => setCurrentTheme("business")} 
            className={`h-7 w-7 rounded-sm bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center ${currentTheme === "business" ? "ring-1 ring-slate-600 ring-offset-1 ring-offset-zinc-900" : "opacity-70"}`} 
          >
            {currentTheme === "business" && <CheckCircle2 className="h-4 w-4 text-white" />}
          </button>
          <button 
            onClick={() => setCurrentTheme("corporate")} 
            className={`h-7 w-7 rounded-sm bg-gradient-to-r from-stone-900 to-stone-800 flex items-center justify-center ${currentTheme === "corporate" ? "ring-1 ring-stone-600 ring-offset-1 ring-offset-zinc-900" : "opacity-70"}`} 
          >
            {currentTheme === "corporate" && <CheckCircle2 className="h-4 w-4 text-white" />}
          </button>
        </div>

        {/* Professional header with minimal design */}
        <header className="relative border-b border-zinc-800 bg-zinc-900/80 shadow-md">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-20"></div>
          
          <div className="container mx-auto px-4 py-5 lg:py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="mr-3 lg:hidden text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  onClick={toggleSidebar}
                >
                  <Menu size={20} />
                </Button>
                
                <div className="relative">
                  {/* Header content */}
                  <div className="relative">
                    <div className="flex items-baseline">
                      <h1 className="text-xl md:text-2xl font-medium text-zinc-100">
                        Welcome, {clientData.clientName}
                      </h1>
                      <span className="ml-3 px-2 py-0.5 text-xs font-medium rounded-sm border border-zinc-700 bg-zinc-800/60 text-zinc-300">
                        {clientData.clientCompany}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs md:text-sm mt-1">
                      Campaign Performance Dashboard 
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/60" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  <span>Alerts</span>
                </Button>
                
                <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/60" size="sm">
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