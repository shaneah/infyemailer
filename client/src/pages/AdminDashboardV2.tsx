import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Filter, ChevronDown, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Admin Dashboard component that matches the screenshot exactly
export default function AdminDashboardV2() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('Jan 1, 2023 - Mar 31, 2023');
  const [dateRanges] = useState([
    "Last 7 days",
    "Last 30 days",
    "This month",
    "Last month",
    "This quarter",
    "Jan 1, 2023 - Mar 31, 2023",
    "Custom range..."
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Channel Performance Trend chart data
  const trendData = [
    { month: 'Jan', programmatic: 4.5, paidSearch: 3.5, paidSocial: 3.0, organic: 1.0 },
    { month: 'Feb', programmatic: 5.0, paidSearch: 4.0, paidSocial: 3.5, organic: 1.1 },
    { month: 'Mar', programmatic: 5.5, paidSearch: 4.5, paidSocial: 4.0, organic: 1.2 },
    { month: 'Apr', programmatic: 6.0, paidSearch: 5.0, paidSocial: 4.5, organic: 1.3 },
    { month: 'May', programmatic: 6.5, paidSearch: 5.5, paidSocial: 3.8, organic: 1.4 },
    { month: 'Jun', programmatic: 7.0, paidSearch: 6.0, paidSocial: 3.5, organic: 1.5 },
    { month: 'Jul', programmatic: 7.5, paidSearch: 6.5, paidSocial: 3.2, organic: 1.6 },
    { month: 'Aug', programmatic: 8.0, paidSearch: 7.0, paidSocial: 3.0, organic: 1.7 },
    { month: 'Sep', programmatic: 9.5, paidSearch: 6.0, paidSocial: 3.7, organic: 0.8 },
    { month: 'Oct', programmatic: 8.0, paidSearch: 8.0, paidSocial: 4.3, organic: 0.9 },
    { month: 'Nov', programmatic: 6.5, paidSearch: 9.5, paidSocial: 3.5, organic: 1.0 },
    { month: 'Dec', programmatic: 7.2, paidSearch: 8.2, paidSocial: 3.0, organic: 1.0 },
  ];

  // Channel Performance Table Data
  const channelPerformanceData = [
    { channel: 'Programmatic', impressions: '34.7K', percentChange: '-4.2%', ctr: '10.44%', ctrChange: '1.5%' },
    { channel: 'Paid Search', impressions: '31.4K', percentChange: '30.7%', ctr: '10.57%', ctrChange: '3.1%' },
    { channel: 'Paid Social', impressions: '11.4K', percentChange: '-25.6%', ctr: '10.28%', ctrChange: '-4.1%' },
    { channel: 'Organic', impressions: '11.5K', percentChange: '-8.0%', ctr: '10.6%', ctrChange: '-0.4%' },
  ];

  // Data Source Performance Table
  const dataSourcePerformanceData = [
    { source: 'Amazon Ad Server (Sizmek Ad Suite)', impressions: '5.8K', percentChange: '201.0%', ctr: '10.17%', ctrChange: '-10.0%' },
    { source: 'StackAdapt', impressions: '4.8K', percentChange: '68.7%', ctr: '10%', ctrChange: '-7.3%' },
    { source: 'LinkedIn Ads', impressions: '5.8K', percentChange: '-', ctr: '10.09%', ctrChange: '-' },
    { source: 'Facebook', impressions: '5.7K', percentChange: '92.0%', ctr: '10.82%', ctrChange: '14.3%' },
    { source: 'Google Display & Video 360', impressions: '4.7K', percentChange: '65.2%', ctr: '10.28%', ctrChange: '-5.8%' },
    { source: 'Bing Ads (Microsoft Advertising)', impressions: '4.8K', percentChange: '3.7%', ctr: '10.7%', ctrChange: '-1.8%' },
  ];
  
  // Sparkline component for metrics cards
  const Sparkline = ({ data, color = "#a855f7", height = 28 }: { data: number[], color?: string, height?: number }) => {
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

  // Handlers for UI interactions
  const handleDateRangeSelect = (range: string) => {
    setDateRange(range);
    setShowDatePicker(false);
    toast({
      title: "Date range updated",
      description: `Date range has been set to ${range}`,
      variant: "default",
    });
  };

  const handleActionClick = (action: string) => {
    toast({
      title: action,
      description: `${action} action was triggered`,
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

  // Component for the toolbar actions (download, filter, view toggles)
  const TableActions = ({ onDownload }: { onDownload: () => void }) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 border-gray-200"
        onClick={onDownload}
      >
        <Download className="h-4 w-4 text-gray-500" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 border-gray-200"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="h-4 w-4 text-gray-500" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2 border-gray-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
          <path d="M9 21L9 9" stroke="currentColor" strokeWidth="2" />
        </svg>
      </Button>
    </div>
  );

  // Component for the metrics card
  const MetricCard = ({ 
    title, 
    value, 
    change, 
    sparklineData, 
    prefix = '$', 
    suffix = 'K',
    showPrefix = true,
    color = 'indigo'
  }: { 
    title: string, 
    value: string, 
    change: string, 
    sparklineData: number[],
    prefix?: string,
    suffix?: string,
    showPrefix?: boolean,
    color?: string
  }) => {
    const isPositive = !change.includes('-');
    const colorMap: Record<string, {line: string, bg: string, text: string}> = {
      'indigo': {line: '#6366f1', bg: '#e0e7ff', text: '#4f46e5'},
      'purple': {line: '#a855f7', bg: '#f3e8ff', text: '#9333ea'},
      'blue': {line: '#3b82f6', bg: '#dbeafe', text: '#2563eb'},
      'green': {line: '#22c55e', bg: '#dcfce7', text: '#16a34a'},
    };
    
    const colors = colorMap[color] || colorMap.indigo;
    
    return (
      <Card className="shadow-sm border border-gray-200 rounded-md overflow-hidden">
        <CardContent className="p-6">
          <div className="text-sm text-gray-500 font-medium mb-1">{title}</div>
          <div className="flex items-baseline space-x-1 mb-1">
            {showPrefix && <span className="text-2xl font-semibold">{prefix}</span>}
            <span className="text-3xl font-bold">{value}</span>
            {suffix && <span className="text-xl text-gray-500">{suffix}</span>}
          </div>
          <div className="flex items-center">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
              {isPositive ? '+' : ''}{change}
            </span>
          </div>
          <div className="mt-2">
            <Sparkline data={sparklineData} color={colors.line} />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get user type first
  const { data: userData } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    }
  });

  // Get campaigns based on user type
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<any[]>({
    queryKey: ['/api/campaigns', userData?.role],
    queryFn: async () => {
      // If user is admin, use admin endpoint
      if (userData?.role === 'admin') {
        const response = await fetch('/api/admin/campaigns', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch admin campaigns');
        }
        return response.json();
      }
      
      // Otherwise use client endpoint
      const response = await fetch('/api/campaigns', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch client campaigns');
      }
      return response.json();
    },
    enabled: !!userData, // Only run query when we have user data
    initialData: [],
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 5,
    refetchOnMount: true,
    refetchInterval: 60000,
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar (left column) */}
        <div className="w-64 bg-white border-r border-gray-200 h-screen flex-shrink-0 fixed">
          <div className="p-6">
            <div className="flex items-center mb-1">
              <h1 className="text-xl font-bold">Infinity Tech</h1>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Demo Client
            </div>
          </div>
        
          <div className="px-3 py-4">
            <div className="mb-6">
              <h2 className="uppercase text-xs font-semibold text-gray-500 tracking-wider px-3 mb-2">OVERVIEW</h2>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('dashboard')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Dashboard
              </div>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'emailPerformance' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('emailPerformance')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Performance
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="uppercase text-xs font-semibold text-gray-500 tracking-wider px-3 mb-2">CAMPAIGNS</h2>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'campaigns' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('campaigns')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Campaigns
              </div>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'templates' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('templates')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Templates
              </div>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'abTesting' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('abTesting')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                A/B Testing
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="uppercase text-xs font-semibold text-gray-500 tracking-wider px-3 mb-2">AUDIENCE</h2>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'contacts' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('contacts')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Contacts
              </div>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'lists' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('lists')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Lists
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="uppercase text-xs font-semibold text-gray-500 tracking-wider px-3 mb-2">INFRASTRUCTURE</h2>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'domains' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('domains')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Domains
              </div>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'emailValidation' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('emailValidation')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Email Validation
              </div>
            </div>

            <div className="mb-6">
              <h2 className="uppercase text-xs font-semibold text-gray-500 tracking-wider px-3 mb-2">SYSTEM</h2>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('security')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Security
              </div>
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'billing' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('billing')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Billing & Credits
              </div>
            </div>

            <div className="mt-auto pt-6">
              <div 
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'accountSettings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}
                onClick={() => setActiveTab('accountSettings')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Account Settings
              </div>
              <div 
                className={`flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer`}
                onClick={() => handleActionClick('Logged out')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </div>
            </div>
          </div>
        </div>

        {/* Main content area (right side) */}
        <div className="ml-64 flex-1 min-h-screen">
          {/* Top filter bar */}
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={`h-8 px-3 ${showDatePicker ? 'border-blue-500 text-blue-600' : 'border-gray-200 text-gray-700'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDatePicker(!showDatePicker);
                  setShowFilters(false);
                }}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{dateRange}</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </div>
              </Button>
              
              {showDatePicker && (
                <div className="absolute top-16 left-4 bg-white rounded-md shadow-lg border border-gray-200 z-50 w-64">
                  <div className="p-2">
                    {dateRanges.map((range) => (
                      <div
                        key={range}
                        className="px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer text-sm"
                        onClick={() => handleDateRangeSelect(range)}
                      >
                        {range}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500 mr-2">Data Source:</div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 border-gray-200 bg-gray-50 font-medium"
              >
                Original
              </Button>
              
              <div className="text-sm text-gray-500 mx-2">Campaign:</div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 border-gray-200 bg-gray-50 font-medium"
              >
                All Campaigns
              </Button>
              
              <div className="text-sm text-gray-500 mx-2">Ad Set:</div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 border-gray-200 bg-gray-50 font-medium"
              >
                All Sets
              </Button>
            </div>
          </div>

          {/* Main dashboard content */}
          <div className="p-6">
            {/* Top metrics cards */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <MetricCard 
                title="Spend" 
                value="3.6" 
                change="+0.92K" 
                sparklineData={[3.1, 3.2, 3.3, 3.4, 3.5, 3.6]}
                color="indigo"
              />
              <MetricCard 
                title="CPM" 
                value="40.5" 
                change="+1.28K" 
                sparklineData={[36, 37, 38, 39, 40, 40.5]}
                color="indigo"
              />
              <MetricCard 
                title="CTR" 
                value="4.2" 
                change="+0.08%" 
                sparklineData={[3.7, 3.8, 3.9, 4.0, 4.1, 4.2]}
                prefix=''
                suffix="%"
                showPrefix={false}
                color="purple"
              />
              <MetricCard 
                title="CPC" 
                value="0.4" 
                change="-$0.04" 
                sparklineData={[0.5, 0.48, 0.45, 0.43, 0.41, 0.4]}
                suffix=""
                color="indigo"
              />
            </div>

            {/* Secondary metrics */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <MetricCard 
                title="Video Views" 
                value="9.3" 
                change="+0.8K" 
                sparklineData={[8.5, 8.7, 8.9, 9.0, 9.1, 9.3]}
                prefix=""
                color="purple"
              />
              <MetricCard 
                title="Impressions" 
                value="25.4" 
                change="+2.7K" 
                sparklineData={[22, 22.5, 23, 24, 24.5, 25.4]}
                prefix=""
                color="purple"
              />
              <MetricCard 
                title="Conversions" 
                value="512" 
                change="+36.0" 
                sparklineData={[470, 480, 490, 500, 505, 512]}
                prefix=""
                suffix=""
                color="purple"
              />
              <MetricCard 
                title="Conversion Rate" 
                value="2.12" 
                change="+0.2%" 
                sparklineData={[1.9, 1.95, 2.0, 2.05, 2.1, 2.12]}
                prefix=""
                suffix="%"
                color="purple"
              />
            </div>

            {/* Performance Tables */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Channel Performance */}
              <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-sm font-bold">C</span>
                    </div>
                    <h3 className="font-medium">Channel Performance</h3>
                  </div>
                  <TableActions onDownload={() => handleActionClick('Downloaded channel data')} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Channel</th>
                        <th className="px-6 py-3">Impressions</th>
                        <th className="px-6 py-3">% Δ</th>
                        <th className="px-6 py-3">CTR</th>
                        <th className="px-6 py-3">% Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {channelPerformanceData.map((channel, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {channel.channel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {channel.impressions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-block ${channel.percentChange.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                              {channel.percentChange}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {channel.ctr}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-block ${channel.ctrChange.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                              {channel.ctrChange}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Data Source Performance */}
              <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-sm font-bold">D</span>
                    </div>
                    <h3 className="font-medium">Data Source Performance</h3>
                  </div>
                  <TableActions onDownload={() => handleActionClick('Downloaded source data')} />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Source</th>
                        <th className="px-6 py-3">Impressions</th>
                        <th className="px-6 py-3">% Δ</th>
                        <th className="px-6 py-3">CTR</th>
                        <th className="px-6 py-3">% Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {dataSourcePerformanceData.map((source, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {source.source}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {source.impressions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-block ${
                              source.percentChange === '-' ? 'text-gray-500' : 
                              source.percentChange.includes('-') ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {source.percentChange}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {source.ctr}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-block ${
                              source.ctrChange === '-' ? 'text-gray-500' : 
                              source.ctrChange.includes('-') ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {source.ctrChange}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Channel Performance Trend Chart */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden mb-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <h3 className="font-medium">Channel Performance Trend</h3>
                </div>
                <TableActions onDownload={() => handleActionClick('Downloaded trend data')} />
              </div>
              <div className="p-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(value) => `${value}M`}
                      />
                      <RechartsTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-gray-900 p-3 shadow-lg rounded-md text-white">
                                <div className="font-semibold mb-1">{label}</div>
                                {payload.map((entry, index) => (
                                  <div key={`item-${index}`} className="flex items-center text-sm">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-2" 
                                      style={{ backgroundColor: entry.color }} 
                                    />
                                    <span className="capitalize">{entry.name}: </span>
                                    <span className="ml-1 font-medium">{entry.value}M</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="top"
                        align="left"
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ paddingBottom: 20 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="programmatic"
                        name="Programmatic"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="paidSearch"
                        name="Paid Search"
                        stroke="#ec4899"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="paidSocial"
                        name="Paid Social"
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="organic"
                        name="Organic"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}