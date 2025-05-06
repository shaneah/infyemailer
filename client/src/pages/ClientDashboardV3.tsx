import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
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
      chartColors: ["#9333EA", "#A855F7", "#C084FC", "#7E22CE", "#6B21A8"]
    },
    teal: {
      primary: "from-teal-600 to-emerald-400",
      gradient: "from-teal-900 via-emerald-800 to-green-900",
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
      gradient: "from-amber-900 via-orange-800 to-red-900",
      accentGradient: "from-orange-400 to-amber-500",
      accent: "bg-amber-500",
      accentHover: "hover:bg-amber-600",
      accentLight: "bg-amber-500/10",
      accentBorder: "border-amber-500/30",
      textAccent: "text-amber-600",
      progressFill: "bg-amber-500",
      chartColors: ["#F59E0B", "#FBBF24", "#FCD34D", "#D97706", "#B45309"]
    }
  };

  // Current theme
  const theme = themes[currentTheme as keyof typeof themes];

  useEffect(() => {
    setLoading(true);
    // Get user data
    const fetchData = async () => {
      try {
        const currentClientUser = sessionStorage.getItem('clientUser')
          ? JSON.parse(sessionStorage.getItem('clientUser') || '{}')
          : null;

        if (!currentClientUser) {
          toast({
            title: "Access denied",
            description: "Please log in to access your dashboard",
            variant: "destructive"
          });
          setLocation('/client-login');
          return;
        }
        
        // Sample data
        setClientData({
          clientName: currentClientUser.clientName,
          clientCompany: currentClientUser.clientCompany,
          stats: {
            activeCampaigns: 3,
            totalEmails: 12500,
            openRate: 24.8,
            clickRate: 3.6,
            contactsCount: 4560
          },
          campaigns: [
            { id: 1, name: 'Q1 Newsletter', status: 'Completed', sentDate: '2025-02-15', emailsSent: 3240, openRate: 26.5, clickRate: 4.2 },
            { id: 2, name: 'Product Launch', status: 'Ongoing', sentDate: '2025-04-20', emailsSent: 5150, openRate: 31.2, clickRate: 5.8 },
            { id: 3, name: 'Summer Promotion', status: 'Scheduled', sentDate: '2025-05-15', emailsSent: 0, openRate: 0, clickRate: 0 }
          ]
        });
        
        // Wait a bit to show the loading animation
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (err) {
        console.error("Error loading client data:", err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [setLocation, toast]);

  const handleLogout = () => {
    sessionStorage.removeItem('clientUser');
    setLocation('/client-login');
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Sample data for charts
  const weeklyPerformanceData = [
    { day: 'Mon', opens: 22.4, clicks: 3.2, conversions: 0.8 },
    { day: 'Tue', opens: 24.7, clicks: 3.7, conversions: 1.1 },
    { day: 'Wed', opens: 27.5, clicks: 4.2, conversions: 1.3 },
    { day: 'Thu', opens: 26.1, clicks: 4.0, conversions: 1.2 },
    { day: 'Fri', opens: 23.8, clicks: 3.5, conversions: 1.0 },
    { day: 'Sat', opens: 19.2, clicks: 2.8, conversions: 0.7 },
    { day: 'Sun', opens: 18.5, clicks: 2.6, conversions: 0.6 }
  ];

  const deviceBreakdownData = [
    { name: 'Mobile', value: 56 },
    { name: 'Desktop', value: 38 },
    { name: 'Tablet', value: 6 }
  ];

  const engagementOverTimeData = [
    { month: 'Jan', open: 21.5, click: 3.2, conversion: 0.8 },
    { month: 'Feb', open: 22.8, click: 3.5, conversion: 0.9 },
    { month: 'Mar', open: 23.7, click: 3.7, conversion: 1.0 },
    { month: 'Apr', open: 24.9, click: 3.9, conversion: 1.1 },
    { month: 'May', open: 24.2, click: 3.8, conversion: 1.1 }
  ];

  const audienceGrowthData = [
    { month: 'Dec', contacts: 3840 },
    { month: 'Jan', contacts: 4050 },
    { month: 'Feb', contacts: 4220 },
    { month: 'Mar', contacts: 4380 },
    { month: 'Apr', contacts: 4560 }
  ];

  const realtimeActivities = [
    { id: 1, time: '2 mins ago', action: 'Email Open', email: 'newsletter@company.com', user: 'j.smith@example.com' },
    { id: 2, time: '5 mins ago', action: 'Link Click', email: 'promo@company.com', user: 'm.johnson@example.com' },
    { id: 3, time: '8 mins ago', action: 'Purchase', email: 'offers@company.com', user: 'l.williams@example.com' },
    { id: 4, time: '12 mins ago', action: 'Email Open', email: 'newsletter@company.com', user: 'a.brown@example.com' }
  ];

  // Calculate weekly stats
  const weeklyStats = {
    emailsSent: 2870,
    openRate: weeklyPerformanceData.reduce((acc, item) => acc + item.opens, 0) / weeklyPerformanceData.length,
    clickRate: weeklyPerformanceData.reduce((acc, item) => acc + item.clicks, 0) / weeklyPerformanceData.length,
    conversionRate: weeklyPerformanceData.reduce((acc, item) => acc + item.conversions, 0) / weeklyPerformanceData.length
  };

  // Pre-calculate some metrics for display
  const bestDay = "Wednesday";
  const bestTime = "10:00 AM";
  const avgOpenRateLast30Days = 25.2;
  const avgClickRateLast30Days = 3.8;
  const avgConversionRateLast30Days = 1.1;
  const openRateChange = 2.8; // % change
  const clickRateChange = 0.4; // % change
  const conversionRateChange = 0.3; // % change

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 ${theme.accentLight} border ${theme.accentBorder} rounded-md shadow-sm backdrop-blur-sm`}>
          <p className="text-sm font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span>{entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.name.includes('Rate') ? '%' : ''}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get trend indicators for metrics
  const getTrendIndicator = (value: number) => {
    if (value > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (value < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <ArrowRight className="h-3 w-3 text-gray-500" />;
  };

  // Campaign status badges
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-500">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600">Completed</span>
          </div>
        );
      case 'ongoing':
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500">
              <Activity className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-600">Ongoing</span>
          </div>
        );
      case 'scheduled':
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-400 to-orange-500">
              <Calendar className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-amber-600">Scheduled</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full flex items-center justify-center bg-gray-400">
              <Bell className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-600">{status}</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <div className="flex flex-col items-center">
          <motion.div 
            className="relative w-24 h-24"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Pulsing backdrop */}
            <motion.div 
              className={`absolute inset-0 rounded-full ${theme.accentLight} opacity-30`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Rotating arcs */}
            <motion.div 
              className={`absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className={`absolute inset-0 rounded-full border-4 border-r-indigo-500 border-l-transparent border-t-transparent border-b-transparent`}
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* Center dot */}
            <motion.div 
              className={`absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${theme.primary}`}
              animate={{ boxShadow: ["0 0 10px rgba(147, 51, 234, 0.5)", "0 0 20px rgba(147, 51, 234, 0.7)", "0 0 10px rgba(147, 51, 234, 0.5)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-purple-500"
                initial={{ 
                  x: Math.random() * 100 - 50, 
                  y: Math.random() * 100 - 50,
                  opacity: 0.7
                }}
                animate={{ 
                  x: Math.random() * 100 - 50, 
                  y: Math.random() * 100 - 50,
                  opacity: [0.7, 0.3, 0.7]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            ))}
          </motion.div>
          <motion.p 
            className="mt-8 text-white text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Loading your dashboard...
          </motion.p>
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
                    <motion.div 
                      className="flex items-baseline"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {clientData.stats.activeCampaigns}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">campaigns</span>
                    </motion.div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Overall completion</span>
                        <span className="text-white font-semibold">66%</span>
                      </div>
                      <motion.div 
                        className="h-1.5 rounded-full bg-gray-800 overflow-hidden"
                        whileHover={{ scale: 1.03 }}
                      >
                        <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} 
                          style={{ width: '66%' }}
                          whileHover={{ opacity: 0.8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </motion.div>
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
                    <motion.div 
                      className="flex items-baseline"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {formatNumber(clientData.stats.totalEmails)}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">sent</span>
                    </motion.div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Last 7 days</span>
                        <span className="text-white font-semibold">+{formatNumber(weeklyStats.emailsSent)}</span>
                      </div>
                      <motion.div 
                        className="h-1.5 rounded-full bg-gray-800 overflow-hidden"
                        whileHover={{ scale: 1.03 }}
                      >
                        <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} 
                          style={{ width: '78%' }}
                          whileHover={{ opacity: 0.8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </motion.div>
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
                    <motion.div 
                      className="flex items-baseline"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {clientData.stats.openRate}%
                      </span>
                      <span className="ml-1 text-xs text-gray-500">30 day avg</span>
                    </motion.div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Industry avg</span>
                        <span className="text-white font-semibold">21.5%</span>
                      </div>
                      <motion.div 
                        className="h-1.5 rounded-full bg-gray-800 overflow-hidden"
                        whileHover={{ scale: 1.03 }}
                      >
                        <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} 
                          style={{ width: '85%' }}
                          whileHover={{ opacity: 0.8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </motion.div>
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
                    <motion.div 
                      className="flex items-baseline"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {clientData.stats.clickRate}%
                      </span>
                      <span className="ml-1 text-xs text-gray-500">30 day avg</span>
                    </motion.div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Industry avg</span>
                        <span className="text-white font-semibold">2.7%</span>
                      </div>
                      <motion.div 
                        className="h-1.5 rounded-full bg-gray-800 overflow-hidden"
                        whileHover={{ scale: 1.03 }}
                      >
                        <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} 
                          style={{ width: '75%' }}
                          whileHover={{ opacity: 0.8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* First Column (Weekly Performance) */}
                <div className="lg:col-span-2">
                  <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                          Weekly Performance
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-400 hover:text-white">
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Export
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-400 hover:text-white">
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Refresh
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-gray-500">Email engagement metrics for the past 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={weeklyPerformanceData}
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
                            <XAxis dataKey="day" stroke="#6B7280" />
                            <YAxis stroke="#6B7280" />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Line 
                              type="monotone" 
                              dataKey="opens" 
                              name="Open Rate (%)" 
                              stroke={theme.chartColors[0]} 
                              strokeWidth={2}
                              dot={{ r: 3, fill: theme.chartColors[0], strokeWidth: 0 }}
                              activeDot={{ r: 6, fill: theme.chartColors[0], strokeWidth: 0 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="clicks" 
                              name="Click Rate (%)" 
                              stroke={theme.chartColors[1]} 
                              strokeWidth={2}
                              dot={{ r: 3, fill: theme.chartColors[1], strokeWidth: 0 }}
                              activeDot={{ r: 6, fill: theme.chartColors[1], strokeWidth: 0 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="conversions" 
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
                </div>

                {/* Second Column (AI Insights) */}
                <div>
                  <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden h-full">
                    <div className={`h-1 bg-gradient-to-r ${theme.accentGradient}`}></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-base font-medium bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        <Lightbulb className="h-5 w-5 mr-2 text-purple-400" />
                        AI Insights
                      </CardTitle>
                      <CardDescription className="text-gray-500">Personalized recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* First Insight Card */}
                        <motion.div 
                          className="p-3 rounded-lg bg-gray-800/60 border border-gray-700"
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 0 15px rgba(139, 92, 246, 0.15)"
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                          <div className="flex items-center mb-2">
                            <motion.div 
                              className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3"
                              whileHover={{ rotate: 15 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Clock className="h-4 w-4 text-white" />
                            </motion.div>
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
                        </motion.div>

                        {/* Second Insight Card */}
                        <motion.div 
                          className="p-3 rounded-lg bg-gray-800/60 border border-gray-700"
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 0 15px rgba(139, 92, 246, 0.15)"
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        >
                          <div className="flex items-center mb-2">
                            <motion.div 
                              className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3"
                              whileHover={{ rotate: 15 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Lightbulb className="h-4 w-4 text-white" />
                            </motion.div>
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
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Campaigns List */}
              <div className="mt-6">
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
                    <motion.div 
                      className="flex items-baseline"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {avgOpenRateLast30Days}%
                      </span>
                      <span className="ml-1 text-xs text-gray-500">last 30 days</span>
                    </motion.div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Industry benchmark</span>
                        <span className="text-white font-semibold">21.5%</span>
                      </div>
                      <motion.div 
                        className="h-1.5 rounded-full bg-gray-800 overflow-hidden"
                        whileHover={{ scale: 1.03 }}
                      >
                        <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} 
                          style={{ width: `${(avgOpenRateLast30Days / 40) * 100}%` }}
                          whileHover={{ opacity: 0.8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </motion.div>
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
                      <motion.div 
                        className="h-1.5 rounded-full bg-gray-800 overflow-hidden"
                        whileHover={{ scale: 1.03 }}
                      >
                        <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} 
                          style={{ width: `${(avgClickRateLast30Days / 8) * 100}%` }}
                          whileHover={{ opacity: 0.8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </motion.div>
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
                      <motion.div 
                        className="h-1.5 rounded-full bg-gray-800 overflow-hidden"
                        whileHover={{ scale: 1.03 }}
                      >
                        <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${theme.accentGradient}`} 
                          style={{ width: `${(avgConversionRateLast30Days / 2) * 100}%` }}
                          whileHover={{ opacity: 0.8 }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </motion.div>
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