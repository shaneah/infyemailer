import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Activity, Mail, BarChart3, ChevronRight, TrendingUp,
  Sparkles, RefreshCw, ZapIcon, MousePointerClick, EyeIcon, ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// WebSocket connection for real-time data
let socket: WebSocket | null = null;

// Type definitions for our data
interface EmailMetric {
  timestamp: number;
  opens: number;
  clicks: number;
  bounces: number;
  delivered: number;
}

interface EmailPerformanceData {
  realtimeMetrics: EmailMetric[];
  campaignPerformance: {
    name: string;
    opens: number;
    clicks: number;
    bounces: number;
  }[];
  deviceBreakdown: {
    name: string;
    value: number;
  }[];
  geographicData: {
    country: string;
    opens: number;
    clicks: number;
  }[];
  hourlyActivity: {
    hour: string;
    opens: number;
    clicks: number;
  }[];
  engagementScore: number;
  emailsSent: number;
  uniqueOpens: number;
  clickRate: number;
}

export default function EmailPerformanceDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<EmailPerformanceData | null>(null);
  const [isRealtime, setIsRealtime] = useState(true);

  // Generate animated particles for background
  const particles = useMemo(() => {
    const totalParticles = 50;
    return Array.from({ length: totalParticles }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.2 + 0.1
    }));
  }, []);

  // Colors for charts
  const COLORS = ["#d4af37", "rgba(212, 175, 55, 0.8)", "rgba(212, 175, 55, 0.6)", 
                 "rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.6)"];

  // Simulate initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from your API
        // For now, generate mock data
        const initialData: EmailPerformanceData = {
          realtimeMetrics: Array.from({ length: 20 }).map((_, i) => ({
            timestamp: Date.now() - (19 - i) * 60000, // Last 20 minutes, 1 minute intervals
            opens: Math.floor(Math.random() * 100 + 50), // 50-150 opens
            clicks: Math.floor(Math.random() * 30 + 10), // 10-40 clicks
            bounces: Math.floor(Math.random() * 5),     // 0-5 bounces
            delivered: Math.floor(Math.random() * 50 + 150), // 150-200 delivered
          })),
          campaignPerformance: [
            { name: "Monthly Newsletter", opens: 2430, clicks: 358, bounces: 12 },
            { name: "Product Launch", opens: 1856, clicks: 312, bounces: 8 },
            { name: "Spring Promotion", opens: 3104, clicks: 512, bounces: 15 },
            { name: "Customer Survey", opens: 1204, clicks: 182, bounces: 5 },
          ],
          deviceBreakdown: [
            { name: "Mobile", value: 45 },
            { name: "Desktop", value: 35 },
            { name: "Tablet", value: 20 },
          ],
          geographicData: [
            { country: "United States", opens: 2540, clicks: 423 },
            { country: "United Kingdom", opens: 1256, clicks: 231 },
            { country: "Canada", opens: 856, clicks: 167 },
            { country: "Australia", opens: 645, clicks: 112 },
            { country: "Germany", opens: 512, clicks: 98 },
          ],
          hourlyActivity: Array.from({ length: 24 }).map((_, i) => ({
            hour: `${i}:00`,
            opens: Math.floor(Math.random() * 80 + 20), // 20-100 opens
            clicks: Math.floor(Math.random() * 20 + 5), // 5-25 clicks
          })),
          engagementScore: 78.5,
          emailsSent: 15420,
          uniqueOpens: 7865,
          clickRate: 22.4,
        };

        setPerformanceData(initialData);
      } catch (error) {
        console.error("Error fetching performance data:", error);
        toast({
          title: "Error",
          description: "Failed to load email performance data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!isRealtime || !performanceData) return;
    
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log("WebSocket connection established");
        // Subscribe to real-time email metrics updates
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ 
            type: 'subscribe', 
            channel: 'email-metrics' 
          }));
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'email-metrics-update') {
            // Update the real-time metrics with the new data point
            setPerformanceData(prevData => {
              if (!prevData) return null;
              
              // Add the new data point and remove the oldest one
              const updatedMetrics = [...prevData.realtimeMetrics.slice(1), {
                timestamp: Date.now(),
                opens: data.opens || Math.floor(Math.random() * 100 + 50),
                clicks: data.clicks || Math.floor(Math.random() * 30 + 10),
                bounces: data.bounces || Math.floor(Math.random() * 5),
                delivered: data.delivered || Math.floor(Math.random() * 50 + 150),
              }];
              
              return {
                ...prevData,
                realtimeMetrics: updatedMetrics,
                // Update other stats as needed
                engagementScore: data.engagementScore || prevData.engagementScore,
                uniqueOpens: data.uniqueOpens || prevData.uniqueOpens,
                clickRate: data.clickRate || prevData.clickRate,
              };
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection Error",
          description: "Real-time updates unavailable. Will retry shortly.",
          variant: "destructive",
        });
      };
      
      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }
    
    // Until we have a real backend WebSocket, simulate real-time updates with an interval
    const simulateInterval = setInterval(() => {
      if (!performanceData) return;
      
      setPerformanceData(prevData => {
        if (!prevData) return null;
        
        // Simulate a new data point
        const updatedMetrics = [...prevData.realtimeMetrics.slice(1), {
          timestamp: Date.now(),
          opens: Math.floor(Math.random() * 100 + 50),
          clicks: Math.floor(Math.random() * 30 + 10),
          bounces: Math.floor(Math.random() * 5),
          delivered: Math.floor(Math.random() * 50 + 150),
        }];
        
        return {
          ...prevData,
          realtimeMetrics: updatedMetrics,
          engagementScore: parseFloat((prevData.engagementScore + (Math.random() * 2 - 1)).toFixed(1)),
          uniqueOpens: prevData.uniqueOpens + Math.floor(Math.random() * 10),
          clickRate: parseFloat((prevData.clickRate + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        };
      });
    }, 3000); // Update every 3 seconds
    
    // Clean up when component unmounts
    return () => {
      if (socket) {
        socket.close();
      }
      clearInterval(simulateInterval);
    };
  }, [isRealtime, performanceData, toast]);

  const handleRealTimeToggle = () => {
    setIsRealtime(!isRealtime);
    toast({
      title: isRealtime ? "Real-time updates paused" : "Real-time updates activated",
      description: isRealtime 
        ? "Dashboard data will remain static until reactivated" 
        : "You'll now receive live updates every few seconds",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1929] via-[#112b4a] to-[#1a3a5f]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#d4af37]/30 rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#d4af37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-white/80 font-medium">Loading your performance data...</p>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1929] via-[#112b4a] to-[#1a3a5f] flex items-center justify-center p-6">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/10 shadow-2xl border border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-xl text-[#ff6b6b]">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80">There was an error loading your performance data. Please try again later.</p>
            <Button 
              onClick={() => setLocation('/client-dashboard')} 
              className="mt-4 bg-gradient-to-r from-[#d4af37] to-[#d4af37]/70 hover:from-[#d4af37]/70 hover:to-[#d4af37] text-white border-none"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format date for display
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col overflow-hidden min-h-screen bg-gradient-to-br from-[#0a1929] via-[#112b4a] to-[#1a3a5f]">
      {/* Particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, index) => (
          <div 
            key={index}
            className="absolute rounded-full bg-[#d4af37]"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(212, 175, 55, 0.2)`
            }}
          />
        ))}
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0a1929] to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a1929] to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-[#d4af37]/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-[#1a3a5f]/30 blur-3xl"></div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 text-white relative z-20 shadow-lg">
          <div className="container mx-auto py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => setLocation('/client-dashboard')}
                >
                  <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-[#d4af37] to-white inline-block text-transparent bg-clip-text">
                    Email Performance Dashboard
                  </h1>
                  <div className="w-32 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#d4af37] to-transparent my-1"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleRealTimeToggle} 
                  className={`text-white border-white/20 bg-white/5 hover:bg-white/10 font-medium ${
                    isRealtime ? 'text-[#d4af37] border-[#d4af37]/30' : ''
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRealtime ? 'animate-spin' : ''}`} />
                  {isRealtime ? 'Live Updates' : 'Paused'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          <div className="container mx-auto">
            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="backdrop-blur-md bg-white/10 border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
                  <CardTitle className="text-base font-bold text-white">Engagement Score</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                    <ZapIcon className="h-5 w-5 text-[#d4af37]" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-xl -mt-10 -mr-10 opacity-70"></div>
                  <div className="relative">
                    <div className={`text-4xl font-bold bg-gradient-to-r from-white via-[#d4af37] to-white inline-block text-transparent bg-clip-text ${isRealtime ? 'animate-pulse duration-500' : ''}`}>
                      {performanceData.engagementScore}%
                    </div>
                    {isRealtime && (
                      <div className="absolute h-3 w-3 rounded-full bg-[#d4af37] -right-3 top-0 after:absolute after:h-3 after:w-3 after:rounded-full after:bg-[#d4af37]/60 after:animate-ping"></div>
                    )}
                  </div>
                  <p className="text-sm text-white/70 mt-1 font-medium">Overall engagement rating</p>
                  
                  <div className="mt-4 flex items-center gap-1 text-xs text-white/50">
                    <TrendingUp className="h-3 w-3 text-[#d4af37]" />
                    <span>4.2% higher than average</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
                  <CardTitle className="text-base font-bold text-white">Emails Sent</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#d4af37]" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-xl -mt-10 -mr-10 opacity-70"></div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-white via-[#d4af37] to-white inline-block text-transparent bg-clip-text">
                    {performanceData.emailsSent.toLocaleString()}
                  </div>
                  <p className="text-sm text-white/70 mt-1 font-medium">Total emails delivered</p>
                  
                  <div className="mt-4 flex items-center gap-1 text-xs text-white/50">
                    <TrendingUp className="h-3 w-3 text-[#d4af37]" />
                    <span>1,250 emails sent today</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
                  <CardTitle className="text-base font-bold text-white">Unique Opens</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                    <EyeIcon className="h-5 w-5 text-[#d4af37]" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-xl -mt-10 -mr-10 opacity-70"></div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-white via-[#d4af37] to-white inline-block text-transparent bg-clip-text">
                    {performanceData.uniqueOpens.toLocaleString()}
                  </div>
                  <p className="text-sm text-white/70 mt-1 font-medium">Unique email opens</p>
                  
                  <div className="mt-4 flex items-center gap-1 text-xs text-white/50">
                    <TrendingUp className="h-3 w-3 text-[#d4af37]" />
                    <span>51% of total sent</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
                  <CardTitle className="text-base font-bold text-white">Click Rate</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                    <MousePointerClick className="h-5 w-5 text-[#d4af37]" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-xl -mt-10 -mr-10 opacity-70"></div>
                  <div className="relative">
                    <div className={`text-4xl font-bold bg-gradient-to-r from-white via-[#d4af37] to-white inline-block text-transparent bg-clip-text ${isRealtime ? 'animate-pulse duration-700' : ''}`}>
                      {performanceData.clickRate}%
                    </div>
                    {isRealtime && (
                      <div className="absolute h-3 w-3 rounded-full bg-[#d4af37] -right-3 top-0 after:absolute after:h-3 after:w-3 after:rounded-full after:bg-[#d4af37]/60 after:animate-ping"></div>
                    )}
                  </div>
                  <p className="text-sm text-white/70 mt-1 font-medium">Average click-through rate</p>
                  
                  <div className="mt-4 flex items-center gap-1 text-xs text-white/50">
                    <TrendingUp className="h-3 w-3 text-[#d4af37]" />
                    <span>3.2% higher than industry average</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Real-time Chart */}
            <Card className="backdrop-blur-md bg-white/10 border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 mb-8">
              <CardHeader className="pb-2 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center mr-3">
                      <Activity className="h-4 w-4 text-[#d4af37]" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">Real-Time Performance</CardTitle>
                      <CardDescription className="text-white/70 font-medium">
                        Live tracking of email opens and clicks
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="relative mr-2">
                      <span className={`inline-flex h-3 w-3 rounded-full ${isRealtime ? 'bg-[#d4af37]' : 'bg-gray-500'}`}></span>
                      {isRealtime && (
                        <span className="absolute inset-0 h-3 w-3 rounded-full bg-[#d4af37] animate-ping"></span>
                      )}
                    </div>
                    <span className={`text-sm ${isRealtime ? 'text-[#d4af37] font-medium' : 'text-white/70'}`}>
                      {isRealtime ? 'Live data' : 'Paused'}
                    </span>
                    {isRealtime && (
                      <div className="ml-2 px-2 py-0.5 bg-[#d4af37]/20 rounded-full border border-[#d4af37]/40">
                        <span className="text-xs text-[#d4af37] font-medium">Realtime</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[360px] pt-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-xl -mt-10 -mr-10 opacity-70"></div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceData.realtimeMetrics}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 20
                    }}
                  >
                    <defs>
                      <linearGradient id="openGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{fill: 'rgba(255,255,255,0.7)'}} 
                      stroke="rgba(255,255,255,0.2)"
                      tickFormatter={formatTimestamp} 
                    />
                    <YAxis tick={{fill: 'rgba(255,255,255,0.7)'}} stroke="rgba(255,255,255,0.2)" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(26, 58, 95, 0.9)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        color: 'white'
                      }}
                      labelFormatter={formatTimestamp}
                      labelStyle={{color: '#d4af37'}}
                      itemStyle={{color: 'white'}}
                    />
                    <Legend wrapperStyle={{color: 'white', paddingTop: '20px'}} />
                    <Area 
                      type="monotone" 
                      dataKey="opens" 
                      stackId="1"
                      stroke="#d4af37" 
                      fillOpacity={1}
                      fill="url(#openGradient)" 
                      strokeWidth={2}
                      activeDot={{
                        r: 6, 
                        stroke: 'white', 
                        strokeWidth: 2,
                        fill: '#d4af37',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stackId="2"
                      stroke="white" 
                      fillOpacity={1}
                      fill="url(#clickGradient)" 
                      strokeWidth={2}
                      activeDot={{
                        r: 6, 
                        stroke: '#d4af37', 
                        strokeWidth: 2,
                        fill: 'white',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Campaign Performance and Device Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="backdrop-blur-md bg-white/10 border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-2 border-b border-white/10">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center mr-3">
                      <BarChart3 className="h-4 w-4 text-[#d4af37]" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Campaign Performance</CardTitle>
                  </div>
                  <CardDescription className="text-white/70 font-medium">
                    Comparison of recent email campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[360px] pt-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-xl -mt-10 -mr-10 opacity-70"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData.campaignPerformance}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 60
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis type="number" tick={{fill: 'rgba(255,255,255,0.7)'}} stroke="rgba(255,255,255,0.2)" />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        tick={{fill: 'rgba(255,255,255,0.7)'}} 
                        stroke="rgba(255,255,255,0.2)"
                        width={120}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(26, 58, 95, 0.9)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          color: 'white'
                        }}
                        labelStyle={{color: '#d4af37'}}
                        itemStyle={{color: 'white'}}
                      />
                      <Legend wrapperStyle={{color: 'white'}} />
                      <Bar dataKey="opens" fill="#d4af37" name="Opens" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="clicks" fill="#FFFFFF" name="Clicks" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-2 border-b border-white/10">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center mr-3">
                      <Sparkles className="h-4 w-4 text-[#d4af37]" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Hourly Activity</CardTitle>
                  </div>
                  <CardDescription className="text-white/70 font-medium">
                    Email activity distribution by hour
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[360px] pt-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-xl -mt-10 -mr-10 opacity-70"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceData.hourlyActivity}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 20
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="hour" 
                        tick={{fill: 'rgba(255,255,255,0.7)'}} 
                        stroke="rgba(255,255,255,0.2)"
                      />
                      <YAxis tick={{fill: 'rgba(255,255,255,0.7)'}} stroke="rgba(255,255,255,0.2)" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(26, 58, 95, 0.9)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          color: 'white'
                        }}
                        labelStyle={{color: '#d4af37'}}
                        itemStyle={{color: 'white'}}
                      />
                      <Legend wrapperStyle={{color: 'white'}} />
                      <Line 
                        type="monotone" 
                        dataKey="opens" 
                        name="Opens" 
                        stroke="#d4af37" 
                        strokeWidth={2}
                        dot={{fill: '#d4af37', strokeWidth: 2, r: 4, strokeDasharray: ''}}
                        activeDot={{fill: '#d4af37', stroke: 'white', strokeWidth: 2, r: 6}}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="clicks" 
                        name="Clicks" 
                        stroke="#ffffff" 
                        strokeWidth={2}
                        dot={{fill: '#ffffff', strokeWidth: 2, r: 4, strokeDasharray: ''}}
                        activeDot={{fill: '#ffffff', stroke: '#d4af37', strokeWidth: 2, r: 6}}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Geographic Data and Device Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-2 backdrop-blur-md bg-white/10 border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-2 border-b border-white/10">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center mr-3">
                      <ExternalLink className="h-4 w-4 text-[#d4af37]" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Geographic Performance</CardTitle>
                  </div>
                  <CardDescription className="text-white/70 font-medium">
                    Email metrics by country
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px] pt-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-xl -mt-10 -mr-10 opacity-70"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData.geographicData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 20
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="country" 
                        tick={{fill: 'rgba(255,255,255,0.7)'}} 
                        stroke="rgba(255,255,255,0.2)"
                      />
                      <YAxis tick={{fill: 'rgba(255,255,255,0.7)'}} stroke="rgba(255,255,255,0.2)" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(26, 58, 95, 0.9)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          color: 'white'
                        }}
                        labelStyle={{color: '#d4af37'}}
                        itemStyle={{color: 'white'}}
                      />
                      <Legend wrapperStyle={{color: 'white'}} />
                      <Bar 
                        dataKey="opens" 
                        fill="#d4af37" 
                        name="Opens" 
                        radius={[4, 4, 0, 0]} 
                        barSize={30}
                      />
                      <Bar 
                        dataKey="clicks" 
                        fill="#FFFFFF" 
                        name="Clicks" 
                        radius={[4, 4, 0, 0]} 
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-2 border-b border-white/10">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center mr-3">
                      <Sparkles className="h-4 w-4 text-[#d4af37]" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Device Breakdown</CardTitle>
                  </div>
                  <CardDescription className="text-white/70 font-medium">
                    Email opens by device type
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px] pt-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-xl -mt-10 -mr-10 opacity-70"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceData.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={{stroke: 'rgba(255,255,255,0.3)'}}
                        label={({ name, percent }) => (
                          <text x={0} y={0} fill="#ffffff" textAnchor="middle" dominantBaseline="central">
                            {`${name}: ${(percent * 100).toFixed(0)}%`}
                          </text>
                        )}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {performanceData.deviceBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="rgba(10, 25, 41, 0.5)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(26, 58, 95, 0.9)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '6px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          color: 'white'
                        }}
                        labelStyle={{color: '#d4af37'}}
                        itemStyle={{color: 'white'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <Button
                className="bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30 border border-[#d4af37]/30 rounded-full px-6 group"
                onClick={() => window.print()}
              >
                Export as PDF
              </Button>
              <Button
                className="bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/30 border border-[#d4af37]/30 rounded-full px-6 group"
              >
                Schedule Report
              </Button>
              <Button
                className="bg-gradient-to-r from-[#d4af37] to-[#d4af37]/70 hover:from-[#d4af37]/70 hover:to-[#d4af37] text-white border-none rounded-full px-6 group"
                onClick={() => setLocation('/client-dashboard')}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}