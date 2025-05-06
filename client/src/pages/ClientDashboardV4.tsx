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
  Gauge, RefreshCw, Timer, Smartphone, Filter, Download,
  Database, UserRound, ChevronDown, ChevronUp
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
  
  // UI state for dropdowns
  const [showCampaignSelector, setShowCampaignSelector] = useState(false);
  const [showAdSetSelector, setShowAdSetSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("All Campaigns");
  const [selectedAdSet, setSelectedAdSet] = useState("All Sets");
  const [selectedDataSource, setSelectedDataSource] = useState("Original");
  
  // Sample data for dropdowns
  const campaigns = ["All Campaigns", "Spring Sale", "Product Launch", "Newsletter", "Retargeting"];
  const adSets = ["All Sets", "High Value", "New Customers", "Abandoned Cart", "Loyal Customers"];
  const dateRanges = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month", "Last month", "Custom range"];
  
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

  // Email marketing metrics data
  const mockMetricsData = {
    spend: {
      value: 3.60,
      unit: "K",
      change: 0.92,
      trend: "up",
      sparklineData: [2.5, 2.9, 3.0, 3.4, 2.9, 3.3, 3.6, 3.1, 3.5, 3.2, 3.4, 3.6]
    },
    cpm: {
      value: 40.5,
      unit: "",
      change: 1.28,
      trend: "up",
      sparklineData: [34, 35, 37, 36, 38, 39, 38, 39, 40, 40.5, 40.2, 40.5]
    },
    ctr: {
      value: 4.2,
      unit: "%",
      change: 0.08,
      trend: "up",
      sparklineData: [3.8, 3.9, 4.0, 4.0, 4.1, 4.0, 4.0, 4.1, 4.0, 4.1, 4.2, 4.2]
    },
    cpc: {
      value: 0.4,
      unit: "",
      change: -0.04,
      trend: "down",
      sparklineData: [0.52, 0.50, 0.48, 0.46, 0.45, 0.43, 0.42, 0.41, 0.40, 0.42, 0.41, 0.40]
    },
    videoViews: {
      value: 9.3,
      unit: "K",
      change: 0.8,
      trend: "up",
      sparklineData: [7.0, 7.5, 8.0, 7.8, 8.5, 9.0, 8.9, 9.1, 9.3, 9.2, 9.4, 9.3]
    },
    impressions: {
      value: 25.4,
      unit: "K",
      change: 2.7,
      trend: "up",
      sparklineData: [19.5, 20.7, 21.5, 22.3, 22.8, 23.0, 23.5, 24.1, 24.8, 25.0, 25.2, 25.4]
    },
    conversions: {
      value: 512,
      unit: "",
      change: 36.0,
      trend: "up",
      sparklineData: [420, 435, 450, 458, 465, 472, 480, 490, 498, 502, 508, 512]
    },
    conversionRate: {
      value: 2.12,
      unit: "%",
      change: 0.2,
      trend: "up",
      sparklineData: [1.80, 1.85, 1.90, 1.95, 2.00, 2.05, 2.06, 2.08, 2.10, 2.11, 2.12, 2.12]
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
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // We already have these variables defined at the top
  // const [showDatePicker, setShowDatePicker] = useState(false);
  // const [dateRanges] = useState([
  //   "Last 7 days",
  //   "Last 30 days",
  //   "This month",
  //   "Last month",
  //   "This quarter",
  //   "Custom range..."
  // ]);
  
  // Various UI interaction handlers
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Download clicked");
    // Download functionality would go here
    toast({
      title: "Download started",
      description: "Your data is being prepared for download.",
      variant: "default",
    });
  };
  
  const handleBarChartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Chart view toggle clicked");
    toast({
      title: "View changed",
      description: "Chart view has been toggled.",
      variant: "default",
    });
  };
  
  const handleDateRangeSelect = (range: string) => {
    setDateRange(range);
    setShowDatePicker(false);
    toast({
      title: "Date range updated",
      description: `Date range changed to: ${range}`,
      variant: "default",
    });
  };

  // Toggle date picker visibility
  const toggleDatePicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDatePicker(!showDatePicker);
    // Close filter panel when opening date picker
    if (!showDatePicker) {
      setShowFilters(false);
    }
  };
  
  // Toggle campaign selector
  const toggleCampaignSelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCampaignSelector(!showCampaignSelector);
    // Close other dropdowns
    setShowAdSetSelector(false);
    setShowDatePicker(false);
    setShowFilters(false);
  };
  
  // Toggle ad set selector
  const toggleAdSetSelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAdSetSelector(!showAdSetSelector);
    // Close other dropdowns
    setShowCampaignSelector(false);
    setShowDatePicker(false);
    setShowDataSourceSelector(false);
    setShowFilters(false);
  };
  
  // Toggle data source selector
  const toggleDataSourceSelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDataSourceSelector(!showDataSourceSelector);
    // Close other dropdowns
    setShowCampaignSelector(false);
    setShowAdSetSelector(false);
    setShowDatePicker(false);
    setShowFilters(false);
  };
  
  // Handle campaign selection
  const handleCampaignSelect = (campaign: string) => {
    setSelectedCampaign(campaign);
    setShowCampaignSelector(false);
  };
  
  // Handle ad set selection
  const handleAdSetSelect = (adSet: string) => {
    setSelectedAdSet(adSet);
    setShowAdSetSelector(false);
  };
  
  // Handle data source selection
  const handleDataSourceSelect = (dataSource: string) => {
    setSelectedDataSource(dataSource);
    setShowDataSourceSelector(false);
    toast({
      title: "Data source updated",
      description: `Data source changed to: ${dataSource}`,
      variant: "default",
    });
  };
  
  // Handle filter functionality
  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFilters(!showFilters);
    // Close other dropdowns when opening filter panel
    if (!showFilters) {
      setShowDatePicker(false);
      setShowCampaignSelector(false);
      setShowAdSetSelector(false);
    }
  };
  
  // Add or remove filter from active filters
  const toggleActiveFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
    
    toast({
      title: activeFilters.includes(filter) ? "Filter removed" : "Filter applied",
      description: `${filter} filter has been ${activeFilters.includes(filter) ? "removed" : "applied"}`,
      variant: "default",
    });
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if the click is on a dropdown toggle or dropdown menu item
      const target = event.target as HTMLElement;
      if (target.closest('.dropdown-toggle') || target.closest('.dropdown-menu')) {
        return;
      }
      
      setShowFilters(false);
      setShowDatePicker(false);
      setShowCampaignSelector(false);
      setShowAdSetSelector(false);
      setShowDataSourceSelector(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="relative h-20 w-20 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/40"></div>
            <div className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-blue-500 animate-pulse"></div>
            </div>
          </div>
          <p className="text-blue-700 text-sm font-medium">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border border-gray-200 bg-white text-gray-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-500 text-sm mb-4">Unable to load dashboard data. Please try again or contact support.</p>
            <Button 
              onClick={handleClientLogout} 
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
      {/* Sidebar for navigation */}
      <ClientSidebar isOpen={sidebarOpen} onClose={toggleSidebar} onLogout={handleClientLogout} />
      
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-50 lg:hidden flex items-center justify-center w-12 h-12 rounded-md bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95"
      >
        <Menu size={24} />
      </button>
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header with filters and date selection */}
        <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  onClick={toggleSidebar}
                >
                  <Menu size={20} />
                </Button>
                
                {/* Filter dropdowns - hidden on small screens*/}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="relative">
                    <div 
                      className="relative bg-gray-100 rounded-md border border-gray-200 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-200 transition-colors dropdown-toggle"
                      onClick={toggleDataSourceSelector}
                    >
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">Data Source</span>
                        <span className="text-gray-800 font-medium">{selectedDataSource}</span>
                        <ChevronDown className="h-3 w-3 ml-2 text-gray-500" />
                      </div>
                    </div>
                    
                    {showDataSourceSelector && (
                      <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 dropdown-menu">
                        {["Original", "API", "Imported", "Third-party"].map((source) => (
                          <div 
                            key={source}
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDataSourceSelect(source);
                            }}
                          >
                            {source}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div 
                      className="relative bg-gray-100 rounded-md border border-gray-200 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-200 transition-colors dropdown-toggle"
                      onClick={toggleCampaignSelector}
                    >
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">Campaign</span>
                        <span className="text-gray-800 font-medium">{selectedCampaign}</span>
                        <ChevronDown className="h-3 w-3 ml-2 text-gray-500" />
                      </div>
                    </div>
                    
                    {showCampaignSelector && (
                      <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 dropdown-menu">
                        {campaigns.map((campaign) => (
                          <div 
                            key={campaign}
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCampaignSelect(campaign);
                            }}
                          >
                            {campaign}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div 
                      className="relative bg-gray-100 rounded-md border border-gray-200 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-200 transition-colors dropdown-toggle"
                      onClick={toggleAdSetSelector}
                    >
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">Ad Set</span>
                        <span className="text-gray-800 font-medium">{selectedAdSet}</span>
                        <ChevronDown className="h-3 w-3 ml-2 text-gray-500" />
                      </div>
                    </div>
                    
                    {showAdSetSelector && (
                      <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 dropdown-menu">
                        {adSets.map((adSet) => (
                          <div 
                            key={adSet}
                            className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdSetSelect(adSet);
                            }}
                          >
                            {adSet}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Date range selector */}
              <div className="relative">
                <div 
                  className="bg-gray-100 rounded-md border border-gray-200 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-200 transition-colors dropdown-toggle"
                  onClick={toggleDatePicker}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-gray-800 font-medium">{dateRange}</span>
                    <ChevronDown className="h-3 w-3 ml-2 text-gray-500" />
                  </div>
                </div>
                
                {showDatePicker && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 dropdown-menu">
                    {dateRanges.map((range) => (
                      <div 
                        key={range}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateRangeSelect(range);
                        }}
                      >
                        {range}
                      </div>
                    ))}
                  </div>
                )}
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
                      <h3 className="text-slate-900 text-2xl font-bold">${mockMetricsData.spend.value}K</h3>
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
                      <h3 className="text-slate-900 text-2xl font-bold">${mockMetricsData.cpm.value}</h3>
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
                      <h3 className="text-slate-900 text-2xl font-bold">${mockMetricsData.cpc.value}</h3>
                      <span className="ml-2 flex items-center text-xs text-red-600">
                        <ArrowDown className="h-3 w-3 mr-0.5" /> ${Math.abs(mockMetricsData.cpc.change)}
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-500 hover:text-slate-700"
                      onClick={handleDownloadClick}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-6 w-6 text-slate-500 hover:text-slate-700 ${showFilters ? 'bg-slate-100' : ''}`}
                      onClick={toggleFilter}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-500 hover:text-slate-700"
                      onClick={handleBarChartClick}
                    >
                      <BarChart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {showFilters && (
                  <div className="mt-2 p-2 bg-gray-50 border border-gray-100 rounded-md">
                    <p className="mb-1 text-xs font-medium text-gray-500">Filter by:</p>
                    <div className="flex flex-wrap gap-1">
                      {['Programmatic', 'Paid Search', 'Paid Social', 'Organic'].map((filter) => (
                        <Button 
                          key={filter}
                          variant={activeFilters.includes(filter) ? "default" : "outline"} 
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => toggleActiveFilter(filter)}
                        >
                          {filter}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-500 hover:text-slate-700"
                      onClick={handleDownloadClick}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-6 w-6 text-slate-500 hover:text-slate-700 ${showFilters ? 'bg-slate-100' : ''}`}
                      onClick={toggleFilter}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-500 hover:text-slate-700"
                      onClick={handleBarChartClick}
                    >
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