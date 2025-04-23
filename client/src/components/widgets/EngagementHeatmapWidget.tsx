import React, { useState } from 'react';
import { Widget } from '@/hooks/useWidgets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlarmClock, 
  X, 
  Activity, 
  MousePointerClick, 
  Mail, 
  CreditCard,
  InfoIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EngagementHeatmapWidgetProps {
  widget: Widget;
  data: {
    hourlyEngagement: {
      [day: string]: number[];
    };
    totalEmailsSent: number;
    peakDay: string;
    peakHour: number;
    metrics: {
      type: 'opens' | 'clicks' | 'conversions';
      title: string;
      color: string;
    }[];
  };
  onRemove: (id: string) => void;
}

// Days of the week for our heatmap
const daysOfWeek = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

// Format for hours display
const formatHour = (hour: number) => {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
};

// Capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const EngagementHeatmapWidget: React.FC<EngagementHeatmapWidgetProps> = ({ 
  widget, 
  data, 
  onRemove 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'opens' | 'clicks' | 'conversions'>('opens');
  
  // Convert engagement data into a heatmap format
  const getIntensity = (value: number) => {
    // Normalize the intensity for color gradient
    // Assuming maximum value is around 100
    const maxValue = 100;
    return Math.min(Math.max(value / maxValue, 0), 1);
  };
  
  // Get color for cell based on metric and intensity
  const getColor = (intensity: number) => {
    const metric = data.metrics.find(m => m.type === selectedMetric) || data.metrics[0];
    
    if (metric.color === 'indigo') {
      // Indigo gradient
      return `rgba(99, 102, 241, ${intensity})`;
    } else if (metric.color === 'green') {
      // Green gradient
      return `rgba(34, 197, 94, ${intensity})`;
    } else if (metric.color === 'purple') {
      // Purple gradient
      return `rgba(168, 85, 247, ${intensity})`;
    }
    
    // Default to indigo
    return `rgba(99, 102, 241, ${intensity})`;
  };
  
  // Get the peak time
  const getPeakTimeText = () => {
    const day = capitalize(data.peakDay);
    const hour = formatHour(data.peakHour);
    return `${day}s at ${hour}`;
  };
  
  // Get icon for selected metric
  const getMetricIcon = () => {
    switch (selectedMetric) {
      case 'opens':
        return <Mail className="h-4 w-4 text-indigo-500" />;
      case 'clicks':
        return <MousePointerClick className="h-4 w-4 text-green-500" />;
      case 'conversions':
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      default:
        return <Mail className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <Card className={cn(
      "col-span-3 md:col-span-1 shadow-sm hover:shadow-md transition-shadow",
      widget.size === 'large' && "md:col-span-2"
    )}>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlarmClock className="h-5 w-5 text-purple-600" />
            {widget.title}
          </CardTitle>
          <CardDescription>Discover your audience's engagement patterns</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={() => onRemove(widget.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Metric selection and key stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {data.metrics.map(metric => (
                    <SelectItem key={metric.type} value={metric.type}>
                      <span className="flex items-center gap-2">
                        {metric.type === 'opens' && <Mail className="h-4 w-4 text-indigo-500" />}
                        {metric.type === 'clicks' && <MousePointerClick className="h-4 w-4 text-green-500" />}
                        {metric.type === 'conversions' && <CreditCard className="h-4 w-4 text-purple-500" />}
                        {metric.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-slate-400">
                      <InfoIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    <p className="text-xs">
                      This heatmap shows engagement times for your audience. Darker colors indicate higher engagement.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                <Activity className="h-4 w-4" />
                <span>Peak activity: <span className="font-semibold">{getPeakTimeText()}</span></span>
              </div>
            </div>
          </div>
          
          {/* Heatmap calendar view */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px]">
              {/* Time labels (across the top) */}
              <div className="flex">
                <div className="w-20 flex-shrink-0"></div> {/* Spacer for day labels */}
                <div className="flex-1 grid grid-cols-24">
                  {Array.from({ length: 24 }).map((_, hour) => (
                    (hour % 3 === 0 || hour === 0 || hour === 23) && (
                      <div 
                        key={hour} 
                        className={cn(
                          "text-xs text-center text-gray-500",
                          hour === 0 ? "col-start-1" : hour === 23 ? "col-start-24" : `col-start-${hour + 1}`
                        )}
                      >
                        {formatHour(hour)}
                      </div>
                    )
                  ))}
                </div>
              </div>
              
              {/* Heatmap grid */}
              <div className="mt-1">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex h-8 mb-1">
                    {/* Day label */}
                    <div className="w-20 flex-shrink-0 flex items-center">
                      <span className="text-xs font-medium text-gray-700 capitalize">
                        {day.slice(0, 3)}
                      </span>
                    </div>
                    
                    {/* Hour cells */}
                    <div className="flex-1 grid grid-cols-24 gap-[1px]">
                      {data.hourlyEngagement[day].map((value, hour) => {
                        const intensity = getIntensity(value);
                        const isPeak = day === data.peakDay && hour === data.peakHour;
                        
                        return (
                          <div 
                            key={hour}
                            className={cn(
                              "h-8 rounded-sm flex items-center justify-center relative hover:z-10",
                              isPeak && "ring-2 ring-offset-1 ring-indigo-400"
                            )}
                            style={{ 
                              backgroundColor: getColor(intensity),
                              cursor: 'pointer'
                            }}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="absolute inset-0"></TooltipTrigger>
                                <TooltipContent side="top">
                                  <div className="text-xs">
                                    <p className="font-medium capitalize">{day}, {formatHour(hour)}</p>
                                    <p className="flex items-center gap-1.5">
                                      {getMetricIcon()}
                                      <span className="flex whitespace-nowrap">
                                        <span className="mr-1 font-medium">{value}</span> 
                                        {selectedMetric} rate
                                      </span>
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-xs text-gray-500 mr-2">Low</div>
                  <div className="flex h-2">
                    {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((intensity, i) => (
                      <div 
                        key={i}
                        className="w-6 h-2"
                        style={{ backgroundColor: getColor(intensity) }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 ml-2">High</div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Based on {data.totalEmailsSent.toLocaleString()} emails
                </div>
              </div>
            </div>
          </div>
          
          {/* Key findings */}
          <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-purple-600" />
              Engagement Insights
            </h4>
            <ul className="space-y-1">
              <li className="text-xs text-gray-700 flex items-baseline gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0"></span>
                <span>Highest engagement occurs at <span className="font-medium">{getPeakTimeText()}</span> - consider scheduling important emails at this time.</span>
              </li>
              <li className="text-xs text-gray-700 flex items-baseline gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0"></span>
                <span>Weekend activity is significantly lower - avoid sending important campaigns on weekends.</span>
              </li>
              <li className="text-xs text-gray-700 flex items-baseline gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0"></span>
                <span>Early morning (1am-5am) shows minimal engagement regardless of day - these are poor sending times.</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementHeatmapWidget;