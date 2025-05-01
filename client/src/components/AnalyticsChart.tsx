import { useState } from "react";
import { Chart } from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { chartData } from "@/lib/chartData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart3, LineChart, Activity, ArrowRight, Download, Share2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TimeRangeType = "Week" | "Month" | "Quarter" | "Year";
const timeRanges: TimeRangeType[] = ["Week", "Month", "Quarter", "Year"];

type ChartType = "Line" | "Bar" | "Area";
const chartTypes: ChartType[] = ["Line", "Bar", "Area"];

const AnalyticsChart = () => {
  const [timeRange, setTimeRange] = useState<TimeRangeType>("Month");
  const [chartType, setChartType] = useState<ChartType>("Area");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/analytics', timeRange],
    initialData: chartData[timeRange.toLowerCase() as keyof typeof chartData],
  });

  // Format the data for the tooltips
  const getHighestValues = () => {
    if (!data || !data.length) return { openRate: 0, clickRate: 0, date: '' };
    
    let maxOpenIdx = 0;
    let maxClickIdx = 0;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i].Opens > data[maxOpenIdx].Opens) maxOpenIdx = i;
      if (data[i].Clicks > data[maxClickIdx].Clicks) maxClickIdx = i;
    }
    
    return {
      openRate: {
        value: data[maxOpenIdx].Opens,
        date: data[maxOpenIdx].date,
      },
      clickRate: {
        value: data[maxClickIdx].Clicks,
        date: data[maxClickIdx].date, 
      }
    };
  };
  
  const highestValues = getHighestValues();

  return (
    <Card className="shadow-xl border-none bg-gradient-to-br from-white to-gray-50 transition-shadow duration-300 h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b border-gray-100">
        <div>
          <CardTitle className="text-lg font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
            Performance Analytics
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>This chart shows email campaign performance data over time. Hover over data points for detailed metrics.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription className="text-gray-500 text-xs mt-1">
            Tracking opens, clicks and conversion rates over time
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex space-x-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <Download className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-gray-700">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs 
            value={timeRange} 
            onValueChange={(value: string) => setTimeRange(value as TimeRangeType)}
            className="w-auto"
          >
            <TabsList className="bg-gray-100/80 p-0.5">
              {timeRanges.map((range) => (
                <TabsTrigger
                  key={range}
                  value={range}
                  className={`text-xs px-3 py-1.5 ${timeRange === range ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {range}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex space-x-2 pt-4 px-6">
          <div 
            className={`flex items-center cursor-pointer rounded-full px-3 py-1 text-xs ${chartType === 'Line' ? 'bg-indigo-100 text-indigo-600' : 'bg-transparent text-gray-500'}`}
            onClick={() => setChartType('Line')}
          >
            <LineChart className="h-3 w-3 mr-1.5" />
            <span>Line</span>
          </div>
          <div 
            className={`flex items-center cursor-pointer rounded-full px-3 py-1 text-xs ${chartType === 'Bar' ? 'bg-indigo-100 text-indigo-600' : 'bg-transparent text-gray-500'}`}
            onClick={() => setChartType('Bar')}
          >
            <BarChart3 className="h-3 w-3 mr-1.5" />
            <span>Bar</span>
          </div>
          <div 
            className={`flex items-center cursor-pointer rounded-full px-3 py-1 text-xs ${chartType === 'Area' ? 'bg-indigo-100 text-indigo-600' : 'bg-transparent text-gray-500'}`}
            onClick={() => setChartType('Area')}
          >
            <Activity className="h-3 w-3 mr-1.5" />
            <span>Area</span>
          </div>
        </div>
        
        <div className="px-6 pt-2 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
              <span className="text-xs text-gray-500">Opens</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center cursor-help">
                      <ArrowRight className="h-3 w-3 text-indigo-500" />
                      <span className="text-xs font-medium text-indigo-600">{highestValues.openRate.value}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Peak open rate on {highestValues.openRate.date}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-violet-500"></div>
              <span className="text-xs text-gray-500">Clicks</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center cursor-help">
                      <ArrowRight className="h-3 w-3 text-violet-500" />
                      <span className="text-xs font-medium text-violet-600">{highestValues.clickRate.value}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Peak click rate on {highestValues.clickRate.date}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-gray-500">Conversions</span>
            </div>
          </div>
        </div>
        
        <div className="relative" style={{ height: '320px' }}>
          {isLoading ? (
            <div className="bg-gray-50 rounded w-full h-full flex justify-center items-center">
              <div className="text-center p-4">
                <Loader2 className="h-8 w-8 text-indigo-600 mb-2 mx-auto animate-spin" />
                <p className="text-gray-500 text-sm">Loading chart data...</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <Chart 
                data={data} 
                height={320}
                colors={["#6366f1", "#8b5cf6", "rgba(16, 185, 129, 0.3)"]}
                series={[
                  { name: "Opens", type: chartType.toLowerCase() },
                  { name: "Clicks", type: chartType.toLowerCase() },
                  { name: "Conversions", type: "area" }
                ]}
                options={{
                  chart: {
                    toolbar: {
                      show: true,
                      tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                      },
                    },
                    animations: {
                      enabled: true,
                      easing: 'easeinout',
                      speed: 800,
                    },
                    background: 'transparent',
                  },
                  stroke: {
                    curve: 'smooth',
                    width: [3, 3, 2],
                  },
                  tooltip: {
                    theme: 'light',
                    shared: true,
                    intersect: false,
                    y: {
                      formatter: function (value) {
                        return value.toFixed(1) + '%';
                      }
                    }
                  },
                  fill: {
                    type: ['solid', 'solid', 'gradient'],
                    gradient: {
                      shade: 'light',
                      type: "vertical",
                      opacityFrom: 0.7,
                      opacityTo: 0.2,
                      stops: [0, 100]
                    }
                  },
                  grid: {
                    borderColor: '#f1f1f1',
                    row: {
                      colors: ['transparent', 'transparent'],
                      opacity: 0.5
                    },
                  },
                  markers: {
                    size: 4,
                    hover: {
                      size: 6
                    }
                  },
                  xaxis: {
                    labels: {
                      style: {
                        colors: '#64748b',
                        fontSize: '11px',
                      },
                    },
                  },
                  yaxis: {
                    labels: {
                      style: {
                        colors: '#64748b',
                        fontSize: '11px',
                      },
                      formatter: function (value) {
                        return value.toFixed(0) + '%';
                      }
                    },
                  },
                }}
              />
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;
