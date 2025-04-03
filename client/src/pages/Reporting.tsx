import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText, Printer, Mail, BarChart2, PieChart, TrendingUp, Users, Filter } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

const Reporting = () => {
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'custom'>('30days');
  const [reportType, setReportType] = useState<'summary' | 'detailed'>('summary');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['opens', 'clicks', 'bounces', 'unsubscribes']);

  // Fetch metrics data for the reports
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['/api/email-performance/metrics', dateRange, selectedCampaigns],
    queryFn: async () => {
      // This would normally fetch from the API
      // For now, we'll use mock data
      return [
        { date: '2025-03-01', opens: 1850, clicks: 624, bounces: 45, unsubscribes: 12 },
        { date: '2025-03-02', opens: 2100, clicks: 703, bounces: 38, unsubscribes: 18 },
        { date: '2025-03-03', opens: 1920, clicks: 650, bounces: 42, unsubscribes: 15 },
        { date: '2025-03-04', opens: 2340, clicks: 820, bounces: 51, unsubscribes: 22 },
        { date: '2025-03-05', opens: 2890, clicks: 978, bounces: 48, unsubscribes: 19 },
        { date: '2025-03-06', opens: 2560, clicks: 876, bounces: 40, unsubscribes: 14 },
        { date: '2025-03-07', opens: 3100, clicks: 1150, bounces: 55, unsubscribes: 25 },
        { date: '2025-03-08', opens: 2780, clicks: 950, bounces: 43, unsubscribes: 17 },
        { date: '2025-03-09', opens: 2450, clicks: 820, bounces: 39, unsubscribes: 16 },
        { date: '2025-03-10', opens: 2650, clicks: 910, bounces: 44, unsubscribes: 19 },
        { date: '2025-03-11', opens: 2880, clicks: 980, bounces: 48, unsubscribes: 21 },
        { date: '2025-03-12', opens: 3020, clicks: 1050, bounces: 52, unsubscribes: 23 },
        { date: '2025-03-13', opens: 3250, clicks: 1150, bounces: 56, unsubscribes: 24 },
        { date: '2025-03-14', opens: 3150, clicks: 1080, bounces: 50, unsubscribes: 22 },
        { date: '2025-03-15', opens: 2950, clicks: 990, bounces: 47, unsubscribes: 20 },
      ];
    },
  });

  // Fetch campaign data
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['/api/campaigns'],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      return [
        { id: '1', name: 'Monthly Newsletter', performance: 'high' },
        { id: '2', name: 'Product Launch', performance: 'medium' },
        { id: '3', name: 'Holiday Promotion', performance: 'high' },
        { id: '4', name: 'Welcome Series', performance: 'low' },
      ];
    },
  });

  // Device breakdown data
  const deviceData = [
    { name: 'Mobile', value: 55 },
    { name: 'Desktop', value: 35 },
    { name: 'Tablet', value: 10 }
  ];

  // Email client data
  const emailClientData = [
    { name: 'Gmail', value: 42 },
    { name: 'Apple Mail', value: 28 },
    { name: 'Outlook', value: 18 },
    { name: 'Yahoo', value: 8 },
    { name: 'Other', value: 4 }
  ];

  // Time of day engagement data
  const timeOfDayData = [
    { hour: '6am', opens: 120, clicks: 35 },
    { hour: '8am', opens: 580, clicks: 210 },
    { hour: '10am', opens: 890, clicks: 345 },
    { hour: '12pm', opens: 760, clicks: 275 },
    { hour: '2pm', opens: 510, clicks: 190 },
    { hour: '4pm', opens: 620, clicks: 230 },
    { hour: '6pm', opens: 940, clicks: 380 },
    { hour: '8pm', opens: 760, clicks: 290 },
    { hour: '10pm', opens: 380, clicks: 120 }
  ];

  // Geography data
  const geographyData = [
    { country: 'United States', opens: 10450, clicks: 3820 },
    { country: 'United Kingdom', opens: 3780, clicks: 1250 },
    { country: 'Canada', opens: 2910, clicks: 980 },
    { country: 'Australia', opens: 2540, clicks: 820 },
    { country: 'Germany', opens: 1890, clicks: 620 },
    { country: 'France', opens: 1580, clicks: 520 },
    { country: 'Others', opens: 4820, clicks: 1620 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderExportButtons = () => (
    <div className="flex space-x-2 mb-4">
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button variant="outline" size="sm">
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button variant="outline" size="sm">
        <Mail className="h-4 w-4 mr-2" />
        Email Report
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reporting Dashboard</h1>
        {renderExportButtons()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Opens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28,450</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 12.5%</span> vs previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9,832</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 8.2%</span> vs previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22.4%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">↓ 1.8%</span> vs previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 0.7%</span> vs previous period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Campaign Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience Insights</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Analysis</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>Email engagement metrics over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingMetrics ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="opens" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="clicks" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Email opens by device type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Client Usage</CardTitle>
                <CardDescription>Most popular email clients</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emailClientData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaign Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Campaign Comparison</CardTitle>
                <CardDescription>Performance metrics across campaigns</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoadingCampaigns ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Monthly Newsletter', openRate: 24.5, clickRate: 3.8, bounceRate: 1.2 },
                        { name: 'Product Launch', openRate: 32.1, clickRate: 5.2, bounceRate: 0.9 },
                        { name: 'Holiday Promotion', openRate: 28.7, clickRate: 4.5, bounceRate: 1.1 },
                        { name: 'Welcome Series', openRate: 42.3, clickRate: 8.7, bounceRate: 0.5 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="openRate" name="Open Rate %" fill="#8884d8" />
                      <Bar dataKey="clickRate" name="Click Rate %" fill="#82ca9d" />
                      <Bar dataKey="bounceRate" name="Bounce Rate %" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
                <CardDescription>Best campaigns by open rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Welcome Series</p>
                      <p className="text-xs text-muted-foreground">Automated</p>
                    </div>
                    <div>42.3%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Product Launch</p>
                      <p className="text-xs text-muted-foreground">One-time</p>
                    </div>
                    <div>32.1%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Holiday Promotion</p>
                      <p className="text-xs text-muted-foreground">Seasonal</p>
                    </div>
                    <div>28.7%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Monthly Newsletter</p>
                      <p className="text-xs text-muted-foreground">Recurring</p>
                    </div>
                    <div>24.5%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Link Performance</CardTitle>
                <CardDescription>Most clicked links across campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Product Page</p>
                      <p className="text-xs text-muted-foreground">https://example.com/product</p>
                    </div>
                    <div>1,258</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Blog Post</p>
                      <p className="text-xs text-muted-foreground">https://example.com/blog/new</p>
                    </div>
                    <div>945</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Special Offer</p>
                      <p className="text-xs text-muted-foreground">https://example.com/offer</p>
                    </div>
                    <div>782</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Contact Us</p>
                      <p className="text-xs text-muted-foreground">https://example.com/contact</p>
                    </div>
                    <div>426</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Insights Tab */}
        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographical Distribution</CardTitle>
                <CardDescription>Email engagement by country</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={geographyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="country" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="opens" name="Opens" fill="#8884d8" />
                    <Bar dataKey="clicks" name="Clicks" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>New subscribers over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: 'Jan', subscribers: 18500 },
                      { month: 'Feb', subscribers: 19200 },
                      { month: 'Mar', subscribers: 20400 },
                      { month: 'Apr', subscribers: 21800 },
                      { month: 'May', subscribers: 22900 },
                      { month: 'Jun', subscribers: 24100 },
                      { month: 'Jul', subscribers: 24580 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="subscribers" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active vs Inactive Subscribers</CardTitle>
                <CardDescription>Subscriber engagement levels</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={[
                        { name: 'Highly Active', value: 32 },
                        { name: 'Active', value: 38 },
                        { name: 'Occasional', value: 18 },
                        { name: 'Inactive', value: 12 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscriber Sources</CardTitle>
                <CardDescription>Where subscribers are coming from</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { source: 'Website Form', count: 8750 },
                      { source: 'Social Media', count: 6240 },
                      { source: 'Direct Import', count: 3580 },
                      { source: 'Partner Referral', count: 2450 },
                      { source: 'Landing Pages', count: 1960 },
                      { source: 'Other', count: 1600 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Analysis Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Time of Day Engagement</CardTitle>
                <CardDescription>When subscribers are most active</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeOfDayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="opens" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="clicks" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Content Analysis</CardTitle>
                <CardDescription>What content performs best</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Subject Line Length</p>
                      <p className="text-sm">40-60 characters (24.8% open rate)</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Ideal Word Count</p>
                      <p className="text-sm">100-200 words (3.7% click rate)</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">CTA Position</p>
                      <p className="text-sm">Top third of email (5.2% click rate)</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Image-to-Text Ratio</p>
                      <p className="text-sm">30:70 (4.1% click rate)</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Personalization</p>
                      <p className="text-sm">+35% click-through rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Line Performance</CardTitle>
                <CardDescription>Top performing subject line types</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { type: 'Question', openRate: 26.8 },
                      { type: 'Urgency', openRate: 24.5 },
                      { type: 'Curiosity', openRate: 28.3 },
                      { type: 'Personalized', openRate: 32.7 },
                      { type: 'List Style', openRate: 23.1 },
                      { type: 'Emoji', openRate: 25.9 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="openRate" name="Open Rate %" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Builder</CardTitle>
              <CardDescription>Create your own custom analytics report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Report Type</label>
                  <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary Report</SelectItem>
                      <SelectItem value="detailed">Detailed Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Campaigns</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Campaigns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campaigns</SelectItem>
                      <SelectItem value="newsletter">Monthly Newsletter</SelectItem>
                      <SelectItem value="product">Product Launch</SelectItem>
                      <SelectItem value="holiday">Holiday Promotion</SelectItem>
                      <SelectItem value="welcome">Welcome Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Metrics to Include</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="opens" defaultChecked />
                    <label htmlFor="opens">Opens</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="clicks" defaultChecked />
                    <label htmlFor="clicks">Clicks</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="bounces" defaultChecked />
                    <label htmlFor="bounces">Bounces</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="unsubscribes" defaultChecked />
                    <label htmlFor="unsubscribes">Unsubscribes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="delivery" />
                    <label htmlFor="delivery">Delivery Rate</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="ctr" />
                    <label htmlFor="ctr">CTR</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="growth" />
                    <label htmlFor="growth">List Growth</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="roi" />
                    <label htmlFor="roi">ROI</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Add Filters
                </Button>
                <Button>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Quick access to your saved custom reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">Monthly Performance Summary</p>
                    <p className="text-sm text-muted-foreground">All campaigns, Last 30 days</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">Campaign Comparison</p>
                    <p className="text-sm text-muted-foreground">Newsletter vs Promotions, Last quarter</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">Audience Segmentation Analysis</p>
                    <p className="text-sm text-muted-foreground">By location and activity level</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reporting;