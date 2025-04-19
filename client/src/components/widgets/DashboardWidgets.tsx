import React, { useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Widget, useWidgets } from '@/hooks/useWidgets';
import DraggableWidget, { WIDGET_TYPE } from './DraggableWidget';
import ActiveCampaignsWidget from './ActiveCampaignsWidget';
import TotalEmailsWidget from './TotalEmailsWidget';
import OpenRateWidget from './OpenRateWidget';
import EmailPerformanceWidget from './EmailPerformanceWidget';
import DeviceBreakdownWidget from './DeviceBreakdownWidget';
import RecentCampaignsWidget from './RecentCampaignsWidget';
import OptimalSendTimeWidget from './OptimalSendTimeWidget';
import UpcomingCampaignsWidget from './UpcomingCampaignsWidget';

interface DashboardWidgetsProps {
  clientData: any; // The dashboard data
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ clientData }) => {
  // Create default stats if clientData is null
  const clientDataWithDefaults = {
    stats: clientData?.stats || {
      activeCampaigns: 0,
      totalEmails: 0,
      openRate: 0,
      clickRate: 0,
      contactsCount: 0
    },
    performanceData: clientData?.performanceData || []
  };
  
  const { widgets, removeWidget, updateWidgetConfig, moveWidget } = useWidgets();

  // Filter visible widgets and sort by row/col for display
  // Also filter out any AI-related widgets
  const visibleWidgets = widgets
    .filter(widget => widget.visible)
    .filter(widget => !widget.type.toLowerCase().includes('ai') && 
           !widget.type.includes('smart') &&
           !widget.type.includes('recommendation') &&
           !widget.type.includes('userJourney') &&
           !widget.type.includes('campaignPerformanceAnalyzer'))
    .sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });
    
  // Simple widget handlers
  const handleRemoveWidget = useCallback((widgetId: string) => {
    removeWidget(widgetId);
  }, [removeWidget]);
  
  const handleUpdateWidgetConfig = useCallback((widgetId: string, config: any) => {
    updateWidgetConfig(widgetId, config);
  }, [updateWidgetConfig]);

  // Type definitions for mock data
  type Campaign = {
    id: number;
    name: string;
    scheduledDate: string;
    status: string;
  };

  type Task = {
    id: number;
    title: string;
    dueDate: string;
    status: 'completed' | 'pending' | 'overdue';
    campaignId?: number;
  };

  // Mock data for upcoming campaigns widget
  const upcomingCampaignsData = {
    campaigns: [
      { id: 101, name: "Holiday Newsletter", scheduledDate: "2025-12-20T10:00:00", status: "Scheduled" },
      { id: 102, name: "New Year Promotion", scheduledDate: "2025-12-28T09:00:00", status: "Scheduled" },
      { id: 103, name: "February Flash Sale", scheduledDate: "2026-02-01T10:30:00", status: "Scheduled" }
    ] as Campaign[],
    tasks: [
      { id: 1, title: "Prepare holiday graphics", dueDate: "2025-12-10T17:00:00", status: "completed" as const },
      { id: 2, title: "Draft newsletter content", dueDate: "2025-12-15T17:00:00", status: "pending" as const, campaignId: 101 },
      { id: 3, title: "Review February campaign plan", dueDate: "2026-01-15T17:00:00", status: "pending" as const, campaignId: 103 },
      { id: 4, title: "Segment audience for New Year promo", dueDate: "2025-12-20T17:00:00", status: "pending" as const, campaignId: 102 },
      { id: 5, title: "A/B test subject lines", dueDate: "2025-12-18T17:00:00", status: "pending" as const, campaignId: 101 }
    ] as Task[]
  };

  // Render the appropriate widget based on its type
  const renderWidget = (widget: Widget) => {
    // Skip AI-related widgets for additional safety
    if (widget.type.toLowerCase().includes('ai') || 
        widget.type.includes('smart') ||
        widget.type.includes('recommendation') ||
        widget.type.includes('userJourney') ||
        widget.type.includes('campaignPerformanceAnalyzer')) {
      return null;
    }

    switch (widget.type) {
      case 'activeCampaigns':
        return (
          <ActiveCampaignsWidget 
            key={widget.id}
            widget={widget}
            data={{
              activeCampaigns: clientDataWithDefaults.stats.activeCampaigns,
              weeklyActive: 2 // Placeholder, would come from API
            }}
            onRemove={handleRemoveWidget}
          />
        );
      
      case 'totalEmails':
        return (
          <TotalEmailsWidget 
            key={widget.id}
            widget={widget}
            data={{
              totalEmails: clientDataWithDefaults.stats.totalEmails,
              monthlyEmails: 1250 // Placeholder, would come from API
            }}
            onRemove={handleRemoveWidget}
          />
        );
      
      case 'openRate':
        return (
          <OpenRateWidget 
            key={widget.id}
            widget={widget}
            data={{
              openRate: clientDataWithDefaults.stats.openRate,
              comparison: 3.2 // Placeholder, would come from API
            }}
            onRemove={handleRemoveWidget}
          />
        );
      
      case 'clickRate':
        return (
          <OpenRateWidget 
            key={widget.id}
            widget={{...widget, title: 'Click Rate'}}
            data={{
              openRate: clientDataWithDefaults.stats.clickRate,
              comparison: 1.8 // Placeholder, would come from API
            }}
            onRemove={handleRemoveWidget}
          />
        );
      
      case 'emailPerformance':
        return (
          <EmailPerformanceWidget 
            key={widget.id}
            widget={widget}
            data={{
              performanceData: clientDataWithDefaults.performanceData
            }}
            onRemove={handleRemoveWidget}
          />
        );
      
      case 'deviceBreakdown':
        return (
          <DeviceBreakdownWidget 
            key={widget.id}
            widget={widget}
            data={{
              deviceData: clientData?.deviceData || []
            }}
            onRemove={handleRemoveWidget}
          />
        );
      
      case 'recentCampaigns':
        return (
          <RecentCampaignsWidget 
            key={widget.id}
            widget={widget}
            data={{
              recentCampaigns: clientData?.recentCampaigns || []
            }}
            onRemove={handleRemoveWidget}
          />
        );
        
      case 'optimalSendTime':
        return (
          <OptimalSendTimeWidget 
            key={widget.id}
            widget={widget}
            onConfig={(config) => handleUpdateWidgetConfig(widget.id, config)}
            onRemove={handleRemoveWidget}
          />
        );
        
      case 'upcomingCampaigns':
        return (
          <UpcomingCampaignsWidget 
            key={widget.id}
            widget={widget}
            data={upcomingCampaignsData}
            onRemove={handleRemoveWidget}
          />
        );
        
      default:
        return null;
    }
  };

  // The moveWidget implementation is delegated to useWidgets context
  const handleMoveWidget = useCallback((id: string, col: number, row: number) => {
    moveWidget(id, col, row);
  }, [moveWidget]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {visibleWidgets.map((widget, index) => {
          // Calculate column span based on widget size
          let colSpan;
          switch (widget.size) {
            case 'small':
              colSpan = 'lg:col-span-4'; // 1/3 of the grid
              break;
            case 'medium':
              colSpan = 'lg:col-span-6'; // 1/2 of the grid
              break;
            case 'large':
              colSpan = 'lg:col-span-12'; // Full width
              break;
            default:
              colSpan = 'lg:col-span-4';
          }
          
          return (
            <div key={widget.id} className={`${colSpan}`}>
              <DraggableWidget 
                key={widget.id} 
                widget={widget} 
                index={index}
                moveWidget={handleMoveWidget}
              >
                {renderWidget(widget)}
              </DraggableWidget>
            </div>
          );
        })}
        
        {visibleWidgets.length === 0 && (
          <div className="lg:col-span-12 p-10 text-center bg-white rounded-lg shadow-sm border border-purple-100">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-lg font-medium text-purple-900 mb-2">No widgets available</p>
              <p className="text-purple-600 mb-6">Add widgets to customize your dashboard experience</p>
              <button 
                onClick={() => document.querySelector('button')?.click()}
                className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition-colors"
              >
                Add Your First Widget
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default DashboardWidgets;