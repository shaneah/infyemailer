import React from 'react';
import BaseWidget from './BaseWidget';
import { Mail, ChevronRight, Calendar } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface CampaignData {
  id: number;
  name: string;
  date: string;
  status: string;
  opens: number;
  clicks: number;
}

interface RecentCampaignsWidgetProps {
  widget: Widget;
  data: {
    recentCampaigns: CampaignData[];
  };
  onRemove: (id: string) => void;
}

const RecentCampaignsWidget: React.FC<RecentCampaignsWidgetProps> = ({ widget, data, onRemove }) => {
  const [, setLocation] = useLocation();
  
  // Status colors for badges
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<Mail className="h-4 w-4 text-white" />}
      contentClassName="p-0 pt-0"
    >
      <div className="p-4 pb-0 flex justify-between items-center">
        <span className="text-sm text-slate-500 font-medium">Your most recent email campaigns</span>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-purple-600 hover:bg-purple-50 border border-purple-200 rounded-full px-4 flex items-center gap-2 transition-all duration-300 hover:shadow-md hover:border-purple-300 group"
          onClick={() => setLocation('/client-campaigns')}
        >
          <div className="relative">
            <Mail className="h-3.5 w-3.5 group-hover:opacity-0 transition-opacity" />
            <ChevronRight className="h-3.5 w-3.5 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span>All Campaigns</span>
        </Button>
      </div>

      <div className="mt-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Campaign</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Opens</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {data.recentCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No recent campaigns found.</td>
                </tr>
              ) : (
                data.recentCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                        {campaign.date}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {campaign.opens.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {campaign.clicks.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </BaseWidget>
  );
};

export default RecentCampaignsWidget;