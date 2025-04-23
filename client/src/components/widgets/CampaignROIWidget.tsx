import React from 'react';
import { Widget } from '@/hooks/useWidgets';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { TrendingUp, ChevronUp, ChevronDown, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface CampaignROIWidgetProps {
  widget: Widget;
  data: {
    campaigns: Array<{
      name: string;
      cost: number;
      revenue: number;
      roi: number;
    }>;
    targetROI: number;
    averageROI: number;
  };
  onRemove: (id: string) => void;
}

const CampaignROIWidget: React.FC<CampaignROIWidgetProps> = ({ 
  widget, 
  data, 
  onRemove 
}) => {
  // Sort campaigns by ROI descending
  const sortedCampaigns = [...data.campaigns].sort((a, b) => b.roi - a.roi);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format ROI
  const formatROI = (value: number) => {
    return `${value.toFixed(1)}x`;
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-semibold">{label}</p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            ROI: {formatROI(payload[0].value)}
          </p>
          <p className="text-sm">
            <span className="text-green-600">Revenue: {formatCurrency(payload[0].payload.revenue)}</span>
          </p>
          <p className="text-sm">
            <span className="text-red-500">Cost: {formatCurrency(payload[0].payload.cost)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn(
      "col-span-3 md:col-span-1 shadow-sm hover:shadow-md transition-shadow",
      widget.size === 'large' && "md:col-span-2"
    )}>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            {widget.title}
          </CardTitle>
          <CardDescription>Campaign Return on Investment</CardDescription>
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
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-purple-600 uppercase font-medium">Average ROI</p>
              <div className="flex items-baseline mt-1">
                <span className="text-2xl font-bold text-purple-700">
                  {formatROI(data.averageROI)}
                </span>
                <span className="ml-2 text-xs flex items-center text-green-600">
                  <ChevronUp className="h-3.5 w-3.5" />
                  0.3x vs last quarter
                </span>
              </div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-xs text-indigo-600 uppercase font-medium">ROI Target</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-indigo-400">
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px]">
                      <p className="text-xs">
                        Target ROI is your established benchmark for campaign performance
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold text-indigo-700 mt-1">
                {formatROI(data.targetROI)}
              </p>
            </div>
          </div>
          
          {/* ROI Chart */}
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Campaign ROI Comparison</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedCampaigns}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickFormatter={(value) => `${value}x`}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={data.targetROI} stroke="#4f46e5" strokeWidth={2} strokeDasharray="3 3" />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="roi"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                    name="ROI Multiplier"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Top Performing Campaigns */}
          <div>
            <p className="text-sm font-medium mb-2">Top Performing Campaigns</p>
            <div className="space-y-2">
              {sortedCampaigns.slice(0, 3).map((campaign, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 border border-gray-100 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-6 w-6 flex items-center justify-center text-xs font-medium rounded-full",
                      index === 0 ? "bg-amber-100 text-amber-700" :
                      index === 1 ? "bg-slate-100 text-slate-700" :
                      "bg-orange-100 text-orange-700"
                    )}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">{campaign.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-purple-600">
                      {formatROI(campaign.roi)}
                    </span>
                    <div className={cn(
                      "text-xs py-0.5 px-1.5 rounded",
                      campaign.roi >= data.targetROI ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {campaign.roi >= data.targetROI ? `+${(campaign.roi - data.targetROI).toFixed(1)}` : (campaign.roi - data.targetROI).toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignROIWidget;