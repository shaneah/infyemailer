import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ActivityIcon,
  AlertCircle,
  BarChart3Icon,
  BarChart4,
  ChartPieIcon,
  DollarSign,
  FileBarChart2,
  Globe,
  HelpCircle,
  InfoIcon,
  Loader2,
  RefreshCw,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced Chart Card Component
interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  action?: React.ReactNode;
  isLoading?: boolean;
  labelComponent?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  description, 
  children, 
  className = '',
  delay = 0,
  action,
  isLoading = false,
  labelComponent,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className={className}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                {labelComponent && labelComponent}
              </div>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {action && (
              <div>
                {action}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className={`${isLoading ? 'p-6' : 'p-0'}`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-60">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            </div>
          ) : children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Client Advanced Analytics Page
const ClientAdvancedAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('predictive');
  const [timeframe, setTimeframe] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample predictive analytics data
  const [predictiveData, setPredictiveData] = useState<any>(null);
  const [benchmarkingData, setBenchmarkingData] = useState<any>(null);
  const [attributionData, setAttributionData] = useState<any>(null);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch predictive data
        const predictiveRes = await fetch(`/api/advanced-analytics/predictive?timeframe=${timeframe}`);
        if (predictiveRes.ok) {
          const data = await predictiveRes.json();
          setPredictiveData(data);
        }
        
        // Fetch benchmarking data
        const benchmarkingRes = await fetch(`/api/advanced-analytics/benchmarking?timeframe=${timeframe}`);
        if (benchmarkingRes.ok) {
          const data = await benchmarkingRes.json();
          setBenchmarkingData(data);
        }
        
        // Fetch attribution data
        const attributionRes = await fetch(`/api/advanced-analytics/attribution?timeframe=${timeframe}`);
        if (attributionRes.ok) {
          const data = await attributionRes.json();
          setAttributionData(data);
        }
      } catch (error) {
        console.error('Error fetching advanced analytics data:', error);
        toast({
          title: "Failed to load advanced analytics",
          description: "Please try again later or contact support if the problem persists.",
          variant: "destructive",
        });
        
        // Initialize with sample data for testing purposes
        setPredictiveData({
          projectedOpenRate: 26.8,
          projectedClickRate: 4.2,
          projectedConversionRate: 1.5,
          projectionTrend: [
            { month: 'Jan', actual: 24.3, projected: 24.3 },
            { month: 'Feb', actual: 24.8, projected: 24.8 },
            { month: 'Mar', actual: 25.2, projected: 25.2 },
            { month: 'Apr', actual: 25.7, projected: 25.7 },
            { month: 'May', actual: 26.1, projected: 26.1 },
            { month: 'Jun', actual: 26.3, projected: 26.3 },
            { month: 'Jul', actual: null, projected: 26.5 },
            { month: 'Aug', actual: null, projected: 26.8 },
            { month: 'Sep', actual: null, projected: 27.0 },
          ],
          segmentProjections: [
            { segment: 'New subscribers', current: 22.4, projected: 24.3 },
            { segment: 'Regular readers', current: 31.2, projected: 32.7 },
            { segment: 'Inactive users', current: 8.7, projected: 11.5 },
            { segment: 'High-value customers', current: 38.6, projected: 40.3 },
          ],
          optimizationRecommendations: [
            { id: 1, type: 'Send time', current: 'Tuesday 10am', recommended: 'Thursday 2pm', projectedLift: '+2.8%' },
            { id: 2, type: 'Subject line', current: 'Generic announcements', recommended: 'Personalized questions', projectedLift: '+3.5%' },
            { id: 3, type: 'Content length', current: 'Long-form (800+ words)', recommended: 'Medium (400-600 words)', projectedLift: '+1.9%' },
          ]
        });
        
        setBenchmarkingData({
          industryComparison: [
            { metric: 'Open Rate', yours: 24.8, industry: 21.2, topPerformers: 32.6 },
            { metric: 'Click Rate', yours: 3.6, industry: 2.5, topPerformers: 5.8 },
            { metric: 'Conversion Rate', yours: 1.2, industry: 0.9, topPerformers: 2.4 },
            { metric: 'Revenue Per Email', yours: 0.38, industry: 0.21, topPerformers: 0.71 },
          ],
          competitorRanking: [
            { metric: 'Open Rate', value: 24.8, position: 3, totalCompetitors: 12 },
            { metric: 'Click Rate', value: 3.6, position: 4, totalCompetitors: 12 },
            { metric: 'List Growth', value: 2.3, position: 7, totalCompetitors: 12 },
            { metric: 'Engagement Score', value: 68, position: 5, totalCompetitors: 12 },
          ],
          trendsOverTime: [
            { quarter: 'Q1 2024', yours: 23.7, industry: 20.8, topPerformers: 31.5 },
            { quarter: 'Q2 2024', yours: 24.8, industry: 21.2, topPerformers: 32.6 },
            { quarter: 'Q3 2024', yours: 25.6, industry: 21.5, topPerformers: 33.2 },
            { quarter: 'Q4 2024', yours: 26.4, industry: 21.9, topPerformers: 33.8 },
          ]
        });
        
        setAttributionData({
          revenueByChannel: [
            { channel: 'Direct', revenue: 12480, percentage: 35 },
            { channel: 'Email', revenue: 8560, percentage: 24 },
            { channel: 'Organic', revenue: 5680, percentage: 16 },
            { channel: 'Social', revenue: 4960, percentage: 14 },
            { channel: 'Paid', revenue: 3900, percentage: 11 },
          ],
          emailCampaignROI: [
            { campaign: 'Product Launch', cost: 1200, revenue: 16800, roi: 14 },
            { campaign: 'Weekly Newsletter', cost: 800, revenue: 5400, roi: 6.75 },
            { campaign: 'Customer Win-back', cost: 1500, revenue: 9200, roi: 6.13 },
            { campaign: 'Holiday Special', cost: 2000, revenue: 24500, roi: 12.25 },
          ],
          conversionJourney: [
            { step: 'Email Open', count: 12480, dropoff: 0 },
            { step: 'Email Click', count: 3120, dropoff: 75 },
            { step: 'Website Visit', count: 2808, dropoff: 10 },
            { step: 'Add to Cart', count: 1123, dropoff: 60 },
            { step: 'Purchase', count: 562, dropoff: 50 },
          ],
          timeToConversion: [
            { period: 'Same day', conversions: 243 },
            { period: '1-2 days', conversions: 158 },
            { period: '3-7 days', conversions: 86 },
            { period: '8-14 days', conversions: 47 },
            { period: '15+ days', conversions: 28 },
          ]
        });
      } finally {
        // Simulate loading delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    
    fetchData();
  }, [timeframe, toast]);
  
  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    tertiary: '#10b981',
    quaternary: '#f59e0b',
    yours: '#3b82f6',
    industry: '#94a3b8',
    topPerformers: '#10b981',
    actual: '#3b82f6',
    projected: '#8b5cf6',
  };
  
  return (
    <div className="px-6 py-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-gray-500">AI-powered insights and competitive benchmarking</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
              toast({
                title: "Analytics data refreshed",
                description: "The latest data has been loaded successfully.",
              });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="predictive" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictive" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Predictive Analytics
          </TabsTrigger>
          <TabsTrigger value="benchmarking" className="flex items-center">
            <BarChart4 className="h-4 w-4 mr-2" />
            Competitor Benchmarking
          </TabsTrigger>
          <TabsTrigger value="attribution" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue Attribution
          </TabsTrigger>
        </TabsList>
        
        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive" className="space-y-4">
          {predictiveData && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Projected Next Month</CardDescription>
                      <CardTitle className="text-2xl font-bold text-blue-600">
                        {predictiveData.projectedOpenRate}% Open Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                        <span className="text-green-500 font-medium mr-1">+0.5%</span> from current
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Projected Next Month</CardDescription>
                      <CardTitle className="text-2xl font-bold text-purple-600">
                        {predictiveData.projectedClickRate}% Click Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                        <span className="text-green-500 font-medium mr-1">+0.6%</span> from current
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Projected Next Month</CardDescription>
                      <CardTitle className="text-2xl font-bold text-green-600">
                        {predictiveData.projectedConversionRate}% Conversion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                        <span className="text-green-500 font-medium mr-1">+0.3%</span> from current
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard 
                  title="Performance Projection" 
                  description="Projected open rates for the next three months"
                  isLoading={isLoading}
                  delay={1}
                >
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={predictiveData.projectionTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          name="Actual" 
                          stroke={chartColors.actual} 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="projected" 
                          name="Projected" 
                          stroke={chartColors.projected} 
                          strokeWidth={2} 
                          strokeDasharray="5 5" 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard 
                  title="Segment Projections" 
                  description="Projected performance by audience segment"
                  isLoading={isLoading}
                  delay={2}
                >
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={predictiveData.segmentProjections} 
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 'dataMax + 5']} />
                        <YAxis type="category" dataKey="segment" width={150} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar 
                          dataKey="current" 
                          name="Current Open Rate" 
                          fill={chartColors.actual} 
                          radius={[0, 0, 0, 0]} 
                          barSize={20}
                        />
                        <Bar 
                          dataKey="projected" 
                          name="Projected Open Rate" 
                          fill={chartColors.projected} 
                          radius={[0, 0, 0, 0]} 
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
              
              <ChartCard 
                title="AI Optimization Recommendations" 
                description="Actions that may improve campaign performance"
                isLoading={isLoading}
                delay={3}
                labelComponent={
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Generated
                  </span>
                }
              >
                <div className="px-1">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Optimization Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Current Setting</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Recommended Setting</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Projected Lift</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictiveData.optimizationRecommendations.map((rec: any) => (
                          <tr key={rec.id} className="border-b">
                            <td className="py-3 px-4 font-medium">{rec.type}</td>
                            <td className="py-3 px-4 text-gray-600">{rec.current}</td>
                            <td className="py-3 px-4 text-blue-600 font-medium">{rec.recommended}</td>
                            <td className="py-3 px-4">
                              <span className="text-green-600 font-medium">{rec.projectedLift}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">Apply</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ChartCard>
            </>
          )}
        </TabsContent>
        
        {/* Competitor Benchmarking Tab */}
        <TabsContent value="benchmarking" className="space-y-4">
          {benchmarkingData && (
            <>
              <ChartCard 
                title="Industry Comparison" 
                description="Your metrics compared to industry averages and top performers"
                isLoading={isLoading}
                delay={1}
              >
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={benchmarkingData.industryComparison} 
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar 
                        dataKey="yours" 
                        name="Your Performance" 
                        fill={chartColors.yours} 
                        radius={[4, 4, 0, 0]} 
                        barSize={20}
                      />
                      <Bar 
                        dataKey="industry" 
                        name="Industry Average" 
                        fill={chartColors.industry} 
                        radius={[4, 4, 0, 0]} 
                        barSize={20}
                      />
                      <Bar 
                        dataKey="topPerformers" 
                        name="Top Performers" 
                        fill={chartColors.topPerformers} 
                        radius={[4, 4, 0, 0]} 
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard 
                  title="Competitive Ranking" 
                  description="Your position among competitors in key metrics"
                  isLoading={isLoading}
                  delay={2}
                >
                  <div className="px-1">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Metric</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Your Value</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Ranking</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Percentile</th>
                          </tr>
                        </thead>
                        <tbody>
                          {benchmarkingData.competitorRanking.map((rank: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="py-3 px-4 font-medium">{rank.metric}</td>
                              <td className="py-3 px-4 text-blue-600 font-medium">{rank.value}{rank.metric.includes('Rate') ? '%' : ''}</td>
                              <td className="py-3 px-4">
                                {rank.position} <span className="text-gray-500">of {rank.totalCompetitors}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                                    <div 
                                      className="h-full bg-blue-600 rounded-full" 
                                      style={{ width: `${(1 - (rank.position - 1) / rank.totalCompetitors) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-gray-700">
                                    {Math.round((1 - (rank.position - 1) / rank.totalCompetitors) * 100)}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ChartCard>
                
                <ChartCard 
                  title="Performance Trends Over Time" 
                  description="How your metrics have evolved compared to the industry"
                  isLoading={isLoading}
                  delay={3}
                >
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={benchmarkingData.trendsOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="quarter" />
                        <YAxis domain={[0, 'dataMax + 5']} />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="yours" 
                          name="Your Performance" 
                          stroke={chartColors.yours} 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="industry" 
                          name="Industry Average" 
                          stroke={chartColors.industry} 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="topPerformers" 
                          name="Top Performers" 
                          stroke={chartColors.topPerformers} 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Revenue Attribution Tab */}
        <TabsContent value="attribution" className="space-y-4">
          {attributionData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard 
                  title="Revenue by Channel" 
                  description="How your revenue is distributed across marketing channels"
                  isLoading={isLoading}
                  delay={1}
                >
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={attributionData.revenueByChannel}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                          nameKey="channel"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {attributionData.revenueByChannel.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={[
                              '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'
                            ][index % 5]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
                
                <ChartCard 
                  title="Email Campaign ROI" 
                  description="Return on investment for recent email campaigns"
                  isLoading={isLoading}
                  delay={2}
                >
                  <div className="px-1">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Campaign</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500">Cost</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500">ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attributionData.emailCampaignROI.map((campaign: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="py-3 px-4 font-medium">{campaign.campaign}</td>
                              <td className="py-3 px-4 text-right text-gray-600">${campaign.cost.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right text-blue-600 font-medium">${campaign.revenue.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">
                                <span className="text-green-600 font-medium">{campaign.roi}x</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ChartCard>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard 
                  title="Conversion Journey" 
                  description="Customer journey from email to purchase"
                  isLoading={isLoading}
                  delay={3}
                >
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={attributionData.conversionJourney} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="step" />
                        <YAxis />
                        <RechartsTooltip formatter={(value: any) => [value.toLocaleString(), 'Users']} />
                        <Bar 
                          dataKey="count" 
                          name="Users" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Funnel Analysis</h3>
                      <div className="flex items-center space-x-1">
                        {attributionData.conversionJourney.map((step: any, index: number) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="h-6 w-full bg-blue-600 rounded-sm" 
                              style={{ 
                                opacity: 1 - (index * 0.15),
                                height: `${Math.max(20, (step.count / attributionData.conversionJourney[0].count) * 100)}px`
                              }}
                            ></div>
                            <div className="text-xs text-gray-500 mt-1">{step.step}</div>
                            <div className="text-xs font-medium">{Math.round((step.count / attributionData.conversionJourney[0].count) * 100)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ChartCard>
                
                <ChartCard 
                  title="Time to Conversion" 
                  description="How long it takes for email recipients to convert"
                  isLoading={isLoading}
                  delay={4}
                >
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={attributionData.timeToConversion} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <RechartsTooltip formatter={(value: any) => [value.toLocaleString(), 'Conversions']} />
                        <Bar 
                          dataKey="conversions" 
                          name="Conversions" 
                          fill="#8b5cf6" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientAdvancedAnalytics;