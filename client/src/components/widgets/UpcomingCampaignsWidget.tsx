import React from 'react';
import BaseWidget from './BaseWidget';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface Task {
  id: number;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  campaignId?: number;
}

interface Campaign {
  id: number;
  name: string;
  scheduledDate: string;
  status: string;
}

interface UpcomingCampaignsWidgetProps {
  widget: Widget;
  data: {
    campaigns: Campaign[];
    tasks: Task[];
  };
  onRemove: (id: string) => void;
}

const UpcomingCampaignsWidget: React.FC<UpcomingCampaignsWidgetProps> = ({ 
  widget, 
  data, 
  onRemove 
}) => {
  const [, setLocation] = useLocation();
  const currentDate = new Date();
  
  // Filter for only upcoming campaigns
  const upcomingCampaigns = data.campaigns.filter(campaign => 
    new Date(campaign.scheduledDate) > currentDate && 
    campaign.status.toLowerCase() === 'scheduled'
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  
  // Get tasks sorted by due date
  const sortedTasks = [...data.tasks].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Calculate the difference in days
    const diffTime = date.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let relativeDate = '';
    if (diffDays === 0) {
      relativeDate = 'Today';
    } else if (diffDays === 1) {
      relativeDate = 'Tomorrow';
    } else if (diffDays > 1 && diffDays <= 7) {
      relativeDate = `In ${diffDays} days`;
    } else {
      relativeDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return {
      formatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      relative: relativeDate,
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      isToday: diffDays === 0,
      isTomorrow: diffDays === 1,
      isSoon: diffDays > 1 && diffDays <= 3
    };
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <BaseWidget 
      widget={widget} 
      onRemove={onRemove} 
      icon={<Calendar className="h-4 w-4 text-white" />}
      contentClassName="p-0"
    >
      <div className="p-4 pb-0">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-purple-800">Upcoming Campaigns & Tasks</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1 h-auto"
            onClick={() => setLocation('/client-campaigns')}
          >
            View All
          </Button>
        </div>
      </div>
      
      <div className="px-4">
        <div className="border-b border-purple-100 pb-3">
          <h4 className="text-xs font-medium text-purple-700 mb-2">UPCOMING CAMPAIGNS</h4>
          
          {upcomingCampaigns.length === 0 ? (
            <div className="text-sm text-slate-500 italic">No scheduled campaigns</div>
          ) : (
            <div className="space-y-2">
              {upcomingCampaigns.slice(0, 3).map(campaign => {
                const date = formatDate(campaign.scheduledDate);
                
                return (
                  <div key={campaign.id} className="flex items-center justify-between bg-purple-50 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-sm font-medium text-slate-700">{campaign.name}</div>
                        <div className="text-xs text-slate-500">
                          {date.formatted} at {date.time}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      date.isToday 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {date.relative}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="py-3">
          <h4 className="text-xs font-medium text-purple-700 mb-2">PENDING TASKS</h4>
          
          {sortedTasks.length === 0 ? (
            <div className="text-sm text-slate-500 italic">No pending tasks</div>
          ) : (
            <div className="space-y-2">
              {sortedTasks.slice(0, 4).map(task => {
                const date = formatDate(task.dueDate);
                
                return (
                  <div key={task.id} className="flex items-center gap-2">
                    {getTaskStatusIcon(task.status)}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-700">{task.title}</div>
                      <div className="text-xs text-slate-500">Due: {date.relative}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1"
                    >
                      Complete
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BaseWidget>
  );
};

export default UpcomingCampaignsWidget;