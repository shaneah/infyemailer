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
  const [currentTheme, setCurrentTheme] = useState<string>("purple");
  
  // Theme options
  const themes = {
    blue: {
      primary: "from-blue-600 to-blue-400",
      gradient: "from-blue-900 via-blue-700 to-blue-800",
      accentGradient: "from-cyan-400 to-blue-500",
      accent: "bg-blue-600",
      accentHover: "hover:bg-blue-700",
      accentLight: "bg-blue-500/10",
      accentBorder: "border-blue-500/30",
      textAccent: "text-blue-600",
      progressFill: "bg-blue-600",
      chartColors: ["#3B82F6", "#60A5FA", "#93C5FD", "#2563EB", "#1D4ED8"]
    },
    purple: {
      primary: "from-purple-600 to-fuchsia-400",
      gradient: "from-purple-900 via-violet-800 to-fuchsia-900",
      accentGradient: "from-fuchsia-400 to-purple-500",
      accent: "bg-purple-600",
      accentHover: "hover:bg-purple-700",
      accentLight: "bg-purple-500/10",
      accentBorder: "border-purple-500/30",
      textAccent: "text-purple-600",
      progressFill: "bg-purple-600",
      chartColors: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#7C3AED", "#6D28D9"]
    },
    teal: {
      primary: "from-teal-600 to-emerald-400",
      gradient: "from-teal-900 via-teal-700 to-emerald-900",
      accentGradient: "from-emerald-400 to-teal-500",
      accent: "bg-teal-600",
      accentHover: "hover:bg-teal-700",
      accentLight: "bg-teal-500/10",
      accentBorder: "border-teal-500/30",
      textAccent: "text-teal-600",
      progressFill: "bg-teal-600",
      chartColors: ["#14B8A6", "#2DD4BF", "#5EEAD4", "#0D9488", "#0F766E"]
    },
    amber: {
      primary: "from-amber-500 to-orange-400",
      gradient: "from-amber-900 via-amber-700 to-orange-900",
      accentGradient: "from-orange-400 to-amber-500",
      accent: "bg-amber-500",
      accentHover: "hover:bg-amber-600",
      accentLight: "bg-amber-500/10",
      accentBorder: "border-amber-500/30",
      textAccent: "text-amber-500",
      progressFill: "bg-amber-500",
      chartColors: ["#F59E0B", "#FBBF24", "#FCD34D", "#D97706", "#B45309"]
    }
  };

  // Active theme
  const theme = themes[currentTheme as keyof typeof themes];
  const [activeTheme, setActiveTheme] = useState(currentTheme);

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
    setActiveTheme(newTheme);
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
        const sessionResponse = await fetch('/api/session/verify');
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
            <div className="absolute inset-0 rounded-full border border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/30"></div>
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-400"></div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-purple-500"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Theme Selector (Floating top-right corner) */}
      <div className="fixed top-4 right-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-full z-40 p-2 flex space-x-2 shadow-xl">
        <button 
          onClick={() => setCurrentTheme("blue")} 
          className={`h-7 w-7 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center ${currentTheme === "blue" ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800" : "opacity-70"}`} 
        >
          {currentTheme === "blue" && <CheckCircle2 className="h-4 w-4 text-white" />}
        </button>
        <button 
          onClick={() => setCurrentTheme("purple")} 
          className={`h-7 w-7 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-400 flex items-center justify-center ${currentTheme === "purple" ? "ring-2 ring-purple-400 ring-offset-2 ring-offset-gray-800" : "opacity-70"}`} 
        >
          {currentTheme === "purple" && <CheckCircle2 className="h-4 w-4 text-white" />}
        </button>
        <button 
          onClick={() => setCurrentTheme("teal")} 
          className={`h-7 w-7 rounded-full bg-gradient-to-r from-teal-600 to-emerald-400 flex items-center justify-center ${currentTheme === "teal" ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-gray-800" : "opacity-70"}`} 
        >
          {currentTheme === "teal" && <CheckCircle2 className="h-4 w-4 text-white" />}
        </button>
        <button 
          onClick={() => setCurrentTheme("amber")} 
          className={`h-7 w-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 flex items-center justify-center ${currentTheme === "amber" ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-gray-800" : "opacity-70"}`} 
        >
          {currentTheme === "amber" && <CheckCircle2 className="h-4 w-4 text-white" />}
        </button>
      </div>

      {/* Header with glowing accent border and futuristic design */}
      <header className="relative border-b border-gray-800">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70"></div>
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-70"></div>
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-70"></div>
        
        <div className="container mx-auto px-4 py-4 lg:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="mr-3 lg:hidden text-gray-400 hover:text-white hover:bg-gray-800/60"
              >
                <Menu size={20} />
              </Button>
              
              <div className="relative">
                {/* Glowing accent background element */}
                <div className="absolute -left-2 -top-2 w-12 h-12 rounded-full bg-purple-600/20 blur-xl"></div>
                
                <div className="relative">
                  <div className="flex items-baseline">
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                      Welcome, {clientData.clientName}
                    </h1>
                    <span className="ml-3 px-3 py-1 text-xs font-medium rounded-full border border-gray-700 bg-gray-800/60 text-gray-300">
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
                className={`bg-gradient-to-r ${theme.accentGradient} border-none text-white hover:opacity-90`}
                size="sm"
                onClick={handleLogout}
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
                        <div className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} style={{ width: `${(clientData.stats.clickRate / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Second row: AI Insights and Performance Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* AI Insights */}
                <div className="lg:col-span-1">
                  <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        <div className="flex items-center">
                          <Zap className="h-5 w-5 mr-2 text-purple-400" />
                          AI Insights
                        </div>
                      </CardTitle>
                      <CardDescription className="text-gray-500">Personalized recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* First Insight Card */}
                        <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700">
                          <div className="flex items-center mb-2">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3">
                              <Clock className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-white">Optimal Send Time</h4>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            Based on your audience engagement patterns, you'll get the best results by sending on:
                          </p>
                          <div className="flex items-center justify-between mb-2 bg-gray-800/80 p-2 rounded border border-gray-700/60">
                            <div>
                              <span className="block text-sm text-gray-300 font-medium">{bestDay}</span>
                              <span className="block text-xs text-gray-500">Best day of week</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-indigo-400" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between bg-gray-800/80 p-2 rounded border border-gray-700/60">
                            <div>
                              <span className="block text-sm text-gray-300 font-medium">{bestTime}</span>
                              <span className="block text-xs text-gray-500">Best time of day</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                              <Timer className="h-4 w-4 text-indigo-400" />
                            </div>
                          </div>
                        </div>

                        {/* Second Insight Card */}
                        <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700">
                          <div className="flex items-center mb-2">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3">
                              <Lightbulb className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-white">Subject Line Optimization</h4>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            Your personalized subject lines are outperforming generic ones by 37%. Continue this strategy.
                          </p>
                          <Button 
                            className={`w-full bg-gradient-to-r ${theme.accentGradient} text-white hover:opacity-90`}
                            size="sm"
                          >
                            View Full Analysis
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Campaigns List */}
                <div className="lg:col-span-2">
                  <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                          <div className="flex items-center">
                            <Mail className="h-5 w-5 mr-2 text-purple-400" />
                            Recent Campaigns
                          </div>
                        </CardTitle>
                        <Button 
                          className={`bg-gradient-to-r ${theme.accentGradient} text-xs text-white hover:opacity-90`}
                          size="sm"
                        >
                          New Campaign
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto -mx-4">
                        <div className="inline-block min-w-full align-middle px-4">
                          <div className="overflow-hidden border border-gray-800 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-800">
                              <thead className="bg-gray-800/60">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Campaign
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Sent Date
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Sent
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Open Rate
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Click Rate
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                                {clientData.campaigns.map((campaign: any, idx: number) => (
                                  <tr key={campaign.id} className="hover:bg-gray-800/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                      {campaign.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      {getStatusBadge(campaign.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                      {campaign.sentDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                                      {campaign.emailsSent > 0 ? formatNumber(campaign.emailsSent) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                      {campaign.openRate > 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                          {campaign.openRate}%
                                        </span>
                                      ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                      {campaign.clickRate > 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                          {campaign.clickRate}%
                                        </span>
                                      ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                          <BarChart2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                          <Share2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="mt-6">
              <div className="flex flex-col gap-6">
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-purple-400" />
                        Campaign Overview
                      </div>
                    </CardTitle>
                    <CardDescription className="text-gray-500">View and manage all your email campaigns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-400 py-8">
                      Navigate to the Overview tab to view your campaigns and performance metrics
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${theme.accentGradient}`}></div>
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-purple-400" />
                        <span>Avg. Open Rate</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIndicator(openRateChange)}
                        <span className="ml-1 text-xs font-medium text-green-500">{openRateChange}%</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {avgOpenRateLast30Days}%
                      </span>
                      <span className="ml-1 text-xs text-gray-500">last 30 days</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Industry benchmark</span>
                        <span className="text-white font-semibold">21.5%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} style={{ width: `${(avgOpenRateLast30Days / 40) * 100}%` }}></div>
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
                        <span>Avg. Click Rate</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIndicator(clickRateChange)}
                        <span className="ml-1 text-xs font-medium text-green-500">{clickRateChange}%</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {avgClickRateLast30Days}%
                      </span>
                      <span className="ml-1 text-xs text-gray-500">last 30 days</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Industry benchmark</span>
                        <span className="text-white font-semibold">2.7%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} style={{ width: `${(avgClickRateLast30Days / 8) * 100}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${theme.accentGradient}`}></div>
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-purple-400" />
                        <span>Avg. Conversion Rate</span>
                      </div>
                      <div className="flex items-center">
                        {getTrendIndicator(conversionRateChange)}
                        <span className="ml-1 text-xs font-medium text-green-500">{conversionRateChange}%</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {avgConversionRateLast30Days}%
                      </span>
                      <span className="ml-1 text-xs text-gray-500">last 30 days</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Industry benchmark</span>
                        <span className="text-white font-semibold">0.5%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} style={{ width: `${(avgConversionRateLast30Days / 2) * 100}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-purple-400" />
                        Engagement Over Time
                      </div>
                    </CardTitle>
                    <CardDescription className="text-gray-500">Monthly performance trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={engagementOverTimeData}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <defs>
                            {theme.chartColors.map((color, index) => (
                              <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                          <XAxis dataKey="month" stroke="#6B7280" />
                          <YAxis stroke="#6B7280" />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="open" 
                            name="Open Rate (%)" 
                            stroke={theme.chartColors[0]} 
                            strokeWidth={2}
                            dot={{ r: 3, fill: theme.chartColors[0], strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: theme.chartColors[0], strokeWidth: 0 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="click" 
                            name="Click Rate (%)" 
                            stroke={theme.chartColors[1]} 
                            strokeWidth={2}
                            dot={{ r: 3, fill: theme.chartColors[1], strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: theme.chartColors[1], strokeWidth: 0 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="conversion" 
                            name="Conversion Rate (%)" 
                            stroke={theme.chartColors[2]} 
                            strokeWidth={2}
                            dot={{ r: 3, fill: theme.chartColors[2], strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: theme.chartColors[2], strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                      <div className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-2 text-purple-400" />
                        Device Breakdown
                      </div>
                    </CardTitle>
                    <CardDescription className="text-gray-500">How your audience views your emails</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={deviceBreakdownData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {deviceBreakdownData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={theme.chartColors[index % theme.chartColors.length]} 
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => `${value}%`} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Audience Tab */}
            <TabsContent value="audience" className="mt-6">
              <div className="flex flex-col gap-6">
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-purple-400" />
                        Audience Overview
                      </div>
                    </CardTitle>
                    <CardDescription className="text-gray-500">Your contact growth and engagement</CardDescription>
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
  );
}
