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
  const COLORS = ['#7c3aed', '#c084fc', '#e9d5ff'];

  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<PieChartIcon className="h-4 w-4 text-white" />}
      contentClassName="pt-2"
    >
      <div className="mb-2">
        <span className="text-sm text-gray-600">Email opens by device type</span>
      </div>

      <div className="h-[220px]">
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
              label={false}
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
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center mt-2 space-x-6">
        {data.deviceData.map((device, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-sm mr-2" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <span className="text-xs">{device.name}</span>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
};

export default DeviceBreakdownWidget;