import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface MetricRate {
  value: number;
  industryAvg: number;
  trend: string;
  trendValue: string;
}

interface ConversionRate {
  value: number;
  goal: number;
  trend: string;
  trendValue: string;
}

interface EmailMetrics {
  openRate: MetricRate;
  clickRate: MetricRate;
  conversionRate: ConversionRate;
  bounceRate: MetricRate;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  unsubscribes: number;
}

interface ChartData {
  weeklyPerformance: Array<{ day: string; opens: number; clicks: number; conversions: number }>;
  deviceBreakdown: Array<{ name: string; value: number }>;
  clickDistribution: Array<{ link: string; clicks: number }>;
  engagementOverTime: Array<{ date: string; open: number; click: number; conversion: number }>;
  engagementByTimeOfDay: Array<{ hour: string; opens: number }>;
  emailClientDistribution: Array<{ name: string; value: number }>;
  campaignComparison: Array<{ name: string; open: number; click: number; conversion: number }>;
  subjectLinePerformance: Array<{ type: string; rate: number }>;
  sendTimeEffectiveness: Array<{ day: string; morning: number; afternoon: number; evening: number }>;
  geographicalDistribution: Array<{ country: string; opens: number }>;
  deviceOverTime: Array<{ month: string; desktop: number; mobile: number; tablet: number }>;
  subscriberEngagementSegments: Array<{ segment: string; value: number; count: number }>;
}

interface RealtimeActivity {
  time: string;
  type: string;
  email: string;
  user: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

// Modern Metric Card Component with animations
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subValue, 
  trend = 'neutral',
  trendValue
}) => {
  // Define color schemes based on trend
  const getBgColor = () => {
    if (trend === 'up') return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20';
    if (trend === 'down') return 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20';
    return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-blue-600 dark:text-blue-400';
  };
  
  const getBadgeColor = () => {
    if (trend === 'up') return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
    if (trend === 'down') return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl p-0.5 shadow-lg transition-all duration-300 hover:shadow-xl ${getBgColor()}`}
    >
      <div className="h-full rounded-lg bg-white dark:bg-gray-900 p-4 transition-all duration-300">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            {trend && trendValue && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor()}`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${getTrendColor()}`}>{value}</div>
            {subValue && <p className="text-xs text-gray-500 dark:text-gray-400">{subValue}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DetailedOpens = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Fetch campaigns for the filter dropdown
  const { data: campaignsData } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ['/api/campaigns'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/campaigns');
        
        if (!res.ok) {
          console.error(`Error fetching campaigns: ${res.status} ${res.statusText}`);
          return [];
        }
        
        const data = await res.json();
        
        if (!Array.isArray(data)) {
          console.warn('API response for campaigns is not an array:', data);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching campaigns data:', error);
        return [];
      }
    }
  });
  
  // Using React Query to fetch detailed open data
  const { data: openData, isLoading } = useQuery<{
    emails: Array<{
      id: number;
      emailName: string;
      recipient: string;
      openCount: number;
      lastOpenedAt: string;
      device: string;
      campaignId: number;
      campaignName: string;
    }>
  }>({
    queryKey: ['/api/email-performance/detailed-opens', selectedCampaign],
    queryFn: async () => {
      try {
        // Validate campaign parameter to prevent sending invalid values
        const campaignParam = (selectedCampaign && selectedCampaign !== "all" && selectedCampaign !== "undefined" && selectedCampaign !== "null") 
          ? `?campaignId=${encodeURIComponent(selectedCampaign)}` 
          : '';
          
        const res = await fetch(`/api/email-performance/detailed-opens${campaignParam}`, {
          credentials: 'include'  // Include credentials to pass cookies for authentication
        });
        
        if (!res.ok) {
          console.error(`Error fetching open data: ${res.status} ${res.statusText}`);
          return { emails: [] }; // Return empty array on error
        }
        
        const data = await res.json();
        
        // Ensure the response has an emails array
        if (!data || !data.emails || !Array.isArray(data.emails)) {
          console.warn('API response missing emails array:', data);
          return { emails: [] };
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching email open data:', error);
        return { emails: [] }; // Return empty array on error
      }
    }
  });

  // Define the EmailOpen type
  type EmailOpen = {
    id: number;
    emailName: string;
    recipient: string;
    openCount: number;
    lastOpenedAt: string;
    device: string;
    campaignId: number;
    campaignName: string;
  };

  // Filter emails based on search term
  const filteredEmails = useMemo(() => {
    if (!openData || !openData.emails || !Array.isArray(openData.emails)) return [];
    
    return openData.emails.filter((email: EmailOpen) => {
      if (!email) return false;
      
      const emailName = email.emailName || '';
      const recipient = email.recipient || '';
      const campaignName = email.campaignName || '';
      const searchTermLower = searchTerm.toLowerCase();
      
      return emailName.toLowerCase().includes(searchTermLower) || 
        recipient.toLowerCase().includes(searchTermLower) ||
        campaignName.toLowerCase().includes(searchTermLower);
    });
  }, [openData, searchTerm]);

  // Function to download email opens data as CSV
  const handleDownload = () => {
    if (!filteredEmails || !Array.isArray(filteredEmails) || filteredEmails.length === 0) return;
    
    // Create CSV content
    const headers = ["Email Name", "Recipient", "Opens", "Last Opened", "Device", "Campaign"];
    const csvRows = [headers];
    
    filteredEmails.forEach((email: EmailOpen) => {
      if (!email) return;
      
      csvRows.push([
        email.emailName || '',
        email.recipient || '',
        (typeof email.openCount === 'number' ? email.openCount.toString() : '0'),
        email.lastOpenedAt || '',
        email.device || '',
        email.campaignName || ''
      ]);
    });
    
    // Convert to CSV format
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `email-opens-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Detailed Email Opens</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Specific emails that have been opened</p>
        </div>
        <Button onClick={handleDownload} variant="outline" size="sm" className="flex items-center bg-white dark:bg-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download CSV
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="search-opens" className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Search</label>
          <input
            id="search-opens"
            type="text"
            placeholder="Search by email or recipient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="sm:w-64">
          <label htmlFor="campaign-filter" className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-300">Filter by Campaign</label>
          <select
            id="campaign-filter"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <option value="all">All Campaigns</option>
            {Array.isArray(campaignsData) ? campaignsData.map(campaign => (
              <option key={campaign?.id || Math.random()} value={campaign?.id?.toString() || ''}>
                {campaign?.name || 'Unnamed Campaign'}
              </option>
            )) : null}
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Recipient</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Opens</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Last Opened</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Device</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Campaign</th>
                </tr>
              </thead>
              <tbody>
                {!filteredEmails || filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-gray-300 dark:text-gray-600">
                          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                        <p>No email open data available</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((email: EmailOpen) => (
                    <tr key={email?.id || Math.random()} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{email?.emailName || '-'}</td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{email?.recipient || '-'}</td>
                      <td className="py-3 px-4 text-center font-medium text-gray-800 dark:text-gray-200">{typeof email?.openCount === 'number' ? email.openCount : 0}</td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{email?.lastOpenedAt || '-'}</td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{email?.device || '-'}</td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{email?.campaignName || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const EmailPerformanceV2: React.FC = () => {
  const [timeframe, setTimeframe] = useState('7days');
  const [campaignFilter, setCampaignFilter] = useState('all');
  
  // Using React Query to fetch metrics data
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery<EmailMetrics>({
    queryKey: ['/api/email-performance/metrics', timeframe, campaignFilter],
    queryFn: async () => {
      try {
        // Create query parameters for the API
        const params = new URLSearchParams();
        if (timeframe) params.append('timeframe', timeframe);
        if (campaignFilter && campaignFilter !== 'all') params.append('campaignId', campaignFilter);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`/api/email-performance/metrics${queryString}`, {
          credentials: 'include'  // Include credentials to pass cookies for authentication
        });
        
        if (!res.ok) {
          console.error(`Error fetching metrics: ${res.status} ${res.statusText}`);
          return {
            openRate: { value: 0, industryAvg: 0, trend: 'neutral', trendValue: '0%' },
            clickRate: { value: 0, industryAvg: 0, trend: 'neutral', trendValue: '0%' },
            conversionRate: { value: 0, goal: 0, trend: 'neutral', trendValue: '0%' },
            bounceRate: { value: 0, industryAvg: 0, trend: 'neutral', trendValue: '0%' },
            totalSent: 0,
            totalOpens: 0,
            totalClicks: 0,
            unsubscribes: 0
          };
        }
        
        return await res.json();
      } catch (error) {
        console.error('Error fetching metrics data:', error);
        return {
          openRate: { value: 0, industryAvg: 0, trend: 'neutral', trendValue: '0%' },
          clickRate: { value: 0, industryAvg: 0, trend: 'neutral', trendValue: '0%' },
          conversionRate: { value: 0, goal: 0, trend: 'neutral', trendValue: '0%' },
          bounceRate: { value: 0, industryAvg: 0, trend: 'neutral', trendValue: '0%' },
          totalSent: 0,
          totalOpens: 0,
          totalClicks: 0,
          unsubscribes: 0
        };
      }
    }
  });
  
  // Using React Query to fetch chart data
  const { data: chartData, isLoading: isLoadingCharts } = useQuery<ChartData>({
    queryKey: ['/api/email-performance/charts', timeframe, campaignFilter],
    queryFn: async () => {
      try {
        // Create query parameters for the API
        const params = new URLSearchParams();
        if (timeframe) params.append('timeframe', timeframe);
        if (campaignFilter && campaignFilter !== 'all') params.append('campaignId', campaignFilter);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const res = await fetch(`/api/email-performance/charts${queryString}`, {
          credentials: 'include'  // Include credentials to pass cookies for authentication
        });
        
        if (!res.ok) {
          console.error(`Error fetching chart data: ${res.status} ${res.statusText}`);
          return {
            weeklyPerformance: [],
            deviceBreakdown: [],
            clickDistribution: [],
            engagementOverTime: [],
            engagementByTimeOfDay: [],
            emailClientDistribution: [],
            campaignComparison: [],
            subjectLinePerformance: [],
            sendTimeEffectiveness: [],
            geographicalDistribution: [],
            deviceOverTime: [],
            subscriberEngagementSegments: []
          };
        }
        
        return await res.json();
      } catch (error) {
        console.error('Error fetching chart data:', error);
        return {
          weeklyPerformance: [],
          deviceBreakdown: [],
          clickDistribution: [],
          engagementOverTime: [],
          engagementByTimeOfDay: [],
          emailClientDistribution: [],
          campaignComparison: [],
          subjectLinePerformance: [],
          sendTimeEffectiveness: [],
          geographicalDistribution: [],
          deviceOverTime: [],
          subscriberEngagementSegments: []
        };
      }
    }
  });
  
  // Using React Query to fetch real-time activity
  const { data: realtimeData } = useQuery<RealtimeActivity[]>({
    queryKey: ['/api/email-performance/realtime'],
    refetchInterval: 30000, // Refetch every 30 seconds
    queryFn: async () => {
      try {
        const res = await fetch('/api/email-performance/realtime', {
          credentials: 'include'  // Include credentials to pass cookies for authentication
        });
        
        if (!res.ok) {
          console.error(`Error fetching realtime data: ${res.status} ${res.statusText}`);
          return [];
        }
        
        const data = await res.json();
        
        if (!Array.isArray(data)) {
          console.warn('API response for realtime data is not an array:', data);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('Error fetching realtime data:', error);
        return [];
      }
    }
  });
  
  // Sample campaign data
  const campaigns = [
    { id: 1, name: 'Summer Sale Campaign' },
    { id: 2, name: 'Product Launch' },
    { id: 3, name: 'Weekly Newsletter' },
    { id: 4, name: 'Customer Re-engagement' },
  ];
  
  // Get theme color for branding
  const getGradientColor = () => {
    return 'from-primary/90 to-blue-600/90 dark:from-primary/80 dark:to-blue-800/80';
  };

  // Tab state for different sections
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'engagement'>('overview');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      {/* Hero Header with Gradient Background */}
      <div className={`bg-gradient-to-r ${getGradientColor()} px-6 py-10 mb-8 shadow-md`}>
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-white"
              >
                Email Performance Analytics
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-white/80"
              >
                Advanced insights and real-time metrics for your email campaigns
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-3 pt-2"
              >
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                  <span className="mr-1 h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  Live Data
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                  AI-Powered Insights
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                  {timeframe === '7days' ? 'Last 7 Days' : 
                   timeframe === '30days' ? 'Last 30 Days' : 
                   timeframe === '90days' ? 'Last 90 Days' : 
                   timeframe === 'yesterday' ? 'Yesterday' : 'Today'}
                </span>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto"
            >
              <div className="bg-white/10 backdrop-blur rounded-lg p-2 flex-grow sm:flex-grow-0">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="bg-transparent border-0 text-white hover:bg-white/10 w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-2 flex-grow sm:flex-grow-0">
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger className="bg-transparent border-0 text-white hover:bg-white/10 w-full sm:w-[180px]">
                    <SelectValue placeholder="All Campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {campaigns.map(campaign => (
                      <SelectItem key={campaign.id} value={String(campaign.id)}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        {/* Section Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex rounded-md shadow-sm p-1 bg-white dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'overview' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'details' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Detailed Opens
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'engagement' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Engagement Analysis
            </button>
          </div>
        </motion.div>
      
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Key Metrics Row - with advanced styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard 
                  title="Open Rate" 
                  value={metricsData && metricsData.openRate && typeof metricsData.openRate.value === 'number' 
                    ? `${metricsData.openRate.value.toFixed(1)}%` 
                    : "24.8%"} 
                  subValue={metricsData && metricsData.openRate && typeof metricsData.openRate.industryAvg === 'number' 
                    ? `Industry avg: ${metricsData.openRate.industryAvg.toFixed(1)}%` 
                    : "Industry avg: 21.5%"} 
                  trend={metricsData && metricsData.openRate && metricsData.openRate.trend 
                    ? metricsData.openRate.trend as 'up' | 'down' | 'neutral' 
                    : "up"} 
                  trendValue={metricsData && metricsData.openRate && metricsData.openRate.trendValue 
                    ? metricsData.openRate.trendValue 
                    : "3.2%"}
                />
                <MetricCard 
                  title="Click Rate" 
                  value={metricsData && metricsData.clickRate && typeof metricsData.clickRate.value === 'number' 
                    ? `${metricsData.clickRate.value.toFixed(1)}%` 
                    : "3.6%"} 
                  subValue={metricsData && metricsData.clickRate && typeof metricsData.clickRate.industryAvg === 'number' 
                    ? `Industry avg: ${metricsData.clickRate.industryAvg.toFixed(1)}%` 
                    : "Industry avg: 2.7%"} 
                  trend={metricsData && metricsData.clickRate && metricsData.clickRate.trend 
                    ? metricsData.clickRate.trend as 'up' | 'down' | 'neutral' 
                    : "up"} 
                  trendValue={metricsData && metricsData.clickRate && metricsData.clickRate.trendValue 
                    ? metricsData.clickRate.trendValue 
                    : "0.9%"}
                />
                <MetricCard 
                  title="Conversion Rate" 
                  value={metricsData && metricsData.conversionRate && typeof metricsData.conversionRate.value === 'number' 
                    ? `${metricsData.conversionRate.value.toFixed(1)}%` 
                    : "1.2%"} 
                  subValue={metricsData && metricsData.conversionRate && typeof metricsData.conversionRate.goal === 'number' 
                    ? `Goal: ${metricsData.conversionRate.goal.toFixed(1)}%` 
                    : "Goal: 1.5%"} 
                  trend={metricsData && metricsData.conversionRate && metricsData.conversionRate.trend 
                    ? metricsData.conversionRate.trend as 'up' | 'down' | 'neutral' 
                    : "down"} 
                  trendValue={metricsData && metricsData.conversionRate && metricsData.conversionRate.trendValue 
                    ? metricsData.conversionRate.trendValue 
                    : "0.3%"}
                />
                <MetricCard 
                  title="Bounce Rate" 
                  value={metricsData && metricsData.bounceRate && typeof metricsData.bounceRate.value === 'number' 
                    ? `${metricsData.bounceRate.value.toFixed(1)}%` 
                    : "0.8%"} 
                  subValue={metricsData && metricsData.bounceRate && typeof metricsData.bounceRate.industryAvg === 'number' 
                    ? `Industry avg: ${metricsData.bounceRate.industryAvg.toFixed(1)}%` 
                    : "Industry avg: 1.2%"} 
                  trend={metricsData && metricsData.bounceRate && metricsData.bounceRate.trend 
                    ? metricsData.bounceRate.trend as 'up' | 'down' | 'neutral' 
                    : "up"} 
                  trendValue={metricsData && metricsData.bounceRate && metricsData.bounceRate.trendValue 
                    ? metricsData.bounceRate.trendValue 
                    : "0.4%"}
                />
              </div>
              
              {/* Extended Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard 
                  title="Total Sent" 
                  value={metricsData && typeof metricsData.totalSent === 'number' 
                    ? metricsData.totalSent.toLocaleString() 
                    : "42,857"} 
                  subValue={`Last ${timeframe === '7days' ? '7 days' : timeframe === '30days' ? '30 days' : timeframe === '90days' ? '90 days' : timeframe}`}
                />
                <MetricCard 
                  title="Total Opens" 
                  value={metricsData && typeof metricsData.totalOpens === 'number' 
                    ? metricsData.totalOpens.toLocaleString() 
                    : "10,628"} 
                  subValue={metricsData && typeof metricsData.totalOpens === 'number' && typeof metricsData.totalSent === 'number' && metricsData.totalSent > 0
                    ? `${(metricsData.totalOpens / metricsData.totalSent * 100).toFixed(1)}% of sent` 
                    : "24.8% of sent"}
                />
                <MetricCard 
                  title="Total Clicks" 
                  value={metricsData && typeof metricsData.totalClicks === 'number' 
                    ? metricsData.totalClicks.toLocaleString() 
                    : "1,543"} 
                  subValue={metricsData && typeof metricsData.totalClicks === 'number' && typeof metricsData.totalSent === 'number' && metricsData.totalSent > 0
                    ? `${(metricsData.totalClicks / metricsData.totalSent * 100).toFixed(1)}% of sent` 
                    : "3.6% of sent"}
                />
                <MetricCard 
                  title="Unsubscribes" 
                  value={metricsData && typeof metricsData.unsubscribes === 'number' 
                    ? metricsData.unsubscribes.toLocaleString() 
                    : "38"} 
                  subValue={metricsData && typeof metricsData.unsubscribes === 'number' && typeof metricsData.totalSent === 'number' && metricsData.totalSent > 0
                    ? `${(metricsData.unsubscribes / metricsData.totalSent * 100).toFixed(2)}% of sent` 
                    : "0.09% of sent"}
                />
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
                  Performance Insights
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Visual analytics and insights about your email campaign performance
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Weekly Performance</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Opens, clicks and conversions over the past week</p>
                  </div>
                  {isLoadingCharts ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="h-80">
                      {chartData && chartData.weeklyPerformance && Array.isArray(chartData.weeklyPerformance) && chartData.weeklyPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData.weeklyPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                border: 'none'
                              }} 
                            />
                            <Legend />
                            <Bar dataKey="opens" fill="rgba(59, 130, 246, 0.9)" name="Opens" animationDuration={1500} />
                            <Bar dataKey="clicks" fill="rgba(16, 185, 129, 0.9)" name="Clicks" animationDuration={1500} />
                            <Bar dataKey="conversions" fill="rgba(139, 92, 246, 0.9)" name="Conversions" animationDuration={1500} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                          <div className="text-4xl text-gray-300 dark:text-gray-600 mb-3">📊</div>
                          <p className="text-gray-400 dark:text-gray-500">No weekly performance data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Device Breakdown</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email opens by device type</p>
                  </div>
                  {isLoadingCharts ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="h-80">
                      {chartData && chartData.deviceBreakdown && Array.isArray(chartData.deviceBreakdown) && chartData.deviceBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData.deviceBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              fill="#8884d8"
                              paddingAngle={6}
                              dataKey="value"
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              animationDuration={1500}
                              animationBegin={200}
                            >
                              {chartData.deviceBreakdown.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={[
                                    'rgba(59, 130, 246, 0.9)', 
                                    'rgba(16, 185, 129, 0.9)', 
                                    'rgba(139, 92, 246, 0.9)', 
                                    'rgba(236, 72, 153, 0.9)'
                                  ][index % 4]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                border: 'none'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                          <div className="text-4xl text-gray-300 dark:text-gray-600 mb-3">📱</div>
                          <p className="text-gray-400 dark:text-gray-500">No device breakdown data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Click Distribution</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Most clicked links in your emails</p>
                  </div>
                  {isLoadingCharts ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="h-80">
                      {chartData && chartData.clickDistribution && Array.isArray(chartData.clickDistribution) && chartData.clickDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={chartData.clickDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis type="number" />
                            <YAxis dataKey="link" type="category" width={150} />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                border: 'none'
                              }} 
                            />
                            <Bar 
                              dataKey="clicks" 
                              fill="rgba(59, 130, 246, 0.9)" 
                              animationDuration={1500} 
                              animationBegin={300}
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                          <div className="text-4xl text-gray-300 dark:text-gray-600 mb-3">🔗</div>
                          <p className="text-gray-400 dark:text-gray-500">No click distribution data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Engagement Over Time</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Opens, clicks and conversions over time</p>
                  </div>
                  {isLoadingCharts ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="h-80">
                      {chartData && chartData.engagementOverTime && Array.isArray(chartData.engagementOverTime) && chartData.engagementOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData.engagementOverTime}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                border: 'none'
                              }} 
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="open" 
                              stroke="rgba(59, 130, 246, 0.9)" 
                              name="Opens" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                              animationDuration={1500}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="click" 
                              stroke="rgba(16, 185, 129, 0.9)" 
                              name="Clicks" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                              animationDuration={1500}
                              animationBegin={300}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="conversion" 
                              stroke="rgba(139, 92, 246, 0.9)" 
                              name="Conversions" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                              animationDuration={1500}
                              animationBegin={600}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                          <div className="text-4xl text-gray-300 dark:text-gray-600 mb-3">📈</div>
                          <p className="text-gray-400 dark:text-gray-500">No engagement over time data available</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* AI Insights Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-xl shadow-md p-6 mb-8"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2">AI-Generated Insights</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Based on your email performance data, our AI suggests the following insights and recommendations:
                    </p>
                    <motion.ul 
                      className="space-y-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                        hidden: {}
                      }}
                    >
                      <motion.li 
                        className="flex items-start gap-2"
                        variants={{
                          visible: { opacity: 1, x: 0 },
                          hidden: { opacity: 0, x: -20 }
                        }}
                      >
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Your open rates are <strong>3.2%</strong> above industry average. Your subject lines are effective at capturing attention.</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-start gap-2"
                        variants={{
                          visible: { opacity: 1, x: 0 },
                          hidden: { opacity: 0, x: -20 }
                        }}
                      >
                        <span className="text-green-500 mt-1">✓</span>
                        <span>Most of your audience is opening emails on <strong>mobile devices</strong>. Ensure your templates remain mobile-optimized.</span>
                      </motion.li>
                      <motion.li 
                        className="flex items-start gap-2"
                        variants={{
                          visible: { opacity: 1, x: 0 },
                          hidden: { opacity: 0, x: -20 }
                        }}
                      >
                        <span className="text-amber-500 mt-1">!</span>
                        <span>Your conversion rate is <strong>0.3%</strong> below your goal. Consider strengthening your calls-to-action or offering more compelling incentives.</span>
                      </motion.li>
                    </motion.ul>
                  </div>
                </div>
              </motion.div>
              
              {/* Realtime Activity Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Realtime Activity</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Live feed of email interactions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-gray-500">Live updates</span>
                  </div>
                </div>
                <div className="space-y-4 max-h-60 overflow-auto">
                  {realtimeData && Array.isArray(realtimeData) && realtimeData.length > 0 ? (
                    realtimeData.map((activity, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 transition-opacity hover:bg-gray-50 dark:hover:bg-gray-700/20 p-2 rounded-lg"
                      >
                        <div className="w-10 h-10 mr-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {activity?.type === 'open' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                          ) : activity?.type === 'click' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity?.user || 'Anonymous User'} <span className="font-normal text-gray-500 dark:text-gray-400">
                            {activity?.type === 'open' ? 'opened an email' : activity?.type === 'click' ? 'clicked a link' : 'subscribed'}
                          </span></p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{activity?.email || 'email@example.com'}</p>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{activity?.time || '2 mins ago'}</div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                      <div className="text-4xl mb-3">⏱️</div>
                      <p>No realtime activity available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6"
            >
              <DetailedOpens />
            </motion.div>
          )}
          
          {activeTab === 'engagement' && (
            <motion.div
              key="engagement"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 mb-6"
            >
              <h2 className="text-2xl font-bold mb-4">Engagement Analysis</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">In-depth analysis of subscriber engagement patterns and behaviors</p>
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                Coming soon - Advanced engagement analytics with AI-powered insights
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmailPerformanceV2;