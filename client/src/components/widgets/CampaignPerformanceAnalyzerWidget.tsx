import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, PieChart, BarChart2, Clock, Users, Mail, LineChartIcon } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
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

const CampaignPerformanceAnalyzerWidget: React.FC<CampaignPerformanceAnalyzerWidgetProps> = ({ widget, onRemove }) => {
  // Sample campaign data
  const [campaign, setCampaign] = useState<CampaignMetrics>({
    id: 1,
    name: "Monthly Newsletter",
    sent: 12483,
    delivered: 12051,
    opens: 5567,
    clicks: 2632,
    unsubscribes: 48,
    bounces: 432,
    complaints: 5,
    openRate: 46.2,
    clickRate: 21.8,
    clickToOpenRate: 47.3,
    unsubscribeRate: 0.4,
    bounceRate: 3.5,
    complaintRate: 0.04,
    sendDate: "2025-03-15",
    industry: "Technology",
    subjectLine: "March Tech Updates and Tips",
    fromName: "Tech Insider Team",
    dailyStats: [
      { date: "2025-03-15", opens: 2850, clicks: 1342 },
      { date: "2025-03-16", opens: 1520, clicks: 755 },
      { date: "2025-03-17", opens: 782, clicks: 342 },
      { date: "2025-03-18", opens: 415, clicks: 193 }
    ],
    deviceBreakdown: [
      { device: "Mobile", percentage: 62 },
      { device: "Desktop", percentage: 29 },
      { device: "Tablet", percentage: 9 }
    ],
    timeOfDayStats: [
      { hour: 6, opens: 120 },
      { hour: 8, opens: 386 },
      { hour: 10, opens: 872 },
      { hour: 12, opens: 965 },
      { hour: 14, opens: 782 },
      { hour: 16, opens: 643 },
      { hour: 18, opens: 890 },
      { hour: 20, opens: 560 },
      { hour: 22, opens: 349 }
    ],
    benchmarks: {
      industry: {
        openRate: 21.5,
        clickRate: 2.3,
        unsubscribeRate: 0.26
      }
    }
  });

  const [activeTab, setActiveTab] = useState<string>('overview');

  // Chart data for engagement over time
  const dailyEngagementData = {
    labels: campaign.dailyStats.map(stat => stat.date),
    datasets: [
      {
        label: 'Opens',
        data: campaign.dailyStats.map(stat => stat.opens),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Clicks',
        data: campaign.dailyStats.map(stat => stat.clicks),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        fill: true,
      }
    ],
  };

  // Chart data for device breakdown
  const deviceBreakdownData = {
    labels: campaign.deviceBreakdown.map(item => item.device),
    datasets: [
      {
        data: campaign.deviceBreakdown.map(item => item.percentage),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for hourly engagement
  const hourlyEngagementData = {
    labels: campaign.timeOfDayStats.map(stat => `${stat.hour}:00`),
    datasets: [
      {
        label: 'Opens by Hour',
        data: campaign.timeOfDayStats.map(stat => stat.opens),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for performance vs benchmarks
  const benchmarkComparisonData = {
    labels: ['Open Rate', 'Click Rate', 'Unsubscribe Rate'],
    datasets: [
      {
        label: 'Your Campaign',
        data: [campaign.openRate, campaign.clickRate, campaign.unsubscribeRate],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
      {
        label: 'Industry Benchmark',
        data: [
          campaign.benchmarks.industry.openRate,
          campaign.benchmarks.industry.clickRate,
          campaign.benchmarks.industry.unsubscribeRate
        ],
        backgroundColor: 'rgba(148, 163, 184, 0.8)',
        borderColor: 'rgba(148, 163, 184, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Options for line chart
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
  };

  // Options for bar chart
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Options for pie chart
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  // Calculate performance against benchmarks
  const openRateDifference = ((campaign.openRate - campaign.benchmarks.industry.openRate) / campaign.benchmarks.industry.openRate * 100).toFixed(1);
  const clickRateDifference = ((campaign.clickRate - campaign.benchmarks.industry.clickRate) / campaign.benchmarks.industry.clickRate * 100).toFixed(1);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-5 w-5 text-indigo-500" />
            <CardTitle>{widget.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onRemove(widget.id)}>
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
        <CardDescription>
          In-depth analysis of campaign "{campaign.name}" performance and engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-800">{campaign.name}</h3>
                <div className="text-sm text-muted-foreground">Sent on {campaign.sendDate}</div>
                <div className="text-sm text-muted-foreground">Subject: "{campaign.subjectLine}"</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Sent</div>
                <div className="text-2xl font-semibold">{campaign.sent.toLocaleString()}</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Delivered</div>
                <div className="text-2xl font-semibold">{campaign.delivered.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Bounce Rate: {campaign.bounceRate}%</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Opens</div>
                <div className="text-2xl font-semibold">{campaign.opens.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Open Rate: {campaign.openRate}%</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Clicks</div>
                <div className="text-2xl font-semibold">{campaign.clicks.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Click Rate: {campaign.clickRate}%</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Unsubscribes</div>
                <div className="text-2xl font-semibold">{campaign.unsubscribes}</div>
                <div className="text-xs text-muted-foreground mt-1">Unsubscribe Rate: {campaign.unsubscribeRate}%</div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Complaints</div>
                <div className="text-2xl font-semibold">{campaign.complaints}</div>
                <div className="text-xs text-muted-foreground mt-1">Complaint Rate: {campaign.complaintRate}%</div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-blue-800 mb-1">Performance Highlights</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-200">
                    {openRateDifference}% above benchmark
                  </Badge>
                  Your open rate is significantly higher than the industry average
                </li>
                <li className="flex items-center text-sm">
                  <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-200">
                    {clickRateDifference}% above benchmark
                  </Badge>
                  Your click rate outperforms similar campaigns in your industry
                </li>
                <li className="flex items-center text-sm">
                  <Badge className="mr-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    Note
                  </Badge>
                  Mobile devices represent {campaign.deviceBreakdown[0].percentage}% of all opens
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="engagement" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Daily Engagement Trends</h3>
                <div className="h-64">
                  <Line options={lineChartOptions} data={dailyEngagementData} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-1">Click-to-Open Rate</div>
                  <div className="text-2xl font-semibold">{campaign.clickToOpenRate}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Percentage of readers who clicked after opening
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-1">Peak Engagement</div>
                  <div className="text-2xl font-semibold">{campaign.dailyStats[0].date}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {campaign.dailyStats[0].opens} opens, {campaign.dailyStats[0].clicks} clicks
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="devices" className="mt-0">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Device Distribution</h3>
                <div className="h-64">
                  <Pie options={pieChartOptions} data={deviceBreakdownData} />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium mb-3">Device Breakdown</h3>
                
                {campaign.deviceBreakdown.map((device) => (
                  <div key={device.device} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{device.device}</div>
                      <Badge variant="outline">{device.percentage}%</Badge>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          device.device === 'Mobile' 
                            ? 'bg-indigo-500' 
                            : device.device === 'Desktop' 
                              ? 'bg-green-500' 
                              : 'bg-amber-500'
                        } rounded-full`}
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-amber-50 p-4 rounded-lg mt-4">
                  <h4 className="font-medium text-amber-800 mb-1">Device Insight</h4>
                  <p className="text-sm text-amber-700">
                    Mobile-optimized content is critical, with {campaign.deviceBreakdown[0].percentage}% of your audience 
                    viewing on mobile devices. Ensure your templates are responsive.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timing" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Opens by Hour of Day</h3>
                <div className="h-64">
                  <Bar options={barChartOptions} data={hourlyEngagementData} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-1">Peak Engagement Time</h4>
                  <div className="text-2xl font-semibold text-green-700">12:00 PM</div>
                  <p className="text-sm text-green-700 mt-1">
                    Highest engagement occurs around noon, with a secondary peak at 6 PM. Consider 
                    scheduling important emails during these times.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">Timing Recommendation</h4>
                  <p className="text-sm text-blue-700">
                    Based on this campaign's performance, scheduling your next campaign for 
                    Tuesday or Wednesday around noon may result in higher engagement rates.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="benchmarks" className="mt-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Performance vs. Industry Benchmarks ({campaign.industry})</h3>
                <div className="h-64">
                  <Bar options={barChartOptions} data={benchmarkComparisonData} />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-1">Open Rate</div>
                  <div className="text-2xl font-semibold">{campaign.openRate}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Industry: {campaign.benchmarks.industry.openRate}%
                  </div>
                  <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-200">
                    +{openRateDifference}%
                  </Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-1">Click Rate</div>
                  <div className="text-2xl font-semibold">{campaign.clickRate}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Industry: {campaign.benchmarks.industry.clickRate}%
                  </div>
                  <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-200">
                    +{clickRateDifference}%
                  </Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-1">Unsubscribe Rate</div>
                  <div className="text-2xl font-semibold">{campaign.unsubscribeRate}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Industry: {campaign.benchmarks.industry.unsubscribeRate}%
                  </div>
                  <Badge className="mt-2 bg-amber-100 text-amber-800 hover:bg-amber-200">
                    +{((campaign.unsubscribeRate - campaign.benchmarks.industry.unsubscribeRate) / campaign.benchmarks.industry.unsubscribeRate * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-indigo-800 mb-1">Benchmark Analysis</h4>
                <p className="text-sm text-indigo-700">
                  Your campaign significantly outperforms industry benchmarks for opens and clicks, 
                  indicating effective subject lines and content. The slightly higher unsubscribe rate 
                  suggests potential list quality issues that should be monitored.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CampaignPerformanceAnalyzerWidget;