import React from 'react';
import BaseWidget from './BaseWidget';
import { MailCheck, TrendingUp } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';

interface OpenRateWidgetProps {
  widget: Widget;
  data: {
    openRate: number;
    comparison?: number;
  };
  onRemove: (id: string) => void;
}

const OpenRateWidget: React.FC<OpenRateWidgetProps> = ({ widget, data, onRemove }) => {
  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<MailCheck className="h-4 w-4 text-white" />}
    >
      <div className="pt-2">
        <div className="text-4xl font-bold text-purple-700">
          {data.openRate}%
        </div>
        <p className="text-sm text-gray-600 mt-1">Average across all campaigns</p>
        
        <div className="mt-4 flex items-center gap-1 text-xs text-green-600">
          <TrendingUp className="h-3 w-3" />
          <span>{data.comparison || 3.2}% higher than industry average</span>
        </div>
      </div>
    </BaseWidget>
  );
};

export default OpenRateWidget;