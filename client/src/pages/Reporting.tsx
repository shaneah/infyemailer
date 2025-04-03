import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart3, Calendar as CalendarIcon, ChevronDown, Download, FileDown, Filter, Loader2, Mail, Printer, Share2 } from "lucide-react";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";

const Reporting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Report filter states
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("opens");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Sample data for charts
  const campaignPerformanceData = [
    { name: 'Weekly Newsletter', opens: 4500, clicks: 2300, unsubscribes: 120 },
    { name: 'Product Update', opens: 3800, clicks: 1900, unsubscribes: 90 },
    { name: 'Summer Sale', opens: 5200, clicks: 3600, unsubscribes: 70 },
    { name: 'Customer Survey', opens: 2900, clicks: 1400, unsubscribes: 150 },
    { name: 'Webinar Invite', opens: 3400, clicks: 2100, unsubscribes: 60 },
  ];

  const timeSeriesData = [
    { date: '2025-03-01', opens: 1200, clicks: 800, unsubscribes: 40 },
    { date: '2025-03-08', opens: 1400, clicks: 900, unsubscribes: 35 },
    { date: '2025-03-15', opens: 1100, clicks: 750, unsubscribes: 45 },
    { date: '2025-03-22', opens: 1600, clicks: 1100, unsubscribes: 30 },
    { date: '2025-03-29', opens: 1800, clicks: 1300, unsubscribes: 25 },
    { date: '2025-04-01', opens: 2000, clicks: 1500, unsubscribes: 20 },
  ];

  const deviceBreakdownData = [
    { name: 'Mobile', value: 55 },
    { name: 'Desktop', value: 35 },
    { name: 'Tablet', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // Generate metrics cards data
  const metricsCardData = [
    { title: 'Total Sent', value: '125,432', change: '+12.5%', trend: 'up', icon: <Mail className="h-4 w-4" /> },
    { title: 'Open Rate', value: '24.8%', change: '+3.2%', trend: 'up', icon: <BarChart3 className="h-4 w-4" /> },
    { title: 'Click Rate', value: '4.3%', change: '-0.8%', trend: 'down', icon: <BarChart3 className="h-4 w-4" /> },
    { title: 'Unsubscribe Rate', value: '0.7%', change: '-0.2%', trend: 'up', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  const handleGenerateReport = () => {
    setIsLoading(true);
    // Simulate API call for report generation
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleDownloadReport = (format: string) => {
    // Here you would implement the actual download functionality
    console.log(`Downloading report in ${format} format`);
  };

  return (
    <div className="p-2 md:p-4 lg:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Report Center</h1>
          <p className="text-muted-foreground mt-1">Create custom reports and export data for analysis</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleDownloadReport('pdf')}>
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleDownloadReport('csv')}>
                  <FileDown className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleDownloadReport('excel')}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          
          <Button onClick={handleGenerateReport} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Generate Report
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {/* Filters */}
      <div className="bg-background border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-medium">Report Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateRange"
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range as any)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign</Label>
            <Select defaultValue={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger id="campaign">
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="weekly-newsletter">Weekly Newsletter</SelectItem>
                <SelectItem value="product-update">Product Update</SelectItem>
                <SelectItem value="summer-sale">Summer Sale</SelectItem>
                <SelectItem value="customer-survey">Customer Survey</SelectItem>
                <SelectItem value="webinar-invite">Webinar Invite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="metric">Metric</Label>
            <Select defaultValue={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger id="metric">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opens">Opens</SelectItem>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="unsubscribes">Unsubscribes</SelectItem>
                <SelectItem value="bounces">Bounces</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="segment">Audience Segment</Label>
            <Select defaultValue={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger id="segment">
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="active-users">Active Users</SelectItem>
                <SelectItem value="new-subscribers">New Subscribers</SelectItem>
                <SelectItem value="inactive">Inactive (30+ days)</SelectItem>
                <SelectItem value="high-engagement">High Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="flex gap-2">
              <Input id="search" placeholder="Search..." />
              <Button variant="secondary">Apply</Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Content */}
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
      
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricsCardData.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      {metric.icon} {metric.title}
                    </p>
                    <Badge variant={metric.trend === 'up' ? 'success' : 'destructive'} className="text-xs">
                      {metric.change}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mt-2">{metric.value}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Email Performance Trends</CardTitle>
              <CardDescription>Showing metrics over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeSeriesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="opens" 
                      stroke="#0088FE" 
                      fillOpacity={1} 
                      fill="url(#colorOpens)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#00C49F" 
                      fillOpacity={1} 
                      fill="url(#colorClicks)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Campaign Performance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Comparing metrics across campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={campaignPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="opens" fill="#0088FE" name="Opens" />
                      <Bar dataKey="clicks" fill="#00C49F" name="Clicks" />
                      <Bar dataKey="unsubscribes" fill="#FF8042" name="Unsubscribes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Email client usage by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Analysis</CardTitle>
              <CardDescription>Detailed analysis of all campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This section provides in-depth analysis of campaign performance with advanced metrics.</p>
              <div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg">
                <p className="text-muted-foreground">Campaign performance data will display here based on your selections</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Audience Tab */}
        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>Subscriber behavior and demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This section provides detailed audience analytics and subscriber segmentation insights.</p>
              <div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg">
                <p className="text-muted-foreground">Audience insights will display here based on your selections</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Engagement Tab */}
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Click, open and interaction analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This section breaks down user engagement with your email campaigns.</p>
              <div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg">
                <p className="text-muted-foreground">Engagement metrics will display here based on your selections</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Devices Tab */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Device & Client Analytics</CardTitle>
              <CardDescription>Email client and device usage breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This section shows how subscribers are viewing your emails.</p>
              <div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg">
                <p className="text-muted-foreground">Device and client analytics will display here based on your selections</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>In-depth data analysis and custom metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This section provides custom and advanced analytics for power users.</p>
              <div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg">
                <p className="text-muted-foreground">Advanced analytics will display here based on your selections</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reporting;