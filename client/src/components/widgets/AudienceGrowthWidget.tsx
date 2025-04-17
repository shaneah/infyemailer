import React from 'react';
import BaseWidget from './BaseWidget';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface AudienceGrowthWidgetProps {
  widget: Widget;
  data: {
    subscriberGrowth: Array<{
      date: string;
      subscribers: number;
      unsubscribes: number;
    }>;
    totalContacts: number;
    growthRate: number;
  };
  onRemove: (id: string) => void;
}

const AudienceGrowthWidget: React.FC<AudienceGrowthWidgetProps> = ({ widget, data, onRemove }) => {
  // Calculate the net growth from the data
  const calculateNetGrowth = () => {
    if (!data.subscriberGrowth || data.subscriberGrowth.length < 2) {
      return 0;
    }
    
    const firstDay = data.subscriberGrowth[0].subscribers - data.subscriberGrowth[0].unsubscribes;
    const lastDay = data.subscriberGrowth[data.subscriberGrowth.length - 1].subscribers - 
                   data.subscriberGrowth[data.subscriberGrowth.length - 1].unsubscribes;
    
    return lastDay - firstDay;
  };

  const netGrowth = calculateNetGrowth();
  const isPositiveGrowth = netGrowth >= 0;

  // Calculate retention rate
  const retentionRate = Math.round(100 - ((data.subscriberGrowth.reduce((acc, day) => acc + day.unsubscribes, 0) / data.totalContacts) * 100));

  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<Users className="h-4 w-4 text-white" />}
      contentClassName="p-0 pt-4"
    >
      <div className="px-4 mb-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-purple-800">Audience Growth</h3>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50">
            <span className="text-xs text-purple-800 font-medium">
              {data.totalContacts.toLocaleString()} subscribers
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Growth Rate</div>
            <div className="flex items-center gap-1">
              <div className="text-xl font-bold text-slate-800">{data.growthRate}%</div>
              {isPositiveGrowth ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">New Subscribers</div>
            <div className="text-xl font-bold text-slate-800">
              {data.subscriberGrowth.reduce((acc, day) => acc + day.subscribers, 0)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Retention Rate</div>
            <div className="text-xl font-bold text-slate-800">
              {retentionRate}%
            </div>
          </div>
        </div>
      </div>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.subscriberGrowth}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.4)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(100, 116, 139, 0.8)"
              tick={{ fill: 'rgba(71, 85, 105, 0.9)', fontSize: 10 }}
            />
            <YAxis
              stroke="rgba(100, 116, 139, 0.8)"
              tick={{ fill: 'rgba(71, 85, 105, 0.9)', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(203, 213, 225, 0.5)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                color: '#334155',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="subscribers" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#8b5cf6' }}
              name="New subscribers"
            />
            <Line 
              type="monotone" 
              dataKey="unsubscribes" 
              stroke="#ef4444" 
              strokeWidth={2} 
              strokeDasharray="3 3"
              dot={{ r: 3, fill: '#ef4444' }}
              name="Unsubscribes"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </BaseWidget>
  );
};

export default AudienceGrowthWidget;