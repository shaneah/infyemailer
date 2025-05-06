import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, BarChart, Calendar, ChevronDown, Database, Download, Filter, Menu, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
} from 'recharts';

// Admin Dashboard component
export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('Jan 1, 2023 - Mar 31, 2023');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRanges] = useState([
    "Last 7 days",
    "Last 30 days",
    "This month",
    "Last month",
    "This quarter",
    "Jan 1, 2023 - Mar 31, 2023",
    "Custom range..."
  ]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Top metrics data
  const topMetricsData = {
    spend: {
      value: '3.6',
      change: '+0.2',
      sparklineData: [3, 4, 3.5, 5, 4, 3, 3.6],
    },
    cpm: {
      value: '40.5',
      change: '+1.2',
      sparklineData: [30, 35, 38, 40, 39, 42, 40.5],
    },
    ctr: {
      value: '4.2',
      change: '+0.8',
      sparklineData: [3.1, 3.5, 3.8, 4.0, 4.1, 4.1, 4.2],
    },
    cpc: {
      value: '0.4',
      change: '-0.04',
      sparklineData: [0.5, 0.48, 0.46, 0.45, 0.42, 0.41, 0.4],
    },
  };

  // Secondary metrics data
  const secondaryMetricsData = {
    videoViews: {
      value: '9.3',
      change: '+0.6',
      sparklineData: [8.1, 8.5, 8.8, 8.9, 9.0, 9.2, 9.3],
    },
    impressions: {
      value: '25.4',
      change: '+2.9',
      sparklineData: [20, 21, 22, 23, 24, 25, 25.4],
    },
    conversions: {
      value: '512',
      change: '+85',
      sparklineData: [400, 425, 445, 465, 480, 500, 512],
    },
    conversionRate: {
      value: '2.12',
      change: '+0.2',
      sparklineData: [1.8, 1.85, 1.9, 1.95, 2.0, 2.05, 2.12],
    },
  };

  // Channel Performance Table Data
  const channelPerformanceData = [
    { channel: 'Programmatic', impressions: '34.7K', change: '+4.2%', ctr: '10.64%', changePercent: '+3.1%' },
    { channel: 'Paid Search', impressions: '31.4K', change: '+0.7%', ctr: '10.57%', changePercent: '+3.1%' },
    { channel: 'Paid Social', impressions: '11.4K', change: '-18.6%', ctr: '10.28%', changePercent: '-4.1%' },
    { channel: 'Organic', impressions: '11.5K', change: '-8.0%', ctr: '10.6%', changePercent: '-0.4%' },
  ];

  // Data Source Performance Table
  const dataSourcePerformanceData = [
    { source: 'Amazon Ad Server (Sizmek Ad Suite)', impressions: '5.8K', change: '201.0%', ctr: '10.17%', changePercent: '+10.0%' },
    { source: 'StackAdapt', impressions: '4.8K', change: '68.7%', ctr: '10%', changePercent: '-2.3%' },
    { source: 'LinkedIn Ads', impressions: '5.8K', change: '-', ctr: '10.99%', changePercent: '-' },
    { source: 'Facebook', impressions: '5.7K', change: '92.0%', ctr: '10.82%', changePercent: '+4.3%' },
    { source: 'Google Display & Video 360', impressions: '4.7K', change: '65.2%', ctr: '10.28%', changePercent: '-5.8%' },
    { source: 'Bing Ads (Microsoft Advertising)', impressions: '4.8K', change: '3.7%', ctr: '10.7%', changePercent: '-1.8%' },
  ];

  // Monthly Trend Data
  const monthlyTrendData = [
    { month: 'Jan', programmatic: 3.0, paidSearch: 1.8, paidSocial: 2.3, organic: 0.9 },
    { month: 'Feb', programmatic: 5.0, paidSearch: 2.5, paidSocial: 4.0, organic: 1.1 },
    { month: 'Mar', programmatic: 4.5, paidSearch: 3.0, paidSocial: 2.8, organic: 1.2 },
    { month: 'Apr', programmatic: 6.0, paidSearch: 5.0, paidSocial: 3.1, organic: 1.5 },
    { month: 'May', programmatic: 5.5, paidSearch: 4.3, paidSocial: 2.0, organic: 1.7 },
    { month: 'Jun', programmatic: 7.5, paidSearch: 3.8, paidSocial: 3.5, organic: 2.0 },
    { month: 'Jul', programmatic: 8.0, paidSearch: 5.2, paidSocial: 4.5, organic: 2.2 },
    { month: 'Aug', programmatic: 7.0, paidSearch: 5.8, paidSocial: 5.0, organic: 2.5 },
    { month: 'Sep', programmatic: 9.0, paidSearch: 7.0, paidSocial: 3.0, organic: 1.8 },
    { month: 'Oct', programmatic: 8.5, paidSearch: 6.5, paidSocial: 2.8, organic: 1.5 },
    { month: 'Nov', programmatic: 6.4, paidSearch: 7.5, paidSocial: 2.5, organic: 1.3 },
    { month: 'Dec', programmatic: 7.0, paidSearch: 4.0, paidSocial: 2.0, organic: 1.5 }
  ];

  // Various UI interaction handlers
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Download clicked");
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
  
  // Handle filter functionality
  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFilters(!showFilters);
    // Close date picker when opening filter panel
    if (!showFilters) {
      setShowDatePicker(false);
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
    const handleClickOutside = () => {
      setShowFilters(false);
      setShowDatePicker(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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

  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 w-64 flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static h-full z-30`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Infinity Tech</h2>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
              Admin
            </Badge>
          </div>
          <div className="mt-2 text-sm text-gray-500">Demo Client</div>
        </div>

        <Separator />

        {/* Sidebar Navigation */}
        <div className="p-4">
          <p className="uppercase text-xs font-medium text-gray-500 mb-3">Overview</p>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} mb-1 cursor-pointer`} onClick={() => setActiveTab('dashboard')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" className={activeTab === 'dashboard' ? 'fill-indigo-700' : 'fill-gray-700'} />
                <rect x="14" y="3" width="7" height="7" rx="1" className={activeTab === 'dashboard' ? 'fill-indigo-700' : 'fill-gray-700'} />
                <rect x="3" y="14" width="7" height="7" rx="1" className={activeTab === 'dashboard' ? 'fill-indigo-700' : 'fill-gray-700'} />
                <rect x="14" y="14" width="7" height="7" rx="1" className={activeTab === 'dashboard' ? 'fill-indigo-700' : 'fill-gray-700'} />
              </svg>
            </div>
            <span>Dashboard</span>
          </div>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'emailPerformance' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`} onClick={() => setActiveTab('emailPerformance')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" 
                  stroke={activeTab === 'emailPerformance' ? 'currentColor' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Email Performance</span>
          </div>
        </div>

        <Separator />

        <div className="p-4">
          <p className="uppercase text-xs font-medium text-gray-500 mb-3">Campaigns</p>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'campaigns' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} mb-1 cursor-pointer`} onClick={() => setActiveTab('campaigns')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3V7M8 3V7M3 11H21" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Campaigns</span>
          </div>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'templates' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} mb-1 cursor-pointer`} onClick={() => setActiveTab('templates')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 21V8L12 3L20 8V21H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Templates</span>
          </div>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'abTesting' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`} onClick={() => setActiveTab('abTesting')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>A/B Testing</span>
          </div>
        </div>

        <Separator />

        <div className="p-4">
          <p className="uppercase text-xs font-medium text-gray-500 mb-3">Audience</p>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'contacts' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} mb-1 cursor-pointer`} onClick={() => setActiveTab('contacts')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Contacts</span>
          </div>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'lists' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`} onClick={() => setActiveTab('lists')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Lists</span>
          </div>
        </div>

        <Separator />

        <div className="p-4">
          <p className="uppercase text-xs font-medium text-gray-500 mb-3">Infrastructure</p>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'domains' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} mb-1 cursor-pointer`} onClick={() => setActiveTab('domains')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Domains</span>
          </div>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'emailValidation' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`} onClick={() => setActiveTab('emailValidation')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Email Validation</span>
          </div>
        </div>

        <Separator />

        <div className="p-4">
          <p className="uppercase text-xs font-medium text-gray-500 mb-3">System</p>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} mb-1 cursor-pointer`} onClick={() => setActiveTab('security')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Security</span>
          </div>
          <div className={`flex items-center p-2 rounded-md ${activeTab === 'billing' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`} onClick={() => setActiveTab('billing')}>
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Billing & Credits</span>
          </div>
        </div>

        <div className="p-4 mt-auto">
          <div className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">
            <div className="w-5 h-5 mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Logout</span>
          </div>
        </div>
      </div>

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

                {/* Global search bar */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search..." 
                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white w-[200px] md:w-[300px]"
                  />
                </div>
                
                {/* Filter dropdowns - hidden on small screens*/}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="relative bg-gray-100 rounded-md border border-gray-200 px-3 py-1.5 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">Data Source</span>
                      <span className="text-gray-800 font-medium">Original</span>
                    </div>
                  </div>
                  
                  <div className="relative bg-gray-100 rounded-md border border-gray-200 px-3 py-1.5 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">Campaign</span>
                      <span className="text-gray-800 font-medium">All Campaigns</span>
                    </div>
                  </div>
                  
                  <div className="relative bg-gray-100 rounded-md border border-gray-200 px-3 py-1.5 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">Ad Set</span>
                      <span className="text-gray-800 font-medium">All Sets</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Date range selector */}
              <div className="relative">
                <div 
                  className="bg-gray-100 rounded-md border border-gray-200 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={toggleDatePicker}
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-gray-800 font-medium">{dateRange}</span>
                    <ChevronDown className="h-3 w-3 ml-2 text-gray-500" />
                  </div>
                </div>
                
                {showDatePicker && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1">
                    {dateRanges.map((range) => (
                      <div 
                        key={range}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleDateRangeSelect(range)}
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
                      <h3 className="text-slate-900 text-2xl font-bold">${topMetricsData.spend.value}K</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> ${topMetricsData.spend.change}K
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={topMetricsData.spend.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* CPM */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">CPM</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">${topMetricsData.cpm.value}</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> ${topMetricsData.cpm.change}
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={topMetricsData.cpm.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* CTR */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">CTR</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">{topMetricsData.ctr.value}%</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {topMetricsData.ctr.change}%
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={topMetricsData.ctr.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* CPC */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">CPC</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">${topMetricsData.cpc.value}</h3>
                      <span className="ml-2 flex items-center text-xs text-red-600">
                        <ArrowDown className="h-3 w-3 mr-0.5" /> ${Math.abs(parseFloat(topMetricsData.cpc.change))}
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={topMetricsData.cpc.sparklineData} color="#7c3aed" />
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
                      <h3 className="text-slate-900 text-2xl font-bold">{secondaryMetricsData.videoViews.value}K</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {secondaryMetricsData.videoViews.change}K
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={secondaryMetricsData.videoViews.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* Impressions */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Impressions</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">{secondaryMetricsData.impressions.value}K</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {secondaryMetricsData.impressions.change}K
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={secondaryMetricsData.impressions.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* Conversions */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Conversions</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">{secondaryMetricsData.conversions.value}</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {secondaryMetricsData.conversions.change}
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={secondaryMetricsData.conversions.sparklineData} color="#7c3aed" />
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Conversion Rate</p>
                    <div className="flex items-baseline">
                      <h3 className="text-slate-900 text-2xl font-bold">{secondaryMetricsData.conversionRate.value}%</h3>
                      <span className="ml-2 flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-0.5" /> {secondaryMetricsData.conversionRate.change}%
                      </span>
                    </div>
                  </div>
                </div>
                <Sparkline data={secondaryMetricsData.conversionRate.sparklineData} color="#7c3aed" />
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
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Button>
                </div>
              </div>
              {showFilters && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-100 rounded-md">
                  <p className="mb-1 text-xs font-medium text-gray-500">Filter by channel:</p>
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
        </div>
      </div>
    </div>
  );
}