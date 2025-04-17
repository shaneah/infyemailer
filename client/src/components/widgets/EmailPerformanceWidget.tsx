import React from 'react';
import BaseWidget from './BaseWidget';
import { BarChart3, ChevronRight, Activity } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface EmailPerformanceWidgetProps {
  widget: Widget;
  data: {
    performanceData: Array<{
      name: string;
      opens: number;
      clicks: number;
    }>;
  };
  onRemove: (id: string) => void;
}

const EmailPerformanceWidget: React.FC<EmailPerformanceWidgetProps> = ({ widget, data, onRemove }) => {
  const [, setLocation] = useLocation();

  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<BarChart3 className="h-4 w-4 text-white" />}
      contentClassName="h-[320px] pt-4"
    >
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2">
        <span className="text-sm text-slate-500 font-medium">Email opens and clicks over time</span>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-purple-600 hover:bg-purple-50 border border-purple-200 rounded-full px-4 flex items-center gap-2 transition-all duration-300 hover:shadow-md hover:border-purple-300 group"
          onClick={() => setLocation('/client-email-performance')}
        >
          <div className="relative">
            <Activity className="h-3.5 w-3.5 group-hover:opacity-0 transition-opacity" />
            <ChevronRight className="h-3.5 w-3.5 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span>Details</span>
        </Button>
      </div>

      <div className="h-full pt-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.performanceData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(203, 213, 225, 0.4)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(100, 116, 139, 0.8)"
              tick={{ fill: 'rgba(71, 85, 105, 0.9)' }}
            />
            <YAxis 
              stroke="rgba(100, 116, 139, 0.8)"
              tick={{ fill: 'rgba(71, 85, 105, 0.9)' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(203, 213, 225, 0.5)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                color: '#334155'
              }}
              labelStyle={{color: '#7c3aed', fontWeight: 'bold'}}
              itemStyle={{color: '#334155'}}
            />
            <Legend 
              wrapperStyle={{color: '#475569', fontSize: '12px'}}
              formatter={(value) => <span style={{color: '#475569'}}>{value}</span>}
            />
            <Bar dataKey="opens" name="Opens" fill="rgba(124, 58, 237, 0.7)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="clicks" name="Clicks" fill="rgba(245, 158, 11, 0.7)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </BaseWidget>
  );
};

export default EmailPerformanceWidget;