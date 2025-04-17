import React from 'react';
import BaseWidget from './BaseWidget';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DeviceBreakdownWidgetProps {
  widget: Widget;
  data: {
    deviceData: Array<{
      name: string;
      value: number;
    }>;
  };
  onRemove: (id: string) => void;
}

const DeviceBreakdownWidget: React.FC<DeviceBreakdownWidgetProps> = ({ widget, data, onRemove }) => {
  const COLORS = ['#7c3aed', '#c084fc', '#d8b4fe'];

  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<PieChartIcon className="h-4 w-4 text-white" />}
      contentClassName="h-[320px] pt-4"
    >
      <div className="absolute top-0 left-0 px-4 py-2">
        <span className="text-sm text-slate-500 font-medium">Email opens by device type</span>
      </div>

      <div className="h-full pt-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.deviceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.deviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${value}%`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(203, 213, 225, 0.5)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                color: '#334155'
              }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{paddingTop: '20px'}}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </BaseWidget>
  );
};

export default DeviceBreakdownWidget;