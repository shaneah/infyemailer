import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Widget } from '@/hooks/useWidgets';
import { X, Clock, Flame, Info, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const EngagementHeatmapWidget: React.FC<EngagementHeatmapWidgetProps> = ({ widget, data, onRemove }) => {
  const [metricType, setMetricType] = useState<'opens' | 'clicks' | 'conversions'>('opens');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get the color for a specific engagement value (0-100)
  const getHeatColor = (value: number) => {
    const selectedMetric = data.metrics.find(m => m.type === metricType) || data.metrics[0];
    const baseColor = selectedMetric.color;
    
    if (value <= 5) return `${baseColor}-50`;
    if (value <= 15) return `${baseColor}-100`;
    if (value <= 30) return `${baseColor}-200`;
    if (value <= 45) return `${baseColor}-300`;
    if (value <= 60) return `${baseColor}-400`;
    if (value <= 75) return `${baseColor}-500`;
    if (value <= 85) return `${baseColor}-600`;
    if (value <= 95) return `${baseColor}-700`;
    return `${baseColor}-800`;
  };

  // Format time to AM/PM
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  return (
    <Card className="overflow-hidden shadow-md border border-indigo-100 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Flame className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-indigo-900">{widget.title}</CardTitle>
              <CardDescription className="text-indigo-700">
                Optimize your send times
              </CardDescription>
            </div>
          </div>
          <button onClick={() => onRemove(widget.id)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-medium text-gray-800">Engagement Patterns</h3>
          </div>
          
          <div className="flex items-center">
            <div className="mr-2">
              <Select 
                value={metricType} 
                onValueChange={(value) => setMetricType(value as any)}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs border-indigo-200">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {data.metrics.map(metric => (
                    <SelectItem key={metric.type} value={metric.type}>
                      {metric.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[250px]">
                    This heatmap shows when your audience is most likely to engage with emails.
                    Darker colors indicate higher engagement rates.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[70px_repeat(24,minmax(18px,1fr))] gap-[1px] mb-1">
              <div className="text-xs font-medium text-gray-500 flex items-center justify-end pr-2">
                Day / Hour
              </div>
              {hours.map(hour => (
                <div 
                  key={`header-${hour}`} 
                  className="text-[10px] text-gray-500 flex justify-center"
                >
                  {hour % 3 === 0 ? hour : ''}
                </div>
              ))}
            </div>
            
            {days.map((day, dayIndex) => (
              <div 
                key={`row-${day}`} 
                className="grid grid-cols-[70px_repeat(24,minmax(18px,1fr))] gap-[1px] mb-[1px]"
              >
                <div className="text-xs font-medium text-gray-700 flex items-center justify-end pr-2">
                  {day.substring(0, 3)}
                </div>
                {hours.map(hour => {
                  const value = data.hourlyEngagement[day.toLowerCase()][hour];
                  const colorClass = getHeatColor(value);
                  const isPeak = day.toLowerCase() === data.peakDay.toLowerCase() && hour === data.peakHour;
                  
                  return (
                    <TooltipProvider key={`cell-${day}-${hour}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-full h-6 bg-${colorClass} relative rounded-sm ${isPeak ? 'ring-2 ring-yellow-400' : ''}`}
                          >
                            {isPeak && (
                              <span className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-2 h-2"></span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs p-2">
                          <div>
                            <p className="font-medium">{day}, {formatHour(hour)}</p>
                            <p className="text-gray-500">Engagement: {value}%</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between mt-4 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="mr-1 w-3 h-3 bg-indigo-100 rounded-sm"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1 w-3 h-3 bg-indigo-300 rounded-sm"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1 w-3 h-3 bg-indigo-500 rounded-sm"></div>
            <span>High</span>
          </div>
          <div className="flex items-center">
            <div className="mr-1 w-3 h-3 bg-indigo-700 rounded-sm"></div>
            <span>Very High</span>
          </div>
        </div>
        
        <div className="mt-3 bg-amber-50 p-2 rounded-md border border-amber-100 text-xs text-amber-800">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
            </div>
            <div>
              Peak engagement: <span className="font-medium">{data.peakDay}, {formatHour(data.peakHour)}</span>
              <br />
              Schedule important emails at this time for maximum impact.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementHeatmapWidget;