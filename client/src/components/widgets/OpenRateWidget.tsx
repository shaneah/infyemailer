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
      <div className="pt-4">
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 inline-block text-transparent bg-clip-text">
          {data.openRate}%
        </div>
        <p className="text-sm text-slate-600 mt-1 font-medium">Average across all campaigns</p>
        
        <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
          <TrendingUp className="h-3 w-3 text-purple-600" />
          <span>{data.comparison || 0}% higher than industry average</span>
        </div>
      </div>
    </BaseWidget>
  );
};

export default OpenRateWidget;