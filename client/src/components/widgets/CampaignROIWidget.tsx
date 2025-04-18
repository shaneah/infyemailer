import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Widget } from '@/hooks/useWidgets';
import { TrendingUp, DollarSign, X, Share2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

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

const CampaignROIWidget: React.FC<CampaignROIWidgetProps> = ({ widget, data, onRemove }) => {
  // Calculate the ROI color based on comparison with target
  const getROIColor = (roi: number) => {
    if (roi >= data.targetROI) return 'text-green-600';
    if (roi >= data.targetROI * 0.75) return 'text-amber-500';
    return 'text-red-500';
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const campaign = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-medium text-gray-800">{campaign.name}</p>
          <p className="text-sm text-gray-600">Cost: ${campaign.cost.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Revenue: ${campaign.revenue.toLocaleString()}</p>
          <p className={`text-sm font-medium ${getROIColor(campaign.roi)}`}>
            ROI: {campaign.roi.toFixed(2)}x
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden shadow-md border border-indigo-100 hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-indigo-900">{widget.title}</CardTitle>
              <CardDescription className="text-indigo-700">
                Campaign performance analysis
              </CardDescription>
            </div>
          </div>
          <button onClick={() => onRemove(widget.id)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100 shadow-sm">
            <p className="text-green-700 text-sm font-medium mb-1">Average ROI</p>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-xl font-bold text-green-800">{data.averageROI.toFixed(2)}x</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100 shadow-sm">
            <p className="text-amber-700 text-sm font-medium mb-1">Target ROI</p>
            <div className="flex items-center">
              <Share2 className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-xl font-bold text-amber-800">{data.targetROI.toFixed(2)}x</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">ROI by Campaign</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.campaigns}
                margin={{ top: 5, right: 5, left: 5, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}x`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={data.targetROI} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }} />
                <Bar 
                  dataKey="roi" 
                  name="ROI"
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.8}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-5 text-xs text-gray-500 italic">
          Data shown reflects ROI for campaigns within the last 90 days
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignROIWidget;