import React from 'react';
import BaseWidget from './BaseWidget';
import { Mail, TrendingUp } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';

interface TotalEmailsWidgetProps {
  widget: Widget;
  data: {
    totalEmails: number;
    monthlyEmails?: number;
  };
  onRemove: (id: string) => void;
}

const TotalEmailsWidget: React.FC<TotalEmailsWidgetProps> = ({ widget, data, onRemove }) => {
  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<Mail className="h-4 w-4 text-white" />}
    >
      <div className="pt-4">
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 inline-block text-transparent bg-clip-text">
          {data.totalEmails.toLocaleString()}
        </div>
        <p className="text-sm text-slate-600 mt-1 font-medium">Sent across all campaigns</p>
        
        <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
          <TrendingUp className="h-3 w-3 text-purple-600" />
          <span>{data.monthlyEmails?.toLocaleString() || 0} emails sent this month</span>
        </div>
      </div>
    </BaseWidget>
  );
};

export default TotalEmailsWidget;