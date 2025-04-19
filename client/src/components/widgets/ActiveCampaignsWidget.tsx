import React from 'react';
import BaseWidget from './BaseWidget';
import { Activity, TrendingUp } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';

interface ActiveCampaignsWidgetProps {
  widget: Widget;
  data: {
    activeCampaigns: number;
    weeklyActive?: number;
  };
  onRemove: (id: string) => void;
}

const ActiveCampaignsWidget: React.FC<ActiveCampaignsWidgetProps> = ({ widget, data, onRemove }) => {
  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<Activity className="h-4 w-4 text-white" />}
    >
      <div className="pt-4">
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 inline-block text-transparent bg-clip-text">
          {data.activeCampaigns}
        </div>
        <p className="text-sm text-slate-600 mt-1 font-medium">Currently running email campaigns</p>
        
        <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
          <TrendingUp className="h-3 w-3 text-purple-600" />
          <span>{data.weeklyActive || 0} campaigns active this week</span>
        </div>
      </div>
    </BaseWidget>
  );
};

export default ActiveCampaignsWidget;