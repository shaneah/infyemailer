import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, RefreshCw, AreaChart, BarChart3, PieChart, TrendingUp, TrendingDown,
  Calendar, Eye, MousePointer, Users, Clock, ChevronRight, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Widget } from '@/hooks/useWidgets';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface CampaignPerformanceAnalyzerWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

interface CampaignMetrics {
  id: number;
  name: string;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  complaints: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  complaintRate: number;
  sendDate: string;
  industry: string;
  subjectLine: string;
  fromName: string;
  dailyStats: {
    date: string;
    opens: number;
    clicks: number;
  }[];
  deviceBreakdown: {
    device: string;
    percentage: number;
  }[];
  timeOfDayStats: {
    hour: number;
    opens: number;
  }[];
  benchmarks: {
    industry: {
      openRate: number;
      clickRate: number;
      unsubscribeRate: number;
    }
  };
}

// Mock data
const mockCampaigns: CampaignMetrics[] = [
  {
    id: 1,
    name: "Monthly Newsletter - May 2023",
    sent: 12483,
    delivered: 12104,
    opens: 5592,
    clicks: 2637,
    unsubscribes: 47,
    bounces: 379,
    complaints: 3,
    openRate: 46.2,
    clickRate: 21.8,
    clickToOpenRate: 47.2,
    unsubscribeRate: 0.39,
    bounceRate: 3.04,
    complaintRate: 0.02,
    sendDate: "2023-05-15",
    industry: "Technology",
    subjectLine: "May News: Latest Tech Updates & Exclusive Offers",
    fromName: "Infy Tech Newsletter",
    dailyStats: [
      { date: "2023-05-15", opens: 3412, clicks: 1843 },
      { date: "2023-05-16", opens: 1285, clicks: 532 },
      { date: "2023-05-17", opens: 421, clicks: 147 },
      { date: "2023-05-18", opens: 212, clicks: 65 },
      { date: "2023-05-19", opens: 156, clicks: 36 },
      { date: "2023-05-20", opens: 62, clicks: 11 },
      { date: "2023-05-21", opens: 44, clicks: 3 }
    ],
    deviceBreakdown: [
      { device: "Mobile", percentage: 63 },
      { device: "Desktop", percentage: 32 },
      { device: "Tablet", percentage: 5 }
    ],
    timeOfDayStats: [
      { hour: 6, opens: 62 },
      { hour: 7, opens: 148 },
      { hour: 8, opens: 412 },
      { hour: 9, opens: 753 },
      { hour: 10, opens: 821 },
      { hour: 11, opens: 624 },
      { hour: 12, opens: 543 },
      { hour: 13, opens: 412 },
      { hour: 14, opens: 376 },
      { hour: 15, opens: 312 },
      { hour: 16, opens: 289 },
      { hour: 17, opens: 256 },
      { hour: 18, opens: 217 },
      { hour: 19, opens: 183 },
      { hour: 20, opens: 105 },
      { hour: 21, opens: 79 }
    ],
    benchmarks: {
      industry: {
        openRate: 39.5,
        clickRate: 18.2,
        unsubscribeRate: 0.45
      }
    }
  },
  {
    id: 4,
    name: "Product Launch - ProMax X1",
    sent: 24192,
    delivered: 23986,
    opens: 14078,
    clicks: 7767,
    unsubscribes: 83,
    bounces: 206,
    complaints: 7,
    openRate: 58.7,
    clickRate: 32.4,
    clickToOpenRate: 55.2,
    unsubscribeRate: 0.35,
    bounceRate: 0.85,
    complaintRate: 0.03,
    sendDate: "2023-05-08",
    industry: "Technology",
    subjectLine: "Introducing ProMax X1: The Next Generation Is Here",
    fromName: "Infy Tech Product Team",
    dailyStats: [
      { date: "2023-05-08", opens: 8932, clicks: 5243 },
      { date: "2023-05-09", opens: 3211, clicks: 1685 },
      { date: "2023-05-10", opens: 876, clicks: 432 },
      { date: "2023-05-11", opens: 542, clicks: 245 },
      { date: "2023-05-12", opens: 321, clicks: 124 },
      { date: "2023-05-13", opens: 112, clicks: 29 },
      { date: "2023-05-14", opens: 84, clicks: 9 }
    ],
    deviceBreakdown: [
      { device: "Mobile", percentage: 58 },
      { device: "Desktop", percentage: 36 },
      { device: "Tablet", percentage: 6 }
    ],
    timeOfDayStats: [
      { hour: 6, opens: 103 },
      { hour: 7, opens: 324 },
      { hour: 8, opens: 765 },
      { hour: 9, opens: 1324 },
      { hour: 10, opens: 1627 },
      { hour: 11, opens: 1458 },
      { hour: 12, opens: 1267 },
      { hour: 13, opens: 1129 },
      { hour: 14, opens: 987 },
      { hour: 15, opens: 854 },
      { hour: 16, opens: 732 },
      { hour: 17, opens: 654 },
      { hour: 18, opens: 567 },
      { hour: 19, opens: 457 },
      { hour: 20, opens: 342 },
      { hour: 21, opens: 238 }
    ],
    benchmarks: {
      industry: {
        openRate: 42.1,
        clickRate: 19.7,
        unsubscribeRate: 0.41
      }
    }
  }
];

const CampaignPerformanceAnalyzerWidget: React.FC<CampaignPerformanceAnalyzerWidgetProps> = ({ widget, onRemove }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number>(mockCampaigns[0].id);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7days');
  
  // Get the selected campaign data
  const selectedCampaign = mockCampaigns.find(c => c.id === selectedCampaignId) || mockCampaigns[0];
  
  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };
  
  // Line chart data for engagement over time
  const engagementData = {
    labels: selectedCampaign.dailyStats.map(stat => {
      const date = new Date(stat.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Opens',
        data: selectedCampaign.dailyStats.map(stat => stat.opens),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Clicks',
        data: selectedCampaign.dailyStats.map(stat => stat.clicks),
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };
  
  // Device breakdown pie chart
  const deviceData = {
    labels: selectedCampaign.deviceBreakdown.map(item => item.device),
    datasets: [
      {
        data: selectedCampaign.deviceBreakdown.map(item => item.percentage),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Opens by hour chart
  const opensByHourData = {
    labels: selectedCampaign.timeOfDayStats.map(stat => `${stat.hour}:00`),
    datasets: [
      {
        label: 'Opens',
        data: selectedCampaign.timeOfDayStats.map(stat => stat.opens),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  // Benchmark comparison chart
  const benchmarkData = {
    labels: ['Open Rate', 'Click Rate', 'Unsubscribe Rate'],
    datasets: [
      {
        label: 'Your Campaign',
        data: [
          selectedCampaign.openRate,
          selectedCampaign.clickRate,
          selectedCampaign.unsubscribeRate * 100
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Industry Average',
        data: [
          selectedCampaign.benchmarks.industry.openRate,
          selectedCampaign.benchmarks.industry.clickRate,
          selectedCampaign.benchmarks.industry.unsubscribeRate * 100
        ],
        backgroundColor: 'rgba(203, 213, 225, 0.8)',
        borderRadius: 4,
      }
    ],
  };
  
  // Common chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
      },
    },
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
      },
    },
  };
  
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
  };
  
  const benchmarkChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 2) {
              return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
            }
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  const getStatusColor = (metric: number, benchmark: number) => {
    const difference = ((metric - benchmark) / benchmark) * 100;
    if (difference >= 10) return "text-green-600";
    if (difference <= -10) return "text-red-600";
    return "text-amber-600";
  };

  const getTrendIcon = (metric: number, benchmark: number) => {
    const difference = ((metric - benchmark) / benchmark) * 100;
    if (difference >= 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (difference <= -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const formatPercent = (value: number) => {
    return value.toFixed(1) + '%';
  };

  return (
    <Card className="rounded-lg shadow-lg overflow-hidden border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-white" />
          <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCampaignId.toString()} onValueChange={(value) => setSelectedCampaignId(parseInt(value))}>
            <SelectTrigger className="h-8 bg-white/10 border-0 text-white text-sm w-[210px]">
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              {mockCampaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id.toString()}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                  onClick={refreshData}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                  onClick={() => onRemove(widget.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove widget</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{selectedCampaign.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Sent {new Date(selectedCampaign.sendDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{selectedCampaign.sent.toLocaleString()} recipients</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{selectedCampaign.industry}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="h-8 bg-white border-gray-200 text-sm w-[160px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="14days">Last 14 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Full Analysis
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="bg-transparent h-10 px-6">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-3 h-10">
                Overview
              </TabsTrigger>
              <TabsTrigger value="engagement" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-3 h-10">
                Engagement
              </TabsTrigger>
              <TabsTrigger value="devices" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-3 h-10">
                Devices
              </TabsTrigger>
              <TabsTrigger value="timing" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-3 h-10">
                Timing
              </TabsTrigger>
              <TabsTrigger value="benchmarks" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-3 h-10">
                Benchmarks
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-500">Open Rate</h4>
                    <div className="flex items-center">
                      {getTrendIcon(selectedCampaign.openRate, selectedCampaign.benchmarks.industry.openRate)}
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">{formatPercent(selectedCampaign.openRate)}</span>
                    <span className={`ml-2 text-xs ${getStatusColor(selectedCampaign.openRate, selectedCampaign.benchmarks.industry.openRate)}`}>
                      {((selectedCampaign.openRate - selectedCampaign.benchmarks.industry.openRate) / selectedCampaign.benchmarks.industry.openRate * 100).toFixed(1)}% vs. industry
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={selectedCampaign.openRate} className="h-1.5 bg-gray-100" />
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    {selectedCampaign.opens.toLocaleString()} of {selectedCampaign.delivered.toLocaleString()} delivered
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-500">Click Rate</h4>
                    <div className="flex items-center">
                      {getTrendIcon(selectedCampaign.clickRate, selectedCampaign.benchmarks.industry.clickRate)}
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">{formatPercent(selectedCampaign.clickRate)}</span>
                    <span className={`ml-2 text-xs ${getStatusColor(selectedCampaign.clickRate, selectedCampaign.benchmarks.industry.clickRate)}`}>
                      {((selectedCampaign.clickRate - selectedCampaign.benchmarks.industry.clickRate) / selectedCampaign.benchmarks.industry.clickRate * 100).toFixed(1)}% vs. industry
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={selectedCampaign.clickRate} className="h-1.5 bg-gray-100" />
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <MousePointer className="h-3.5 w-3.5 mr-1" />
                    {selectedCampaign.clicks.toLocaleString()} of {selectedCampaign.delivered.toLocaleString()} delivered
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-500">Click-to-Open</h4>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">{formatPercent(selectedCampaign.clickToOpenRate)}</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={selectedCampaign.clickToOpenRate} className="h-1.5 bg-gray-100" />
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <MousePointer className="h-3.5 w-3.5 mr-1" />
                    {selectedCampaign.clicks.toLocaleString()} of {selectedCampaign.opens.toLocaleString()} opened
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-500">Unsubscribe Rate</h4>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">{(selectedCampaign.unsubscribeRate).toFixed(2)}%</span>
                    <span className={`ml-2 text-xs ${getStatusColor(selectedCampaign.benchmarks.industry.unsubscribeRate, selectedCampaign.unsubscribeRate)}`}>
                      {((selectedCampaign.benchmarks.industry.unsubscribeRate - selectedCampaign.unsubscribeRate) / selectedCampaign.unsubscribeRate * 100).toFixed(1)}% vs. industry
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={selectedCampaign.unsubscribeRate * 20} className="h-1.5 bg-gray-100" />
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    {selectedCampaign.unsubscribes.toLocaleString()} of {selectedCampaign.delivered.toLocaleString()} delivered
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">Engagement Over Time</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64">
                    <Line options={lineChartOptions} data={engagementData} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64 flex items-center justify-center">
                    <Pie options={pieChartOptions} data={deviceData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Engagement Tab */}
          <TabsContent value="engagement" className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">Daily Engagement Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-72">
                    <Line options={lineChartOptions} data={engagementData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Devices Tab */}
          <TabsContent value="devices" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">Device Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64 flex items-center justify-center">
                    <Pie options={pieChartOptions} data={deviceData} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">Device Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-indigo-600 mr-2"></div>
                          <span className="text-sm font-medium">Mobile</span>
                        </div>
                        <span className="text-sm text-gray-600">63%</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-xs text-gray-500 ml-5">Open Rate</span>
                        </div>
                        <span className="text-xs text-gray-500">47.8%</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs text-gray-500 ml-5">Click Rate</span>
                        </div>
                        <span className="text-xs text-gray-500">23.2%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-purple-600 mr-2"></div>
                          <span className="text-sm font-medium">Desktop</span>
                        </div>
                        <span className="text-sm text-gray-600">32%</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-xs text-gray-500 ml-5">Open Rate</span>
                        </div>
                        <span className="text-xs text-gray-500">43.4%</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs text-gray-500 ml-5">Click Rate</span>
                        </div>
                        <span className="text-xs text-gray-500">19.1%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-pink-600 mr-2"></div>
                          <span className="text-sm font-medium">Tablet</span>
                        </div>
                        <span className="text-sm text-gray-600">5%</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-xs text-gray-500 ml-5">Open Rate</span>
                        </div>
                        <span className="text-xs text-gray-500">42.6%</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-xs text-gray-500 ml-5">Click Rate</span>
                        </div>
                        <span className="text-xs text-gray-500">17.8%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Timing Tab */}
          <TabsContent value="timing" className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">Opens by Hour of Day</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64">
                    <Bar options={barChartOptions} data={opensByHourData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Benchmarks Tab */}
          <TabsContent value="benchmarks" className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-base">Industry Benchmark Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64">
                    <Bar options={benchmarkChartOptions} data={benchmarkData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CampaignPerformanceAnalyzerWidget;