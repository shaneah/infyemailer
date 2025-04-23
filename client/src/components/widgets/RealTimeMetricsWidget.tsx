import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, ArrowUpRight, ArrowDownRight, HelpCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Widget } from '@/hooks/useWidgets';

interface RealTimeMetricsProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

// Engagement score calculation
const calculateEngagementScore = (opens: number, clicks: number, bounceRate: number): number => {
  // A simple engagement formula - can be adjusted based on business rules
  const clickToOpenRate = opens > 0 ? (clicks / opens) * 100 : 0;
  const engagementScore = ((clickToOpenRate * 0.7) + ((100 - bounceRate) * 0.3));
  return Math.round(Math.min(100, Math.max(0, engagementScore)));
};

// Function to get score color
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

// Function to get trend color and icon
const getTrendInfo = (value: number, prevValue: number) => {
  const percentChange = prevValue ? ((value - prevValue) / prevValue) * 100 : 0;
  const isPositive = percentChange >= 0;
  
  return {
    color: isPositive ? 'text-green-500' : 'text-red-500',
    icon: isPositive ? ArrowUpRight : ArrowDownRight,
    value: Math.abs(percentChange).toFixed(1)
  };
};

const RealTimeMetricsWidget: React.FC<RealTimeMetricsProps> = ({ widget, onRemove }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metricsPulse, setMetricsPulse] = useState<string | null>(null);
  const [currentData, setCurrentData] = useState({
    activeSubscribers: 234,
    opensPastHour: 42,
    clicksPastHour: 15,
    bounceRate: 2.4,
    lastUpdated: new Date().toLocaleTimeString()
  });
  const [prevData, setPrevData] = useState({
    activeSubscribers: 210,
    opensPastHour: 38,
    clicksPastHour: 12,
    bounceRate: 2.7
  });

  // Current engagement score
  const engagementScore = calculateEngagementScore(
    currentData.opensPastHour, 
    currentData.clicksPastHour, 
    currentData.bounceRate
  );
  
  // Previous engagement score
  const prevEngagementScore = calculateEngagementScore(
    prevData.opensPastHour, 
    prevData.clicksPastHour, 
    prevData.bounceRate
  );
  
  // Trends
  const subscribersTrend = getTrendInfo(currentData.activeSubscribers, prevData.activeSubscribers);
  const opensTrend = getTrendInfo(currentData.opensPastHour, prevData.opensPastHour);
  const clicksTrend = getTrendInfo(currentData.clicksPastHour, prevData.clicksPastHour);
  const bounceTrend = getTrendInfo(currentData.bounceRate, prevData.bounceRate);
  const scoreTrend = getTrendInfo(engagementScore, prevEngagementScore);

  // Simulate fetching real-time data
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Save current data as previous
    setPrevData({
      activeSubscribers: currentData.activeSubscribers,
      opensPastHour: currentData.opensPastHour,
      clicksPastHour: currentData.clicksPastHour,
      bounceRate: currentData.bounceRate
    });
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Generate some random fluctuations for demo
      const randomChange = (min: number, max: number) => Math.random() * (max - min) + min;
      
      setCurrentData({
        activeSubscribers: Math.floor(currentData.activeSubscribers * (1 + randomChange(-0.05, 0.1))),
        opensPastHour: Math.floor(currentData.opensPastHour * (1 + randomChange(-0.15, 0.2))),
        clicksPastHour: Math.floor(currentData.clicksPastHour * (1 + randomChange(-0.1, 0.25))),
        bounceRate: parseFloat((currentData.bounceRate * (1 + randomChange(-0.2, 0.15))).toFixed(1)),
        lastUpdated: new Date().toLocaleTimeString()
      });
      
      setIsRefreshing(false);
    }, 1200);
  };

  // Pulse animation effect when values change
  useEffect(() => {
    if (metricsPulse) return;

    if (!isRefreshing) {
      setMetricsPulse('subscriber');
      setTimeout(() => setMetricsPulse('opens'), 300);
      setTimeout(() => setMetricsPulse('clicks'), 600);
      setTimeout(() => setMetricsPulse('bounce'), 900);
      setTimeout(() => setMetricsPulse('score'), 1200);
      setTimeout(() => setMetricsPulse(null), 1500);
    }
  }, [currentData, isRefreshing, metricsPulse]);

  // Auto-refresh every 45 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refreshData();
    }, 45000);
    
    return () => clearInterval(timer);
  }, [currentData]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <Activity className="mr-2 h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This widget shows real-time metrics about your email campaign performance over the past hour. The engagement score combines your open and click rates with bounce performance.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 ${isRefreshing ? 'animate-pulse' : ''}`} 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-purple-600' : 'text-gray-500'}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(widget.id)}>
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Subscriber Metric */}
            <div className={`p-4 rounded-lg border ${metricsPulse === 'subscriber' ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
              <motion.div
                className="flex flex-col space-y-1"
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xs font-medium text-gray-500">Active Subscribers</span>
                <div className="flex items-end">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentData.activeSubscribers}
                      className="text-2xl font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentData.activeSubscribers.toLocaleString()}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className={`flex items-center text-xs ${subscribersTrend.color}`}>
                  <subscribersTrend.icon className="h-3 w-3 mr-1" />
                  <span>{subscribersTrend.value}%</span>
                </div>
              </motion.div>
            </div>

            {/* Opens Metric */}
            <div className={`p-4 rounded-lg border ${metricsPulse === 'opens' ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
              <motion.div
                className="flex flex-col space-y-1"
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xs font-medium text-gray-500">Opens (Last Hour)</span>
                <div className="flex items-end">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentData.opensPastHour}
                      className="text-2xl font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentData.opensPastHour}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className={`flex items-center text-xs ${opensTrend.color}`}>
                  <opensTrend.icon className="h-3 w-3 mr-1" />
                  <span>{opensTrend.value}%</span>
                </div>
              </motion.div>
            </div>

            {/* Clicks Metric */}
            <div className={`p-4 rounded-lg border ${metricsPulse === 'clicks' ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
              <motion.div
                className="flex flex-col space-y-1"
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xs font-medium text-gray-500">Clicks (Last Hour)</span>
                <div className="flex items-end">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentData.clicksPastHour}
                      className="text-2xl font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentData.clicksPastHour}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className={`flex items-center text-xs ${clicksTrend.color}`}>
                  <clicksTrend.icon className="h-3 w-3 mr-1" />
                  <span>{clicksTrend.value}%</span>
                </div>
              </motion.div>
            </div>

            {/* Bounce Rate Metric */}
            <div className={`p-4 rounded-lg border ${metricsPulse === 'bounce' ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}>
              <motion.div
                className="flex flex-col space-y-1"
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xs font-medium text-gray-500">Bounce Rate</span>
                <div className="flex items-end">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentData.bounceRate}
                      className="text-2xl font-bold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentData.bounceRate}%
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className={`flex items-center text-xs ${bounceTrend.color}`}>
                  <bounceTrend.icon className="h-3 w-3 mr-1" />
                  <span>{bounceTrend.value}%</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Engagement Score */}
          <div className={`relative ${metricsPulse === 'score' ? 'bg-purple-50' : 'bg-slate-50'} rounded-lg p-4 border border-gray-200 transition-colors duration-300`}>
            <div className="flex flex-col items-center justify-center p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Real-Time Engagement Score</h3>
              
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Circular progress background */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  {/* Animated progress circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={
                      engagementScore >= 80 ? "#10b981" : 
                      engagementScore >= 60 ? "#f59e0b" : 
                      "#ef4444"
                    }
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * engagementScore) / 100}
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * engagementScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                
                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={engagementScore}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center"
                    >
                      <span className={`text-3xl font-bold ${getScoreColor(engagementScore)}`}>
                        {engagementScore}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">out of 100</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              
              <div className={`mt-4 flex items-center ${scoreTrend.color} text-sm`}>
                <scoreTrend.icon className="h-4 w-4 mr-1" />
                <span>{scoreTrend.value}% from previous</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 text-center mt-2">
              Last updated: {currentData.lastUpdated}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeMetricsWidget;