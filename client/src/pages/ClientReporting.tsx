import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDays, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { 
  BarChart3, 
  Users, 
  Goal, 
  TrendingUp, 
  LineChart, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Award,
  Mail,
  LayoutTemplate,
  RefreshCcw,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ClientReporting = () => {
  // Date range state
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // States for active tab and filter
  const [activeTab, setActiveTab] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [campaignFilter, setCampaignFilter] = useState('all');

  // Query for key metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/email-performance/metrics', date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/email-performance/metrics?from=${date?.from?.toISOString()}&to=${date?.to?.toISOString()}`);
        if (!response.ok) throw new Error(`Failed to fetch metrics: ${response.status}`);
        return response.json();
      } catch (error) {
        console.error('Error fetching metrics:', error);
        return {
          openRate: { value: 0, change: 0 },
          clickRate: { value: 0, change: 0 },
          bounceRate: { value: 0, change: 0 },
          deliverability: { value: 0, change: 0 },
          unsubscribeRate: { value: 0, change: 0 }
        };
      }
    },
  });

  // Query for chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['/api/email-performance/charts', date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/email-performance/charts?from=${date?.from?.toISOString()}&to=${date?.to?.toISOString()}`);
        if (!response.ok) throw new Error(`Failed to fetch chart data: ${response.status}`);
        return response.json();
      } catch (error) {
        console.error('Error fetching chart data:', error);
        return {
          weeklyPerformance: [],
          monthlyTrends: []
        };
      }
    },
  });

  // Query for top performers
  const { data: topPerformers, isLoading: topPerformersLoading } = useQuery({
    queryKey: ['/api/email-performance/top-performers', date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/email-performance/top-performers?from=${date?.from?.toISOString()}&to=${date?.to?.toISOString()}`);
        if (!response.ok) throw new Error(`Failed to fetch top performers: ${response.status}`);
        return response.json();
      } catch (error) {
        console.error('Error fetching top performers:', error);
        return {
          subjects: [],
          campaigns: [],
          templates: []
        };
      }
    },
  });

  // Query for audience overview
  const { data: audience, isLoading: audienceLoading } = useQuery({
    queryKey: ['/api/audience/overview', date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/audience/overview?from=${date?.from?.toISOString()}&to=${date?.to?.toISOString()}`);
        if (!response.ok) throw new Error(`Failed to fetch audience data: ${response.status}`);
        return response.json();
      } catch (error) {
        console.error('Error fetching audience data:', error);
        return {
          total: 0,
          active: 0,
          new: 0,
          demographics: {
            age: [],
            gender: [],
            location: []
          },
          engagement: {
            frequency: [],
            timeOfDay: []
          }
        };
      }
    },
  });

  // Query for campaign metrics
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/campaigns/metrics', date?.from?.toISOString(), date?.to?.toISOString()],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/campaigns/metrics?from=${date?.from?.toISOString()}&to=${date?.to?.toISOString()}`);
        if (!response.ok) throw new Error(`Failed to fetch campaign metrics: ${response.status}`);
        return response.json();
      } catch (error) {
        console.error('Error fetching campaign metrics:', error);
        return [];
      }
    },
  });

  // Quick date range setters
  const setLastWeek = () => {
    setDate({
      from: subDays(new Date(), 7),
      to: new Date(),
    });
  };

  const setLastMonth = () => {
    setDate({
      from: subDays(new Date(), 30),
      to: new Date(),
    });
  };

  const setLastQuarter = () => {
    setDate({
      from: subDays(new Date(), 90),
      to: new Date(),
    });
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue", isLoading = false }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}%</div>
            {change && (
              <p className={`text-xs ${change.value > 0 ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
                {change.value > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {change.value > 0 ? '+' : ''}{change.value}% from previous period
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  const CampaignRow = ({ campaign, isLoading = false }) => {
    if (isLoading) {
      return (
        <tr className="border-b border-gray-100 last:border-none">
          <td className="py-3 px-2">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          </td>
          <td className="py-3 px-2">
            <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
          </td>
          <td className="py-3 px-2">
            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
          </td>
          <td className="py-3 px-2">
            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
          </td>
          <td className="py-3 px-2">
            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
          </td>
          <td className="py-3 px-2">
            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
          </td>
        </tr>
      );
    }

    return (
      <tr className="border-b border-gray-100 last:border-none hover:bg-gray-50">
        <td className="py-3 px-2 font-medium">{campaign.name}</td>
        <td className="py-3 px-2 text-gray-600">{campaign.sentDate}</td>
        <td className="py-3 px-2 text-gray-600">{campaign.recipients.toLocaleString()}</td>
        <td className="py-3 px-2">
          <div className="flex items-center">
            <span className={`font-medium ${campaign.openRate > 25 ? 'text-green-500' : campaign.openRate > 15 ? 'text-amber-500' : 'text-gray-600'}`}>
              {campaign.openRate.toFixed(1)}%
            </span>
          </div>
        </td>
        <td className="py-3 px-2">
          <div className="flex items-center">
            <span className={`font-medium ${campaign.clickRate > 4 ? 'text-green-500' : campaign.clickRate > 2 ? 'text-amber-500' : 'text-gray-600'}`}>
              {campaign.clickRate.toFixed(1)}%
            </span>
          </div>
        </td>
        <td className="py-3 px-2 text-gray-600">{campaign.unsubscribes}</td>
      </tr>
    );
  };

  const TopPerformerCard = ({ item, type, isLoading = false }) => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-none">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-none">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
          type === 'subject' ? 'bg-purple-500' :
          type === 'campaign' ? 'bg-blue-500' : 'bg-teal-500'
        }`}>
          {type === 'subject' ? 
            <Mail size={18} /> : 
            type === 'campaign' ? 
              <Mail size={18} /> : 
              <LayoutTemplate size={18} />
          }
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm line-clamp-1">{item.name}</p>
          <p className="text-xs text-gray-500">
            {type === 'subject' ? 'Subject Line' : 
             type === 'campaign' ? 'Campaign' : 'Template'}
          </p>
        </div>
        <div className={`text-sm font-medium ${
          type === 'subject' || type === 'campaign' ? 
            (item.rate > 25 ? 'text-green-500' : 'text-amber-500') :
            (item.rate > 3 ? 'text-green-500' : 'text-amber-500')
        }`}>
          {item.rate}%
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reporting</h1>
          <p className="text-gray-500 mt-1">Comprehensive analytics and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <Button 
              variant="outline" size="sm" 
              onClick={setLastWeek}
              className={`text-xs ${date?.from && date.from.getTime() === subDays(new Date(), 7).getTime() ? 'bg-primary/10' : ''}`}
            >
              7d
            </Button>
            <Button 
              variant="outline" size="sm" 
              onClick={setLastMonth}
              className={`text-xs ${date?.from && date.from.getTime() === subDays(new Date(), 30).getTime() ? 'bg-primary/10' : ''}`}
            >
              30d
            </Button>
            <Button 
              variant="outline" size="sm" 
              onClick={setLastQuarter}
              className={`text-xs ${date?.from && date.from.getTime() === subDays(new Date(), 90).getTime() ? 'bg-primary/10' : ''}`}
            >
              90d
            </Button>
          </div>
          
          <DatePickerWithRange 
            date={date} 
            setDate={setDate} 
          />
          
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
          </Button>
          
          <Button variant="outline" size="icon">
            <Download size={18} />
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Campaign</label>
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All campaigns</SelectItem>
                    {campaigns?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input placeholder="Search by name..." className="pl-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Mail className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="audience">
            <Users className="h-4 w-4 mr-2" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="Open Rate" 
              value={metrics?.openRate.value} 
              change={metrics ? { value: metrics.openRate.change } : null} 
              icon={Goal} 
              color="blue"
              isLoading={metricsLoading} 
            />
            <MetricCard 
              title="Click Rate" 
              value={metrics?.clickRate.value} 
              change={metrics ? { value: metrics.clickRate.change } : null} 
              icon={TrendingUp} 
              color="green"
              isLoading={metricsLoading} 
            />
            <MetricCard 
              title="Bounce Rate" 
              value={metrics?.bounceRate.value} 
              change={metrics ? { value: metrics.bounceRate.change } : null} 
              icon={TrendingUp} 
              color="red"
              isLoading={metricsLoading} 
            />
            <MetricCard 
              title="Deliverability" 
              value={metrics?.deliverability.value} 
              change={metrics ? { value: metrics.deliverability.change } : null} 
              icon={Award} 
              color="purple"
              isLoading={metricsLoading} 
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
                <CardDescription>Opens and clicks by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div className="h-64 w-full bg-gray-100 animate-pulse rounded"></div>
                ) : (
                  <div className="h-64">
                    {/* This would be your chart component */}
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded border border-gray-100">
                      <p className="text-gray-500">Weekly performance chart would render here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Engagement over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div className="h-64 w-full bg-gray-100 animate-pulse rounded"></div>
                ) : (
                  <div className="h-64">
                    {/* This would be your chart component */}
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded border border-gray-100">
                      <p className="text-gray-500">Monthly trends chart would render here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top Subject Lines</CardTitle>
                <CardDescription>Best performing email subjects</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6">
                  {topPerformersLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TopPerformerCard key={i} item={{}} type="subject" isLoading={true} />
                    ))
                  ) : (
                    topPerformers?.subjects?.slice(0, 5).map((subject, i) => (
                      <TopPerformerCard key={i} item={subject} type="subject" />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Campaigns</CardTitle>
                <CardDescription>Highest engagement campaigns</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6">
                  {topPerformersLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TopPerformerCard key={i} item={{}} type="campaign" isLoading={true} />
                    ))
                  ) : (
                    topPerformers?.campaigns?.slice(0, 5).map((campaign, i) => (
                      <TopPerformerCard key={i} item={campaign} type="campaign" />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Templates</CardTitle>
                <CardDescription>Best performing email designs</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6">
                  {topPerformersLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TopPerformerCard key={i} item={{}} type="template" isLoading={true} />
                    ))
                  ) : (
                    topPerformers?.templates?.slice(0, 5).map((template, i) => (
                      <TopPerformerCard key={i} item={template} type="template" />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>Detailed metrics for all campaigns</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <RefreshCcw size={14} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                      <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                      <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                      <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                      <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unsubscribes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaignsLoading ? (
                      Array(6).fill(0).map((_, i) => (
                        <CampaignRow key={i} campaign={{}} isLoading={true} />
                      ))
                    ) : (
                      campaigns?.map((campaign, i) => (
                        <CampaignRow key={i} campaign={campaign} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Audience Overview</CardTitle>
                <CardDescription>Subscriber stats and growth</CardDescription>
              </CardHeader>
              <CardContent>
                {audienceLoading ? (
                  <div className="space-y-4">
                    <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
                    <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
                    <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Subscribers</span>
                        <span className="text-sm font-medium">{audience?.total?.toLocaleString()}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Active Subscribers</span>
                        <span className="text-sm font-medium">{audience?.active?.toLocaleString()} ({((audience?.active / audience?.total) * 100).toFixed(1)}%)</span>
                      </div>
                      <Progress value={(audience?.active / audience?.total) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">New This Month</span>
                        <span className="text-sm font-medium">{audience?.new?.toLocaleString()} ({((audience?.new / audience?.total) * 100).toFixed(1)}%)</span>
                      </div>
                      <Progress value={(audience?.new / audience?.total) * 100} className="h-2" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>Subscriber demographics</CardDescription>
              </CardHeader>
              <CardContent>
                {audienceLoading ? (
                  <div className="space-y-4">
                    <div className="h-24 bg-gray-100 animate-pulse rounded"></div>
                    <div className="h-24 bg-gray-100 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Age Groups</h4>
                      <div className="space-y-2">
                        {audience?.demographics?.age.map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.label}</span>
                              <span>{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Gender</h4>
                      <div className="space-y-2">
                        {audience?.demographics?.gender.map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.label}</span>
                              <span>{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Location</h4>
                      <div className="space-y-2">
                        {audience?.demographics?.location.map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.label}</span>
                              <span>{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Patterns</CardTitle>
                <CardDescription>When subscribers engage with your content</CardDescription>
              </CardHeader>
              <CardContent>
                {audienceLoading ? (
                  <div className="space-y-4">
                    <div className="h-24 bg-gray-100 animate-pulse rounded"></div>
                    <div className="h-24 bg-gray-100 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Engagement Frequency</h4>
                      <div className="space-y-2">
                        {audience?.engagement?.frequency.map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.label}</span>
                              <span>{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Time of Day</h4>
                      <div className="space-y-2">
                        {audience?.engagement?.timeOfDay.map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{item.label}</span>
                              <span>{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed analytics by date range</CardDescription>
            </CardHeader>
            <CardContent>
              {chartLoading ? (
                <div className="h-80 w-full bg-gray-100 animate-pulse rounded"></div>
              ) : (
                <div className="h-80">
                  {/* This would be your chart component */}
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded border border-gray-100">
                    <p className="text-gray-500">Performance metrics chart would render here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientReporting;